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

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u41e-rc-final-acceptance');
const screenshotDir = path.join(artifactDir, 'screenshots');
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u41e-fixture-'));
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u41e-profile-'));
fs.mkdirSync(screenshotDir, { recursive: true });

const fixture = createU40bFixture(fixtureDir);
const report = {
  status: 'running',
  head: process.env.GITHUB_SHA ?? null,
  version: JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).version,
  driver: 'electron-chromium-cdp',
  viewports: [],
  pages: [],
  keyboard: [],
  screenshots: [],
  runtimeErrors: [],
};

const routes = [
  { id: 'dashboard', ready: `document.querySelector('[data-u37b-home="daily"]')` },
  { id: 'asmr-lib', ready: `document.querySelector('[data-u37b-asmr-library]')` },
  { id: 'music-lib', ready: `document.querySelector('[data-u37d-music-library]')` },
  { id: 'playlists', ready: `document.querySelector('#mvp53-playlist-visual-unity')` },
  { id: 'importer', ready: `document.querySelector('#u41b-importer-primary-flow')` },
  { id: 'settings', ready: `document.querySelector('[data-settings-tab]')` },
];
const viewports = [
  { width: 1280, height: 800, scale: 1.25 },
  { width: 1024, height: 720, scale: 1 },
  { width: 800, height: 700, scale: 1 },
];

let runtime;

async function screenshot(name) {
  const file = await captureScreenshot(runtime.cdp, screenshotDir, name);
  report.screenshots.push(`screenshots/${file}`);
}

async function navigate(pageId, readyExpression) {
  await click(runtime.cdp, `#nav-${pageId}`);
  await waitFor(runtime.cdp, `document.querySelector('#nav-${pageId}')?.getAttribute('aria-current') === 'page'`, `${pageId} navigation`, 20_000);
  await waitFor(runtime.cdp, readyExpression, `${pageId} ready`, 20_000);
}

async function auditCurrentSurface(pageId, viewport) {
  const metrics = await runtime.cdp.evaluate(`(() => {
    const main=document.querySelector('main');
    if(!main) throw new Error('Missing main surface');
    const selectors='button,a[href],input,select,textarea,[role="button"],[role="tab"]';
    const controls=[...main.querySelectorAll(selectors)].filter((item)=>{
      const rect=item.getBoundingClientRect();
      const style=getComputedStyle(item);
      return rect.width>0 && rect.height>0 && style.visibility!=='hidden' && style.display!=='none';
    });
    const viewportControls=controls.filter((item)=>{
      const rect=item.getBoundingClientRect();
      return rect.bottom > 2 && rect.top < innerHeight - 2;
    });
    const offscreen=viewportControls.filter((item)=>{
      const rect=item.getBoundingClientRect();
      return rect.left < -2 || rect.right > innerWidth + 2 || rect.top < -2 || rect.bottom > innerHeight + 2;
    }).map((item)=>({
      text:(item.getAttribute('aria-label')||item.textContent||item.tagName).trim().slice(0,80),
      rect:Object.fromEntries(['left','right','top','bottom','width','height'].map((key)=>[key,Math.round(item.getBoundingClientRect()[key])])),
    }));
    const undersized=viewportControls.filter((item)=>{
      if(item.disabled || item.getAttribute('aria-disabled')==='true') return false;
      const rect=item.getBoundingClientRect();
      return Math.min(rect.width,rect.height) < 20;
    }).map((item)=>({
      text:(item.getAttribute('aria-label')||item.textContent||item.tagName).trim().slice(0,80),
      width:Math.round(item.getBoundingClientRect().width),
      height:Math.round(item.getBoundingClientRect().height),
    }));
    const title=main.querySelector('h1,h2')?.textContent?.trim()??'';
    return {
      title,
      visibleControls:viewportControls.length,
      documentOverflow:document.documentElement.scrollWidth>innerWidth+1,
      mainOverflow:main.scrollWidth>main.clientWidth+1,
      mainRect:{left:Math.round(main.getBoundingClientRect().left),right:Math.round(main.getBoundingClientRect().right)},
      offscreen,
      undersized,
      downloaderNav:Boolean(document.querySelector('#nav-downloader')),
    };
  })()`);
  assert.ok(metrics.title, `${pageId} missing visible title`);
  assert.equal(metrics.documentOverflow, false, `${pageId} document overflow at ${viewport.width}`);
  assert.equal(metrics.mainOverflow, false, `${pageId} main overflow at ${viewport.width}`);
  assert.equal(metrics.offscreen.length, 0, `${pageId} offscreen controls at ${viewport.width}: ${JSON.stringify(metrics.offscreen)}`);
  assert.equal(metrics.undersized.length, 0, `${pageId} undersized controls at ${viewport.width}: ${JSON.stringify(metrics.undersized)}`);
  assert.equal(metrics.downloaderNav, false, `${pageId} restored frozen downloader navigation`);
  report.pages.push({ pageId, viewport: `${viewport.width}x${viewport.height}@${viewport.scale}`, ...metrics });
}

