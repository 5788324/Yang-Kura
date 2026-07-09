import fs from 'node:fs';

const requiredFiles = [
  'src/services/mediaSurfaceStatusService.ts',
  'src/components/MusicLibrary.tsx',
  'src/components/PlaylistPage.tsx',
  'docs/CURRENT_ROADMAP_MVP40.md',
  'docs/MEDIA_SURFACE_CONSISTENCY_MVP40.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-40 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.78.0-mvp40 or later compatible MVP-41, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp40-media-surface-consistency']) {
  throw new Error('Missing verify:mvp40-media-surface-consistency script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp40-media-surface-consistency')) {
  throw new Error('verify:all does not include MVP-40 verifier');
}

const service = fs.readFileSync('src/services/mediaSurfaceStatusService.ts', 'utf8');
for (const token of ['getTrackBadges', 'getAlbumBadges', 'getPlaylistBadges', 'getMusicSummary', 'getPlaylistSummary']) {
  if (!service.includes(token)) {
    throw new Error(`mediaSurfaceStatusService missing ${token}`);
  }
}
for (const forbidden of ['absolutePath', 'file://', 'fs.unlink', 'fs.rename', 'fs.rm']) {
  if (service.includes(forbidden)) {
    throw new Error(`MVP-40 service should not introduce forbidden token: ${forbidden}`);
  }
}

const music = fs.readFileSync('src/components/MusicLibrary.tsx', 'utf8');
for (const token of ['mvp40-music-library-overview', 'getTrackBadges', 'getAlbumBadges']) {
  if (!music.includes(token)) {
    throw new Error(`MusicLibrary missing MVP-40 token: ${token}`);
  }
}
if (music.includes('物理存储路径已由 Yang-Kura 安全挂载')) {
  throw new Error('MusicLibrary still contains unsafe/engineering folder wording');
}

const playlist = fs.readFileSync('src/components/PlaylistPage.tsx', 'utf8');
for (const token of ['mvp40-playlist-overview', 'getPlaylistBadges', '音声作品与普通音乐混合播放']) {
  if (!playlist.includes(token)) {
    throw new Error(`PlaylistPage missing MVP-40 token: ${token}`);
  }
}
if (playlist.includes('<span>MUSIC</span>')) {
  throw new Error('PlaylistPage still exposes English MUSIC badge in main UI');
}

console.log('MVP-40 media surface consistency verification passed.');
