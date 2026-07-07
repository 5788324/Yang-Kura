export type PageType = 'dashboard' | 'asmr-lib' | 'music-lib' | 'playlists' | 'importer' | 'downloader' | 'settings' | 'diagnostics';

export type TrackType = 'asmr' | 'music';
export type PlaybackCompletionMode = 'continue-queue' | 'stop-after-track' | 'stop-after-work';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string; // singer or CV
  album: string; // album name or RJ work title
  circle?: string | undefined; // club/社团 (for ASMR)
  rjId?: string | undefined; // RJ number (for ASMR)
  duration: number; // in seconds
  coverUrl: string;
  /** MVP-37: cover source metadata. Local covers remain tokenized; no absolutePath / file://. */
  coverSourceKind?: 'mock-url' | 'local-file' | 'embedded' | 'missing' | 'generated-fallback' | undefined;
  coverRelativePath?: string | undefined;
  fileSize?: string | undefined;
  type: TrackType;
  lyrics?: string[] | undefined; // LRC style or simple text lines
  /** MVP-26: tokenized subtitle sources. Relative paths only; no absolutePath / file://. */
  subtitleRelativePaths?: string[] | undefined;
  lyricsSourceKind?: 'mock' | 'local-file' | 'none' | undefined;
  lyricsRelativePath?: string | undefined;
  lyricsLoadStatus?: 'idle' | 'loading' | 'loaded' | 'missing' | 'error' | undefined;
  lyricsLoadError?: string | undefined;
  fileTreePath?: string | undefined; // e.g. "Voice/01_intro.mp3"
  /** MVP-27: original indexed media kind; non-audio tracks should be opened externally instead of sent to HTMLAudio. */
  mediaKind?: LibraryTrackKind | undefined;
  /** MVP-25/MVP-27: tokenized local-media source. Renderer still never receives absolutePath / file://. */
  rootPathToken?: string | undefined;
  sourceRelativePath?: string | undefined;
  mediaUrl?: string | undefined;
  playbackSourceKind?: 'mock' | 'tokenized-local-file' | undefined;
  externalOpenSourceKind?: 'tokenized-local-file' | undefined;
  isFavorite?: boolean | undefined;
  addedAt?: string | undefined;
}

export type RJStatus = 'identified' | 'missing-cover' | 'missing-audio' | 'warning';

export interface RJWork {
  id: string; // RJ number, e.g. "RJ123456"
  title: string;
  circle: string; // 社团
  cvs: string[]; // 声优/CV
  releaseDate: string;
  coverUrl: string;
  /** MVP-37: cover source metadata. Local covers remain tokenized; no absolutePath / file://. */
  coverSourceKind?: 'mock-url' | 'local-file' | 'embedded' | 'missing' | 'generated-fallback' | undefined;
  coverRelativePath?: string | undefined;
  tags: string[];
  status: RJStatus;
  fileCount: number;
  totalDuration: number; // in seconds
  description: string;
  tracks: AudioTrack[];
  addedAt?: string | undefined;
  rating?: number | undefined; // 1-5 rating
  personalStatus?: 'unheard' | 'listening' | 'completed' | 'abandoned' | undefined; // 未听 / 听过 / 听完 / 弃坑
  personalNotes?: string | undefined; // 个人笔记
}

export interface MusicAlbum {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  /** MVP-37: cover source metadata. Local covers remain tokenized; no absolutePath / file://. */
  coverSourceKind?: 'mock-url' | 'local-file' | 'embedded' | 'missing' | 'generated-fallback' | undefined;
  coverRelativePath?: string | undefined;
  releaseYear: string;
  genre: string;
  tracks: AudioTrack[];
}

export type PlaylistSourceKind = 'system-demo' | 'demo-user' | 'user-local';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  /** MVP-37: cover source metadata. Local covers remain tokenized; no absolutePath / file://. */
  coverSourceKind?: 'mock-url' | 'local-file' | 'embedded' | 'missing' | 'generated-fallback' | undefined;
  coverRelativePath?: string | undefined;
  creator: string;
  tracksCount: number;
  tracks: AudioTrack[];
  isSystem?: boolean | undefined;
  /** MVP-36: separates locked demo/system playlists from persisted user playlists. */
  sourceKind?: PlaylistSourceKind | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export type ThemeType = 'dark' | 'acrylic-mist' | 'ocean-drops';

export interface LibraryPath {
  id: string;
  type: 'local' | 'openlist' | 'webdav';
  path: string;
  label?: string | undefined;
}

export interface LibrarySettings {
  audioLibPath: string;
  musicLibPath: string;
  asmrPaths: LibraryPath[];
  musicPaths: LibraryPath[];
  tempDownloadPath: string;
  currentTheme: ThemeType;
  enableOverlay: boolean;
  privacyMode: boolean;
}

