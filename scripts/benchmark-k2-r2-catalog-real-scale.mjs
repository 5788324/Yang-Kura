#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';

const COLLECTIONS = Number(process.env.YANG_KURA_BENCH_COLLECTIONS ?? 2663);
const TRACKS = Number(process.env.YANG_KURA_BENCH_TRACKS ?? 69285);
const SUBTITLES = Number(process.env.YANG_KURA_BENCH_SUBTITLES ?? 111304);
const ARTWORK = Number(process.env.YANG_KURA_BENCH_ARTWORK ?? 29930);

function rssMiB() {
  return Number((process.memoryUsage().rss / 1024 / 1024).toFixed(1));
}

function databaseBytes(databasePath) {
  let total = 0;
  for (const suffix of ['', '-wal', '-shm']) {
    const file = databasePath + suffix;
    if (fs.existsSync(file)) total += fs.statSync(file).size;
  }
  return total;
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-real-scale-catalog-'));
const databasePath = path.join(tempRoot, 'catalog.sqlite');
const rssBeforeFixture = rssMiB();
const fixtureStarted = performance.now();

const roots = [{
  id: 'root-real-scale',
  name: 'Real Scale ASMR',
  rootPath: 'rootPathToken:real-scale',
  libraryType: 'asmr',
  scanProfile: 'asmr-rj',
  sourceKind: 'fixture',
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
}];

const collections = Array.from({ length: COLLECTIONS }, (_, index) => {
  const number = String(index + 1).padStart(6, '0');
  return {
    id: `rj-${number}`,
    rootId: 'root-real-scale',
    collectionType: 'rj_work',
    title: index === 1234 ? `真实规模耳语目标 RJ${number}` : `RJ Work ${number}`,
    sortTitle: `RJ Work ${number}`,
    codeRaw: `RJ${number}`,
    codeNorm: `RJ${number}`,
    circle: `Circle ${index % 400}`,
    cvs: [`CV ${index % 700}`],
    folderPath: `新建下载/batch-${index % 50}/RJ${number}`,
    tags: [`tag-${index % 80}`, index % 5 === 0 ? '耳语' : '日常'],
    status: 'identified',
    trackIds: [],
  };
});

const tracks = Array.from({ length: TRACKS }, (_, index) => {
  const collectionIndex = index % COLLECTIONS;
  const collection = collections[collectionIndex];
  const trackId = `track-${String(index + 1).padStart(7, '0')}`;
  collection.trackIds.push(trackId);
  return {
    id: trackId,
    rootId: 'root-real-scale',
    collectionId: collection.id,
    kind: 'audio',
    title: index === 45678 ? '真实规模目标音轨 耳语' : `Track ${index + 1}`,
    displayArtist: `CV ${collectionIndex % 700}`,
    displayAlbum: collection.title,
    rjId: collection.codeNorm,
    trackNo: Math.floor(index / COLLECTIONS) + 1,
    durationSeconds: 300 + (index % 1800),
    source: {
      id: `source-${index + 1}`,
      trackId,
      sourceKind: 'local-file',
      relativePath: `${collection.folderPath}/Voice/part-${index % 4}/${String(index + 1).padStart(7, '0')}.wav`,
      extension: 'wav',
      sizeBytes: 8_000_000 + index,
      mtimeMs: 1_700_000_000_000 + index,
    },
    subtitles: [],
    tags: [index % 3 === 0 ? '耳语' : 'voice'],
  };
});

const subtitles = Array.from({ length: SUBTITLES }, (_, index) => {
  const track = tracks[index % TRACKS];
  const lang = index % 2 === 0 ? 'zh' : 'ja';
  return {
    id: `subtitle-${index + 1}`,
    trackId: track.id,
    sourceKind: 'local-file',
    language: lang,
    format: index % 3 === 0 ? 'lrc' : 'vtt',
    relativePath: track.source.relativePath.replace(/\.wav$/i, `.${lang}.${index % 3 === 0 ? 'lrc' : 'vtt'}`),
    lineCount: 100 + (index % 800),
  };
});

const covers = Array.from({ length: ARTWORK }, (_, index) => {
  const collection = collections[index % COLLECTIONS];
  return {
    id: `cover-${index + 1}`,
    collectionId: collection.id,
    sourceKind: 'local-file',
    relativePath: `${collection.folderPath}/images/cover-${index + 1}.jpg`,
    isPrimary: index < COLLECTIONS,
  };
});

const fixture = {
  schemaVersion: 1,
  generatedAt: '2026-09-23T00:00:00.000Z',
  sourceKind: 'fixture',
  roots,
  collections,
  tracks,
  covers,
  subtitles,
  warnings: [],
};

const fixtureMs = performance.now() - fixtureStarted;
const rssAfterFixture = rssMiB();
const catalog = new KuraCatalogDatabase(databasePath);

try {
  const importStarted = performance.now();
  const summary = catalog.replaceFromLegacyIndex(fixture);
  const importMs = performance.now() - importStarted;
  const rssAfterImport = rssMiB();

  if (summary.collections !== COLLECTIONS) throw new Error('collection count mismatch');
  if (summary.tracks !== TRACKS) throw new Error('track count mismatch');
  if (summary.subtitles !== SUBTITLES) throw new Error('subtitle count mismatch');
  if (summary.artwork !== ARTWORK) throw new Error('artwork count mismatch');

  const queryStarted = performance.now();
  const collectionSearch = catalog.searchCollections('真实规模耳语目标', 20);
  const trackSearch = catalog.searchTracks('真实规模目标音轨', 20);
  const filtered = catalog.queryCollections({ circle: 'Circle 34', cv: 'CV 34', limit: 100 });
  const facets = catalog.listCollectionFacets('tag', { collectionType: 'rj_work', limit: 100 });
  const page1 = catalog.queryTracks({ rootId: 'root-real-scale', kind: 'audio', limit: 200 });
  const page2 = catalog.queryTracks({
    rootId: 'root-real-scale',
    kind: 'audio',
    afterId: page1.at(-1)?.id ?? '',
    limit: 200,
  });
  const queryMs = performance.now() - queryStarted;

  if (!collectionSearch.length) throw new Error('collection FTS failed at real scale');
  if (!trackSearch.length) throw new Error('track FTS failed at real scale');
  if (!filtered.length) throw new Error('RJ filter failed at real scale');
  if (!facets.length) throw new Error('facet query failed at real scale');
  if (page1.length !== 200 || page2.length !== 200) throw new Error('keyset pagination failed at real scale');

  console.log(JSON.stringify({
    ok: true,
    runtime: process.versions.electron ? 'electron-node' : 'node',
    node: process.versions.node,
    electron: process.versions.electron ?? null,
    sqlite: process.versions.sqlite ?? null,
    fixture: {
      collections: COLLECTIONS,
      tracks: TRACKS,
      subtitles: SUBTITLES,
      artwork: ARTWORK,
      totalModeledRows: COLLECTIONS + TRACKS + SUBTITLES + ARTWORK,
    },
    timingsMs: {
      fixtureBuild: Math.round(fixtureMs),
      import: Math.round(importMs),
      queryBatch: Number(queryMs.toFixed(3)),
    },
    memoryRssMiB: {
      beforeFixture: rssBeforeFixture,
      afterFixture: rssAfterFixture,
      afterImport: rssAfterImport,
    },
    catalog: summary,
    databaseBytes: databaseBytes(databasePath),
  }, null, 2));
} finally {
  catalog.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
