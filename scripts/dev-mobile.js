#!/usr/bin/env node

/**
 * Inicia a API em background e o Expo com acesso direto ao terminal
 * (necessário para o QR code renderizar corretamente).
 *
 * Uso:
 *   node scripts/dev-mobile.js web       → navegador (localhost)
 *   node scripts/dev-mobile.js emulator  → emulador Android (10.0.2.2)
 *   node scripts/dev-mobile.js local     → dispositivo físico (IP detectado)
 *   node scripts/dev-mobile.js tunnel    → qualquer lugar via túnel Expo
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

const MODE = process.argv[2];
const VALID_MODES = ['web', 'emulator', 'local', 'tunnel'];

if (!VALID_MODES.includes(MODE)) {
  console.error(`\nModo inválido: "${MODE}"`);
  console.error(`Modos disponíveis: ${VALID_MODES.join(' | ')}\n`);
  process.exit(1);
}

const API_PORT = 3333;
const API_PREFIX = 'api';
const ROOT_DIR   = path.join(__dirname, '..');
const MOBILE_DIR = path.join(ROOT_DIR, 'apps/mobile');

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
  console.warn(`\n[Taskly] IP não detectado. Usando ${fallback}.`);
  console.warn('[Taskly] Defina TASKLY_LOCAL_IP=<seu-ip> para sobrescrever.\n');
  return fallback;
}

const API_URLS = {
  web:      `http://localhost:${API_PORT}/${API_PREFIX}`,
  emulator: `http://10.0.2.2:${API_PORT}/${API_PREFIX}`,
  local:    `http://${process.env.TASKLY_LOCAL_IP || getLocalIP()}:${API_PORT}/${API_PREFIX}`,
  tunnel:   `http://${process.env.TASKLY_LOCAL_IP || getLocalIP()}:${API_PORT}/${API_PREFIX}`,
};

const EXPO_FLAGS = {
  web:      ['--web'],
  emulator: ['--android'],
  local:    [],
  tunnel:   ['--tunnel'],
};

const apiUrl   = API_URLS[MODE];
const expoArgs = ['start', ...EXPO_FLAGS[MODE]];

console.log(`\n┌─────────────────────────────────────────┐`);
console.log(`│  Taskly — modo: ${MODE.padEnd(24)}│`);
console.log(`│  API URL: ${apiUrl.padEnd(30)}│`);
console.log(`└─────────────────────────────────────────┘\n`);

// ─── API em background, output prefixado ─────────────────────────────────────
const api = spawn('npm', ['run', 'dev:api'], {
  cwd: ROOT_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const cyan  = '\x1b[36m';
const reset = '\x1b[0m';

function printApiLine(chunk) {
  chunk.toString().split('\n').forEach((line) => {
    if (line.trim()) process.stdout.write(`${cyan}[API]${reset} ${line}\n`);
  });
}

api.stdout?.on('data', printApiLine);
api.stderr?.on('data', printApiLine);

// ─── Expo com terminal completo (necessário para QR code) ────────────────────
const expo = spawn('npx', ['expo', ...expoArgs], {
  cwd: MOBILE_DIR,
  stdio: 'inherit',         // herda stdin/stdout/stderr → QR code funciona
  env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
});

// ─── Encerrar API quando Expo fechar ─────────────────────────────────────────
function shutdown() {
  api.kill('SIGTERM');
  process.exit(0);
}

expo.on('exit', shutdown);
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
