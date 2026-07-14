#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { _electron as electron } from 'playwright-core';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u28-electron-e2e');
fs.mkdirSync(artifactDir, { recursive: true });

const EMPTY_INDEX_NAME = 'empty-index';
const POPULATED_INDEX_NAME = 'populated-index';
const WORK_TITLE = 'U28 E2E 音声作品';
const TRACK_TITLE = 'U28 E2E 测试音轨';
const ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';
const report = { status: 'running', scenarios: [], screenshots: [] };

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

async function launchApp(fixtureDir, profileDir) {
  const pageErrors = [];
  const consoleErrors = [];
  const app = await electron.launch({
    cwd,
    args: [path.join(cwd, 'dist-electron', 'main.js')],
    env: {
      ...process.env,
      APPDATA: profileDir,
      LOCALAPPDATA: profileDir,
      YANG_KURA_ELECTRON_DEV: '0',
      YANG_KURA_E2E_MODE: '1',
      YANG_KURA_E2E_LIBRARY_ROOT: fixtureDir,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
    timeout: 45_000,
  });
  const page = await app.firstWindow({ timeout: 30_000 });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.waitForSelector('#windows-app-bar', { timeout: 30_000 });
  return { app, page, pageErrors, consoleErrors };
}

async function waitForBodyText(page, expected, timeout = 15_000) {
  await page.waitForFunction(
    (text) => document.body?.innerText.includes(text),
    expected,
    { timeout },
  );
}

async function expectBodyContains(page, expected) {
  const body = await page.locator('body').innerText();
  assert.ok(body.includes(expected), `页面应包含：${expected}`);
  return body;
}

async function expectBodyExcludes(page, unexpected) {
  const body = await page.locator('body').innerText();
  assert.ok(!body.includes(unexpected), `页面不应包含：${unexpected}`);
}

async function navigate(page, pageId) {
  await page.locator(`#nav-${pageId}`).click();
  await page.waitForTimeout(150);
}

async function openSettingsPaths(page) {
  await navigate(page, 'settings');
  const pathTab = page.getByRole('button', { name: /资源库目录/ }).first();
  await pathTab.click();
  await waitForBodyText(page, '选择本地资源库目录');
}

async function selectAsmrRoot(page) {
  await openSettingsPaths(page);
  await page.getByRole('button', { name: '选择音声库目录' }).click();
  await waitForBodyText(page, '已选择目录，可读取已有记录或重新扫描');
  const readButton = page.getByRole('button', { name: '读取已有记录' }).first();
  assert.equal(await readButton.isDisabled(), false, '目录授权后读取按钮必须启用');
}

async function readAsmrIndex(page) {
  const readButton = page.getByRole('button', { name: '读取已有记录' }).first();
  await readButton.click();
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].some((button) => button.textContent?.includes('读取中')), null, { timeout: 15_000 });
}

async function screenshot(page, name) {
  const relative = `${name}.png`;
  await page.screenshot({ path: path.join(artifactDir, relative), fullPage: true });
  report.screenshots.push(relative);
}

async function assertLayout(page, label) {
  const result = await page.evaluate(() => {
    const sidebar = document.querySelector('#app-sidebar')?.getBoundingClientRect();
    const player = document.querySelector('#app-player-bar')?.getBoundingClientRect();
    const main = document.querySelector('main')?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      sidebar: sidebar ? { width: sidebar.width, height: sidebar.height, left: sidebar.left, right: sidebar.right } : null,
      player: player ? { width: player.width, height: player.height, top: player.top, bottom: player.bottom } : null,
      main: main ? { width: main.width, height: main.height, left: main.left, right: main.right } : null,
      bodyTextLength: document.body?.innerText.length ?? 0,
    };
  });
  assert.ok(result.sidebar && result.sidebar.width > 150 && result.sidebar.height > 300, `${label}: sidebar 布局异常`);
  assert.ok(result.player && result.player.width > 500 && result.player.height >= 60, `${label}: PlayerBar 布局异常`);
  assert.ok(result.main && result.main.width > 400 && result.main.height > 300, `${label}: 主内容布局异常`);
  assert.ok(result.scrollWidth <= result.viewportWidth + 2, `${label}: 页面发生横向溢出`);
  assert.ok(result.bodyTextLength > 100, `${label}: 页面疑似空白/黑屏`);
  return result;
}

async function closeAndAssertClean(app) {
  await app.close();
}

