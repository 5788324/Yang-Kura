#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, 'beta3-playback-diagnostic-probe.mjs');
const source = fs.readFileSync(probePath, 'utf8');

function extractRawTemplate(name) {
  const prefix = `const ${name} = String.raw\``;
  const start = source.indexOf(prefix);
  assert.notEqual(start, -1, `Missing ${name} declaration`);
  const bodyStart = start + prefix.length;
  const end = source.indexOf('`;', bodyStart);
  assert.notEqual(end, -1, `Missing ${name} template terminator`);
  return source.slice(bodyStart, end);
}

assert.ok(!source.includes('SNAPSHOT_EXRESSION'), 'Misspelled SNAPSHOT_EXRESSION remains');
assert.match(source, /sendEval\(INSTALL_EXPRESSION,\s*'install'\)/);
assert.match(source, /sendEval\(SNAPSHOT_EXPRESSION,\s*'snapshot'\)/);

const installExpression = extractRawTemplate('INSTALL_EXPRESSION');
const snapshotExpression = extractRawTemplate('SNAPSHOT_EXPRESSION');
assert.match(installExpression, /__YANG_KURA_BETA3_PROBE__/);
assert.match(snapshotExpression, /#app-player-bar/);
assert.match(snapshotExpression, /u29PlaybackMode/);
assert.match(snapshotExpression, /u29Duration/);
new vm.Script(installExpression, { filename: 'INSTALL_EXPRESSION' });
new vm.Script(snapshotExpression, { filename: 'SNAPSHOT_EXPRESSION' });

class FakeWebSocket {
  constructor() {
    this.listeners = new Map();
    this.sent = [];
    queueMicrotask(() => this.emit('open', {}));
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  emit(type, event) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  send(raw) {
    const payload = JSON.parse(String(raw));
    this.sent.push(payload);
    if (payload.method !== 'Runtime.evaluate') return;
    const isInstall = String(payload.params?.expression ?? '').includes('probe-installed');
    const value = isInstall
      ? { installed: true, hasYangKura: true }
      : {
          capturedAt: new Date().toISOString(),
          location: 'yk-probe-self-test://renderer',
          probePresent: true,
          player: {
            mode: 'html-audio',
            trackId: 'probe-self-test-track',
            progress: 1,
            duration: 9,
            queueCount: 2,
            currentIndex: 1,
            sourceReady: true,
            lyricsStatus: 'idle',
            visibleText: '',
          },
          events: [],
          bodyTextTail: '',
        };
    queueMicrotask(() => this.emit('message', {
      data: JSON.stringify({ id: payload.id, result: { result: { value } } }),
    }));
  }

  close() {
    this.emit('close', {});
  }
}

const originalCwd = process.cwd();
const originalWebSocket = globalThis.WebSocket;
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-probe-self-test-'));
try {
  process.chdir(tempRoot);
  globalThis.WebSocket = FakeWebSocket;
  await import(`${pathToFileURL(probePath).href}?self-test=${Date.now()}`);
  const socket = new globalThis.WebSocket('ws://probe-self-test');
  await new Promise((resolve) => setTimeout(resolve, 650));
  socket.close();
  await new Promise((resolve) => setTimeout(resolve, 50));

  const artifactPath = path.join(tempRoot, 'artifacts', 'beta3-rj-detail-playback-entry', 'diagnostic-probe.json');
  assert.ok(fs.existsSync(artifactPath), 'Runtime self-test did not create diagnostic-probe.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  assert.ok(artifact.installResults.length >= 1, 'Runtime self-test did not capture install result');
  assert.ok(artifact.snapshots.length >= 1, 'Runtime self-test did not capture snapshot');
  assert.equal(artifact.latestSnapshot?.player?.trackId, 'probe-self-test-track');
  assert.deepEqual(artifact.probeErrors, []);
} finally {
  process.chdir(originalCwd);
  globalThis.WebSocket = originalWebSocket;
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

const result = {
  status: 'PASS',
  probePath: path.relative(process.cwd(), probePath),
  installExpressionBytes: Buffer.byteLength(installExpression),
  snapshotExpressionBytes: Buffer.byteLength(snapshotExpression),
  runtimeSnapshots: 1,
};
console.log(`[verify-beta3-playback-diagnostic-probe] ${JSON.stringify(result)}`);
