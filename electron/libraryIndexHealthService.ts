export type LibraryIndexHealthItemKind = 'track' | 'cover' | 'subtitle' | 'collection-reference';
export type LibraryIndexHealthStatus = 'healthy' | 'missing' | 'unreadable' | 'wrong-type' | 'invalid-path' | 'invalid-reference';

export interface LibraryIndexHealthReference {
  id: string;
  kind: LibraryIndexHealthItemKind;
  entityId: string;
  ownerId?: string;
  collectionId?: string;
  relativePath?: string;
  expectedKind: 'file' | 'track-reference';
  canRemoveFromIndex: boolean;
}

export interface LibraryIndexRemovalPreviewOperation {
  operation: 'remove-track' | 'detach-cover' | 'detach-subtitle' | 'remove-stale-track-reference';
  entityId: string;
  ownerId?: string;
  collectionId?: string;
  relativePath?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeRelativePath(value: unknown): string | undefined {
  const text = safeString(value)?.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!text || text.includes('\0') || text.includes('file://') || /^[A-Za-z]:[\\/]/.test(text)) return undefined;
  const parts = text.split('/').filter(Boolean);
  if (!parts.length || parts.some((part) => part === '.' || part === '..')) return undefined;
  return parts.join('/');
}

function referenceKey(kind: LibraryIndexHealthItemKind, entityId: string, ownerId: string | undefined, relativePath: string | undefined): string {
  return `${kind}:${entityId}:${ownerId ?? ''}:${relativePath ?? ''}`;
}

export function collectLibraryIndexHealthReferences(index: unknown): LibraryIndexHealthReference[] {
  if (!isObject(index)) return [];
  const tracks = Array.isArray(index.tracks) ? index.tracks.filter(isObject) : [];
  const collections = Array.isArray(index.collections) ? index.collections.filter(isObject) : [];
  const covers = Array.isArray(index.covers) ? index.covers.filter(isObject) : [];
  const subtitles = Array.isArray(index.subtitles) ? index.subtitles.filter(isObject) : [];
  const references = new Map<string, LibraryIndexHealthReference>();

  const addFileReference = (
    kind: 'track' | 'cover' | 'subtitle',
    entityIdValue: unknown,
    ownerIdValue: unknown,
    collectionIdValue: unknown,
    relativePathValue: unknown,
  ) => {
    const entityId = safeString(entityIdValue) ?? `anonymous-${kind}`;
    const ownerId = safeString(ownerIdValue);
    const collectionId = safeString(collectionIdValue);
    const relativePath = normalizeRelativePath(relativePathValue);
    const id = referenceKey(kind, entityId, ownerId, relativePath);
    references.set(id, {
      id,
      kind,
      entityId,
      ownerId,
      collectionId,
      relativePath,
      expectedKind: 'file',
      canRemoveFromIndex: true,
    });
  };

  for (const track of tracks) {
    const trackId = safeString(track.id) ?? 'anonymous-track';
    const collectionId = safeString(track.collectionId);
    const source = isObject(track.source) ? track.source : {};
    addFileReference('track', trackId, trackId, collectionId, source.relativePath);
    const trackCover = isObject(track.cover) ? track.cover : undefined;
    if (trackCover) addFileReference('cover', trackCover.id ?? `${trackId}-cover`, trackId, collectionId, trackCover.relativePath);
    const trackSubtitles = Array.isArray(track.subtitles) ? track.subtitles.filter(isObject) : [];
    for (const subtitle of trackSubtitles) {
      addFileReference('subtitle', subtitle.id ?? `${trackId}-subtitle`, trackId, collectionId, subtitle.relativePath);
    }
  }

  for (const cover of covers) {
    addFileReference('cover', cover.id, cover.collectionId, cover.collectionId, cover.relativePath);
  }
  for (const subtitle of subtitles) {
    addFileReference('subtitle', subtitle.id, subtitle.trackId, undefined, subtitle.relativePath);
  }
  for (const collection of collections) {
    const collectionId = safeString(collection.id) ?? 'anonymous-collection';
    const cover = isObject(collection.cover) ? collection.cover : undefined;
    if (cover) addFileReference('cover', cover.id ?? `${collectionId}-cover`, collectionId, collectionId, cover.relativePath);
    const trackIds = Array.isArray(collection.trackIds) ? collection.trackIds : [];
    for (const rawTrackId of trackIds) {
      const trackId = safeString(rawTrackId);
      if (!trackId) continue;
      if (!tracks.some((track) => safeString(track.id) === trackId)) {
        const id = referenceKey('collection-reference', trackId, collectionId, undefined);
        references.set(id, {
          id,
          kind: 'collection-reference',
          entityId: trackId,
          ownerId: collectionId,
          collectionId,
          expectedKind: 'track-reference',
          canRemoveFromIndex: true,
        });
      }
    }
  }

  return Array.from(references.values());
}

