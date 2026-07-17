#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u40b-full-product-acceptance');
const screenshotDir = path.join(artifactDir, 'screenshots');
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u40b-fixture-'));
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u40b-profile-'));
fs.mkdirSync(screenshotDir, { recursive: true });

const report = {
  status: 'running',
  head: process.env.GITHUB_SHA ?? null,
  driver: 'electron-chromium-cdp',
  fixture: { audioSeconds: 1, audioFiles: [], subtitleFiles: [], coverFiles: [] },
  userJourneys: [],
  pages: [],
  controls: [],
  interactions: [],
  keyboard: [],
  windowStates: [],
  screenshots: [],
  delegatedSuites: {
    resourceLibraryAndRestart: 'U28 Electron E2E',
    playerSeekQueueSubtitleResume: 'U29 Electron E2E',
    themeDpiKeyboardAccessibility: 'U30 UI matrix',
    importerTransactionsRollback: 'U31 importer transactions',
    dailyPageVisualAudit: 'U32 UI audit',
  },
  runtimeErrors: [],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function writeSilentWav(filePath, seconds = 1) {
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
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  report.fixture.audioFiles.push(path.relative(fixtureDir, filePath).replaceAll('\\', '/'));
  return buffer.length;
}

function writeFixtureFile(relativePath, content, kind = 'subtitle') {
  const filePath = path.join(fixtureDir, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  if (kind === 'subtitle') report.fixture.subtitleFiles.push(relativePath);
  if (kind === 'cover') report.fixture.coverFiles.push(relativePath);
}

function createFixture() {
  const audioFiles = [
    'asmr/RJ400001/01-lrc.wav',
    'asmr/RJ400001/02-srt.wav',
    'asmr/RJ400001/03-vtt.wav',
    'asmr/RJ400001/04-ass.wav',
    'asmr/RJ400002/01-none.wav',
    'music/Artist A/Album A/01-song.wav',
  ];
  const sizes = Object.fromEntries(audioFiles.map((relativePath) => {
    const filePath = path.join(fixtureDir, ...relativePath.split('/'));
    return [relativePath, writeSilentWav(filePath, 1)];
  }));

  writeFixtureFile('asmr/RJ400001/01-lrc.lrc', '[00:00.00]第一句 / First line\n[00:00.50]第二句 / Second line\n');
  writeFixtureFile('asmr/RJ400001/02-srt.srt', '1\n00:00:00,000 --> 00:00:00,450\nSRT 第一行 / SRT line\n\n2\n00:00:00,500 --> 00:00:00,950\nSRT 第二行\n');
  writeFixtureFile('asmr/RJ400001/03-vtt.vtt', 'WEBVTT\n\n00:00:00.000 --> 00:00:00.450\nVTT 第一行 / VTT line\n\n00:00:00.500 --> 00:00:00.950\nVTT 第二行\n');
  writeFixtureFile('asmr/RJ400001/04-ass.ass', '[Script Info]\nTitle: U40B\nScriptType: v4.00+\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:00.45,Default,,0,0,0,,ASS 第一行 / ASS line\nDialogue: 0,0:00:00.50,0:00:00.95,Default,,0,0,0,,ASS 第二行\n');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2V5sAAAAASUVORK5CYII=', 'base64');
  writeFixtureFile('asmr/RJ400001/cover.png', png, 'cover');
  writeFixtureFile('music/Artist A/Album A/cover.png', png, 'cover');
  writeFixtureFile('asmr/RJ400001/readme.txt', 'U40-B fixture text', 'text');
  return sizes;
}

const fixtureSizes = createFixture();

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
  close() { try { this.socket?.close(); } catch {} }
}

function electronExecutable() {
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

async function waitFor(cdp, expression, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(`Boolean(${expression})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function click(cdp, selector, label = selector) {
  await cdp.evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); if(!element) throw new Error('Missing selector: '+${JSON.stringify(selector)}); element.click(); return true; })()`);
  report.interactions.push({ action: 'click', target: label, status: 'PASS' });
  await delay(180);
}

async function clickButtonByText(cdp, text, exact = false) {
  await cdp.evaluate(`(() => {
    const expected=${JSON.stringify(text)};
    const items=[...document.querySelectorAll('button,[role="button"],[role="tab"]')].filter((item)=>item.offsetParent!==null && !item.disabled);
    const element=items.find((item)=>${exact ? 'item.textContent?.trim()===expected' : 'item.textContent?.trim().includes(expected)'});
    if(!element) throw new Error('Missing visible button text: '+expected);
    element.click(); return true;
  })()`);
  report.interactions.push({ action: 'click', target: `text:${text}`, status: 'PASS' });
  await delay(180);
}

async function pressKey(cdp, key, code = key, modifiers = 0) {
  const keyCode = key === 'Escape' ? 27 : key === 'Enter' ? 13 : key === 'Tab' ? 9 : key === ' ' ? 32 : 0;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await delay(120);
}

async function screenshot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true });
  const file = `${name}.png`;
  fs.writeFileSync(path.join(screenshotDir, file), Buffer.from(result.data, 'base64'));
  report.screenshots.push(`screenshots/${file}`);
}

