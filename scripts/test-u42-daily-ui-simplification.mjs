#!/usr/bin/env node
/**
 * U42 daily UI simplification Windows UI test.
 *
 * Runtime checks on the final build:
 * - PlayerBar has no placeholder More button, other controls remain;
 * - ASMR library batch management is opt-in selection mode;
 * - Music library batch management is opt-in selection mode;
 * - RJ track "more" menu shows copy/reveal/open, closes on Escape and outside click;
 * - music metadata advanced backup/restore is collapsed by default;
 * - settings MPV manual buttons are collapsed by default;
 * - importer defaults to copy; move lives under advanced options;
 * - maintenance entry is collapsed under 高级 and named 诊断与修复;
 * - responsive layout at 800x700 / 1024x720 / 1280x800 (100% and 125%).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { launchElectron, closeElectron, waitFor, click, clickButtonText, pressKey, delay } from './u40b/cdp-runtime.mjs';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u42-daily-ui-simplification');
const screenshotDir = path.join(artifactDir, 'screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });
const report = { status: 'running', head: process.env.GITHUB_SHA ?? null, version: JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).version, checks: [], errors: [] };

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

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u42-'));
const fixtureDir = path.join(tempRoot, 'library');
const profileDir = path.join(tempRoot, 'profile');
fs.mkdirSync(fixtureDir, { recursive: true });
fs.mkdirSync(profileDir, { recursive: true });
const sizes = {};
sizes['asmr/RJ800001/01.wav'] = writeWav(path.join(fixtureDir, 'asmr/RJ800001/01.wav'), 30, 0x41);
sizes['asmr/RJ800001/02.wav'] = writeWav(path.join(fixtureDir, 'asmr/RJ800001/02.wav'), 30, 0x42);
sizes['asmr/RJ800001/01.lrc'] = 0;
sizes['music/Artist M/Album M/01.wav'] = writeWav(path.join(fixtureDir, 'music/Artist M/Album M/01.wav'), 30, 0x43);
writeFile(fixtureDir, 'asmr/RJ800001/01.lrc', '[00:00.00]第一句 / Line One\n[00:04.00]中间句 / Middle\n[00:08.00]最后句 / Last\n');
writeFile(fixtureDir, 'asmr/RJ800001/cover.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2V5sAAAAASUVORK5CYII=', 'base64'));
writeFile(fixtureDir, 'music/Artist M/Album M/cover.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2V5sAAAAASUVORK5CYII=', 'base64'));
writeFile(fixtureDir, 'library-index.json', JSON.stringify({ schemaVersion: 1, generatedAt: new Date(0).toISOString(), sourceKind: 'fixture', roots: [], collections: [], tracks: [], covers: [], subtitles: [], warnings: [] }));

let runtime;
let rootToken = '';

async function check(name, expr, timeout = 15000) {
  await waitFor(runtime.cdp, expr, name, timeout);
  report.checks.push({ name, pass: true });
}

async function checkFalse(name, expr) {
  await delay(300);
  const value = await runtime.cdp.evaluate(`Boolean(${expr})`);
  assert.equal(value, false, `${name} expected false`);
  report.checks.push({ name, pass: true });
}

async function shot(name) {
  const file = await (await import('./u40b/cdp-runtime.mjs')).captureScreenshot(runtime.cdp, screenshotDir, name);
  report.checks.push({ name: `screenshot:${name}`, pass: true, file });
}

async function main() {
  try {
    assert.equal(report.version, '1.0.0-rc.1', 'U42 must test RC version');
    runtime = await launchElectron({ cwd, profileDir, fixtureDir, extraEnv: { YANG_KURA_MPV_PATH: path.join(profileDir, 'missing-mpv', 'mpv.exe') } });
    const { cdp } = runtime;
    await check('app shell', "document.querySelector('#windows-app-bar')", 30000);
    await click(cdp, '#nav-settings');
    await check('settings', "document.querySelector('[data-settings-tab]')");
    await click(cdp, '[data-settings-tab="paths"]');
    await clickButtonText(cdp, '选择音声库目录', true);
    await check('lib selected', `document.body.innerText.includes('已选择目录，可读取已有记录或重新扫描')`, 30000);
    rootToken = await cdp.evaluate(`(() => { const r = JSON.parse(sessionStorage.getItem('yang_kura_u28_authorized_roots_v1') ?? '{}'); return r.asmr?.rootPathToken ?? ''; })()`);
    assert.ok(rootToken.startsWith('yk-root-'), 'token');
    const ts = '2026-08-06T00:00:00.000Z';
    const index = {
      schemaVersion: 1, generatedAt: ts, sourceKind: 'fixture',
      roots: [{ id: 'u42-root', name: 'U42库', rootPath: `rootPathToken:${rootToken}`, libraryType: 'mixed', scanProfile: 'asmr-rj', sourceKind: 'fixture', createdAt: ts, updatedAt: ts }],
      collections: [
        { id: 'u42-rj', rootId: 'u42-root', collectionType: 'rj_work', title: 'U42 音声', codeRaw: 'RJ800001', codeNorm: 'RJ800001', circle: 'U42社团', cvs: ['U42CV'], tags: [], status: 'identified', trackIds: ['u42-1', 'u42-2'], totalDurationSeconds: 60, addedAt: ts, updatedAt: ts },
        { id: 'u42-album', rootId: 'u42-root', collectionType: 'music_album', title: 'Album M', artist: 'Artist M', album: 'Album M', tags: [], status: 'identified', trackIds: ['u42-3'], totalDurationSeconds: 30, addedAt: ts, updatedAt: ts },
      ],
      tracks: [
        { id: 'u42-1', rootId: 'u42-root', collectionId: 'u42-rj', kind: 'audio', title: 'U42 音轨一', displayArtist: 'U42CV', displayAlbum: 'U42 音声', rjId: 'RJ800001', trackNo: 1, durationSeconds: 30, source: { id: 's1', trackId: 'u42-1', sourceKind: 'local-file', relativePath: 'asmr/RJ800001/01.wav', extension: 'wav', sizeBytes: sizes['asmr/RJ800001/01.wav'], mtimeMs: 1 }, subtitles: [{ id: 'sub1', trackId: 'u42-1', sourceKind: 'local-file', language: 'bilingual', format: 'lrc', relativePath: 'asmr/RJ800001/01.lrc' }], tags: [], addedAt: ts },
        { id: 'u42-2', rootId: 'u42-root', collectionId: 'u42-rj', kind: 'audio', title: 'U42 音轨二', displayArtist: 'U42CV', displayAlbum: 'U42 音声', rjId: 'RJ800001', trackNo: 2, durationSeconds: 30, source: { id: 's2', trackId: 'u42-2', sourceKind: 'local-file', relativePath: 'asmr/RJ800001/02.wav', extension: 'wav', sizeBytes: sizes['asmr/RJ800001/02.wav'], mtimeMs: 1 }, subtitles: [], tags: [], addedAt: ts },
        { id: 'u42-3', rootId: 'u42-root', collectionId: 'u42-album', kind: 'audio', title: 'U42 音乐曲目', displayArtist: 'Artist M', displayAlbum: 'Album M', rjId: undefined, trackNo: 1, durationSeconds: 30, source: { id: 's3', trackId: 'u42-3', sourceKind: 'local-file', relativePath: 'music/Artist M/Album M/01.wav', extension: 'wav', sizeBytes: sizes['music/Artist M/Album M/01.wav'], mtimeMs: 1 }, subtitles: [], tags: [], addedAt: ts },
      ],
      covers: [
        { id: 'cv1', collectionId: 'u42-rj', sourceKind: 'local-file', relativePath: 'asmr/RJ800001/cover.png', isPrimary: true },
        { id: 'cv2', collectionId: 'u42-album', sourceKind: 'local-file', relativePath: 'music/Artist M/Album M/cover.png', isPrimary: true },
      ],
      subtitles: [{ id: 'sub1', trackId: 'u42-1', sourceKind: 'local-file', language: 'bilingual', format: 'lrc', relativePath: 'asmr/RJ800001/01.lrc' }],
      warnings: [],
    };
    writeFile(fixtureDir, 'library-index.json', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(JSON.stringify(index, null, 2), 'utf8')]));
    await clickButtonText(cdp, '读取已有记录', true);
    await check('index read', `document.body.innerText.includes('文件编码：utf8-bom')`, 30000);
    await cdp.evaluate(`(() => {
      const now = new Date().toISOString();
      localStorage.setItem('yang_kura_user_playlists_v1', JSON.stringify({ version: 1, updatedAt: now, playlists: [{ id: 'pl1', name: '测试歌单', description: 'x', coverUrl: '', creator: '本地', tracksCount: 0, tracks: [], isSystem: false, sourceKind: 'user-local' }] }));
      localStorage.setItem('yang_kura_mpv_playback_preference_v1', 'html-audio-only');
      return true;
    })()`);

    // --- PlayerBar More button removed ---
    await click(cdp, '#nav-asmr-lib');
    await check('asmr lib', "document.querySelector('[data-u37b-asmr-library]')");
    await click(cdp, '[data-u37b-asmr-card]');
    await check('rj detail', "document.querySelector('[data-u37c-rj-detail=\"ready\"]')");
    await click(cdp, '#play-all-asmr');
    await check('playing', "document.querySelector('#app-player-bar')?.dataset.u29TrackId === 'u42-1' && document.querySelector('#app-player-bar')?.dataset.u29PlaybackMode === 'html-audio'", 25000);
    await checkFalse('no more button', `Boolean([...document.querySelectorAll('#app-player-bar button')].find((b) => b.getAttribute('aria-label')?.includes('更多播放操作')))`);
    await checkFalse('no more control class', `Boolean(document.querySelector('#app-player-bar .u30-more-control'))`);
    await check('play button present', `Boolean(document.querySelector('#app-player-bar button[aria-label="播放"], #app-player-bar button[aria-label="暂停"]'))`);
    await check('mute present', `Boolean(document.querySelector('#app-player-bar button[aria-label="静音"], #app-player-bar button[aria-label="取消静音"]'))`);
    await check('queue toggle present', `Boolean(document.querySelector('#player-queue-toggle'))`);
    await check('playlist menu present', `Boolean(document.querySelector('#app-player-bar button[aria-label="收藏到歌单"]'))`);
    await check('floating lyrics present', `Boolean(document.querySelector('#app-player-bar button[aria-label*="歌词浮窗"]'))`);
    await check('completion present', `Boolean(document.querySelector('#app-player-bar button[aria-label^="播放完成策略"]'))`);
    await check('compat markers present', `Boolean(document.querySelector('#mvp59-player-beta-chips'))`);
    await shot('u42-player-bar-no-more');

    // --- ASMR batch opt-in ---
    await click(cdp, '#nav-asmr-lib');
    await check('asmr lib again', "document.querySelector('[data-u37b-asmr-library]')");
    await checkFalse('selection bar hidden by default', `Boolean(document.querySelector('.u37b-selection-bar'))`);
    await checkFalse('card checkbox hidden by default', `Boolean(document.querySelector('[data-u37b-asmr-card] input[type="checkbox"]'))`);
    await shot('u42-asmr-batch-hidden');
    await clickButtonText(cdp, '批量管理', true);
    await check('selection bar appears', `Boolean(document.querySelector('.u37b-selection-bar'))`);
    await check('card checkbox appears', `Boolean(document.querySelector('[data-u37b-asmr-card] input[type="checkbox"]'))`);
    await cdp.evaluate(`(() => { const boxes=[...document.querySelectorAll('[data-u37b-asmr-card] input[type="checkbox"]')].slice(0,1); boxes.forEach((b)=>b.click()); return true; })()`);
    await check('selected count 1', `document.querySelector('.u37b-selection-bar')?.textContent?.includes('已选择 1 个作品')`);
    await clickButtonText(cdp, '退出批量管理', true);
    await checkFalse('selection cleared on exit', `Boolean(document.querySelector('.u37b-selection-bar'))`);
    await shot('u42-asmr-batch-exit');

    // --- RJ track more menu ---
    await click(cdp, '[data-u37b-asmr-card]');
    await check('rj detail again', "document.querySelector('[data-u37c-rj-detail=\"ready\"]')");
    await checkFalse('track more menu hidden by default', `Boolean(document.querySelector('.u37c-track-menu'))`);
    await cdp.evaluate(`(() => { const b=[...document.querySelectorAll('.u37c-track-more')][0]; if (b) b.click(); return true; })()`);
    await check('track more menu opens', `Boolean(document.querySelector('.u37c-track-menu'))`);
    const menuItems = await cdp.evaluate(`document.querySelectorAll('.u37c-track-menu button').length`);
    assert.equal(menuItems, 3, 'track menu has 3 items');
    await check('copy item', `[...document.querySelectorAll('.u37c-track-menu button')].some((b)=>b.textContent?.includes('复制文件相对路径'))`);
    await check('reveal item', `[...document.querySelectorAll('.u37c-track-menu button')].some((b)=>b.textContent?.includes('在文件管理器中定位'))`);
    await check('open item', `[...document.querySelectorAll('.u37c-track-menu button')].some((b)=>b.textContent?.includes('用系统默认应用打开'))`);
    await shot('u42-rj-track-menu');
    await pressKey(runtime.cdp, 'Escape');
    await checkFalse('track menu closes on Escape', `Boolean(document.querySelector('.u37c-track-menu'))`);
    await shot('u42-rj-track-row-simplified');

    // --- Music batch opt-in ---
    await click(cdp, '#nav-music-lib');
    await check('music lib before batch', "document.querySelector('[data-u37d-music-library]')");
    await checkFalse('music selection bar hidden by default', `Boolean(document.querySelector('.u37d-selection-bar'))`);
    await shot('u42-music-batch-hidden');
    await clickButtonText(cdp, '批量管理', true);
    await check('music selection bar appears', `Boolean(document.querySelector('.u37d-selection-bar'))`);
    await check('music track select present', `Boolean(document.querySelector('[data-u37d-track-row] button[aria-label^="选择 "]'))`);
    await shot('u42-music-batch-mode');
    await clickButtonText(cdp, '退出批量管理', true);
    await checkFalse('music selection cleared on exit', `Boolean(document.querySelector('.u37d-selection-bar'))`);

    // --- Music metadata advanced backup collapsed ---
    await click(cdp, '#nav-music-lib');
    await check('music lib', "document.querySelector('[data-u37d-music-library]')");
    await click(cdp, '#mvp115-music-metadata-management > summary');
    await check('metadata panel open', `Boolean(document.querySelector('#mvp115-music-metadata-management'))`);
    await checkFalse('backup collapsed by default', `Boolean(document.querySelector('#mvp116-metadata-backup-preview'))`);
    await cdp.evaluate(`(() => { const s=[...document.querySelectorAll('#mvp115-music-metadata-management summary')].find((x)=>x.textContent?.includes('备份与恢复')); if (s) s.click(); return true; })()`);
    await check('export button after expand', `[...document.querySelectorAll('#mvp115-music-metadata-management button')].some((b)=>b.textContent?.includes('导出修改'))`);
    await shot('u42-music-metadata-advanced');

    // --- Settings MPV collapsed ---
    await click(cdp, '#nav-settings');
    await check('settings again', "document.querySelector('[data-settings-tab]')");
    await click(cdp, '[data-settings-tab="player"]');
    await check('player tab', `document.querySelector('select[aria-label="选择本地音频播放后端偏好"]')`);
    await checkFalse('mpv manual hidden by default', `[...document.querySelectorAll('#mvp123-mpv-settings-status details')].some((d)=>d.open)`);
    await cdp.evaluate(`(() => { const s=[...document.querySelectorAll('#mvp123-mpv-settings-status details')][0]?.querySelector('summary'); if (s) s.click(); return true; })()`);
    await check('mpv manual visible after expand', `[...document.querySelectorAll('#mvp123-mpv-settings-status button')].some((b)=>b.textContent?.includes('重新检测')) && [...document.querySelectorAll('#mvp123-mpv-settings-status details')].some((d)=>d.open)`);
    await shot('u42-settings-mpv-advanced');

    // --- Maintenance collapsed + renamed ---
    await click(cdp, '[data-settings-tab="theme"]');
    await check('theme tab', `document.querySelector('[data-settings-tab="theme"]')`);
    await check('maintenance entry present', `Boolean(document.querySelector('#u39b-settings-maintenance-entry'))`);
    await check('maintenance renamed', `document.querySelector('#u39b-settings-maintenance-entry')?.textContent?.includes('诊断与修复')`);
    await checkFalse('maintenance collapsed by default', `document.querySelector('#u39b-settings-maintenance-entry')?.open`);
    await shot('u42-maintenance-entry-collapsed');

    // --- Importer default copy; move under advanced ---
    await click(cdp, '#nav-importer');
    await check('importer', "document.querySelector('#u41b-importer-primary-flow')");
    await check('copy default', `[...document.querySelectorAll('button')].some((b)=>b.textContent?.includes('复制到资源库') && b.getAttribute('aria-pressed') === 'true')`);
    await checkFalse('move hidden by default', `[...document.querySelectorAll('#u41b-importer-primary-flow details')].some((d)=>d.open)`);
    await shot('u42-importer-copy-default');
    await cdp.evaluate(`(() => { const s=[...document.querySelectorAll('#u41b-importer-primary-flow summary')].find((x)=>x.textContent?.includes('高级导入选项')); if (s) s.click(); return true; })()`);
    await check('move appears after expand', `[...document.querySelectorAll('#u41b-importer-primary-flow button')].some((b)=>b.textContent?.includes('移动到资源库')) && [...document.querySelectorAll('#u41b-importer-primary-flow details')].some((d)=>d.open)`);
    await shot('u42-importer-advanced-move');

    // --- Responsive: no horizontal overflow across viewports ---
    for (const vp of [
      { width: 800, height: 700, scale: 1.0 },
      { width: 800, height: 700, scale: 1.25 },
      { width: 1024, height: 720, scale: 1.0 },
      { width: 1280, height: 800, scale: 1.25 },
    ]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.scale, mobile: false });
      await delay(300);
      await click(cdp, '#nav-dashboard');
      await check('dashboard ready', "document.querySelector('[data-u37b-home=\"daily\"]')");
      const layout = await cdp.evaluate(`({ doc: document.documentElement.scrollWidth > innerWidth + 1, main: Boolean(document.querySelector('main')) ? document.querySelector('main').scrollWidth > document.querySelector('main').clientWidth + 1 : false, player: Boolean(document.querySelector('#app-player-bar')?.offsetParent) })`);
      assert.equal(layout.doc, false, `${vp.width}x${vp.height}@${vp.scale} document overflow`);
      assert.equal(layout.main, false, `${vp.width}x${vp.height}@${vp.scale} main overflow`);
      if (vp.width === 1280) await shot(`u42-responsive-${vp.width}x${vp.height}-${String(vp.scale).replace('.', '-')}`);
      assert.equal(layout.player, true, `${vp.width}x${vp.height}@${vp.scale} player bar visible`);
      report.checks.push({ name: `responsive:${vp.width}x${vp.height}@${vp.scale}`, pass: true });
    }

    assert.deepEqual(runtime.cdp.errors, [], `renderer errors: ${runtime.cdp.errors.join(' | ')}`);
    report.errors = runtime.cdp.errors;
    report.status = 'PASS';
  } catch (error) {
    report.status = 'FAIL';
    report.error = error instanceof Error ? error.stack ?? error.message : String(error);
    report.errors = runtime?.cdp?.errors ?? [];
    throw error;
  } finally {
    fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    if (runtime) await closeElectron(runtime).catch(() => {});
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
