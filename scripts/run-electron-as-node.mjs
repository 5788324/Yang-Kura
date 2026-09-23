#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const electronCommand = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  isWindows ? 'electron.cmd' : 'electron',
);
const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/run-electron-as-node.mjs <script>');
  process.exit(2);
}

const env = {
  ...process.env,
  ELECTRON_RUN_AS_NODE: '1',
};

const result = isWindows
  ? spawnSync('cmd.exe', ['/d', '/c', electronCommand, target], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
      env,
    })
  : spawnSync(electronCommand, [target], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
      env,
    });

if (result.error) {
  console.error(`Electron Node-mode launch failed: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
