import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-73 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/playerDailyVisualFocusService.ts',
  'src/components/LyricsPanel.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP73.md',
  'docs/PLAYER_DAILY_VISUAL_FOCUS_MVP73.md',
  'scripts/verify-mvp73-player-daily-visual-focus.mjs',
  'HANDOFF_MVP72_TO_MVP73.md',
  'PACKAGE_MANIFEST_MVP73_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-73 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(pkg.version)) fail(`package version expected 0.111.0-mvp73 or compatible MVP-74, got ${pkg.version}`);
if (!['0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.version) || !['0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.111.0-mvp73 or compatible MVP-74');
}
if (!pkg.scripts?.['verify:mvp73-player-daily-visual-focus']) fail('missing verify:mvp73-player-daily-visual-focus script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp73-player-daily-visual-focus')) fail('verify:all must include MVP-73 verifier');

for (const token of [
  'playerDailyVisualFocusService',
  'Mvp73PlayerDailyVisualFocusModel',
  'MVP-73 marker',
  '播放器表层只展示听音信息',
  '工程、verifier、MVP 历史、Electron、IPC、Scanner、Contract 信息不进入播放器可见区域',
  '不接 SQLite',
  '不删除、移动、重命名真实媒体文件',
  'absolutePath',
  'file://',
]) {
  requireIncludes('src/services/playerDailyVisualFocusService.ts', token);
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/playerDailyVisualFocusService.ts').includes(forbidden)) {
    fail(`MVP-73 service should not introduce forbidden token: ${forbidden}`);
  }
}

for (const token of [
  'playerDailyVisualFocusService',
  'mvp73PlayerFocus',
  'mvp73-player-daily-visual-focus',
  'mvp73-player-maintenance-markers',
  'mvp73-classic-player-detail-focus',
  'mvp73-vinyl-player-visual-focus',
  'mvp73-lyrics-mode-bottom-context',
  '工程、verifier、MVP 历史、Electron、IPC、Scanner、Contract 信息继续后置到诊断页',
]) {
  requireIncludes('src/components/LyricsPanel.tsx', token);
}

for (const token of [
  'playerDailyVisualFocusService',
  'Mvp73PlayerDailyVisualFocusModel',
  'Mvp73PlayerFocusCard',
  'Mvp73PlayerFocusChip',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP73.md', 'docs/PLAYER_DAILY_VISUAL_FOCUS_MVP73.md', 'HANDOFF_MVP72_TO_MVP73.md', 'PACKAGE_MANIFEST_MVP73_HANDOFF.txt']) {
  for (const token of ['0.111.0-mvp73', 'MVP-73', '播放器大页', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md']) {
  requireIncludes(file, '0.111.0-mvp73');
  requireIncludes(file, 'MVP-73');
}

console.log('MVP-73 player daily visual focus verification passed.');
