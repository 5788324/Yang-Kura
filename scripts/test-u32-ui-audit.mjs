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
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
  }
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
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message));
        else pending.resolve(payload.result);
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

async function waitFor(cdp, expression, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(120);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function click(cdp, selector) {
  const encoded = JSON.stringify(selector);
  await cdp.evaluate(`(() => { const element = document.querySelector(${encoded}); if (!element) throw new Error('Missing selector: ' + ${encoded}); element.click(); return true; })()`);
  await delay(260);
}

async function screenshot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const file = `${name}.png`;
  fs.writeFileSync(path.join(artifactDir, file), Buffer.from(result.data, 'base64'));
  report.screenshots.push(file);
}

async function capturePage(cdp, pageId, fileName) {
  await click(cdp, `#nav-${pageId}`);
  await waitFor(cdp, `document.querySelector('#nav-${pageId}')?.getAttribute('aria-current') === 'page'`, `${pageId} active`);
  await delay(220);
  const metrics = await cdp.evaluate(`(() => {
    const main = document.querySelector('main');
    const buttons = [...main.querySelectorAll('button')].filter((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const cards = [...main.querySelectorAll('[class*="rounded-"][class*="border"]')].filter((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width > 140 && rect.height > 48;
    });
    const heading = main.querySelector('h1,h2');
    return {
      pageId: ${JSON.stringify(pageId)},
      title: heading?.textContent?.trim() ?? '',
      visibleButtonCount: buttons.length,
      visibleCardCount: cards.length,
      mainScrollHeight: main.scrollHeight,
      mainClientHeight: main.clientHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      buttonHeights: [...new Set(buttons.map((item) => Math.round(item.getBoundingClientRect().height)))].sort((a,b) => a-b),
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

const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u32-ui-audit-'));
const port = await reservePort();
const child = spawn(electronExecutable(), [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')], {
  cwd,
  env: { ...process.env, APPDATA: profileDir, LOCALAPPDATA: profileDir, YANG_KURA_ELECTRON_DEV: '0', YANG_KURA_E2E_MODE: '1', ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: false,
});
const stdout = [];
const stderr = [];
child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
child.stderr.on('data', (chunk) => stderr.push(String(chunk)));
let cdp;

try {
  cdp = new CdpClient(await waitForTarget(port, child));
  await cdp.connect();
  await waitFor(cdp, "document.querySelector('#windows-app-bar')", 'application shell');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1.25, mobile: false });

  const seed = (() => {
    const makeTrack = (id, title, artist, album, type, duration, rjId) => ({
      id, title, artist, album, duration, coverUrl: '', type, rjId,
      playbackSourceKind: 'tokenized-local-file', rootPathToken: 'u32-audit-root',
      sourceRelativePath: `${type}/${id}.wav`, fileSize: `${Math.round(duration / 12)} MB`,
      subtitleRelativePaths: [`${type}/${id}.lrc`], addedAt: '2026-07-01T00:00:00.000Z',
    });
    const asmrTracks = [
      makeTrack('a-01', '01 双耳轻声与雨夜陪伴', '月白音声', '雨宿りの夜', 'asmr', 1680, 'RJ410001'),
      makeTrack('a-02', '02 梵天与耳部按摩', '月白音声', '雨宿りの夜', 'asmr', 1420, 'RJ410001'),
      makeTrack('a-03', '01 深夜图书馆的悄悄话', '白河ゆき', '閉館後の図書室', 'asmr', 2100, 'RJ410002'),
      makeTrack('a-04', '01 猫咖店员的午后护理', '星野こはる', 'ねこカフェ休憩室', 'asmr', 1860, 'RJ410003'),
      makeTrack('a-05', '01 海边旅馆的睡前照顾', '水瀬しおり', '波音の宿', 'asmr', 2520, 'RJ410004'),
      makeTrack('a-06', '01 炉火旁的冬日闲聊', '橘まどか', '冬灯り', 'asmr', 1980, 'RJ410005'),
    ];
    const musicTracks = [
      makeTrack('m-01', 'Blue Hour', 'Mina Aoki', 'City Lights', 'music', 244),
      makeTrack('m-02', 'Last Train Home', 'Mina Aoki', 'City Lights', 'music', 218),
      makeTrack('m-03', 'Drift', 'North Window', 'Still Water', 'music', 276),
      makeTrack('m-04', 'Paper Moon', 'Lumen', 'Paper Moon', 'music', 232),
      makeTrack('m-05', 'Sunday Walk', 'April Notes', 'Small Seasons', 'music', 205),
      makeTrack('m-06', 'After Rain', 'April Notes', 'Small Seasons', 'music', 261),
    ];
    const works = [
      ['RJ410001', '雨宿りの夜', '月白音声', ['月白りん'], ['雨声', '耳语', '助眠'], asmrTracks.slice(0,2), 'listening'],
      ['RJ410002', '閉館後の図書室', 'Librarium', ['白河ゆき'], ['图书馆', '低语'], asmrTracks.slice(2,3), 'unheard'],
      ['RJ410003', 'ねこカフェ休憩室', '午後三時', ['星野こはる'], ['猫咖', '按摩'], asmrTracks.slice(3,4), 'completed'],
      ['RJ410004', '波音の宿', '海辺制作所', ['水瀬しおり'], ['海浪', '照顾'], asmrTracks.slice(4,5), 'unheard'],
      ['RJ410005', '冬灯り', '橘音工房', ['橘まどか'], ['炉火', '闲聊'], asmrTracks.slice(5,6), 'listening'],
    ].map(([id,title,circle,cvs,tags,tracks,personalStatus], index) => ({
      id, title, circle, cvs, tags, tracks, personalStatus, releaseDate: `2026-0${index+1}-12`,
      coverUrl: '', status: index === 3 ? 'missing-cover' : 'identified', fileCount: tracks.length,
      totalDuration: tracks.reduce((sum, track) => sum + track.duration, 0),
      description: '用于发布候选视觉审查的本地样本作品。', rating: index % 2 ? 4 : 5,
      addedAt: `2026-07-0${index+1}T00:00:00.000Z`,
    }));
    const albums = [
      { id:'album-1', title:'City Lights', artist:'Mina Aoki', releaseYear:'2026', genre:'City Pop', coverUrl:'', tracks:musicTracks.slice(0,2) },
      { id:'album-2', title:'Still Water', artist:'North Window', releaseYear:'2025', genre:'Ambient', coverUrl:'', tracks:musicTracks.slice(2,3) },
      { id:'album-3', title:'Paper Moon', artist:'Lumen', releaseYear:'2024', genre:'Indie Pop', coverUrl:'', tracks:musicTracks.slice(3,4) },
      { id:'album-4', title:'Small Seasons', artist:'April Notes', releaseYear:'2026', genre:'Acoustic', coverUrl:'', tracks:musicTracks.slice(4,6) },
    ];
    const playlists = [
      { id:'playlist-night', name:'夜间放松', description:'ASMR 与安静音乐混合播放', coverUrl:'', creator:'本地用户', tracksCount:4, tracks:[asmrTracks[0],asmrTracks[2],musicTracks[2],musicTracks[4]], isSystem:false, sourceKind:'user-local' },
      { id:'playlist-focus', name:'工作专注', description:'不打扰的轻音乐', coverUrl:'', creator:'本地用户', tracksCount:3, tracks:musicTracks.slice(0,3), isSystem:false, sourceKind:'user-local' },
      { id:'playlist-sleep', name:'睡前收藏', description:'耳语、雨声和海浪', coverUrl:'', creator:'本地用户', tracksCount:3, tracks:[asmrTracks[0],asmrTracks[3],asmrTracks[4]], isSystem:false, sourceKind:'user-local' },
    ];
    return { asmrTracks, musicTracks, works, albums, playlists };
  })();

  await cdp.evaluate(`(() => {
    const seed = ${JSON.stringify(seed)};
    const now = new Date().toISOString();
    localStorage.setItem('sqlite_rj_works', JSON.stringify(seed.works));
    localStorage.setItem('sqlite_music_albums', JSON.stringify(seed.albums));
    localStorage.setItem('yang_kura_user_playlists_v1', JSON.stringify({ version:1, updatedAt:now, playlists:seed.playlists }));
    localStorage.setItem('sqlite_settings', JSON.stringify({
      audioLibPath:'<已授权本地音声库>', musicLibPath:'<已授权本地音乐库>',
      asmrPaths:[{id:'asmr-1',type:'local',path:'<资源库令牌>',label:'本地音声库'}],
      musicPaths:[{id:'music-1',type:'local',path:'<资源库令牌>',label:'本地音乐库'}],
      tempDownloadPath:'<未设置>', currentTheme:'acrylic-mist', enableOverlay:true, privacyMode:true
    }));
    sessionStorage.setItem('yang_kura_u28_authorized_roots_v1', JSON.stringify({ mixed:{rootPathToken:'u32-audit-root',displayName:'U32 视觉审查媒体库',libraryType:'mixed'} }));
    localStorage.setItem('yang_kura_library_session_v1', JSON.stringify({
      version:1, updatedAt:now,
      selectedRoots:{ mixed:{libraryType:'mixed',displayName:'U32 视觉审查媒体库',selectedAt:now} },
      lastIndex:{libraryType:'mixed',displayName:'U32 视觉审查媒体库',indexRelativePath:'library-index.json',readAt:now,generatedAt:now,rootCount:1,collectionCount:9,trackCount:12,warningCount:1}
    }));
    localStorage.setItem('yang_kura_player_queue_v1', JSON.stringify({
      version:1, updatedAt:now, queue:[seed.asmrTracks[0],seed.musicTracks[0],seed.asmrTracks[2]],
      currentTrackId:seed.asmrTracks[0].id,currentIndex:0,progress:462,volume:0.72,isMuted:false,loopMode:'all',playCompletionMode:'continue-queue'
    }));
    localStorage.setItem('last_played_track_id', seed.asmrTracks[0].id);
    localStorage.setItem('last_played_progress', '462');
    localStorage.setItem('last_played_track_json', JSON.stringify(seed.asmrTracks[0]));
    location.reload();
    return true;
  })()`);

  await waitFor(cdp, "document.querySelector('#app-player-bar')?.dataset.u29TrackId === 'a-01'", 'seeded player');
  await capturePage(cdp, 'dashboard', '01-dashboard-baseline');
  await capturePage(cdp, 'asmr-lib', '02-asmr-library-baseline');
  await capturePage(cdp, 'music-lib', '03-music-library-baseline');
  await capturePage(cdp, 'playlists', '04-playlists-baseline');
  await capturePage(cdp, 'importer', '05-importer-baseline');
  await capturePage(cdp, 'settings', '06-settings-baseline');

  await click(cdp, '#sidebar-ai-maintenance-toggle');
  await waitFor(cdp, "document.querySelector('#sidebar-ai-maintenance-toggle')?.getAttribute('aria-expanded') === 'true'", 'maintenance panel open');
  await screenshot(cdp, '07-ai-maintenance-expanded-baseline');
  await capturePage(cdp, 'diagnostics', '08-diagnostics-baseline');
  await capturePage(cdp, 'downloader', '09-downloader-baseline');

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1040, height: 680, deviceScaleFactor: 1, mobile: false });
  await capturePage(cdp, 'settings', '10-settings-narrow-baseline');

  assert.deepEqual(cdp.errors, [], 'renderer has no runtime or console errors');
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  report.stdout = stdout.join('');
  report.stderr = stderr.join('');
  report.consoleErrors = cdp?.errors ?? [];
  fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  cdp?.close();
  if (child.exitCode === null) child.kill();
  await delay(300);
  fs.rmSync(profileDir, { recursive: true, force: true });
}

console.log('U32 UI visual audit capture PASS');
