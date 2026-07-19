#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'beta3-rj-detail-playback-entry');
fs.mkdirSync(artifactDir, { recursive: true });

const ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';
const WORK_TITLE = 'Beta 3 详情页播放入口样本';
const TRACKS = [
  { id: 'beta3-entry-main', title: '01 主区域点击.wav', file: '01-main.wav', seconds: 8 },
  { id: 'beta3-entry-action', title: '02 行尾播放按钮.wav', file: '02-action.wav', seconds: 9 },
];
const report = { status: 'running', head: process.env.GITHUB_SHA ?? null, scenarios: [], pageErrors: [], consoleErrors: [] };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function writeSilentWav(filePath, seconds) {
  const sampleRate = 8000;
  const channels = 1;
  const bitsPerSample = 16;
  const frameCount = sampleRate * seconds;
  const dataSize = frameCount * channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

function buildIndex(rootPathToken, sizes) {
  const timestamp = '2026-07-18T00:00:00.000Z';
  return {
    schemaVersion: 1,
    generatedAt: timestamp,
    sourceKind: 'electron-scan',
    roots: [{
      id: 'beta3-entry-root',
      name: 'beta3-rj-detail-playback-entry',
      rootPath: `rootPathToken:${rootPathToken}`,
      libraryType: 'asmr',
      scanProfile: 'asmr-rj',
      sourceKind: 'electron-scan',
      createdAt: timestamp,
      updatedAt: timestamp,
    }],
    collections: [{
      id: 'beta3-entry-work',
      rootId: 'beta3-entry-root',
      collectionType: 'rj_work',
      title: WORK_TITLE,
      codeRaw: 'RJ390001',
      codeNorm: 'RJ390001',
      circle: 'Beta 3 E2E',
      cvs: ['Beta 3 E2E'],
      tags: ['beta3'],
      status: 'identified',
      trackIds: TRACKS.map((track) => track.id),
      totalDurationSeconds: 0,
      addedAt: timestamp,
      updatedAt: timestamp,
    }],
    tracks: TRACKS.map((track, index) => ({
      id: track.id,
      rootId: 'beta3-entry-root',
      collectionId: 'beta3-entry-work',
      kind: 'audio',
      title: track.title,
      displayArtist: 'Beta 3 E2E',
      displayAlbum: WORK_TITLE,
      rjId: 'RJ390001',
      trackNo: index + 1,
      durationSeconds: 0,
      source: {
        id: `source-${track.id}`,
        trackId: track.id,
        sourceKind: 'local-file',
        relativePath: track.file,
        extension: 'wav',
        sizeBytes: sizes[track.file],
        mtimeMs: 1,
      },
      subtitles: [],
      tags: ['beta3'],
      addedAt: timestamp,
    })),
    covers: [],
    subtitles: [],
    warnings: [],
  };
}

function writeIndex(filePath, index) {
  fs.writeFileSync(
    filePath,
    Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(JSON.stringify(index, null, 2), 'utf8')]),
  );
}

async function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.pageErrors = [];
    this.consoleErrors = [];
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connection timeout')), 15000);
      this.socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.socket.addEventListener('error', (event) => {
        clearTimeout(timer);
        reject(new Error(event.message ?? 'CDP error'));
      }, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message));
        else pending.resolve(payload.result);
        return;
      }
      if (payload.method === 'Runtime.exceptionThrown') {
        this.pageErrors.push(payload.params?.exceptionDetails?.text ?? 'Runtime exception');
      }
      if (payload.method === 'Runtime.consoleAPICalled' && payload.params?.type === 'error') {
        this.consoleErrors.push((payload.params.args ?? []).map((item) => item.value ?? item.description ?? '').join(' '));
      }
    });
    await this.send('Runtime.enable');
    await this.send('Page.enable');
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    }
    return response.result?.value;
  }

  async close() {
    try { this.socket?.close(); } catch {}
  }
}

function electronExecutable() {
  const executable = path.join(
    cwd,
    'node_modules',
    'electron',
    'dist',
    process.platform === 'win32' ? 'electron.exe' : 'electron',
  );
  if (!fs.existsSync(executable)) throw new Error(`Electron binary missing: ${executable}`);
  return executable;
}

