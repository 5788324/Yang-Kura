#!/usr/bin/env node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const electronCommand = path.join(process.cwd(), 'node_modules', '.bin', isWindows ? 'electron.cmd' : 'electron');
const devUrl = process.env.YANG_KURA_VITE_DEV_URL ?? 'http://127.0.0.1:3000';
const parsedDevUrl = new URL(devUrl);
const devPort = parsedDevUrl.port || (parsedDevUrl.protocol === 'https:' ? '443' : '80');

if (!existsSync(electronCommand)) {
  console.error('[Yang-Kura] Electron binary is not installed.');
  console.error('[Yang-Kura] npm ci can pass without Electron because electron is optional for validation.');
  console.error('[Yang-Kura] To run desktop dev, install or repair Electron first: npm run desktop:setup');
  process.exit(1);
}
const maxAttempts = Number(process.env.YANG_KURA_ELECTRON_DEV_WAIT_ATTEMPTS ?? 80);

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

async function assertDevPortAvailable() {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => reject(new Error(`[Yang-Kura] Dev server port ${devPort} is already in use. Close the process using this port, or set YANG_KURA_VITE_DEV_URL to a free local port, for example http://127.0.0.1:3001.`)));
    server.once('listening', () => server.close(resolve));
    server.listen(Number(devPort), '127.0.0.1');
  });
}

async function waitForVite(url) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite dev server at ${url}`);
}

await assertDevPortAvailable();

const vite = spawnLogged(npmCommand, ['run', 'dev', '--', `--port=${devPort}`, '--host=0.0.0.0', '--strictPort'], {
  env: {
    ...process.env,
    BROWSER: 'none',
  },
});

let electron;
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (electron && !electron.killed) electron.kill();
  if (!vite.killed) vite.kill();
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

vite.on('exit', (code) => {
  if (!shuttingDown && electron === undefined) {
    console.error(`[Yang-Kura] Vite exited before Electron started with code ${code ?? 'unknown'}.`);
    shutdown(code ?? 1);
  }
});

try {
  await waitForVite(devUrl);
  electron = spawnLogged(electronCommand, ['dist-electron/main.js'], {
    env: {
      ...process.env,
      YANG_KURA_ELECTRON_DEV: '1',
      YANG_KURA_VITE_DEV_URL: devUrl,
    },
  });
  electron.on('exit', (code) => shutdown(code ?? 0));
} catch (error) {
  console.error(error);
  shutdown(1);
}