export function buildLibraryIndexRemovalPreview(index: unknown, selectedIssueIds: string[], references: LibraryIndexHealthReference[]) {
  const selected = new Set(selectedIssueIds);
  const selectedReferences = references.filter((item) => selected.has(item.id) && item.canRemoveFromIndex);
  const operations: LibraryIndexRemovalPreviewOperation[] = selectedReferences.map((item) => ({
    operation:
      item.kind === 'track'
        ? 'remove-track'
        : item.kind === 'cover'
          ? 'detach-cover'
          : item.kind === 'subtitle'
            ? 'detach-subtitle'
            : 'remove-stale-track-reference',
    entityId: item.entityId,
    ownerId: item.ownerId,
    collectionId: item.collectionId,
    relativePath: item.relativePath,
  }));

  const trackIds = new Set(operations.filter((item) => item.operation === 'remove-track').map((item) => item.entityId));
  const affectedCollectionIds = new Set<string>();
  operations.forEach((item) => {
    if (item.collectionId) affectedCollectionIds.add(item.collectionId);
    if (item.operation === 'remove-stale-track-reference' && item.ownerId) affectedCollectionIds.add(item.ownerId);
  });

  const collections = isObject(index) && Array.isArray(index.collections) ? index.collections.filter(isObject) : [];
  let emptyCollectionCount = 0;
  for (const collection of collections) {
    const collectionId = safeString(collection.id);
    if (!collectionId || !affectedCollectionIds.has(collectionId)) continue;
    const trackIdsAfter = (Array.isArray(collection.trackIds) ? collection.trackIds : [])
      .map(safeString)
      .filter((item): item is string => Boolean(item) && !trackIds.has(item!));
    if (trackIdsAfter.length === 0) emptyCollectionCount += 1;
  }

  return {
    previewVersion: 'mvp127-library-index-removal-preview-v1' as const,
    generatedAt: new Date().toISOString(),
    writePerformed: false as const,
    deleteMediaFiles: false as const,
    selectedIssueCount: selectedReferences.length,
    operations,
    summary: {
      trackRemovalCount: operations.filter((item) => item.operation === 'remove-track').length,
      coverDetachCount: operations.filter((item) => item.operation === 'detach-cover').length,
      subtitleDetachCount: operations.filter((item) => item.operation === 'detach-subtitle').length,
      staleReferenceRemovalCount: operations.filter((item) => item.operation === 'remove-stale-track-reference').length,
      affectedCollectionCount: affectedCollectionIds.size,
      emptyCollectionCount,
    },
    safetyNotes: [
      'preview-only',
      'library-index.json was not modified',
      'media files were not deleted, moved, renamed, or overwritten',
      'absolutePath and file:// are never returned',
    ],
  };
}


export interface LibraryIndexRemovalApplyResult {
  index: unknown;
  summary: {
    removedTrackCount: number;
    detachedCoverCount: number;
    detachedSubtitleCount: number;
    removedStaleReferenceCount: number;
    cascadedCoverCount: number;
    cascadedSubtitleCount: number;
    affectedCollectionCount: number;
    emptyCollectionCount: number;
  };
}

function itemId(value: unknown): string | undefined {
  return isObject(value) ? safeString(value.id) : undefined;
}

