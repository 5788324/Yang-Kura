export type CatalogLibraryType = 'asmr' | 'music' | 'mixed';
export type CatalogCollectionType = 'rj_work' | 'music_album' | 'music_folder' | 'playlist_generated';
export type CatalogMediaKind = 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';

export interface LegacyCatalogRoot {
  id: string;
  name: string;
  rootPath: string;
  libraryType: CatalogLibraryType;
  scanProfile: string;
  sourceKind: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyCatalogCover {
  id: string;
  collectionId: string;
  sourceKind: string;
  url?: string;
  absolutePath?: string;
  relativePath?: string;
  isPrimary: boolean;
}

export interface LegacyCatalogSubtitle {
  id: string;
  trackId: string;
  sourceKind: string;
  language?: string;
  format?: string;
  url?: string;
  absolutePath?: string;
  relativePath?: string;
  lineCount?: number;
}

export interface LegacyCatalogSource {
  id: string;
  trackId: string;
  sourceKind: string;
  absolutePath?: string;
  relativePath?: string;
  fileUrl?: string;
  extension?: string;
  sizeBytes?: number;
  mtimeMs?: number;
}

export interface LegacyCatalogTrack {
  id: string;
  rootId: string;
  collectionId: string;
  kind: CatalogMediaKind;
  title: string;
  displayArtist?: string;
  displayAlbum?: string;
  rjId?: string;
  trackNo?: number;
  discNo?: number;
  durationSeconds?: number;
  source: LegacyCatalogSource;
  subtitles?: LegacyCatalogSubtitle[];
  cover?: LegacyCatalogCover;
  tags?: string[];
  addedAt?: string;
}

export interface LegacyCatalogCollection {
  id: string;
  rootId: string;
  collectionType: CatalogCollectionType;
  title: string;
  sortTitle?: string;
  codeRaw?: string;
  codeNorm?: string;
  artist?: string;
  circle?: string;
  cvs?: string[];
  album?: string;
  folderPath?: string;
  cover?: LegacyCatalogCover;
  tags?: string[];
  status: string;
  trackIds?: string[];
  totalDurationSeconds?: number;
  addedAt?: string;
  updatedAt?: string;
}

export interface LegacyLocalJsonIndex {
  schemaVersion: number;
  generatedAt: string;
  sourceKind: string;
  roots: LegacyCatalogRoot[];
  collections: LegacyCatalogCollection[];
  tracks: LegacyCatalogTrack[];
  covers: LegacyCatalogCover[];
  subtitles: LegacyCatalogSubtitle[];
  warnings?: string[];
}

export interface CatalogCounts {
  roots: number;
  collections: number;
  tracks: number;
  mediaSources: number;
  subtitles: number;
  artwork: number;
  folderNodes: number;
}

export interface CatalogImportSummary extends CatalogCounts {
  schemaVersion: number;
  importedAt: string;
  sourceGeneratedAt: string;
  sourceKind: string;
}

export interface CatalogCollectionRow {
  id: string;
  rootId: string;
  collectionType: CatalogCollectionType | string;
  title: string;
  codeNorm: string | null;
  artist: string | null;
  circle: string | null;
  folderPath: string | null;
}

export interface CatalogTrackRow {
  id: string;
  rootId: string;
  collectionId: string;
  kind: CatalogMediaKind | string;
  title: string;
  artist: string | null;
  album: string | null;
  rjId: string | null;
  relativePath: string | null;
}

export interface CatalogCollectionQuery {
  rootId?: string;
  collectionType?: CatalogCollectionType | string;
  search?: string;
  circle?: string;
  cv?: string;
  tag?: string;
  artist?: string;
  afterId?: string;
  limit?: number;
}

export interface CatalogTrackQuery {
  rootId?: string;
  collectionId?: string;
  kind?: CatalogMediaKind | string;
  search?: string;
  artist?: string;
  tag?: string;
  afterId?: string;
  limit?: number;
}

export interface CatalogFolderNodeRow {
  id: string;
  rootId: string;
  collectionId: string | null;
  parentId: string | null;
  name: string;
  relativePath: string;
  depth: number;
}

export type CatalogFacetKind = 'circle' | 'artist' | 'cv' | 'tag';

export interface CatalogFacetRow {
  value: string;
  count: number;
}

export type CatalogScanEntryKind =
  | 'directory'
  | 'audio'
  | 'video'
  | 'subtitle'
  | 'artwork'
  | 'text'
  | 'archive'
  | 'symlink'
  | 'other';

export type CatalogScanRunStatus = 'running' | 'cancelled' | 'failed' | 'completed';

export interface CatalogScannerRoot {
  id: string;
  rootPathToken: string;
  name: string;
  libraryType: CatalogLibraryType;
  scanProfile: string;
}

export interface CatalogScanEntry {
  relativePath: string;
  entryKind: CatalogScanEntryKind;
  sizeBytes: number | null;
  mtimeMs: number | null;
  fingerprint?: string | null;
}

export interface CatalogScanBatchResult {
  processed: number;
  changed: number;
  unchanged: number;
  changedRelativePaths: string[];
  checkpointRelativePath: string | null;
}

export interface CatalogScanRunRecord {
  id: string;
  rootId: string;
  startedAt: string;
  completedAt: string | null;
  status: CatalogScanRunStatus;
  filesSeen: number;
  directoriesSeen: number;
  changedEntries: number;
  errorCount: number;
  checkpointRelativePath: string | null;
  resumeCount: number;
  cancelledAt: string | null;
  errorMessage: string | null;
}

export interface CatalogScanEntryRow extends CatalogScanEntry {
  rootId: string;
  lastSeenScanId: string | null;
  state: 'present' | 'missing';
}

export type ArtworkCacheState = 'building' | 'ready' | 'failed';

export interface ArtworkCacheRecord {
  rootId: string;
  sourceRelativePath: string;
  sourceSizeBytes: number | null;
  sourceMtimeMs: number | null;
  cacheKey: string;
  cacheRelativePath: string | null;
  width: number | null;
  height: number | null;
  byteSize: number | null;
  state: ArtworkCacheState;
  errorCode: string | null;
  updatedAt: string;
}

export type CatalogCollectionSort = 'id-asc' | 'title-asc' | 'added-desc' | 'duration-desc';
export type CatalogTrackSort = 'id-asc' | 'title-asc' | 'album-asc' | 'added-desc' | 'duration-desc';

export interface CatalogKeysetCursor {
  sortValue: string | number;
  id: string;
}

export interface CatalogPage<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: CatalogKeysetCursor | null;
}

