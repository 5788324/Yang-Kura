#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-k2-r4-query-'));
const dbPath = path.join(tempRoot, 'catalog.sqlite');
const catalog = new KuraCatalogDatabase(dbPath);

const root = {
  id: 'root-r4',
  name: 'R4',
  rootPath: 'rootPathToken:r4',
  libraryType: 'asmr',
  scanProfile: 'asmr-rj',
  sourceKind: 'fixture',
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
};
const collections = Array.from({ length: 80 }, (_, index) => {
  const n = String(index + 1).padStart(6, '0');
  return {
    id: `RJ${n}`,
    rootId: root.id,
    collectionType: 'rj_work',
    title: index === 2 ? '夜色钢琴与耳语' : index === 3 ? '深夜耳语睡前故事' : `普通作品 ${n}`,
    sortTitle: index % 4 === 0 ? '同名排序' : `作品 ${String(index % 17).padStart(2, '0')}`,
    codeRaw: `RJ${n}`,
    codeNorm: `RJ${n}`,
    circle: `社团 ${index % 5}`,
    cvs: [`声优 ${index % 7}`],
    folderPath: `新建下载/RJ${n}`,
    tags: [index % 2 ? '睡眠' : '耳语'],
    status: 'identified',
    trackIds: [`track-${n}`],
    totalDurationSeconds: index % 6 === 0 ? 3600 : 1800 + index,
    addedAt: `2026-09-${String((index % 20) + 1).padStart(2, '0')}T00:00:00.000Z`,
    updatedAt: '2026-09-23T00:00:00.000Z',
  };
});
const tracks = collections.map((collection, index) => ({
  id: collection.trackIds[0],
  rootId: root.id,
  collectionId: collection.id,
  kind: 'audio',
  title: index === 4 ? '月夜低语放松音轨' : `Track ${index + 1}`,
  displayArtist: `声优 ${index % 7}`,
  displayAlbum: collection.title,
  rjId: collection.codeNorm,
  trackNo: 1,
  durationSeconds: 300 + index,
  source: {
    id: `source-${index + 1}`,
    trackId: collection.trackIds[0],
    sourceKind: 'local-file',
    relativePath: `${collection.folderPath}/Voice/01.wav`,
  },
  subtitles: [],
  tags: [index % 2 ? '睡眠' : '耳语'],
  addedAt: collection.addedAt,
}));
const fixture = {
  schemaVersion: 1,
  generatedAt: '2026-09-23T00:00:00.000Z',
  sourceKind: 'fixture',
  roots: [root],
  collections,
  tracks,
  covers: [],
  subtitles: [],
  warnings: [],
};

try {
  catalog.replaceFromLegacyIndex(fixture);
  if (!catalog.searchCollections('夜色', 20).some((row) => row.title === '夜色钢琴与耳语')) {
    throw new Error('2-char CJK substring fallback failed');
  }
  if (!catalog.searchCollections('耳语睡前', 20).some((row) => row.title === '深夜耳语睡前故事')) {
    throw new Error('CJK trigram collection search failed');
  }
  if (!catalog.searchTracks('低语放松', 20).some((row) => row.title === '月夜低语放松音轨')) {
    throw new Error('CJK trigram track search failed');
  }
  if (!catalog.searchCollections('RJ000003', 20).some((row) => row.id === 'RJ000003')) {
    throw new Error('ASCII/RJ FTS search failed');
  }

  for (const sort of ['id-asc', 'title-asc', 'added-desc', 'duration-desc']) {
    const seen = new Set();
    let cursor = null;
    let guard = 0;
    do {
      const page = catalog.pageCollections({ rootId: root.id, sort, cursor, limit: 9 });
      page.items.forEach((row) => {
        if (seen.has(row.id)) throw new Error(`collection duplicate across ${sort} pages: ${row.id}`);
        seen.add(row.id);
      });
      cursor = page.nextCursor;
      if (++guard > 20) throw new Error(`collection pagination loop: ${sort}`);
    } while (cursor);
    if (seen.size !== collections.length) throw new Error(`collection pagination lost rows: ${sort} / ${seen.size}`);
  }

  for (const sort of ['id-asc', 'title-asc', 'album-asc', 'added-desc', 'duration-desc']) {
    const seen = new Set();
    let cursor = null;
    let guard = 0;
    do {
      const page = catalog.pageTracks({ rootId: root.id, sort, cursor, limit: 11 });
      page.items.forEach((row) => {
        if (seen.has(row.id)) throw new Error(`track duplicate across ${sort} pages: ${row.id}`);
        seen.add(row.id);
      });
      cursor = page.nextCursor;
      if (++guard > 20) throw new Error(`track pagination loop: ${sort}`);
    } while (cursor);
    if (seen.size !== tracks.length) throw new Error(`track pagination lost rows: ${sort} / ${seen.size}`);
  }

  console.log(JSON.stringify({
    ok: true,
    schemaVersion: catalog.getSchemaVersion(),
    collections: collections.length,
    tracks: tracks.length,
  }, null, 2));
} finally {
  catalog.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
console.log('K2-R4 catalog query PASS');
