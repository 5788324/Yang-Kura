import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-72 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/dailySurfaceCleanupService.ts',
  'src/components/Dashboard.tsx',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP72.md',
  'docs/UI_DAILY_SURFACE_CLEANUP_MVP72.md',
  'scripts/verify-mvp72-daily-surface-cleanup.mjs',
  'HANDOFF_MVP71_TO_MVP72.md',
  'PACKAGE_MANIFEST_MVP72_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-72 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version)) fail(`package version expected 0.110.0-mvp72 or compatible MVP-73, got ${pkg.version}`);
if (!['0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(lock.version) || !['0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.110.0-mvp72 or compatible MVP-73');
}
if (!pkg.scripts?.['verify:mvp72-daily-surface-cleanup']) fail('missing verify:mvp72-daily-surface-cleanup script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp72-daily-surface-cleanup')) fail('verify:all must include MVP-72 verifier');

for (const token of [
  'dailySurfaceCleanupService',
  'MVP-72 日常界面继续收口',
  '日常诊断',
  '首页先服务听音频',
  '普通页面不显示 MVP / verifier / IPC / Scanner / Contract 等工程词',
  '不向 Renderer 暴露 absolutePath',
  '不向 Renderer 暴露 file://',
]) {
  requireIncludes('src/services/dailySurfaceCleanupService.ts', token);
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/dailySurfaceCleanupService.ts').includes(forbidden)) {
    fail(`MVP-72 service should not introduce forbidden token: ${forbidden}`);
  }
}

for (const token of [
  'dailySurfaceCleanupService',
  'mvp72DailySurface',
  'mvp72-home-daily-surface-cleanup',
  '日常首页',
  '日常使用',
]) {
  requireIncludes('src/components/Dashboard.tsx', token);
}

if (read('src/components/Dashboard.tsx').includes('MVP-71 · 日常首页')) {
  fail('Dashboard should not show MVP stage label on daily home surface');
}

for (const token of [
  'dailySurfaceCleanupService',
  'mvp72-settings-daily-workflow-cleanup',
  '设置页精简',
  '<details id="mvp71-settings-ai-maintenance-area"',
  '默认折叠',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}
if (read('src/components/SettingsPage.tsx').includes('MVP-71 · 设置页精简')) {
  fail('Settings daily surface should not show MVP stage label');
}
if (read('src/components/SettingsPage.tsx').includes('<details id="mvp71-settings-ai-maintenance-area" open')) {
  fail('Settings AI maintenance details must remain collapsed by default');
}

for (const token of [
  'dailySurfaceCleanupService',
  'mvp72-daily-diagnostics-summary',
  '日常诊断',
  '工程细节已折叠',
  '<details id="mvp71-ai-maintenance-zone"',
  'AI 维护区',
  'mvp71Simplification.maintenanceBuckets.map',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}
if (read('src/components/DiagnosticsPage.tsx').includes('<details id="mvp71-ai-maintenance-zone" open')) {
  fail('Diagnostics AI maintenance zone must remain collapsed by default');
}

for (const token of [
  'dailySurfaceCleanupService',
  'Mvp72DailySurfaceCleanupModel',
  'Mvp72MaintenanceGroup',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP72.md', 'docs/UI_DAILY_SURFACE_CLEANUP_MVP72.md', 'HANDOFF_MVP71_TO_MVP72.md', 'PACKAGE_MANIFEST_MVP72_HANDOFF.txt']) {
  for (const token of ['0.110.0-mvp72', 'MVP-72', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md']) {
  requireIncludes(file, '0.110.0-mvp72');
  requireIncludes(file, 'MVP-72');
}

console.log('MVP-72 daily surface cleanup verification passed.');
