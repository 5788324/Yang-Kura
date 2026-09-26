#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u30-ui-matrix');
const referenceArtifactDir = path.join(cwd, 'artifacts', 'k2-r5-reference-screenshots');
fs.mkdirSync(artifactDir, { recursive: true });
fs.rmSync(referenceArtifactDir, { recursive: true, force: true });
fs.mkdirSync(referenceArtifactDir, { recursive: true });
const report = { status: 'running', head: process.env.GITHUB_SHA ?? null, checks: [], screenshots: [] };
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
      const timer = setTimeout(() => reject(new Error('CDP connection timeout')), 15000);
      this.socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connection failed')); }, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id); if (!pending) return; this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message)); else pending.resolve(payload.result); return;
      }
      if (payload.method === 'Runtime.exceptionThrown') this.errors.push(payload.params?.exceptionDetails?.text ?? 'Runtime exception');
      if (payload.method === 'Runtime.consoleAPICalled' && payload.params?.type === 'error') this.errors.push((payload.params.args ?? []).map((item) => item.value ?? item.description ?? '').join(' '));
    });
    await this.send('Runtime.enable'); await this.send('Page.enable');
  }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  async evaluate(expression, awaitPromise = false) {
    const response = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    return response.result?.value;
  }
  close() { try { this.socket?.close(); } catch {} }
}

async function waitForTarget(port, child) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('Electron exited before CDP attached');
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

async function waitFor(cdp, expression, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate('Boolean(' + expression + ')')) return;
    await delay(100);
  }
  throw new Error('Timed out waiting for ' + label);
}

async function click(cdp, selector) {
  const encodedSelector = JSON.stringify(selector);
  await cdp.evaluate('(() => { const selector=' + encodedSelector + '; const element=document.querySelector(selector); if(!element) throw new Error("Missing selector: " + selector); element.click(); return true; })()');
  await delay(160);
}

async function pressEscape(cdp) {
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await delay(160);
}

async function screenshot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const file = name + '.png';
  fs.writeFileSync(path.join(artifactDir, file), Buffer.from(result.data, 'base64'));
  report.screenshots.push(file);
}