async function runEmptyAndRestartScenario(root) {
  const fixtureDir = path.join(root, EMPTY_INDEX_NAME);
  const profileDir = path.join(root, 'profile-empty');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  writeJsonWithBom(path.join(fixtureDir, 'library-index.json'), emptyIndex());

  let runtime = await launchApp(fixtureDir, profileDir);
  try {
    await expectBodyContains(runtime.page, '尚未选择资源库');
    await assertLayout(runtime.page, '首次启动');
    await screenshot(runtime.page, '01-startup-unselected');

    await selectAsmrRoot(runtime.page);
    await navigate(runtime.page, 'dashboard');
    await waitForBodyText(runtime.page, '等待读取资源库');
    await expectBodyContains(runtime.page, '目录已授权');
    await expectBodyExcludes(runtime.page, '已连接空资源库');
    await screenshot(runtime.page, '02-authorized-unread-home');

    await openSettingsPaths(runtime.page);
    await readAsmrIndex(runtime.page);
    await waitForBodyText(runtime.page, '文件编码：utf8-bom');
    await expectBodyContains(runtime.page, '上次已读取「empty-index」：0 个集合，0 条音轨');
    await screenshot(runtime.page, '03-empty-index-settings');

    await navigate(runtime.page, 'dashboard');
    await waitForBodyText(runtime.page, '已连接空资源库');
    await expectBodyContains(runtime.page, '资源库已连接，当前没有音轨');
    await expectBodyContains(runtime.page, '已加载 0 条音轨');
    await expectBodyExcludes(runtime.page, '尚未读取资源库记录');
    await expectBodyExcludes(runtime.page, '等待导入资源库');
    await assertLayout(runtime.page, '空 Index 首页');
    await screenshot(runtime.page, '04-empty-index-home');

    await navigate(runtime.page, 'asmr-lib');
    await expectBodyContains(runtime.page, '音声库');
    await assertLayout(runtime.page, '空 Index 音声库');
    await screenshot(runtime.page, '05-empty-index-asmr');

    await navigate(runtime.page, 'music-lib');
    await expectBodyContains(runtime.page, '音乐库');
    await assertLayout(runtime.page, '空 Index 音乐库');
    await screenshot(runtime.page, '06-empty-index-music');

    await runtime.page.locator('#sidebar-ai-maintenance-toggle').click();
    await navigate(runtime.page, 'diagnostics');
    await waitForBodyText(runtime.page, '已从真实 Index 映射 0 个音声作品、0 个音乐专辑');
    await expectBodyContains(runtime.page, '音声作品\n0');
    await expectBodyContains(runtime.page, '音乐专辑\n0');
    await expectBodyExcludes(runtime.page, 'Demo 扫描演示');
    await assertLayout(runtime.page, '空 Index 诊断');
    await screenshot(runtime.page, '07-empty-index-diagnostics');

    assert.deepEqual(runtime.pageErrors, [], `空 Index 页面错误：${runtime.pageErrors.join(' | ')}`);
    report.scenarios.push({ name: 'empty-index-current-window', status: 'PASS' });
  } finally {
    await closeAndAssertClean(runtime.app);
  }

  runtime = await launchApp(fixtureDir, profileDir);
  try {
    await waitForBodyText(runtime.page, '资源库待重新连接');
    await expectBodyExcludes(runtime.page, '已加载 0 条音轨');
    await expectBodyExcludes(runtime.page, '已连接空资源库');
    await screenshot(runtime.page, '08-restart-reauthorization-required');

    await selectAsmrRoot(runtime.page);
    await navigate(runtime.page, 'dashboard');
    await waitForBodyText(runtime.page, '等待读取资源库');
    await expectBodyExcludes(runtime.page, '已连接空资源库');

    await openSettingsPaths(runtime.page);
    await readAsmrIndex(runtime.page);
    await waitForBodyText(runtime.page, '文件编码：utf8-bom');
    await navigate(runtime.page, 'dashboard');
    await waitForBodyText(runtime.page, '已连接空资源库');
    await expectBodyContains(runtime.page, '已加载 0 条音轨');
    await screenshot(runtime.page, '09-restart-reread-empty-index');
    assert.deepEqual(runtime.pageErrors, [], `重启页面错误：${runtime.pageErrors.join(' | ')}`);
    report.scenarios.push({ name: 'restart-reauthorize-reread', status: 'PASS' });
  } finally {
    await closeAndAssertClean(runtime.app);
  }
}

