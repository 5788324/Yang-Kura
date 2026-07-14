#!/usr/bin/env node
import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

function write(path, content) {
  fs.writeFileSync(path, content.replace(/\r\n/g, '\n'), 'utf8');
}

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: anchor not found`);
  if (first !== source.lastIndexOf(before)) throw new Error(`${label}: anchor not unique`);
  return source.replace(before, after);
}

let app = read('src/App.tsx');
app = replaceOnce(
  app,
  "import { playlistPersistenceService } from './services/playlistPersistenceService';\n",
  "import { playlistPersistenceService } from './services/playlistPersistenceService';\nimport { playerQueuePersistenceService } from './services/playerQueuePersistenceService';\n",
  'App queue persistence import',
);
app = replaceOnce(
  app,
  "  // On initial mount: Check if there's any second-level resume point stored\n  useEffect(() => {\n    const lastTrackId = localStorage.getItem('last_played_track_id');\n",
  "  // The modern persisted queue is authoritative. The legacy toast is only a fallback.\n  useEffect(() => {\n    if (playerQueuePersistenceService.load()) return;\n    const lastTrackId = localStorage.getItem('last_played_track_id');\n",
  'legacy resume guard',
);
app = replaceOnce(
  app,
  "  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);\n  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);\n\n  // Diagnostics refresh only reconciles the latest real index snapshot.\n",
  "  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);\n  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);\n\n  useEffect(() => {\n    if (!isQueueOpen) return;\n    const handleQueueEscape = (event: KeyboardEvent) => {\n      if (event.key !== 'Escape') return;\n      event.preventDefault();\n      setIsQueueOpen(false);\n      window.requestAnimationFrame(() => document.getElementById('player-queue-toggle')?.focus({ preventScroll: true }));\n    };\n    window.addEventListener('keydown', handleQueueEscape);\n    return () => window.removeEventListener('keydown', handleQueueEscape);\n  }, [isQueueOpen]);\n\n  // Diagnostics refresh only reconciles the latest real index snapshot.\n",
  'queue Escape lifecycle',
);
app = replaceOnce(
  app,
  "    <div className={`h-screen w-screen flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}>\n",
  "    <div data-u30-theme={settings.currentTheme} className={`h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}>\n",
  'App root responsive marker',
);
app = replaceOnce(
  app,
  '      <header id="windows-app-bar" className="h-9 flex items-center justify-between px-4 bg-sidebar-bg/60 border-b border-border-color/60 text-xs text-text-secondary select-none z-50">\n',
  '      <header id="windows-app-bar" className="h-9 min-w-0 flex items-center justify-between gap-3 px-3 sm:px-4 bg-sidebar-bg/60 border-b border-border-color/60 text-xs text-text-secondary select-none z-50">\n',
  'responsive app bar',
);
app = replaceOnce(
  app,
  '          <span className={`${libraryRuntimeTone} flex items-center space-x-1 font-semibold text-[10px]`}>\n',
  '          <span data-u30-runtime-status className={`${libraryRuntimeTone} u30-runtime-label flex min-w-0 items-center space-x-1 font-semibold text-[10px]`}>\n',
  'runtime status marker',
);
app = replaceOnce(
  app,
  '        <main ref={mainContentRef} className="flex-1 h-full overflow-y-auto scrollbar-thin px-6 md:px-10 py-6 bg-bg-primary">\n',
  '        <main ref={mainContentRef} className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin px-4 md:px-6 xl:px-10 py-4 md:py-6 pb-24 bg-bg-primary">\n',
  'responsive main content',
);
app = replaceOnce(
  app,
  '          <div id="u29-queue-drawer" className="absolute right-0 top-0 bottom-0 w-80 bg-sidebar-bg/95 backdrop-blur-xl border-l border-border-color z-40 p-4 shadow-2xl flex flex-col justify-between animate-fade-in">\n',
  '          <div id="u29-queue-drawer" role="dialog" aria-modal="true" aria-label="当前播放队列" className="absolute right-0 top-0 bottom-0 w-[min(20rem,calc(100vw-3rem))] bg-sidebar-bg/95 backdrop-blur-xl border-l border-border-color z-40 p-4 shadow-2xl flex flex-col justify-between animate-fade-in">\n',
  'responsive queue drawer',
);
app = replaceOnce(
  app,
  '                  <button \n                    onClick={() => setIsQueueOpen(false)}\n                    className="p-1 rounded hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"\n                  >\n',
  '                  <button \n                    id="queue-close-button"\n                    type="button"\n                    aria-label="关闭播放队列"\n                    onClick={() => setIsQueueOpen(false)}\n                    className="p-1 rounded hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color"\n                  >\n',
  'queue close button accessibility',
);
app = replaceOnce(
  app,
  '        <div className="fixed bottom-24 left-6 z-50 max-w-sm p-4 rounded-xl bg-card-bg/95 backdrop-blur-xl border border-brand-color/50 shadow-2xl flex flex-col space-y-3">\n',
  '        <div id="legacy-resume-toast" className="fixed bottom-24 left-6 z-50 max-w-[calc(100vw-3rem)] sm:max-w-sm p-4 rounded-xl bg-card-bg/95 backdrop-blur-xl border border-brand-color/50 shadow-2xl flex flex-col space-y-3">\n',
  'legacy resume toast marker',
);
write('src/App.tsx', app);

