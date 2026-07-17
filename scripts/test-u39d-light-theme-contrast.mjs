#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u39d-light-theme-contrast');
fs.mkdirSync(artifactDir, { recursive: true });
const report = { status: 'running', head: process.env.GITHUB_SHA ?? null, checks: [], screenshots: [] };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function electronExecutable() {
  const executable = path.join(cwd, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
  if (!fs.existsSync(executable)) throw new Error(`Electron binary missing: ${executable}`);
  return executable;
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

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', { expression, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Renderer evaluation failed');
    return response.result?.value;
  }

  close() {
    try { this.socket?.close(); } catch {}
  }
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
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function screenshot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true });
  const file = `${name}.png`;
  fs.writeFileSync(path.join(artifactDir, file), Buffer.from(result.data, 'base64'));
  report.screenshots.push(file);
}

function rgbChannels(value) {
  const match = String(value).trim().match(/^#([0-9a-f]{6})$/i);
  assert.ok(match, `Expected six-digit hex color, received ${value}`);
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255);
}

function luminance(value) {
  const channels = rgbChannels(value).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u39d-profile-'));
const userDataRoot = path.join(profileRoot, 'Yang-Kura');
const port = await reservePort();
const child = spawn(electronExecutable(), [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')], {
  cwd,
  env: {
    ...process.env,
    APPDATA: profileRoot,
    LOCALAPPDATA: profileRoot,
    YANG_KURA_ELECTRON_DEV: '0',
    YANG_KURA_E2E_MODE: '1',
    YANG_KURA_E2E_USER_DATA_ROOT: userDataRoot,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
  },
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

  await cdp.evaluate(`(() => {
    localStorage.setItem('yang_kura_beta2_theme_v1', 'mist-ivory');
    const legacy = JSON.parse(localStorage.getItem('sqlite_settings') ?? '{}');
    localStorage.setItem('sqlite_settings', JSON.stringify({ ...legacy, currentTheme: 'ocean-drops' }));
    location.reload();
    return true;
  })()`);

  await waitFor(cdp, "document.documentElement?.dataset?.ykTheme === 'mist-ivory'", 'mist ivory html theme');
  await waitFor(cdp, "document.body?.dataset?.ykTheme === 'mist-ivory'", 'mist ivory body theme');
  await waitFor(cdp, "document.querySelector('.u32-release-ui')?.dataset.ykTheme === 'mist-ivory'", 'mist ivory app theme');

  const runtime = await cdp.evaluate(`(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const app = document.querySelector('.u32-release-ui');
    const muted = [...document.querySelectorAll('[class*="text-text-muted"]')]
      .find((item) => item instanceof HTMLElement && item.offsetParent !== null);
    const tokenNames = [
      '--yk-canvas', '--yk-surface-1', '--yk-surface-2', '--yk-surface-3',
      '--yk-border-subtle', '--yk-border-strong',
      '--yk-text-1', '--yk-text-2', '--yk-text-3',
      '--yk-accent', '--yk-accent-hover', '--yk-success', '--yk-warning', '--yk-danger', '--yk-info', '--yk-focus',
      '--text-muted', '--brand-color', '--brand-color-hover', '--border-color', '--border-color-hover',
    ];
    return {
      htmlTheme: document.documentElement.dataset.ykTheme ?? '',
      bodyTheme: document.body.dataset.ykTheme ?? '',
      appTheme: app?.dataset.ykTheme ?? '',
      colorScheme: rootStyle.colorScheme,
      tokens: Object.fromEntries(tokenNames.map((name) => [name, rootStyle.getPropertyValue(name).trim()])),
      mutedComputedColor: muted ? getComputedStyle(muted).color : '',
      mutedFound: Boolean(muted),
      persistedTheme: localStorage.getItem('yang_kura_beta2_theme_v1'),
      legacyTheme: JSON.parse(localStorage.getItem('sqlite_settings') ?? '{}').currentTheme ?? null,
    };
  })()`);

  assert.equal(runtime.htmlTheme, 'mist-ivory');
  assert.equal(runtime.bodyTheme, 'mist-ivory');
  assert.equal(runtime.appTheme, 'mist-ivory');
  assert.equal(runtime.colorScheme, 'light');
  assert.equal(runtime.persistedTheme, 'mist-ivory');
  assert.equal(runtime.legacyTheme, 'ocean-drops');
  assert.equal(runtime.tokens['--yk-text-3'], runtime.tokens['--text-muted'], 'new and legacy muted text must stay aligned');
  assert.equal(runtime.tokens['--yk-accent'], runtime.tokens['--brand-color'], 'new and legacy accent must stay aligned');
  assert.equal(runtime.tokens['--yk-accent-hover'], runtime.tokens['--brand-color-hover'], 'new and legacy hover accent must stay aligned');
  assert.equal(runtime.tokens['--yk-border-subtle'], runtime.tokens['--border-color'], 'new and legacy subtle border must stay aligned');
  assert.equal(runtime.tokens['--yk-border-strong'], runtime.tokens['--border-color-hover'], 'new and legacy strong border must stay aligned');
  assert.equal(runtime.mutedFound, true, 'a visible legacy muted-text surface must be present');

  const surfaces = ['--yk-canvas', '--yk-surface-1', '--yk-surface-2', '--yk-surface-3'];
  for (const foreground of ['--yk-text-1', '--yk-text-2', '--yk-text-3', '--yk-accent', '--yk-success', '--yk-warning', '--yk-danger', '--yk-info']) {
    for (const background of surfaces) {
      const ratio = contrast(runtime.tokens[foreground], runtime.tokens[background]);
      assert.ok(ratio >= 4.5, `${foreground} / ${background} runtime contrast ${ratio.toFixed(2)} is below 4.5:1`);
      report.checks.push(`${foreground} / ${background} ${ratio.toFixed(2)}:1`);
    }
  }
  for (const border of ['--yk-border-subtle', '--yk-border-strong']) {
    for (const background of surfaces) {
      const ratio = contrast(runtime.tokens[border], runtime.tokens[background]);
      assert.ok(ratio >= 3, `${border} / ${background} runtime contrast ${ratio.toFixed(2)} is below 3:1`);
      report.checks.push(`${border} / ${background} ${ratio.toFixed(2)}:1`);
    }
  }
  for (const background of ['--yk-accent', '--yk-accent-hover']) {
    const ratio = contrast('#ffffff', runtime.tokens[background]);
    assert.ok(ratio >= 4.5, `white / ${background} runtime contrast ${ratio.toFixed(2)} is below 4.5:1`);
    report.checks.push(`white / ${background} ${ratio.toFixed(2)}:1`);
  }

  await screenshot(cdp, 'mist-ivory-dashboard');
  await cdp.evaluate(`document.querySelector('#nav-settings')?.click()`);
  await waitFor(cdp, "document.body.innerText.includes('应用设置')", 'settings page');
  await screenshot(cdp, 'mist-ivory-settings');

  assert.deepEqual(cdp.errors, [], 'renderer has no runtime or console errors');
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  report.stdout = stdout.join('');
  report.stderr = stderr.join('');
  fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  cdp?.close();
  if (child.exitCode === null) child.kill();
  await delay(300);
  fs.rmSync(profileRoot, { recursive: true, force: true });
}

console.log('U39-D Electron light theme contrast PASS');
