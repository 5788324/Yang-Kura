import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-74 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/playerBarDailyCleanupService.ts',
  'src/components/PlayerBar.tsx',
  'src/components/Dashboard.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP74.md',
  'docs/PLAYERBAR_HOME_CLEANUP_MVP74.md',
  'scripts/verify-mvp74-playerbar-home-cleanup.mjs',
  'HANDOFF_MVP73_TO_MVP74.md',
  'PACKAGE_MANIFEST_MVP74_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-74 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'];
if (!compatibleVersions.includes(pkg.version)) fail(`package version expected 0.112.0-mvp74 or compatible MVP-75, got ${pkg.version}`);
if (!compatibleVersions.includes(lock.version) || !compatibleVersions.includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.112.0-mvp74 or compatible MVP-75');
}
if (!pkg.scripts?.['verify:mvp74-playerbar-home-cleanup']) fail('missing verify:mvp74-playerbar-home-cleanup script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp74-playerbar-home-cleanup')) fail('verify:all must include MVP-74 verifier');

for (const token of [
  'playerBarDailyCleanupService',
  'Mvp74PlayerBarDailyCleanupModel',
  'Mvp74HomeDailyCleanupModel',
  'MVP-74 verification note',
  '播放器底栏和首页日常入口继续减工程感',
  '不接 SQLite',
  '不删除、移动、重命名真实媒体文件',
  'absolutePath',
  'file://',
]) {
  requireIncludes('src/services/playerBarDailyCleanupService.ts', token);
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/playerBarDailyCleanupService.ts').includes(forbidden)) {
    fail(`MVP-74 service should not introduce forbidden token: ${forbidden}`);
  }
}

for (const token of [
  'playerBarDailyCleanupService',
  'mvp74PlayerBar',
  'mvp74-playerbar-daily-control-strip',
  'mvp74-playerbar-maintenance-markers',
  'mvp49-player-status-strip',
  'mvp54-player-regression-strip',
  'mvp59-player-compact-strip',
]) {
  requireIncludes('src/components/PlayerBar.tsx', token);
}

for (const token of [
  'playerBarDailyCleanupService',
  'mvp74HomeCleanup',
  'mvp74-home-daily-entry-cleanup',
  'mvp74-home-maintenance-markers',
  'mvp59-home-beta-polish',
  'mvp39-media-overview',
  'className="sr-only"',
]) {
  requireIncludes('src/components/Dashboard.tsx', token);
}

for (const token of [
  'playerBarDailyCleanupService',
  'Mvp74DailyControlTone',
  'Mvp74HomeDailyCleanupModel',
  'Mvp74PlayerBarDailyCleanupModel',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP74.md', 'docs/PLAYERBAR_HOME_CLEANUP_MVP74.md', 'HANDOFF_MVP73_TO_MVP74.md', 'PACKAGE_MANIFEST_MVP74_HANDOFF.txt']) {
  for (const token of ['0.112.0-mvp74', 'MVP-74', '播放器底栏', '首页', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, '0.112.0-mvp74');
  requireIncludes(file, 'MVP-74');
}

console.log('MVP-74 player bar and home cleanup verification passed.');
