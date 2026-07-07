import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`[MVP-69 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (!['0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version)) fail(`package version expected 0.107.0-mvp69 or compatible MVP-70, got ${pkg.version}`);
if (!['0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(lock.version) || !['0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(lock.packages?.['']?.version)) fail('package-lock root version must be 0.107.0-mvp69 or compatible MVP-70');
if (!pkg.scripts?.['verify:mvp69-beta-release-candidate']) fail('package.json missing verify:mvp69-beta-release-candidate');
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp69-beta-release-candidate')) fail('verify:all must include MVP-69 verifier');

for (const file of [
  'src/services/betaReleaseCandidateService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP69.md',
  'docs/BETA_RELEASE_CANDIDATE_MVP69.md',
  'HANDOFF_MVP68_TO_MVP69.md',
  'PACKAGE_MANIFEST_MVP69_HANDOFF.txt',
]) {
  if (!exists(file)) fail(`missing MVP-69 file: ${file}`);
}

for (const token of [
  'betaReleaseCandidateService',
  'MVP-69 Beta 0.1 Release Candidate 整包确认',
  'Beta 0.1 Release Candidate',
  '真实样本 GUI 链路已经通过',
  '选择音声库目录',
  '一键扫描并应用',
  '音频、歌词、图片、视频',
  '只修真实缺陷',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不删除 / 移动 / 重命名真实媒体文件',
]) {
  requireIncludes('src/services/betaReleaseCandidateService.ts', token);
}

for (const token of [
  'betaReleaseCandidateService',
  'mvp69-beta-release-candidate',
  'mvp69BetaReleaseCandidate.cards.map',
  'mvp69BetaReleaseCandidate.confirmedCapabilities.map',
  'mvp69BetaReleaseCandidate.releaseChecklist.map',
  'mvp69BetaReleaseCandidate.knownNonBlockingItems.map',
]) {
  requireIncludes('src/components/SettingsPage.tsx', token);
}

for (const token of [
  'betaReleaseCandidateService',
  'MVP-69 verifier marker',
  'mvp69-beta-release-candidate',
  'toArray(mvp69BetaReleaseCandidate.cards).map',
  'toArray(mvp69BetaReleaseCandidate.confirmedCapabilities).map',
  'toArray(mvp69BetaReleaseCandidate.rcDecisionNotes).map',
  'toArray(mvp69BetaReleaseCandidate.knownNonBlockingItems).map',
  'toArray(mvp69BetaReleaseCandidate.recommendedCommands).map',
  'toArray(mvp69BetaReleaseCandidate.freezeBoundary).map',
]) {
  requireIncludes('src/components/DiagnosticsPage.tsx', token);
}

for (const token of ['betaReleaseCandidateService', 'BetaReleaseCandidateDiagnosticsModel', 'BetaReleaseCandidateModel']) {
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
  requireIncludes(file, '0.107.0-mvp69');
  requireIncludes(file, 'MVP-69');
  requireIncludes(file, 'Beta 0.1 Release Candidate');
}

requireIncludes('docs/BETA_RELEASE_CANDIDATE_MVP69.md', 'RC 能力边界');
requireIncludes('docs/BETA_RELEASE_CANDIDATE_MVP69.md', '已知非阻塞项');
requireIncludes('docs/BETA_RELEASE_CANDIDATE_MVP69.md', '冻结边界');
requireIncludes('docs/BETA_RELEASE_CANDIDATE_MVP69.md', '不接 SQLite');
requireIncludes('docs/CURRENT_ROADMAP_MVP69.md', '0.107.0-mvp69');
requireIncludes('HANDOFF_MVP68_TO_MVP69.md', 'MVP-69');
requireIncludes('PACKAGE_MANIFEST_MVP69_HANDOFF.txt', 'betaReleaseCandidateService');
requireIncludes('scripts/desktop-smoke-check.mjs', 'MVP-69 Beta release candidate docs');

for (const forbidden of ['better-sqlite3', 'mpv backend', 'fs.unlink', 'fs.rename']) {
  if (read('src/services/betaReleaseCandidateService.ts').includes(forbidden)) {
    fail(`MVP-69 service should not introduce forbidden implementation token: ${forbidden}`);
  }
}

console.log('MVP-69 Beta 0.1 Release Candidate verification passed.');
