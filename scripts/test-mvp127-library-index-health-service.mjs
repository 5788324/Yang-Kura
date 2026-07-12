import { buildLibraryIndexRemovalPreview, collectLibraryIndexHealthReferences } from '../dist-electron/libraryIndexHealthService.js';

const index = {
  schemaVersion: 1,
  generatedAt: '2026-07-12T00:00:00.000Z',
  sourceKind: 'electron-scan',
  roots: [],
  collections: [
    {
      id: 'collection-1',
      trackIds: ['track-1', 'track-missing-reference'],
      cover: { id: 'cover-1', collectionId: 'collection-1', relativePath: 'RJ001/cover.jpg' },
    },
  ],
  tracks: [
    {
      id: 'track-1',
      collectionId: 'collection-1',
      source: { relativePath: 'RJ001/01.mp3' },
      subtitles: [{ id: 'subtitle-1', trackId: 'track-1', relativePath: 'RJ001/01.zh.lrc' }],
    },
  ],
  covers: [{ id: 'cover-1', collectionId: 'collection-1', relativePath: 'RJ001/cover.jpg' }],
  subtitles: [{ id: 'subtitle-1', trackId: 'track-1', relativePath: 'RJ001/01.zh.lrc' }],
  warnings: [],
};

const refs = collectLibraryIndexHealthReferences(index);
if (!refs.some((item) => item.kind === 'track' && item.entityId === 'track-1')) throw new Error('track reference missing');
if (!refs.some((item) => item.kind === 'cover' && item.relativePath === 'RJ001/cover.jpg')) throw new Error('cover reference missing');
if (!refs.some((item) => item.kind === 'subtitle' && item.relativePath === 'RJ001/01.zh.lrc')) throw new Error('subtitle reference missing');
if (!refs.some((item) => item.kind === 'collection-reference' && item.entityId === 'track-missing-reference')) throw new Error('stale collection reference missing');

const selected = refs.map((item) => item.id);
const preview = buildLibraryIndexRemovalPreview(index, selected, refs);
if (preview.writePerformed !== false || preview.deleteMediaFiles !== false) throw new Error('preview safety regression');
if (preview.summary.trackRemovalCount !== 1) throw new Error('track removal preview count mismatch');
if (preview.summary.coverDetachCount < 1) throw new Error('cover detach preview missing');
if (preview.summary.subtitleDetachCount < 1) throw new Error('subtitle detach preview missing');
if (preview.summary.staleReferenceRemovalCount !== 1) throw new Error('stale reference preview missing');
if (preview.operations.some((item) => typeof item.relativePath === 'string' && item.relativePath.includes('file://'))) throw new Error('file URL leaked');

console.log(`MVP127 model test PASS: ${refs.length} references, ${preview.operations.length} preview operations, no file writes`);
