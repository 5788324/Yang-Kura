import type { LibraryCollection, LibraryTrack, LocalJsonIndex } from '../types';

const RJ_PATTERN = /RJ\d{5,8}/i;
const UMBRELLA_TITLES = new Set(['root', 'asmr', 'audio', 'library', '音声', '音声库', '本地音声库', '资源库']);
const MAX_REASONABLE_WORK_TRACKS = 160;

function normalizePath(value: string | undefined): string {
  return (value ?? '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim();
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function pathDirectory(relativePath: string): string {
  const normalized = normalizePath(relativePath);
  const segments = normalized.split('/').filter(Boolean);
  return segments.length > 1 ? segments.slice(0, -1).join('/') : 'root';
}

function chooseAsmrGroupPath(relativePath: string): string {
  const directory = pathDirectory(relativePath);
  if (directory === 'root') return directory;
  const segments = directory.split('/').filter(Boolean);
  const rjIndex = segments.findIndex((segment) => RJ_PATTERN.test(segment));
  if (rjIndex >= 0) return segments.slice(0, rjIndex + 1).join('/');
  if (segments.length >= 2) return segments.slice(0, 2).join('/');
  return segments[0] ?? 'root';
}

function chooseMusicGroupPath(relativePath: string): string {
  const directory = pathDirectory(relativePath);
  if (directory === 'root') return directory;
  const segments = directory.split('/').filter(Boolean);
  if (segments.length >= 2) return segments.slice(0, 2).join('/');
  return segments[0] ?? 'root';
}

function groupLabel(groupPath: string, fallback: string): string {
  if (groupPath === 'root') return fallback;
  const segments = groupPath.split('/').filter(Boolean);
  return segments[segments.length - 1]?.trim() || fallback;
}

function isUmbrellaTitle(value: string | undefined): boolean {
  return UMBRELLA_TITLES.has((value ?? '').trim().toLocaleLowerCase());
}

function isUmbrellaCollection(collection: LibraryCollection, trackCount: number): boolean {
  const title = collection.title.trim().toLocaleLowerCase();
  const folder = normalizePath(collection.folderPath).toLocaleLowerCase();
  return trackCount > MAX_REASONABLE_WORK_TRACKS || UMBRELLA_TITLES.has(title) || UMBRELLA_TITLES.has(folder);
}

function withRootCollectionType(collection: LibraryCollection, isAsmrRoot: boolean): LibraryCollection {
  if (isAsmrRoot && collection.collectionType !== 'rj_work') return { ...collection, collectionType: 'rj_work' };
  return collection;
}

function rootCollectionTitle(collection: LibraryCollection, tracks: LibraryTrack[], isAsmrRoot: boolean): string {
  if (!isUmbrellaTitle(collection.title) && !isUmbrellaTitle(collection.folderPath)) return collection.title;
  if (tracks.length === 1) {
    const trackTitle = tracks[0]?.title?.trim();
    if (trackTitle) return trackTitle;
  }
  return isAsmrRoot ? '本地音声' : '本地音乐';
}

function splitCollection(
  sourceCollection: LibraryCollection,
  sourceTracks: LibraryTrack[],
  isAsmrRoot: boolean,
): Array<{ collection: LibraryCollection; tracks: LibraryTrack[] }> {
  if (sourceTracks.length === 0) return [];
  const collection = withRootCollectionType(sourceCollection, isAsmrRoot);
  const groups = new Map<string, LibraryTrack[]>();

  for (const track of sourceTracks) {
    const relativePath = normalizePath(track.source?.relativePath);
    const groupPath = isAsmrRoot ? chooseAsmrGroupPath(relativePath) : chooseMusicGroupPath(relativePath);
    const group = groups.get(groupPath) ?? [];
    group.push(track);
    groups.set(groupPath, group);
  }

  const shouldSplit = groups.size > 1 && isUmbrellaCollection(collection, sourceTracks.length);
  if (!shouldSplit) {
    const title = groups.has('root')
      ? rootCollectionTitle(collection, sourceTracks, isAsmrRoot)
      : collection.title;
    return [{
      collection: {
        ...collection,
        title,
        sortTitle: title.toLocaleLowerCase(),
        trackIds: sourceTracks.map((track) => track.id),
        totalDurationSeconds: sourceTracks.reduce((sum, track) => sum + (track.durationSeconds ?? 0), 0),
      },
      tracks: sourceTracks,
    }];
  }

  return [...groups.entries()].map(([groupPath, tracks]) => {
    const detectedCode = groupPath.match(RJ_PATTERN)?.[0]?.toUpperCase();
    const id = `${collection.id}--${stableHash(groupPath)}`;
    const title = groupLabel(groupPath, detectedCode ?? collection.title);
    const nextCollection: LibraryCollection = {
      ...collection,
      id,
      collectionType: isAsmrRoot ? 'rj_work' : collection.collectionType,
      title,
      sortTitle: title,
      codeRaw: detectedCode ?? collection.codeRaw,
      codeNorm: detectedCode ?? collection.codeNorm,
      folderPath: groupPath === 'root' ? collection.folderPath : groupPath,
      status: tracks.length > 0 ? (collection.status === 'missing-audio' ? 'identified' : collection.status) : 'missing-audio',
      trackIds: tracks.map((track) => track.id),
      totalDurationSeconds: tracks.reduce((sum, track) => sum + (track.durationSeconds ?? 0), 0),
    };
    return {
      collection: nextCollection,
      tracks: tracks.map((track) => ({ ...track, collectionId: id })),
    };
  });
}

export const libraryIndexNormalizationService = {
  normalize(index: LocalJsonIndex): LocalJsonIndex {
    const tracksById = new Map(index.tracks.map((track) => [track.id, track]));
    const rootTypeById = new Map(index.roots.map((root) => [root.id, root.libraryType]));
    const normalizedCollections: LibraryCollection[] = [];
    const normalizedTrackById = new Map(index.tracks.map((track) => [track.id, track]));
    let changed = false;

    for (const collection of index.collections) {
      const sourceTracks = collection.trackIds
        .map((trackId) => tracksById.get(trackId))
        .filter((track): track is LibraryTrack => Boolean(track));
      const isAsmrRoot = rootTypeById.get(collection.rootId) === 'asmr';
      const pieces = splitCollection(collection, sourceTracks, isAsmrRoot);
      if (pieces.length === 0) {
        changed = true;
        continue;
      }
      const first = pieces[0];
      if (
        pieces.length !== 1 ||
        first.collection.id !== collection.id ||
        first.collection.collectionType !== collection.collectionType ||
        first.collection.title !== collection.title ||
        first.collection.sortTitle !== collection.sortTitle ||
        first.collection.totalDurationSeconds !== collection.totalDurationSeconds ||
        first.collection.trackIds.length !== collection.trackIds.length
      ) {
        changed = true;
      }
      for (const piece of pieces) {
        normalizedCollections.push(piece.collection);
        piece.tracks.forEach((track) => normalizedTrackById.set(track.id, track));
      }
    }

    if (!changed) return index;
    return {
      ...index,
      collections: normalizedCollections,
      tracks: index.tracks.map((track) => normalizedTrackById.get(track.id) ?? track),
      warnings: [...index.warnings, '已按实际作品目录整理资源库分组和根目录样本名称；媒体文件未发生任何修改。'],
    };
  },
};
