#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u32-ui-audit');
fs.mkdirSync(artifactDir, { recursive: true });
const report = { status: 'running', head: process.env.GITHUB_SHA ?? null, screenshots: [], pages: [], consoleErrors: [] };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  constructor(url) { this.url = url; this.socket = null; this.nextId = 1; this.pending = new Map(); this.errors = []; }
  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connection timeout')), 15_000);
      this.socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connection failed')); }, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message)); else pending.resolve(payload.result);
        return;
      }
      if (payload.method === 'Runtime.exceptionThrown') this.errors.push(payload.params?.exceptionDetails?.text ?? 'Runtime exception');
      if (payload.method === 'Runtime.consoleAPICalled' && payload.params?.type === 'error') {
        this.errors.push((payload.params.args ?? []).map((item) => item.value ?? item.description ?? '').join(' '));
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
    const response = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    return response.result?.value;
  }
  close() { try { this.socket?.close(); } catch {} }
}

async function waitForTarget(port, child) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Electron exited before CDP attached: ${child.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const target = (await response.json()).find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
        if (target) return target.webSocketDebuggerUrl;
      }
    } catch {}
    await delay(200);
  }
  throw new Error('Electron CDP target timeout');
}

async function waitFor(cdp, expression, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(120);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function click(cdp, selector) {
  await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing selector: ${selector}'); element.click(); return true; })()`);
  await delay(260);
}

async function clickButtonByText(cdp, text) {
  await cdp.evaluate(`(() => { const element = [...document.querySelectorAll('button')].find((item) => item.textContent?.trim().includes(${JSON.stringify(text)})); if (!element) throw new Error('Missing button text: ${text}'); element.click(); return true; })()`);
  await delay(260);
}

async function screenshot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const file = `${name}.png`;
  fs.writeFileSync(path.join(artifactDir, file), Buffer.from(result.data, 'base64'));
  report.screenshots.push(file);
}

async function capturePage(cdp, pageId, fileName, readyExpression) {
  await click(cdp, `#nav-${pageId}`);
  await waitFor(cdp, `document.querySelector('#nav-${pageId}')?.getAttribute('aria-current') === 'page'`, `${pageId} active`);
  if (readyExpression) await waitFor(cdp, readyExpression, `${pageId} ready`);
  const metrics = await cdp.evaluate(`(() => {
    const main = document.querySelector('main');
    const buttons = [...main.querySelectorAll('button')].filter((item) => item.getBoundingClientRect().height > 0);
    return {
      pageId: ${JSON.stringify(pageId)},
      title: main.querySelector('h1,h2')?.textContent?.trim() ?? '',
      visibleButtonCount: buttons.length,
      mainScrollHeight: main.scrollHeight,
      mainClientHeight: main.clientHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      buttonHeights: [...new Set(buttons.map((item) => Math.round(item.getBoundingClientRect().height)))].sort((a, b) => a - b),
    };
  })()`);
  assert.equal(metrics.horizontalOverflow, false, `${pageId} has no horizontal overflow`);
  report.pages.push(metrics);
  await screenshot(cdp, fileName);
}

