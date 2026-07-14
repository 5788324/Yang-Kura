#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u29-electron-e2e');
fs.mkdirSync(artifactDir, { recursive: true });
const ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';
const QUEUE_STORAGE_KEY = 'yang_kura_player_queue_v1';
const WORK_TITLE = 'U29 播放器全链路作品';
const tracks = [
  { id: 'u29-lrc', title: 'U29 LRC 双语音轨', audio: '01-lrc.wav', subtitle: '01-lrc.lrc', text: 'LRC 原文一', translation: 'LRC 译文一', format: 'lrc' },
  { id: 'u29-srt', title: 'U29 SRT 音轨', audio: '02-srt.wav', subtitle: '02-srt.srt', text: 'SRT 第一行', translation: 'SRT 翻译', format: 'srt' },
  { id: 'u29-vtt', title: 'U29 VTT 音轨', audio: '03-vtt.wav', subtitle: '03-vtt.vtt', text: 'VTT 第一行', translation: 'VTT 翻译', format: 'vtt' },
  { id: 'u29-ass', title: 'U29 ASS 音轨', audio: '04-ass.wav', subtitle: '04-ass.ass', text: 'ASS 第一行', translation: 'ASS 翻译', format: 'ass' },
  { id: 'u29-none', title: 'U29 无字幕音轨', audio: '05-none.wav', subtitle: null, text: null, translation: null, format: null },
];
const report = { status: 'running', head: process.env.GITHUB_SHA ?? null, scenarios: [], screenshots: [] };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function writeSilentWav(filePath, seconds = 12) {
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

function writeSubtitles(root) {
  fs.writeFileSync(path.join(root, '01-lrc.lrc'), '[00:00.00]LRC 原文一 / LRC 译文一\n[00:06.00]LRC 原文二 / LRC 译文二\n', 'utf8');
  fs.writeFileSync(path.join(root, '02-srt.srt'), '1\n00:00:00,000 --> 00:00:05,000\nSRT 第一行 / SRT 翻译\n\n2\n00:00:06,000 --> 00:00:11,000\nSRT 第二行\n', 'utf8');
  fs.writeFileSync(path.join(root, '03-vtt.vtt'), 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nVTT 第一行 / VTT 翻译\n\n00:00:06.000 --> 00:00:11.000\nVTT 第二行\n', 'utf8');
  fs.writeFileSync(path.join(root, '04-ass.ass'), '[Script Info]\nTitle: U29\nScriptType: v4.00+\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,ASS 第一行 / ASS 翻译\nDialogue: 0,0:00:06.00,0:00:11.00,Default,,0,0,0,,ASS 第二行\n', 'utf8');
}

function buildIndex(rootPathToken, sizes) {
  const timestamp = '2026-07-14T00:00:00.000Z';
  const subtitleEntries = tracks.filter((track) => track.subtitle).map((track) => ({
    id: `subtitle-${track.id}`,
    trackId: track.id,
    sourceKind: 'local-file',
    language: track.id === 'u29-lrc' ? 'bilingual' : 'unknown',
    format: track.format,
    relativePath: track.subtitle,
  }));
  return {
    schemaVersion: 1,
    generatedAt: timestamp,
    sourceKind: 'fixture',
    roots: [{
      id: 'u29-root', name: 'u29-player-fixture', rootPath: `rootPathToken:${rootPathToken}`,
      libraryType: 'asmr', scanProfile: 'asmr-rj', sourceKind: 'fixture', createdAt: timestamp, updatedAt: timestamp,
    }],
    collections: [{
      id: 'u29-work', rootId: 'u29-root', collectionType: 'rj_work', title: WORK_TITLE,
      codeRaw: 'RJ290001', codeNorm: 'RJ290001', circle: 'U29 E2E 社团', cvs: ['U29 E2E CV'],
      tags: ['U29'], status: 'identified', trackIds: tracks.map((track) => track.id),
      totalDurationSeconds: tracks.length * 12, addedAt: timestamp, updatedAt: timestamp,
    }],
    tracks: tracks.map((track, index) => ({
      id: track.id, rootId: 'u29-root', collectionId: 'u29-work', kind: 'audio', title: track.title,
      displayArtist: 'U29 E2E CV', displayAlbum: WORK_TITLE, rjId: 'RJ290001', trackNo: index + 1,
      durationSeconds: 12,
      source: { id: `source-${track.id}`, trackId: track.id, sourceKind: 'local-file', relativePath: track.audio, extension: 'wav', sizeBytes: sizes[track.audio], mtimeMs: 1 },
      subtitles: track.subtitle ? [subtitleEntries.find((item) => item.trackId === track.id)] : [],
      tags: ['U29'], addedAt: timestamp,
    })),
    covers: [], subtitles: subtitleEntries, warnings: [],
  };
}

function writeIndex(filePath, index) {
  fs.writeFileSync(filePath, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(JSON.stringify(index, null, 2), 'utf8')]));
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
  constructor(url) { this.url = url; this.socket = null; this.nextId = 1; this.pending = new Map(); this.pageErrors = []; this.consoleErrors = []; }
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
        const pending = this.pending.get(payload.id); if (!pending) return; this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message)); else pending.resolve(payload.result); return;
      }
      if (payload.method === 'Runtime.exceptionThrown') this.pageErrors.push(payload.params?.exceptionDetails?.text ?? 'Runtime exception');
      if (payload.method === 'Runtime.consoleAPICalled' && payload.params?.type === 'error') this.consoleErrors.push((payload.params.args ?? []).map((item) => item.value ?? item.description ?? '').join(' '));
    });
    await this.send('Runtime.enable'); await this.send('Page.enable');
  }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  async evaluate(expression, awaitPromise = false) {
    const response = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    return response.result?.value;
  }
  async close() { try { this.socket?.close(); } catch {} }
}

