#!/usr/bin/env node

/**
 * Inicia o app mobile com a EXPO_PUBLIC_API_URL correta para cada ambiente.
 *
 * Uso:
 *   node scripts/dev-mobile.js web       → navegador (localhost)
 *   node scripts/dev-mobile.js emulator  → emulador Android (10.0.2.2)
 *   node scripts/dev-mobile.js local     → dispositivo físico (IP local detectado)
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

function getLocalIP() {
  const strategies = [
    // Linux
    () => execSync("ip route get 1 2>/dev/null | awk '{print $7; exit}'").toString().trim(),
    // macOS
    () => execSync("ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null").toString().trim(),
    // Linux alternativo
    () => execSync("hostname -I 2>/dev/null | awk '{print $1}'").toString().trim(),
  ];

  for (const strategy of strategies) {
    try {
      const ip = strategy();
      if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip;
    } catch {
      // tenta a próxima
    }
  }

  console.warn('\n[Taskly] Não foi possível detectar o IP local. Usando 192.168.1.100 como fallback.');
  console.warn('[Taskly] Defina TASKLY_LOCAL_IP=<seu-ip> para sobrescrever.\n');
  return process.env.TASKLY_LOCAL_IP || '192.168.1.100';
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

const apiUrl  = API_URLS[MODE];
const expoArgs = ['start', ...EXPO_FLAGS[MODE], '--clear'];

console.log(`\n┌─────────────────────────────────────────┐`);
console.log(`│  Taskly Mobile — modo: ${MODE.padEnd(16)}│`);
console.log(`│  API URL: ${apiUrl.padEnd(30)}│`);
console.log(`└─────────────────────────────────────────┘\n`);

const child = spawn('npx', ['expo', ...expoArgs], {
  cwd: path.join(__dirname, '../apps/mobile'),
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PUBLIC_API_URL: apiUrl,
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
