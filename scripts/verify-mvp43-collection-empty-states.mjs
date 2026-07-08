import fs from 'node:fs';

const requiredFiles = [
  'src/services/collectionDetailExperienceService.ts',
  'src/components/AsmrDetail.tsx',
  'src/components/MusicLibrary.tsx',
  'src/components/PlaylistPage.tsx',
  'docs/CURRENT_ROADMAP_MVP43.md',
  'docs/COLLECTION_EMPTY_STATES_MVP43.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-43 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.81.0-mvp43 or later compatible MVP-44, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp43-collection-empty-states']) {
  throw new Error('Missing verify:mvp43-collection-empty-states script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp43-collection-empty-states')) {
  throw new Error('verify:all does not include MVP-43 verifier');
}

const service = fs.readFileSync('src/services/collectionDetailExperienceService.ts', 'utf8');
for (const token of ['getAsmrDetailSummary', 'getMusicEmptyState', 'getPlaylistEmptyState', 'getPlaylistDetailSummary', 'getBreadcrumbs', '作品资源概况']) {
  if (!service.includes(token)) throw new Error(`collectionDetailExperienceService missing ${token}`);
}
for (const forbidden of ['absolutePath', 'file://', 'fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'ASMR.one', 'DLsite']) {
  if (service.includes(forbidden)) throw new Error(`MVP-43 service should not introduce forbidden token: ${forbidden}`);
}

const asmrDetail = fs.readFileSync('src/components/AsmrDetail.tsx', 'utf8');
for (const token of ['mvp43-asmr-detail-navigation', 'mvp43-asmr-empty-state', 'collectionDetailExperienceService']) {
  if (!asmrDetail.includes(token)) throw new Error(`AsmrDetail missing MVP-43 token: ${token}`);
}
for (const stale of ['物理挂载路径', '物理文件路径', 'DLsite 元数据', 'Local Folder Name Parser']) {
  if (asmrDetail.includes(stale)) throw new Error(`AsmrDetail still contains stale detail copy: ${stale}`);
}

const musicLibrary = fs.readFileSync('src/components/MusicLibrary.tsx', 'utf8');
for (const token of ['mvp43-music-empty-state', 'getMusicEmptyState', '当前位置：']) {
  if (!musicLibrary.includes(token)) throw new Error(`MusicLibrary missing MVP-43 token: ${token}`);
}

const playlistPage = fs.readFileSync('src/components/PlaylistPage.tsx', 'utf8');
for (const token of ['mvp43-playlist-detail-navigation', 'mvp43-playlist-empty-state', 'getPlaylistEmptyState', 'getPlaylistDetailSummary']) {
  if (!playlistPage.includes(token)) throw new Error(`PlaylistPage missing MVP-43 token: ${token}`);
}

console.log('MVP-43 collection empty states verification passed.');