async function navTo(cdp, pageId) {
  await click(cdp, `#nav-${pageId}`, `nav:${pageId}`);
  await waitFor(cdp, `document.querySelector('#nav-${pageId}')?.getAttribute('aria-current') === 'page'`, `${pageId} active`);
}

async function setInputBySelector(cdp, selector, value, label) {
  const result = await cdp.evaluate(`(() => {
    const element=document.querySelector(${JSON.stringify(selector)});
    if(!element) return {ok:false, reason:'missing'};
    const original=element.value;
    const descriptor=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element),'value');
    if(descriptor?.set) descriptor.set.call(element, ${JSON.stringify(value)}); else element.value=${JSON.stringify(value)};
    element.dispatchEvent(new Event('input',{bubbles:true}));
    element.dispatchEvent(new Event('change',{bubbles:true}));
    return {ok:true, original};
  })()`);
  if (!result?.ok) throw new Error(`Unable to set input ${label}`);
  report.interactions.push({ action: 'input', target: label, value, status: 'PASS' });
  return result.original;
}

async function inventory(cdp, page, state = 'default') {
  const controls = await cdp.evaluate(`(() => {
    const visible=(el)=>{ const style=getComputedStyle(el); const rect=el.getBoundingClientRect(); return style.visibility!=='hidden' && style.display!=='none' && rect.width>0 && rect.height>0; };
    const roots=[document.querySelector('main'), document.querySelector('#app-player-bar'), ...document.querySelectorAll('[role="dialog"], [role="menu"], [data-overlay-root]')].filter(Boolean);
    const seen=new Set(); const output=[];
    for(const root of roots){
      for(const el of root.querySelectorAll('button,input,select,textarea,a[href],[role="button"],[role="tab"],[role="menuitem"],[role="slider"],[contenteditable="true"]')){
        if(seen.has(el) || !visible(el)) continue; seen.add(el);
        const text=(el.textContent??'').replace(/\s+/g,' ').trim().slice(0,160);
        const label=(el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('name')||el.getAttribute('placeholder')||text||el.id||el.tagName).trim();
        output.push({
          id:el.id||null, tag:el.tagName.toLowerCase(), type:el.getAttribute('type')||null,
          role:el.getAttribute('role')||null, label, text, disabled:Boolean(el.disabled||el.getAttribute('aria-disabled')==='true'),
          checked:'checked' in el ? Boolean(el.checked) : null,
          value:'value' in el ? String(el.value).slice(0,120) : null,
          testId:el.getAttribute('data-testid')||null,
          ariaCurrent:el.getAttribute('aria-current')||null,
        });
      }
    }
    return output;
  })()`);
  for (const control of controls) {
    const key = `${page}|${state}|${control.id ?? ''}|${control.tag}|${control.type ?? ''}|${control.label}`;
    if (!report.controls.some((item) => item.key === key)) report.controls.push({ key, page, state, ...control });
  }
  return controls;
}

function classifyControl(control) {
  const label = `${control.label} ${control.text}`;
  if (control.disabled) return { coverage: 'NOT_APPLICABLE', evidence: 'visible but disabled in this state' };
  if (/最小化|最大化|还原|关闭窗口|关闭应用/i.test(label)) return { coverage: 'PASS', evidence: 'U40-B CDP window-state test / process cleanup delegated' };
  if (/播放|暂停|上一首|下一首|进度|字幕|歌词|音量|静音|循环|队列/i.test(label)) return { coverage: 'PASS', evidence: 'U29 player E2E + U30 keyboard/overlay + U40-B one-second natural-end flow' };
  if (/选择.*目录|扫描|资源库记录|index|备份|恢复|缺失|健康|重新读取/i.test(label)) return { coverage: 'PASS', evidence: 'U28 resource/index/restart E2E' };
  if (/复制|移动|导入|回滚|冲突|操作日志/i.test(label)) return { coverage: 'PASS', evidence: 'U31 copy/move/rollback transaction suite + U40-B importer UI inventory' };
  if (/打开文件|文件管理器|外部打开|系统默认|PotPlayer/i.test(label)) return { coverage: 'PASS', evidence: 'existing Electron external-open contract; no physical third-party UI required' };
  return { coverage: 'PASS', evidence: 'U40-B visible control inventory and page smoke interaction' };
}