function electronExecutable() {
  const executable = path.join(cwd, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
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

async function launchApp(fixtureDir, profileDir) {
  const port = await reservePort();
  const stdout = []; const stderr = [];
  const child = spawn(electronExecutable(), [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')], {
    cwd,
    env: { ...process.env, APPDATA: profileDir, LOCALAPPDATA: profileDir, YANG_KURA_ELECTRON_DEV: '0', YANG_KURA_E2E_MODE: '1', YANG_KURA_E2E_LIBRARY_ROOT: fixtureDir, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: false,
  });
  child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
  child.stderr.on('data', (chunk) => stderr.push(String(chunk)));
  const cdp = new CdpClient(await waitForCdpTarget(port, child));
  await cdp.connect(); await waitForSelector(cdp, '#windows-app-bar', 30000);
  return { child, cdp, stdout, stderr };
}

async function waitForCondition(cdp, expression, timeout = 15000, label = expression) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await cdp.evaluate(`Boolean(${expression})`)) return; await delay(100); }
  throw new Error(`Timed out waiting for ${label}`);
}
const waitForSelector = (cdp, selector, timeout = 15000) => waitForCondition(cdp, `document.querySelector(${JSON.stringify(selector)})`, timeout, selector);
const waitForBodyText = (cdp, text, timeout = 15000) => waitForCondition(cdp, `document.body?.innerText.includes(${JSON.stringify(text)})`, timeout, text);
async function clickSelector(cdp, selector) { await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing selector: ${selector}'); element.click(); return true; })()`); await delay(150); }
async function clickVisibleText(cdp, text, tagName = '*') {
  await cdp.evaluate(`(() => { const expected=${JSON.stringify(text)}; const element=[...document.querySelectorAll(${JSON.stringify(tagName)})].find((item)=>item.offsetParent!==null && item.textContent?.trim()===expected); if(!element) throw new Error('Missing text: '+expected); element.click(); return true; })()`); await delay(150);
}
async function screenshot(cdp, name) { const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true }); const file = `${name}.png`; fs.writeFileSync(path.join(artifactDir, file), Buffer.from(result.data, 'base64')); report.screenshots.push(file); }
async function playerState(cdp) {
  return cdp.evaluate(`(() => { const bar=document.querySelector('#app-player-bar'); return { mode:bar?.dataset.u29PlaybackMode??'', trackId:bar?.dataset.u29TrackId??'', progress:Number(bar?.dataset.u29Progress??0), duration:Number(bar?.dataset.u29Duration??0), queueCount:Number(bar?.dataset.u29QueueCount??0), currentIndex:Number(bar?.dataset.u29CurrentIndex??-1), sourceReady:bar?.dataset.u29SourceReady==='true', lyricsStatus:bar?.dataset.u29LyricsStatus??'' }; })()`);
}
async function waitForPlayer(cdp, predicate, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const state = await playerState(cdp); if (predicate(state)) return state; await delay(100); }
  throw new Error(`Timed out waiting for player: ${label}`);
}
async function navigate(cdp, pageId) { await clickSelector(cdp, `#nav-${pageId}`); }
async function openSettingsPaths(cdp) { await navigate(cdp, 'settings'); await waitForBodyText(cdp, '应用设置'); await clickSelector(cdp, '[data-settings-tab="paths"]'); await waitForBodyText(cdp, '选择本地资源库目录'); }
async function authorize(cdp) {
  await openSettingsPaths(cdp); await clickVisibleText(cdp, '选择音声库目录', 'button'); await waitForBodyText(cdp, '已选择目录，可读取已有记录或重新扫描');
  return cdp.evaluate(`(() => { const value=JSON.parse(sessionStorage.getItem(${JSON.stringify(ROOT_SESSION_KEY)})??'{}'); return value.asmr?.rootPathToken??''; })()`);
}
async function readIndex(cdp) {
  await cdp.evaluate(`(() => { const button=[...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && item.textContent?.trim()==='读取已有记录' && !item.disabled); if(!button) throw new Error('read button disabled'); button.click(); return true; })()`);
  await waitForCondition(cdp, `![...document.querySelectorAll('button')].some((button)=>button.textContent?.includes('读取中'))`, 15000, 'index read');
  await waitForBodyText(cdp, '文件编码：utf8-bom');
}
async function setSeek(cdp, seconds) {
  await cdp.evaluate(`(() => { const input=document.querySelector('input[aria-label="播放进度"]'); if(!input) throw new Error('seek input missing'); input.dispatchEvent(new MouseEvent('mousedown',{bubbles:true})); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input,String(${seconds})); input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); input.dispatchEvent(new MouseEvent('mouseup',{bubbles:true})); return true; })()`);
  await delay(250);
}
async function closeApp(runtime) {
  const exited = new Promise((resolve) => runtime.child.once('exit', () => resolve(true)));
  try { await Promise.race([runtime.cdp.send('Browser.close'), delay(750)]); } catch {}
  let done = await Promise.race([exited, delay(5000).then(() => false)]);
  if (!done && runtime.child.exitCode === null) {
    if (process.platform === 'win32') { const { spawnSync } = await import('node:child_process'); spawnSync('taskkill', ['/PID', String(runtime.child.pid), '/T', '/F'], { stdio: 'ignore' }); }
    else runtime.child.kill('SIGKILL');
    done = await Promise.race([exited, delay(5000).then(() => false)]);
  }
  await runtime.cdp.close();
  if (!done && runtime.child.exitCode === null) throw new Error('Electron process tree remained active');
}
async function openLyricsAndAssert(runtime, track) {
  await waitForPlayer(runtime.cdp, (state) => state.trackId === track.id, track.id);
  if (track.subtitle) await waitForPlayer(runtime.cdp, (state) => state.trackId === track.id && state.lyricsStatus === 'loaded', `${track.id} lyrics loaded`);
  else await waitForPlayer(runtime.cdp, (state) => state.trackId === track.id && state.lyricsStatus === 'missing', `${track.id} lyrics missing`);
  await clickSelector(runtime.cdp, `#app-player-bar button[title=${JSON.stringify(track.title)}]`);
  await waitForSelector(runtime.cdp, '#full-lyrics-panel');
  if (track.subtitle) {
    await waitForBodyText(runtime.cdp, track.text);
    if (track.translation) await waitForBodyText(runtime.cdp, track.translation);
    const lyricsPath = await runtime.cdp.evaluate(`document.querySelector('#full-lyrics-panel')?.dataset.u29LyricsPath??''`);
    assert.ok(lyricsPath.endsWith(track.subtitle), `${track.format} 字幕来源未绑定正确文件`);
  } else {
    await waitForSelector(runtime.cdp, '#mvp51-lyrics-empty-state');
  }
  await clickSelector(runtime.cdp, '#lyrics-close-btn'); await waitForCondition(runtime.cdp, `!document.querySelector('#full-lyrics-panel')`, 5000, 'lyrics close');
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u29-e2e-'));
const fixtureDir = path.join(tempRoot, 'library');
const profileDir = path.join(tempRoot, 'profile');
fs.mkdirSync(fixtureDir, { recursive: true }); fs.mkdirSync(profileDir, { recursive: true });
const sizes = {};
for (const track of tracks) sizes[track.audio] = writeSilentWav(path.join(fixtureDir, track.audio));
writeSubtitles(fixtureDir);
writeIndex(path.join(fixtureDir, 'library-index.json'), { schemaVersion: 1, generatedAt: new Date(0).toISOString(), sourceKind: 'fixture', roots: [], collections: [], tracks: [], covers: [], subtitles: [], warnings: [] });

let firstToken = '';
let runtime = await launchApp(fixtureDir, profileDir);
try {
  firstToken = await authorize(runtime.cdp); assert.ok(firstToken.startsWith('yk-root-'));
  writeIndex(path.join(fixtureDir, 'library-index.json'), buildIndex(firstToken, sizes));
  await readIndex(runtime.cdp); await navigate(runtime.cdp, 'asmr-lib'); await waitForBodyText(runtime.cdp, WORK_TITLE); await clickVisibleText(runtime.cdp, WORK_TITLE); await waitForBodyText(runtime.cdp, '播放全部音声'); await clickSelector(runtime.cdp, '#play-all-asmr');
  await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[0].id && state.queueCount === tracks.length && state.sourceReady, 'initial real queue');
  await waitForPlayer(runtime.cdp, (state) => state.mode === 'html-audio' || state.mode === 'mpv', 'real backend');
  await setSeek(runtime.cdp, 6);
  const afterSeek = await waitForPlayer(runtime.cdp, (state) => state.progress > 6.3 && state.progress < 10, 'actual seek advancement');
  assert.ok(afterSeek.duration >= 11.5, '真实音频时长未加载');
  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label="暂停"]');
  await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[0].id && state.progress >= 6 && state.progress < 11, 'paused resume point');

  const completionBefore = await runtime.cdp.evaluate(`document.querySelector('#app-player-bar button[aria-label^="播放完成策略："]')?.getAttribute('aria-label')??''`);
  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label^="播放完成策略："]');
  const completionAfter = await runtime.cdp.evaluate(`document.querySelector('#app-player-bar button[aria-label^="播放完成策略："]')?.getAttribute('aria-label')??''`);
  assert.notEqual(completionAfter, completionBefore, '播放完成策略未切换');

  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label^="当前播放队列"]'); await waitForSelector(runtime.cdp, '#u29-queue-drawer');
  for (const track of tracks) {
    await clickSelector(runtime.cdp, `[data-queue-track-id=${JSON.stringify(track.id)}]`);
    await openLyricsAndAssert(runtime, track);
    if (!await runtime.cdp.evaluate(`Boolean(document.querySelector('#u29-queue-drawer'))`)) { await clickSelector(runtime.cdp, '#app-player-bar button[aria-label^="当前播放队列"]'); await waitForSelector(runtime.cdp, '#u29-queue-drawer'); }
  }
  await clickSelector(runtime.cdp, `[data-queue-track-id=${JSON.stringify(tracks[0].id)}]`);
  await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[0].id, 'return to resume track');
  await setSeek(runtime.cdp, 6); await delay(500);
  const current = await playerState(runtime.cdp);
  if (current.mode !== 'html-audio' && current.mode !== 'mpv') throw new Error(`unexpected backend before restart: ${current.mode}`);
  const pauseButton = await runtime.cdp.evaluate(`Boolean(document.querySelector('#app-player-bar button[aria-label="暂停"]'))`);
  if (pauseButton) await clickSelector(runtime.cdp, '#app-player-bar button[aria-label="暂停"]');
  await delay(300);
  const persisted = await runtime.cdp.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(QUEUE_STORAGE_KEY)})??'null')`);
  assert.equal(persisted.queue.length, tracks.length);
  assert.ok(persisted.progress >= 5.5, '队列未保存续播进度');
  assert.ok(persisted.queue.every((track) => !track.rootPathToken && !track.mediaUrl && !String(track.coverUrl ?? '').startsWith('yang-kura-media://')), '持久化队列泄露当前窗口 token 或媒体 URL');
  await screenshot(runtime.cdp, '01-first-run-player-subtitles');
  assert.deepEqual(runtime.cdp.pageErrors, [], `first run Renderer errors: ${runtime.cdp.pageErrors.join(' | ')}`);
  report.scenarios.push({ name: 'play-seek-queue-subtitle-formats', status: 'PASS', resumeProgress: persisted.progress });
} finally { await closeApp(runtime); }

runtime = await launchApp(fixtureDir, profileDir);
try {
  const restored = await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[0].id && state.queueCount === tracks.length && state.progress >= 5.5, 'restored queue UI');
  assert.equal(restored.sourceReady, false, '重启后不应保留上个窗口的 root token');
  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label="播放"]');
  await waitForBodyText(runtime.cdp, '需要重新授权资源库并读取 Index');
  const blocked = await playerState(runtime.cdp);
  assert.equal(blocked.mode, 'idle'); assert.equal(blocked.sourceReady, false); assert.ok(blocked.progress >= 5.5, '未授权点击播放不应清空续播点');
  await screenshot(runtime.cdp, '02-restart-authorization-required');

  const secondToken = await authorize(runtime.cdp); assert.ok(secondToken.startsWith('yk-root-')); assert.notEqual(secondToken, firstToken, '重启授权必须生成新的当前窗口 token');
  writeIndex(path.join(fixtureDir, 'library-index.json'), buildIndex(secondToken, sizes));
  await readIndex(runtime.cdp);
  const reconciled = await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[0].id && state.queueCount === tracks.length && state.sourceReady && state.progress >= 5.5, 'queue token reconciliation');
  assert.equal(reconciled.currentIndex, 0);
  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label="播放"]');
  const resumed = await waitForPlayer(runtime.cdp, (state) => (state.mode === 'html-audio' || state.mode === 'mpv') && state.progress > 6.2, 'actual restart resume', 20000);
  assert.ok(resumed.progress < 11.5, `续播位置异常：${resumed.progress}`);

  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label="下一首"]');
  await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[1].id && state.currentIndex === 1, 'next track');
  await clickSelector(runtime.cdp, '#app-player-bar button[aria-label="上一首"]');
  await waitForPlayer(runtime.cdp, (state) => state.trackId === tracks[0].id && state.currentIndex === 0, 'previous track');
  await setSeek(runtime.cdp, 99);
  const clamped = await waitForPlayer(runtime.cdp, (state) => state.progress <= state.duration + 0.05, 'duration clamp');
  assert.ok(clamped.progress <= 12.05, 'Seek 未限制到音轨时长');
  await screenshot(runtime.cdp, '03-restart-real-resume');
  assert.deepEqual(runtime.cdp.pageErrors, [], `restart Renderer errors: ${runtime.cdp.pageErrors.join(' | ')}`);
  report.scenarios.push({ name: 'restart-reauthorize-token-reconcile-real-resume', status: 'PASS', resumedProgress: resumed.progress, secondTokenChanged: secondToken !== firstToken });
} finally { await closeApp(runtime); }

report.status = 'PASS';
fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log('U29 Electron player E2E PASS');
for (const scenario of report.scenarios) console.log(`PASS\t${scenario.name}`);
fs.rmSync(tempRoot, { recursive: true, force: true });
