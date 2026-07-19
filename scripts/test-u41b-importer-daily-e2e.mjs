#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { closeElectron, click, clickButtonText, launchElectron, waitFor } from './u40b/cdp-runtime.mjs';

if (process.platform !== 'win32') {
  console.log('[U41-B importer E2E] NOT RUN: Windows Electron runtime required.');
  process.exit(0);
}

function writeSilentWav(filePath, seconds = 1) {
  const sampleRate = 8_000;
  const channels = 1;
  const bitsPerSample = 16;
  const dataLength = sampleRate * seconds * channels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28);
  buffer.writeUInt16LE(channels * bitsPerSample / 8, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

const cwd = process.cwd();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u41b-'));
const profileDir = path.join(tempRoot, 'profile');
const sourceDir = path.join(tempRoot, 'import-source');
const targetDir = path.join(tempRoot, 'target-library');
fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(targetDir, { recursive: true });
writeSilentWav(path.join(sourceDir, 'RJ410001', '01.wav'));
fs.writeFileSync(path.join(sourceDir, 'RJ410001', 'cover.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
fs.writeFileSync(path.join(sourceDir, 'RJ410001', '01.lrc'), '[00:00.00]U41-B importer test\n', 'utf8');
const targetRootToken = 'yk-root-u41btarget12345678';
const targetRootId = `root-${crypto.createHash('sha1').update(targetRootToken).digest('hex').slice(0, 16)}`;
fs.writeFileSync(path.join(targetDir, 'library-index.json'), JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceKind: 'electron-scan',
  roots: [{
    id: targetRootId,
    name: 'target-library',
    rootPath: `rootPathToken:${targetRootToken}`,
    libraryType: 'mixed',
    scanProfile: 'mixed-folder',
    sourceKind: 'electron-scan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  collections: [],
  tracks: [],
  covers: [],
  subtitles: [],
  warnings: [],
}, null, 2), 'utf8');

let runtime;
try {
  runtime = await launchElectron({
    cwd,
    profileDir,
    fixtureDir: targetDir,
    extraEnv: {
      YANG_KURA_E2E_IMPORT_SOURCE_ROOT: sourceDir,
      YANG_KURA_E2E_IMPORT_TARGET_ROOT: targetDir,
    },
  });
  const { cdp } = runtime;
  await waitFor(cdp, "document.querySelector('#nav-importer')", 'importer navigation', 30_000);
  await click(cdp, '#nav-importer');
  await waitFor(cdp, "document.querySelector('[data-u41b-importer-daily=\"ready\"]')", 'daily importer page');

  await clickButtonText(cdp, '选择来源目录', true);
  await waitFor(cdp, "document.querySelectorAll('[data-import-step=\"source\"] input[type=checkbox]').length >= 3", 'scanned import entries', 30_000);
  const selectedCount = await cdp.evaluate("[...document.querySelectorAll('[data-import-step=\"source\"] input[type=checkbox]')].filter((item)=>item.checked).length");
  assert.ok(selectedCount >= 3, `expected source entries selected, got ${selectedCount}`);

  await clickButtonText(cdp, '选择目标资源库', true);
  await waitFor(cdp, "[...document.querySelectorAll('[data-import-step=\"target\"] p')].some((item)=>item.textContent?.includes('target-library'))", 'target selection');

  await clickButtonText(cdp, '执行预检', true);
  await waitFor(cdp, "[...document.querySelectorAll('[data-import-step=\"preflight\"] *')].some((item)=>item.textContent?.includes('已检查'))", 'import preflight', 30_000);

  await click(cdp, '[data-import-step="execute"] input[type="checkbox"]');
  await waitFor(cdp, "!document.querySelector('[data-import-step=\"execute\"] button')?.disabled", 'enabled execute button');
  await clickButtonText(cdp, '执行复制', true);
  await waitFor(cdp, "[...document.querySelectorAll('[data-import-step=\"execute\"] *')].some((item)=>item.textContent?.includes('Index 已备份并更新'))", 'index patch completion', 45_000);

  const copied = [];
  for (const entry of fs.readdirSync(targetDir, { recursive: true })) {
    if (typeof entry === 'string' && /\.(wav|jpg|lrc)$/i.test(entry)) copied.push(entry.replace(/\\/g, '/'));
  }
  assert.ok(copied.some((item) => item.endsWith('/01.wav') || item === '01.wav'), `audio was not copied: ${copied.join(', ')}`);
  assert.ok(fs.existsSync(path.join(sourceDir, 'RJ410001', '01.wav')), 'copy mode must preserve source audio');
  const index = JSON.parse(fs.readFileSync(path.join(targetDir, 'library-index.json'), 'utf8'));
  assert.ok(index.tracks.length >= 1, 'patched index must contain imported track');
  assert.ok(fs.readdirSync(targetDir).some((name) => name.startsWith('library-index.backup.before-mvp100-')), 'index backup missing');
  assert.deepEqual(runtime.cdp.errors, [], `renderer errors: ${runtime.cdp.errors.join('\n')}`);
  console.log('[U41-B importer E2E] PASS');
  console.log(`copied=${copied.length}; tracks=${index.tracks.length}; sourcePreserved=true`);
} finally {
  if (runtime) await closeElectron(runtime);
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
