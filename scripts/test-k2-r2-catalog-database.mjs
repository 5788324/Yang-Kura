#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-catalog-test-'));
const databasePath = path.join(tempRoot, 'catalog.sqlite');

const fixture = {
  schemaVersion: 1,
  generatedAt: '2026-09-23T00:00:00.000Z',
  sourceKind: 'electron-scan',
  roots: [
    {
      id: 'root-asmr',
      name: 'ASMR',
      rootPath: 'E:\\arsm',
      libraryType: 'asmr',
      scanProfile: 'asmr-rj',
      sourceKind: 'electron-scan',
      createdAt: '2026-09-23T00:00:00.000Z',
      updatedAt: '2026-09-23T00:00:00.000Z',
    },
    {
      id: 'root-music',
      name: 'Music',
      rootPath: 'rootPathToken:music-token',
      libraryType: 'music',
      scanProfile: 'music-folder',
      sourceKind: 'electron-scan',
      createdAt: '2026-09-23T00:00:00.000Z',
      updatedAt: '2026-09-23T00:00:00.000Z',
    },
  ],
  collections: [
    {
      id: 'rj-001',
      rootId: 'root-asmr',
      collectionType: 'rj_work',
      title: '耳语睡前故事',
      sortTitle: '耳语睡前故事',
      codeRaw: 'RJ000001',
      codeNorm: 'RJ000001',
      circle: 'Kura Circle',
      cvs: ['CV A'],
      folderPath: '新建下载/RJ000001/Voice',
      tags: ['耳语', '睡眠'],
      status: 'identified',
      trackIds: ['track-rj-1'],
      totalDurationSeconds: 600,
      addedAt: '2026-09-23T00:00:00.000Z',
      updatedAt: '2026-09-23T00:00:00.000Z',
    },
    {
      id: 'album-001',
      rootId: 'root-music',
      collectionType: 'music_album',
      title: '夜色钢琴',
      artist: 'Artist A',
      album: '夜色钢琴',
      folderPath: 'Artist A/夜色钢琴',
      tags: ['钢琴'],
      status: 'identified',
      trackIds: ['track-music-1'],
    },
  ],
  tracks: [
    {
      id: 'track-rj-1',
      rootId: 'root-asmr',
      collectionId: 'rj-001',
      kind: 'audio',
      title: '第一轨 耳语',
      displayArtist: 'CV A',
      displayAlbum: '耳语睡前故事',
      rjId: 'RJ000001',
      trackNo: 1,
      durationSeconds: 600,
      source: {
        id: 'source-rj-1',
        trackId: 'track-rj-1',
        sourceKind: 'local-file',
        absolutePath: 'E:\\arsm\\新建下载\\RJ000001\\Voice\\01.wav',
        fileUrl: 'file:///E:/arsm/新建下载/RJ000001/Voice/01.wav',
        relativePath: '新建下载/RJ000001/Voice/01.wav',
        extension: 'wav',
        sizeBytes: 1000,
        mtimeMs: 123,
      },
      subtitles: [
        {
          id: 'subtitle-rj-1',
          trackId: 'track-rj-1',
          sourceKind: 'local-file',
          relativePath: '新建下载/RJ000001/Voice/01.zh.vtt',
          format: 'vtt',
          language: 'zh',
          lineCount: 12,
        },
      ],
      tags: ['耳语'],
    },
    {
      id: 'track-music-1',
      rootId: 'root-music',
      collectionId: 'album-001',
      kind: 'audio',
      title: 'Moon Piano',
      displayArtist: 'Artist A',
      displayAlbum: '夜色钢琴',
      trackNo: 1,
      source: {
        id: 'source-music-1',
        trackId: 'track-music-1',
        sourceKind: 'local-file',
        relativePath: 'Artist A/夜色钢琴/01.flac',
        extension: 'flac',
        sizeBytes: 2000,
        mtimeMs: 456,
      },
      subtitles: [],
      tags: ['钢琴'],
    },
  ],
  covers: [
    {
      id: 'cover-rj-1',
      collectionId: 'rj-001',
      sourceKind: 'local-file',
      absolutePath: 'E:\\arsm\\新建下载\\RJ000001\\cover.jpg',
      relativePath: '新建下载/RJ000001/cover.jpg',
      isPrimary: true,
    },
  ],
  subtitles: [
    {
      id: 'subtitle-rj-1',
      trackId: 'track-rj-1',
      sourceKind: 'local-file',
      relativePath: '新建下载/RJ000001/Voice/01.zh.vtt',
      format: 'vtt',
      language: 'zh',
      lineCount: 12,
    },
  ],
  warnings: [],
};

