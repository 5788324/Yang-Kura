import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/settingsPersonalWorkflowService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP58.md',
  'docs/SETTINGS_PERSONAL_WORKFLOW_MVP58.md',
  'scripts/verify-mvp58-settings-personal-workflow.mjs',
  'HANDOFF_MVP57_TO_MVP58.md',
  'PACKAGE_MANIFEST_MVP58_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-58 file: ${file}`);
}

if (!['0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.96.0-mvp58 or compatible MVP-59, got ${packageJson.version}`);
}
if (!['0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.version) || !['0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.96.0-mvp58 or compatible MVP-59');
}
if (!packageJson.scripts?.['verify:mvp58-settings-personal-workflow']) {
  throw new Error('Missing verify:mvp58-settings-personal-workflow script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp58-settings-personal-workflow')) {
  throw new Error('verify:all must include MVP-58 verifier');
}

const service = read('src/services/settingsPersonalWorkflowService.ts');
for (const token of [
  'settingsPersonalWorkflowService',
  'getWorkflowModel',
  'getAboutModel',
  'getDiagnosticsModel',
  '个人使用流程',
  '个人本地媒体库说明',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`settingsPersonalWorkflowService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-58 service should not introduce forbidden token: ${forbidden}`);
}

const settings = read('src/components/SettingsPage.tsx');
for (const token of [
  'settingsPersonalWorkflowService',
  'mvp58-settings-personal-workflow',
  'mvp58-about-personal-privacy',
  'mvp58PersonalWorkflow.steps',
  'mvp58AboutModel.privacyItems',
  '个人本地媒体库',
  '不上传真实媒体',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-58 token: ${token}`);
}
if (settings.includes('v2.4.0-desktop-beta') || settings.includes('No WASAPI')) {
  throw new Error('Settings/About copy must not keep stale demo/runtime version wording');
}
if (settings.includes('当前原型不会读取或上传')) {
  throw new Error('Settings/About copy must not claim current app is only a non-reading prototype');
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'settingsPersonalWorkflowService',
  'mvp58-settings-personal-workflow-review',
  'mvp58SettingsPersonalWorkflow.summary',
  '个人本地流程',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-58 token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['settingsPersonalWorkflowService', 'SettingsPersonalWorkflowModel', 'SettingsPersonalDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-58 export token: ${token}`);
}

const docs = read('docs/SETTINGS_PERSONAL_WORKFLOW_MVP58.md');
for (const token of [
  '设置页个人使用流程收口',
  'mvp58-settings-personal-workflow',
  'mvp58-about-personal-privacy',
  'mvp58-settings-personal-workflow-review',
  'Local JSON Index 优先',
  '不删除 / 移动 / 重命名',
  'absolutePath',
  'file://',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-58 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.96.0-mvp58') && !content.includes('0.97.0-mvp59') && !content.includes('0.98.0-mvp60') && !content.includes('0.99.0-mvp61') && !content.includes('0.100.0-mvp62') && !content.includes('0.101.0-mvp63') && !content.includes('0.102.0-mvp64') && !content.includes('0.103.0-mvp65')) throw new Error(`${file} missing compatible MVP-58/MVP-59/MVP-60/MVP-61 version marker`);
  if (!content.includes('MVP-58') && !content.includes('MVP-59') && !content.includes('MVP-60') && !content.includes('MVP-61')) throw new Error(`${file} missing MVP-58/MVP-59/MVP-60/MVP-61 marker`);
}

console.log('MVP-58 settings personal workflow verification passed.');