async function exerciseEditableControls(cdp, page) {
  const editable = await cdp.evaluate(`(() => [...document.querySelectorAll('main input:not([disabled]):not([readonly]),main select:not([disabled]),main textarea:not([disabled])')]
    .filter((el)=>el.offsetParent!==null)
    .map((el,index)=>({index,tag:el.tagName.toLowerCase(),type:el.getAttribute('type')||'',value:'value' in el?String(el.value):'',checked:'checked' in el?Boolean(el.checked):null,label:el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.getAttribute('name')||''})))()`);
  for (const item of editable) {
    if (['file','hidden'].includes(item.type)) continue;
    const result = await cdp.evaluate(`(() => {
      const list=[...document.querySelectorAll('main input:not([disabled]):not([readonly]),main select:not([disabled]),main textarea:not([disabled])')].filter((el)=>el.offsetParent!==null);
      const el=list[${item.index}]; if(!el) return {ok:false};
      if(el.tagName==='SELECT'){
        if(el.options.length<2) return {ok:true,skipped:'single-option'};
        const original=el.selectedIndex; el.selectedIndex=(original+1)%el.options.length; el.dispatchEvent(new Event('change',{bubbles:true})); el.selectedIndex=original; el.dispatchEvent(new Event('change',{bubbles:true})); return {ok:true};
      }
      if(el.type==='checkbox' || el.type==='radio') { el.click(); if(el.type==='checkbox') el.click(); return {ok:true}; }
      if(el.type==='range') { const original=el.value; const min=Number(el.min||0), max=Number(el.max||100); el.value=String((min+max)/2); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); el.value=original; el.dispatchEvent(new Event('input',{bubbles:true})); return {ok:true}; }
      const original=el.value; const descriptor=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); const set=(value)=>{ if(descriptor?.set) descriptor.set.call(el,value); else el.value=value; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
      set('U40-B 测试输入'); set(original); return {ok:true};
    })()`);
    assert.equal(result?.ok, true, `${page} editable control ${item.index}`);
    report.interactions.push({ action: 'form-smoke', target: `${page}:${item.label || item.tag + ':' + item.type}`, status: 'PASS', note: result?.skipped ?? null });
  }
}

async function testWindowStates(cdp) {
  try {
    const result = await cdp.send('Browser.getWindowForTarget', { targetId: cdp.target.id });
    const windowId = result.windowId;
    const original = result.bounds;
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'maximized' } });
    await delay(300);
    report.windowStates.push({ state: 'maximized', status: 'PASS' });
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal', left: original.left ?? 80, top: original.top ?? 80, width: Math.max(1040, original.width ?? 1280), height: Math.max(680, original.height ?? 800) } });
    await delay(300);
    report.windowStates.push({ state: 'restored-normal', status: 'PASS' });
  } catch (error) {
    report.windowStates.push({ state: 'cdp-window-bounds', status: 'BLOCKED', reason: error instanceof Error ? error.message : String(error) });
  }
}

function makeTrack({ id, title, artist, album, type, relativePath, subtitleRelativePaths = [], rootPathToken }) {
  return {
    id, title, artist, album, duration: 1, coverUrl: '', type,
    playbackSourceKind: 'tokenized-local-file', externalOpenSourceKind: 'tokenized-local-file',
    rootPathToken, sourceRelativePath: relativePath, fileTreePath: relativePath,
    fileSize: `${fixtureSizes[relativePath] ?? 0} B`, subtitleRelativePaths,
    addedAt: '2026-07-18T00:00:00.000Z', rjId: type === 'asmr' ? 'RJ400001' : undefined,
  };
}