let sidebar = read('src/components/Sidebar.tsx');
sidebar = replaceOnce(
  sidebar,
  '      className="w-64 h-full flex flex-col border-r border-border-color bg-sidebar-bg/95 backdrop-blur-lg select-none"\n',
  '      className="w-56 xl:w-64 min-w-0 h-full flex flex-col border-r border-border-color bg-sidebar-bg/95 backdrop-blur-lg select-none"\n',
  'responsive sidebar width',
);
sidebar = replaceOnce(sidebar, '      <div className="p-6 flex items-center space-x-3">\n', '      <div className="p-4 xl:p-6 flex items-center space-x-3">\n', 'responsive sidebar header');
sidebar = replaceOnce(sidebar, '      <div className="px-4 mb-4">\n', '      <div className="px-3 xl:px-4 mb-4">\n', 'responsive sidebar search');
write('src/components/Sidebar.tsx', sidebar);

let playerBar = read('src/components/PlayerBar.tsx');
playerBar = replaceOnce(
  playerBar,
  '       className="h-20 bg-zinc-950 border-t border-zinc-800/80 px-8 flex items-center justify-between select-none relative z-50 text-white"\n',
  '       className="h-20 min-w-0 bg-zinc-950 border-t border-zinc-800/80 px-3 lg:px-5 xl:px-8 gap-2 flex items-center justify-between select-none relative z-50 text-white"\n',
  'responsive PlayerBar root',
);
playerBar = replaceOnce(
  playerBar,
  '         className="w-1/3 flex items-center space-x-4 pr-4"\n',
  '         className="u30-player-track w-[30%] min-w-0 flex items-center space-x-2 xl:space-x-4 pr-2 xl:pr-4"\n',
  'responsive PlayerBar track area',
);
write('src/components/PlayerBar.tsx', playerBar);

let primary = read('src/components/PlayerBarPrimarySections.tsx');
primary = replaceOnce(
  primary,
  '    <div className="flex-1 flex items-center justify-center" onClick={(event) => event.stopPropagation()}>\n',
  '    <div className="u30-player-transport flex-1 min-w-0 flex items-center justify-center" onClick={(event) => event.stopPropagation()}>\n',
  'transport root marker',
);
primary = replaceOnce(
  primary,
  '        className="flex items-center bg-zinc-900/40 border border-zinc-900 px-5 py-2.5 rounded-full shadow-inner space-x-5"\n',
  '        className="flex min-w-0 items-center bg-zinc-900/40 border border-zinc-900 px-3 xl:px-5 py-2.5 rounded-full shadow-inner space-x-2 xl:space-x-5"\n',
  'responsive transport spacing',
);
primary = replaceOnce(
  primary,
  '          type="button"\n          onClick={onToggleQueue}\n',
  '          id="player-queue-toggle"\n          type="button"\n          onClick={onToggleQueue}\n',
  'queue toggle id',
);
primary = replaceOnce(
  primary,
  '        <div className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1 pl-3.5 border-l border-zinc-800" aria-label={`播放时间 ${currentTimeLabel}，总时长 ${durationLabel}`}>\n',
  '        <div className="u30-player-time text-[10px] text-zinc-400 font-mono flex items-center space-x-1 pl-3.5 border-l border-zinc-800" aria-label={`播放时间 ${currentTimeLabel}，总时长 ${durationLabel}`}>\n',
  'player time marker',
);
write('src/components/PlayerBarPrimarySections.tsx', primary);

let auxiliary = read('src/components/PlayerBarAuxiliaryControls.tsx');
auxiliary = replaceOnce(
  auxiliary,
  '      className="w-1/3 flex items-center justify-end space-x-4 pl-4"\n',
  '      className="u30-player-aux w-[30%] min-w-0 flex items-center justify-end space-x-1 xl:space-x-4 pl-1 xl:pl-4"\n',
  'responsive auxiliary controls',
);
auxiliary = replaceOnce(
  auxiliary,
  '        className="text-[10px] border border-zinc-800 bg-zinc-900/60 text-zinc-300 px-2.5 py-1 rounded-full font-bold flex-shrink-0 hover:border-sky-500/40 hover:text-sky-300 disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"\n',
  '        className="u30-completion-control text-[10px] border border-zinc-800 bg-zinc-900/60 text-zinc-300 px-2.5 py-1 rounded-full font-bold flex-shrink-0 hover:border-sky-500/40 hover:text-sky-300 disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"\n',
  'completion marker',
);
auxiliary = replaceOnce(
  auxiliary,
  '        className="text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"\n',
  '        className="u30-more-control text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"\n',
  'more control marker',
);
write('src/components/PlayerBarAuxiliaryControls.tsx', auxiliary);

