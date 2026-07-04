import type {
  CoverSource,
  LibraryCollection,
  LibraryRoot,
  LibraryTrack,
  LocalJsonIndex,
  SubtitleSource,
  TrackSource,
} from '../types';

export type FixtureLibraryKind = 'asmr' | 'music';

export interface FixtureLibraryEntry {
  /** Virtual path under the fixture root. Must use forward slashes. */
  relativePath: string;
  libraryType: FixtureLibraryKind;
  sizeBytes?: number;
  mtimeMs?: number;
}

export interface FixtureScannerOptions {
  generatedAt?: string;
  rootPathPrefix?: string;
}

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'ape']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'avi', 'mov']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const SUBTITLE_EXTENSIONS = new Set(['lrc', 'srt', 'vtt', 'ass', 'txt']);
const COVER_BASENAMES = new Set(['cover', 'folder', 'front', 'jacket']);

const normalizeVirtualPath = (value: string): string => value.replace(/\\/g, '/').replace(/^\/+/, '').trim();
const stableId = (prefix: string, value: string): string => `${prefix}_${normalizeVirtualPath(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, '_').replace(/^_+|_+$/g, '') || 'root'}`;
const extensionOf = (relativePath: string): string => relativePath.split('.').pop()?.toLowerCase() || '';
const fileNameOf = (relativePath: string): string => normalizeVirtualPath(relativePath).split('/').pop() || relativePath;
const baseNameOf = (relativePath: string): string => fileNameOf(relativePath).replace(/\.[^.]+$/, '');
const isCoverImage = (relativePath: string): boolean => IMAGE_EXTENSIONS.has(extensionOf(relativePath)) && COVER_BASENAMES.has(baseNameOf(relativePath).toLowerCase());
const parentPathOf = (relativePath: string): string => {
  const parts = normalizeVirtualPath(relativePath).split('/');
  parts.pop();
  return parts.join('/');
};
const firstFolderOf = (relativePath: string): string => normalizeVirtualPath(relativePath).split('/')[0] || 'root';
const detectRjId = (value: string): string | undefined => value.match(/RJ\d{6,8}/i)?.[0].toUpperCase();
const humanizeTitle = (value: string): string => value.replace(/^\[?RJ\d{6,8}\]?[_\s-]*/i, '').replace(/[_]+/g, ' ').trim() || value;
const nowIso = (options?: FixtureScannerOptions): string => options?.generatedAt || new Date(0).toISOString();

const createRoot = (libraryType: FixtureLibraryKind, options?: FixtureScannerOptions): LibraryRoot => ({
  id: libraryType === 'asmr' ? 'fixture_root_asmr' : 'fixture_root_music',
  name: libraryType === 'asmr' ? 'Fixture 音声库' : 'Fixture 流行音乐库',
  rootPath: `${options?.rootPathPrefix || '<fixture>'}/${libraryType}`,
  libraryType,
  scanProfile: libraryType === 'asmr' ? 'asmr-rj' : 'music-folder',
  sourceKind: 'fixture',
  createdAt: nowIso(options),
  updatedAt: nowIso(options),
});

const trackKindFromExtension = (extension: string): LibraryTrack['kind'] => {
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (SUBTITLE_EXTENSIONS.has(extension)) return 'text';
  return 'other';
};

const collectionTypeFor = (libraryType: FixtureLibraryKind, folderName: string): LibraryCollection['collectionType'] => {
  if (libraryType === 'asmr') return detectRjId(folderName) ? 'rj_work' : 'music_folder';
  return folderName.includes(' - ') ? 'music_album' : 'music_folder';
};

const makeTrackSource = (trackId: string, entry: FixtureLibraryEntry): TrackSource => ({
  id: `fixture_source_${trackId}`,
  trackId,
  sourceKind: 'local-file',
  relativePath: normalizeVirtualPath(entry.relativePath),
  extension: extensionOf(entry.relativePath),
  sizeBytes: entry.sizeBytes,
  mtimeMs: entry.mtimeMs,
});

const makeCover = (collectionId: string, entry: FixtureLibraryEntry): CoverSource => ({
  id: `fixture_cover_${collectionId}_${baseNameOf(entry.relativePath).toLowerCase()}`,
  collectionId,
  sourceKind: 'local-file',
  relativePath: normalizeVirtualPath(entry.relativePath),
  isPrimary: true,
});

const subtitleLanguage = (relativePath: string): SubtitleSource['language'] => {
  const lower = relativePath.toLowerCase();
  if (lower.includes('.zh.') || lower.endsWith('.zh.lrc') || lower.endsWith('.zh.srt')) return 'zh';
  if (lower.includes('.ja.') || lower.endsWith('.ja.lrc') || lower.endsWith('.ja.srt')) return 'ja';
  if (lower.includes('.bilingual.')) return 'bilingual';
  return 'unknown';
};

const makeSubtitle = (trackId: string, entry: FixtureLibraryEntry): SubtitleSource => ({
  id: `fixture_subtitle_${trackId}_${baseNameOf(entry.relativePath).toLowerCase().replace(/[^a-z0-9]+/gi, '_')}`,
  trackId,
  sourceKind: 'local-file',
  language: subtitleLanguage(entry.relativePath),
  format: extensionOf(entry.relativePath) as SubtitleSource['format'],
  relativePath: normalizeVirtualPath(entry.relativePath),
});

