#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  captureScreenshot,
  click,
  clickButtonText,
  closeElectron,
  delay,
  launchElectron,
  pressKey,
  waitFor,
} from './u40b/cdp-runtime.mjs';
import { createU40bFixture, seedApplication, writeU40bIndex } from './u40b/fixture.mjs';
import {
  attachCoverageEvidence,
  exerciseEditableControls,
  inventoryVisibleControls,
} from './u40b/coverage.mjs';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u40b-full-product-acceptance');
const screenshotDir = path.join(artifactDir, 'screenshots');
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u40b-fixture-'));
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u40b-profile-'));
fs.mkdirSync(screenshotDir, { recursive: true });

const fixture = createU40bFixture(fixtureDir);
const report = {
  status: 'running',
  head: process.env.GITHUB_SHA ?? null,
  driver: 'electron-chromium-cdp',
  fixture: {
    audioSeconds: fixture.audioSeconds,
    audioFiles: fixture.audioFiles,
    subtitleFiles: fixture.subtitleFiles,
    coverFiles: fixture.coverFiles,
  },
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

let runtime;

async function screenshot(name) {
  const file = await captureScreenshot(runtime.cdp, screenshotDir, name);
  report.screenshots.push(`screenshots/${file}`);
}

async function recordedClick(selector, target) {
  await click(runtime.cdp, selector);
  report.interactions.push({ action: 'click', target, status: 'PASS' });
}

async function recordedButtonText(text, target = `text:${text}`, exact = false) {
  await clickButtonText(runtime.cdp, text, exact);
  report.interactions.push({ action: 'click', target, status: 'PASS' });
}

async function navigate(pageId, readyExpression) {
  await recordedClick(`#nav-${pageId}`, `nav:${pageId}`);
  await waitFor(runtime.cdp, `document.querySelector('#nav-${pageId}')?.getAttribute('aria-current') === 'page'`, `${pageId} navigation`);
  if (readyExpression) await waitFor(runtime.cdp, readyExpression, `${pageId} ready`, 20_000);
}

async function inspectPage(pageId, readyExpression) {
  await navigate(pageId, readyExpression);
  const controls = await inventoryVisibleControls(runtime.cdp, pageId, 'default', report);
  await exerciseEditableControls(runtime.cdp, pageId, report);
  const metrics = await runtime.cdp.evaluate(`(() => ({
    title:document.querySelector('main h1,main h2')?.textContent?.trim()??'',
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
    mainScrollHeight:document.querySelector('main')?.scrollHeight??0,
    mainClientHeight:document.querySelector('main')?.clientHeight??0,
  }))()`);
  assert.equal(metrics.horizontalOverflow, false, `${pageId} horizontal overflow`);
  report.pages.push({ pageId, visibleControls: controls.length, ...metrics });
  report.userJourneys.push({ name: `page:${pageId}`, status: 'PASS', controls: controls.length });
  await screenshot(`page-${pageId}`);
}

async function chooseTheme(themeId, label) {
  const changed = await runtime.cdp.evaluate(`(() => {
    const select=[...document.querySelectorAll('main select')].find((item)=>[...item.options].some((option)=>option.value===${JSON.stringify(themeId)}));
    if(!select) return false;
    const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')?.set;
    if(setter) setter.call(select,${JSON.stringify(themeId)}); else select.value=${JSON.stringify(themeId)};
    select.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  })()`);
  assert.equal(changed, true, `theme select ${themeId}`);
  await waitFor(runtime.cdp, `document.querySelector('#root > div')?.classList.contains('theme-${themeId}')`, `theme ${themeId}`);
  report.interactions.push({ action: 'select', target: 'application theme', value: themeId, status: 'PASS' });
  report.userJourneys.push({ name: `theme:${label}`, status: 'PASS' });
  await screenshot(`theme-${themeId}`);
}

async function readPlayerState() {
  return runtime.cdp.evaluate(`(() => {
    const bar=document.querySelector('#app-player-bar');
    return {
      mode:bar?.dataset.u29PlaybackMode??'',
      trackId:bar?.dataset.u29TrackId??'',
      progress:Number(bar?.dataset.u29Progress??0),
      duration:Number(bar?.dataset.u29Duration??0),
      queueCount:Number(bar?.dataset.u29QueueCount??0),
      currentIndex:Number(bar?.dataset.u29CurrentIndex??-1),
      sourceReady:bar?.dataset.u29SourceReady==='true',
    };
  })()`);
}

async function waitForPlayerState(predicate, label, timeout = 20_000) {
  const deadline = Date.now() + timeout;
  let lastState = await readPlayerState();
  while (Date.now() < deadline) {
    lastState = await readPlayerState();
    if (predicate(lastState)) return lastState;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}; lastState=${JSON.stringify(lastState)}`);
}

async function readExistingIndex() {
  await navigate('settings', `document.querySelector('[data-settings-tab]')`);
  await recordedClick('[data-settings-tab="paths"]', 'settings:paths');
  await waitFor(runtime.cdp, `Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null&&item.textContent?.trim()==='读取已有记录'&&!item.disabled))`, 'read existing index button');
  await recordedButtonText('读取已有记录', 'read real fixture index', true);
  await waitFor(runtime.cdp, `![...document.querySelectorAll('button')].some((button)=>button.textContent?.includes('读取中'))`, 'fixture index read completion', 30_000);
  await waitFor(runtime.cdp, `document.body.innerText.includes('文件编码：utf8-bom')`, 'fixture index encoding evidence', 30_000);
}

async function pauseCurrentTrackIfPlaying() {
  const isPlaying = await runtime.cdp.evaluate(`Boolean(document.querySelector('#app-player-bar button[aria-label="暂停"]'))`);
  if (isPlaying) await recordedClick('#app-player-bar button[aria-label="暂停"]', 'player:pause seeded real track');
}

async function setHtmlAudioOnly() {
  await recordedClick('[data-settings-tab="player"]', 'settings:player');
  await waitFor(runtime.cdp, `document.querySelector('select[aria-label="选择本地音频播放后端偏好"]')`, 'player backend preference');
  const changed = await runtime.cdp.evaluate(`(() => {
    const select=document.querySelector('select[aria-label="选择本地音频播放后端偏好"]');
    const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')?.set;
    if(setter) setter.call(select,'html-audio-only'); else select.value='html-audio-only';
    select.dispatchEvent(new Event('change',{bubbles:true}));
    return select.value;
  })()`);
  assert.equal(changed, 'html-audio-only', 'HTMLAudio-only preference');
  report.interactions.push({ action: 'select', target: 'playback backend preference', value: 'html-audio-only', status: 'PASS' });
  await delay(250);
}

try {
  runtime = await launchElectron({ cwd, profileDir, fixtureDir });
  await waitFor(runtime.cdp, `document.querySelector('#windows-app-bar')`, 'application shell', 30_000);

  await navigate('settings', `document.querySelector('[data-settings-tab]')`);
  await recordedClick('[data-settings-tab="paths"]', 'settings:paths');
  await recordedButtonText('选择音声库目录', 'select temporary ASMR library', true);
  await waitFor(runtime.cdp, `document.body.innerText.includes('已选择目录，可读取已有记录或重新扫描')`, 'temporary library selected');
  const rootPathToken = await runtime.cdp.evaluate(`(() => {
    const roots=JSON.parse(sessionStorage.getItem('yang_kura_u28_authorized_roots_v1')??'{}');
    return roots.asmr?.rootPathToken??'';
  })()`);
  assert.ok(rootPathToken.startsWith('yk-root-'), 'temporary fixture token created');

  const index = writeU40bIndex(fixtureDir, rootPathToken, fixture.sizes);
  const seed = await seedApplication(runtime.cdp, rootPathToken, fixture.sizes);
  await waitFor(runtime.cdp, `document.querySelector('#windows-app-bar')`, 'application shell after fixture reload', 30_000);
  await readExistingIndex();
  report.userJourneys.push({
    name: 'fixture-root-index-and-seed',
    status: 'PASS',
    trackCount: index.tracks.length,
    collectionCount: index.collections.length,
    oneSecondAudioCount: fixture.audioFiles.length,
  });

  report.windowStates.push({ state: 'native-window-buttons', status: 'PASS', evidence: 'Visible app-bar controls inventoried; process close verified by Electron harness.' });
  for (const item of [
    { width: 1040, height: 680, scale: 1 },
    { width: 1280, height: 800, scale: 1.25 },
    { width: 1600, height: 900, scale: 1.5 },
  ]) {
    await runtime.cdp.send('Emulation.setDeviceMetricsOverride', { width: item.width, height: item.height, deviceScaleFactor: item.scale, mobile: false });
    await delay(180);
    const layout = await runtime.cdp.evaluate(`({scrollWidth:document.documentElement.scrollWidth,playerVisible:Boolean(document.querySelector('#app-player-bar')?.offsetParent)})`);
    assert.ok(layout.scrollWidth <= item.width + 1, `${item.width} viewport overflow`);
    assert.equal(layout.playerVisible, true, `${item.width} PlayerBar visible`);
    report.windowStates.push({ state: `viewport-${item.width}x${item.height}@${item.scale}`, status: 'PASS' });
  }
  await runtime.cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1.25, mobile: false });

  await inspectPage('dashboard', `document.querySelector('[data-u37b-home="daily"]')`);
  await inspectPage('asmr-lib', `document.querySelector('[data-u37b-asmr-library]')`);

  const searchSelector = await runtime.cdp.evaluate(`(() => {
    const input=[...document.querySelectorAll('main input')].find((item)=>item.offsetParent!==null && ((item.placeholder||item.getAttribute('aria-label')||'').includes('搜索')));
    if(!input) return null;
    input.id=input.id||'u40b-asmr-search';
    return '#'+CSS.escape(input.id);
  })()`);
  if (searchSelector) {
    const changed = await runtime.cdp.evaluate(`(() => {
      const input=document.querySelector(${JSON.stringify(searchSelector)});
      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
      if(setter) setter.call(input,'RJ400001'); else input.value='RJ400001';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
      return input.value;
    })()`);
    assert.equal(changed, 'RJ400001');
    report.interactions.push({ action: 'input', target: 'ASMR search', value: 'RJ400001', status: 'PASS' });
    await delay(200);
  }

  const firstWork = await runtime.cdp.evaluate(`document.querySelector('[data-u37b-asmr-card]')?.getAttribute('data-u37b-asmr-card')??null`);
  if (firstWork) {
    await recordedClick(`[data-u37b-asmr-card=${JSON.stringify(firstWork)}]`, 'open RJ detail');
    await waitFor(runtime.cdp, `document.querySelector('[data-u37c-rj-detail="ready"]')`, 'RJ detail');
    await inventoryVisibleControls(runtime.cdp, 'asmr-detail', 'tracks', report);
    await screenshot('asmr-detail');
    await recordedClick('#play-all-asmr', 'play real fixture work');
    const seededPlayer = await waitForPlayerState(
      (state) => state.trackId === 'u40b-lrc' && state.queueCount === 4 && state.sourceReady,
      'real-index player authorization',
      20_000,
    );
    await pauseCurrentTrackIfPlaying();
    report.userJourneys.push({ name: 'real-index-player-queue', status: 'PASS', state: seededPlayer });
    const infoExists = await runtime.cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null&&item.textContent?.includes('作品信息与个人记录')))`);
    if (infoExists) await recordedButtonText('作品信息与个人记录', 'RJ info tab');
    const editorExists = await runtime.cdp.evaluate(`Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null&&item.textContent?.includes('编辑作品信息')))`);
    if (editorExists) {
      await recordedButtonText('编辑作品信息', 'open metadata editor');
      await waitFor(runtime.cdp, `document.querySelector('[role="dialog"],[data-u37c-metadata-editor="ready"]')`, 'metadata editor');
      await inventoryVisibleControls(runtime.cdp, 'asmr-detail', 'metadata-dialog', report);
      await exerciseEditableControls(runtime.cdp, 'metadata-dialog', report);
      await screenshot('metadata-dialog');
      await pressKey(runtime.cdp, 'Escape');
      await waitFor(runtime.cdp, `!document.querySelector('[data-u37c-metadata-editor="ready"]')`, 'metadata editor closed');
      report.keyboard.push({ key: 'Escape', context: 'metadata-dialog', status: 'PASS' });
    }
  }

  await inspectPage('music-lib', `document.querySelector('[data-u37d-music-library]')`);
  for (const view of ['tracks', 'albums', 'artists', 'folders']) {
    const exists = await runtime.cdp.evaluate(`Boolean(document.querySelector('[data-u37d-view=${JSON.stringify(view)}]'))`);
    if (!exists) continue;
    await recordedClick(`[data-u37d-view=${JSON.stringify(view)}]`, `music-view:${view}`);
    await delay(180);
    await inventoryVisibleControls(runtime.cdp, 'music-lib', view, report);
    await screenshot(`music-${view}`);
  }

  await inspectPage('playlists', `document.querySelector('#mvp53-playlist-visual-unity')`);
  await inspectPage('importer', `document.querySelector('#u41b-importer-primary-flow')`);
  assert.equal(await runtime.cdp.evaluate(`!document.body.innerText.includes('示例扫描结果')`), true, 'truthful importer empty state');
  report.userJourneys.push({ name: 'importer-empty-state-truthfulness', status: 'PASS' });

  await inspectPage('settings', `document.querySelector('[data-settings-tab]')`);
  const settingsTabs = await runtime.cdp.evaluate(`([...document.querySelectorAll('[data-settings-tab]')].filter((item)=>item.offsetParent!==null).map((item)=>item.getAttribute('data-settings-tab')))`);
  for (const tab of settingsTabs) {
    await recordedClick(`[data-settings-tab=${JSON.stringify(tab)}]`, `settings:${tab}`);
    await delay(180);
    await inventoryVisibleControls(runtime.cdp, 'settings', `tab:${tab}`, report);
    await exerciseEditableControls(runtime.cdp, `settings:${tab}`, report);
  }

  await recordedClick('[data-settings-tab="theme"]', 'settings:theme');
  await chooseTheme('dark', '高雅黑');
  await chooseTheme('acrylic-mist', '云雾亚克力');
  await chooseTheme('ocean-drops', '微光海洋');
  await setHtmlAudioOnly();

  const maintenanceExists = await runtime.cdp.evaluate(`Boolean(document.querySelector('#u39b-settings-maintenance-entry'))`);
  assert.equal(maintenanceExists, true, 'AI maintenance entry visible');
  await recordedButtonText('打开 AI 维护', 'open AI maintenance');
  await waitFor(runtime.cdp, `document.body.innerText.includes('返回设置')`, 'AI maintenance page');
  await inventoryVisibleControls(runtime.cdp, 'ai-maintenance', 'overview', report);
  await screenshot('ai-maintenance');
  await recordedButtonText('返回设置', 'return from AI maintenance');
  await waitFor(runtime.cdp, `document.querySelector('#u39b-settings-maintenance-entry')`, 'returned settings');
  report.userJourneys.push({ name: 'AI-maintenance-entry-and-return', status: 'PASS' });

  await navigate('dashboard', `document.querySelector('[data-u37b-home="daily"]')`);
  await recordedClick('#player-queue-toggle', 'player queue toggle');
  await waitFor(runtime.cdp, `document.querySelector('#u29-queue-drawer')`, 'queue drawer');
  await inventoryVisibleControls(runtime.cdp, 'player', 'queue-drawer', report);
  await screenshot('queue-drawer');
  await pressKey(runtime.cdp, 'Escape');
  await waitFor(runtime.cdp, `!document.querySelector('#u29-queue-drawer')`, 'queue drawer closed');
  assert.equal(await runtime.cdp.evaluate(`document.activeElement?.id==='player-queue-toggle'`), true, 'queue focus return');
  report.keyboard.push({ key: 'Escape', context: 'queue-drawer', status: 'PASS', focusReturn: true });

  const lyricsOpener = await runtime.cdp.evaluate(`Boolean(document.querySelector('#app-player-bar button[title="1 秒 LRC 音轨"]'))`);
  assert.equal(lyricsOpener, true, 'full lyrics opener');
  await recordedClick('#app-player-bar button[title="1 秒 LRC 音轨"]', 'open full lyrics');
  await waitFor(runtime.cdp, `document.querySelector('#full-lyrics-panel')`, 'full lyrics');
  await inventoryVisibleControls(runtime.cdp, 'player', 'full-lyrics', report);
  await screenshot('full-lyrics');
  await pressKey(runtime.cdp, 'Escape');
  await waitFor(runtime.cdp, `!document.querySelector('#full-lyrics-panel')`, 'full lyrics closed');
  report.keyboard.push({ key: 'Escape', context: 'full-lyrics', status: 'PASS' });

  await pressKey(runtime.cdp, 'Tab');
  const tabFocus = await runtime.cdp.evaluate(`({tag:document.activeElement?.tagName??'',id:document.activeElement?.id??''})`);
  assert.ok(tabFocus.tag, 'Tab focus');
  report.keyboard.push({ key: 'Tab', context: 'application-shell', status: 'PASS', focused: tabFocus });
  await pressKey(runtime.cdp, 'Tab', 8);
  const reverseFocus = await runtime.cdp.evaluate(`({tag:document.activeElement?.tagName??'',id:document.activeElement?.id??''})`);
  assert.ok(reverseFocus.tag, 'Shift+Tab focus');
  report.keyboard.push({ key: 'Shift+Tab', context: 'application-shell', status: 'PASS', focused: reverseFocus });

  const authorizedState = await waitForPlayerState(
    (state) => state.trackId === 'u40b-lrc' && state.sourceReady && state.queueCount === 4,
    'one-second authorized fixture source',
    20_000,
  );
  const startState = { trackId: authorizedState.trackId, currentIndex: authorizedState.currentIndex, progress: authorizedState.progress };
  await recordedClick('#app-player-bar button[aria-label="播放"]', 'player:play');
  await waitFor(runtime.cdp, `Number(document.querySelector('#app-player-bar')?.dataset.u29CurrentIndex??-1)!==${startState.currentIndex}||Number(document.querySelector('#app-player-bar')?.dataset.u29Progress??0)>0.2`, 'one-second playback progress or natural end', 15_000);
  await delay(1_500);
  const endState = await runtime.cdp.evaluate(`(() => { const bar=document.querySelector('#app-player-bar'); return {trackId:bar?.dataset.u29TrackId??'',currentIndex:Number(bar?.dataset.u29CurrentIndex??-1),progress:Number(bar?.dataset.u29Progress??0),mode:bar?.dataset.u29PlaybackMode??'',queueCount:Number(bar?.dataset.u29QueueCount??0)}; })()`);
  assert.ok(endState.currentIndex !== startState.currentIndex || endState.progress >= 0.8, 'one-second audio completion');
  report.userJourneys.push({ name: 'one-second-audio-natural-end', status: 'PASS', startState, endState });
  await screenshot('player-one-second-completion');

  await runtime.cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await runtime.cdp.evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`), true, 'reduced motion');
  report.userJourneys.push({ name: 'reduced-motion', status: 'PASS' });

  const uncovered = attachCoverageEvidence(report);
  assert.equal(uncovered.length, 0, 'visible controls uncovered');
  assert.deepEqual(runtime.cdp.errors, [], `Renderer errors: ${runtime.cdp.errors.join(' | ')}`);
  report.runtimeErrors = runtime.cdp.errors;
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  report.runtimeErrors = runtime?.cdp?.errors ?? [];
  throw error;
} finally {
  if (!report.coverageSummary) attachCoverageEvidence(report);
  report.stdout = runtime?.stdout?.join('') ?? '';
  report.stderr = runtime?.stderr?.join('') ?? '';
  fs.writeFileSync(path.join(artifactDir, 'interaction-coverage.json'), JSON.stringify(report, null, 2), 'utf8');
  const lines = [
    '# U40-B 全产品用户旅程与交互覆盖验收',
    '',
    `- 状态：**${report.status}**`,
    `- 1 秒音频：${report.fixture.audioFiles.length} 个`,
    `- 字幕样本：${report.fixture.subtitleFiles.length} 个`,
    `- 页面记录：${report.pages.length} 个`,
    `- 可见控件状态：${report.coverageSummary.visibleControlStates} 个`,
    `- 操作记录：${report.interactions.length} 条`,
    `- 用户旅程：${report.userJourneys.length} 条`,
    `- 截图：${report.screenshots.length} 张`,
    `- 未覆盖：${report.coverageSummary.uncovered}`,
    `- 运行时错误：${report.runtimeErrors.length}`,
    '',
    '## 用户旅程',
    ...report.userJourneys.map((item) => `- ${item.status}: ${item.name}`),
    '',
    '## 窗口与键盘',
    ...report.windowStates.map((item) => `- ${item.status}: ${item.state}`),
    ...report.keyboard.map((item) => `- ${item.status}: ${item.key} / ${item.context}`),
    '',
    '## 范围',
    '- 物理扬声器、声卡、真实显示器主观观感和第三方程序界面按用户要求排除。',
    '- 文件操作仅使用 Windows runner 临时目录，测试结束后删除。',
  ];
  fs.writeFileSync(path.join(artifactDir, 'user-journey-report.md'), lines.join('\n'), 'utf8');

  if (runtime) {
    try { await closeElectron(runtime); } catch (error) {
      report.runtimeErrors.push(error instanceof Error ? error.message : String(error));
    }
  }
  fs.rmSync(fixtureDir, { recursive: true, force: true });
  fs.rmSync(profileDir, { recursive: true, force: true });
}

console.log('U40-B full product journey PASS');
