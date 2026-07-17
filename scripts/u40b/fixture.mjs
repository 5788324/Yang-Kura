import fs from 'node:fs';
import path from 'node:path';

function writeSilentWav(filePath, seconds = 1) {
  const sampleRate = 8000;
  const channels = 1;
  const bitsPerSample = 16;
  const frameCount = sampleRate * seconds;
  const dataSize = frameCount * channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

function writeFile(root, relativePath, content) {
  const filePath = path.join(root, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

export function createU40bFixture(root) {
  const audioFiles = [
    'asmr/RJ400001/01-lrc.wav',
    'asmr/RJ400001/02-srt.wav',
    'asmr/RJ400001/03-vtt.wav',
    'asmr/RJ400001/04-ass.wav',
    'asmr/RJ400002/01-none.wav',
    'music/Artist A/Album A/01-song.wav',
  ];
  const sizes = Object.fromEntries(audioFiles.map((relativePath) => [
    relativePath,
    writeSilentWav(path.join(root, ...relativePath.split('/')), 1),
  ]));

  const subtitleFiles = [
    'asmr/RJ400001/01-lrc.lrc',
    'asmr/RJ400001/02-srt.srt',
    'asmr/RJ400001/03-vtt.vtt',
    'asmr/RJ400001/04-ass.ass',
  ];
  writeFile(root, subtitleFiles[0], '[00:00.00]第一句 / First line\n[00:00.50]第二句 / Second line\n');
  writeFile(root, subtitleFiles[1], '1\n00:00:00,000 --> 00:00:00,450\nSRT 第一行 / SRT line\n\n2\n00:00:00,500 --> 00:00:00,950\nSRT 第二行\n');
  writeFile(root, subtitleFiles[2], 'WEBVTT\n\n00:00:00.000 --> 00:00:00.450\nVTT 第一行 / VTT line\n\n00:00:00.500 --> 00:00:00.950\nVTT 第二行\n');
  writeFile(root, subtitleFiles[3], '[Script Info]\nTitle: U40B\nScriptType: v4.00+\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:00.45,Default,,0,0,0,,ASS 第一行 / ASS line\nDialogue: 0,0:00:00.50,0:00:00.95,Default,,0,0,0,,ASS 第二行\n');

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2V5sAAAAASUVORK5CYII=', 'base64');
  const coverFiles = ['asmr/RJ400001/cover.png', 'music/Artist A/Album A/cover.png'];
  for (const relativePath of coverFiles) writeFile(root, relativePath, png);
  writeFile(root, 'asmr/RJ400001/readme.txt', 'U40-B fixture text');

  return { audioSeconds: 1, audioFiles, subtitleFiles, coverFiles, sizes };
}

function makeTrack({ id, title, artist, album, type, relativePath, subtitleRelativePaths = [], rootPathToken, sizes }) {
  return {
    id,
    title,
    artist,
    album,
    duration: 1,
    coverUrl: '',
    type,
    playbackSourceKind: 'tokenized-local-file',
    externalOpenSourceKind: 'tokenized-local-file',
    rootPathToken,
    sourceRelativePath: relativePath,
    fileTreePath: relativePath,
    fileSize: `${sizes[relativePath] ?? 0} B`,
    subtitleRelativePaths,
    addedAt: '2026-07-18T00:00:00.000Z',
    rjId: type === 'asmr' ? 'RJ400001' : undefined,
  };
}

export function buildSeed(rootPathToken, sizes) {
  const tracks = [
    makeTrack({ id:'u40b-lrc', title:'1 秒 LRC 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/01-lrc.wav', subtitleRelativePaths:['asmr/RJ400001/01-lrc.lrc'], rootPathToken, sizes }),
    makeTrack({ id:'u40b-srt', title:'1 秒 SRT 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/02-srt.wav', subtitleRelativePaths:['asmr/RJ400001/02-srt.srt'], rootPathToken, sizes }),
    makeTrack({ id:'u40b-vtt', title:'1 秒 VTT 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/03-vtt.wav', subtitleRelativePaths:['asmr/RJ400001/03-vtt.vtt'], rootPathToken, sizes }),
    makeTrack({ id:'u40b-ass', title:'1 秒 ASS 音轨', artist:'U40-B CV', album:'全功能验收音声', type:'asmr', relativePath:'asmr/RJ400001/04-ass.wav', subtitleRelativePaths:['asmr/RJ400001/04-ass.ass'], rootPathToken, sizes }),
    makeTrack({ id:'u40b-none', title:'1 秒无字幕音轨', artist:'U40-B CV 2', album:'无字幕音声', type:'asmr', relativePath:'asmr/RJ400002/01-none.wav', rootPathToken, sizes }),
    makeTrack({ id:'u40b-music', title:'1 秒音乐音轨', artist:'Artist A', album:'Album A', type:'music', relativePath:'music/Artist A/Album A/01-song.wav', rootPathToken, sizes }),
  ];
  const works = [
    { id:'RJ400001', title:'全功能验收音声', circle:'U40-B 社团', cvs:['U40-B CV'], tags:['测试','双语字幕'], tracks:tracks.slice(0,4), releaseDate:'2026-07-18', coverUrl:'', status:'identified', fileCount:4, totalDuration:4, description:'U40-B 临时测试作品', rating:5, personalStatus:'listening', addedAt:'2026-07-18T00:00:00.000Z' },
    { id:'RJ400002', title:'无字幕验收音声', circle:'U40-B 社团', cvs:['U40-B CV 2'], tags:['测试'], tracks:tracks.slice(4,5), releaseDate:'2026-07-18', coverUrl:'', status:'identified', fileCount:1, totalDuration:1, description:'U40-B 临时测试作品', rating:4, personalStatus:'unheard', addedAt:'2026-07-18T00:00:00.000Z' },
  ];
  const albums = [{ id:'u40b-album', title:'Album A', artist:'Artist A', releaseYear:'2026', genre:'Test', coverUrl:'', tracks:[tracks[5]] }];
  const playlists = [{ id:'u40b-playlist', name:'U40-B 测试歌单', description:'临时测试歌单', coverUrl:'', creator:'本地用户', tracksCount:2, tracks:[tracks[0],tracks[5]], isSystem:false, sourceKind:'user-local' }];
  return { tracks, works, albums, playlists };
}

export async function seedApplication(cdp, rootPathToken, sizes) {
  const seed = buildSeed(rootPathToken, sizes);
  await cdp.evaluate(`(() => {
    const seed=${JSON.stringify(seed)};
    const now=new Date().toISOString();
    const rootPathToken=${JSON.stringify(rootPathToken)};
    localStorage.setItem('sqlite_rj_works', JSON.stringify(seed.works));
    localStorage.setItem('sqlite_music_albums', JSON.stringify(seed.albums));
    localStorage.setItem('sqlite_favorites', JSON.stringify(['u40b-music']));
    localStorage.setItem('yang_kura_user_playlists_v1', JSON.stringify({version:1,updatedAt:now,playlists:seed.playlists}));
    localStorage.setItem('sqlite_settings', JSON.stringify({audioLibPath:'<已授权临时音声库>',musicLibPath:'<已授权临时音乐库>',asmrPaths:[],musicPaths:[],tempDownloadPath:'<未设置>',currentTheme:'acrylic-mist',enableOverlay:true,privacyMode:true}));
    const roots={asmr:{rootPathToken,displayName:'U40-B 临时媒体库',libraryType:'asmr',selectedAt:now},music:{rootPathToken,displayName:'U40-B 临时媒体库',libraryType:'music',selectedAt:now},mixed:{rootPathToken,displayName:'U40-B 临时媒体库',libraryType:'mixed',selectedAt:now}};
    sessionStorage.setItem('yang_kura_u28_authorized_roots_v1', JSON.stringify(roots));
    localStorage.setItem('yang_kura_persisted_authorized_roots_v1', JSON.stringify(roots));
    localStorage.setItem('yang_kura_library_session_v1', JSON.stringify({version:1,updatedAt:now,selectedRoots:{mixed:{libraryType:'mixed',displayName:'U40-B 临时媒体库',selectedAt:now}},lastIndex:{libraryType:'mixed',displayName:'U40-B 临时媒体库',indexRelativePath:'library-index.json',readAt:now,generatedAt:now,rootCount:1,collectionCount:3,trackCount:6,warningCount:0}}));
    localStorage.setItem('yang_kura_player_queue_v1', JSON.stringify({version:1,updatedAt:now,queue:seed.tracks,currentTrackId:seed.tracks[0].id,currentIndex:0,progress:0,volume:0.65,isMuted:false,loopMode:'all',playCompletionMode:'continue-queue'}));
    localStorage.setItem('last_played_track_id', seed.tracks[0].id);
    localStorage.setItem('last_played_progress', '0');
    localStorage.setItem('last_played_track_json', JSON.stringify(seed.tracks[0]));
    location.reload();
    return true;
  })()`);
  return seed;
}
