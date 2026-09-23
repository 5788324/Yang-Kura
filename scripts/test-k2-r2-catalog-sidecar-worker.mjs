#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { DatabaseSync } from 'node:sqlite';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-sidecar-worker-'));
const databasePath = path.join(tempRoot, 'catalog.sqlite');
const indexPath = path.join(tempRoot, 'library-index.json');

const fixture = {
  schemaVersion: 1,
  generatedAt: '2026-09-23T00:00:00.000Z',
  sourceKind: 'electron-scan',
  roots: [{
    id: 'root-1',
    name: 'ASMR',
    rootPath: 'rootPathToken:test-root',
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    sourceKind: 'electron-scan',
    createdAt: '2026-09-23T00:00:00.000Z',
    updatedAt: '2026-09-23T00:00:00.000Z',
  }],
  collections: [{
    id: 'rj-1',
    rootId: 'root-1',
    collectionType: 'rj_work',
    title: 'Worker Sidecar RJ',
    folderPath: 'RJ000001',
    tags: [],
    status: 'identified',
    trackIds: ['track-1'],
  }],
  tracks: [{
    id: 'track-1',
    rootId: 'root-1',
    collectionId: 'rj-1',
    kind: 'audio',
    title: 'Track 1',
    source: {
      id: 'source-1',
      trackId: 'track-1',
      sourceKind: 'local-file',
      relativePath: 'RJ000001/01.wav',
    },
    subtitles: [],
    tags: [],
  }],
  covers: [],
  subtitles: [],
  warnings: [],
};
const source = Buffer.from(JSON.stringify(fixture), 'utf8');
fs.writeFileSync(indexPath, source);
const sha256 = crypto.createHash('sha256').update(source).digest('hex');

function runWorker(expectedSha256) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../dist-electron/catalog/catalogSidecarWorker.js', import.meta.url), {
      workerData: { databasePath, indexPath, expectedSha256 },
    });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`worker exited ${code}`));
    });
  });
}

try {
  const success = await runWorker(sha256);
  if (!success?.ok || success.code !== 'SYNCED') throw new Error(`sidecar worker failed: ${JSON.stringify(success)}`);

  const db = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const count = db.prepare('SELECT COUNT(*) AS count FROM tracks').get()?.count;
    if (Number(count) !== 1) throw new Error(`sidecar track count mismatch: ${count}`);
  } finally {
    db.close();
  }

  const skipped = await runWorker('0'.repeat(64));
  if (skipped?.ok || skipped?.code !== 'SOURCE_INDEX_CHANGED') {
    throw new Error(`stale-source guard failed: ${JSON.stringify(skipped)}`);
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('K2-R2 catalog sidecar worker PASS');
