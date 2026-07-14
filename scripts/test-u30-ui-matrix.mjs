#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u30-ui-matrix');
fs.mkdirSync(artifactDir, { recursive: true });
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

  const track = { id: 'u30-track', title: 'U30 窗口与键盘测试音轨', artist: 'U30', album: 'U30 UI', duration: 120, coverUrl: '', type: 'music', playbackSourceKind: 'tokenized-local-file', sourceRelativePath: 'u30.wav' };
  await cdp.evaluate('(() => { const track=' + JSON.stringify(track) + '; localStorage.setItem("yang_kura_player_queue_v1", JSON.stringify({version:1,updatedAt:new Date().toISOString(),queue:[track],currentTrackId:track.id,currentIndex:0,progress:42,volume:0.75,isMuted:false,loopMode:"all",playCompletionMode:"continue-queue"})); localStorage.setItem("last_played_track_id", track.id); localStorage.setItem("last_played_progress", "42"); localStorage.setItem("last_played_track_json", JSON.stringify(track)); location.reload(); return true; })()');
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
  assert.ok(motion.duration === '0.00001s' || motion.duration === '0s', 'reduced-motion suppresses decorative animation');
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
