#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'k2-r5-reference-screenshots');
fs.rmSync(artifactDir, { recursive: true, force: true });
fs.mkdirSync(artifactDir, { recursive: true });

const MUSIC_ALBUMS_KEY = 'sqlite_music_albums';
const FAVORITES_KEY = 'sqlite_favorites';
const SETTINGS_KEY = 'sqlite_settings';
const QUEUE_KEY = 'yang_kura_player_queue_v1';

const report = {
  status: 'running',
  driver: 'electron-chromium-cdp',
  sample: 'k2-r5-reference-derived-music-v1',
  screenshots: [],
  layouts: [],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function svgCover(title, subtitle, background, foreground = '#f5f2ec') {
  const safeTitle = title.replace(/[<>&"]/g, '');
  const safeSubtitle = subtitle.replace(/[<>&"]/g, '');
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">',
    '<rect width="800" height="800" rx="26" fill="' + background + '"/>',
    '<circle cx="650" cy="150" r="170" fill="rgba(255,255,255,0.055)"/>',
    '<path d="M-40 620 C180 430 330 780 840 470 L840 840 L-40 840 Z" fill="rgba(0,0,0,0.16)"/>',
    '<text x="62" y="610" fill="' + foreground + '" font-family="Segoe UI, sans-serif" font-size="54" font-weight="650">' + safeTitle.slice(0, 16) + '</text>',
    '<text x="66" y="666" fill="rgba(245,242,236,0.62)" font-family="Segoe UI, sans-serif" font-size="24">' + safeSubtitle.slice(0, 30) + '</text>',
    '</svg>',
  ].join('');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const albumSeeds = [
  ['夜航', 'Mizuno', '#273047', 'Ambient'],
  ['静かな午後', 'Aoi Kanda', '#4a4039', 'Acoustic'],
  ['雨の境界', 'Tsukino', '#263b3c', 'Alternative'],
  ['Blue Hour', 'Rei Nakamura', '#2d3546', 'Jazz'],
  ['纸月亮', '林遥', '#4a3536', 'Indie'],
  ['Afterimage', 'Mellow State', '#333239', 'Electronic'],
  ['北岸来信', '陈屿', '#344039', 'Folk'],
  ['眠れない夜', 'Sena', '#3c3544', 'Piano'],
];

function makeAlbums() {
  const albums = [];
  for (let a = 0; a < albumSeeds.length; a += 1) {
    const [title, artist, background, genre] = albumSeeds[a];
    const coverUrl = svgCover(title, artist, background);
    const trackNames = ['Opening','夜の窓辺','遠い街の灯','Interlude','静かな呼吸','雨音とピアノ','帰り道','Last Light'];
    const tracks = Array.from({ length: 8 }, (_, index) => ({
      id: 'kura-visual-track-' + a + '-' + index,
      title: trackNames[index],
      artist,
      album: title,
      duration: 178 + a * 17 + index * 23,
      coverUrl,
      coverSourceKind: 'mock-url',
      fileSize: (9 + index * 1.7).toFixed(1) + ' MB',
      type: 'music',
      mediaKind: 'audio',
      playbackSourceKind: 'mock',
      addedAt: '2026-09-' + String(18 + ((a + index) % 8)).padStart(2, '0') + 'T12:00:00.000Z',
    }));
    albums.push({
      id: 'kura-visual-album-' + a,
      title,
      artist,
      coverUrl,
      coverSourceKind: 'mock-url',
      releaseYear: String(2018 + a),
      genre,
      tracks,
    });
  }
  return albums;
}

function settings() {
  return {
    audioLibPath: '<未选择音声库>',
    musicLibPath: '<视觉样板音乐库>',
    asmrPaths: [{ id: 'asmr-1', type: 'local', path: '<未选择>', label: '本地音声库' }],
    musicPaths: [{ id: 'music-1', type: 'local', path: '<视觉样板>', label: '本地音乐库' }],
    tempDownloadPath: '<未设置>',
    currentTheme: 'dark',
    enableOverlay: true,
    privacyMode: true,
  };
}

function queueSnapshot(tracks) {
  return {
    version: 1,
    updatedAt: '2026-09-27T00:00:00.000Z',
    queue: tracks.slice(0, 8),
    currentTrackId: tracks[1].id,
    currentIndex: 1,
    progress: 94,
    volume: 0.68,
    isMuted: false,
    loopMode: 'all',
    playCompletionMode: 'continue-queue',
  };
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
      this.socket.addEventListener('error', (event) => { clearTimeout(timer); reject(new Error(event.message ?? 'CDP error')); }, { once: true });
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
      if (payload.method === 'Runtime.exceptionThrown') this.pageErrors.push(payload.params?.exceptionDetails?.text ?? 'Runtime exception');
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
    const response = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    return response.result?.value;
  }

  async close() {
    try { this.socket?.close(); } catch {}
  }
}

function electronExecutable() {
  const executable = path.join(cwd, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
  if (!fs.existsSync(executable)) throw new Error('Electron binary missing: ' + executable);
  return executable;
}

async function waitForCdpTarget(port, child) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('Electron exited before CDP attached: ' + child.exitCode);
    try {
      const response = await fetch('http://127.0.0.1:' + port + '/json/list');
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
    if (await cdp.evaluate('Boolean(' + expression + ')')) return;
    await delay(100);
  }
  throw new Error('Timed out waiting for ' + label);
}

const waitForSelector = (cdp, selector, timeout = 15000) =>
  waitForCondition(cdp, 'document.querySelector(' + JSON.stringify(selector) + ')', timeout, selector);

async function clickSelector(cdp, selector) {
  await cdp.evaluate('(() => { const e=document.querySelector(' + JSON.stringify(selector) + '); if(!e) throw new Error("Missing selector"); e.click(); return true; })()');
  await delay(180);
}

async function stabilize(cdp) {
  await cdp.evaluate('(async () => { if (document.fonts?.ready) await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); window.scrollTo(0,0); return true; })()', true);
  await delay(180);
}

async function setViewport(cdp, width, height) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
  await delay(250);
}

function readPngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG', 'screenshot is not PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function layoutSnapshot(cdp, name, expectedWidth, expectedHeight) {
  const expression = '(() => {' +
    'const rect=(selector)=>{const e=document.querySelector(selector);if(!e)return null;const b=e.getBoundingClientRect();return {left:b.left,top:b.top,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};' +
    'return {name:' + JSON.stringify(name) + ',viewport:{width:window.innerWidth,height:window.innerHeight},scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,sidebar:rect("#app-sidebar"),main:rect("main"),player:rect("#app-player-bar"),music:rect("[data-k2-reference-sample=music-library-v1]"),playerMarker:document.querySelector("#app-player-bar")?.getAttribute("data-k2-reference-player")??""};' +
    '})()';
  const layout = await cdp.evaluate(expression);
  assert.equal(layout.viewport.width, expectedWidth, name + ': viewport width mismatch');
  assert.equal(layout.viewport.height, expectedHeight, name + ': viewport height mismatch');
  assert.ok(layout.scrollWidth <= expectedWidth + 2, name + ': horizontal overflow');
  assert.equal(layout.playerMarker, 'v1', name + ': reference player marker missing');
  assert.ok(layout.music?.width > 500, name + ': music sample missing or too narrow');
  assert.ok(layout.player?.height >= 60, name + ': player too short');
  report.layouts.push(layout);
}

async function capture(cdp, name, width, height) {
  await stabilize(cdp);
  await layoutSnapshot(cdp, name, width, height);
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const buffer = Buffer.from(result.data, 'base64');
  const dimensions = readPngDimensions(buffer);
  assert.equal(dimensions.width, width, name + ': PNG width mismatch');
  assert.equal(dimensions.height, height, name + ': PNG height mismatch');
  const fileName = name + '.png';
  fs.writeFileSync(path.join(artifactDir, fileName), buffer);
  report.screenshots.push({ file: fileName, width, height, bytes: buffer.length });
}

async function closeApp(runtime) {
  const exited = new Promise((resolve) => runtime.child.once('exit', () => resolve(true)));
  try { await Promise.race([runtime.cdp.send('Browser.close'), delay(750)]); } catch {}
  let done = await Promise.race([exited, delay(5000).then(() => false)]);
  if (!done && runtime.child.exitCode === null) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(runtime.child.pid), '/T', '/F'], { stdio: 'ignore' });
    else runtime.child.kill('SIGKILL');
    done = await Promise.race([exited, delay(5000).then(() => false)]);
  }
  await runtime.cdp.close();
  if (!done && runtime.child.exitCode === null) throw new Error('Electron process tree remained active');
}