async function waitForCdpTarget(port, child) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Electron exited before CDP attached: ${child.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const target = targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
        if (target) return target.webSocketDebuggerUrl;
      }
    } catch {}
    await delay(200);
  }
  throw new Error('Electron CDP target timeout');
}

async function waitForCondition(cdp, expression, timeout = 15000, label = expression) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

const waitForSelector = (cdp, selector, timeout = 15000) =>
  waitForCondition(cdp, `document.querySelector(${JSON.stringify(selector)})`, timeout, selector);

const waitForBodyText = (cdp, text, timeout = 15000) =>
  waitForCondition(cdp, `document.body?.innerText.includes(${JSON.stringify(text)})`, timeout, text);

async function clickSelector(cdp, selector) {
  await cdp.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing selector: ${selector}');
    element.click();
    return true;
  })()`);
  await delay(150);
}

async function clickVisibleText(cdp, text, tagName = '*') {
  await cdp.evaluate(`(() => {
    const expected = ${JSON.stringify(text)};
    const element = [...document.querySelectorAll(${JSON.stringify(tagName)})]
      .find((item) => item.offsetParent !== null && item.textContent?.trim() === expected);
    if (!element) throw new Error('Missing text: ' + expected);
    element.click();
    return true;
  })()`);
  await delay(150);
}

async function physicalClick(cdp, selector) {
  const point = await cdp.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing physical-click selector: ${selector}');
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
  })()`);
  assert.ok(point.width > 0 && point.height > 0, `Selector has no hit area: ${selector}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: point.x,
    y: point.y,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: point.x,
    y: point.y,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  });
  await delay(250);
}

function playerState(cdp) {
  return cdp.evaluate(`(() => {
    const bar = document.querySelector('#app-player-bar');
    return {
      mode: bar?.dataset.u29PlaybackMode ?? '',
      trackId: bar?.dataset.u29TrackId ?? '',
      duration: Number(bar?.dataset.u29Duration ?? 0),
      queueCount: Number(bar?.dataset.u29QueueCount ?? 0),
      sourceReady: bar?.dataset.u29SourceReady === 'true',
    };
  })()`);
}

async function waitForPlayer(cdp, predicate, label, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const state = await playerState(cdp);
    if (predicate(state)) return state;
    await delay(100);
  }
  throw new Error(`Timed out waiting for player: ${label}`);
}

async function launchApp(fixtureDir, profileDir) {
  const port = await reservePort();
  const child = spawn(
    electronExecutable(),
    [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')],
    {
      cwd,
      env: {
        ...process.env,
        APPDATA: profileDir,
        LOCALAPPDATA: profileDir,
        YANG_KURA_ELECTRON_DEV: '0',
        YANG_KURA_E2E_MODE: '1',
        YANG_KURA_E2E_LIBRARY_ROOT: fixtureDir,
        YANG_KURA_E2E_USER_DATA_ROOT: path.join(profileDir, 'Yang-Kura'),
        ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: false,
    },
  );
  const cdp = new CdpClient(await waitForCdpTarget(port, child));
  await cdp.connect();
  await waitForSelector(cdp, '#windows-app-bar', 30000);
  return { child, cdp };
}

async function closeApp(runtime) {
  const exited = new Promise((resolve) => runtime.child.once('exit', () => resolve(true)));
  try { await Promise.race([runtime.cdp.send('Browser.close'), delay(750)]); } catch {}
  let done = await Promise.race([exited, delay(5000).then(() => false)]);
  if (!done && runtime.child.exitCode === null) {
    if (process.platform === 'win32') {
      const { spawnSync } = await import('node:child_process');
      spawnSync('taskkill', ['/PID', String(runtime.child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      runtime.child.kill('SIGKILL');
    }
    done = await Promise.race([exited, delay(5000).then(() => false)]);
  }
  await runtime.cdp.close();
  if (!done && runtime.child.exitCode === null) throw new Error('Electron process tree remained active');
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-beta3-entry-'));
const fixtureDir = path.join(tempRoot, 'library');
const profileDir = path.join(tempRoot, 'profile');
fs.mkdirSync(fixtureDir, { recursive: true });
fs.mkdirSync(profileDir, { recursive: true });

const sizes = {};
for (const track of TRACKS) {
  sizes[track.file] = writeSilentWav(path.join(fixtureDir, track.file), track.seconds);
}
writeIndex(path.join(fixtureDir, 'library-index.json'), {
  schemaVersion: 1,
  generatedAt: new Date(0).toISOString(),
  sourceKind: 'fixture',
  roots: [],
  collections: [],
  tracks: [],
  covers: [],
  subtitles: [],
  warnings: [],
});

const runtime = await launchApp(fixtureDir, profileDir);
try {
  await clickSelector(runtime.cdp, '#nav-settings');
  await waitForBodyText(runtime.cdp, '应用设置');
  await clickSelector(runtime.cdp, '[data-settings-tab="paths"]');
  await clickVisibleText(runtime.cdp, '选择音声库目录', 'button');
  await waitForBodyText(runtime.cdp, '已选择目录，可读取已有记录或重新扫描');

  const rootPathToken = await runtime.cdp.evaluate(`(() => {
    const value = JSON.parse(sessionStorage.getItem(${JSON.stringify(ROOT_SESSION_KEY)}) ?? '{}');
    return value.asmr?.rootPathToken ?? '';
  })()`);
  assert.ok(rootPathToken.startsWith('yk-root-'), '授权后未获得 rootPathToken');

  writeIndex(path.join(fixtureDir, 'library-index.json'), buildIndex(rootPathToken, sizes));
  await clickVisibleText(runtime.cdp, '读取已有记录', 'button');
  await waitForBodyText(runtime.cdp, '文件编码：utf8-bom');

  await clickSelector(runtime.cdp, '#nav-asmr-lib');
  await waitForBodyText(runtime.cdp, WORK_TITLE);
  await clickVisibleText(runtime.cdp, WORK_TITLE);
  await waitForBodyText(runtime.cdp, '音轨与资源文件');

  const activationMode = await runtime.cdp.evaluate(`(() => {
    const row = document.querySelector('.u37c-rj-track-list .yk-track-row:nth-child(1)');
    return row?.getAttribute('data-track-row-activation') ?? '';
  })()`);
  assert.equal(activationMode, 'direct', 'RJ detail main-row must use direct button activation');

  await physicalClick(runtime.cdp, '.u37c-rj-track-list .yk-track-row:nth-child(1) .yk-track-row__main');
  const mainEntry = await waitForPlayer(
    runtime.cdp,
    (state) => state.trackId === TRACKS[0].id && state.queueCount === TRACKS.length && state.sourceReady,
    'RJ detail main-row entry',
  );
  const mainBackend = await waitForPlayer(
    runtime.cdp,
    (state) => state.trackId === TRACKS[0].id
      && (state.mode === 'html-audio' || state.mode === 'mpv')
      && state.duration > 0,
    'RJ detail main-row backend duration',
  );

  await physicalClick(runtime.cdp, '.u37c-rj-track-list .yk-track-row:nth-child(2) .u37c-track-play');
  const actionEntry = await waitForPlayer(
    runtime.cdp,
    (state) => state.trackId === TRACKS[1].id && state.queueCount === TRACKS.length && state.sourceReady,
    'RJ detail action entry',
  );
  const actionBackend = await waitForPlayer(
    runtime.cdp,
    (state) => state.trackId === TRACKS[1].id
      && (state.mode === 'html-audio' || state.mode === 'mpv')
      && state.duration > 0,
    'RJ detail action backend duration',
  );

  assert.deepEqual(runtime.cdp.pageErrors, [], `Renderer errors: ${runtime.cdp.pageErrors.join(' | ')}`);
  assert.deepEqual(runtime.cdp.consoleErrors, [], `Renderer console errors: ${runtime.cdp.consoleErrors.join(' | ')}`);

  report.status = 'PASS';
  report.scenarios.push({
    name: 'rj-detail-physical-click-entry',
    status: 'PASS',
    mainEntry,
    mainBackend,
    actionEntry,
    actionBackend,
    indexDurationSeconds: 0,
  });
  console.log('Beta 3 RJ detail playback-entry E2E PASS');
} finally {
  report.pageErrors = runtime.cdp.pageErrors;
  report.consoleErrors = runtime.cdp.consoleErrors;
  fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await closeApp(runtime);
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
