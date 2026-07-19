#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

console.log('[Beta3 runtime hardening] PASS');
console.log(`covers=${JSON.stringify(Object.fromEntries(selected))}`);
console.log('range=0-99,900-,suffix-100 PASS; MIME wav/flac/jpg PASS');
console.log('normalization=split collections keep independent cover paths PASS');
