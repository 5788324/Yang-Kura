import fs from 'node:fs';

const requiredFiles = [
  'src/services/betaCloseoutService.ts',
  'src/components/DiagnosticsPage.tsx',
  'docs/CURRENT_ROADMAP_MVP48.md',
  'docs/BETA_0_1_CLOSEOUT_MVP48.md',
  'scripts/verify-mvp48-beta-closeout.mjs',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-48 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
if (!['0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.86.0-mvp48 or later compatible MVP-49, got ${packageJson.version}`);
}
if (!['0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.version) || !['0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.86.0-mvp48 or later compatible MVP-49');
}
const expectedHandoffFiles = ['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)
  ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt']
  : packageJson.version === '0.94.0-mvp56'
  ? ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt']
  : packageJson.version === '0.93.0-mvp55'
  ? ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt']
  : packageJson.version === '0.92.0-mvp54'
  ? ['HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt']
  : packageJson.version === '0.91.0-mvp53'
  ? ['HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt']
  : packageJson.version === '0.90.0-mvp52'
  ? ['HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt']
  : packageJson.version === '0.89.0-mvp51'
  ? ['HANDOFF_MVP50_TO_MVP51.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt']
  : packageJson.version === '0.88.0-mvp50'
  ? ['HANDOFF_MVP49_TO_MVP50.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt']
  : packageJson.version === '0.87.0-mvp49'
  ? ['HANDOFF_MVP48_TO_MVP49.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt']
  : ['HANDOFF_MVP47_TO_MVP48.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt'];
for (const file of expectedHandoffFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing current handoff/package file: ${file}`);
}

if (!packageJson.scripts?.['verify:mvp48-beta-closeout']) {
  throw new Error('Missing verify:mvp48-beta-closeout script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp48-beta-closeout')) {
  throw new Error('verify:all does not include MVP-48 verifier');
}

const service = fs.readFileSync('src/services/betaCloseoutService.ts', 'utf8');
for (const token of [
  'betaCloseoutService',
  'BetaCloseoutModel',
  'Beta 0.1 阶段收口',
  '个人可用 Beta 0.1',
  '本地资源库闭环',
  '本地听音频闭环',
  'Windows 打包链路',
  'Renderer 不接收 absolutePath',
  'Renderer 不接收 file://',
  '不删除、移动、重命名真实媒体文件',
]) {
  if (!service.includes(token)) throw new Error(`MVP-48 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-48 service should not introduce forbidden token: ${forbidden}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'mvp48-beta-closeout',
  'betaCloseoutService',
  'Beta 0.1 阶段收口',
  '个人可用 Beta 0.1',
  'Beta 回归重点',
  'Beta 后置功能',
  '继续保持的边界',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-48 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
if (!serviceIndex.includes('betaCloseoutService')) {
  throw new Error('services/index.ts must export betaCloseoutService');
}

const docs = fs.readFileSync('docs/BETA_0_1_CLOSEOUT_MVP48.md', 'utf8');
for (const token of ['个人可用 Beta 0.1', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://', 'mpv']) {
  if (!docs.includes(token)) throw new Error(`MVP-48 docs missing token: ${token}`);
}

const staleHandoffFiles = packageJson.version === '0.92.0-mvp54'
  ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt', 'HANDOFF_MVP48_TO_MVP49.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt', 'HANDOFF_MVP49_TO_MVP50.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt', 'HANDOFF_MVP50_TO_MVP51.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt', 'HANDOFF_MVP51_TO_MVP52.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt', 'HANDOFF_MVP52_TO_MVP53.md']
  : packageJson.version === '0.91.0-mvp53'
  ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt', 'HANDOFF_MVP48_TO_MVP49.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt', 'HANDOFF_MVP49_TO_MVP50.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt', 'HANDOFF_MVP50_TO_MVP51.md', 'PACKAGE_MANIFEST_MVP52_HANDOFF.txt', 'HANDOFF_MVP51_TO_MVP52.md']
  : packageJson.version === '0.90.0-mvp52'
  ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt', 'HANDOFF_MVP48_TO_MVP49.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt', 'HANDOFF_MVP49_TO_MVP50.md', 'PACKAGE_MANIFEST_MVP51_HANDOFF.txt', 'HANDOFF_MVP50_TO_MVP51.md']
  : packageJson.version === '0.89.0-mvp51'
  ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt', 'HANDOFF_MVP48_TO_MVP49.md', 'PACKAGE_MANIFEST_MVP50_HANDOFF.txt', 'HANDOFF_MVP49_TO_MVP50.md']
  : packageJson.version === '0.88.0-mvp50'
  ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md', 'PACKAGE_MANIFEST_MVP49_HANDOFF.txt', 'HANDOFF_MVP48_TO_MVP49.md']
  : packageJson.version === '0.87.0-mvp49'
  ? ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md', 'PACKAGE_MANIFEST_MVP48_HANDOFF.txt', 'HANDOFF_MVP47_TO_MVP48.md']
  : ['PACKAGE_MANIFEST_MVP47_HANDOFF.txt', 'HANDOFF_MVP46_TO_MVP47.md'];
for (const staleFile of staleHandoffFiles) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-47 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-48 beta closeout verification passed.');
