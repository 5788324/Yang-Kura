import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-67 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version)) fail(`package version expected 0.105.0-mvp67 or compatible, got ${pkg.version}`);
if (!['0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.version) || !['0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.packages?.['']?.version)) fail('package-lock root version must be MVP-67 or compatible MVP-68');
if (!pkg.scripts?.['verify:mvp67-beta-rc-closeout']) fail('package.json missing verify:mvp67-beta-rc-closeout');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp67-beta-rc-closeout')) fail('verify:all must include MVP-67 verifier');

for (const file of [
  'src/services/betaRcCloseoutService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP67.md',
  'docs/BETA_RC_CLOSEOUT_MVP67.md',
  'HANDOFF_MVP66_TO_MVP67.md',
  'PACKAGE_MANIFEST_MVP67_HANDOFF.txt',
]) {
  if (!exists(file)) fail(`missing MVP-67 file: ${file}`);
}

for (const token of [
  'betaRcCloseoutService',
  'MVP-67 Beta 0.1 RC 收口',
  'Beta 0.1 GUI PASS 候选',
  '选择音声库目录',
  '一键扫描并应用',
  '音频可播放',
  '歌词可读取',
  '图片和视频可走外部打开',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不删除 / 移动 / 重命名真实媒体文件',
]) {
  requireIncludes('src/services/betaRcCloseoutService.ts', token);
}

for (const token of [
  'betaRcCloseoutService',
  'mvp67-beta-rc-closeout',
  'mvp67BetaRcCloseout.confirmedFlow.map',
  'mvp67BetaRcCloseout.rcChecks.map',
  'mvp67BetaRcCloseout.knownNotes.map',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}

for (const token of [
  'betaRcCloseoutService',
  'MVP-67 verifier marker',
  'mvp67-beta-rc-closeout',
  'toArray(mvp67BetaRcCloseout.chips).map',
  'toArray(mvp67BetaRcCloseout.confirmedFlow).map',
  'toArray(mvp67BetaRcCloseout.rcChecks).map',
  'toArray(mvp67BetaRcCloseout.nextSteps).map',
  'toArray(mvp67BetaRcCloseout.safetyBoundary).map',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of ['betaRcCloseoutService', 'BetaRcCloseoutDiagnosticsModel', 'BetaRcCloseoutModel']) {
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
  if (!read(file).includes('0.105.0-mvp67') && !read(file).includes('0.106.0-mvp68')) fail(`${file} missing MVP-67/MVP-68 version marker`);
  requireIncludes(file, 'MVP-67');
  requireIncludes(file, 'Beta 0.1 RC 收口');
}

requireIncludes('docs/BETA_RC_CLOSEOUT_MVP67.md', '选择音声库目录');
requireIncludes('docs/BETA_RC_CLOSEOUT_MVP67.md', '一键扫描并应用');
requireIncludes('docs/BETA_RC_CLOSEOUT_MVP67.md', '不接 SQLite');
requireIncludes('docs/CURRENT_ROADMAP_MVP67.md', '0.105.0-mvp67');
requireIncludes('HANDOFF_MVP66_TO_MVP67.md', 'MVP-67');
requireIncludes('PACKAGE_MANIFEST_MVP67_HANDOFF.txt', 'betaRcCloseoutService');
requireIncludes('scripts/desktop-smoke-check.mjs', 'MVP-67 Beta RC closeout docs');

for (const forbidden of ['better-sqlite3', 'mpv backend', 'fs.unlink', 'fs.rename']) {
  if (read('src/services/betaRcCloseoutService.ts').includes(forbidden)) {
    fail(`MVP-67 service should not introduce forbidden implementation token: ${forbidden}`);
  }
}

console.log('MVP-67 Beta 0.1 RC closeout verification passed.');
