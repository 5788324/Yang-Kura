#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = process.cwd();
const releaseDir = path.join(root, 'release');
const artifactDir = path.join(root, 'artifacts', 'u32-release-candidate');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const report = { status: 'running', captures: [], residualProcesses: [] };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
fs.mkdirSync(artifactDir, { recursive: true });

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function reservePort() {
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
      const timer = setTimeout(() => reject(new Error('CDP connection timeout')), 20_000);
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
      if (payload.method === 'Runtime.exceptionThrown') {
        this.errors.push(payload.params?.exceptionDetails?.text ?? 'Runtime exception');
      }
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
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? 'renderer evaluation failed');
    return response.result?.value;
  }

  close() {
    const error = new Error('CDP client closed');
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    try { this.socket?.close(); } catch {}
  }
}

async function waitForTarget(port, timeout = 45_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const target = (await response.json()).find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
        if (target) return target.webSocketDebuggerUrl;
      }
    } catch {}
    await delay(200);
  }
  throw new Error(`packaged page target timeout on ${port}`);
}

async function waitFor(cdp, expression, label, timeout = 45_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(150);
  }
  throw new Error(`timed out waiting for ${label}`);
}

function productPids() {
  const command = "$items=@(Get-CimInstance Win32_Process -Filter \"Name='Yang Kura.exe'\" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessId); ConvertTo-Json -InputObject $items -Compress";
  const result = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 20_000,
  });
  assert.equal(result.status, 0, `process inspection failed: ${result.stderr || result.stdout || ''}`);
  const parsed = JSON.parse(`${result.stdout ?? ''}`.trim() || '[]');
  return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
}

function stopPids(pids) {
  for (const pid of pids) {
    spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', `Stop-Process -Id ${Number(pid)} -Force -ErrorAction SilentlyContinue`], {
      windowsHide: true,
      stdio: 'ignore',
      timeout: 20_000,
    });
  }
}

async function waitForChildExit(child, timeout = 8_000) {
  if (child.exitCode !== null || child.signalCode !== null) return true;
  return Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    delay(timeout).then(() => false),
  ]);
}

async function waitForNoNewProcesses(baseline, timeout = 15_000) {
  const original = new Set(baseline);
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const extra = productPids().filter((pid) => !original.has(pid));
    if (!extra.length) return [];
    await delay(250);
  }
  return productPids().filter((pid) => !original.has(pid));
}

async function captureReadyPage(executable, label, profileRoot) {
  const baseline = productPids();
  const port = await reservePort();
  const child = spawn(executable, [`--remote-debugging-port=${port}`], {
    cwd: path.dirname(executable),
    env: {
      ...process.env,
      APPDATA: profileRoot,
      LOCALAPPDATA: profileRoot,
      YANG_KURA_ELECTRON_DEV: '0',
      YANG_KURA_E2E_MODE: '1',
      YANG_KURA_MPV_PATH: path.join(profileRoot, 'missing-mpv', 'mpv.exe'),
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false,
  });
  let cdp;
  try {
    cdp = new CdpClient(await waitForTarget(port));
    await cdp.connect();
    await waitFor(cdp, "document.querySelector('#windows-app-bar')", `${label} shell`);
    await waitFor(
      cdp,
      "document.querySelector('main [data-u37b-home=\"daily\"]') && !document.body?.innerText.includes('正在打开页面') && document.querySelector('main')?.innerText.includes('尚未选择资源库') && document.querySelector('main')?.innerText.includes('继续播放') && document.querySelector('main')?.innerText.includes('常用入口')",
      `${label} production home content`,
    );
    assert.deepEqual(cdp.errors, [], `${label}: renderer errors: ${cdp.errors.join(' | ')}`);
    const bodyText = await cdp.evaluate("document.querySelector('main')?.innerText ?? ''");
    assert.ok(bodyText.length > 100, `${label}: production home content is unexpectedly short`);
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    const fileName = `${label}-ready.png`;
    fs.writeFileSync(path.join(artifactDir, fileName), Buffer.from(screenshot.data, 'base64'));
    report.captures.push({ label, fileName, bodyTextLength: bodyText.length, page: 'u37b-production-home' });
    const closeRequest = cdp.evaluate('window.close(); true').catch(() => undefined);
    await Promise.race([closeRequest, waitForChildExit(child, 2_000), delay(1_000)]);
  } finally {
    cdp?.close();
    const exited = await waitForChildExit(child);
    if (!exited && child.exitCode === null) child.kill();
    const residual = await waitForNoNewProcesses(baseline);
    if (residual.length) {
      report.residualProcesses.push({ label, pids: residual });
      stopPids(residual);
    }
    assert.deepEqual(residual, [], `${label}: residual processes after complete-page capture: ${residual.join(', ')}`);
  }
}

try {
  assert.equal(process.platform, 'win32', 'packaged page readiness must run on Windows');
  const files = walk(releaseDir);
  const portable = files.find((file) => path.basename(file) === `Yang Kura-${pkg.version}-portable-x64.exe`);
  const setup = files.find((file) => path.basename(file) === `Yang Kura-${pkg.version}-setup-x64.exe`);
  assert.ok(portable, 'portable release candidate missing');
  assert.ok(setup, 'NSIS release candidate missing');

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u32-ready-中文 空格-'));
  const profileRoot = path.join(tempRoot, 'profile');
  const portableDir = path.join(tempRoot, 'portable 中文 空格');
  fs.mkdirSync(portableDir, { recursive: true });
  const portableCopy = path.join(portableDir, 'Yang Kura Portable.exe');
  fs.copyFileSync(portable, portableCopy);
  await captureReadyPage(portableCopy, 'portable-complete-home', profileRoot);

  const installDir = path.join(tempRoot, '安装 中文 空格', 'Yang Kura');
  const install = spawnSync(setup, ['/S', `/D=${installDir}`], {
    cwd: path.dirname(setup),
    encoding: 'utf8',
    windowsHide: false,
    timeout: 180_000,
  });
  assert.equal(install.error, undefined, `NSIS install failed to start: ${install.error?.message ?? ''}`);
  assert.equal(install.status, 0, `NSIS install failed: ${install.stderr || install.stdout || install.status}`);
  const installedExe = walk(installDir).find((file) => path.basename(file).toLowerCase() === 'yang kura.exe');
  assert.ok(installedExe, 'installed Yang Kura.exe missing');
  await captureReadyPage(installedExe, 'nsis-complete-home', profileRoot);

  const uninstaller = walk(installDir).find((file) => path.basename(file).toLowerCase().includes('uninstall') && file.toLowerCase().endsWith('.exe'));
  assert.ok(uninstaller, 'NSIS uninstaller missing');
  const uninstall = spawnSync(uninstaller, ['/S'], {
    cwd: installDir,
    encoding: 'utf8',
    windowsHide: false,
    timeout: 180_000,
  });
  assert.equal(uninstall.error, undefined, `NSIS uninstall failed to start: ${uninstall.error?.message ?? ''}`);
  assert.equal(uninstall.status, 0, `NSIS uninstall failed: ${uninstall.stderr || uninstall.stdout || uninstall.status}`);
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  fs.writeFileSync(path.join(artifactDir, 'page-readiness-report.json'), JSON.stringify(report, null, 2), 'utf8');
}

console.log('U32 packaged production-home readiness PASS');