export function applyLibraryIndexRemovalOperations(
  index: unknown,
  operations: LibraryIndexRemovalPreviewOperation[],
  updatedAt = new Date().toISOString(),
): LibraryIndexRemovalApplyResult {
  if (!isObject(index)) {
    return {
      index,
      summary: {
        removedTrackCount: 0,
        detachedCoverCount: 0,
        detachedSubtitleCount: 0,
        removedStaleReferenceCount: 0,
        cascadedCoverCount: 0,
        cascadedSubtitleCount: 0,
        affectedCollectionCount: 0,
        emptyCollectionCount: 0,
      },
    };
  }

  const removeTrackIds = new Set(operations.filter((item) => item.operation === 'remove-track').map((item) => item.entityId));
  const detachCoverIds = new Set(operations.filter((item) => item.operation === 'detach-cover').map((item) => item.entityId));
  const detachSubtitleIds = new Set(operations.filter((item) => item.operation === 'detach-subtitle').map((item) => item.entityId));
  const staleByCollection = new Map<string, Set<string>>();
  const affectedCollectionIds = new Set<string>();

  for (const operation of operations) {
    if (operation.collectionId) affectedCollectionIds.add(operation.collectionId);
    if (operation.operation === 'remove-stale-track-reference' && operation.ownerId) {
      affectedCollectionIds.add(operation.ownerId);
      const set = staleByCollection.get(operation.ownerId) ?? new Set<string>();
      set.add(operation.entityId);
      staleByCollection.set(operation.ownerId, set);
    }
  }

  const sourceTracks = Array.isArray(index.tracks) ? index.tracks.filter(isObject) : [];
  const removedTracks = sourceTracks.filter((track) => {
    const id = safeString(track.id);
    return Boolean(id && removeTrackIds.has(id));
  });
  for (const track of removedTracks) {
    const collectionId = safeString(track.collectionId);
    if (collectionId) affectedCollectionIds.add(collectionId);
  }

  const removedTrackCoverIds = new Set<string>();
  const removedTrackSubtitleIds = new Set<string>();
  for (const track of removedTracks) {
    const coverId = itemId(track.cover);
    if (coverId) removedTrackCoverIds.add(coverId);
    for (const subtitle of Array.isArray(track.subtitles) ? track.subtitles : []) {
      const subtitleId = itemId(subtitle);
      if (subtitleId) removedTrackSubtitleIds.add(subtitleId);
    }
  }

  const tracks = sourceTracks
    .filter((track) => {
      const id = safeString(track.id);
      return !id || !removeTrackIds.has(id);
    })
    .map((track) => {
      const trackId = safeString(track.id);
      const cover = isObject(track.cover) && itemId(track.cover) && detachCoverIds.has(itemId(track.cover)!) ? undefined : track.cover;
      const subtitles = (Array.isArray(track.subtitles) ? track.subtitles : []).filter((subtitle) => {
        const id = itemId(subtitle);
        return !id || !detachSubtitleIds.has(id);
      });
      return {
        ...track,
        ...(cover === undefined ? { cover: undefined } : { cover }),
        subtitles,
        ...(trackId ? { updatedAt } : {}),
      };
    });

  let emptyCollectionCount = 0;
  const collections = (Array.isArray(index.collections) ? index.collections.filter(isObject) : []).map((collection) => {
    const collectionId = safeString(collection.id);
    const staleIds = collectionId ? staleByCollection.get(collectionId) : undefined;
    const trackIds = (Array.isArray(collection.trackIds) ? collection.trackIds : [])
      .map(safeString)
      .filter((id): id is string => Boolean(id) && !removeTrackIds.has(id!) && !(staleIds?.has(id!)));
    const coverId = itemId(collection.cover);
    const cover = coverId && detachCoverIds.has(coverId) ? undefined : collection.cover;
    if (collectionId && affectedCollectionIds.has(collectionId) && trackIds.length === 0) emptyCollectionCount += 1;
    return {
      ...collection,
      trackIds,
      ...(cover === undefined ? { cover: undefined } : { cover }),
      status: trackIds.length === 0 && collection.status !== 'warning' ? 'missing-audio' : collection.status,
      updatedAt,
    };
  });

  const covers = (Array.isArray(index.covers) ? index.covers.filter(isObject) : []).filter((cover) => {
    const id = safeString(cover.id);
    return !id || (!detachCoverIds.has(id) && !removedTrackCoverIds.has(id));
  });
  const subtitles = (Array.isArray(index.subtitles) ? index.subtitles.filter(isObject) : []).filter((subtitle) => {
    const id = safeString(subtitle.id);
    const trackId = safeString(subtitle.trackId);
    return (!id || (!detachSubtitleIds.has(id) && !removedTrackSubtitleIds.has(id))) && (!trackId || !removeTrackIds.has(trackId));
  });

  const cleanedIndex = {
    ...index,
    collections,
    tracks,
    covers,
    subtitles,
    updatedAt,
    lastMaintenance: {
      version: 'mvp128-controlled-index-cleanup-v1',
      performedAt: updatedAt,
      deleteMediaFiles: false,
      operationCount: operations.length,
    },
  };

  return {
    index: cleanedIndex,
    summary: {
      removedTrackCount: removedTracks.length,
      detachedCoverCount: detachCoverIds.size,
      detachedSubtitleCount: detachSubtitleIds.size,
      removedStaleReferenceCount: operations.filter((item) => item.operation === 'remove-stale-track-reference').length,
      cascadedCoverCount: removedTrackCoverIds.size,
      cascadedSubtitleCount: removedTrackSubtitleIds.size,
      affectedCollectionCount: affectedCollectionIds.size,
      emptyCollectionCount,
    },
  };
}
