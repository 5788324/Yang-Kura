#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u28-electron-e2e');
fs.mkdirSync(artifactDir, { recursive: true });

const EMPTY_INDEX_NAME = 'empty-index';
const POPULATED_INDEX_NAME = 'populated-index';
const WORK_TITLE = 'U28 E2E 音声作品';
const TRACK_TITLE = 'U28 E2E 测试音轨';
const ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';
const report = { status: 'running', driver: 'electron-chromium-cdp', scenarios: [], screenshots: [] };

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function writeJsonWithBom(filePath, value) {
  const body = Buffer.from(JSON.stringify(value, null, 2), 'utf8');
  fs.writeFileSync(filePath, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), body]));
}

function emptyIndex() {
  return {
    schemaVersion: 1,
    generatedAt: '2026-07-14T00:00:00.000Z',
    sourceKind: 'fixture',
    roots: [],
    collections: [],
    tracks: [],
    covers: [],
    subtitles: [],
    warnings: [],
  };
}

function populatedIndex(rootPathToken, wavSize) {
  const timestamp = '2026-07-14T00:00:00.000Z';
  return {
    schemaVersion: 1,
    generatedAt: timestamp,
    sourceKind: 'fixture',
    roots: [{
      id: 'u28-e2e-root',
      name: POPULATED_INDEX_NAME,
      rootPath: `rootPathToken:${rootPathToken}`,
      libraryType: 'asmr',
      scanProfile: 'asmr-rj',
      sourceKind: 'fixture',
      createdAt: timestamp,
      updatedAt: timestamp,
    }],
    collections: [{
      id: 'u28-e2e-work',
      rootId: 'u28-e2e-root',
      collectionType: 'rj_work',
      title: WORK_TITLE,
      codeRaw: 'RJ280001',
      codeNorm: 'RJ280001',
      circle: 'U28 E2E 社团',
      cvs: ['U28 E2E CV'],
      tags: ['E2E'],
      status: 'identified',
      trackIds: ['u28-e2e-track'],
      totalDurationSeconds: 3,
      addedAt: timestamp,
      updatedAt: timestamp,
    }],
    tracks: [{
      id: 'u28-e2e-track',
      rootId: 'u28-e2e-root',
      collectionId: 'u28-e2e-work',
      kind: 'audio',
      title: TRACK_TITLE,
      displayArtist: 'U28 E2E CV',
      displayAlbum: WORK_TITLE,
      rjId: 'RJ280001',
      trackNo: 1,
      durationSeconds: 3,
      source: {
        id: 'u28-e2e-source',
        trackId: 'u28-e2e-track',
        sourceKind: 'local-file',
        relativePath: 'sample.wav',
        extension: 'wav',
        sizeBytes: wavSize,
        mtimeMs: 1,
      },
      subtitles: [],
      tags: ['E2E'],
      addedAt: timestamp,
    }],
    covers: [],
    subtitles: [],
    warnings: [],
  };
}

function writeSilentWav(filePath, seconds = 3) {
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
      const timer = setTimeout(() => reject(new Error('CDP WebSocket connection timeout')), 15_000);
      this.socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.socket.addEventListener('error', (event) => {
        clearTimeout(timer);
        reject(new Error(`CDP WebSocket error: ${event.message ?? 'unknown'}`));
      }, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(`${payload.error.code}: ${payload.error.message}`));
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

  async evaluate(expression, awaitPromise = false) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    }
    return response.result?.value;
  }

  async close() {
    try {
      this.socket?.close();
    } catch {}
  }
}

function electronExecutable() {
  const candidates = process.platform === 'win32'
    ? [path.join(cwd, 'node_modules', 'electron', 'dist', 'electron.exe')]
    : [path.join(cwd, 'node_modules', 'electron', 'dist', 'electron')];
  const executable = candidates.find((candidate) => fs.existsSync(candidate));
  if (!executable) throw new Error(`Electron binary missing: ${candidates.join(' | ')}`);
  return executable;
}

