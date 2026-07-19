#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const coverModule = await import(pathToFileURL(path.join(root, 'dist-electron/libraryCoverSelection.js')).href);
const mediaModule = await import(pathToFileURL(path.join(root, 'dist-electron/mediaProtocolSupport.js')).href);

const selected = coverModule.selectPrimaryCoverPaths([
  { relativePath: 'RJ10000001/cover.jpg', collectionCandidate: 'RJ10000001', rjIdNorm: 'RJ10000001', sizeBytes: 320_000 },
  { relativePath: 'RJ10000001/icon.png', collectionCandidate: 'RJ10000001', rjIdNorm: 'RJ10000001', sizeBytes: 4_000 },
  { relativePath: 'RJ10000002/RJ10000002.jpg', collectionCandidate: 'RJ10000002', rjIdNorm: 'RJ10000002', sizeBytes: 480_000 },
  { relativePath: 'RJ10000002/sample_01.jpg', collectionCandidate: 'RJ10000002', rjIdNorm: 'RJ10000002', sizeBytes: 700_000 },
  { relativePath: 'RJ10000003/作品画像.webp', collectionCandidate: 'RJ10000003', rjIdNorm: 'RJ10000003', sizeBytes: 280_000 },
]);
assert.equal(selected.get('RJ10000001'), 'RJ10000001/cover.jpg');
assert.equal(selected.get('RJ10000002'), 'RJ10000002/RJ10000002.jpg');
assert.equal(selected.get('RJ10000003'), 'RJ10000003/作品画像.webp');
assert.equal(new Set(selected.values()).size, 3, 'each collection must keep an independent primary cover path');

assert.deepEqual(mediaModule.parseSingleByteRange(null, 1_000), { kind: 'none' });
assert.deepEqual(mediaModule.parseSingleByteRange('bytes=0-99', 1_000), { kind: 'range', range: { start: 0, end: 99 } });
assert.deepEqual(mediaModule.parseSingleByteRange('bytes=900-', 1_000), { kind: 'range', range: { start: 900, end: 999 } });
assert.deepEqual(mediaModule.parseSingleByteRange('bytes=-100', 1_000), { kind: 'range', range: { start: 900, end: 999 } });
assert.deepEqual(mediaModule.parseSingleByteRange('bytes=1000-', 1_000), { kind: 'invalid' });
assert.equal(mediaModule.mediaMimeType('wav'), 'audio/wav');
assert.equal(mediaModule.mediaMimeType('.flac'), 'audio/flac');
assert.equal(mediaModule.mediaMimeType('jpg'), 'image/jpeg');


const normalizationSourcePath = path.join(root, 'src/services/libraryIndexNormalizationService.ts');
const normalizationSource = fs.readFileSync(normalizationSourcePath, 'utf8');
const transpiledNormalization = ts.transpileModule(normalizationSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  fileName: normalizationSourcePath,
}).outputText;
const normalizationModule = await import(`data:text/javascript;base64,${Buffer.from(transpiledNormalization).toString('base64')}`);
const normalizedIndex = normalizationModule.libraryIndexNormalizationService.normalize({
  schemaVersion: 1,
  generatedAt: '2026-07-19T00:00:00.000Z',
  sourceKind: 'electron-scan',
  roots: [{ id: 'root-1', name: 'E:/arsm', rootPath: 'rootPathToken:test', libraryType: 'asmr', scanProfile: 'asmr-rj', sourceKind: 'local-file', createdAt: '', updatedAt: '' }],
  collections: [{
    id: 'umbrella', rootId: 'root-1', collectionType: 'rj_work', title: 'root', sortTitle: 'root', cvs: [], tags: [], status: 'identified',
    trackIds: ['a1', 'a2'], addedAt: '', updatedAt: '',
    cover: { id: 'old-cover', collectionId: 'umbrella', sourceKind: 'local-file', relativePath: 'CircleA/RJ11111111/cover.jpg', isPrimary: true },
  }],
  tracks: [
    { id: 'a1', rootId: 'root-1', collectionId: 'umbrella', kind: 'audio', title: '01.wav', source: { id: 's1', trackId: 'a1', sourceKind: 'local-file', relativePath: 'CircleA/RJ11111111/01.wav' }, subtitles: [], tags: [], addedAt: '' },
    { id: 'a2', rootId: 'root-1', collectionId: 'umbrella', kind: 'audio', title: '01.wav', source: { id: 's2', trackId: 'a2', sourceKind: 'local-file', relativePath: 'CircleB/RJ22222222/01.wav' }, subtitles: [], tags: [], addedAt: '' },
  ],
  covers: [
    { id: 'old-cover', collectionId: 'umbrella', sourceKind: 'local-file', relativePath: 'CircleA/RJ11111111/cover.jpg', isPrimary: true },
    { id: 'other-cover', collectionId: 'umbrella', sourceKind: 'local-file', relativePath: 'CircleB/RJ22222222/RJ22222222.jpg', isPrimary: false },
  ],
  subtitles: [], warnings: [],
});
assert.equal(normalizedIndex.collections.length, 2);
assert.deepEqual(
  normalizedIndex.collections.map((collection) => collection.cover?.relativePath).sort(),
  ['CircleA/RJ11111111/cover.jpg', 'CircleB/RJ22222222/RJ22222222.jpg'],
  'split collections must not inherit one shared umbrella cover',
);
assert.equal(new Set(normalizedIndex.collections.map((collection) => collection.cover?.collectionId)).size, 2);

