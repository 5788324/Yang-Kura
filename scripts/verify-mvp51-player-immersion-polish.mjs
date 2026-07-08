import fs from 'node:fs';

const requiredFiles = [
  'src/services/playerImmersionPolishService.ts',
  'src/components/LyricsPanel.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP51.md',
  'docs/PLAYER_IMMERSION_POLISH_MVP51.md',
  'scripts/verify-mvp51-player-immersion-polish.mjs',
  ...(['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(JSON.parse(fs.readFileSync('package.json', 'utf8')).version)
    ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.94.0-mvp56'
    ? ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.93.0-mvp55'
    ? ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.92.0-mvp54'
    ? ['HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.91.0-mvp53'
    ? ['HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.90.0-mvp52'
    ? ['HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt']
    : ['HANDOFF_MVP50_TO_MVP51.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt']),
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-51 file: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

if (!['0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.89.0-mvp51 or later compatible MVP-52, got ${packageJson.version}`);
}
if (!['0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.version) || !['0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.89.0-mvp51 or later compatible MVP-52');
}
if (!packageJson.scripts?.['verify:mvp51-player-immersion-polish']) {
  throw new Error('Missing verify:mvp51-player-immersion-polish script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp51-player-immersion-polish')) {
  throw new Error('verify:all does not include MVP-51 verifier');
}

const service = fs.readFileSync('src/services/playerImmersionPolishService.ts', 'utf8');
for (const token of [
  'playerImmersionPolishService',
  'PlayerImmersionPanelModel',
  'MVP-51: full player immersion polish',
  '沉浸播放',
  '暂无歌词或字幕',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`MVP-51 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-51 service should not introduce forbidden token: ${forbidden}`);
}

const lyricsPanel = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
for (const token of [
  'playerImmersionPolishService',
  'mvp51-player-immersion-rail',
  'mvp51-lyrics-empty-state',
  'mvp50-lyrics-visual-header',
]) {
  if (!lyricsPanel.includes(token)) throw new Error(`LyricsPanel missing MVP-51 token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'playerImmersionPolishService',
  'mvp51-player-immersion-polish',
  '播放器沉浸页继续精修',
  '不改扫描链路',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-51 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
for (const token of ['playerImmersionPolishService', 'PlayerImmersionPanelModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-51 export token: ${token}`);
}

const docs = fs.readFileSync('docs/PLAYER_IMMERSION_POLISH_MVP51.md', 'utf8');
for (const token of ['播放器沉浸页继续精修', 'mvp51-player-immersion-rail', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
  if (!docs.includes(token)) throw new Error(`MVP-51 docs missing token: ${token}`);
}

for (const staleFile of (JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.90.0-mvp52'
  ? ['HANDOFF_MVP50_TO_MVP51.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt']
  : ['HANDOFF_MVP49_TO_MVP50.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt'])) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-50 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-51 player immersion polish verification passed.');