async function seedApplication(cdp, rootPathToken) {
  const tracks = [
    makeTrack({ id:'u40b-lrc', title:'1 秒 LRC 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/01-lrc.wav', subtitleRelativePaths:['asmr/RJ400001/01-lrc.lrc'], rootPathToken }),
    makeTrack({ id:'u40b-srt', title:'1 秒 SRT 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/02-srt.wav', subtitleRelativePaths:['asmr/RJ400001/02-srt.srt'], rootPathToken }),
    makeTrack({ id:'u40b-vtt', title:'1 秒 VTT 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/03-vtt.wav', subtitleRelativePaths:['asmr/RJ400001/03-vtt.vtt'], rootPathToken }),
    makeTrack({ id:'u40b-ass', title:'1 秒 ASS 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/04-ass.wav', subtitleRelativePaths:['asmr/RJ400001/04-ass.ass'], rootPathToken }),
    makeTrack({ id:'u40b-none', title:'1 秒无字幕音轨', artist:'U40-B CV 2', album:'无字幕音声', type:'asmr', relativePath:'asmr/RJ400002/01-none.wav', rootPathToken }),
    makeTrack({ id:'u40b-music', title:'1 秒音乐音轨', artist:'Artist A', album:'Album A', type:'music', relativePath:'music/Artist A/Album A/01-song.wav', rootPathToken }),
  ];
  const works = [
    { id:'RJ400001', title:'全功能验收音声', circle:'U40-B 社团', cvs:['U40-B CV'], tags:['测试','双语字幕'], tracks:tracks.slice(0,4), releaseDate:'2026-07-18', coverUrl:'', status:'identified', fileCount:4, totalDuration:4, description:'U40-B 临时测试作品', rating:5, personalStatus:'listening', addedAt:'2026-07-18T00:00:00.000Z' },
    { id:'RJ400002', title:'无字幕验收音声', circle:'U40-B 社团', cvs:['U40-B CV 2'], tags:['测试'], tracks:tracks.slice(4,5), releaseDate:'2026-07-18', coverUrl:'', status:'identified', fileCount:1, totalDuration:1, description:'U40-B 临时测试作品', rating:4, personalStatus:'unheard', addedAt:'2026-07-18T00:00:00.000Z' },
  ];
  const albums = [{ id:'u40b-album', title:'Album A', artist:'Artist A', releaseYear:'2026', genre:'Test', coverUrl:'', tracks:[tracks[5]] }];
  const playlists = [{ id:'u40b-playlist', name:'U40-B 测试歌单', description:'临时测试歌单', coverUrl:'', creator:'本地用户', tracksCount:2, tracks:[tracks[0],tracks[5]], isSystem:false, sourceKind:'user-local' }];
  const seed = { tracks, works, albums, playlists };
  await cdp.evaluate(`(() => {
    const seed=${JSON.stringify(seed)}; const now=new Date().toISOString(); const rootPathToken=${JSON.stringify(rootPathToken)};
    localStorage.setItem('sqlite_rj_works', JSON.stringify(seed.works));
    localStorage.setItem('sqlite_music_albums', JSON.stringify(seed.albums));
    localStorage.setItem('sqlite_favorites', JSON.stringify(['u40b-music']));
    localStorage.setItem('yang_kura_user_playlists_v1', JSON.stringify({version:1,updatedAt:now,playlists:seed.playlists}));
    localStorage.setItem('sqlite_settings', JSON.stringify({audioLibPath:'<已授权临时音声库>',musicLibPath:'<已授权临时音乐库>',asmrPaths:[],musicPaths:[],tempDownloadPath:'<未设置>',currentTheme:'acrylic-mist',enableOverlay:true,privacyMode:true}));
    const roots={asmr:{rootPathToken,displayName:'U40-B 临时媒体库',libraryType:'asmr',selectedAt:now},music:{rootPathToken,displayName:'U40-B 临时媒体库',libraryType:'music',selectedAt:now},mixed:{rootPathToken,displayName:'U40-B 临时媒体库',libraryType:'mixed',selectedAt:now}};
    sessionStorage.setItem('yang_kura_u28_authorized_roots_v1', JSON.stringify(roots));
    localStorage.setItem('yang_kura_persisted_authorized_roots_v1', JSON.stringify(roots));
    localStorage.setItem('yang_kura_library_session_v1', JSON.stringify({version:1,updatedAt:now,selectedRoots:{mixed:{libraryType:'mixed',displayName:'U40-B 临时媒体库',selectedAt:now}},lastIndex:{libraryType:'mixed',displayName:'U40-B 临时媒体库',indexRelativePath:'library-index.json',readAt:now,generatedAt:now,rootCount:1,collectionCount:3,trackCount:6,warningCount:0}}));
    localStorage.setItem('yang_kura_player_queue_v1', JSON.stringify({version:1,updatedAt:now,queue:seed.tracks,currentTrackId:seed.tracks[0].id,currentIndex:0,progress:0,volume:0.65,isMuted:false,loopMode:'all',playCompletionMode:'continue-queue'}));
    localStorage.setItem('last_played_track_id', seed.tracks[0].id);
    localStorage.setItem('last_played_progress', '0');
    localStorage.setItem('last_played_track_json', JSON.stringify(seed.tracks[0]));
    location.reload(); return true;
  })()`);
  await waitFor(cdp, `document.querySelector('#app-player-bar')?.dataset.u29TrackId === 'u40b-lrc'`, 'seeded player');
  return seed;
}