const catalog = new KuraCatalogDatabase(databasePath);
try {
  if (catalog.getSchemaVersion() !== 2) throw new Error('schema version mismatch');

  const summary = catalog.replaceFromLegacyIndex(fixture);
  const expectedCounts = {
    roots: 2,
    collections: 2,
    tracks: 2,
    mediaSources: 2,
    subtitles: 1,
    artwork: 1,
  };
  for (const [key, expected] of Object.entries(expectedCounts)) {
    if (summary[key] !== expected) throw new Error(`${key} mismatch: ${summary[key]} !== ${expected}`);
  }
  if (summary.folderNodes < 5) throw new Error(`folder tree unexpectedly small: ${summary.folderNodes}`);

  const filteredMusic = catalog.queryCollections({
    collectionType: 'music_album',
    artist: 'Artist A',
    limit: 10,
  });
  if (filteredMusic.length !== 1 || filteredMusic[0]?.id !== 'album-001') {
    throw new Error('music collection filter contract failed');
  }

  const filteredRj = catalog.queryCollections({
    collectionType: 'rj_work',
    circle: 'Kura Circle',
    cv: 'CV A',
    tag: '耳语',
    limit: 10,
  });
  if (filteredRj.length !== 1 || filteredRj[0]?.id !== 'rj-001') {
    throw new Error('RJ collection filter contract failed');
  }

  const taggedTrack = catalog.queryTracks({ tag: '钢琴', artist: 'Artist A', limit: 10 });
  if (taggedTrack.length !== 1 || taggedTrack[0]?.id !== 'track-music-1') {
    throw new Error('track filter contract failed');
  }

  const rootFolders = catalog.listFolderChildren('root-asmr');
  if (!rootFolders.some((row) => row.relativePath === '新建下载')) {
    throw new Error('folder root query contract failed');
  }
  const nestedFolders = catalog.listFolderChildren('root-asmr', '新建下载');
  if (!nestedFolders.some((row) => row.relativePath === '新建下载/RJ000001')) {
    throw new Error('folder child query contract failed');
  }

  const circles = catalog.listCollectionFacets('circle', { collectionType: 'rj_work' });
  if (circles[0]?.value !== 'Kura Circle' || Number(circles[0]?.count) !== 1) {
    throw new Error('circle facet contract failed');
  }
  const cvs = catalog.listCollectionFacets('cv', { collectionType: 'rj_work' });
  if (cvs[0]?.value !== 'CV A' || Number(cvs[0]?.count) !== 1) {
    throw new Error('CV facet contract failed');
  }

  const rjSearch = catalog.searchCollections('耳语', 10);
  if (rjSearch.length !== 1 || rjSearch[0]?.id !== 'rj-001') throw new Error('collection FTS search failed');

  const musicSearch = catalog.searchTracks('Moon', 10);
  if (musicSearch.length !== 1 || musicSearch[0]?.id !== 'track-music-1') throw new Error('track FTS search failed');

  // A logical Track may have multiple physical SourceRefs. Query APIs must still return one Track row.
  const rawForMultiSource = new DatabaseSync(databasePath);
  try {
    rawForMultiSource.prepare(`
      INSERT INTO media_sources (
        id, track_id, root_id, source_kind, relative_path, extension,
        size_bytes, mtime_ms, availability, fingerprint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'source-rj-1-cache',
      'track-rj-1',
      'root-asmr',
      'cache',
      'cache/RJ000001/01.wav',
      'wav',
      1000,
      124,
      'cached',
      null,
    );
  } finally {
    rawForMultiSource.close();
  }

  const singleLogicalTrack = catalog.queryTracks({ collectionId: 'rj-001', limit: 10 });
  if (singleLogicalTrack.length !== 1 || singleLogicalTrack[0]?.id !== 'track-rj-1') {
    throw new Error(`multi-source query duplicated logical Track: ${JSON.stringify(singleLogicalTrack)}`);
  }

  const rjTracks = catalog.listTracksByCollection('rj-001', '', 10);
  if (rjTracks.length !== 1 || rjTracks[0]?.relativePath !== '新建下载/RJ000001/Voice/01.wav') {
    throw new Error('collection track pagination failed');
  }

  const asmrRefresh = {
    ...structuredClone(fixture),
    roots: [structuredClone(fixture.roots[0])],
    collections: [{
      ...structuredClone(fixture.collections[0]),
      id: 'rj-002',
      title: '更新后的耳语作品',
      trackIds: ['track-rj-2'],
    }],
    tracks: [{
      ...structuredClone(fixture.tracks[0]),
      id: 'track-rj-2',
      collectionId: 'rj-002',
      title: '更新后的第一轨',
      source: {
        ...structuredClone(fixture.tracks[0].source),
        id: 'source-rj-2',
        trackId: 'track-rj-2',
        relativePath: '新建下载/RJ000002/Voice/01.wav',
      },
      subtitles: [],
    }],
    covers: [],
    subtitles: [],
  };
  const scopedSummary = catalog.upsertFromLegacyIndex(asmrRefresh);
  if (scopedSummary.roots !== 2 || scopedSummary.collections !== 2 || scopedSummary.tracks !== 2) {
    throw new Error(`root-scoped import damaged another root: ${JSON.stringify(scopedSummary)}`);
  }
  const preservedMusic = catalog.queryCollections({
    collectionType: 'music_album',
    artist: 'Artist A',
    limit: 10,
  });
  if (preservedMusic.length !== 1 || preservedMusic[0]?.id !== 'album-001') {
    throw new Error('music root disappeared after ASMR root refresh');
  }
  if (catalog.searchCollections('更新后的耳语', 10)[0]?.id !== 'rj-002') {
    throw new Error('ASMR root was not atomically replaced');
  }
  if (catalog.searchCollections('耳语睡前故事', 10).length !== 0) {
    throw new Error('stale ASMR collection survived root-scoped replacement');
  }

  const beforeBadImport = catalog.getCounts();
  const invalidFixture = structuredClone(fixture);
  invalidFixture.tracks.push({ ...structuredClone(fixture.tracks[0]), title: 'duplicate id' });
  let rollbackObserved = false;
  try {
    catalog.replaceFromLegacyIndex(invalidFixture);
  } catch {
    rollbackObserved = true;
  }
  if (!rollbackObserved) throw new Error('invalid import should fail');
  const afterBadImport = catalog.getCounts();
  if (JSON.stringify(beforeBadImport) !== JSON.stringify(afterBadImport)) {
    throw new Error('failed import did not roll back atomically');
  }
} finally {
  catalog.close();
}

const raw = new DatabaseSync(databasePath, { readOnly: true });
try {
  const rootRows = raw.prepare('SELECT root_path_ref AS rootPathRef FROM roots ORDER BY id').all();
  const sourceRows = raw.prepare('SELECT relative_path AS relativePath FROM media_sources ORDER BY id').all();
  const leaked = JSON.stringify({ rootRows, sourceRows });
  if (/E:\\\\arsm/i.test(leaked) || /file:\/\//i.test(leaked)) {
    throw new Error('catalog leaked an absolute path or file:// URL');
  }
  if (!leaked.includes('rootPathToken:music-token')) throw new Error('tokenized root reference was not preserved');
} finally {
  raw.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('K2-R2 catalog database PASS');
