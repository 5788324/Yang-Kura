import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-78 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/playerPanelLayoutReviewService.ts',
  'src/components/LyricsPanel.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP78.md',
  'docs/PLAYER_PANEL_LAYOUT_REVIEW_MVP78.md',
  'docs/DEEPSEEK_REVIEW_RESULT_MVP77.md',
  'scripts/verify-mvp78-player-layout-review.mjs',
  'HANDOFF_MVP77_TO_MVP78.md',
  'PACKAGE_MANIFEST_MVP78_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-78 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(pkg.version)) fail(`package version expected 0.116.0-mvp78 or compatible MVP-79, got ${pkg.version}`);
if (!['0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.version) || !['0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.116.0-mvp78 or compatible MVP-79');
}
if (!pkg.scripts?.['verify:mvp78-player-layout-review']) fail('missing verify:mvp78-player-layout-review script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp78-player-layout-review')) fail('verify:all must include MVP-78 verifier');

for (const token of [
  'playerPanelLayoutReviewService',
  'Mvp78PlayerLayoutReviewModel',
  'mvp78-player-panel-layout-review',
  '经典详情页',
  '黑胶沉浸页',
  '歌词专注页',
  '不向 Renderer 暴露 absolutePath / file://',
]) {
  requireIncludes('src/services/playerPanelLayoutReviewService.ts', token);
}

for (const token of [
  'playerPanelLayoutReviewService',
  'mvp78PlayerLayout',
  'getSafeDuration',
  'getSafeProgress',
  'currentDisplayProgress',
  'safeVolumePercent',
  'mvp78-full-player-responsive-shell',
  'mvp78-player-header-wrap-safe',
  'mvp78-classic-visual-clamp',
  'mvp78-vinyl-size-clamp',
  'mvp78-lyrics-reading-width',
  'mvp78-bottom-control-safe-wrap',
  'disabled={totalDuration <= 0}',
]) {
  requireIncludes('src/components/LyricsPanel.tsx', token);
}

for (const token of [
  'playerPanelLayoutReviewService',
  'mvp78PlayerLayoutReview',
  'mvp78-player-panel-layout-review',
  'mvp78-player-layout-modes',
  'mvp78-player-layout-guardrails',
  'mvp78-player-layout-maintenance-marker',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of [
  'playerPanelLayoutReviewService',
  'Mvp78PlayerLayoutCheck',
  'Mvp78PlayerLayoutMode',
  'Mvp78PlayerLayoutReviewModel',
  'Mvp78PlayerLayoutTone',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP78.md', 'docs/PLAYER_PANEL_LAYOUT_REVIEW_MVP78.md', 'HANDOFF_MVP77_TO_MVP78.md', 'PACKAGE_MANIFEST_MVP78_HANDOFF.txt']) {
  for (const token of ['0.116.0-mvp78', 'MVP-78', '播放器', '布局', '歌词', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const token of ['DeepSeek', 'MVP-77', 'PASS', '0.116.0-mvp78', 'Electron moderate']) {
  requireIncludes('docs/DEEPSEEK_REVIEW_RESULT_MVP77.md', token);
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, '0.116.0-mvp78');
  requireIncludes(file, 'MVP-78');
  requireIncludes(file, '播放器大页');
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/playerPanelLayoutReviewService.ts').includes(forbidden)) {
    fail(`MVP-78 service should not introduce forbidden token: ${forbidden}`);
  }
}

console.log('MVP-78 player panel layout review verification passed.');
