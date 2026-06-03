#!/usr/bin/env node

/**
 * Abre a API e o Expo em abas separadas do terminal.
 * Funciona em Linux, macOS e Windows.
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
const os   = require('os');
const path = require('path');

const MODE        = process.argv[2];
const VALID_MODES = ['web', 'emulator', 'local', 'tunnel'];

if (!VALID_MODES.includes(MODE)) {
  console.error(`\nModo inválido: "${MODE}"`);
  console.error(`Modos disponíveis: ${VALID_MODES.join(' | ')}\n`);
  process.exit(1);
}

const PLATFORM   = process.platform; // 'linux' | 'darwin' | 'win32'
const API_PORT   = 3333;
const API_PREFIX = 'api';
const ROOT_DIR   = path.join(__dirname, '..');
const MOBILE_DIR = path.join(ROOT_DIR, 'apps/mobile');

const yellow = '\x1b[33m';
const cyan   = '\x1b[36m';
const reset  = '\x1b[0m';

// ─── IP local (Node nativo, funciona em todos os sistemas) ───────────────────
function getLocalIP() {
  if (process.env.TASKLY_LOCAL_IP) return process.env.TASKLY_LOCAL_IP;

  const interfaces = os.networkInterfaces();
  for (const ifaces of Object.values(interfaces)) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  console.warn(`\n${yellow}[Taskly] IP não detectado. Defina TASKLY_LOCAL_IP=<seu-ip>.${reset}\n`);
  return '192.168.1.100';
}

// ─── Abrir aba no terminal ────────────────────────────────────────────────────
function openTab(title, command) {
  // Comando com pausa no final para a aba não fechar sozinha
  const pauseLinux = `; echo; echo '[encerrado]'; read`;
  const pauseWin   = ` & pause`;

  if (PLATFORM === 'win32') {
    // 1. Windows Terminal (wt) — Windows 10/11 moderno
    try {
      execSync('where wt', { stdio: 'ignore' });
      spawn(
        'wt', ['new-tab', '--title', title, '--', 'cmd', '/k', command],
        { detached: true, stdio: 'ignore', shell: false },
      ).unref();
      return;
    } catch { /* não disponível */ }

    // 2. Fallback: cmd clássico em nova janela
    spawn(
      'cmd', ['/c', `start "${title}" cmd /k "${command}${pauseWin}"`],
      { detached: true, stdio: 'ignore', shell: true },
    ).unref();
    return;
  }

  if (PLATFORM === 'darwin') {
    // macOS — AppleScript abre nova aba no Terminal.app ou iTerm2
    const hasITerm = (() => {
      try { execSync('osascript -e \'id of app "iTerm"\'', { stdio: 'ignore' }); return true; } catch { return false; }
    })();

    const script = hasITerm
      ? `tell application "iTerm"
           tell current window
             create tab with default profile
             tell current session of current tab
               write text "cd '${ROOT_DIR}' && ${command}"
             end tell
           end tell
         end tell`
      : `tell application "Terminal"
           do script "cd '${ROOT_DIR}' && ${command}"
           activate
         end tell`;

    spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref();
    return;
  }

  // Linux — tenta terminais na ordem
  const linuxTerminals = [
    {
      bin: 'gnome-terminal',
      args: () => ['--tab', `--title=${title}`, '--',
        'bash', '-c', `cd "${ROOT_DIR}" && ${command}${pauseLinux}`],
    },
    {
      bin: 'konsole',
      args: () => ['--new-tab', '-p', `tabtitle=${title}`, '-e',
        'bash', '-c', `cd "${ROOT_DIR}" && ${command}${pauseLinux}`],
    },
    {
      bin: 'xfce4-terminal',
      args: () => ['--tab', `--title=${title}`, '-x',
        'bash', '-c', `cd "${ROOT_DIR}" && ${command}${pauseLinux}`],
    },
    {
      bin: 'xterm',
      args: () => ['-title', title, '-e',
        `bash -c 'cd "${ROOT_DIR}" && ${command}${pauseLinux}'`],
    },
  ];

  for (const { bin, args } of linuxTerminals) {
    try {
      execSync(`which ${bin}`, { stdio: 'ignore' });
      spawn(bin, args(), { detached: true, stdio: 'ignore' }).unref();
      return;
    } catch { /* próximo */ }
  }

  // Nenhum terminal gráfico encontrado — avisa e roda em background
  console.warn(`${yellow}[Taskly] Terminal gráfico não encontrado — rodando em background.${reset}`);
  spawn('bash', ['-c', command], { cwd: ROOT_DIR, stdio: 'inherit' });
}

// ─── ngrok (modo tunnel) ──────────────────────────────────────────────────────
function getNgrokUrl(retries = 20, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const try_ = () => {
      http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try {
            const t = JSON.parse(data).tunnels.find((t) => t.proto === 'https');
            if (t) return resolve(t.public_url);
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
    ngrokProc = spawn('ngrok', ['http', String(API_PORT)], { stdio: 'ignore' });
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
      local:    `http://${getLocalIP()}:${API_PORT}/${API_PREFIX}`,
    };
    apiUrl = urls[MODE];
  }

  // Grava .env.local — Expo sempre usará esta URL
  fs.writeFileSync(path.join(MOBILE_DIR, '.env.local'), `EXPO_PUBLIC_API_URL=${apiUrl}\n`);

  const expoFlag = { web: '--web', emulator: '--android', local: '', tunnel: '--tunnel' }[MODE];
  const expoCmd  = `npx expo start${expoFlag ? ' ' + expoFlag : ''}`;

  // No Windows a env var é passada via SET antes do comando
  const expoFull = PLATFORM === 'win32'
    ? `SET EXPO_PUBLIC_API_URL=${apiUrl} && ${expoCmd}`
    : `EXPO_PUBLIC_API_URL="${apiUrl}" ${expoCmd}`;

  console.log(`\n┌─────────────────────────────────────────────────┐`);
  console.log(`│  Taskly — modo: ${MODE.padEnd(32)}│`);
  console.log(`│  API:  ${apiUrl.padEnd(41)}│`);
  console.log(`│  SO:   ${PLATFORM.padEnd(41)}│`);
  console.log(`└─────────────────────────────────────────────────┘\n`);
  console.log(`${cyan}Abrindo abas do terminal...${reset}\n`);

  openTab('Taskly API', 'npm run dev:api');
  await new Promise((r) => setTimeout(r, 400));
  openTab('Taskly Mobile', expoFull);

  setTimeout(() => process.exit(0), 600);
}

main().catch((err) => { console.error(err); process.exit(1); });