async function waitForCdpTarget(port, child) {
  const deadline = Date.now() + 30_000;
  let lastError = '';
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Electron exited before CDP attached: ${child.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const target = targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
        if (target) return target.webSocketDebuggerUrl;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(200);
  }
  throw new Error(`Electron CDP target timeout${lastError ? `: ${lastError}` : ''}`);
}

async function launchApp(fixtureDir, profileDir) {
  const port = await reservePort();
  const stdout = [];
  const stderr = [];
  const child = spawn(electronExecutable(), [
    `--remote-debugging-port=${port}`,
    path.join(cwd, 'dist-electron', 'main.js'),
  ], {
    cwd,
    env: {
      ...process.env,
      APPDATA: profileDir,
      LOCALAPPDATA: profileDir,
      YANG_KURA_ELECTRON_DEV: '0',
      YANG_KURA_E2E_MODE: '1',
      YANG_KURA_E2E_LIBRARY_ROOT: fixtureDir,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false,
  });
  child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
  child.stderr.on('data', (chunk) => stderr.push(String(chunk)));
  const webSocketUrl = await waitForCdpTarget(port, child);
  const cdp = new CdpClient(webSocketUrl);
  await cdp.connect();
  await waitForSelector(cdp, '#windows-app-bar', 30_000);
  return { child, cdp, stdout, stderr };
}

async function waitForCondition(cdp, expression, timeout = 15_000, label = expression) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function waitForSelector(cdp, selector, timeout = 15_000) {
  return waitForCondition(cdp, `document.querySelector(${JSON.stringify(selector)})`, timeout, selector);
}

async function waitForBodyText(cdp, text, timeout = 15_000) {
  return waitForCondition(cdp, `document.body?.innerText.includes(${JSON.stringify(text)})`, timeout, `text ${text}`);
}

async function bodyText(cdp) {
  return cdp.evaluate('document.body?.innerText ?? ""');
}

async function expectBodyContains(cdp, text) {
  const body = await bodyText(cdp);
  assert.ok(body.includes(text), `页面应包含：${text}`);
  return body;
}

async function expectBodyExcludes(cdp, text) {
  const body = await bodyText(cdp);
  assert.ok(!body.includes(text), `页面不应包含：${text}`);
}

async function clickSelector(cdp, selector) {
  await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing selector: ${selector}'); element.click(); return true; })()`);
  await delay(120);
}

async function clickVisibleText(cdp, text, tagName = '*', exact = true) {
  const expression = `(() => {
    const expected = ${JSON.stringify(text)};
    const elements = [...document.querySelectorAll(${JSON.stringify(tagName)})];
    const element = elements.find((item) => item.offsetParent !== null && (${exact ? 'item.textContent?.trim() === expected' : 'item.textContent?.includes(expected)'}));
    if (!element) throw new Error('Missing visible text: ' + expected);
    element.click();
    return true;
  })()`;
  await cdp.evaluate(expression);
  await delay(120);
}

async function navigate(cdp, pageId) {
  await clickSelector(cdp, `#nav-${pageId}`);
}

async function openSettingsPaths(cdp) {
  await navigate(cdp, 'settings');
  await waitForBodyText(cdp, '应用设置');
  await clickSelector(cdp, '[data-settings-tab="paths"]');
  await waitForBodyText(cdp, '选择本地资源库目录');
}

async function selectAsmrRoot(cdp) {
  await openSettingsPaths(cdp);
  await clickVisibleText(cdp, '选择音声库目录', 'button');
  await waitForBodyText(cdp, '已选择目录，可读取已有记录或重新扫描');
  const enabled = await cdp.evaluate(`(() => [...document.querySelectorAll('button')].some((button) => button.offsetParent !== null && button.textContent?.trim() === '读取已有记录' && !button.disabled))()`);
  assert.equal(enabled, true, '目录授权后读取按钮必须启用');
}

async function readAsmrIndex(cdp) {
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((item) => item.offsetParent !== null && item.textContent?.trim() === '读取已有记录' && !item.disabled);
    if (!button) throw new Error('读取已有记录按钮不可用');
    button.click();
    return true;
  })()`);
  await waitForCondition(cdp, `![...document.querySelectorAll('button')].some((button) => button.textContent?.includes('读取中'))`, 15_000, 'index read completion');
}

async function screenshot(cdp, name) {
  const relative = `${name}.png`;
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true });
  fs.writeFileSync(path.join(artifactDir, relative), Buffer.from(result.data, 'base64'));
  report.screenshots.push(relative);
}

async function assertLayout(cdp, label) {
  const result = await cdp.evaluate(`(() => {
    const box = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    };
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      sidebar: box('#app-sidebar'),
      player: box('#app-player-bar'),
      main: box('main'),
      bodyTextLength: document.body?.innerText.length ?? 0,
    };
  })()`);
  assert.ok(result.sidebar?.width > 150 && result.sidebar?.height > 300, `${label}: sidebar 布局异常`);
  assert.ok(result.player?.width > 500 && result.player?.height >= 60, `${label}: PlayerBar 布局异常`);
  assert.ok(result.main?.width > 400 && result.main?.height > 300, `${label}: 主内容布局异常`);
  assert.ok(result.scrollWidth <= result.viewportWidth + 2, `${label}: 页面发生横向溢出`);
  assert.ok(result.bodyTextLength > 100, `${label}: 页面疑似空白或黑屏`);
  return result;
}

async function waitForChildExit(child, timeout) {
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
}

async function assertNoRendererExceptions(runtime, label) {
  assert.deepEqual(runtime.cdp.pageErrors, [], `${label} Renderer exceptions: ${runtime.cdp.pageErrors.join(' | ')}`);
}

async function runEmptyAndRestartScenario(root) {
  const fixtureDir = path.join(root, EMPTY_INDEX_NAME);
  const profileDir = path.join(root, 'profile-empty');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  writeJsonWithBom(path.join(fixtureDir, 'library-index.json'), emptyIndex());

  let runtime = await launchApp(fixtureDir, profileDir);
  try {
    await expectBodyContains(runtime.cdp, '尚未选择资源库');
    await assertLayout(runtime.cdp, '首次启动');
    await screenshot(runtime.cdp, '01-startup-unselected');

    await selectAsmrRoot(runtime.cdp);
    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '等待读取资源库');
    await expectBodyContains(runtime.cdp, '目录已授权');
    await expectBodyExcludes(runtime.cdp, '已连接空资源库');
    await screenshot(runtime.cdp, '02-authorized-unread-home');

    await openSettingsPaths(runtime.cdp);
    await readAsmrIndex(runtime.cdp);
    await waitForBodyText(runtime.cdp, '文件编码：utf8-bom');
    await expectBodyContains(runtime.cdp, '上次已读取「empty-index」：0 个集合，0 条音轨');
    await screenshot(runtime.cdp, '03-empty-index-settings');

    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '已连接空资源库');
    await expectBodyContains(runtime.cdp, '资源库已连接，当前没有音轨');
    await expectBodyContains(runtime.cdp, '已加载 0 条音轨');
    await expectBodyExcludes(runtime.cdp, '尚未读取资源库记录');
    await expectBodyExcludes(runtime.cdp, '等待导入资源库');
    await assertLayout(runtime.cdp, '空 Index 首页');
    await screenshot(runtime.cdp, '04-empty-index-home');

    await navigate(runtime.cdp, 'asmr-lib');
    await waitForBodyText(runtime.cdp, '音声库');
    await expectBodyContains(runtime.cdp, '音声库');
    await assertLayout(runtime.cdp, '空 Index 音声库');
    await screenshot(runtime.cdp, '05-empty-index-asmr');

    await navigate(runtime.cdp, 'music-lib');
    await waitForBodyText(runtime.cdp, '音乐库');
    await expectBodyContains(runtime.cdp, '音乐库');
    await assertLayout(runtime.cdp, '空 Index 音乐库');
    await screenshot(runtime.cdp, '06-empty-index-music');

    await navigate(runtime.cdp, 'settings');
    await waitForBodyText(runtime.cdp, '应用设置');
    await clickVisibleText(runtime.cdp, '打开 AI 维护', 'button');
    await waitForBodyText(runtime.cdp, '日常状态');
    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：0 个音声集合，0 个音乐集合，0 条轨道。');
    assert.equal(await runtime.cdp.evaluate(`document.querySelector('#u28-diagnostics-asmr-count')?.textContent?.trim()`), '0', '诊断页音声作品计数应为 0');
    assert.equal(await runtime.cdp.evaluate(`document.querySelector('#u28-diagnostics-music-count')?.textContent?.trim()`), '0', '诊断页音乐专辑计数应为 0');
    await clickVisibleText(runtime.cdp, '刷新真实资源状态', 'button');
    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：0 个音声集合，0 个音乐集合，0 条轨道。');
    await expectBodyExcludes(runtime.cdp, 'Demo 扫描演示');
    await assertLayout(runtime.cdp, '空 Index 诊断');
    await screenshot(runtime.cdp, '07-empty-index-diagnostics');
    await assertNoRendererExceptions(runtime, 'empty index');
    report.scenarios.push({ name: 'empty-index-current-window', status: 'PASS' });
  } finally {
    await closeApp(runtime);
  }

  const authorizationFile = path.join(profileDir, 'Yang-Kura', 'root-authorizations.json');
  assert.ok(fs.existsSync(authorizationFile), '主进程未持久化 root authorization 文件');
  const authorizationState = JSON.parse(fs.readFileSync(authorizationFile, 'utf8'));
  assert.equal(authorizationState.schemaVersion, 1, 'root authorization schemaVersion 异常');
  assert.equal(authorizationState.records?.length, 1, 'root authorization 记录数量异常');
  assert.ok(authorizationState.records[0].rootPathToken.startsWith('yk-root-'), '持久化 token 格式异常');

  runtime = await launchApp(fixtureDir, profileDir);
  try {
    await waitForBodyText(runtime.cdp, '已连接空资源库');
    await expectBodyContains(runtime.cdp, '已加载 0 条音轨');
    await screenshot(runtime.cdp, '08-restart-authorization-restored');

    await openSettingsPaths(runtime.cdp);
    await waitForBodyText(runtime.cdp, '已选择目录，可读取已有记录或重新扫描');
    const enabled = await runtime.cdp.evaluate(`(() => [...document.querySelectorAll('button')].some((button) => button.offsetParent !== null && button.textContent?.trim() === '读取已有记录' && !button.disabled))()`);
    assert.equal(enabled, true, '重启后读取按钮必须直接可用');
    await readAsmrIndex(runtime.cdp);
    await waitForBodyText(runtime.cdp, '文件编码：utf8-bom');
    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '已连接空资源库');
    await expectBodyContains(runtime.cdp, '已加载 0 条音轨');
    await screenshot(runtime.cdp, '09-restart-reread-empty-index');
    await assertNoRendererExceptions(runtime, 'restart persisted authorization');
    report.scenarios.push({ name: 'restart-persisted-authorization-reread', status: 'PASS' });
  } finally {
    await closeApp(runtime);
  }
}

async function runBrokenJsonScenario(root) {
  const fixtureDir = path.join(root, 'broken-index');
  const profileDir = path.join(root, 'profile-broken');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  fs.writeFileSync(path.join(fixtureDir, 'library-index.json'), Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('{ broken json', 'utf8')]));

  const runtime = await launchApp(fixtureDir, profileDir);
  try {
    await selectAsmrRoot(runtime.cdp);
    await readAsmrIndex(runtime.cdp);
    await waitForBodyText(runtime.cdp, 'JSON 解析失败');
    await expectBodyExcludes(runtime.cdp, 'source stat failed: UNKNOWN');
    await navigate(runtime.cdp, 'dashboard');
    await expectBodyExcludes(runtime.cdp, '已连接空资源库');
    await expectBodyExcludes(runtime.cdp, '已加载 0 条音轨');
    await screenshot(runtime.cdp, '10-broken-json-home');
    await openSettingsPaths(runtime.cdp);
    await screenshot(runtime.cdp, '11-broken-json-settings');
    await assertNoRendererExceptions(runtime, 'broken JSON');
    report.scenarios.push({ name: 'broken-json-classification', status: 'PASS' });
  } finally {
    await closeApp(runtime);
  }
}

async function runPopulatedPlaybackScenario(root) {
  const fixtureDir = path.join(root, POPULATED_INDEX_NAME);
  const profileDir = path.join(root, 'profile-populated');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  const wavSize = writeSilentWav(path.join(fixtureDir, 'sample.wav'));
  writeJsonWithBom(path.join(fixtureDir, 'library-index.json'), emptyIndex());

  let rootPathToken = '';
  let runtime = await launchApp(fixtureDir, profileDir);
  try {
    await selectAsmrRoot(runtime.cdp);
    rootPathToken = await runtime.cdp.evaluate(`(() => { const value = JSON.parse(sessionStorage.getItem(${JSON.stringify(ROOT_SESSION_KEY)}) ?? '{}'); return value.asmr?.rootPathToken ?? ''; })()`);
    assert.ok(rootPathToken.startsWith('yk-root-'), 'E2E 未取得主进程生成的 rootPathToken');
    writeJsonWithBom(path.join(fixtureDir, 'library-index.json'), populatedIndex(rootPathToken, wavSize));

    await readAsmrIndex(runtime.cdp);
    await waitForBodyText(runtime.cdp, '文件编码：utf8-bom');
    await expectBodyContains(runtime.cdp, '1 个集合，1 条音轨');

    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '已连接本地资源库');
    await expectBodyContains(runtime.cdp, '已加载 1 条音轨');
    await expectBodyExcludes(runtime.cdp, '等待导入资源库');
    await screenshot(runtime.cdp, '12-populated-home');

    const mediaProbe = await runtime.cdp.evaluate(`(async () => {
      const url = 'yang-kura-media://track/' + encodeURIComponent(${JSON.stringify(rootPathToken)}) + '/' + encodeURIComponent('sample.wav');
      const response = await fetch(url);
      const body = new Uint8Array(await response.arrayBuffer());
      return { ok: response.ok, status: response.status, byteLength: body.byteLength, riff: String.fromCharCode(...body.slice(0, 4)) };
    })()`, true);
    assert.equal(mediaProbe.ok, true, '受控媒体协议读取失败');
    assert.equal(mediaProbe.status, 200, '受控媒体协议状态码异常');
    assert.equal(mediaProbe.byteLength, wavSize, '受控媒体协议字节数不一致');
    assert.equal(mediaProbe.riff, 'RIFF', '受控媒体协议未返回 WAV');

    await navigate(runtime.cdp, 'asmr-lib');
    await waitForBodyText(runtime.cdp, WORK_TITLE);
    await clickVisibleText(runtime.cdp, WORK_TITLE, '*');
    await waitForBodyText(runtime.cdp, '播放全部音声');
    await clickSelector(runtime.cdp, '#play-all-asmr');
    await waitForBodyText(runtime.cdp, TRACK_TITLE);
    await delay(900);
    const playerText = await runtime.cdp.evaluate(`document.querySelector('#app-player-bar')?.innerText ?? ''`);
    assert.ok(playerText.includes(TRACK_TITLE), 'PlayerBar 未显示真实 Index 音轨');
    assert.ok(!playerText.includes('播放失败：'), `真实 WAV 播放失败：${playerText}`);
    const hasPlaybackControl = await runtime.cdp.evaluate(`Boolean(document.querySelector('#app-player-bar button[aria-label="暂停"], #app-player-bar button[aria-label="播放"]'))`);
    assert.equal(hasPlaybackControl, true, 'PlayerBar 播放控制不可用');
    await assertLayout(runtime.cdp, '真实音轨播放');
    await screenshot(runtime.cdp, '13-populated-playback');

    await navigate(runtime.cdp, 'settings');
    await waitForBodyText(runtime.cdp, '应用设置');
    await clickVisibleText(runtime.cdp, '打开 AI 维护', 'button');
    await waitForBodyText(runtime.cdp, '日常状态');
    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：1 个音声集合，0 个音乐集合，1 条轨道。');
    await clickVisibleText(runtime.cdp, '刷新真实资源状态', 'button');
    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：1 个音声集合，0 个音乐集合，1 条轨道。');
    await screenshot(runtime.cdp, '14-populated-diagnostics');
    await assertNoRendererExceptions(runtime, 'populated playback');
    report.scenarios.push({ name: 'populated-index-media-playback', status: 'PASS', mediaProbe });
  } finally {
    await closeApp(runtime);
  }

  runtime = await launchApp(fixtureDir, profileDir);
  try {
    await waitForBodyText(runtime.cdp, '已连接本地资源库');
    await expectBodyContains(runtime.cdp, '已加载 1 条音轨');
    const restartMediaProbe = await runtime.cdp.evaluate(`(async () => {
      const url = 'yang-kura-media://track/' + encodeURIComponent(${JSON.stringify(rootPathToken)}) + '/' + encodeURIComponent('sample.wav');
      const response = await fetch(url);
      const body = new Uint8Array(await response.arrayBuffer());
      return { ok: response.ok, status: response.status, byteLength: body.byteLength, riff: String.fromCharCode(...body.slice(0, 4)) };
    })()`, true);
    assert.equal(restartMediaProbe.ok, true, '重启后受控媒体协议读取失败');
    assert.equal(restartMediaProbe.status, 200, '重启后媒体协议状态码异常');
    assert.equal(restartMediaProbe.byteLength, wavSize, '重启后媒体协议字节数不一致');
    assert.equal(restartMediaProbe.riff, 'RIFF', '重启后媒体协议未返回 WAV');

    await navigate(runtime.cdp, 'asmr-lib');
    await waitForBodyText(runtime.cdp, WORK_TITLE);
    await clickVisibleText(runtime.cdp, WORK_TITLE, '*');
    await waitForBodyText(runtime.cdp, '播放全部音声');
    await clickSelector(runtime.cdp, '#play-all-asmr');
    await waitForBodyText(runtime.cdp, TRACK_TITLE);
    await delay(900);
    const restartPlayerText = await runtime.cdp.evaluate(`document.querySelector('#app-player-bar')?.innerText ?? ''`);
    assert.ok(restartPlayerText.includes(TRACK_TITLE), '重启后 PlayerBar 未显示真实音轨');
    assert.ok(!restartPlayerText.includes('播放失败：'), `重启后真实 WAV 播放失败：${restartPlayerText}`);
    await screenshot(runtime.cdp, '15-populated-restart-playback');
    await assertNoRendererExceptions(runtime, 'populated restart playback');
    report.scenarios.push({ name: 'restart-persisted-authorization-playback', status: 'PASS', restartMediaProbe });
  } finally {
    await closeApp(runtime);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u28-e2e-'));
try {
  await runEmptyAndRestartScenario(tempRoot);
  await runBrokenJsonScenario(tempRoot);
  await runPopulatedPlaybackScenario(tempRoot);
  report.status = 'PASS';
  fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log('U28 Electron full-chain E2E PASS');
  for (const scenario of report.scenarios) console.log(`PASS\t${scenario.name}`);
} catch (error) {
  report.status = 'FAIL';
  report.error = error instanceof Error ? error.message : String(error);
  fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.error(error);
  process.exitCode = 1;
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