function k2ReferenceCover(index, title) {
  const palette = [
    ['#20232a', '#88786b', '#c9b9a6'],
    ['#0f1720', '#516976', '#aab9bf'],
    ['#1c1b1a', '#6f695d', '#c7bda9'],
    ['#151a17', '#54665b', '#aebcaf'],
    ['#1d1716', '#765b52', '#c2a89d'],
    ['#171821', '#5e6079', '#b4b4c8'],
  ];
  const [base, accent, ink] = palette[index % palette.length];
  const safeTitle = String(title).replace(/[&<>"]/g, '');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">'
    + '<rect width="800" height="800" fill="' + base + '"/>'
    + '<circle cx="' + (570 - index * 18) + '" cy="' + (205 + index * 13) + '" r="225" fill="' + accent + '" opacity=".78"/>'
    + '<rect x="76" y="565" width="510" height="4" fill="' + ink + '" opacity=".55"/>'
    + '<text x="76" y="625" fill="' + ink + '" font-size="38" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-weight="600">' + safeTitle.slice(0, 18) + '</text>'
    + '<text x="78" y="675" fill="' + ink + '" opacity=".55" font-size="18" font-family="Segoe UI, sans-serif" letter-spacing="5">KURA ARCHIVE</text>'
    + '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function buildK2ReferenceMusicFixture() {
  const defs = [
    ['album-rain-library', '雨の図書室', 'Hoshino Kiri', '2026', 'Ambient', ['窓辺の雨', 'Archive Room', '静かな頁', '午前二時']],
    ['album-night-voyage', '夜航', '林霁', '2025', 'Alternative', ['夜航船', '岸边灯塔', '无人的站台', '慢速雨云']],
    ['album-clear-afternoon', '透明な午後', 'Aoi', '2024', 'Acoustic', ['透明な午後', '白いカーテン', '遠い声', '風の余白']],
    ['album-winter-lamp', '冬灯', '苏映', '2026', 'Piano', ['冬灯', '落雪之前', '玻璃窗', '旧街角']],
    ['album-still-rooms', 'Still Rooms', 'Nocturne Lab', '2023', 'Electronic', ['Still Rooms', 'Soft Static', 'Half Light', 'Dust in Blue']],
    ['album-forest-memory', '森の記憶', 'Mizuki', '2025', 'Instrumental', ['森の記憶', '水辺', '木漏れ日', '遠雷']],
  ];
  return defs.map((def, albumIndex) => {
    const [id, title, artist, releaseYear, genre, names] = def;
    const coverUrl = k2ReferenceCover(albumIndex, title);
    return {
      id,
      title,
      artist,
      coverUrl,
      coverSourceKind: 'mock-url',
      releaseYear,
      genre,
      tracks: names.map((trackTitle, trackIndex) => ({
        id: id + '-track-' + String(trackIndex + 1),
        title: trackTitle,
        artist,
        album: title,
        duration: 176 + albumIndex * 21 + trackIndex * 17,
        coverUrl,
        coverSourceKind: 'mock-url',
        type: 'music',
        mediaKind: 'audio',
        playbackSourceKind: 'mock',
        lyricsSourceKind: 'mock',
        lyricsLoadStatus: 'idle',
        lyrics: ['[00:00.00] Kura Archive', '[00:18.00] 静かな時間', '[00:42.00] 夜のための音楽'],
        addedAt: '2026-09-' + String(24 - albumIndex).padStart(2, '0') + 'T12:00:00.000Z',
      })),
    };
  });
}

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG', 'invalid PNG signature');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function referenceScreenshot(cdp, name, width, height, referenceReport) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cdp.evaluate('document.documentElement.dataset.k2Screenshot="true"; document.activeElement?.blur?.(); true');
  await delay(180);
  const layout = await cdp.evaluate('(() => { const box=(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}}; return {innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,sidebar:box("#app-sidebar"),main:box("main"),music:box("[data-k2-reference-sample=music-library-v1]"),player:box("[data-k2-reference-player=v1]"),detail:box("[data-u37d-detail=album]")}; })()');
  assert.ok(layout.scrollWidth <= width + 2, name + ' has horizontal overflow');
  assert.ok(layout.music?.width > 400, name + ' music surface missing');
  assert.ok(layout.player?.height >= 60, name + ' player missing');
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const buffer = Buffer.from(result.data, 'base64');
  assert.deepEqual(pngDimensions(buffer), { width, height }, name + ' screenshot dimensions');
  fs.writeFileSync(path.join(referenceArtifactDir, name + '.png'), buffer);
  referenceReport.screenshots.push({ file: name + '.png', width, height, bytes: buffer.length, layout });
}

function electronExecutable() {
  const executable = path.join(cwd, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
  if (!fs.existsSync(executable)) throw new Error('Electron binary missing: ' + executable);
  return executable;
}

const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u30-profile-'));
const port = await reservePort();
const child = spawn(electronExecutable(), ['--remote-debugging-port=' + port, path.join(cwd, 'dist-electron', 'main.js')], {
  cwd,
  env: { ...process.env, APPDATA: profileDir, LOCALAPPDATA: profileDir, YANG_KURA_ELECTRON_DEV: '0', YANG_KURA_E2E_MODE: '1', ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: false,
});
const stdout = []; const stderr = [];
child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
child.stderr.on('data', (chunk) => stderr.push(String(chunk)));
let cdp;
try {
  cdp = new CdpClient(await waitForTarget(port, child));
  await cdp.connect();
  await waitFor(cdp, "document.querySelector('#windows-app-bar')", 'application shell');

  const k2Albums = buildK2ReferenceMusicFixture();
  const track = {
    ...k2Albums[1].tracks[0],
    id: 'u30-track',
    title: '夜航船',
    artist: '林霁',
    album: '夜航',
    duration: 247,
    coverUrl: k2Albums[1].coverUrl,
    lyrics: ['[00:00.00] 夜航船', '[00:18.00] 海面没有灯', '[00:42.00] 只剩远处的雨'],
  };
  await cdp.evaluate('(() => { const track=' + JSON.stringify(track) + '; const albums=' + JSON.stringify(k2Albums) + '; localStorage.setItem("sqlite_music_albums", JSON.stringify(albums)); localStorage.setItem("sqlite_favorites", JSON.stringify([albums[0].tracks[1].id, albums[1].tracks[2].id])); localStorage.setItem("sqlite_settings", JSON.stringify({audioLibPath:"<未选择音声库>",musicLibPath:"<visual-fixture>",asmrPaths:[],musicPaths:[{id:"visual-music",type:"local",path:"<visual-fixture>",label:"Kura Visual Fixture"}],tempDownloadPath:"<none>",currentTheme:"dark",enableOverlay:true,privacyMode:true})); localStorage.setItem("yang_kura_player_queue_v1", JSON.stringify({version:1,updatedAt:new Date().toISOString(),queue:[track,...albums[0].tracks.slice(0,3),...albums[1].tracks.slice(1,4)],currentTrackId:track.id,currentIndex:0,progress:42,volume:0.75,isMuted:false,loopMode:"all",playCompletionMode:"continue-queue"})); localStorage.setItem("last_played_track_id", track.id); localStorage.setItem("last_played_progress", "42"); localStorage.setItem("last_played_track_json", JSON.stringify(track)); location.reload(); return true; })()');
  await waitFor(cdp, "document.querySelector('#app-player-bar')?.dataset.u29TrackId === 'u30-track'", 'restored player');
  assert.equal(await cdp.evaluate("document.querySelector('#legacy-resume-toast') === null"), true, 'modern queue suppresses legacy resume toast');
  report.checks.push('modern queue suppresses legacy resume toast');

  const matrix = [
    { theme: 'dark', width: 1040, height: 680, scale: 1 },
    { theme: 'acrylic-mist', width: 1280, height: 800, scale: 1.25 },
    { theme: 'ocean-drops', width: 1600, height: 900, scale: 1.5 },
  ];
  for (const item of matrix) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: item.width, height: item.height, deviceScaleFactor: item.scale, mobile: false });
    await cdp.evaluate('(() => { const root=document.querySelector("#root > div"); root.classList.remove("theme-dark","theme-acrylic-mist","theme-ocean-drops"); root.classList.add("theme-' + item.theme + '"); root.dataset.u30Theme="' + item.theme + '"; return true; })()');
    await delay(120);
    const layout = await cdp.evaluate('(() => { const sidebar=document.querySelector("#app-sidebar")?.getBoundingClientRect(); const player=document.querySelector("#app-player-bar")?.getBoundingClientRect(); const root=document.querySelector("#root > div")?.getBoundingClientRect(); return { innerWidth, innerHeight, scrollWidth:document.documentElement.scrollWidth, rootRight:root?.right??0, sidebarWidth:sidebar?.width??0, playerBottom:player?.bottom??0, playerWidth:player?.width??0 }; })()');
    assert.ok(layout.scrollWidth <= item.width + 1, item.theme + ' has no horizontal document overflow');
    assert.ok(layout.rootRight <= item.width + 1, item.theme + ' root stays inside viewport');
    assert.ok(layout.sidebarWidth >= 190, item.theme + ' sidebar remains usable');
    assert.ok(layout.playerWidth >= item.width - 2 && layout.playerBottom <= item.height + 1, item.theme + ' PlayerBar remains visible');
    report.checks.push(item.theme + ' ' + item.width + 'x' + item.height + ' layout');
    await screenshot(cdp, item.theme + '-' + item.width + 'x' + item.height + '-scale-' + String(item.scale).replace('.', '_'));
  }


  const referenceReport = {
    schemaVersion: 1,
    head: process.env.GITHUB_SHA ?? null,
    source: 'u30-deterministic-music-fixture',
    mediaFilesTouched: false,
    screenshots: [],
  };
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp.evaluate('(() => { const root=document.querySelector("#root > div"); root.classList.remove("theme-dark","theme-acrylic-mist","theme-ocean-drops"); root.classList.add("theme-dark"); root.dataset.u30Theme="dark"; return true; })()');
  await click(cdp, '#nav-music-lib');
  await waitFor(cdp, 'document.querySelector("[data-k2-reference-sample=music-library-v1]")', 'K2-R5 music reference sample');

  await click(cdp, '[data-u37d-view="albums"]');
  await waitFor(cdp, 'document.querySelector("[data-u37d-collection-grid=albums]")', 'album reference grid');
  await referenceScreenshot(cdp, '01-music-albums-1440x900', 1440, 900, referenceReport);

  await click(cdp, '[data-u37d-collection-card^="album:"]');
  await waitFor(cdp, 'document.querySelector("[data-u37d-detail=album]")', 'album detail reference');
  await referenceScreenshot(cdp, '02-album-detail-1440x900', 1440, 900, referenceReport);

  await click(cdp, '[data-u37d-detail="album"] > .yk-button');
  await waitFor(cdp, 'document.querySelector("[data-u37d-view=tracks]")', 'music view tabs restored');
  await click(cdp, '[data-u37d-view="tracks"]');
  await waitFor(cdp, 'document.querySelector("[data-k2-r4-virtual-list=music-tracks]")', 'track reference list');
  await referenceScreenshot(cdp, '03-music-tracks-1024x720', 1024, 720, referenceReport);

  await click(cdp, '[data-u37d-view="albums"]');
  await waitFor(cdp, 'document.querySelector("[data-u37d-collection-grid=albums]")', 'small album reference grid');
  await referenceScreenshot(cdp, '04-music-albums-1024x720', 1024, 720, referenceReport);
  fs.writeFileSync(path.join(referenceArtifactDir, 'manifest.json'), JSON.stringify(referenceReport, null, 2), 'utf8');
  report.checks.push('K2-R5 reference screenshot matrix');

  for (const nav of ['dashboard', 'asmr-lib', 'music-lib', 'playlists', 'settings']) {
    await click(cdp, '#nav-' + nav);
    const overflow = await cdp.evaluate('document.documentElement.scrollWidth > innerWidth + 1');
    assert.equal(overflow, false, nav + ' has no horizontal overflow');
    report.checks.push(nav + ' page visible without horizontal overflow');
  }

  await click(cdp, '#player-queue-toggle');
  await waitFor(cdp, "document.querySelector('#u29-queue-drawer')", 'queue drawer');
  await pressEscape(cdp);
  await waitFor(cdp, "!document.querySelector('#u29-queue-drawer')", 'queue drawer close');
  assert.equal(await cdp.evaluate("document.activeElement?.id === 'player-queue-toggle'"), true, 'Escape returns focus to queue toggle');
  report.checks.push('queue Escape and focus return');

  await click(cdp, '[aria-label*="全屏歌词"]');
  await waitFor(cdp, "document.querySelector('#full-lyrics-panel')", 'full lyrics panel');
  await screenshot(cdp, 'full-player-lyrics');
  await pressEscape(cdp);
  await waitFor(cdp, "!document.querySelector('#full-lyrics-panel')", 'full lyrics panel close');
  report.checks.push('full player Escape close');

  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const motion = await cdp.evaluate('(() => { const icon=document.querySelector("#app-sidebar .animate-pulse"); const style=icon ? getComputedStyle(icon) : null; return { matches:matchMedia("(prefers-reduced-motion: reduce)").matches, duration:style?.animationDuration??"" }; })()');
  assert.equal(motion.matches, true, 'reduced-motion media emulation is active');
  assert.ok(!motion.duration || motion.duration === '0.00001s' || motion.duration === '0s', 'reduced-motion suppresses or removes decorative animation');
  report.checks.push('reduced-motion contract');

  assert.deepEqual(cdp.errors, [], 'renderer has no runtime or console errors');
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  report.stdout = stdout.join(''); report.stderr = stderr.join('');
  fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  cdp?.close();
  if (child.exitCode === null) child.kill();
  await delay(300);
  fs.rmSync(profileDir, { recursive: true, force: true });
}

console.log('U30 UI matrix PASS');
