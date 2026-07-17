import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  constructor(target) {
    this.target = target;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
  }

  async connect() {
    this.socket = new WebSocket(this.target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connection timeout')), 15_000);
      this.socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.socket.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error('CDP connection failed'));
      }, { once: true });
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
        this.errors.push(payload.params?.exceptionDetails?.exception?.description ?? payload.params?.exceptionDetails?.text ?? 'Runtime exception');
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

function electronExecutable(cwd) {
  const executable = path.join(cwd, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
  if (!fs.existsSync(executable)) throw new Error(`Electron binary missing: ${executable}`);
  return executable;
}

async function waitForTarget(port, child) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Electron exited before CDP attached: ${child.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const target = (await response.json()).find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
        if (target) return target;
      }
    } catch {}
    await delay(200);
  }
  throw new Error('Electron CDP target timeout');
}

export async function launchElectron({ cwd, profileDir, fixtureDir }) {
  const port = await reservePort();
  const stdout = [];
  const stderr = [];
  const child = spawn(electronExecutable(cwd), [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')], {
    cwd,
    env: {
      ...process.env,
      APPDATA: profileDir,
      LOCALAPPDATA: profileDir,
      YANG_KURA_ELECTRON_DEV: '0',
      YANG_KURA_E2E_MODE: '1',
      YANG_KURA_E2E_LIBRARY_ROOT: fixtureDir,
      YANG_KURA_E2E_USER_DATA_ROOT: path.join(profileDir, 'Yang-Kura'),
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false,
  });
  child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
  child.stderr.on('data', (chunk) => stderr.push(String(chunk)));

  const target = await waitForTarget(port, child);
  const cdp = new CdpClient(target);
  await cdp.connect();
  return { child, cdp, stdout, stderr };
}

export async function closeElectron(runtime) {
  const exited = new Promise((resolve) => runtime.child.once('exit', () => resolve(true)));
  try { await Promise.race([runtime.cdp.send('Browser.close'), delay(750)]); } catch {}
  let done = await Promise.race([exited, delay(5_000).then(() => false)]);
  if (!done && runtime.child.exitCode === null) {
    if (process.platform === 'win32') {
      const { spawnSync } = await import('node:child_process');
      spawnSync('taskkill', ['/PID', String(runtime.child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      runtime.child.kill('SIGKILL');
    }
    done = await Promise.race([exited, delay(5_000).then(() => false)]);
  }
  runtime.cdp.close();
  if (!done && runtime.child.exitCode === null) throw new Error('Electron process tree remained active');
}

export async function waitFor(cdp, expression, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

export async function click(cdp, selector) {
  await cdp.evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); if(!element) throw new Error('Missing selector: '+${JSON.stringify(selector)}); element.click(); return true; })()`);
  await delay(180);
}

export async function clickButtonText(cdp, text, exact = false) {
  await cdp.evaluate(`(() => {
    const expected=${JSON.stringify(text)};
    const items=[...document.querySelectorAll('button,[role="button"],[role="tab"]')].filter((item)=>item.offsetParent!==null && !item.disabled);
    const element=items.find((item)=>${exact ? 'item.textContent?.trim()===expected' : 'item.textContent?.trim().includes(expected)'});
    if(!element) throw new Error('Missing visible button text: '+expected);
    element.click(); return true;
  })()`);
  await delay(180);
}

export async function pressKey(cdp, key, modifiers = 0) {
  const code = key === ' ' ? 'Space' : key;
  const keyCode = key === 'Escape' ? 27 : key === 'Enter' ? 13 : key === 'Tab' ? 9 : key === ' ' ? 32 : 0;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await delay(120);
}

export async function captureScreenshot(cdp, directory, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true });
  const file = `${name}.png`;
  fs.writeFileSync(path.join(directory, file), Buffer.from(result.data, 'base64'));
  return file;
}