export interface CatalogCollectionPageQuery extends Omit<CatalogCollectionQuery, 'afterId'> {
  sort?: CatalogCollectionSort;
  cursor?: CatalogKeysetCursor | null;
}

export interface CatalogTrackPageQuery extends Omit<CatalogTrackQuery, 'afterId'> {
  sort?: CatalogTrackSort;
  cursor?: CatalogKeysetCursor | null;
}

export type CatalogQueryRequest =
  | {
      mode: 'collections';
      rootPathToken: string;
      collectionType?: CatalogCollectionType | string;
      search?: string;
      circle?: string;
      cv?: string;
      tag?: string;
      artist?: string;
      sort?: CatalogCollectionSort;
      cursor?: CatalogKeysetCursor | null;
      limit?: number;
    }
  | {
      mode: 'tracks';
      rootPathToken: string;
      collectionId?: string;
      kind?: CatalogMediaKind | string;
      search?: string;
      artist?: string;
      tag?: string;
      sort?: CatalogTrackSort;
      cursor?: CatalogKeysetCursor | null;
      limit?: number;
    }
  | {
      mode: 'facets';
      rootPathToken: string;
      facet: CatalogFacetKind;
      collectionType?: string;
      limit?: number;
    }
  | {
      mode: 'folders';
      rootPathToken: string;
      parentRelativePath?: string | null;
      limit?: number;
    }
  | {
      mode: 'summary';
      rootPathToken: string;
    };
