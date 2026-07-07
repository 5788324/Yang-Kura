import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/asmrDetailSideRailService.ts',
  'docs/CURRENT_ROADMAP_MVP57.md',
  'docs/ASMR_DETAIL_SIDE_RAIL_MVP57.md',
  'scripts/verify-mvp57-asmr-detail-side-rail.mjs',
  'HANDOFF_MVP56_TO_MVP57.md',
  'PACKAGE_MANIFEST_MVP57_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required MVP-57 file: ${file}`);
}

if (!['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.95.0-mvp57 or compatible MVP-58, got ${packageJson.version}`);
}
if (!['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.version) || !['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.95.0-mvp57 or compatible MVP-58');
}
if (!packageJson.scripts?.['verify:mvp57-asmr-detail-side-rail']) {
  throw new Error('Missing verify:mvp57-asmr-detail-side-rail script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp57-asmr-detail-side-rail')) {
  throw new Error('verify:all must include verify:mvp57-asmr-detail-side-rail');
}

const service = read('src/services/asmrDetailSideRailService.ts');
for (const token of [
  'asmrDetailSideRailService',
  'getSideRailModel',
  'getResourceRecordModel',
  'getSubtitlePanelModel',
  'getDiagnosticsModel',
  '资源库记录概览',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`asmrDetailSideRailService missing token: ${token}`);
}

const asmrDetail = read('src/components/AsmrDetail.tsx');
for (const token of [
  'mvp57-asmr-side-rail',
  'mvp57SideRailModel',
  'mvp57ResourceRecordModel',
  'mvp57SubtitlePanelModel',
  '个人听音记录',
]) {
  if (!asmrDetail.includes(token)) throw new Error(`AsmrDetail missing MVP-57 token: ${token}`);
}
if (asmrDetail.includes('F:\\ASMR\\')) {
  throw new Error('AsmrDetail must not include F:\\ASMR\\ absolute path sample');
}
if (asmrDetail.includes('DLsite') || asmrDetail.includes('ASMR.one')) {
  throw new Error('AsmrDetail MVP-57 surface should not mention metadata scraping brands');
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'mvp57-asmr-detail-side-rail-review',
  'mvp57AsmrDetailSideRail',
  'asmrDetailSideRailService',
  '音声详情右侧栏精修',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-57 token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.95.0-mvp57') && !content.includes('0.96.0-mvp58') && !content.includes('0.97.0-mvp59') && !content.includes('0.98.0-mvp60') && !content.includes('0.99.0-mvp61') && !content.includes('0.100.0-mvp62') && !content.includes('0.101.0-mvp63') && !content.includes('0.102.0-mvp64') && !content.includes('0.103.0-mvp65') && !content.includes('0.104.0-mvp66') && !content.includes('0.105.0-mvp67')) throw new Error(`${file} missing compatible MVP-57/MVP-58/MVP-59/MVP-60/MVP-61/MVP-61 version marker`);
  if (!content.includes('MVP-57') && !content.includes('MVP-58') && !content.includes('MVP-59') && !content.includes('MVP-60') && !content.includes('MVP-61') && !content.includes('MVP-66') && !content.includes('MVP-67')) throw new Error(`${file} missing MVP-57/MVP-58/MVP-59/MVP-60/MVP-61/MVP-61 marker`);
}

console.log('MVP-57 ASMR detail side rail verifier passed.');
