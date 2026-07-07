import fs from 'node:fs';

const requiredFiles = [
  'src/services/libraryVisualUnityService.ts',
  'src/components/AsmrLibrary.tsx',
  'src/components/MusicLibrary.tsx',
  'src/components/PlaylistPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP53.md',
  'docs/LIBRARY_VISUAL_UNITY_MVP53.md',
  'scripts/verify-mvp53-library-visual-unity.mjs',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-53 file: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

if (!['0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.91.0-mvp53 or compatible MVP-54, got ${packageJson.version}`);
}
if (!['0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.version) || !['0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.91.0-mvp53 or compatible MVP-54');
}
for (const file of (['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version) ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt'] : packageJson.version === '0.94.0-mvp56' ? ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt'] : packageJson.version === '0.93.0-mvp55' ? ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt'] : packageJson.version === '0.92.0-mvp54' ? ['HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt'] : ['HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt'])) {
  if (!fs.existsSync(file)) throw new Error(`Missing current handoff/package file: ${file}`);
}
if (!packageJson.scripts?.['verify:mvp53-library-visual-unity']) {
  throw new Error('Missing verify:mvp53-library-visual-unity script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp53-library-visual-unity')) {
  throw new Error('verify:all does not include MVP-53 verifier');
}

const service = fs.readFileSync('src/services/libraryVisualUnityService.ts', 'utf8');
for (const token of [
  'libraryVisualUnityService',
  'LibraryVisualUnityModel',
  'getAsmrModel',
  'getMusicModel',
  'getPlaylistModel',
  'MVP-53 资源库视觉统一与回归小修',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`MVP-53 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-53 service should not introduce forbidden token: ${forbidden}`);
}

const asmr = fs.readFileSync('src/components/AsmrLibrary.tsx', 'utf8');
for (const token of [
  'libraryVisualUnityService',
  'mvp53-asmr-visual-unity',
  'asmrVisualUnity.chips',
  'asmrVisualUnity.secondaryHint',
]) {
  if (!asmr.includes(token)) throw new Error(`AsmrLibrary missing MVP-53 token: ${token}`);
}

const music = fs.readFileSync('src/components/MusicLibrary.tsx', 'utf8');
for (const token of [
  'libraryVisualUnityService',
  'mvp53-music-visual-unity',
  'musicVisualUnity.chips',
  'musicVisualUnity.secondaryHint',
]) {
  if (!music.includes(token)) throw new Error(`MusicLibrary missing MVP-53 token: ${token}`);
}

const playlist = fs.readFileSync('src/components/PlaylistPage.tsx', 'utf8');
for (const token of [
  'libraryVisualUnityService',
  'mvp53-playlist-visual-unity',
  'playlistVisualUnity.chips',
  '不会改动真实媒体文件',
]) {
  if (!playlist.includes(token)) throw new Error(`PlaylistPage missing MVP-53 token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'libraryVisualUnityService',
  'mvp53-library-visual-unity',
  '资源库视觉统一与回归小修',
  '不改扫描链路',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-53 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
for (const token of ['libraryVisualUnityService', 'LibraryVisualUnityModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-53 export token: ${token}`);
}

const docs = fs.readFileSync('docs/LIBRARY_VISUAL_UNITY_MVP53.md', 'utf8');
for (const token of ['资源库视觉统一', 'mvp53-asmr-visual-unity', 'mvp53-music-visual-unity', 'mvp53-playlist-visual-unity', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
  if (!docs.includes(token)) throw new Error(`MVP-53 docs missing token: ${token}`);
}

for (const staleFile of (packageJson.version === '0.93.0-mvp55' ? ['HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt', 'HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt', 'HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt'] : packageJson.version === '0.92.0-mvp54' ? ['HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt', 'HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt'] : ['HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt'])) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-52 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-53 library visual unity verification passed.');
