import { applyLibraryIndexRemovalOperations } from '../dist-electron/libraryIndexHealthService.js';

const index = {
  schemaVersion: 1,
  generatedAt: '2026-07-12T00:00:00.000Z',
  sourceKind: 'electron-scan',
  roots: [{ id: 'root-1' }],
  collections: [
    { id: 'collection-1', status: 'identified', trackIds: ['track-missing', 'track-keep'], cover: { id: 'cover-missing', relativePath: 'cover.jpg' } },
    { id: 'collection-2', status: 'identified', trackIds: ['stale-track'] },
  ],
  tracks: [
    { id: 'track-missing', collectionId: 'collection-1', source: { relativePath: 'missing.mp3' }, cover: { id: 'track-cover' }, subtitles: [{ id: 'track-subtitle' }] },
    { id: 'track-keep', collectionId: 'collection-1', source: { relativePath: 'keep.mp3' }, subtitles: [{ id: 'subtitle-missing' }, { id: 'subtitle-keep' }] },
  ],
  covers: [{ id: 'cover-missing' }, { id: 'track-cover' }, { id: 'cover-keep' }],
  subtitles: [{ id: 'track-subtitle', trackId: 'track-missing' }, { id: 'subtitle-missing', trackId: 'track-keep' }, { id: 'subtitle-keep', trackId: 'track-keep' }],
  warnings: [],
};

const operations = [
  { operation: 'remove-track', entityId: 'track-missing', collectionId: 'collection-1' },
  { operation: 'detach-cover', entityId: 'cover-missing', ownerId: 'collection-1', collectionId: 'collection-1' },
  { operation: 'detach-subtitle', entityId: 'subtitle-missing', ownerId: 'track-keep', collectionId: 'collection-1' },
  { operation: 'remove-stale-track-reference', entityId: 'stale-track', ownerId: 'collection-2', collectionId: 'collection-2' },
];

const result = applyLibraryIndexRemovalOperations(index, operations, '2026-07-12T01:00:00.000Z');
const cleaned = result.index;
if (cleaned.tracks.some((item) => item.id === 'track-missing')) throw new Error('missing track was not removed');
if (!cleaned.tracks.some((item) => item.id === 'track-keep')) throw new Error('healthy track was removed');
if (cleaned.collections[0].trackIds.includes('track-missing')) throw new Error('collection still references removed track');
if (cleaned.collections[0].cover !== undefined) throw new Error('missing collection cover was not detached');
if (cleaned.collections[1].trackIds.includes('stale-track')) throw new Error('stale reference was not removed');
if (cleaned.collections[1].status !== 'missing-audio') throw new Error('empty collection status was not updated');
if (cleaned.covers.some((item) => item.id === 'track-cover')) throw new Error('cascaded track cover was not removed');
if (cleaned.subtitles.some((item) => item.id === 'track-subtitle')) throw new Error('cascaded track subtitle was not removed');
if (cleaned.subtitles.some((item) => item.id === 'subtitle-missing')) throw new Error('selected subtitle was not removed');
if (!cleaned.subtitles.some((item) => item.id === 'subtitle-keep')) throw new Error('healthy subtitle was removed');
if (cleaned.lastMaintenance?.deleteMediaFiles !== false) throw new Error('media delete safety marker missing');
console.log('MVP128 index cleanup service PASS');
