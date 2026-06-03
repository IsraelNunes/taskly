#!/usr/bin/env node

/**
 * Inicia a API em background e o Expo com acesso direto ao terminal.
 *
 * Uso:
 *   node scripts/dev-mobile.js web       → navegador (localhost)
 *   node scripts/dev-mobile.js emulator  → emulador Android (10.0.2.2)
 *   node scripts/dev-mobile.js local     → dispositivo físico (IP detectado)
 *   node scripts/dev-mobile.js tunnel    → API via ngrok + Expo via túnel
 */

const { execSync, spawn } = require('child_process');
const http  = require('http');
const path  = require('path');

const MODE        = process.argv[2];
const VALID_MODES = ['web', 'emulator', 'local', 'tunnel'];

if (!VALID_MODES.includes(MODE)) {
  console.error(`\nModo inválido: "${MODE}"`);
  console.error(`Modos disponíveis: ${VALID_MODES.join(' | ')}\n`);
  process.exit(1);
}

const API_PORT  = 3333;
const API_PREFIX = 'api';
const ROOT_DIR  = path.join(__dirname, '..');
const MOBILE_DIR = path.join(ROOT_DIR, 'apps/mobile');

const cyan   = '\x1b[36m';
const yellow = '\x1b[33m';
const reset  = '\x1b[0m';

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
    } catch { /* tenta próxima */ }
  }
  const fallback = process.env.TASKLY_LOCAL_IP || '192.168.1.100';
  console.warn(`\n${yellow}[Taskly] IP não detectado. Usando ${fallback}.${reset}`);
  return fallback;
}

// Consulta a API local do ngrok para obter a URL pública do túnel
function getNgrokUrl(retries = 20, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const try_ = () => {
      http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const tunnels = JSON.parse(data).tunnels;
            const https   = tunnels.find((t) => t.proto === 'https');
            if (https) return resolve(https.public_url);
          } catch { /* continua tentando */ }
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

async function main() {
  // ─── Determinar URL da API ──────────────────────────────────────────────────
  let apiUrl;
  let ngrokProc = null;

  if (MODE === 'tunnel') {
    console.log(`\n${yellow}[Taskly] Modo tunnel: iniciando ngrok para a API...${reset}\n`);

    ngrokProc = spawn('ngrok', ['http', String(API_PORT)], {
      stdio: ['ignore', 'ignore', 'ignore'],
      detached: false,
    });

    try {
      const publicUrl = await getNgrokUrl();
      apiUrl = `${publicUrl}/${API_PREFIX}`;
      console.log(`${cyan}[Taskly] Túnel da API: ${publicUrl}${reset}\n`);
    } catch (err) {
      console.error(`\n[Taskly] Erro ao obter URL do ngrok: ${err.message}`);
      console.error('[Taskly] Certifique-se de que o ngrok está autenticado (ngrok config add-authtoken <token>)\n');
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

  const expoFlags = {
    web:      ['--web'],
    emulator: ['--android'],
    local:    [],
    tunnel:   ['--tunnel'],
  };

  const expoArgs = ['start', ...expoFlags[MODE]];

  console.log(`┌─────────────────────────────────────────────────┐`);
  console.log(`│  Taskly — modo: ${MODE.padEnd(32)}│`);
  console.log(`│  API:  ${apiUrl.padEnd(41)}│`);
  console.log(`└─────────────────────────────────────────────────┘\n`);

  // ─── API em background ───────────────────────────────────────────────────────
  const api = spawn('npm', ['run', 'dev:api'], {
    cwd: ROOT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  function printApiLine(chunk) {
    chunk.toString().split('\n').forEach((line) => {
      if (line.trim()) process.stdout.write(`${cyan}[API]${reset} ${line}\n`);
    });
  }

  api.stdout?.on('data', printApiLine);
  api.stderr?.on('data', printApiLine);

  // ─── Expo com terminal completo (QR code) ────────────────────────────────────
  const expo = spawn('npx', ['expo', ...expoArgs], {
    cwd: MOBILE_DIR,
    stdio: 'inherit',
    env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
  });

  // ─── Encerramento limpo ───────────────────────────────────────────────────────
  function shutdown() {
    api.kill('SIGTERM');
    if (ngrokProc) ngrokProc.kill('SIGTERM');
    process.exit(0);
  }

  expo.on('exit', shutdown);
  process.on('SIGINT',  shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
