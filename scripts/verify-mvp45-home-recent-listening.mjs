import fs from 'node:fs';

const requiredFiles = [
  'src/services/homeRecentListeningService.ts',
  'src/components/Dashboard.tsx',
  'docs/CURRENT_ROADMAP_MVP45.md',
  'docs/HOME_RECENT_LISTENING_MVP45.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-45 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.83.0-mvp45 or later compatible MVP-46, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp45-home-recent-listening']) {
  throw new Error('Missing verify:mvp45-home-recent-listening script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp45-home-recent-listening')) {
  throw new Error('verify:all does not include MVP-45 verifier');
}

const service = fs.readFileSync('src/services/homeRecentListeningService.ts', 'utf8');
for (const token of [
  'homeRecentListeningService',
  'HomeContinueListeningCard',
  'HomeRecentListeningItem',
  'HomeQuickEntryCard',
  'getModel',
  '继续听上次的内容',
  '最近播放记录',
  '首页优先放播放入口和最近记录',
]) {
  if (!service.includes(token)) throw new Error(`MVP-45 service missing token: ${token}`);
}
for (const forbidden of ['absolutePath', 'file://', 'fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'ASMR.one', 'DLsite', 'mpv']) {
  if (service.includes(forbidden)) throw new Error(`MVP-45 service should not introduce forbidden token: ${forbidden}`);
}

const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
for (const token of [
  'mvp45-home-continue-listening',
  'mvp45-home-recent-listening',
  'mvp45-home-quick-entry',
  'homeRecentListeningService',
  '继续播放',
  '最近播放',
  '导入资源库',
  '本地资源库状态',
]) {
  if (!dashboard.includes(token)) throw new Error(`Dashboard missing MVP-45 token: ${token}`);
}
for (const legacyToken of ['mvp42-daily-listening-surface', 'mvp39-media-overview', '今日入口']) {
  if (!dashboard.includes(legacyToken)) throw new Error(`Dashboard must keep compatible marker: ${legacyToken}`);
}
for (const stale of ['Scanner', 'Contract', 'Dry-run', 'Fallback', 'Engine', 'Bridge', 'SQLite Session']) {
  if (dashboard.includes(stale)) throw new Error(`Dashboard still exposes engineering copy: ${stale}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
if (!serviceIndex.includes('homeRecentListeningService')) {
  throw new Error('services/index.ts must export homeRecentListeningService');
}

const docs = fs.readFileSync('docs/HOME_RECENT_LISTENING_MVP45.md', 'utf8');
for (const token of ['首页', '最近播放', '继续播放', '不接 SQLite', '不删除 / 移动 / 重命名']) {
  if (!docs.includes(token)) throw new Error(`MVP-45 docs missing token: ${token}`);
}

console.log('MVP-45 home/recent listening verification passed.');
