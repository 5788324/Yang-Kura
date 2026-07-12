import fs from 'node:fs';

const requiredFiles = [
  'src/services/libraryBrowseSurfaceService.ts',
  'src/components/AsmrLibrary.tsx',
  'src/components/MusicLibrary.tsx',
  'docs/CURRENT_ROADMAP_MVP46.md',
  'docs/LIBRARY_BROWSE_CLEANUP_MVP46.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-46 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.84.0-mvp46 or later compatible MVP-47, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp46-library-browse-cleanup']) {
  throw new Error('Missing verify:mvp46-library-browse-cleanup script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp46-library-browse-cleanup')) {
  throw new Error('verify:all does not include MVP-46 verifier');
}

const service = fs.readFileSync('src/services/libraryBrowseSurfaceService.ts', 'utf8');
for (const token of [
  'libraryBrowseSurfaceService',
  'AsmrBrowseSurfaceModel',
  'MusicBrowseSurfaceModel',
  'getAsmrSurfaceModel',
  'getMusicSurfaceModel',
  '音声库浏览',
  '音乐库浏览',
  '显示',
]) {
  if (!service.includes(token)) throw new Error(`MVP-46 service missing token: ${token}`);
}
for (const forbidden of ['absolutePath', 'file://', 'fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'ASMR.one', 'DLsite', 'mpv']) {
  if (service.includes(forbidden)) throw new Error(`MVP-46 service should not introduce forbidden token: ${forbidden}`);
}

const asmr = fs.readFileSync('src/components/AsmrLibrary.tsx', 'utf8');
for (const token of [
  'mvp46-asmr-browse-cleanup',
  'mvp46-asmr-browse-summary',
  'libraryBrowseSurfaceService',
  '重置筛选',
  '封面浏览',
  '列表浏览',
]) {
  if (!asmr.includes(token)) throw new Error(`AsmrLibrary missing MVP-46 token: ${token}`);
}
for (const stale of ['物理文件大小', '表格详细列表管理模式', '封面墙美学浏览模式']) {
  if (asmr.includes(stale)) throw new Error(`AsmrLibrary still contains tool-like copy: ${stale}`);
}
const music = fs.readFileSync('src/components/MusicLibrary.tsx', 'utf8');
for (const token of [
  'mvp46-music-browse-summary',
  'libraryBrowseSurfaceService',
  '音乐库',
  '重置筛选',
  '点击曲目播放，视频和图片走外部打开',
]) {
  if (!music.includes(token)) throw new Error(`MusicLibrary missing MVP-46 token: ${token}`);
}
for (const stale of ['流行音乐媒体库', 'foldersMock']) {
  if (music.includes(stale)) throw new Error(`MusicLibrary still contains stale copy/name: ${stale}`);
}
for (const legacy of ['mvp40-music-library-overview', 'mvp43-music-empty-state']) {
  if (!music.includes(legacy)) throw new Error(`MusicLibrary should keep compatibility marker: ${legacy}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
if (!serviceIndex.includes('libraryBrowseSurfaceService')) {
  throw new Error('services/index.ts must export libraryBrowseSurfaceService');
}

const docs = fs.readFileSync('docs/LIBRARY_BROWSE_CLEANUP_MVP46.md', 'utf8');
for (const token of ['音声库', '音乐库', '不接 SQLite', '不删除 / 移动 / 重命名', 'Renderer 不接收 absolutePath', 'Renderer 不接收 file://']) {
  if (!docs.includes(token)) throw new Error(`MVP-46 docs missing token: ${token}`);
}

for (const staleFile of ['PACKAGE_MANIFEST_MVP45_HANDOFF.txt', 'HANDOFF_MVP44_TO_MVP45.md']) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale handoff/package cleanup failed: ${staleFile}`);
}
const currentHandoffFiles = ['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)
  ? ['PACKAGE_MANIFEST_MVP57_HANDOFF.txt', 'HANDOFF_MVP56_TO_MVP57.md']
  : packageJson.version === '0.94.0-mvp56'
  ? ['PACKAGE_MANIFEST_MVP56_HANDOFF.txt', 'HANDOFF_MVP55_TO_MVP56.md']
  : packageJson.version === '0.93.0-mvp55'
  ? ['PACKAGE_MANIFEST_MVP55_HANDOFF.txt', 'HANDOFF_MVP54_TO_MVP55.md']
  : packageJson.version === '0.92.0-mvp54'
  ? ['PACKAGE_MANIFEST_MVP54_HANDOFF.txt', 'HANDOFF_MVP53_TO_MVP54.md']
  : packageJson.version === '0.91.0-mvp53'
  ? ['PACKAGE_MANIFEST_MVP53_HANDOFF.txt', 'HANDOFF_MVP52_TO_MVP53.md']
  : packageJson.version === '0.90.0-mvp52'
  ? ['PACKAGE_MANIFEST_MVP52_HANDOFF.txt', 'HANDOFF_MVP51_TO_MVP52.md']
  : packageJson.version === '0.89.0-mvp51'
  ? ['PACKAGE_MANIFEST_MVP51_HANDOFF.txt', 'HANDOFF_MVP50_TO_MVP51.md']
  : packageJson.version === '0.88.0-mvp50'
  ? ['PACKAGE_MANIFEST_MVP50_HANDOFF.txt', 'HANDOFF_MVP49_TO_MVP50.md']
  : packageJson.version === '0.87.0-mvp49'
  ? ['PACKAGE_MANIFEST_MVP49_HANDOFF.txt', 'HANDOFF_MVP48_TO_MVP49.md']
  : packageJson.version === '0.86.0-mvp48'
    ? ['PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md']
  : packageJson.version === '0.85.0-mvp47'
    ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md']
    : ['PACKAGE_MANIFEST_MVP46_HANDOFF.txt', 'HANDOFF_MVP45_TO_MVP46.md'];
for (const currentFile of currentHandoffFiles) {
  if (!fs.existsSync(currentFile)) throw new Error(`Missing current handoff/package file: ${currentFile}`);
}

console.log('MVP-46 library browse cleanup verification passed.');
