#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';
import { ArtworkCacheService } from '../dist-electron/artwork/artworkCacheService.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-k2-r3-artwork-'));
const cacheRoot = path.join(tempRoot, 'cache');
const sourceRoot = path.join(tempRoot, 'source');
const databasePath = path.join(tempRoot, 'catalog.sqlite');
fs.mkdirSync(sourceRoot, { recursive: true });

const catalog = new KuraCatalogDatabase(databasePath);
catalog.ensureScannerRoot({
  id: 'root-artwork',
  rootPathToken: 'artwork-token',
  name: 'Artwork Root',
  libraryType: 'asmr',
  scanProfile: 'asmr-rj',
});

let generatorCalls = 0;
let active = 0;
let maxActive = 0;
const generator = async ({ sourceAbsolutePath, outputAbsolutePath }) => {
  generatorCalls += 1;
  active += 1;
  maxActive = Math.max(maxActive, active);
  try {
    const source = fs.readFileSync(sourceAbsolutePath);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const output = Buffer.concat([Buffer.from('thumb:'), source]);
    fs.writeFileSync(outputAbsolutePath, output);
    return { width: 320, height: 320, byteSize: output.byteLength };
  } finally {
    active -= 1;
  }
};

const service = new ArtworkCacheService(catalog, cacheRoot, generator, 2, 640);

try {
  const sourcePath = path.join(sourceRoot, 'cover.jpg');
  fs.writeFileSync(sourcePath, Buffer.from('original-cover'));
  const original = fs.readFileSync(sourcePath);
  const stat1 = fs.statSync(sourcePath);
  const source = {
    rootId: 'root-artwork',
    sourceRelativePath: 'RJ000001/cover.jpg',
    sourceAbsolutePath: sourcePath,
    sizeBytes: stat1.size,
    mtimeMs: stat1.mtimeMs,
  };

  const first = await service.enqueue(source);
  if (first.cacheHit || first.state !== 'ready') throw new Error('first artwork cache build should be a miss');
  if (!fs.existsSync(first.cacheAbsolutePath)) throw new Error('thumbnail cache file missing');

  const second = await service.enqueue(source);
  if (!second.cacheHit) throw new Error('second artwork cache lookup should hit');
  if (generatorCalls !== 1) throw new Error(`cache hit regenerated thumbnail: ${generatorCalls}`);

  fs.writeFileSync(sourcePath, Buffer.from('original-cover-updated'));
  const future = new Date(Date.now() + 5000);
  fs.utimesSync(sourcePath, future, future);
  const stat2 = fs.statSync(sourcePath);
  const rebuilt = await service.enqueue({
    ...source,
    sizeBytes: stat2.size,
    mtimeMs: stat2.mtimeMs,
  });
  if (rebuilt.cacheHit || rebuilt.cacheKey === first.cacheKey) throw new Error('changed artwork source did not invalidate cache');
  if (generatorCalls !== 2) throw new Error('changed artwork source was not rebuilt');

  const parallel = [];
  for (let index = 0; index < 8; index += 1) {
    const file = path.join(sourceRoot, `cover-${index}.jpg`);
    fs.writeFileSync(file, Buffer.from(`cover-${index}`));
    const stat = fs.statSync(file);
    parallel.push(service.enqueue({
      rootId: 'root-artwork',
      sourceRelativePath: `RJ${String(index + 2).padStart(6, '0')}/cover.jpg`,
      sourceAbsolutePath: file,
      sizeBytes: stat.size,
      mtimeMs: stat.mtimeMs,
    }));
  }
  await Promise.all(parallel);
  if (maxActive > 2) throw new Error(`artwork cache exceeded worker bound: ${maxActive}`);

  if (!fs.readFileSync(sourcePath).equals(Buffer.from('original-cover-updated'))) {
    throw new Error('artwork cache mutated original source');
  }
  if (original.equals(Buffer.alloc(0))) throw new Error('unexpected original fixture state');

  console.log(JSON.stringify({
    ok: true,
    generatorCalls,
    maxActive,
    cacheState: catalog.getArtworkCacheRecord('root-artwork', 'RJ000001/cover.jpg')?.state,
  }, null, 2));
} finally {
  catalog.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('K2-R3 artwork cache PASS');
