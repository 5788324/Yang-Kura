import fs from 'node:fs';

const requiredFiles = [
  'src/services/dailyListeningSurfaceService.ts',
  'src/components/Dashboard.tsx',
  'src/App.tsx',
  'docs/CURRENT_ROADMAP_MVP42.md',
  'docs/DAILY_LISTENING_SURFACE_MVP42.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-42 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.80.0-mvp42 or later compatible MVP-43, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp42-daily-listening-surface']) {
  throw new Error('Missing verify:mvp42-daily-listening-surface script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp42-daily-listening-surface')) {
  throw new Error('verify:all does not include MVP-42 verifier');
}

const service = fs.readFileSync('src/services/dailyListeningSurfaceService.ts', 'utf8');
for (const token of ['getQueueSummary', 'getDashboardModel', 'getTrackBadges', 'getBadgeClass', 'DailyListeningQueueSummary']) {
  if (!service.includes(token)) {
    throw new Error(`dailyListeningSurfaceService missing ${token}`);
  }
}
for (const forbidden of ['absolutePath', 'file://', 'fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'ASMR.one', 'DLsite']) {
  if (service.includes(forbidden)) {
    throw new Error(`MVP-42 service should not introduce forbidden token: ${forbidden}`);
  }
}

const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
for (const token of ['mvp42-daily-listening-surface', 'dailyListeningSurfaceService', '日常听音频']) {
  if (!dashboard.includes(token)) {
    throw new Error(`Dashboard missing MVP-42 token: ${token}`);
  }
}
if (dashboard.includes('Scanner') || dashboard.includes('Contract')) {
  throw new Error('Dashboard should not expose scanner/contract wording in the main daily-listening surface');
}

const app = fs.readFileSync('src/App.tsx', 'utf8');
for (const token of ['mvp42-queue-drawer-surface', 'queueSurface']) {
  if (!app.includes(token)) {
    throw new Error(`App missing MVP-42 token: ${token}`);
  }
}
if (!app.includes('日常播放 / 媒体库体验') && !app.includes('详情导航 / 媒体库体验')) {
  throw new Error('App missing compatible media-library header copy');
}
for (const stale of ['队列为空，快双击音声添加']) {
  if (app.includes(stale)) {
    throw new Error(`App still contains stale queue copy: ${stale}`);
  }
}

console.log('MVP-42 daily listening surface verification passed.');