async function run() {
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kura-visual-profile-'));
  const port = await reservePort();
  const child = spawn(electronExecutable(), ['--remote-debugging-port=' + port, path.join(cwd, 'dist-electron', 'main.js')], {
    cwd,
    env: { ...process.env, YANG_KURA_ELECTRON_DEV: '0', YANG_KURA_USER_DATA_ROOT: path.join(profileRoot, 'user-data'), ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false,
  });
  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
  child.stderr.on('data', (chunk) => stderr.push(String(chunk)));

  const cdp = new CdpClient(await waitForCdpTarget(port, child));
  const runtime = { child, cdp, stdout, stderr };
  await cdp.connect();

  try {
    await waitForSelector(cdp, '#windows-app-bar', 30000);
    const albums = makeAlbums();
    const allTracks = albums.flatMap((album) => album.tracks);
    const seedScript = '(() => {' +
      'localStorage.setItem(' + JSON.stringify(MUSIC_ALBUMS_KEY) + ',' + JSON.stringify(JSON.stringify(albums)) + ');' +
      'localStorage.setItem(' + JSON.stringify(FAVORITES_KEY) + ',' + JSON.stringify(JSON.stringify([allTracks[1].id, allTracks[9].id])) + ');' +
      'localStorage.setItem(' + JSON.stringify(SETTINGS_KEY) + ',' + JSON.stringify(JSON.stringify(settings())) + ');' +
      'localStorage.setItem(' + JSON.stringify(QUEUE_KEY) + ',' + JSON.stringify(JSON.stringify(queueSnapshot(allTracks))) + ');' +
      'return true;})()';
    await cdp.evaluate(seedScript);
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForSelector(cdp, '#windows-app-bar', 30000);
    await waitForSelector(cdp, '#nav-music-lib');
    await clickSelector(cdp, '#nav-music-lib');
    await waitForSelector(cdp, '[data-k2-reference-sample="music-library-v1"]');

    await setViewport(cdp, 1440, 900);
    await clickSelector(cdp, '[data-u37d-view="albums"]');
    await waitForSelector(cdp, '[data-u37d-collection-card^="album:"]');
    await capture(cdp, '01-music-albums-1440x900', 1440, 900);

    await clickSelector(cdp, '[data-u37d-collection-card^="album:"]');
    await waitForSelector(cdp, '[data-u37d-detail="album"]');
    await capture(cdp, '02-album-detail-1440x900', 1440, 900);

    await cdp.evaluate('(() => { const button=[...document.querySelectorAll("button")].find((item)=>item.offsetParent!==null && item.textContent?.includes("返回专辑")); if(!button) throw new Error("album back button missing"); button.click(); return true; })()');
    await waitForSelector(cdp, '[data-u37d-view="tracks"]');
    await clickSelector(cdp, '[data-u37d-view="tracks"]');
    await setViewport(cdp, 1024, 720);
    await waitForSelector(cdp, '[data-k2-r4-virtual-list="music-tracks"]');
    await capture(cdp, '03-music-tracks-player-1024x720', 1024, 720);

    assert.deepEqual(cdp.pageErrors, [], 'Renderer exceptions: ' + cdp.pageErrors.join(' | '));
    report.status = 'PASS';
    report.rendererConsoleErrors = cdp.consoleErrors;
    fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log('K2-R5 visual screenshot capture PASS');
    for (const item of report.screenshots) console.log('SCREENSHOT\t' + item.file + '\t' + item.width + 'x' + item.height + '\t' + item.bytes + ' bytes');
  } catch (error) {
    report.status = 'FAIL';
    report.error = error instanceof Error ? error.stack ?? error.message : String(error);
    report.stdout = stdout.join('').slice(-12000);
    report.stderr = stderr.join('').slice(-12000);
    fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    throw error;
  } finally {
    await closeApp(runtime);
    fs.rmSync(profileRoot, { recursive: true, force: true });
  }
}

await run();
