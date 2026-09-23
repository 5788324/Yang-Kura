#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KuraCatalogDatabase } from '../dist-electron/catalog/catalogDatabase.js';
import { runCatalogQuery } from '../dist-electron/catalog/catalogQueryService.js';
import { catalogRootIdFromToken } from '../dist-electron/catalog/incrementalScanner.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-k2-r4-ipc-'));
const dbPath = path.join(tempRoot, 'catalog.sqlite');
const token = 'k2-r4-ipc-token';
const rootId = catalogRootIdFromToken(token);
const catalog = new KuraCatalogDatabase(dbPath);

const fixture = {
  schemaVersion: 1,
  generatedAt: '2026-09-23T00:00:00.000Z',
  sourceKind: 'fixture',
  roots: [{
    id: rootId,
    name: 'IPC Root',
    rootPath: `rootPathToken:${token}`,
    libraryType: 'asmr',
    scanProfile: 'asmr-rj',
    sourceKind: 'fixture',
    createdAt: '2026-09-23T00:00:00.000Z',
    updatedAt: '2026-09-23T00:00:00.000Z',
  }],
  collections: [{
    id: 'RJIPC001',
    rootId,
    collectionType: 'rj_work',
    title: '夜色耳语 IPC',
    codeRaw: 'RJIPC001',
    codeNorm: 'RJIPC001',
    circle: 'IPC Circle',
    cvs: ['IPC CV'],
    folderPath: 'RJIPC001',
    tags: ['耳语'],
    status: 'identified',
    trackIds: ['track-ipc-1'],
  }],
  tracks: [{
    id: 'track-ipc-1',
    rootId,
    collectionId: 'RJIPC001',
    kind: 'audio',
    title: 'IPC Track',
    source: {
      id: 'source-ipc-1',
      trackId: 'track-ipc-1',
      sourceKind: 'local-file',
      relativePath: 'RJIPC001/01.wav',
    },
    subtitles: [],
    tags: [],
  }],
  covers: [],
  subtitles: [],
  warnings: [],
};

try {
  catalog.replaceFromLegacyIndex(fixture);
} finally {
  catalog.close();
}

try {
  const page = runCatalogQuery(dbPath, {
    mode: 'collections',
    rootPathToken: token,
    search: '夜色',
    sort: 'title-asc',
    limit: 20,
  });
  if (!page.ok) throw new Error(`catalog query failed: ${JSON.stringify(page)}`);
  if (!Array.isArray(page.payload.items) || page.payload.items[0]?.id !== 'RJIPC001') {
    throw new Error(`catalog query payload mismatch: ${JSON.stringify(page.payload)}`);
  }

  const facets = runCatalogQuery(dbPath, {
    mode: 'facets',
    rootPathToken: token,
    facet: 'circle',
    collectionType: 'rj_work',
    limit: 20,
  });
  if (!facets.ok || facets.payload[0]?.value !== 'IPC Circle') throw new Error('facet query IPC failed');

  const missing = runCatalogQuery(dbPath, {
    mode: 'tracks',
    rootPathToken: 'not-synced-token',
    limit: 20,
  });
  if (missing.ok || missing.status !== 'k2-r4-catalog-query-not-ready') {
    throw new Error('not-ready fallback contract failed');
  }

  const serialized = JSON.stringify({ page, facets, missing });
  if (/catalog\.sqlite/i.test(serialized) || /file:\/\//i.test(serialized) || /[A-Z]:\\/i.test(serialized)) {
    throw new Error('catalog IPC leaked internal/absolute path');
  }

  for (const [file, tokenText] of [
    ['electron/preload.ts', 'requestCatalogQuery'],
    ['electron/main.ts', "registerLibraryHandler('catalogQuery'"],
    ['src/types/electron-api.d.ts', 'requestCatalogQuery'],
    ['src/services/catalogQueryService.ts', 'catalogQueryService'],
  ]) {
    if (!fs.readFileSync(file, 'utf8').includes(tokenText)) throw new Error(`catalog query bridge missing in ${file}`);
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('K2-R4 catalog IPC PASS');
