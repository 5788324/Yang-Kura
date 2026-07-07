import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-71 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/userFacingSimplificationService.ts',
  'src/components/Dashboard.tsx',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/UI_SIMPLIFICATION_MVP71.md',
  'scripts/verify-mvp71-ui-simplification.mjs',
  'HANDOFF_MVP70_TO_MVP71.md',
  'PACKAGE_MANIFEST_MVP71_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-71 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version)) fail(`package version expected 0.109.0-mvp71 or compatible MVP-72, got ${pkg.version}`);
if (!['0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(lock.version) || !['0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.109.0-mvp71 or compatible MVP-72');
}
if (!pkg.scripts?.['verify:mvp71-ui-simplification']) fail('missing verify:mvp71-ui-simplification script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp71-ui-simplification')) fail('verify:all must include MVP-71 verifier');

for (const token of [
  'userFacingSimplificationService',
  'MVP-71 主界面简化与 AI 维护区收口',
  '继续播放',
  '最近播放',
  '最近加入',
  '音声库入口',
  '音乐库入口',
  '歌单入口',
  'AI 维护区',
  '开发者详情',
  '历史验证',
  '高级诊断',
  '不向 Renderer 暴露 absolutePath',
  '不向 Renderer 暴露 file://',
]) {
  requireIncludes('src/services/userFacingSimplificationService.ts', token);
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/userFacingSimplificationService.ts').includes(forbidden)) {
    fail(`MVP-71 service should not introduce forbidden token: ${forbidden}`);
  }
}

for (const token of [
  'userFacingSimplificationService',
  'mvp71-home-user-facing-simplification',
  'mvp71MainEntryCards.map',
  'handleMvp71EntryClick',
  '继续播放',
  '最近播放',
  '最近加入',
  '音声库入口',
  '音乐库入口',
  '歌单入口',
]) {
  requireIncludes('src/components/Dashboard.tsx', token);
}

for (const token of [
  'userFacingSimplificationService',
  'mvp71-settings-user-facing-simplification',
  '<details id="mvp71-settings-ai-maintenance-area"',
  'AI 维护区 / 开发者详情',
  '默认折叠',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}

const settings = read('src/components/SettingsPage.tsx');
if (settings.includes('<details id="mvp71-settings-ai-maintenance-area" open')) {
  fail('Settings MVP-71 AI maintenance details must be collapsed by default');
}

for (const token of [
  'userFacingSimplificationService',
  '<details id="mvp71-ai-maintenance-zone"',
  'mvp71Simplification.maintenanceBuckets.map',
  'AI 维护区',
  '开发者详情',
  '历史验证',
  '高级诊断',
  '默认折叠',
  'mvp44-diagnostics-separation',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
if (diagnostics.includes('<details id="mvp71-ai-maintenance-zone" open')) {
  fail('Diagnostics MVP-71 AI maintenance zone must be collapsed by default');
}

for (const token of [
  'userFacingSimplificationService',
  'Mvp71UserFacingSimplificationModel',
  'Mvp71MaintenanceBucket',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/UI_SIMPLIFICATION_MVP71.md', 'HANDOFF_MVP70_TO_MVP71.md', 'PACKAGE_MANIFEST_MVP71_HANDOFF.txt']) {
  for (const token of ['0.109.0-mvp71', 'MVP-71', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md']) {
  requireIncludes(file, '0.109.0-mvp71');
  requireIncludes(file, 'MVP-71');
}

console.log('MVP-71 UI simplification verification passed.');