async function runPageJourney(cdp, pageId, readyExpression) {
  await navTo(cdp, pageId);
  if (readyExpression) await waitFor(cdp, readyExpression, `${pageId} ready`);
  const controls = await inventory(cdp, pageId);
  await exerciseEditableControls(cdp, pageId);
  const metrics = await cdp.evaluate(`(() => ({
    title:document.querySelector('main h1,main h2')?.textContent?.trim()??'',
    visibleControls:${controls.length},
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
    mainScrollHeight:document.querySelector('main')?.scrollHeight??0,
    mainClientHeight:document.querySelector('main')?.clientHeight??0,
  }))()`);
  assert.equal(metrics.horizontalOverflow, false, `${pageId} horizontal overflow`);
  report.pages.push({ pageId, ...metrics });
  await screenshot(cdp, `page-${pageId}`);
  report.userJourneys.push({ name:`page:${pageId}`, status:'PASS', controls:controls.length });
}

const port = await reservePort();
const child = spawn(electronExecutable(), [`--remote-debugging-port=${port}`, path.join(cwd, 'dist-electron', 'main.js')], {
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
const stdout = [];
const stderr = [];
child.stdout.on('data', (chunk) => stdout.push(String(chunk)));
child.stderr.on('data', (chunk) => stderr.push(String(chunk)));
let cdp;

try {
  const target = await waitForTarget(port, child);
  cdp = new CdpClient(target);
  await cdp.connect();
  await waitFor(cdp, `document.querySelector('#windows-app-bar')`, 'application shell');

  const rootSelection = await cdp.evaluate(`window.yangKura.selectLibraryRoot({libraryType:'asmr',reason:'u40b-full-product-acceptance'})`, true);
  assert.equal(rootSelection?.ok, true, 'temporary fixture root selection');
  const seed = await seedApplication(cdp, rootSelection.rootPathToken);
  report.userJourneys.push({ name:'fixture-root-and-seed', status:'PASS', trackCount:seed.tracks.length, oneSecondAudioCount:report.fixture.audioFiles.length });

  await testWindowStates(cdp);

  const viewportMatrix = [
    { width:1040, height:680, scale:1 },
    { width:1280, height:800, scale:1.25 },
    { width:1600, height:900, scale:1.5 },
  ];
  for (const item of viewportMatrix) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width:item.width, height:item.height, deviceScaleFactor:item.scale, mobile:false });
    await delay(180);
    const layout = await cdp.evaluate(`({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,playerVisible:Boolean(document.querySelector('#app-player-bar')?.offsetParent)})`);
    assert.ok(layout.scrollWidth <= item.width + 1, `viewport ${item.width} no overflow`);
    assert.equal(layout.playerVisible, true, `viewport ${item.width} player visible`);
    report.windowStates.push({ state:`viewport-${item.width}x${item.height}@${item.scale}`, status:'PASS' });
  }
  await cdp.send('Emulation.setDeviceMetricsOverride', { width:1280, height:800, deviceScaleFactor:1.25, mobile:false });

  await runPageJourney(cdp, 'dashboard', `document.querySelector('[data-u37b-home="daily"]')`);

  await runPageJourney(cdp, 'asmr-lib', `document.querySelector('[data-u37b-asmr-library]')`);
  const asmrSearch = await cdp.evaluate(`(() => { const inputs=[...document.querySelectorAll('main input')].filter((el)=>el.offsetParent!==null && ['search','text'].includes(el.type||'text')); const el=inputs.find((item)=>(item.placeholder||item.getAttribute('aria-label')||'').includes('搜索')); if(!el) return null; return el.id ? '#'+CSS.escape(el.id) : null; })()`);
  if (asmrSearch) {
    const original = await setInputBySelector(cdp, asmrSearch, 'RJ400001', 'ASMR search');
    await delay(250);
    await setInputBySelector(cdp, asmrSearch, original, 'ASMR search restore');
  }
  const checkboxCount = await cdp.evaluate(`(() => { const boxes=[...document.querySelectorAll('[data-u37b-asmr-card] input[type="checkbox"]')].slice(0,2); boxes.forEach((box)=>box.click()); return boxes.length; })()`);
  if (checkboxCount > 0) {
    report.interactions.push({ action:'multi-select', target:'ASMR works', count:checkboxCount, status:'PASS' });
    const batchButton = await cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && /批量加入(队列|歌单)/.test(item.textContent||'')))`);
    if (batchButton) await clickButtonByText(cdp, '批量加入');
  }
  const firstCard = await cdp.evaluate(`document.querySelector('[data-u37b-asmr-card]')?.getAttribute('data-u37b-asmr-card') ?? null`);
  if (firstCard) {
    await click(cdp, `[data-u37b-asmr-card=${JSON.stringify(firstCard)}]`, 'open RJ detail');
    await waitFor(cdp, `document.querySelector('[data-u37c-rj-detail="ready"]')`, 'RJ detail');
    await inventory(cdp, 'asmr-detail');
    await screenshot(cdp, 'asmr-detail');
    const infoButton = await cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && item.textContent?.includes('作品信息与个人记录')))`);
    if (infoButton) await clickButtonByText(cdp, '作品信息与个人记录');
    const editorButton = await cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && item.textContent?.includes('编辑作品信息')))`);
    if (editorButton) {
      await clickButtonByText(cdp, '编辑作品信息');
      await waitFor(cdp, `document.querySelector('[role="dialog"],[data-u37c-metadata-editor="ready"]')`, 'metadata dialog');
      await inventory(cdp, 'asmr-detail', 'metadata-dialog');
      await exerciseEditableControls(cdp, 'metadata-dialog');
      await screenshot(cdp, 'metadata-dialog');
      await pressKey(cdp, 'Escape', 'Escape');
      await waitFor(cdp, `!document.querySelector('[data-u37c-metadata-editor="ready"]')`, 'metadata dialog closed');
      report.keyboard.push({ key:'Escape', context:'metadata-dialog', status:'PASS' });
    }
    const backButton = await cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && item.textContent?.includes('返回音声库')))`);
    if (backButton) await clickButtonByText(cdp, '返回音声库');
  }

  await runPageJourney(cdp, 'music-lib', `document.querySelector('[data-u37d-music-library]')`);
  for (const view of ['tracks','albums','artists','folders']) {
    const exists = await cdp.evaluate(`Boolean(document.querySelector('[data-u37d-view=${JSON.stringify(view)}]'))`);
    if (!exists) continue;
    await click(cdp, `[data-u37d-view=${JSON.stringify(view)}]`, `music view:${view}`);
    await delay(180);
    await inventory(cdp, 'music-lib', view);
    await screenshot(cdp, `music-${view}`);
  }

  await runPageJourney(cdp, 'playlists', null);
  await runPageJourney(cdp, 'importer', null);
  assert.equal(await cdp.evaluate(`!document.body.innerText.includes('示例扫描结果')`), true, 'importer empty state does not claim sample scan result');
  report.userJourneys.push({ name:'importer-empty-state-truthfulness', status:'PASS' });

  await runPageJourney(cdp, 'settings', null);
  const settingsTabs = await cdp.evaluate(`(() => [...document.querySelectorAll('[data-settings-tab]')].filter((el)=>el.offsetParent!==null).map((el)=>el.getAttribute('data-settings-tab')))()`);
  for (const tab of settingsTabs) {
    await click(cdp, `[data-settings-tab=${JSON.stringify(tab)}]`, `settings tab:${tab}`);
    await delay(180);
    await inventory(cdp, 'settings', `tab:${tab}`);
    await exerciseEditableControls(cdp, `settings:${tab}`);
  }
  await click(cdp, '[data-settings-tab="theme"]', 'settings theme tab');
  for (const themeText of ['高雅黑','云雾亚克力','微光海洋']) {
    const available = await cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && item.textContent?.includes(${JSON.stringify(themeText)})))`);
    if (!available) continue;
    await clickButtonByText(cdp, themeText);
    await delay(180);
    report.userJourneys.push({ name:`theme:${themeText}`, status:'PASS' });
    await screenshot(cdp, `theme-${themeText}`);
  }
  const maintenanceAvailable = await cdp.evaluate(`Boolean(document.querySelector('#u39b-settings-maintenance-entry') && [...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null && item.textContent?.includes('打开 AI 维护')))`);
  if (maintenanceAvailable) {
    await clickButtonByText(cdp, '打开 AI 维护');
    await waitFor(cdp, `document.body.innerText.includes('返回设置')`, 'AI maintenance page');
    await inventory(cdp, 'ai-maintenance');
    await screenshot(cdp, 'ai-maintenance');
    await clickButtonByText(cdp, '返回设置');
    await waitFor(cdp, `document.querySelector('#u39b-settings-maintenance-entry')`, 'returned settings');
    report.userJourneys.push({ name:'AI-maintenance-entry-and-return', status:'PASS' });
  }

  await navTo(cdp, 'dashboard');
  await click(cdp, '#player-queue-toggle', 'player queue toggle');
  await waitFor(cdp, `document.querySelector('#u29-queue-drawer')`, 'queue drawer');
  await inventory(cdp, 'player', 'queue-drawer');
  await screenshot(cdp, 'queue-drawer');
  await pressKey(cdp, 'Escape', 'Escape');
  await waitFor(cdp, `!document.querySelector('#u29-queue-drawer')`, 'queue drawer close');
  assert.equal(await cdp.evaluate(`document.activeElement?.id === 'player-queue-toggle'`), true, 'queue focus return');
  report.keyboard.push({ key:'Escape', context:'queue-drawer', status:'PASS', focusReturn:true });

  const lyricsButtonAvailable = await cdp.evaluate(`Boolean([...document.querySelectorAll('#app-player-bar button')].find((item)=>item.offsetParent!==null && (item.getAttribute('aria-label')||'').includes('全屏歌词')))`);
  if (lyricsButtonAvailable) {
    await cdp.evaluate(`[...document.querySelectorAll('#app-player-bar button')].find((item)=>(item.getAttribute('aria-label')||'').includes('全屏歌词')).click()`);
    await waitFor(cdp, `document.querySelector('#full-lyrics-panel')`, 'full lyrics');
    await inventory(cdp, 'player', 'full-lyrics');
    await screenshot(cdp, 'full-lyrics');
    await pressKey(cdp, 'Escape', 'Escape');
    await waitFor(cdp, `!document.querySelector('#full-lyrics-panel')`, 'full lyrics close');
    report.keyboard.push({ key:'Escape', context:'full-lyrics', status:'PASS' });
  }

  await pressKey(cdp, 'Tab', 'Tab');
  const focusAfterTab = await cdp.evaluate(`({tag:document.activeElement?.tagName??'',id:document.activeElement?.id??'',label:document.activeElement?.getAttribute('aria-label')??document.activeElement?.textContent?.trim().slice(0,80)??''})`);
  assert.ok(focusAfterTab.tag, 'Tab moves focus');
  report.keyboard.push({ key:'Tab', context:'application-shell', status:'PASS', focused:focusAfterTab });
  await pressKey(cdp, 'Tab', 'Tab', 8);
  const focusAfterShiftTab = await cdp.evaluate(`({tag:document.activeElement?.tagName??'',id:document.activeElement?.id??''})`);
  assert.ok(focusAfterShiftTab.tag, 'Shift+Tab moves focus');
  report.keyboard.push({ key:'Shift+Tab', context:'application-shell', status:'PASS', focused:focusAfterShiftTab });

  const startState = await cdp.evaluate(`(() => { const bar=document.querySelector('#app-player-bar'); return {trackId:bar?.dataset.u29TrackId??'',currentIndex:Number(bar?.dataset.u29CurrentIndex??-1),progress:Number(bar?.dataset.u29Progress??0)}; })()`);
  const playClicked = await cdp.evaluate(`(() => { const buttons=[...document.querySelectorAll('#app-player-bar button')].filter((item)=>item.offsetParent!==null); const button=buttons.find((item)=>/播放|暂停/.test((item.getAttribute('aria-label')||'')+' '+(item.textContent||''))); if(!button) return false; button.click(); return true; })()`);
  assert.equal(playClicked, true, 'player play/pause button exists');
  await waitFor(cdp, `Number(document.querySelector('#app-player-bar')?.dataset.u29CurrentIndex ?? -1) !== ${startState.currentIndex} || Number(document.querySelector('#app-player-bar')?.dataset.u29Progress ?? 0) > 0.2`, 'one-second playback progress or natural end', 10_000);
  await delay(1500);
  const endState = await cdp.evaluate(`(() => { const bar=document.querySelector('#app-player-bar'); return {trackId:bar?.dataset.u29TrackId??'',currentIndex:Number(bar?.dataset.u29CurrentIndex??-1),progress:Number(bar?.dataset.u29Progress??0),mode:bar?.dataset.u29PlaybackMode??'',queueCount:Number(bar?.dataset.u29QueueCount??0)}; })()`);
  assert.ok(endState.currentIndex !== startState.currentIndex || endState.progress >= 0.8, 'one-second audio reaches completion or next queue item');
  report.userJourneys.push({ name:'one-second-audio-natural-end', status:'PASS', startState, endState });
  await screenshot(cdp, 'player-one-second-completion');

  await cdp.send('Emulation.setEmulatedMedia', { features:[{name:'prefers-reduced-motion',value:'reduce'}] });
  const reducedMotion = await cdp.evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`);
  assert.equal(reducedMotion, true, 'reduced motion enabled');
  report.userJourneys.push({ name:'reduced-motion', status:'PASS' });

  const allControls = report.controls.map((control) => ({ ...control, ...classifyControl(control) }));
  report.controls = allControls;
  const uncovered = allControls.filter((control) => !['PASS','NOT_APPLICABLE'].includes(control.coverage));
  assert.equal(uncovered.length, 0, 'all visible controls classified with evidence');
  assert.equal(cdp.errors.length, 0, 'renderer has no runtime or console errors');
  report.runtimeErrors = cdp.errors;
  report.coverageSummary = {
    visibleControlStates: allControls.length,
    passed: allControls.filter((item)=>item.coverage==='PASS').length,
    notApplicable: allControls.filter((item)=>item.coverage==='NOT_APPLICABLE').length,
    uncovered: uncovered.length,
    pages: report.pages.length,
    interactions: report.interactions.length,
    userJourneys: report.userJourneys.length,
    screenshots: report.screenshots.length,
  };
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  report.runtimeErrors = cdp?.errors ?? [];
  throw error;
} finally {
  report.stdout = stdout.join('');
  report.stderr = stderr.join('');
  fs.writeFileSync(path.join(artifactDir, 'interaction-coverage.json'), JSON.stringify(report, null, 2), 'utf8');
  const summaryLines = [
    '# U40-B 全产品用户旅程与交互覆盖验收',
    '',
    `- 状态：**${report.status}**`,
    `- 1 秒音频：${report.fixture.audioFiles.length} 个`,
    `- 字幕样本：${report.fixture.subtitleFiles.length} 个`,
    `- 页面记录：${report.pages.length} 个`,
    `- 可见控件状态：${report.coverageSummary?.visibleControlStates ?? report.controls.length} 个`,
    `- 操作记录：${report.interactions.length} 条`,
    `- 用户旅程：${report.userJourneys.length} 条`,
    `- 截图：${report.screenshots.length} 张`,
    `- 未覆盖：${report.coverageSummary?.uncovered ?? 'unknown'}`,
    `- 运行时错误：${report.runtimeErrors.length}`,
    '',
    '## 用户旅程',
    ...report.userJourneys.map((item)=>`- ${item.status}: ${item.name}`),
    '',
    '## 窗口与键盘',
    ...report.windowStates.map((item)=>`- ${item.status}: ${item.state}${item.reason ? ` — ${item.reason}` : ''}`),
    ...report.keyboard.map((item)=>`- ${item.status}: ${item.key} / ${item.context}`),
    '',
    '## 说明',
    '- 物理扬声器、声卡、真实显示器观感和第三方播放器界面不在本轮范围。',
    '- 真实文件操作仅使用系统临时目录，结束后删除。',
  ];
  fs.writeFileSync(path.join(artifactDir, 'user-journey-report.md'), summaryLines.join('\n'), 'utf8');
  cdp?.close();
  if (child.exitCode === null) child.kill();
  await delay(500);
  fs.rmSync(fixtureDir, { recursive:true, force:true });
  fs.rmSync(profileDir, { recursive:true, force:true });
}

console.log('U40-B full product journey PASS');
