import type {
  AudioTrack,
  CoverSource,
  LibraryCollection,
  LibraryRoot,
  LibraryTrack,
  LocalJsonIndex,
  MusicAlbum,
  RJWork,
  SubtitleSource,
  TrackSource,
} from '../types';

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
};
