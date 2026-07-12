import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-77 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const requiredFiles = [
  'src/services/packagedRegressionReviewService.ts',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP77.md',
  'docs/PACKAGED_REGRESSION_REVIEW_MVP77.md',
  'docs/DEEPSEEK_REVIEW_PROMPT_MVP77.md',
  'scripts/verify-mvp77-packaged-regression-review.mjs',
  'HANDOFF_MVP76_TO_MVP77.md',
  'PACKAGE_MANIFEST_MVP77_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`missing MVP-77 file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'];
if (!compatibleVersions.includes(pkg.version)) fail(`package version expected 0.115.0-mvp77 or compatible MVP-78, got ${pkg.version}`);
if (!compatibleVersions.includes(lock.version) || !compatibleVersions.includes(lock.packages?.['']?.version)) {
  fail('package-lock root version must be 0.115.0-mvp77 or compatible MVP-78');
}
if (!pkg.scripts?.['verify:mvp77-packaged-regression-review']) fail('missing verify:mvp77-packaged-regression-review script');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp77-packaged-regression-review')) fail('verify:all must include MVP-77 verifier');

for (const token of [
  'packagedRegressionReviewService',
  'Mvp77PackagedRegressionReviewModel',
  'Mvp77RegressionCheckItem',
  'mvp77-packaged-regression-review',
  'PlayerBar',
  'Dashboard',
  'AsmrLibrary',
  'MusicLibrary',
  'DiagnosticsPage',
  'DeepSeek',
  '不接 SQLite',
  '不删除、移动、重命名真实媒体文件',
  'absolutePath',
  'file://',
]) {
  requireIncludes('src/services/packagedRegressionReviewService.ts', token);
}

for (const token of [
  'packagedRegressionReviewService',
  'mvp77RegressionReview',
  'mvp77-packaged-regression-review',
  'mvp77-machine-checks',
  'mvp77-ui-layout-checks',
  'mvp77-manual-regression-checks',
  'mvp77-deepseek-review-prompt',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of [
  'packagedRegressionReviewService',
  'Mvp77PackagedRegressionReviewModel',
  'Mvp77RegressionCheckItem',
  'Mvp77RegressionSection',
  'Mvp77DeepSeekReviewPrompt',
]) {
  requireIncludes('src/services/index.ts', token);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP77.md', 'docs/PACKAGED_REGRESSION_REVIEW_MVP77.md', 'HANDOFF_MVP76_TO_MVP77.md', 'PACKAGE_MANIFEST_MVP77_HANDOFF.txt']) {
  for (const token of ['0.115.0-mvp77', 'MVP-77', '回归验收', 'UI 布局', 'DeepSeek', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
    requireIncludes(file, token);
  }
}

for (const token of ['0.115.0-mvp77', 'DeepSeek Review Prompt', 'npm run verify:mvp77-packaged-regression-review', '不改代码', '不接 SQLite', 'absolutePath', 'file://']) {
  requireIncludes('docs/DEEPSEEK_REVIEW_PROMPT_MVP77.md', token);
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  requireIncludes(file, '0.115.0-mvp77');
  requireIncludes(file, 'MVP-77');
  requireIncludes(file, '回归验收');
}

for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'better-sqlite3', 'mpv backend']) {
  if (read('src/services/packagedRegressionReviewService.ts').includes(forbidden)) {
    fail(`MVP-77 service should not introduce forbidden token: ${forbidden}`);
  }
}

console.log('MVP-77 packaged regression review verification passed.');
