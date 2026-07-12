import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-75 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/diagnosticsHistoryFoldService.ts',
  'src/components/DiagnosticsPage.tsx',
  'src/components/PlayerBar.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP75.md',
  'docs/DIAGNOSTICS_HISTORY_FOLD_MVP75.md',
  'scripts/verify-mvp75-diagnostics-history-fold.mjs',
  'HANDOFF_MVP74_TO_MVP75.md',
  'PACKAGE_MANIFEST_MVP75_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-75 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'];
if (!compatibleVersions.includes(pkg.version)) fail(`package version expected 0.113.0-mvp75 or later compatible MVP-76, got ${pkg.version}`);
if (!compatibleVersions.includes(lock.version) || !compatibleVersions.includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.113.0-mvp75 or later compatible MVP-76');
}
if (!pkg.scripts?.['verify:mvp75-diagnostics-history-fold']) fail('missing verify:mvp75-diagnostics-history-fold script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp75-diagnostics-history-fold')) fail('verify:all must include MVP-75 verifier');

for (const token of [
  'diagnosticsHistoryFoldService',
  'Mvp75DiagnosticsHistoryFoldModel',
  'Mvp75DiagnosticsHistoryGroup',
  'MVP-75 verification note',
  '诊断页 MVP 历史默认折叠',
  '播放器进度条',
  '不接 SQLite',
  '不删除、移动、重命名真实媒体文件',
  'absolutePath',
  'file://',
]) {
  requireIncludes('src/services/diagnosticsHistoryFoldService.ts', token);
}

for (const token of [
  'diagnosticsHistoryFoldService',
  'mvp75DiagnosticsHistory',
  'mvp75-diagnostics-history-folded',
  'mvp75-diagnostics-default-summary',
  'mvp75-diagnostics-phase-groups',
  'mvp75-diagnostics-maintenance-markers',
  '<details',
  '<summary',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of [
  'mvp75-playerbar-progress-stability',
  'pendingSeekValueRef',
  'getSafeDuration',
  'clamp',
  'Number.isFinite',
  'transitionProperty',
  'disabled={totalDuration <= 0}',
]) {
  requireIncludes('src/components/PlayerBar.tsx', token);
}

for (const token of [
  'diagnosticsHistoryFoldService',
  'Mvp75DiagnosticsHistoryFoldModel',
  'Mvp75DiagnosticsHistoryGroup',
  'Mvp75DiagnosticsHistoryTone',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP75.md', 'docs/DIAGNOSTICS_HISTORY_FOLD_MVP75.md', 'HANDOFF_MVP74_TO_MVP75.md', 'PACKAGE_MANIFEST_MVP75_HANDOFF.txt']) {
  for (const token of ['0.113.0-mvp75', 'MVP-75', '诊断页', '进度条', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, '0.113.0-mvp75');
  requireIncludes(file, 'MVP-75');
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/diagnosticsHistoryFoldService.ts').includes(forbidden)) {
    fail(`MVP-75 service should not introduce forbidden token: ${forbidden}`);
  }
}

console.log('MVP-75 diagnostics history fold and playerbar progress stability verification passed.');
