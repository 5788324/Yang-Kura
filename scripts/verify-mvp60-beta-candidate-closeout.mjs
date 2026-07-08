import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/betaCandidateCloseoutService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP60.md',
  'docs/BETA_CANDIDATE_CLOSEOUT_MVP60.md',
  'scripts/verify-mvp60-beta-candidate-closeout.mjs',
  'HANDOFF_MVP59_TO_MVP60.md',
  'PACKAGE_MANIFEST_MVP60_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-60 file: ${file}`);
}

if (!['0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.98.0-mvp60 or compatible MVP-61, got ${packageJson.version}`);
}
if (!['0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageLock.version) || !['0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.98.0-mvp60 or compatible MVP-61');
}
if (!packageJson.scripts?.['verify:mvp60-beta-candidate-closeout']) {
  throw new Error('Missing verify:mvp60-beta-candidate-closeout script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp60-beta-candidate-closeout')) {
  throw new Error('verify:all must include MVP-60 verifier');
}

const service = read('src/services/betaCandidateCloseoutService.ts');
for (const token of [
  'betaCandidateCloseoutService',
  'getAboutModel',
  'getDiagnosticsModel',
  'Beta 0.1 候选包',
  '界面不显示真实绝对路径',
  '不会删除、移动、重命名真实媒体文件',
  'SQLite',
  'mpv 后端',
]) {
  if (!service.includes(token)) throw new Error(`betaCandidateCloseoutService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-60 service should not introduce forbidden token: ${forbidden}`);
}

const settings = read('src/components/SettingsPage.tsx');
for (const token of [
  'betaCandidateCloseoutService',
  'mvp60-beta-candidate-summary',
  'mvp60BetaCandidate.chips',
  'Beta 候选',
  '候选包使用顺序',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-60 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'betaCandidateCloseoutService',
  'mvp60-beta-candidate-closeout',
  'mvp60BetaCandidateCloseout.summary',
  'Beta 0.1 候选包最终整理',
  '不改真实链路',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-60 token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['betaCandidateCloseoutService', 'BetaCandidateAboutModel', 'BetaCandidateDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-60 export token: ${token}`);
}

const docs = read('docs/BETA_CANDIDATE_CLOSEOUT_MVP60.md');
for (const token of [
  'Beta 0.1 候选包最终整理',
  'mvp60-beta-candidate-summary',
  'mvp60-beta-candidate-closeout',
  '不删除 / 移动 / 重命名',
  'absolutePath',
  'file://',
  'SQLite',
  'mpv 后端',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-60 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.98.0-mvp60') && !content.includes('0.99.0-mvp61') && !content.includes('0.100.0-mvp62') && !content.includes('0.101.0-mvp63') && !content.includes('0.102.0-mvp64') && !content.includes('0.103.0-mvp65')) throw new Error(`${file} missing 0.98.0-mvp60`);
  if (!content.includes('MVP-60') && !content.includes('MVP-61')) throw new Error(`${file} missing compatible MVP-60/MVP-61 marker`);
}

console.log('MVP-60 beta candidate closeout verification passed.');
