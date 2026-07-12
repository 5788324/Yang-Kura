import { performance } from 'node:perf_hooks';

const ASMR_WORKS = 4000;
const ASMR_TRACKS_PER_WORK = 8;
const MUSIC_ALBUMS = 1500;
const MUSIC_TRACKS_PER_ALBUM = 12;
const MAX_SEARCH_MS = 1500;
const MAX_SORT_MS = 1500;
const MAX_SERIALIZE_MS = 2500;

function makeTrack(id, title, artist, album, type, index) {
  return {
    id,
    title,
    artist,
    album,
    duration: 120 + (index % 900),
    coverUrl: '',
    type,
    fileTreePath: `disc-${Math.floor(index / 20) + 1}/${String(index + 1).padStart(3, '0')}_${title}.flac`,
    addedAt: `2026-07-${String((index % 28) + 1).padStart(2, '0')}`,
  };
}

function buildFixture() {
  const rjWorks = Array.from({ length: ASMR_WORKS }, (_, workIndex) => {
    const id = `RJ${String(15000000 + workIndex).padStart(8, '0')}`;
    const circle = `社团-${workIndex % 240}`;
    const tracks = Array.from({ length: ASMR_TRACKS_PER_WORK }, (_, trackIndex) =>
      makeTrack(`${id}-track-${trackIndex}`, `耳语音轨 ${trackIndex + 1}`, `声优-${workIndex % 180}`, `作品-${workIndex}`, 'asmr', workIndex * ASMR_TRACKS_PER_WORK + trackIndex),
    );
    return {
      id,
      title: `大型测试音声作品 ${workIndex}`,
      circle,
      cvs: [`声优-${workIndex % 180}`],
      releaseDate: `202${workIndex % 7}-${String((workIndex % 12) + 1).padStart(2, '0')}-01`,
      coverUrl: '',
      tags: [`耳语`, `标签-${workIndex % 50}`],
      status: 'identified',
      fileCount: tracks.length,
      totalDuration: tracks.reduce((sum, track) => sum + track.duration, 0),
      description: `用于 MVP126 大资源库性能测试的生成作品 ${workIndex}`,
      personalNotes: workIndex % 19 === 0 ? '睡前收藏' : '',
      tracks,
      addedAt: `2026-07-${String((workIndex % 28) + 1).padStart(2, '0')}`,
    };
  });

  const musicAlbums = Array.from({ length: MUSIC_ALBUMS }, (_, albumIndex) => {
    const artist = `艺术家-${albumIndex % 320}`;
    const title = `大型测试专辑 ${albumIndex}`;
    const tracks = Array.from({ length: MUSIC_TRACKS_PER_ALBUM }, (_, trackIndex) =>
      makeTrack(`album-${albumIndex}-track-${trackIndex}`, `歌曲 ${albumIndex}-${trackIndex}`, artist, title, 'music', albumIndex * MUSIC_TRACKS_PER_ALBUM + trackIndex),
    );
    return {
      id: `album-${albumIndex}`,
      title,
      artist,
      coverUrl: '',
      releaseYear: String(1990 + (albumIndex % 37)),
      genre: `流派-${albumIndex % 20}`,
      tracks,
    };
  });

  return { schemaVersion: 1, rjWorks, musicAlbums };
}

function normalize(value) {
  return String(value ?? '').toLowerCase();
}

function benchmark(label, fn) {
  const started = performance.now();
  const result = fn();
  const elapsedMs = performance.now() - started;
  return { label, elapsedMs, result };
}

const fixtureResult = benchmark('generate', buildFixture);
const fixture = fixtureResult.result;
const allMusicTracks = fixture.musicAlbums.flatMap((album) => album.tracks);

const asmrSearch = benchmark('asmr-search', () => {
  const query = '睡前';
  return fixture.rjWorks.filter((work) =>
    normalize([work.id, work.title, work.circle, work.cvs.join(' '), work.tags.join(' '), work.description, work.personalNotes, ...work.tracks.map((track) => `${track.title} ${track.fileTreePath}`)].join(' ')).includes(query),
  );
});

const musicSearch = benchmark('music-search', () => {
  const query = '艺术家-12';
  return fixture.musicAlbums.filter((album) =>
    normalize([album.title, album.artist, album.genre, album.releaseYear, ...album.tracks.map((track) => track.title)].join(' ')).includes(query),
  );
});

const sortResult = benchmark('track-sort', () => [...allMusicTracks].sort((a, b) => b.duration - a.duration));
const serializeResult = benchmark('json-roundtrip', () => JSON.parse(JSON.stringify(fixture)));

const totalTracks = fixture.rjWorks.reduce((sum, work) => sum + work.tracks.length, 0) + allMusicTracks.length;
const results = [fixtureResult, asmrSearch, musicSearch, sortResult, serializeResult];

const thresholdFailures = [];
if (asmrSearch.elapsedMs > MAX_SEARCH_MS) thresholdFailures.push(`asmr search ${asmrSearch.elapsedMs.toFixed(1)}ms`);
if (musicSearch.elapsedMs > MAX_SEARCH_MS) thresholdFailures.push(`music search ${musicSearch.elapsedMs.toFixed(1)}ms`);
if (sortResult.elapsedMs > MAX_SORT_MS) thresholdFailures.push(`sort ${sortResult.elapsedMs.toFixed(1)}ms`);
if (serializeResult.elapsedMs > MAX_SERIALIZE_MS) thresholdFailures.push(`JSON roundtrip ${serializeResult.elapsedMs.toFixed(1)}ms`);
if (totalTracks !== 50000) thresholdFailures.push(`unexpected track count ${totalTracks}`);

console.log('MVP126 synthetic large-library benchmark');
console.log(`fixture: ${fixture.rjWorks.length} ASMR works, ${fixture.musicAlbums.length} music albums, ${totalTracks} tracks`);
for (const item of results) console.log(`${item.label}: ${item.elapsedMs.toFixed(1)}ms`);
console.log(`matches: ASMR=${asmrSearch.result.length}, music albums=${musicSearch.result.length}`);
console.log('real library access: NO');

if (thresholdFailures.length > 0) {
  console.error(`FAIL: ${thresholdFailures.join('; ')}`);
  process.exit(1);
}
console.log('PASS');