const mainSource = fs.readFileSync(path.join(root, 'electron/main.ts'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const coordinatorSource = fs.readFileSync(path.join(root, 'src/services/libraryReadCoordinatorService.ts'), 'utf8');
const coverComponentSource = fs.readFileSync(path.join(root, 'src/components/CoverArtwork.tsx'), 'utf8');
const preferenceSource = fs.readFileSync(path.join(root, 'src/services/mpvPlaybackPreferenceService.ts'), 'utf8');
const u40bFixtureSource = fs.readFileSync(path.join(root, 'scripts/u40b/fixture.mjs'), 'utf8');
const u40bJourneySource = fs.readFileSync(path.join(root, 'scripts/test-u40b-full-product-journey.mjs'), 'utf8');
const u40dWorkflowSource = fs.readFileSync(path.join(root, '.github/workflows/u40d-real-library-stability.yml'), 'utf8');

assert.match(mainSource, /Accept-Ranges': 'bytes'/);
assert.match(mainSource, /Content-Range/);
assert.match(mainSource, /Readable\.toWeb\(fsSync\.createReadStream/);
assert.match(mainSource, /status: 'mvp122-mpv-unavailable'/);
assert.match(mainSource, /selectPrimaryCoverPaths/);
assert.doesNotMatch(appSource, /useLocalStorage<RJWork\[]>/);
assert.doesNotMatch(appSource, /useLocalStorage<MusicAlbum\[]>/);
assert.match(appSource, /libraryReadCoordinatorService\.getLatestResult\(\)/);
assert.match(appSource, /hydrateAuthorizedLibrary/);
assert.match(appSource, /raw\.length > 1_000_000/);
assert.match(coordinatorSource, /MAX_PERSISTED_RESULT_BYTES/);
assert.match(coordinatorSource, /DEFAULT_TIMEOUT_MS = 120_000/);
assert.match(coverComponentSource, /useEffect\(\(\) => \{\s*setUseFallback\(false\);\s*\}, \[src\]\)/s);
assert.match(preferenceSource, /return 'html-audio-only'/);
assert.match(u40bFixtureSource, /writeU40bIndex/);
assert.match(u40bFixtureSource, /library-index\.json/);
assert.doesNotMatch(u40bFixtureSource, /localStorage\.setItem\('sqlite_rj_works'/);
assert.doesNotMatch(u40bFixtureSource, /localStorage\.setItem\('sqlite_music_albums'/);
assert.doesNotMatch(u40bFixtureSource, /localStorage\.setItem\('yang_kura_player_queue_v1'/);
assert.match(u40bJourneySource, /readExistingIndex/);
assert.match(u40bJourneySource, /real-index player authorization/);
assert.match(u40dWorkflowSource, /requires_full_e2e/);
assert.match(u40dWorkflowSource, /if: needs\.scope\.outputs\.requires_full_e2e == 'true'/);

const fixtureModule = await import(pathToFileURL(path.join(root, 'scripts/u40b/fixture.mjs')).href);
const u40bTempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u40b-verifier-'));
try {
  const fixture = fixtureModule.createU40bFixture(u40bTempRoot);
  const index = fixtureModule.writeU40bIndex(u40bTempRoot, 'yk-root-verifier', fixture.sizes);
  assert.equal(index.tracks.length, 6);
  assert.equal(index.collections.length, 3);
  assert.equal(index.roots[0].rootPath, 'rootPathToken:yk-root-verifier');
  assert.equal(index.tracks[0].source.relativePath, 'asmr/RJ400001/01-lrc.wav');
  assert.equal(index.collections[0].cover.relativePath, 'asmr/RJ400001/cover.png');
  const rawIndex = fs.readFileSync(path.join(u40bTempRoot, 'library-index.json'));
  assert.deepEqual(Array.from(rawIndex.subarray(0, 3)), [0xef, 0xbb, 0xbf]);
} finally {
  fs.rmSync(u40bTempRoot, { recursive: true, force: true });
}

console.log('[Beta3 runtime hardening] PASS');
console.log(`covers=${JSON.stringify(Object.fromEntries(selected))}`);
console.log('range=0-99,900-,suffix-100 PASS; MIME wav/flac/jpg PASS');
console.log('normalization=split collections keep independent cover paths PASS');
console.log('u40b=real index fixture and scoped full E2E workflow PASS');