async function checkKeyboardFocus(pageId) {
  const focused = await runtime.cdp.evaluate(`(() => {
    const main=document.querySelector('main');
    const first=[...main.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[role="button"]:not([aria-disabled="true"]),[role="tab"]:not([aria-disabled="true"])')]
      .find((item)=>item.offsetParent!==null);
    if(!first) return null;
    first.focus();
    const rect=first.getBoundingClientRect();
    return {tag:first.tagName,id:first.id||'',label:(first.getAttribute('aria-label')||first.textContent||'').trim().slice(0,80),inside:rect.left>=-2&&rect.right<=innerWidth+2&&rect.top>=-2&&rect.bottom<=innerHeight+2};
  })()`);
  assert.ok(focused, `${pageId} has no keyboard-focusable control`);
  assert.equal(focused.inside, true, `${pageId} first focus target is outside viewport`);
  await pressKey(runtime.cdp, 'Tab');
  const afterTab = await runtime.cdp.evaluate(`(() => { const item=document.activeElement; const rect=item?.getBoundingClientRect?.(); return {tag:item?.tagName??'',id:item?.id??'',inside:Boolean(rect&&rect.width>0&&rect.height>0&&rect.left>=-2&&rect.right<=innerWidth+2&&rect.top>=-2&&rect.bottom<=innerHeight+2)}; })()`);
  assert.ok(afterTab.tag, `${pageId} Tab did not produce an active element`);
  assert.equal(afterTab.inside, true, `${pageId} Tab focus target is outside viewport`);
  report.keyboard.push({ pageId, initial: focused, afterTab, status: 'PASS' });
}

async function prepareLibrary() {
  await navigate('settings', `document.querySelector('[data-settings-tab]')`);
  await click(runtime.cdp, '[data-settings-tab="paths"]');
  await clickButtonText(runtime.cdp, '选择音声库目录', true);
  await waitFor(runtime.cdp, `document.body.innerText.includes('已选择目录，可读取已有记录或重新扫描')`, 'temporary library selected', 20_000);
  const rootPathToken = await runtime.cdp.evaluate(`(() => {
    const roots=JSON.parse(sessionStorage.getItem('yang_kura_u28_authorized_roots_v1')??'{}');
    return roots.asmr?.rootPathToken??'';
  })()`);
  assert.ok(rootPathToken.startsWith('yk-root-'), 'temporary fixture token created');
  writeU40bIndex(fixtureDir, rootPathToken, fixture.sizes);
  await seedApplication(runtime.cdp, rootPathToken, fixture.sizes);
  await waitFor(runtime.cdp, `document.querySelector('#windows-app-bar')`, 'application shell after seed', 30_000);
  await navigate('settings', `document.querySelector('[data-settings-tab]')`);
  await click(runtime.cdp, '[data-settings-tab="paths"]');
  await waitFor(runtime.cdp, `Boolean([...document.querySelectorAll('button')].find((item)=>item.offsetParent!==null&&item.textContent?.trim()==='读取已有记录'&&!item.disabled))`, 'read existing index button', 20_000);
  await clickButtonText(runtime.cdp, '读取已有记录', true);
  await waitFor(runtime.cdp, `![...document.querySelectorAll('button')].some((button)=>button.textContent?.includes('读取中'))`, 'fixture index read completion', 30_000);
  await waitFor(runtime.cdp, `document.body.innerText.includes('文件编码：utf8-bom')`, 'fixture index evidence', 30_000);
}

try {
  assert.equal(report.version, '1.0.0-rc.1', 'U41-E runtime must test the RC version');
  runtime = await launchElectron({ cwd, profileDir, fixtureDir });
  await waitFor(runtime.cdp, `document.querySelector('#windows-app-bar')`, 'application shell', 30_000);
  await prepareLibrary();

  for (const viewport of viewports) {
    await runtime.cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.scale,
      mobile: false,
    });
    await delay(180);
    for (const route of routes) {
      await navigate(route.id, route.ready);
      await auditCurrentSurface(route.id, viewport);
      if (viewport.width === 800) {
        await checkKeyboardFocus(route.id);
        await screenshot(`${route.id}-${viewport.width}x${viewport.height}`);
      }
    }

    await navigate('settings', `document.querySelector('[data-settings-tab]')`);
    await click(runtime.cdp, '[data-settings-tab="about"]');
    await waitFor(runtime.cdp, `document.body.innerText.includes('当前版本：1.0.0-rc.1')`, 'RC version in About');
    await clickButtonText(runtime.cdp, '打开 AI 维护');
    await waitFor(runtime.cdp, `document.querySelector('[data-u40d-maintenance-runtime="current-only"]')`, 'AI maintenance route', 20_000);
    await auditCurrentSurface('diagnostics', viewport);
    if (viewport.width === 800) {
      await checkKeyboardFocus('diagnostics');
      await screenshot(`diagnostics-${viewport.width}x${viewport.height}`);
    }
    await clickButtonText(runtime.cdp, '返回设置');
    await waitFor(runtime.cdp, `document.querySelector('#u39b-settings-maintenance-entry')`, 'return to settings', 20_000);
    report.viewports.push({ ...viewport, status: 'PASS' });
  }

  assert.deepEqual(runtime.cdp.errors, [], `Renderer errors: ${runtime.cdp.errors.join(' | ')}`);
  report.runtimeErrors = runtime.cdp.errors;
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  report.runtimeErrors = runtime?.cdp?.errors ?? [];
  throw error;
} finally {
  fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  if (runtime) await closeElectron(runtime).catch((error) => {
    report.closeError = error instanceof Error ? error.message : String(error);
  });
  fs.rmSync(fixtureDir, { recursive: true, force: true });
  fs.rmSync(profileDir, { recursive: true, force: true });
}

console.log('[U41-E RC final acceptance] PASS');
console.log(`version=${report.version}; viewports=${report.viewports.length}; pageChecks=${report.pages.length}; keyboardChecks=${report.keyboard.length}`);