export interface PlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number; // in seconds
  volume: number; // 0 to 1
  queue: AudioTrack[];
  currentIndex: number;
  isMuted: boolean;
  loopMode: 'all' | 'one' | 'shuffle';
  /** MVP-34: user-facing end-of-track behavior for ASMR and music listening. */
  playCompletionMode?: PlaybackCompletionMode;
  /** MVP-25: real HTMLAudio status for tokenized local files; mock fallback remains for demo data. */
  playbackMode?: 'mock-simulated' | 'resolving-local-media' | 'html-audio' | 'unsupported-local-media' | 'idle';
  playbackError?: string | null;
  resolvedMediaUrl?: string | null;
}

// === Downloader & Metadata Types ===

export interface FileProgress {
  name: string;
  size: string;
  progress: number; // 0 to 100
  status: 'downloading' | 'paused' | 'completed' | 'failed' | 'pending';
}

export interface DownloadTask {
  id: string; // rjId 或 歌曲标识
  type: 'asmr' | 'music';
  title: string;
  subtitle: string; // 社团或歌手
  coverUrl: string;
  totalSize: string;
  progress: number; // 0 to 100
  status: 'downloading' | 'paused' | 'completed' | 'failed';
  speed: string;
  addedAt: string;
  files: FileProgress[];
}

export interface AsmrMetadata {
  id: string;
  title: string;
  circle: string;
  cv: string;
  releaseDate: string;
  fileSize: string;
  tracksCount: number;
  coverUrl: string;
}

export interface MusicMetadata {
  title: string;
  artist: string;
  album: string;
  quality: string;
  fileSize: string;
  coverUrl: string;
}

export interface TrackProgressInfo {
  percent: number;
  completed: boolean;
}

// === Local JSON Index future model (MVP-01 planning layer) ===
// These types describe the future real local-media index. They are not wired to Electron,
// real directory scanning, SQLite, or HTMLAudio in the current UI prototype.

export type LibraryRootType = 'asmr' | 'music' | 'mixed';
export type LibraryCollectionType = 'rj_work' | 'music_album' | 'music_folder' | 'playlist_generated';
export type LibraryTrackKind = 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';
export type IndexSourceKind = 'mock' | 'local-json' | 'fixture' | 'electron-scan';

export interface LibraryRoot {
  id: string;
  name: string;
  rootPath: string;
  libraryType: LibraryRootType;
  scanProfile: 'asmr-rj' | 'music-folder' | 'mixed-folder';
  sourceKind: IndexSourceKind;
  createdAt: string;
  updatedAt: string;
}

export interface CoverSource {
  id: string;
  collectionId: string;
  sourceKind: 'mock-url' | 'local-file' | 'embedded' | 'missing';
  url?: string;
  absolutePath?: string;
  relativePath?: string;
  isPrimary: boolean;
}

export interface SubtitleSource {
  id: string;
  trackId: string;
  sourceKind: 'mock-lines' | 'local-file' | 'missing';
  language?: 'ja' | 'zh' | 'bilingual' | 'unknown';
  format?: 'lrc' | 'srt' | 'vtt' | 'ass' | 'txt';
  url?: string;
  absolutePath?: string;
  relativePath?: string;
  lineCount?: number;
}

export interface TrackSource {
  id: string;
  trackId: string;
  sourceKind: 'mock' | 'local-file' | 'file-url' | 'missing';
  absolutePath?: string;
  relativePath?: string;
  fileUrl?: string;
  extension?: string;
  sizeBytes?: number;
  mtimeMs?: number;
}

export interface LibraryTrack {
  id: string;
  rootId: string;
  collectionId: string;
  kind: LibraryTrackKind;
  title: string;
  displayArtist?: string;
  displayAlbum?: string;
  rjId?: string;
  trackNo?: number;
  discNo?: number;
  durationSeconds?: number;
  source: TrackSource;
  subtitles: SubtitleSource[];
  cover?: CoverSource;
  tags: string[];
  addedAt?: string;
}

export interface LibraryCollection {
  id: string;
  rootId: string;
  collectionType: LibraryCollectionType;
  title: string;
  sortTitle?: string;
  codeRaw?: string;
  codeNorm?: string;
  artist?: string;
  circle?: string;
  cvs?: string[];
  album?: string;
  folderPath?: string;
  cover?: CoverSource;
  tags: string[];
  status: 'demo' | 'identified' | 'missing-cover' | 'missing-audio' | 'warning' | 'unknown';
  trackIds: string[];
  totalDurationSeconds?: number;
  addedAt?: string;
  updatedAt?: string;
}

export interface LocalJsonIndex {
  schemaVersion: 1;
  generatedAt: string;
  sourceKind: IndexSourceKind;
  roots: LibraryRoot[];
  collections: LibraryCollection[];
  tracks: LibraryTrack[];
  covers: CoverSource[];
  subtitles: SubtitleSource[];
  warnings: string[];
}
