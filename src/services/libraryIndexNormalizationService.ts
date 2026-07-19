import type { CoverSource, LibraryCollection, LibraryTrack, LocalJsonIndex } from '../types';

const RJ_PATTERN = /RJ\d{5,8}/i;
const UMBRELLA_TITLES = new Set(['root', 'asmr', 'audio', 'library', '音声', '音声库', '本地音声库', '资源库']);
const MAX_REASONABLE_WORK_TRACKS = 160;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']);

function isImagePath(relativePath: string): boolean {
  const extension = relativePath.match(/\.([^.\/]+)$/)?.[1]?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.has(extension);
}

function pathInsideGroup(relativePath: string, groupPath: string): boolean {
  const normalized = normalizePath(relativePath);
  if (!normalized || groupPath === 'root') return groupPath === 'root' && !normalized.includes('/');
  return normalized.startsWith(`${groupPath}/`);
}

function coverScore(relativePath: string, groupPath: string, sizeBytes?: number): number {
  const normalized = normalizePath(relativePath);
  const fileName = normalized.split('/').pop() ?? normalized;
  const baseName = fileName.replace(/\.[^.]+$/, '').toLowerCase();
  const groupName = groupPath.split('/').filter(Boolean).pop()?.toLowerCase() ?? '';
  let score = 0;
  if (/^(cover|folder|front|jacket|poster|artwork|package|scan|thumb|thumbnail|封面|表紙|ジャケット)(?:[\s._-]*\d*)$/i.test(baseName)) score += 1_000;
  if (groupName && baseName.replace(/[\s._-]+/g, '') === groupName.replace(/[\s._-]+/g, '')) score += 850;
  if (/^(rj|vj|bj)\d{5,10}$/i.test(baseName)) score += 800;
  const relativeDepth = Math.max(0, normalized.split('/').length - groupPath.split('/').length);
  if (relativeDepth <= 1) score += 400;
  else score -= Math.min(240, (relativeDepth - 1) * 60);
  if ((sizeBytes ?? 0) > 0 && (sizeBytes ?? 0) < 12 * 1024) score -= 300;
  else if ((sizeBytes ?? 0) >= 80 * 1024) score += 80;
  if (/(icon|logo|banner|button|sprite|sample[_-]?\d+)/i.test(baseName)) score -= 250;
  return score;
}

function selectCoverForSplitGroup(
  sourceCollection: LibraryCollection,
  sourceCovers: CoverSource[],
  tracks: LibraryTrack[],
  groupPath: string,
  nextCollectionId: string,
): CoverSource | undefined {
  const candidates: Array<{ cover: CoverSource; score: number }> = [];
  const embedded = sourceCollection.cover;
  const allCovers = embedded ? [embedded, ...sourceCovers.filter((cover) => cover.id !== embedded.id)] : sourceCovers;
  for (const cover of allCovers) {
    if (!cover.relativePath || !pathInsideGroup(cover.relativePath, groupPath)) continue;
    candidates.push({ cover, score: coverScore(cover.relativePath, groupPath) });
  }
  for (const track of tracks) {
    const relativePath = normalizePath(track.source?.relativePath);
    if (track.kind !== 'image' || !relativePath || !isImagePath(relativePath) || !pathInsideGroup(relativePath, groupPath)) continue;
    candidates.push({
      cover: {
        id: `cover-${stableHash(`${nextCollectionId}:${relativePath}`)}`,
        collectionId: nextCollectionId,
        sourceKind: 'local-file',
        relativePath,
        isPrimary: true,
      },
      score: coverScore(relativePath, groupPath, track.source?.sizeBytes),
    });
  }
  candidates.sort((left, right) => right.score - left.score || (left.cover.relativePath ?? '').localeCompare(right.cover.relativePath ?? ''));
  const selected = candidates[0]?.cover;
  if (!selected) return undefined;
  return {
    ...selected,
    id: selected.collectionId === nextCollectionId ? selected.id : `${selected.id}--${stableHash(groupPath)}`,
    collectionId: nextCollectionId,
    isPrimary: true,
  };
}

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
  sourceCovers: CoverSource[],
  isAsmrRoot: boolean,
): Array<{ collection: LibraryCollection; tracks: LibraryTrack[]; covers: CoverSource[] }> {
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
      covers: sourceCovers,
    }];
  }

  return [...groups.entries()].map(([groupPath, tracks]) => {
    const detectedCode = groupPath.match(RJ_PATTERN)?.[0]?.toUpperCase();
    const id = `${collection.id}--${stableHash(groupPath)}`;
    const title = groupLabel(groupPath, detectedCode ?? collection.title);
    const cover = selectCoverForSplitGroup(collection, sourceCovers, tracks, groupPath, id);
    const nextCollection: LibraryCollection = {
      ...collection,
      id,
      collectionType: isAsmrRoot ? 'rj_work' : collection.collectionType,
      title,
      sortTitle: title,
      codeRaw: detectedCode ?? collection.codeRaw,
      codeNorm: detectedCode ?? collection.codeNorm,
      folderPath: groupPath === 'root' ? collection.folderPath : groupPath,
      cover,
      status: tracks.length > 0 ? (collection.status === 'missing-audio' ? 'identified' : collection.status) : 'missing-audio',
      trackIds: tracks.map((track) => track.id),
      totalDurationSeconds: tracks.reduce((sum, track) => sum + (track.durationSeconds ?? 0), 0),
    };
    return {
      collection: nextCollection,
      tracks: tracks.map((track) => ({ ...track, collectionId: id })),
      covers: cover ? [cover] : [],
    };
  });
}

export const libraryIndexNormalizationService = {
  normalize(index: LocalJsonIndex): LocalJsonIndex {
    const tracksById = new Map(index.tracks.map((track) => [track.id, track]));
    const rootTypeById = new Map(index.roots.map((root) => [root.id, root.libraryType]));
    const normalizedCollections: LibraryCollection[] = [];
    const normalizedCovers: CoverSource[] = [];
    const normalizedTrackById = new Map(index.tracks.map((track) => [track.id, track]));
    let changed = false;

    for (const collection of index.collections) {
      const sourceTracks = collection.trackIds
        .map((trackId) => tracksById.get(trackId))
        .filter((track): track is LibraryTrack => Boolean(track));
      const isAsmrRoot = rootTypeById.get(collection.rootId) === 'asmr';
      const sourceCovers = index.covers.filter((cover) => cover.collectionId === collection.id);
      const pieces = splitCollection(collection, sourceTracks, sourceCovers, isAsmrRoot);
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
        normalizedCovers.push(...piece.covers);
        piece.tracks.forEach((track) => normalizedTrackById.set(track.id, track));
      }
    }

    if (!changed) return index;
    return {
      ...index,
      collections: normalizedCollections,
      tracks: index.tracks.map((track) => normalizedTrackById.get(track.id) ?? track),
      covers: normalizedCovers,
      warnings: [...index.warnings, '已按实际作品目录整理资源库分组和根目录样本名称；媒体文件未发生任何修改。'],
    };
  },
};
