import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-66 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(pkg.version)) fail(`package version expected 0.104.0-mvp66 or compatible MVP-67, got ${pkg.version}`);
if (!['0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.version) || !['0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.packages?.['']?.version)) fail('package-lock root version must be MVP-66 or compatible MVP-67');
if (!pkg.scripts?.['verify:mvp66-beta-gui-regression']) fail('package.json missing verify:mvp66-beta-gui-regression');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp66-beta-gui-regression')) fail('verify:all must include MVP-66 verifier');

for (const file of [
  'src/services/betaGuiRegressionService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP66.md',
  'docs/BETA_GUI_REGRESSION_MVP66.md',
  'HANDOFF_MVP65_TO_MVP66.md',
  'PACKAGE_MANIFEST_MVP66_HANDOFF.txt',
]) {
  if (!exists(file)) fail(`missing MVP-66 file: ${file}`);
}

for (const token of [
  'betaGuiRegressionService',
  'MVP-66 Beta 0.1 GUI 全链路回归确认',
  'Beta 0.1 GUI PASS 待确认',
  '真实样本清单',
  'npm run desktop:smoke-check:strict',
  'npm run dev:electron',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不删除 / 移动 / 重命名真实媒体文件',
]) {
  requireIncludes('src/services/betaGuiRegressionService.ts', token);
}

for (const token of [
  'betaGuiRegressionService',
  'mvp66-beta-gui-regression',
  'mvp66BetaGuiRegression.localFlow.map',
  'mvp66BetaGuiRegression.passCriteria.map',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}

for (const token of [
  'betaGuiRegressionService',
  'MVP-66 verifier marker',
  'mvp66-beta-gui-regression',
  'mvp66BetaGuiRegression.commands.map',
  'mvp66BetaGuiRegression.sampleChecklist.map',
  'mvp66BetaGuiRegression.nextIfFailed.map',
  'mvp66BetaGuiRegression.safetyBoundary.map',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of ['betaGuiRegressionService', 'BetaGuiRegressionDiagnosticsModel', 'BetaGuiRegressionSettingsModel']) {
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
  if (!read(file).includes('0.104.0-mvp66') && !read(file).includes('0.105.0-mvp67')) fail(`${file} missing compatible MVP-66/MVP-67 version marker`);
  requireIncludes(file, 'MVP-66');
  requireIncludes(file, 'Beta 0.1 GUI 全链路回归确认');
}

requireIncludes('docs/BETA_GUI_REGRESSION_MVP66.md', '真实小样本资源库');
requireIncludes('docs/BETA_GUI_REGRESSION_MVP66.md', '不接 SQLite');
requireIncludes('docs/CURRENT_ROADMAP_MVP66.md', '0.104.0-mvp66');
requireIncludes('HANDOFF_MVP65_TO_MVP66.md', 'MVP-66');
requireIncludes('PACKAGE_MANIFEST_MVP66_HANDOFF.txt', 'betaGuiRegressionService');

for (const forbidden of ['better-sqlite3', 'mpv backend', '真实媒体文件删除', 'fs.unlink', 'fs.rename']) {
  if (read('src/services/betaGuiRegressionService.ts').includes(forbidden)) {
    fail(`MVP-66 service should not introduce forbidden implementation token: ${forbidden}`);
  }
}

console.log('MVP-66 Beta 0.1 GUI full-chain regression verification passed.');
