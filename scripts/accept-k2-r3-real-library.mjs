#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';
import { scanRootIncremental } from '../dist-electron/catalog/incrementalScanner.js';

const root = process.env.YANG_KURA_REAL_LIBRARY_ROOT;
if (!root) {
  console.error('Set YANG_KURA_REAL_LIBRARY_ROOT to the real library path. This probe is read-only for media files.');
  process.exit(2);
}
if (!fs.existsSync(root)) throw new Error(`real library root does not exist: ${root}`);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-k2-r3-real-'));
const databasePath = path.join(tempRoot, 'catalog.sqlite');
const catalog = new KuraCatalogDatabase(databasePath);

try {
  const firstStarted = performance.now();
  const first = await scanRootIncremental({
    catalog,
    absoluteRootPath: root,
    rootPathToken: 'k2-r3-real-acceptance',
    displayName: path.basename(root) || 'Real Library',
    libraryType: 'asmr',
    scanProfile: 'mixed-folder',
    batchSize: 512,
    statConcurrency: 64,
  });
  const firstMs = performance.now() - firstStarted;
  if (first.status !== 'completed') throw new Error(`real first scan failed: ${JSON.stringify(first)}`);

  const secondStarted = performance.now();
  const second = await scanRootIncremental({
    catalog,
    absoluteRootPath: root,
    rootPathToken: 'k2-r3-real-acceptance',
    displayName: path.basename(root) || 'Real Library',
    libraryType: 'asmr',
    scanProfile: 'mixed-folder',
    batchSize: 512,
    statConcurrency: 64,
  });
  const secondMs = performance.now() - secondStarted;
  if (second.status !== 'completed') throw new Error(`real second scan failed: ${JSON.stringify(second)}`);

  console.log(JSON.stringify({
    mediaMutationPerformed: false,
    catalogDatabaseLocation: 'temporary-directory',
    first: { ...first, wallClockMs: Math.round(firstMs) },
    second: { ...second, wallClockMs: Math.round(secondMs) },
    databaseBytes: fs.statSync(databasePath).size,
  }, null, 2));
} finally {
  catalog.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