const subtitleKeyCandidates = (relativePath: string): string[] => {
  const parent = parentPathOf(relativePath);
  const base = baseNameOf(relativePath)
    .replace(/\.(zh|ja|bilingual|cn|jp)$/i, '')
    .toLowerCase();
  return [`${parent}/${base}`.toLowerCase()];
};

export const fixtureLibraryScanner = {
  scanVirtualEntries(entries: FixtureLibraryEntry[], options: FixtureScannerOptions = {}): LocalJsonIndex {
    const normalized = entries.map((entry) => ({...entry, relativePath: normalizeVirtualPath(entry.relativePath)}))
      .filter((entry) => entry.relativePath && !entry.relativePath.includes('..'));

    const roots = [createRoot('asmr', options), createRoot('music', options)];
    const collections: LibraryCollection[] = [];
    const tracks: LibraryTrack[] = [];
    const covers: CoverSource[] = [];
    const subtitles: SubtitleSource[] = [];
    const warnings: string[] = ['P2 fixture scanner: virtual entries only. No real filesystem, Electron, SQLite, or library-index.json writes.'];

    const entriesByCollection = new Map<string, FixtureLibraryEntry[]>();
    normalized.forEach((entry) => {
      const folder = firstFolderOf(entry.relativePath);
      const key = `${entry.libraryType}:${folder}`;
      entriesByCollection.set(key, [...(entriesByCollection.get(key) || []), entry]);
    });

    entriesByCollection.forEach((collectionEntries, key) => {
      const [libraryType, folder] = key.split(':') as [FixtureLibraryKind, string];
      const rootId = libraryType === 'asmr' ? 'fixture_root_asmr' : 'fixture_root_music';
      const collectionId = stableId(`fixture_${libraryType}`, folder);
      const rjId = detectRjId(folder);
      const collectionCovers: CoverSource[] = [];
      const collectionTracks: LibraryTrack[] = [];
      const subtitlesByAudioBase = new Map<string, FixtureLibraryEntry[]>();

      collectionEntries.forEach((entry) => {
        const extension = extensionOf(entry.relativePath);
        if (SUBTITLE_EXTENSIONS.has(extension)) {
          subtitleKeyCandidates(entry.relativePath).forEach((candidate) => {
            subtitlesByAudioBase.set(candidate, [...(subtitlesByAudioBase.get(candidate) || []), entry]);
          });
        }
        if (isCoverImage(entry.relativePath)) {
          collectionCovers.push(makeCover(collectionId, entry));
        }
      });

      collectionEntries
        .filter((entry) => {
          const extension = extensionOf(entry.relativePath);
          if (AUDIO_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension)) return true;
          if (IMAGE_EXTENSIONS.has(extension) && !isCoverImage(entry.relativePath)) return true;
          return false;
        })
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'zh-Hans-CN'))
        .forEach((entry, index) => {
          const extension = extensionOf(entry.relativePath);
          const trackId = stableId('fixture_track', `${collectionId}_${entry.relativePath}`);
          const trackSubtitles = (subtitlesByAudioBase.get(`${parentPathOf(entry.relativePath)}/${baseNameOf(entry.relativePath)}`.toLowerCase()) || [])
            .map((subtitleEntry) => makeSubtitle(trackId, subtitleEntry));
          const track: LibraryTrack = {
            id: trackId,
            rootId,
            collectionId,
            kind: trackKindFromExtension(extension),
            title: baseNameOf(entry.relativePath),
            displayAlbum: humanizeTitle(folder),
            rjId,
            trackNo: index + 1,
            source: makeTrackSource(trackId, entry),
            subtitles: trackSubtitles,
            cover: collectionCovers[0],
            tags: libraryType === 'asmr' ? ['fixture-asmr'] : ['fixture-music'],
          };
          collectionTracks.push(track);
          subtitles.push(...trackSubtitles);
        });

      if (collectionTracks.length === 0) {
        warnings.push(`Fixture collection has no audio/video tracks: ${folder}`);
      }
      if (collectionCovers.length === 0) {
        warnings.push(`Fixture collection has no cover: ${folder}`);
      }

      collections.push({
        id: collectionId,
        rootId,
        collectionType: collectionTypeFor(libraryType, folder),
        title: humanizeTitle(folder),
        sortTitle: humanizeTitle(folder).toLowerCase(),
        codeRaw: rjId,
        codeNorm: rjId,
        folderPath: folder,
        cover: collectionCovers[0],
        tags: libraryType === 'asmr' ? ['fixture', 'asmr'] : ['fixture', 'music'],
        status: collectionTracks.length > 0 ? 'identified' : 'missing-audio',
        trackIds: collectionTracks.map((track) => track.id),
        updatedAt: nowIso(options),
      });
      covers.push(...collectionCovers);
      tracks.push(...collectionTracks);
    });

    return {
      schemaVersion: 1,
      generatedAt: nowIso(options),
      sourceKind: 'fixture',
      roots,
      collections,
      tracks,
      covers,
      subtitles,
      warnings,
    };
  },
};