let css = read('src/index.css');
if (!css.includes('/* U30 responsive and accessibility contract */')) {
  css += `\n\n/* U30 responsive and accessibility contract */\n#root { min-width: 0; min-height: 100vh; }\n\n:where(button, [role="button"], input, select, textarea, a):focus-visible {\n  outline: 2px solid var(--brand-color, #818cf8);\n  outline-offset: 2px;\n}\n\n@media (max-width: 1120px) {\n  #windows-app-bar .u30-runtime-label { display: none; }\n  #app-player-bar .u30-player-track { width: 28%; }\n  #app-player-bar .u30-player-aux { width: auto; }\n  #app-player-bar .u30-player-time,\n  #app-player-bar .u30-completion-control,\n  #app-player-bar .u30-more-control { display: none; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    scroll-behavior: auto !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    transition-delay: 0ms !important;\n  }\n}\n`;
}
write('src/index.css', css);

const testSource = `#!/usr/bin/env node
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
  await cdp.evaluate('(() => { const element=document.querySelector(' + JSON.stringify(selector) + '); if(!element) throw new Error("Missing selector: ' + selector.replace(/"/g, '\\"') + '"); element.click(); return true; })()');
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
`;
write('scripts/test-u30-ui-matrix.mjs', testSource);

const verifier = `#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const css = fs.readFileSync('src/index.css', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const primary = fs.readFileSync('src/components/PlayerBarPrimarySections.tsx', 'utf8');
const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/branch-validation.yml', 'utf8');

for (const [label, ok] of [
  ['modern queue suppresses legacy resume toast', app.includes('if (playerQueuePersistenceService.load()) return;') && app.includes('id="legacy-resume-toast"')],
  ['queue supports Escape and focus return', app.includes('handleQueueEscape') && app.includes("getElementById('player-queue-toggle')")],
  ['queue toggle has stable id', primary.includes('id="player-queue-toggle"')],
  ['queue drawer is an accessible dialog', app.includes('role="dialog" aria-modal="true" aria-label="当前播放队列"')],
  ['minimum-window responsive classes exist', sidebar.includes('w-56 xl:w-64') && player.includes('u30-player-track') && primary.includes('u30-player-transport') && auxiliary.includes('u30-player-aux')],
  ['reduced motion contract exists', css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('animation-duration: 0.01ms !important')],
  ['compact player contract exists', css.includes('#app-player-bar .u30-player-time') && css.includes('#windows-app-bar .u30-runtime-label')],
  ['U30 UI matrix command exists', pkg.scripts?.['test:u30:ui-matrix'] === 'node scripts/test-u30-ui-matrix.mjs'],
  ['branch gate runs U30 UI matrix', workflow.includes('Run U30 UI and accessibility matrix') && workflow.includes('artifacts/u30-ui-matrix')],
]) {
  assert.equal(ok, true, label);
  console.log('PASS\\t' + label);
}
console.log('U30 UI fast-track verifier PASS');
`;
write('scripts/verify-u30-ui-fast-track.mjs', verifier);

const pkg = JSON.parse(read('package.json'));
pkg.scripts['test:u30:ui-matrix'] = 'node scripts/test-u30-ui-matrix.mjs';
pkg.scripts['verify:u30-ui-fast-track'] = 'node scripts/verify-u30-ui-fast-track.mjs';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

let workflow = read('.github/workflows/branch-validation.yml');
workflow = replaceOnce(
  workflow,
  '      - name: Run U29 player Electron E2E\n        run: npm run test:u29:electron-e2e\n\n      - name: Upload Electron E2E artifacts\n',
  '      - name: Run U29 player Electron E2E\n        run: npm run test:u29:electron-e2e\n\n      - name: Run U30 UI and accessibility matrix\n        run: npm run test:u30:ui-matrix\n\n      - name: Upload Electron E2E artifacts\n',
  'U30 workflow step',
);
workflow = workflow.replace('name: u28-u29-electron-e2e', 'name: u28-u30-electron-e2e');
workflow = workflow.replace('            artifacts/u29-electron-e2e\n', '            artifacts/u29-electron-e2e\n            artifacts/u30-ui-matrix\n');
write('.github/workflows/branch-validation.yml', workflow);

console.log('U30 fast-track patch applied.');