async function runBrokenJsonScenario(root) {
  const fixtureDir = path.join(root, 'broken-index');
  const profileDir = path.join(root, 'profile-broken');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  fs.writeFileSync(path.join(fixtureDir, 'library-index.json'), Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]),
    Buffer.from('{ broken json', 'utf8'),
  ]));

  const runtime = await launchApp(fixtureDir, profileDir);
  try {
    await selectAsmrRoot(runtime.page);
    await readAsmrIndex(runtime.page);
    await waitForBodyText(runtime.page, 'JSON 解析失败');
    await expectBodyExcludes(runtime.page, 'source stat failed: UNKNOWN');
    await navigate(runtime.page, 'dashboard');
    await expectBodyExcludes(runtime.page, '已连接空资源库');
    await expectBodyExcludes(runtime.page, '已加载 0 条音轨');
    await screenshot(runtime.page, '10-broken-json-home');
    await openSettingsPaths(runtime.page);
    await screenshot(runtime.page, '11-broken-json-settings');
    assert.deepEqual(runtime.pageErrors, [], `损坏 JSON 页面错误：${runtime.pageErrors.join(' | ')}`);
    report.scenarios.push({ name: 'broken-json-classification', status: 'PASS' });
  } finally {
    await closeAndAssertClean(runtime.app);
  }
}

async function runPopulatedPlaybackScenario(root) {
  const fixtureDir = path.join(root, POPULATED_INDEX_NAME);
  const profileDir = path.join(root, 'profile-populated');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  const wavSize = writeSilentWav(path.join(fixtureDir, 'sample.wav'));
  writeJsonWithBom(path.join(fixtureDir, 'library-index.json'), emptyIndex());

  const runtime = await launchApp(fixtureDir, profileDir);
  try {
    await selectAsmrRoot(runtime.page);
    const rootPathToken = await runtime.page.evaluate((key) => {
      const value = JSON.parse(sessionStorage.getItem(key) ?? '{}');
      return value.asmr?.rootPathToken ?? '';
    }, ROOT_SESSION_KEY);
    assert.ok(rootPathToken.startsWith('yk-root-'), 'E2E 未取得主进程生成的 rootPathToken');
    writeJsonWithBom(path.join(fixtureDir, 'library-index.json'), populatedIndex(rootPathToken, wavSize));

    await readAsmrIndex(runtime.page);
    await waitForBodyText(runtime.page, '文件编码：utf8-bom');
    await expectBodyContains(runtime.page, '1 个集合，1 条音轨');

    await navigate(runtime.page, 'dashboard');
    await waitForBodyText(runtime.page, '已连接本地资源库');
    await expectBodyContains(runtime.page, '已加载 1 条音轨');
    await expectBodyExcludes(runtime.page, '等待导入资源库');
    await screenshot(runtime.page, '12-populated-home');

    const mediaProbe = await runtime.page.evaluate(async ({ token }) => {
      const url = `yang-kura-media://track/${encodeURIComponent(token)}/${encodeURIComponent('sample.wav')}`;
      const response = await fetch(url);
      const body = new Uint8Array(await response.arrayBuffer());
      return {
        ok: response.ok,
        status: response.status,
        byteLength: body.byteLength,
        riff: String.fromCharCode(...body.slice(0, 4)),
      };
    }, { token: rootPathToken });
    assert.equal(mediaProbe.ok, true, '受控媒体协议读取失败');
    assert.equal(mediaProbe.status, 200, '受控媒体协议状态码异常');
    assert.equal(mediaProbe.byteLength, wavSize, '受控媒体协议字节数不一致');
    assert.equal(mediaProbe.riff, 'RIFF', '受控媒体协议未返回 WAV');

    await navigate(runtime.page, 'asmr-lib');
    await waitForBodyText(runtime.page, WORK_TITLE);
    await runtime.page.getByText(WORK_TITLE, { exact: true }).first().click();
    await waitForBodyText(runtime.page, '播放全部音声');
    await runtime.page.locator('#play-all-asmr').click();
    await waitForBodyText(runtime.page, TRACK_TITLE);
    await runtime.page.waitForTimeout(900);
    const playerText = await runtime.page.locator('#app-player-bar').innerText();
    assert.ok(playerText.includes(TRACK_TITLE), 'PlayerBar 未显示真实 Index 音轨');
    assert.ok(!playerText.includes('播放失败：'), `真实 WAV 播放失败：${playerText}`);
    const playButton = runtime.page.locator('#app-player-bar button[aria-label="暂停"], #app-player-bar button[aria-label="播放"]');
    assert.ok(await playButton.count() > 0, 'PlayerBar 播放控制不可用');
    await assertLayout(runtime.page, '真实音轨播放');
    await screenshot(runtime.page, '13-populated-playback');

    await runtime.page.locator('#sidebar-ai-maintenance-toggle').click();
    await navigate(runtime.page, 'diagnostics');
    await waitForBodyText(runtime.page, '已从真实 Index 映射 1 个音声作品、0 个音乐专辑');
    await screenshot(runtime.page, '14-populated-diagnostics');
    assert.deepEqual(runtime.pageErrors, [], `非空 Index 页面错误：${runtime.pageErrors.join(' | ')}`);
    report.scenarios.push({ name: 'populated-index-media-playback', status: 'PASS', mediaProbe });
  } finally {
    await closeAndAssertClean(runtime.app);
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
