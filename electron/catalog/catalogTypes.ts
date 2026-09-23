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
