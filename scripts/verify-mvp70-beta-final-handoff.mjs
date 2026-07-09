import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-70 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(pkg.version)) fail(`package version expected 0.108.0-mvp70 or compatible MVP-71, got ${pkg.version}`);
if (!['0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.version) || !['0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(lock.packages?.['']?.version)) fail('package-lock root version must be 0.108.0-mvp70 or compatible MVP-71');
if (!pkg.scripts?.['verify:mvp70-beta-final-handoff']) fail('package.json missing verify:mvp70-beta-final-handoff');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp70-beta-final-handoff')) fail('verify:all must include MVP-70 verifier');

for (const file of [
  'src/services/betaFinalHandoffService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP70.md',
  'docs/BETA_FINAL_HANDOFF_MVP70.md',
  'HANDOFF_MVP69_TO_MVP70.md',
  'PACKAGE_MANIFEST_MVP70_HANDOFF.txt',
]) {
  if (!exists(file)) fail(`missing MVP-70 file: ${file}`);
}

for (const token of [
  'betaFinalHandoffService',
  'MVP-70 Beta 0.1 最终交接包',
  'Beta 0.1 RC 可交付包',
  '可暂停开发',
  '可后续维护',
  '用户已在本机确认真实音声库目录一键扫描并应用',
  '真实缺陷必须有复现路径',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不删除 / 移动 / 重命名真实媒体文件',
]) {
  requireIncludes('src/services/betaFinalHandoffService.ts', token);
}

for (const token of [
  'betaFinalHandoffService',
  'mvp70-beta-final-handoff',
  'mvp70BetaFinalHandoff.cards.map',
  'mvp70BetaFinalHandoff.userConfirmedFlow.map',
  'mvp70BetaFinalHandoff.codexLightCheck.map',
  'mvp70BetaFinalHandoff.handoffRules.map',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}

for (const token of [
  'betaFinalHandoffService',
  'MVP-70 verifier marker',
  'mvp70-beta-final-handoff',
  'toArray(mvp70BetaFinalHandoff.cards).map',
  'toArray(mvp70BetaFinalHandoff.userConfirmedFlow).map',
  'toArray(mvp70BetaFinalHandoff.recommendedCommands).map',
  'toArray(mvp70BetaFinalHandoff.handoffRules).map',
  'toArray(mvp70BetaFinalHandoff.finalPackageChecklist).map',
  'toArray(mvp70BetaFinalHandoff.frozenBoundaries).map',
  'toArray(mvp70BetaFinalHandoff.releaseDecision).map',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of ['betaFinalHandoffService', 'BetaFinalHandoffDiagnosticsModel', 'BetaFinalHandoffModel']) {
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
  requireIncludes(file, '0.108.0-mvp70', '0.109.0-mvp71');
  requireIncludes(file, 'MVP-70');
  requireIncludes(file, 'Beta 0.1 最终交接包');
}

requireIncludes('docs/BETA_FINAL_HANDOFF_MVP70.md', '用户已确认真实链路');
requireIncludes('docs/BETA_FINAL_HANDOFF_MVP70.md', '轻量验证命令');
requireIncludes('docs/BETA_FINAL_HANDOFF_MVP70.md', '交接规则');
requireIncludes('docs/BETA_FINAL_HANDOFF_MVP70.md', '冻结边界');
requireIncludes('docs/BETA_FINAL_HANDOFF_MVP70.md', '不接 SQLite');
requireIncludes('docs/CURRENT_ROADMAP_MVP70.md', '0.108.0-mvp70', '0.109.0-mvp71');
requireIncludes('HANDOFF_MVP69_TO_MVP70.md', 'MVP-70');
requireIncludes('PACKAGE_MANIFEST_MVP70_HANDOFF.txt', 'betaFinalHandoffService');
requireIncludes('scripts/desktop-smoke-check.mjs', 'MVP-70 Beta final handoff docs');

for (const forbidden of ['better-sqlite3', 'mpv backend', 'fs.unlink', 'fs.rename']) {
  if (read('src/services/betaFinalHandoffService.ts').includes(forbidden)) {
    fail(`MVP-70 service should not introduce forbidden implementation token: ${forbidden}`);
  }
}

console.log('MVP-70 Beta 0.1 final handoff verification passed.');
