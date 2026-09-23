#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';
import {
  catalogRootIdFromToken,
  scanRootIncremental,
} from '../dist-electron/catalog/incrementalScanner.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-k2-r3-scanner-'));
const mediaRoot = path.join(tempRoot, 'media');
const databasePath = path.join(tempRoot, 'catalog.sqlite');
fs.mkdirSync(mediaRoot, { recursive: true });

function writeCorpus(root, directories, filesPerDirectory) {
  for (let directory = 0; directory < directories; directory += 1) {
    const dir = path.join(root, `RJ${String(directory + 1).padStart(6, '0')}`, 'Voice');
    fs.mkdirSync(dir, { recursive: true });
    for (let file = 0; file < filesPerDirectory; file += 1) {
      fs.writeFileSync(path.join(dir, `${String(file + 1).padStart(4, '0')}.wav`), Buffer.alloc(64));
    }
    fs.writeFileSync(path.join(path.dirname(dir), 'cover.jpg'), Buffer.alloc(32));
    fs.writeFileSync(path.join(dir, 'subtitle.vtt'), 'WEBVTT\n');
  }
}

writeCorpus(mediaRoot, 20, 100);

const catalog = new KuraCatalogDatabase(databasePath);
try {
  const token = 'k2-r3-test-root';
  const rootId = catalogRootIdFromToken(token);

  const firstStarted = performance.now();
  const first = await scanRootIncremental({
    catalog,
    absoluteRootPath: mediaRoot,
    rootPathToken: token,
    displayName: 'Synthetic ASMR',
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    batchSize: 128,
    statConcurrency: 32,
  });
  const firstMs = performance.now() - firstStarted;
  if (!first.ok || first.status !== 'completed') throw new Error(`first scan failed: ${JSON.stringify(first)}`);
  if (first.maxBatchObserved > 128) throw new Error('scanner exceeded configured batch bound');
  if (first.filesSeen !== 2040) throw new Error(`unexpected first-scan file count: ${first.filesSeen}`);
  if (catalog.listScanEntries(rootId, 'missing', 100).length !== 0) throw new Error('first scan produced missing entries');

  const secondStarted = performance.now();
  const second = await scanRootIncremental({
    catalog,
    absoluteRootPath: mediaRoot,
    rootPathToken: token,
    displayName: 'Synthetic ASMR',
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    batchSize: 128,
    statConcurrency: 32,
  });
  const secondMs = performance.now() - secondStarted;
  if (!second.ok || second.status !== 'completed') throw new Error('second scan failed');
  if (second.changedEntries !== 0) throw new Error(`unchanged fast path failed: changed=${second.changedEntries}`);

  const changedFile = path.join(mediaRoot, 'RJ000001', 'Voice', '0001.wav');
  fs.writeFileSync(changedFile, Buffer.alloc(96));
  const future = new Date(Date.now() + 5000);
  fs.utimesSync(changedFile, future, future);
  fs.rmSync(path.join(mediaRoot, 'RJ000002', 'Voice', '0002.wav'));
  fs.writeFileSync(path.join(mediaRoot, 'RJ000003', 'Voice', 'new.wav'), Buffer.alloc(48));

  const third = await scanRootIncremental({
    catalog,
    absoluteRootPath: mediaRoot,
    rootPathToken: token,
    displayName: 'Synthetic ASMR',
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    batchSize: 128,
    statConcurrency: 32,
  });
  if (third.status !== 'completed') throw new Error('third scan failed');
  if (third.missingEntries !== 1) throw new Error(`expected one missing entry, got ${third.missingEntries}`);
  if (third.changedEntries < 3) throw new Error(`expected modified + added + missing changes, got ${third.changedEntries}`);
  const missing = catalog.listScanEntries(rootId, 'missing', 10);
  if (missing.length !== 1 || !missing[0].relativePath.endsWith('RJ000002/Voice/0002.wav')) {
    throw new Error(`missing state mismatch: ${JSON.stringify(missing)}`);
  }

  const resumeRoot = path.join(tempRoot, 'resume-media');
  fs.mkdirSync(resumeRoot, { recursive: true });
  writeCorpus(resumeRoot, 4, 80);
  const resumeToken = 'k2-r3-resume-root';
  const controller = new AbortController();
  let batchCount = 0;
  const cancelled = await scanRootIncremental({
    catalog,
    absoluteRootPath: resumeRoot,
    rootPathToken: resumeToken,
    displayName: 'Resume ASMR',
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    batchSize: 64,
    statConcurrency: 16,
    signal: controller.signal,
    onBatch: () => {
      batchCount += 1;
      if (batchCount === 1) controller.abort();
    },
  });
  if (cancelled.status !== 'cancelled') throw new Error(`expected cancelled run, got ${cancelled.status}`);
  if (!cancelled.checkpointRelativePath) throw new Error('cancelled scan did not persist checkpoint');

  const resumed = await scanRootIncremental({
    catalog,
    absoluteRootPath: resumeRoot,
    rootPathToken: resumeToken,
    displayName: 'Resume ASMR',
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    batchSize: 64,
    statConcurrency: 16,
    resumeRunId: cancelled.runId,
  });
  if (resumed.status !== 'completed' || resumed.resumeCount !== 1) {
    throw new Error(`resume failed: ${JSON.stringify(resumed)}`);
  }
  const resumeRootId = catalogRootIdFromToken(resumeToken);
  if (catalog.listScanEntries(resumeRootId, 'missing', 10).length) {
    throw new Error('cancel/resume incorrectly marked unvisited entries missing');
  }

  console.log(JSON.stringify({
    ok: true,
    firstScanMs: Math.round(firstMs),
    secondScanMs: Math.round(secondMs),
    firstChanged: first.changedEntries,
    secondChanged: second.changedEntries,
    thirdChanged: third.changedEntries,
    thirdMissing: third.missingEntries,
    resumeCount: resumed.resumeCount,
    maxBatchObserved: Math.max(first.maxBatchObserved, second.maxBatchObserved, third.maxBatchObserved, resumed.maxBatchObserved),
  }, null, 2));
} finally {
  catalog.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('K2-R3 incremental scanner PASS');
