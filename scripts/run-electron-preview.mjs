#!/usr/bin/env node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const electronBin = path.join(process.cwd(), 'node_modules', '.bin', isWindows ? 'electron.cmd' : 'electron');

if (!existsSync(electronBin)) {
  console.error('[Yang-Kura] Electron binary is not installed.');
  console.error('[Yang-Kura] npm ci can pass without Electron because electron is optional for validation.');
  console.error('[Yang-Kura] To run desktop preview, install or repair Electron first: npm run desktop:setup');
  process.exit(1);
}

function spawnLogged(command, args, options = {}) {
  if (isWindows && command.toLowerCase().endsWith('.cmd')) {
    return spawn('cmd.exe', ['/d', '/c', command, ...args], {
      stdio: 'inherit',
      shell: false,
      ...options,
    });
  }

  return spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });
}

const child = spawnLogged(electronBin, ['dist-electron/main.js'], {
  env: { ...process.env, YANG_KURA_ELECTRON_DEV: '0' },
});

child.on('exit', (code) => process.exit(code ?? 0));
