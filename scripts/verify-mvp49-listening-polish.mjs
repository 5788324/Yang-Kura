import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

const requiredFiles = [
  'src/services/listeningExperiencePolishService.ts',
  'src/components/Dashboard.tsx',
  'src/components/PlayerBar.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/CURRENT_ROADMAP_MVP49.md',
  'docs/LISTENING_EXPERIENCE_POLISH_MVP49.md',
  'scripts/verify-mvp49-listening-polish.mjs',
  ...(['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version)
    ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt']
    : packageJson.version === '0.94.0-mvp56'
    ? ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt']
    : packageJson.version === '0.93.0-mvp55'
    ? ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt']
    : packageJson.version === '0.92.0-mvp54'
    ? ['HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt']
    : packageJson.version === '0.91.0-mvp53'
    ? ['HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.90.0-mvp52'
    ? ['HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt']
    : packageJson.version === '0.89.0-mvp51'
    ? ['HANDOFF_MVP50_TO_MVP51.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt']
    : packageJson.version === '0.88.0-mvp50'
    ? ['HANDOFF_MVP49_TO_MVP50.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt']
    : ['HANDOFF_MVP48_TO_MVP49.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt']),
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-49 file: ${file}`);
}

if (!['0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.87.0-mvp49 or later compatible MVP-50, got ${packageJson.version}`);
}
if (!['0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.version) || !['0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.87.0-mvp49 or later compatible MVP-50');
}
if (!packageJson.scripts?.['verify:mvp49-listening-polish']) {
  throw new Error('Missing verify:mvp49-listening-polish script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp49-listening-polish')) {
  throw new Error('verify:all does not include MVP-49 verifier');
}

const service = fs.readFileSync('src/services/listeningExperiencePolishService.ts', 'utf8');
for (const token of [
  'listeningExperiencePolishService',
  'ListeningDashboardPolishModel',
  'PlayerBarPolishModel',
  '听音频入口',
  '本地音频',
  '有字幕',
  '策略',
]) {
  if (!service.includes(token)) throw new Error(`MVP-49 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3', 'file://']) {
  if (service.includes(forbidden)) throw new Error(`MVP-49 service should not introduce forbidden token: ${forbidden}`);
}

const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
for (const token of [
  'mvp49-home-media-focus',
  'listeningExperiencePolishService',
  '听音频入口',
  'mvp39-media-overview',
]) {
  if (!dashboard.includes(token)) throw new Error(`Dashboard missing MVP-49 token: ${token}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const token of [
  'mvp49-player-status-strip',
  'listeningExperiencePolishService',
  '策略：',
  'mvp49Player.statusBadges',
]) {
  if (!playerBar.includes(token)) throw new Error(`PlayerBar missing MVP-49 token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'mvp49-listening-polish',
  '播放器与首页视觉精修',
  '底部播放器状态条',
  '不改变扫描、索引、播放、字幕和打包链路',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-49 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
if (!serviceIndex.includes('listeningExperiencePolishService')) {
  throw new Error('services/index.ts must export listeningExperiencePolishService');
}

const docs = fs.readFileSync('docs/LISTENING_EXPERIENCE_POLISH_MVP49.md', 'utf8');
for (const token of ['播放器与首页视觉精修', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://', 'mpv']) {
  if (!docs.includes(token)) throw new Error(`MVP-49 docs missing token: ${token}`);
}

for (const staleFile of ['PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md']) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-48 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-49 listening polish verification passed.');
