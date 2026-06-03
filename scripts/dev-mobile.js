#!/usr/bin/env node

/**
 * Abre a API e o Expo em abas separadas do terminal.
 *
 * Uso:
 *   node scripts/dev-mobile.js web       → navegador (localhost)
 *   node scripts/dev-mobile.js emulator  → emulador Android (10.0.2.2)
 *   node scripts/dev-mobile.js local     → dispositivo físico (IP detectado)
 *   node scripts/dev-mobile.js tunnel    → API via ngrok + Expo via túnel
 */

const { execSync, spawn } = require('child_process');
const http = require('http');
const fs   = require('fs');
const path = require('path');

const MODE        = process.argv[2];
const VALID_MODES = ['web', 'emulator', 'local', 'tunnel'];

if (!VALID_MODES.includes(MODE)) {
  console.error(`\nModo inválido: "${MODE}"`);
  console.error(`Modos disponíveis: ${VALID_MODES.join(' | ')}\n`);
  process.exit(1);
}

const API_PORT   = 3333;
const API_PREFIX = 'api';
const ROOT_DIR   = path.join(__dirname, '..');
const MOBILE_DIR = path.join(ROOT_DIR, 'apps/mobile');

const yellow = '\x1b[33m';
const cyan   = '\x1b[36m';
const reset  = '\x1b[0m';

// ─── Detecta terminal disponível ─────────────────────────────────────────────
function detectTerminal() {
  const candidates = [
    { bin: 'gnome-terminal', type: 'gnome' },
    { bin: 'konsole',        type: 'konsole' },
    { bin: 'xfce4-terminal', type: 'xfce4' },
    { bin: 'xterm',          type: 'xterm' },
  ];
  for (const { bin, type } of candidates) {
    try { execSync(`which ${bin}`, { stdio: 'ignore' }); return type; } catch { /* próximo */ }
  }
  return null;
}

// Abre um comando em uma nova aba/janela do terminal detectado
function openTab(title, command) {
  const terminal = detectTerminal();
  const shell    = `bash -c 'cd "${ROOT_DIR}" && ${command}; echo; echo "[encerrado — pressione Enter]"; read'`;

  switch (terminal) {
    case 'gnome':
      spawn('gnome-terminal', ['--tab', `--title=${title}`, '--', 'bash', '-c',
        `cd "${ROOT_DIR}" && ${command}; echo; echo "[encerrado — pressione Enter]"; read`],
        { detached: true, stdio: 'ignore' }).unref();
      break;

    case 'konsole':
      spawn('konsole', ['--new-tab', '-p', `tabtitle=${title}`, '-e', 'bash', '-c',
        `cd "${ROOT_DIR}" && ${command}; read`],
        { detached: true, stdio: 'ignore' }).unref();
      break;

    case 'xfce4':
      spawn('xfce4-terminal', ['--tab', `--title=${title}`, '-x', 'bash', '-c',
        `cd "${ROOT_DIR}" && ${command}; read`],
        { detached: true, stdio: 'ignore' }).unref();
      break;

    case 'xterm':
      spawn('xterm', ['-title', title, '-e', shell],
        { detached: true, stdio: 'ignore' }).unref();
      break;

    default:
      // Sem terminal gráfico: roda em background no terminal atual
      console.warn(`${yellow}[Taskly] Terminal não detectado — rodando em background.${reset}`);
      spawn('bash', ['-c', command], { cwd: ROOT_DIR, stdio: 'inherit', detached: false });
      break;
  }
}

// ─── Detectar IP local ────────────────────────────────────────────────────────
function getLocalIP() {
  const strategies = [
    () => execSync("ip route get 1 2>/dev/null | awk '{print $7; exit}'").toString().trim(),
    () => execSync("ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null").toString().trim(),
    () => execSync("hostname -I 2>/dev/null | awk '{print $1}'").toString().trim(),
  ];
  for (const fn of strategies) {
    try {
      const ip = fn();
      if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip;
    } catch { /* próximo */ }
  }
  const fallback = process.env.TASKLY_LOCAL_IP || '192.168.1.100';
  console.warn(`\n${yellow}[Taskly] IP não detectado. Usando ${fallback}.${reset}`);
  return fallback;
}

// ─── URL do ngrok (modo tunnel) ───────────────────────────────────────────────
function getNgrokUrl(retries = 20, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const try_ = () => {
      http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try {
            const https = JSON.parse(data).tunnels.find((t) => t.proto === 'https');
            if (https) return resolve(https.public_url);
          } catch { /* continua */ }
          retry();
        });
      }).on('error', retry);
    };
    const retry = () => {
      if (++attempts >= retries) return reject(new Error('ngrok não respondeu.'));
      setTimeout(try_, interval);
    };
    try_();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let apiUrl;
  let ngrokProc = null;

  if (MODE === 'tunnel') {
    console.log(`\n${yellow}[Taskly] Iniciando ngrok para a API...${reset}\n`);
    ngrokProc = spawn('ngrok', ['http', String(API_PORT)], { stdio: 'ignore', detached: false });
    try {
      const publicUrl = await getNgrokUrl();
      apiUrl = `${publicUrl}/${API_PREFIX}`;
      console.log(`${cyan}[Taskly] Túnel da API: ${publicUrl}${reset}\n`);
    } catch (err) {
      console.error(`[Taskly] Erro ngrok: ${err.message}`);
      ngrokProc.kill();
      process.exit(1);
    }
  } else {
    const urls = {
      web:      `http://localhost:${API_PORT}/${API_PREFIX}`,
      emulator: `http://10.0.2.2:${API_PORT}/${API_PREFIX}`,
      local:    `http://${process.env.TASKLY_LOCAL_IP || getLocalIP()}:${API_PORT}/${API_PREFIX}`,
    };
    apiUrl = urls[MODE];
  }

  // Grava .env.local para o Expo usar a URL correta
  fs.writeFileSync(
    path.join(MOBILE_DIR, '.env.local'),
    `EXPO_PUBLIC_API_URL=${apiUrl}\n`,
  );

  const expoFlags = {
    web:      '--web',
    emulator: '--android',
    local:    '',
    tunnel:   '--tunnel',
  };
  const expoCmd = `npx expo start${expoFlags[MODE] ? ' ' + expoFlags[MODE] : ''}`;

  console.log(`\n┌─────────────────────────────────────────────────┐`);
  console.log(`│  Taskly — modo: ${MODE.padEnd(32)}│`);
  console.log(`│  API:  ${apiUrl.padEnd(41)}│`);
  console.log(`└─────────────────────────────────────────────────┘\n`);
  console.log(`${cyan}Abrindo abas do terminal...${reset}\n`);

  // Aba 1 — API
  openTab('Taskly API', 'npm run dev:api');

  // Pequena pausa para a primeira aba abrir antes da segunda
  await new Promise((r) => setTimeout(r, 300));

  // Aba 2 — Expo (com a URL correta no ambiente)
  openTab('Taskly Mobile', `EXPO_PUBLIC_API_URL="${apiUrl}" ${expoCmd}`);

  // Encerra o processo atual (as abas são independentes)
  setTimeout(() => process.exit(0), 500);
}

main().catch((err) => { console.error(err); process.exit(1); });
