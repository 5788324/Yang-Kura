import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-68 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(pkg.version)) fail(`package version expected 0.106.0-mvp68 or compatible later MVP, got ${pkg.version}`);
if (!['0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.version) || !['0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.packages?.['']?.version)) fail('package-lock root version must be 0.106.0-mvp68 or compatible later MVP');
if (!pkg.scripts?.['verify:mvp68-beta-rc-user-guide']) fail('package.json missing verify:mvp68-beta-rc-user-guide');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp68-beta-rc-user-guide')) fail('verify:all must include MVP-68 verifier');

for (const file of [
  'src/services/betaRcUserGuideService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP68.md',
  'docs/BETA_RC_USER_GUIDE_MVP68.md',
  'HANDOFF_MVP67_TO_MVP68.md',
  'PACKAGE_MANIFEST_MVP68_HANDOFF.txt',
]) {
  if (!exists(file)) fail(`missing MVP-68 file: ${file}`);
}

for (const token of [
  'betaRcUserGuideService',
  'MVP-68 Beta 0.1 RC 使用说明收口',
  'Beta 0.1 RC 使用说明',
  '打包说明',
  '诊断页折叠计划',
  '选择目录 → 扫描并应用 → 播放',
  '真实样本链路已通过',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不删除 / 移动 / 重命名真实媒体文件',
]) {
  requireIncludes('src/services/betaRcUserGuideService.ts', token);
}

for (const token of [
  'betaRcUserGuideService',
  'mvp68-beta-rc-user-guide',
  'mvp68BetaRcUserGuide.cards.map',
  'mvp68BetaRcUserGuide.firstRunGuide.map',
  'mvp68BetaRcUserGuide.packagingGuide.map',
  'mvp68BetaRcUserGuide.diagnosticsFoldPlan.map',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}

for (const token of [
  'betaRcUserGuideService',
  'MVP-68 verifier marker',
  'mvp68-beta-rc-user-guide',
  'toArray(mvp68BetaRcUserGuide.cards).map',
  'toArray(mvp68BetaRcUserGuide.firstRunGuide).map',
  'toArray(mvp68BetaRcUserGuide.recommendedCommands).map',
  'toArray(mvp68BetaRcUserGuide.packagingGuide).map',
  'toArray(mvp68BetaRcUserGuide.diagnosticsFoldPlan).map',
  'toArray(mvp68BetaRcUserGuide.safetyBoundary).map',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of ['betaRcUserGuideService', 'BetaRcUserGuideDiagnosticsModel', 'BetaRcUserGuideModel']) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of [
  'README.md',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  '00_NEW_CHAT_START_HERE.md',
  'NEW_CHAT_PROMPT.md',
  'NEW_CHAT_PROMPT_FULL.md',
  'CODEX_MINIMAL_PROMPTS.md',
]) {
  if (!read(file).includes('0.106.0-mvp68') && !read(file).includes('0.107.0-mvp69')) fail(`${file} missing compatible MVP-68/MVP-69 version token`);
  requireIncludes(file, 'MVP-68');
  requireIncludes(file, 'Beta 0.1 RC 使用说明');
}

requireIncludes('docs/BETA_RC_USER_GUIDE_MVP68.md', '首次使用流程');
requireIncludes('docs/BETA_RC_USER_GUIDE_MVP68.md', '打包前检查');
requireIncludes('docs/BETA_RC_USER_GUIDE_MVP68.md', '诊断页为什么多');
requireIncludes('docs/BETA_RC_USER_GUIDE_MVP68.md', '不接 SQLite');
requireIncludes('docs/CURRENT_ROADMAP_MVP68.md', '0.106.0-mvp68');
requireIncludes('HANDOFF_MVP67_TO_MVP68.md', 'MVP-68');
requireIncludes('PACKAGE_MANIFEST_MVP68_HANDOFF.txt', 'betaRcUserGuideService');
requireIncludes('scripts/desktop-smoke-check.mjs', 'MVP-68 Beta RC user guide docs');

for (const forbidden of ['better-sqlite3', 'mpv backend', 'fs.unlink', 'fs.rename']) {
  if (read('src/services/betaRcUserGuideService.ts').includes(forbidden)) {
    fail(`MVP-68 service should not introduce forbidden implementation token: ${forbidden}`);
  }
}

console.log('MVP-68 Beta 0.1 RC user guide verification passed.');