function electronExecutable() {
  const executable = path.join(cwd, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
  if (!fs.existsSync(executable)) throw new Error(`Electron binary missing: ${executable}`);
  return executable;
}

const makeTrack = (id, title, artist, album, type, duration, rjId) => ({
  id, title, artist, album, duration, coverUrl: '', type, rjId,
  playbackSourceKind: 'tokenized-local-file', externalOpenSourceKind: 'tokenized-local-file', rootPathToken: 'u32-audit-root',
  sourceRelativePath: `${type}/${id}.wav`, fileTreePath: `${type}/${id}.wav`,
  fileSize: `${Math.max(1, Math.round(duration / 60))} MB`,
  subtitleRelativePaths: [`${type}/${id}.ja.lrc`, `${type}/${id}.zh.lrc`],
  addedAt: '2026-07-01T00:00:00.000Z',
});
const asmrTracks = [
  makeTrack('a-01', '01 双耳轻声与雨夜陪伴', '月白音声', '雨宿りの夜', 'asmr', 1680, 'RJ410001'),
  makeTrack('a-02', '02 梵天与耳部按摩', '月白音声', '雨宿りの夜', 'asmr', 1420, 'RJ410001'),
  makeTrack('a-03', '01 深夜图书馆的悄悄话', '白河ゆき', '閉館後の図書室', 'asmr', 2100, 'RJ410002'),
  makeTrack('a-04', '01 猫咖店员的午后护理', '星野こはる', 'ねこカフェ休憩室', 'asmr', 1860, 'RJ410003'),
];
const musicTracks = [
  makeTrack('m-01', 'Blue Hour', 'Mina Aoki', 'City Lights', 'music', 244),
  makeTrack('m-02', 'Last Train Home', 'Mina Aoki', 'City Lights', 'music', 218),
  makeTrack('m-03', 'Pine Echo', 'Kaito Mori', 'Forest Signals', 'music', 201),
  makeTrack('m-04', 'Dawn Path', 'Kaito Mori', 'Forest Signals', 'music', 232),
];
const works = [
  { id: 'RJ410001', title: '雨宿りの夜', circle: '月白音声', cvs: ['月白りん'], tags: ['雨声', '耳语'], tracks: asmrTracks.slice(0, 2), personalStatus: 'listening' },
  { id: 'RJ410002', title: '閉館後の図書室', circle: 'Librarium', cvs: ['白河ゆき'], tags: ['图书馆', '低语'], tracks: asmrTracks.slice(2, 3), personalStatus: 'unheard' },
  { id: 'RJ410003', title: 'ねこカフェ休憩室', circle: '午後三時', cvs: ['星野こはる'], tags: ['猫咖', '按摩'], tracks: asmrTracks.slice(3, 4), personalStatus: 'completed' },
].map((work, index) => ({
  ...work, releaseDate: `2026-0${index + 1}-12`, coverUrl: '', status: 'identified',
  fileCount: work.tracks.length, totalDuration: work.tracks.reduce((sum, track) => sum + track.duration, 0),
  description: '用于发布候选视觉审查的本地样本作品。', rating: 5 - index,
  addedAt: `2026-07-0${index + 1}T00:00:00.000Z`,
}));
const albums = [
  { id: 'album-1', title: 'City Lights', artist: 'Mina Aoki', releaseYear: '2026', genre: 'City Pop', coverUrl: '', tracks: musicTracks.slice(0, 2) },
  { id: 'album-2', title: 'Forest Signals', artist: 'Kaito Mori', releaseYear: '2025', genre: 'Ambient', coverUrl: '', tracks: musicTracks.slice(2, 4) },
];
const playlists = [{
  id: 'playlist-night', name: '夜间放松', description: 'ASMR 与安静音乐混合播放', coverUrl: '', creator: '本地用户',
  tracksCount: 1, tracks: [musicTracks[0]], isSystem: false, sourceKind: 'user-local',
}];
const seed = { asmrTracks, musicTracks, works, albums, playlists };

const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u32-ui-audit-'));
const port = await reservePort();
const child = spawn(electronExecutable(), [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')], {
  cwd,
  env: { ...process.env, APPDATA: profileDir, LOCALAPPDATA: profileDir, YANG_KURA_ELECTRON_DEV: '0', YANG_KURA_E2E_MODE: '1', ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: false,
});
const stdout = []; const stderr = [];
child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
child.stderr.on('data', (chunk) => stderr.push(String(chunk)));
let cdp;

try {
  cdp = new CdpClient(await waitForTarget(port, child));
  await cdp.connect();
  await waitFor(cdp, "document.querySelector('#windows-app-bar')", 'application shell');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1.25, mobile: false });

  await cdp.evaluate(`(() => {
    const seed = ${JSON.stringify(seed)}; const now = new Date().toISOString();
    localStorage.removeItem('yang_kura_last_read_library_index_result');
    localStorage.removeItem('yang_kura_metadata_overrides_v1');
    localStorage.setItem('sqlite_rj_works', JSON.stringify(seed.works));
    localStorage.setItem('sqlite_music_albums', JSON.stringify(seed.albums));
    localStorage.setItem('sqlite_favorites', JSON.stringify(['m-01']));
    localStorage.setItem('yang_kura_user_playlists_v1', JSON.stringify({ version: 1, updatedAt: now, playlists: seed.playlists }));
    localStorage.setItem('sqlite_settings', JSON.stringify({audioLibPath:'<已授权本地音声库>',musicLibPath:'<已授权本地音乐库>',asmrPaths:[],musicPaths:[],tempDownloadPath:'<未设置>',currentTheme:'acrylic-mist',enableOverlay:true,privacyMode:true}));
    sessionStorage.setItem('yang_kura_u28_authorized_roots_v1', JSON.stringify({ mixed:{rootPathToken:'u32-audit-root',displayName:'U32 视觉审查媒体库',libraryType:'mixed'} }));
    localStorage.setItem('yang_kura_library_session_v1', JSON.stringify({version:1,updatedAt:now,selectedRoots:{mixed:{libraryType:'mixed',displayName:'U32 视觉审查媒体库',selectedAt:now}},lastIndex:{libraryType:'mixed',displayName:'U32 视觉审查媒体库',indexRelativePath:'library-index.json',readAt:now,generatedAt:now,rootCount:1,collectionCount:5,trackCount:8,warningCount:0}}));
    localStorage.setItem('yang_kura_player_queue_v1', JSON.stringify({version:1,updatedAt:now,queue:[seed.asmrTracks[0],seed.musicTracks[0]],currentTrackId:seed.asmrTracks[0].id,currentIndex:0,progress:462,volume:0.72,isMuted:false,loopMode:'all',playCompletionMode:'continue-queue'}));
    localStorage.setItem('last_played_track_id', seed.asmrTracks[0].id);
    localStorage.setItem('last_played_progress', '462');
    localStorage.setItem('last_played_track_json', JSON.stringify(seed.asmrTracks[0]));
    location.reload(); return true;
  })()`);

  await waitFor(cdp, "document.querySelector('#app-player-bar')?.dataset.u29TrackId === 'a-01'", 'seeded player');
  assert.equal(await cdp.evaluate("document.querySelector('#sidebar-ai-maintenance-toggle')?.offsetParent === null"), true, 'engineering maintenance toggle is hidden');
  assert.equal(await cdp.evaluate("document.querySelector('#nav-diagnostics')?.offsetParent === null && document.querySelector('#nav-downloader')?.offsetParent === null"), true, 'engineering routes are hidden');

  await capturePage(cdp, 'dashboard', '01-dashboard-after', "document.querySelector('[data-u37b-home=\"daily\"]')");
  assert.equal(await cdp.evaluate("document.querySelector('#mvp45-home-recent-listening')?.getBoundingClientRect().top < innerHeight"), true, 'recent listening enters first viewport');

  await capturePage(cdp, 'asmr-lib', '02-asmr-library-after', "document.querySelector('[data-u37b-asmr-library=\"grid\"]')");
  assert.equal(await cdp.evaluate("document.querySelectorAll('[data-u37b-asmr-card]').length >= 3"), true, 'U37-B ASMR cards render seeded works');

  const selectedCount = await cdp.evaluate(`(() => {
    const boxes = [...document.querySelectorAll('[data-u37b-asmr-card] input[type="checkbox"]')].slice(0, 2);
    boxes.forEach((box) => box.click());
    return boxes.length;
  })()`);
  assert.equal(selectedCount, 2, 'two ASMR works selected');
  await waitFor(cdp, "document.querySelector('.u37b-selection-bar')?.textContent?.includes('已选择 2 个作品')", 'selection count');
  await clickButtonByText(cdp, '批量加入歌单');
  await waitFor(cdp, "document.body.innerText.includes('已将 2 个作品加入')", 'bulk playlist feedback');
  await waitFor(cdp, "JSON.parse(localStorage.getItem('yang_kura_user_playlists_v1') ?? '{}').playlists?.find((item) => item.id === 'playlist-night')?.tracksCount >= 3", 'bulk playlist persistence');

  await click(cdp, '[data-u37b-asmr-card="RJ410001"]');
  await waitFor(cdp, "document.querySelector('[data-u37c-rj-detail=\"ready\"]')", 'U37-C RJ detail');
  assert.equal(await cdp.evaluate("document.querySelectorAll('.u37c-rj-track-list .yk-track-row').length === 2"), true, 'RJ detail uses shared TrackRow entries');
  assert.equal(await cdp.evaluate("document.querySelector('.u37c-rj-overview')?.textContent?.includes('有字幕音轨')"), true, 'RJ detail shows subtitle health');
  await screenshot(cdp, '02c-rj-detail-tracks-after');

  await clickButtonByText(cdp, '作品信息与个人记录');
  await waitFor(cdp, "document.querySelector('.u37c-personal-panel')", 'RJ personal panel');
  await clickButtonByText(cdp, '已完成');
  await waitFor(cdp, "JSON.parse(localStorage.getItem('yang_kura_metadata_overrides_v1') ?? '{}').asmrWorks?.RJ410001?.personalStatus === 'completed'", 'RJ personal status persistence');
  await screenshot(cdp, '02d-rj-detail-info-after');

  await clickButtonByText(cdp, '编辑作品信息');
  await waitFor(cdp, "document.querySelector('[data-u37c-metadata-editor=\"ready\"]')", 'RJ metadata dialog');
  assert.equal(await cdp.evaluate("document.querySelector('[data-testid=\"mvp117-single-rj-provider-preview\"]') !== null"), true, 'provider preview remains available');
  await cdp.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
  await waitFor(cdp, "!document.querySelector('[data-u37c-metadata-editor=\"ready\"]')", 'metadata dialog closes with Escape');
  await clickButtonByText(cdp, '返回音声库');
  await waitFor(cdp, "document.querySelector('[data-u37b-asmr-library]')", 'return to ASMR library');

  await click(cdp, '[aria-label="列表浏览"]');
  await waitFor(cdp, "document.querySelector('[data-u37b-asmr-library=\"list\"] .u37b-asmr-list')", 'ASMR list view');
  await screenshot(cdp, '02e-asmr-library-list-after');

  await capturePage(cdp, 'music-lib', '03-music-library-tracks-after', "document.querySelector('[data-u37d-music-library=\"tracks\"]')");
  assert.equal(await cdp.evaluate("document.querySelectorAll('[data-u37d-track-row]').length === 4"), true, 'U37-D music track list renders seeded tracks');

  const selectedMusicCount = await cdp.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('[data-u37d-track-row] button[aria-label^="选择 "]')].slice(0, 2);
    buttons.forEach((button) => button.click());
    return buttons.length;
  })()`);
  assert.equal(selectedMusicCount, 2, 'two music tracks selected');
  await waitFor(cdp, "document.querySelector('.u37d-selection-bar')?.textContent?.includes('已选择 2 首')", 'music selection count');
  await clickButtonByText(cdp, '批量加入队列');
  await waitFor(cdp, "document.querySelector('#app-player-bar')?.dataset.u29QueueCount === '4'", 'music batch queue state');

  await click(cdp, '[data-u37d-view="albums"]');
  await waitFor(cdp, "document.querySelectorAll('[data-u37d-collection-grid=\"albums\"] [data-u37d-collection-card]').length === 2", 'album cards');
  await screenshot(cdp, '03b-music-albums-after');
  await click(cdp, '[data-u37d-collection-card="album:album-1"]');
  await waitFor(cdp, "document.querySelector('[data-u37d-detail=\"album\"]')", 'album detail');
  assert.equal(await cdp.evaluate("document.querySelectorAll('[data-u37d-track-row]').length === 2"), true, 'album detail shows two tracks');
  await screenshot(cdp, '03c-music-album-detail-after');
  await clickButtonByText(cdp, '返回专辑');
  await waitFor(cdp, "document.querySelector('[data-u37d-music-library=\"albums\"]')", 'return to albums');

  await click(cdp, '[data-u37d-view="artists"]');
  await waitFor(cdp, "document.querySelectorAll('[data-u37d-collection-grid=\"artists\"] [data-u37d-collection-card]').length === 2", 'artist cards');
  await click(cdp, '[data-u37d-collection-card="artist:Mina Aoki"]');
  await waitFor(cdp, "document.querySelector('[data-u37d-detail=\"artist\"]')", 'artist detail');
  await screenshot(cdp, '03d-music-artist-detail-after');
  await clickButtonByText(cdp, '返回艺术家');

  await click(cdp, '[data-u37d-view="folders"]');
  await waitFor(cdp, "document.querySelectorAll('[data-u37d-collection-grid=\"folders\"] [data-u37d-collection-card]').length === 2", 'folder cards');
  await click(cdp, '[data-u37d-collection-card="folder:album-2"]');
  await waitFor(cdp, "document.querySelector('[data-u37d-detail=\"folder\"]')", 'folder detail');
  await screenshot(cdp, '03e-music-folder-detail-after');
  await clickButtonByText(cdp, '返回文件夹');

  await click(cdp, '[data-u37d-view="tracks"]');
  await clickButtonByText(cdp, '仅看收藏');
  await waitFor(cdp, "document.querySelectorAll('[data-u37d-track-row]').length === 1", 'favorite-only track filter');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1040, height: 680, deviceScaleFactor: 1, mobile: false });
  await waitFor(cdp, "document.querySelector('[data-u37d-music-library=\"tracks\"]') && document.documentElement.scrollWidth <= innerWidth + 1", 'narrow music library');
  await screenshot(cdp, '03f-music-library-narrow-after');

  await capturePage(cdp, 'playlists', '04-playlists-after');
  assert.equal(await cdp.evaluate("getComputedStyle(document.querySelector('#mvp53-playlist-visual-unity')).display === 'none'"), true, 'playlist engineering summary hidden');
  await capturePage(cdp, 'importer', '05-importer-after');
  assert.equal(await cdp.evaluate("(() => { const element = document.querySelector('#u41b-importer-primary-flow'); return element instanceof Element && getComputedStyle(element).display !== 'none'; })()"), true, 'importer instructional wall hidden');
  await capturePage(cdp, 'settings', '06-settings-after');
  assert.equal(await cdp.evaluate("Math.max(...[...document.querySelectorAll('[data-settings-tab]')].map((item) => item.getBoundingClientRect().height)) <= 48"), true, 'settings tabs remain compact');
  await capturePage(cdp, 'settings', '07-settings-narrow-after');
  assert.deepEqual(cdp.errors, [], 'renderer has no runtime or console errors');
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  report.stdout = stdout.join(''); report.stderr = stderr.join(''); report.consoleErrors = cdp?.errors ?? [];
  fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  cdp?.close(); if (child.exitCode === null) child.kill(); await delay(300);
  fs.rmSync(profileDir, { recursive: true, force: true });
}

console.log('U32 UI visual audit capture PASS');
