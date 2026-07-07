import type {
  CoverSource,
  LibraryCollection,
  LibraryRoot,
  LibraryTrack,
  LocalJsonIndex,
  SubtitleSource,
  TrackSource,
} from '../types';
import {virtualLibraryPathParser, type ParsedVirtualLibraryPath} from './virtualLibraryPathParser';

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

interface ParsedFixtureEntry extends FixtureLibraryEntry {
  parsed: ParsedVirtualLibraryPath;
}

const stableId = (prefix: string, value: string): string => `${prefix}_${value.toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, '_').replace(/^_+|_+$/g, '') || 'root'}`;
const humanizeTitle = (value: string): string => value.replace(/^\[?RJ\d{5,8}\]?[_\s-]*/i, '').replace(/[_]+/g, ' ').trim() || value;
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

const makeTrackSource = (trackId: string, entry: ParsedFixtureEntry): TrackSource => ({
  id: `fixture_source_${trackId}`,
  trackId,
  sourceKind: 'local-file',
  relativePath: entry.parsed.normalizedPath,
  extension: entry.parsed.extension,
  sizeBytes: entry.sizeBytes,
  mtimeMs: entry.mtimeMs,
});

const makeCover = (collectionId: string, entry: ParsedFixtureEntry): CoverSource => ({
  id: `fixture_cover_${collectionId}_${entry.parsed.baseName.toLowerCase().replace(/[^a-z0-9]+/gi, '_')}`,
  collectionId,
  sourceKind: 'local-file',
  relativePath: entry.parsed.normalizedPath,
  isPrimary: true,
});

const makeSubtitle = (trackId: string, entry: ParsedFixtureEntry): SubtitleSource => ({
  id: `fixture_subtitle_${trackId}_${entry.parsed.baseName.toLowerCase().replace(/[^a-z0-9]+/gi, '_')}`,
  trackId,
  sourceKind: 'local-file',
  language: entry.parsed.subtitleLanguage || 'unknown',
  format: entry.parsed.subtitleFormat,
  relativePath: entry.parsed.normalizedPath,
});

const collectionKeyOf = (entry: ParsedFixtureEntry): string => `${entry.libraryType}:${entry.parsed.collectionFolder}`;
const rootIdOf = (libraryType: FixtureLibraryKind): string => libraryType === 'asmr' ? 'fixture_root_asmr' : 'fixture_root_music';

const toParsedEntry = (entry: FixtureLibraryEntry): ParsedFixtureEntry | undefined => {
  const parsed = virtualLibraryPathParser.parse({relativePath: entry.relativePath, libraryType: entry.libraryType});
  if (!parsed.normalizedPath || parsed.normalizedPath.includes('..')) return undefined;
  return {...entry, relativePath: parsed.normalizedPath, parsed};
};

export const fixtureLibraryScanner = {
  scanVirtualEntries(entries: FixtureLibraryEntry[], options: FixtureScannerOptions = {}): LocalJsonIndex {
    const normalized = entries.map(toParsedEntry).filter((entry): entry is ParsedFixtureEntry => Boolean(entry));

    const roots = [createRoot('asmr', options), createRoot('music', options)];
    const collections: LibraryCollection[] = [];
    const tracks: LibraryTrack[] = [];
    const covers: CoverSource[] = [];
    const subtitles: SubtitleSource[] = [];
    const warnings: string[] = ['MVP-09 fixture scanner: parser-driven virtual entries only. No real filesystem, Electron, SQLite, or library-index.json writes.'];

    const entriesByCollection = new Map<string, ParsedFixtureEntry[]>();
    normalized.forEach((entry) => {
      const key = collectionKeyOf(entry);
      entriesByCollection.set(key, [...(entriesByCollection.get(key) || []), entry]);
      warnings.push(...entry.parsed.warnings.map((warning) => `${entry.parsed.normalizedPath}: ${warning}`));
    });

    entriesByCollection.forEach((collectionEntries, key) => {
      const [libraryType, folder] = key.split(':') as [FixtureLibraryKind, string];
      const rootId = rootIdOf(libraryType);
      const collectionId = stableId(`fixture_${libraryType}`, folder);
      const rjId = collectionEntries.find((entry) => entry.parsed.rjIdNorm)?.parsed.rjIdNorm;
      const collectionCovers = collectionEntries
        .filter((entry) => entry.parsed.isCoverCandidate)
        .sort((a, b) => a.parsed.normalizedPath.localeCompare(b.parsed.normalizedPath, 'zh-Hans-CN'))
        .map((entry) => makeCover(collectionId, entry));
      const collectionTracks: LibraryTrack[] = [];
      const subtitlesByTargetStem = new Map<string, ParsedFixtureEntry[]>();

      collectionEntries.forEach((entry) => {
        if (entry.parsed.isSubtitleCandidate && entry.parsed.subtitleTargetStem) {
          const keyForSubtitle = entry.parsed.subtitleTargetStem.toLowerCase();
          subtitlesByTargetStem.set(keyForSubtitle, [...(subtitlesByTargetStem.get(keyForSubtitle) || []), entry]);
        }
      });

      collectionEntries
        .filter((entry) => entry.parsed.isTrackCandidate)
        .sort((a, b) => a.parsed.normalizedPath.localeCompare(b.parsed.normalizedPath, 'zh-Hans-CN'))
        .forEach((entry, index) => {
          const trackId = stableId('fixture_track', `${collectionId}_${entry.parsed.normalizedPath}`);
          const subtitleStem = `${entry.parsed.parentPath}/${entry.parsed.baseName}`.replace(/^\//, '').toLowerCase();
          const trackSubtitles = (subtitlesByTargetStem.get(subtitleStem) || [])
            .map((subtitleEntry) => makeSubtitle(trackId, subtitleEntry));
          const track: LibraryTrack = {
            id: trackId,
            rootId,
            collectionId,
            kind: entry.parsed.mediaKind as LibraryTrack['kind'],
            title: entry.parsed.baseName,
            displayAlbum: humanizeTitle(folder),
            rjId,
            trackNo: entry.parsed.trackNo || index + 1,
            discNo: entry.parsed.discNo,
            source: makeTrackSource(trackId, entry),
            subtitles: trackSubtitles,
            cover: collectionCovers[0],
            tags: [
              libraryType === 'asmr' ? 'fixture-asmr' : 'fixture-music',
              entry.parsed.specialRole !== 'unknown' ? `role:${entry.parsed.specialRole}` : undefined,
            ].filter((tag): tag is string => Boolean(tag)),
          };
          collectionTracks.push(track);
          subtitles.push(...trackSubtitles);
        });

      if (collectionTracks.length === 0) {
        warnings.push(`Fixture collection has no playable tracks: ${folder}`);
      }
      if (collectionCovers.length === 0) {
        warnings.push(`Fixture collection has no cover: ${folder}`);
      }

      const title = humanizeTitle(folder);
      const firstParsed = collectionEntries[0]?.parsed;
      collections.push({
        id: collectionId,
        rootId,
        collectionType: firstParsed?.collectionType || (libraryType === 'asmr' ? 'music_folder' : 'music_folder'),
        title,
        sortTitle: title.toLowerCase(),
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
