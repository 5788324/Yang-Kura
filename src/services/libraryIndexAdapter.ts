import type {
  AudioTrack,
  CoverSource,
  LibraryCollection,
  LibraryRoot,
  LibraryTrack,
  LocalJsonIndex,
  MusicAlbum,
  RJStatus,
  RJWork,
  SubtitleSource,
  TrackSource,
  TrackType,
} from '../types';
import { coverArtworkService } from './coverArtworkService';

const nowIso = () => new Date(0).toISOString();

const createDemoRoot = (id: string, name: string, libraryType: LibraryRoot['libraryType']): LibraryRoot => ({
  id,
  name,
  rootPath: libraryType === 'asmr' ? '<demo>/asmr-library' : '<demo>/music-library',
  libraryType,
  scanProfile: libraryType === 'asmr' ? 'asmr-rj' : 'music-folder',
  sourceKind: 'mock',
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const buildCover = (collectionId: string, coverUrl: string): CoverSource => ({
  id: `cover_${collectionId}`,
  collectionId,
  sourceKind: 'mock-url',
  url: coverUrl,
  isPrimary: true,
});

const buildSubtitle = (track: AudioTrack): SubtitleSource[] => {
  if (!track.lyrics || track.lyrics.length === 0) return [];
  return [{
    id: `subtitle_${track.id}_mock_lrc`,
    trackId: track.id,
    sourceKind: 'mock-lines',
    language: 'unknown',
    format: 'lrc',
    lineCount: track.lyrics.length,
  }];
};

const buildTrackSource = (track: AudioTrack): TrackSource => ({
  id: `source_${track.id}`,
  trackId: track.id,
  sourceKind: 'mock',
  relativePath: track.fileTreePath || `${track.title}.mock-audio`,
  extension: track.fileTreePath?.split('.').pop()?.toLowerCase(),
});

const mapTrack = (track: AudioTrack, rootId: string, collectionId: string, index: number): LibraryTrack => ({
  id: track.id,
  rootId,
  collectionId,
  kind: 'audio',
  title: track.title,
  displayArtist: track.artist,
  displayAlbum: track.album,
  rjId: track.rjId,
  trackNo: index + 1,
  durationSeconds: track.duration,
  source: buildTrackSource(track),
  subtitles: buildSubtitle(track),
  tags: [],
  addedAt: track.addedAt,
});

function makeDataUrlPlaceholder(title: string, subtitle: string, hue: number): string {
  return coverArtworkService.makeFallbackCover(title, `${subtitle} · ${hue}`, 'track');
}

function formatBytes(sizeBytes?: number): string | undefined {
  if (typeof sizeBytes !== 'number' || !Number.isFinite(sizeBytes)) return undefined;
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  if (sizeBytes < 1024 * 1024 * 1024) return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(sizeBytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function uniqueId(baseId: string, seen: Set<string>): string {
  if (!seen.has(baseId)) {
    seen.add(baseId);
    return baseId;
  }
  let counter = 2;
  while (seen.has(`${baseId}-${counter}`)) counter += 1;
  const next = `${baseId}-${counter}`;
  seen.add(next);
  return next;
}

function safeTrackType(collection: LibraryCollection): TrackType {
  return collection.collectionType === 'rj_work' ? 'asmr' : 'music';
}

function coerceStatus(status: LibraryCollection['status']): RJStatus {
  if (status === 'missing-cover') return 'missing-cover';
  if (status === 'missing-audio') return 'missing-audio';
  if (status === 'warning' || status === 'unknown') return 'warning';
  return 'identified';
}

function collectionCoverUrl(collection: LibraryCollection, index: number, rootToken?: string): string {
  return coverArtworkService.resolveCollectionCoverUrl(collection, rootToken, index);
}

function rootTokenFromRoot(root?: LibraryRoot): string | undefined {
  if (!root?.rootPath) return undefined;
  const prefix = 'rootPathToken:';
  return root.rootPath.startsWith(prefix) ? root.rootPath.slice(prefix.length) : undefined;
}



function normalizeCollectionFolderLabel(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!normalized) return undefined;
  if (normalized.includes('file://') || /^[A-Za-z]:[\\/]/.test(value) || value.startsWith('/') || value.startsWith('\\')) {
    return undefined;
  }
  return normalized;
}

function normalizeSubtitleRelativePath(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!normalized || normalized.includes('file://') || /^[A-Za-z]:[\\/]/.test(normalized) || normalized.startsWith('/')) {
    return undefined;
  }
  return normalized;
}

function stripKnownMediaExtension(relativePath: string): string {
  return relativePath.replace(/\.[^.\/]+$/, '').toLowerCase();
}

function collectSubtitleRelativePaths(track: LibraryTrack, allSubtitles: SubtitleSource[]): string[] {
  const result = new Set<string>();
  const directSubtitles = Array.isArray(track.subtitles) ? track.subtitles : [];
  [...directSubtitles, ...allSubtitles.filter((subtitle) => subtitle.trackId === track.id)].forEach((subtitle) => {
    const normalized = normalizeSubtitleRelativePath(subtitle.relativePath);
    if (normalized) result.add(normalized);
  });

  const trackBase = stripKnownMediaExtension(track.source.relativePath || '');
  if (trackBase) {
    allSubtitles.forEach((subtitle) => {
      const normalized = normalizeSubtitleRelativePath(subtitle.relativePath);
      if (!normalized) return;
      const subtitleBase = normalized.toLowerCase()
        .replace(/\.(ja|zh|bilingual|jp|cn)\.(lrc|srt|vtt|ass)$/i, '')
        .replace(/\.(lrc|srt|vtt|ass)$/i, '');
      if (subtitleBase === trackBase || subtitleBase.startsWith(`${trackBase}.`)) {
        result.add(normalized);
      }
    });
  }

  return Array.from(result);
}

function mapIndexedTrack(track: LibraryTrack, collection: LibraryCollection, coverUrl: string, index: number, rootToken?: string, allSubtitles: SubtitleSource[] = []): AudioTrack {
  const type = safeTrackType(collection);
  const relativePath = track.source.relativePath;
  const hasTokenizedLocalSource = Boolean(rootToken && relativePath && track.source.sourceKind === 'local-file');
  const isPlayableAudio = track.kind === 'audio';
  const subtitleRelativePaths = collectSubtitleRelativePaths(track, allSubtitles);
  return {
    id: track.id,
    title: track.title || relativePath || `Track ${index + 1}`,
    artist: track.displayArtist || collection.artist || collection.circle || collection.cvs?.[0] || (type === 'asmr' ? '本地音声' : '本地音乐'),
    album: track.displayAlbum || collection.title,
    circle: collection.circle,
    rjId: track.rjId || collection.codeNorm,
    duration: track.durationSeconds || 0,
    coverUrl: track.cover?.url || (track.cover?.relativePath && rootToken ? coverArtworkService.buildTokenizedCoverUrl(rootToken, track.cover.relativePath) : coverUrl),
    coverSourceKind: track.cover?.sourceKind || collection.cover?.sourceKind || (coverArtworkService.isTokenizedCoverUrl(coverUrl) ? 'local-file' : coverUrl.startsWith('data:image/svg+xml') ? 'generated-fallback' : 'mock-url'),
    coverRelativePath: track.cover?.relativePath || collection.cover?.relativePath,
    fileSize: formatBytes(track.source.sizeBytes),
    type,
    lyrics: subtitleRelativePaths.length ? ['[00:00.00] 已检测到本地字幕文件，正在等待播放器读取正文。'] : undefined,
    subtitleRelativePaths: subtitleRelativePaths.length ? subtitleRelativePaths : undefined,
    lyricsSourceKind: subtitleRelativePaths.length ? 'local-file' : undefined,
    lyricsRelativePath: subtitleRelativePaths[0],
    lyricsLoadStatus: subtitleRelativePaths.length ? 'idle' : undefined,
    fileTreePath: relativePath,
    mediaKind: track.kind,
    rootPathToken: hasTokenizedLocalSource ? rootToken : undefined,
    sourceRelativePath: hasTokenizedLocalSource ? relativePath : undefined,
    playbackSourceKind: hasTokenizedLocalSource && isPlayableAudio ? 'tokenized-local-file' : 'mock',
    externalOpenSourceKind: hasTokenizedLocalSource ? 'tokenized-local-file' : undefined,
    addedAt: track.addedAt,
  };
}

export const libraryIndexAdapter = {
  fromMockData(rjWorks: RJWork[], musicAlbums: MusicAlbum[]): LocalJsonIndex {
    const roots = [
      createDemoRoot('root_demo_asmr', 'Demo 音声库', 'asmr'),
      createDemoRoot('root_demo_music', 'Demo 流行音乐库', 'music'),
    ];
    const collections: LibraryCollection[] = [];
    const tracks: LibraryTrack[] = [];
    const covers: CoverSource[] = [];
    const subtitles: SubtitleSource[] = [];

    rjWorks.forEach((work) => {
      const cover = buildCover(work.id, work.coverUrl);
      const mappedTracks = work.tracks.map((track, index) => mapTrack(track, 'root_demo_asmr', work.id, index));
      collections.push({
        id: work.id,
        rootId: 'root_demo_asmr',
        collectionType: 'rj_work',
        title: work.title,
        codeRaw: work.id,
        codeNorm: work.id,
        artist: work.cvs.join(' / '),
        circle: work.circle,
        cvs: work.cvs,
        cover,
        tags: work.tags,
        status: work.status === 'identified' ? 'demo' : work.status,
        trackIds: mappedTracks.map((track) => track.id),
        totalDurationSeconds: work.totalDuration,
        addedAt: work.addedAt,
        updatedAt: nowIso(),
      });
      covers.push(cover);
      tracks.push(...mappedTracks);
      mappedTracks.forEach((track) => subtitles.push(...track.subtitles));
    });

    musicAlbums.forEach((album) => {
      const cover = buildCover(album.id, album.coverUrl);
      const mappedTracks = album.tracks.map((track, index) => mapTrack(track, 'root_demo_music', album.id, index));
      collections.push({
        id: album.id,
        rootId: 'root_demo_music',
        collectionType: 'music_album',
        title: album.title,
        artist: album.artist,
        album: album.title,
        cover,
        tags: [album.genre],
        status: 'demo',
        trackIds: mappedTracks.map((track) => track.id),
        totalDurationSeconds: mappedTracks.reduce((sum, track) => sum + (track.durationSeconds || 0), 0),
        updatedAt: nowIso(),
      });
      covers.push(cover);
      tracks.push(...mappedTracks);
      mappedTracks.forEach((track) => subtitles.push(...track.subtitles));
    });

    return {
      schemaVersion: 1,
      generatedAt: nowIso(),
      sourceKind: 'mock',
      roots,
      collections,
      tracks,
      covers,
      subtitles,
      warnings: ['MVP-01 demo index: generated from mockData only. No filesystem, Electron, SQLite, or audio playback access.'],
    };
  },

  fromLocalJsonIndexToAppData(index: LocalJsonIndex): { rjWorks: RJWork[]; musicAlbums: MusicAlbum[] } {
    const trackById = new Map(index.tracks.map((track) => [track.id, track]));
    const rootById = new Map(index.roots.map((root) => [root.id, root]));
    const rjWorks: RJWork[] = [];
    const musicAlbums: MusicAlbum[] = [];
    const seenRjIds = new Set<string>();

    index.collections.forEach((collection, collectionIndex) => {
      const rootToken = rootTokenFromRoot(rootById.get(collection.rootId));
      const coverUrl = collectionCoverUrl(collection, collectionIndex, rootToken);
      const sourceTracks = collection.trackIds
        .map((trackId) => trackById.get(trackId))
        .filter((track): track is LibraryTrack => Boolean(track));
      const mappedTracks = sourceTracks.map((track, trackIndex) => mapIndexedTrack(track, collection, coverUrl, trackIndex, rootToken, index.subtitles));
      const totalDuration = mappedTracks.reduce((sum, track) => sum + track.duration, 0);

      if (collection.collectionType === 'rj_work') {
        const stableId = uniqueId(collection.codeNorm || collection.codeRaw || collection.id, seenRjIds);
        rjWorks.push({
          id: stableId,
          title: collection.title || stableId,
          circle: collection.circle || collection.artist || '本地音声库',
          cvs: collection.cvs && collection.cvs.length > 0 ? collection.cvs : ['未识别声优'],
          releaseDate: '',
          coverUrl,
          coverSourceKind: collection.cover?.sourceKind || (coverArtworkService.isTokenizedCoverUrl(coverUrl) ? 'local-file' : coverUrl.startsWith('data:image/svg+xml') ? 'generated-fallback' : 'mock-url'),
          coverRelativePath: collection.cover?.relativePath,
          tags: collection.tags || [],
          status: coerceStatus(collection.status),
          fileCount: mappedTracks.length,
          totalDuration,
          description: `来自真实 library-index.json 的本地音声集合。路径以相对路径显示，不暴露真实 absolutePath。${normalizeCollectionFolderLabel(collection.folderPath) ? `\n资源库记录：${normalizeCollectionFolderLabel(collection.folderPath)}` : ''}`,
          tracks: mappedTracks,
          addedAt: collection.addedAt || collection.updatedAt || index.generatedAt,
          personalStatus: 'unheard',
        });
        return;
      }

      musicAlbums.push({
        id: collection.id,
        title: collection.title || collection.album || '本地音乐集合',
        artist: collection.artist || '本地音乐库',
        coverUrl,
        coverSourceKind: collection.cover?.sourceKind || (coverArtworkService.isTokenizedCoverUrl(coverUrl) ? 'local-file' : coverUrl.startsWith('data:image/svg+xml') ? 'generated-fallback' : 'mock-url'),
        coverRelativePath: collection.cover?.relativePath,
        releaseYear: collection.updatedAt?.slice(0, 4) || index.generatedAt.slice(0, 4) || '',
        genre: collection.collectionType === 'music_folder' ? '文件夹音乐' : '本地音乐',
        tracks: mappedTracks.map((track) => ({ ...track, type: 'music' })),
      });
    });

    return { rjWorks, musicAlbums };
  },
};
