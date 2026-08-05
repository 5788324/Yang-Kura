#!/usr/bin/env node
/**
 * U41-E lyrics-mode subtitle layout regression.
 *
 * Verifies that in the fullscreen player "lyrics mode" the active lyric line stays
 * fully visible inside the lyrics viewport and clear of the bottom player control
 * bar across compact window heights and DPI scales. This guards the fix for the
 * PR #93 Major: active lyrics were clipped by the bottom controls at 800x700 and
 * 1024x720 windows.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  captureScreenshot,
  click,
  closeElectron,
  delay,
  launchElectron,
  waitFor,
} from './u40b/cdp-runtime.mjs';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u41e-rc-final-acceptance');
const screenshotDir = path.join(artifactDir, 'screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });
const report = {
  status: 'running',
  head: process.env.GITHUB_SHA ?? null,
  version: JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).version,
  driver: 'electron-chromium-cdp',
  subtitleLayout: [],
  runtimeErrors: [],
};

const LRC_LINES = [
  '[00:00.00]第一行固定字幕 / First Fixed Subtitle',
  '[00:04.00]中间行固定字幕 / Middle Fixed Subtitle',
  '[00:08.00]最后行固定字幕 / Last Fixed Subtitle',
];
const LRC_TEXT = `${LRC_LINES.join('\n')}\n`;

const viewports = [
  { width: 800, height: 700, scale: 1.0 },
  { width: 800, height: 700, scale: 1.25 },
  { width: 1024, height: 720, scale: 1.0 },
  { width: 1024, height: 720, scale: 1.25 },
  { width: 1280, height: 800, scale: 1.0 },
  { width: 1280, height: 800, scale: 1.25 },
];

// Seek targets for first / middle / last lyric line (time, label)
const lineTargets = [
  { seconds: 1, label: 'first' },
  { seconds: 5, label: 'middle' },
  { seconds: 9, label: 'last' },
];

function writeWav(filePath, seconds, seed = 0x50) {
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
  buffer.fill(seed, 44);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

function writeFile(root, relativePath, content) {
  const filePath = path.join(root, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u41e-subtitle-'));
const fixtureDir = path.join(tempRoot, 'library');
const profileDir = path.join(tempRoot, 'profile');
fs.mkdirSync(fixtureDir, { recursive: true });
fs.mkdirSync(profileDir, { recursive: true });
const audioSeconds = 30;
const audioSize = writeWav(path.join(fixtureDir, 'asmr/RJ480010/01.wav'), audioSeconds, 0x41);
writeFile(fixtureDir, 'asmr/RJ480010/01.lrc', LRC_TEXT);
writeFile(fixtureDir, 'asmr/RJ480010/cover.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2V5sAAAAASUVORK5CYII=', 'base64'));
writeFile(fixtureDir, 'library-index.json', JSON.stringify({ schemaVersion: 1, generatedAt: new Date(0).toISOString(), sourceKind: 'fixture', roots: [], collections: [], tracks: [], covers: [], subtitles: [], warnings: [] }));

let runtime;

async function authorizeAndLoadIndex() {
  const { cdp } = runtime;
  await waitFor(cdp, "document.querySelector('#windows-app-bar')", 'app shell', 30_000);
  await click(cdp, '#nav-settings');
  await waitFor(cdp, "document.querySelector('[data-settings-tab]')", 'settings page');
  await click(cdp, '[data-settings-tab="paths"]');
  const { clickButtonText } = await import('./u40b/cdp-runtime.mjs');
  await clickButtonText(cdp, '选择音声库目录', true);
  await waitFor(cdp, `document.body.innerText.includes('已选择目录，可读取已有记录或重新扫描')`, 'temporary library selected', 30_000);
  const rootPathToken = await cdp.evaluate(`(() => {
    const roots = JSON.parse(sessionStorage.getItem('yang_kura_u28_authorized_roots_v1') ?? '{}');
    return roots.asmr?.rootPathToken ?? '';
  })()`);
  assert.ok(rootPathToken.startsWith('yk-root-'), 'temporary fixture token created');
  const timestamp = '2026-08-05T00:00:00.000Z';
  const index = {
    schemaVersion: 1, generatedAt: timestamp, sourceKind: 'fixture',
    roots: [{ id: 'sub-root', name: 'subtitle-layout-fixture', rootPath: `rootPathToken:${rootPathToken}`, libraryType: 'asmr', scanProfile: 'asmr-rj', sourceKind: 'fixture', createdAt: timestamp, updatedAt: timestamp }],
    collections: [{ id: 'sub-work', rootId: 'sub-root', collectionType: 'rj_work', title: 'U41E 字幕布局验收音声', codeRaw: 'RJ480010', codeNorm: 'RJ480010', circle: 'U41E 社团', cvs: ['U41E CV'], tags: ['subtitle'], status: 'identified', trackIds: ['sub-1'], totalDurationSeconds: audioSeconds, addedAt: timestamp, updatedAt: timestamp }],
    tracks: [{ id: 'sub-1', rootId: 'sub-root', collectionId: 'sub-work', kind: 'audio', title: '字幕布局音轨', displayArtist: 'U41E CV', displayAlbum: 'U41E 字幕布局验收音声', rjId: 'RJ480010', trackNo: 1, durationSeconds: audioSeconds, source: { id: 'src-sub-1', trackId: 'sub-1', sourceKind: 'local-file', relativePath: 'asmr/RJ480010/01.wav', extension: 'wav', sizeBytes: audioSize, mtimeMs: 1 }, subtitles: [{ id: 'sub-lrc', trackId: 'sub-1', sourceKind: 'local-file', language: 'bilingual', format: 'lrc', relativePath: 'asmr/RJ480010/01.lrc' }], tags: ['subtitle'], addedAt: timestamp }],
    covers: [{ id: 'sub-cover', collectionId: 'sub-work', sourceKind: 'local-file', relativePath: 'asmr/RJ480010/cover.png', isPrimary: true }],
    subtitles: [{ id: 'sub-lrc', trackId: 'sub-1', sourceKind: 'local-file', language: 'bilingual', format: 'lrc', relativePath: 'asmr/RJ480010/01.lrc' }],
    warnings: [],
  };
  writeFile(fixtureDir, 'library-index.json', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(JSON.stringify(index, null, 2), 'utf8')]));
  await clickButtonText(cdp, '读取已有记录', true);
  await waitFor(cdp, `![...document.querySelectorAll('button')].some((button)=>button.textContent?.includes('读取中'))`, 'fixture index read completion', 30_000);
  await waitFor(cdp, `document.body.innerText.includes('文件编码：utf8-bom')`, 'fixture index evidence', 30_000);
  await cdp.evaluate(`localStorage.setItem('yang_kura_mpv_playback_preference_v1', 'html-audio-only'); true`);
}

async function openLyricsMode() {
  const { cdp } = runtime;
  await click(cdp, '#nav-asmr-lib');
  await waitFor(cdp, `document.querySelector('[data-u37b-asmr-card]')`, 'work card');
  await click(cdp, '[data-u37b-asmr-card]');
  await waitFor(cdp, `document.querySelector('[data-u37c-rj-detail="ready"]')`, 'RJ detail');
  await click(cdp, '#play-all-asmr');
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const s = await cdp.evaluate(`(() => { const bar=document.querySelector('#app-player-bar'); return { mode:bar?.dataset.u29PlaybackMode??'', trackId:bar?.dataset.u29TrackId??'', progress:Number(bar?.dataset.u29Progress??0) }; })()`);
    if (s.mode === 'html-audio' && s.trackId === 'sub-1' && s.progress > 0.2) break;
    await delay(150);
  }
  await click(cdp, `#app-player-bar button[title=${JSON.stringify('字幕布局音轨')}]`);
  await waitFor(cdp, `document.querySelector('#full-lyrics-panel')`, 'full lyrics panel');
  const switched = await cdp.evaluate(`(() => {
    const btn = [...document.querySelectorAll('#full-lyrics-panel button')].find((item) => item.textContent?.trim() === '歌词模式');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  assert.equal(switched, true, 'lyrics mode button present');
  await delay(600);
  // Keep the user active: dispatching mousemove prevents the control area from auto-hiding.
  await cdp.evaluate(`(() => { window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); return true; })()`);
  // Pause so the active lyric index and progress are stable while we measure each line.
  await cdp.evaluate(`(() => { const btn=document.querySelector('#full-lyrics-panel button[title="暂停"]'); if(btn) btn.click(); return true; })()`);
  await delay(500);
}

async function seekLyrics(cdp, seconds) {
  await cdp.evaluate(`(() => {
    const input = document.querySelector('#full-lyrics-panel input[type="range"]');
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(${seconds}));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('click', { bubbles: true }));
    return true;
  })()`);
  // Wait for the auto-scroll smooth animation to settle before measuring geometry.
  const settleDeadline = Date.now() + 6_000;
  let previous = null;
  let stableCount = 0;
  while (Date.now() < settleDeadline) {
    await delay(250);
    const current = await cdp.evaluate(`(() => {
      const container = document.querySelector('#mvp78-lyrics-reading-width');
      return container ? Math.round(container.scrollTop) : null;
    })()`);
    if (current === previous) {
      stableCount += 1;
      if (stableCount >= 3) break;
    } else {
      stableCount = 0;
    }
    previous = current;
  }
  await delay(200);
}

async function measureSubtitle() {
  return runtime.cdp.evaluate(`(() => {
    const container = document.querySelector('#mvp78-lyrics-reading-width');
    const shell = document.querySelector('#mvp78-full-player-responsive-shell');
    const bottom = document.querySelector('#mvp78-bottom-control-safe-wrap');
    const header = document.querySelector('#mvp78-player-header-wrap-safe');
    const activeLine = container ? [...container.children].find((el) => el.className.includes('opacity-100') && el.className.includes('scale-[1.06]')) : null;
    const subRect = activeLine ? activeLine.getBoundingClientRect() : null;
    const bottomRect = bottom ? bottom.getBoundingClientRect() : null;
    const shellRect = shell ? shell.getBoundingClientRect() : null;
    const containerRect = container ? container.getBoundingClientRect() : null;
    const clipBottom = shellRect ? shellRect.bottom : 0;
    const clipTop = shellRect ? shellRect.top : 0;
    const visiblePx = subRect ? Math.max(0, Math.min(subRect.bottom, clipBottom) - Math.max(subRect.top, clipTop)) : 0;
    const ratio = subRect ? visiblePx / subRect.height : 0;
    const gapToBottomControls = subRect && bottomRect ? bottomRect.top - subRect.bottom : null;
    const clearTop = subRect && containerRect ? subRect.top - containerRect.top : null;
    const exceedsViewport = subRect ? (subRect.left < -1 || subRect.right > innerWidth + 1) : null;
    const probeCenterY = subRect ? (subRect.top + subRect.height / 2) : null;
    const probeBottomY = subRect ? Math.min(subRect.bottom - 4, clipBottom - 1) : null;
    const probeX = subRect ? (subRect.left + subRect.width / 2) : null;
    const centerEl = probeCenterY !== null && probeX !== null && probeCenterY < innerHeight
      ? document.elementFromPoint(probeX, probeCenterY)
      : null;
    const bottomEl = probeBottomY !== null && probeX !== null && probeBottomY < innerHeight
      ? document.elementFromPoint(probeX, probeBottomY)
      : null;
    const bottomButtons = bottom ? [...bottom.querySelectorAll('button')].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 2 && r.top < innerHeight - 2;
    }) : [];
    const bottomButtonsOutside = bottomButtons.filter((b) => {
      const r = b.getBoundingClientRect();
      return r.left < -2 || r.right > innerWidth + 2 || r.top < -2 || r.bottom > innerHeight + 2;
    });
    const subText = activeLine ? activeLine.textContent?.trim() ?? '' : '';
    const headerVisible = header ? header.getBoundingClientRect().height > 0 && getComputedStyle(header).opacity !== '0' : false;
    const bottomVisible = bottomRect ? bottomRect.height > 0 && getComputedStyle(bottom).opacity !== '0' : false;
    return {
      subtitleText: subText,
      subtitleRect: subRect ? { top: Math.round(subRect.top), bottom: Math.round(subRect.bottom), left: Math.round(subRect.left), right: Math.round(subRect.right), width: Math.round(subRect.width), height: Math.round(subRect.height) } : null,
      containerRect: containerRect ? { top: Math.round(containerRect.top), bottom: Math.round(containerRect.bottom) } : null,
      shellRect: shellRect ? { top: Math.round(shellRect.top), bottom: Math.round(shellRect.bottom) } : null,
      bottomControlsRect: bottomRect ? { top: Math.round(bottomRect.top), bottom: Math.round(bottomRect.bottom) } : null,
      visiblePx: Math.round(visiblePx),
      ratio: Number(ratio.toFixed(3)),
      gapToBottomControls: gapToBottomControls === null ? null : Math.round(gapToBottomControls),
      clearTop: clearTop === null ? null : Math.round(clearTop),
      exceedsViewport,
      centerHitIsSubtitle: Boolean(centerEl && (centerEl === activeLine || activeLine?.contains(centerEl))),
      bottomHitIsSubtitle: Boolean(bottomEl && (bottomEl === activeLine || activeLine?.contains(bottomEl))),
      headerVisible,
      bottomControlsVisible: bottomVisible,
      bottomButtonsVisible: bottomButtons.length,
      bottomButtonsOutside: bottomButtonsOutside.length,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      innerWidth,
      innerHeight,
    };
  })()`);
}

async function runViewportSubtitleCheck(viewport) {
  const { cdp } = runtime;
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: viewport.scale, mobile: false });
  await delay(400);
  const vpLabel = `${viewport.width}x${viewport.height}@${Math.round(viewport.scale * 100)}`;

  for (const target of lineTargets) {
    await seekLyrics(cdp, target.seconds);
    // Keep the user active so the header and bottom controls never auto-hide.
    await cdp.evaluate(`(() => { window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); return true; })()`);
    await delay(200);
    const m = await measureSubtitle();
    const diag = await runtime.cdp.evaluate(`(() => {
      const container = document.querySelector('#mvp78-lyrics-reading-width');
      return container ? { scrollTop: Math.round(container.scrollTop), scrollHeight: container.scrollHeight, clientHeight: container.clientHeight } : null;
    })()`);
    console.log(`[subtitle-layout] ${vpLabel} ${target.label}: ratio=${m.ratio} clearTop=${m.clearTop} gap=${m.gapToBottomControls} scrollTop=${diag?.scrollTop} scrollHeight=${diag?.scrollHeight} clientHeight=${diag?.clientHeight}`);
    assert.ok(m.subtitleText.length > 0, `${vpLabel} ${target.label}: subtitle text must be non-empty`);
    assert.equal(m.ratio, 1, `${vpLabel} ${target.label}: active lyric visible ratio must be 1, got ${m.ratio}`);
    assert.ok(m.gapToBottomControls !== null && m.gapToBottomControls >= 8, `${vpLabel} ${target.label}: gap to bottom controls must be >= 8, got ${m.gapToBottomControls}`);
    assert.ok(m.clearTop !== null && m.clearTop >= 8, `${vpLabel} ${target.label}: active lyric must clear viewport top by >= 8, got ${m.clearTop}`);
    assert.equal(m.exceedsViewport, false, `${vpLabel} ${target.label}: subtitle must not exceed horizontal viewport`);
    assert.equal(m.centerHitIsSubtitle, true, `${vpLabel} ${target.label}: elementFromPoint at subtitle center must hit subtitle`);
    assert.equal(m.bottomHitIsSubtitle, true, `${vpLabel} ${target.label}: elementFromPoint at subtitle bottom must hit subtitle`);
    assert.equal(m.headerVisible, true, `${vpLabel} ${target.label}: header must stay visible (user active)`);
    assert.equal(m.bottomControlsVisible, true, `${vpLabel} ${target.label}: bottom controls must stay visible (user active)`);
    assert.equal(m.horizontalOverflow, false, `${vpLabel} ${target.label}: document horizontal overflow`);
    assert.equal(m.bottomButtonsOutside, 0, `${vpLabel} ${target.label}: bottom control buttons must stay inside viewport`);
    report.subtitleLayout.push({ viewport: vpLabel, line: target.label, subtitleText: m.subtitleText, ratio: m.ratio, gapToBottomControls: m.gapToBottomControls, clearTop: m.clearTop, exceedsViewport: m.exceedsViewport, centerHitIsSubtitle: m.centerHitIsSubtitle, bottomHitIsSubtitle: m.bottomHitIsSubtitle, headerVisible: m.headerVisible, bottomControlsVisible: m.bottomControlsVisible, bottomButtonsVisible: m.bottomButtonsVisible, bottomButtonsOutside: m.bottomButtonsOutside, horizontalOverflow: m.horizontalOverflow, subtitleRect: m.subtitleRect, bottomControlsRect: m.bottomControlsRect });
  }

  // Capture the middle line screenshot for the visual model.
  await seekLyrics(cdp, 5);
  const shot = await captureScreenshot(runtime.cdp, screenshotDir, `subtitle-layout-${viewport.width}x${viewport.height}-${Math.round(viewport.scale * 100)}`);
  report.screenshots = report.screenshots ?? [];
  report.screenshots.push(`screenshots/${shot}`);
}

try {
  assert.equal(report.version, '1.0.0-rc.1', 'U41-E subtitle layout must test the RC version');
  runtime = await launchElectron({ cwd, profileDir, fixtureDir, extraEnv: { YANG_KURA_MPV_PATH: path.join(profileDir, 'missing-mpv', 'mpv.exe') } });
  await authorizeAndLoadIndex();
  await openLyricsMode();

  for (const viewport of viewports) {
    await runViewportSubtitleCheck(viewport);
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
  fs.writeFileSync(path.join(artifactDir, 'subtitle-layout-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  if (runtime) await closeElectron(runtime).catch((error) => {
    report.closeError = error instanceof Error ? error.message : String(error);
  });
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('[U41-E lyrics subtitle layout] PASS');
console.log(`version=${report.version}; checks=${report.subtitleLayout.length}; viewports=6; lines=first/middle/last`);
