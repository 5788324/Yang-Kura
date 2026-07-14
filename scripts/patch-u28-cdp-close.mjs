#!/usr/bin/env node
import fs from 'node:fs';

const target = 'scripts/test-u28-electron-e2e.mjs';
let source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
const before = `async function closeApp(runtime) {
  await runtime.cdp.close();
  if (runtime.child.exitCode === null) runtime.child.kill();
  const deadline = Date.now() + 10_000;
  while (runtime.child.exitCode === null && Date.now() < deadline) await delay(100);
  if (runtime.child.exitCode === null) {
    runtime.child.kill('SIGKILL');
    throw new Error('Electron process did not exit cleanly');
  }
}`;
const after = `async function waitForChildExit(child, timeout) {
  if (child.exitCode !== null) return true;
  return Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    delay(timeout).then(() => false),
  ]);
}

async function closeApp(runtime) {
  const gracefulExit = waitForChildExit(runtime.child, 5_000);
  try {
    await Promise.race([runtime.cdp.send('Browser.close'), delay(750)]);
  } catch {}
  let exited = await gracefulExit;
  if (!exited && runtime.child.exitCode === null) {
    if (process.platform === 'win32') {
      const { spawnSync } = await import('node:child_process');
      spawnSync('taskkill', ['/PID', String(runtime.child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      runtime.child.kill('SIGKILL');
    }
    exited = await waitForChildExit(runtime.child, 5_000);
  }
  await runtime.cdp.close();
  if (!exited && runtime.child.exitCode === null) throw new Error('Electron process tree did not exit after graceful close and forced cleanup');
}`;

if (source.includes(after)) {
  console.log('U28 CDP shutdown patch already applied.');
} else {
  if (!source.includes(before)) throw new Error('U28 CDP shutdown patch anchor not found.');
  source = source.replace(before, after);
  fs.writeFileSync(target, source, 'utf8');
  console.log('Applied robust Windows Electron shutdown handling.');
}
