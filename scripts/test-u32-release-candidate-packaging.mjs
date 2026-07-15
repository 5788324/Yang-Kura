#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = process.cwd();
const releaseDir = path.join(root, 'release');
const artifactDir = path.join(root, 'artifacts', 'u32-release-candidate');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const report = {
  status: 'running',
  version: packageJson.version,
  artifacts: [],
  launches: [],
  checks: [],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
fs.mkdirSync(artifactDir, { recursive: true });

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkFiles(absolute));
    else result.push(absolute);
  }
  return result;
}

function sha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function relative(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function findSingle(files, predicate, label) {
  const matches = files.filter(predicate);
  assert.equal(matches.length, 1, `${label}: expected one match, found ${matches.length}: ${matches.map(relative).join(', ')}`);
  return matches[0];
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

  close() {
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
  throw new Error(`Timed out waiting for packaged Electron CDP target on ${port}`);
}

async function waitForCondition(cdp, expression, label, timeout = 20_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(120);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function waitForFile(filePath, shouldExist, timeout = 45_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath) === shouldExist) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${shouldExist ? 'creation' : 'removal'}: ${path.basename(filePath)}`);
}

function productProcessIds() {
  const script = "$items=@(Get-CimInstance Win32_Process -Filter \"Name='Yang Kura.exe'\" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessId); if($items.Count -eq 0){'[]'}else{$items | ConvertTo-Json -Compress}";
  const result = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 20_000,
  });
  if (result.status !== 0) return [];
  const text = `${result.stdout ?? ''}`.trim() || '[]';
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
}

async function waitForNoNewProductProcesses(baseline, timeout = 20_000) {
  const baselineSet = new Set(baseline);
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const extra = productProcessIds().filter((pid) => !baselineSet.has(pid));
    if (extra.length === 0) return;
    await delay(250);
  }
  const extra = productProcessIds().filter((pid) => !baselineSet.has(pid));
  for (const pid of extra) {
    spawnSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  }
  assert.deepEqual(productProcessIds().filter((pid) => !baselineSet.has(pid)), [], `packaged application left residual processes: ${extra.join(', ')}`);
}

async function launchAndInspect(executable, label, profileRoot) {
  const baselinePids = productProcessIds();
  const port = await reservePort();
  const child = spawn(executable, [`--remote-debugging-port=${port}`], {
    cwd: path.dirname(executable),
    env: {
      ...process.env,
      APPDATA: profileRoot,
      LOCALAPPDATA: profileRoot,
      YANG_KURA_ELECTRON_DEV: '0',
      YANG_KURA_E2E_MODE: '1',
      YANG_KURA_MPV_PATH: path.join(profileRoot, '不存在 mpv', 'mpv.exe'),
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false,
  });
  const stdout = [];
  const stderr = [];
  child.stdout?.on('data', (chunk) => stdout.push(String(chunk)));
  child.stderr?.on('data', (chunk) => stderr.push(String(chunk)));
  let cdp;
  try {
    cdp = new CdpClient(await waitForTarget(port));
    await cdp.connect();
    await waitForCondition(cdp, "document.querySelector('#windows-app-bar')", `${label} app shell`);
    const shellStatus = await cdp.evaluate('window.yangKura.getElectronShellStatus()', true);
    const mpvInstallation = await cdp.evaluate('window.yangKura.getMpvInstallationStatus()', true);
    const mpvRuntime = await cdp.evaluate('window.yangKura.getMpvPlaybackStatus()', true);
    assert.equal(shellStatus?.hasRealElectronRuntime, true, `${label}: packaged preload bridge unavailable`);
    assert.equal(shellStatus?.exposesAbsolutePaths, false, `${label}: packaged shell exposed absolute paths`);
    assert.equal(mpvInstallation?.available, false, `${label}: nonexistent mpv path must be reported unavailable`);
    assert.equal(mpvRuntime?.fallbackAvailable, true, `${label}: HTMLAudio fallback must remain available`);
    assert.deepEqual(cdp.errors, [], `${label}: renderer errors: ${cdp.errors.join(' | ')}`);
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    const screenshotName = `${label.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}.png`;
    fs.writeFileSync(path.join(artifactDir, screenshotName), Buffer.from(screenshot.data, 'base64'));
    report.launches.push({
      label,
      shellStatus: shellStatus?.status ?? null,
      mpvAvailable: mpvInstallation?.available ?? null,
      mpvSource: mpvInstallation?.source ?? null,
      fallbackAvailable: mpvRuntime?.fallbackAvailable ?? null,
      screenshot: screenshotName,
    });
    try { await cdp.send('Browser.close'); } catch {}
  } finally {
    cdp?.close();
    await delay(1200);
    if (child.exitCode === null) {
      spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    }
    await waitForNoNewProductProcesses(baselinePids);
    if (stderr.join('').trim()) {
      fs.appendFileSync(path.join(artifactDir, 'packaged-stderr.log'), `\n[${label}]\n${stderr.join('')}`, 'utf8');
    }
    if (stdout.join('').trim()) {
      fs.appendFileSync(path.join(artifactDir, 'packaged-stdout.log'), `\n[${label}]\n${stdout.join('')}`, 'utf8');
    }
  }
}

function runInstaller(setupExe, installDir) {
  const result = spawnSync(setupExe, ['/S', `/D=${installDir}`], {
    cwd: path.dirname(setupExe),
    encoding: 'utf8',
    windowsHide: false,
    timeout: 180_000,
  });
  assert.equal(result.error, undefined, `NSIS installer failed to start: ${result.error?.message ?? ''}`);
  assert.equal(result.status, 0, `NSIS installer exit ${result.status}: ${result.stderr || result.stdout || ''}`);
}

function findInstalledExecutable(installDir, uninstall = false) {
  const exes = walkFiles(installDir).filter((file) => file.toLowerCase().endsWith('.exe'));
  const matches = exes.filter((file) => uninstall
    ? path.basename(file).toLowerCase().includes('uninstall')
    : path.basename(file).toLowerCase() === 'yang kura.exe');
  assert.equal(matches.length, 1, `${uninstall ? 'uninstaller' : 'installed application'} not uniquely found: ${exes.map((file) => path.basename(file)).join(', ')}`);
  return matches[0];
}

try {
  assert.equal(process.platform, 'win32', 'U32 release-candidate packaging acceptance must run on Windows');
  assert.ok(fs.existsSync(releaseDir), 'release directory missing; build portable and NSIS first');

  const releaseFiles = walkFiles(releaseDir);
  const portableExe = findSingle(
    releaseFiles,
    (file) => path.basename(file) === `Yang Kura-${packageJson.version}-portable-x64.exe`,
    'portable artifact',
  );
  const setupExe = findSingle(
    releaseFiles,
    (file) => path.basename(file) === `Yang Kura-${packageJson.version}-setup-x64.exe`,
    'NSIS artifact',
  );
  const appAsar = findSingle(
    releaseFiles,
    (file) => relative(file).toLowerCase() === 'release/win-unpacked/resources/app.asar',
    'packaged app.asar',
  );

  for (const file of [portableExe, setupExe, appAsar]) {
    const stat = fs.statSync(file);
    assert.ok(stat.size > 100_000, `${path.basename(file)} is unexpectedly small`);
    report.artifacts.push({ name: path.basename(file), sizeBytes: stat.size, sha256: sha256(file) });
  }

  const forbiddenPackagedFiles = releaseFiles
    .map(relative)
    .filter((name) => /(^|\/)(library-index\.json|\.env[^/]*|logs|cache|backups|data)(\/|$)/i.test(name));
  assert.deepEqual(forbiddenPackagedFiles, [], `forbidden mutable/user files leaked into package: ${forbiddenPackagedFiles.join(', ')}`);
  report.checks.push('portable, NSIS and app.asar artifacts present with SHA-256');
  report.checks.push('no mutable library/index/cache/log/data path leaked into package');

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u32-发布候选-'));
  const profileRoot = path.join(tempRoot, '用户 数据 保留');
  const stableUserData = path.join(profileRoot, 'Yang-Kura');
  const markerFile = path.join(stableUserData, 'u32-user-data-preservation.json');
  fs.mkdirSync(stableUserData, { recursive: true });
  fs.writeFileSync(markerFile, JSON.stringify({ marker: 'preserve-across-install-upgrade-uninstall' }), 'utf8');

  const portableDir = path.join(tempRoot, '中文 空格 portable');
  fs.mkdirSync(portableDir, { recursive: true });
  const portableCopy = path.join(portableDir, 'Yang Kura Portable.exe');
  fs.copyFileSync(portableExe, portableCopy);
  await launchAndInspect(portableCopy, 'portable-chinese-space-path', profileRoot);
  assert.ok(fs.existsSync(markerFile), 'portable launch removed existing user data marker');
  report.checks.push('portable starts from Chinese/space path and exits without residue');

  const installDir = path.join(tempRoot, '中文 空格 安装目录', 'Yang Kura');
  runInstaller(setupExe, installDir);
  const installedExe = findInstalledExecutable(installDir, false);
  await launchAndInspect(installedExe, 'nsis-first-install', profileRoot);
  assert.ok(fs.existsSync(markerFile), 'first install removed user data marker');

  runInstaller(setupExe, installDir);
  await waitForFile(installedExe, true);
  await launchAndInspect(installedExe, 'nsis-repeat-install-upgrade', profileRoot);
  assert.ok(fs.existsSync(markerFile), 'repeat install/upgrade removed user data marker');
  report.checks.push('NSIS install and repeat install preserve user data');

  const uninstaller = findInstalledExecutable(installDir, true);
  const uninstallResult = spawnSync(uninstaller, ['/S'], {
    cwd: installDir,
    encoding: 'utf8',
    windowsHide: false,
    timeout: 180_000,
  });
  assert.equal(uninstallResult.error, undefined, `NSIS uninstaller failed to start: ${uninstallResult.error?.message ?? ''}`);
  assert.equal(uninstallResult.status, 0, `NSIS uninstaller exit ${uninstallResult.status}: ${uninstallResult.stderr || uninstallResult.stdout || ''}`);
  await waitForFile(installedExe, false, 60_000);
  assert.ok(fs.existsSync(markerFile), 'uninstall deleted user data despite deleteAppDataOnUninstall=false');
  await waitForNoNewProductProcesses([]);
  report.checks.push('NSIS uninstall removes application but preserves user data and leaves no process');
  report.checks.push('packaged mpv-unavailable state keeps HTMLAudio fallback available');

  const checksums = report.artifacts
    .filter((item) => item.name.toLowerCase().endsWith('.exe'))
    .map((item) => `${item.sha256} *${item.name}`)
    .join('\n') + '\n';
  fs.writeFileSync(path.join(artifactDir, 'SHA256SUMS.txt'), checksums, 'utf8');
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
}

console.log('U32 release-candidate packaging acceptance PASS');
