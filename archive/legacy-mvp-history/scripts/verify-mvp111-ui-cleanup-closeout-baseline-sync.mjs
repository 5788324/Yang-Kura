import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[MVP111 verify] FAIL ${message}`);
  process.exit(1);
};

const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));
if (!['0.149.0-mvp111', '0.150.0-mvp112'].includes(packageJson.version)) {
  fail(`package.json version must be 0.149.0-mvp111 or 0.150.0-mvp112, got ${packageJson.version}`);
}
if (!['0.149.0-mvp111', '0.150.0-mvp112'].includes(packageLock.version) || !['0.149.0-mvp111', '0.150.0-mvp112'].includes(packageLock.packages?.['']?.version)) {
  fail('package-lock.json root versions must be compatible with MVP111/MVP112');
}
if (!packageJson.scripts?.['verify:mvp111-ui-cleanup-closeout-baseline-sync']) {
  fail('missing verify:mvp111-ui-cleanup-closeout-baseline-sync script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp111-ui-cleanup-closeout-baseline-sync')) {
  fail('verify:all must include MVP111 verifier');
}

const service = read('src/services/uiCleanupCloseoutBaselineSyncService.ts');
[
  '0.149.0-mvp111',
  '界面日常化收口',
  'GitHub main',
  '0.146.0-mvp108 / 2e4a4aa',
  'MVP109：主界面去 AI 工程面板感',
  'MVP110：全局 UI 日常化',
  'MVP111：UI cleanup closeout + GitHub baseline sync',
  'Metadata Override / 本地元数据编辑层',
  '不修改 copy-only / move-only 执行器',
].forEach((token) => {
  if (!service.includes(token)) fail(`service missing token: ${token}`);
});
[
  'fs.rm',
  'fs.unlink',
  'fs.rename',
  'fs.writeFile',
  'fs.copyFile',
  'sqliteWritten: true',
  'downloadProviderConnected: true',
  'mpvBackendConnected: true',
].forEach((token) => {
  if (service.includes(token)) fail(`service must not introduce real operation token: ${token}`);
});

const index = read('src/services/index.ts');
if (!index.includes('uiCleanupCloseoutBaselineSyncService')) {
  fail('src/services/index.ts must export uiCleanupCloseoutBaselineSyncService');
}

const dashboard = read('src/components/Dashboard.tsx');
[
  'mvp111-ui-cleanup-closeout',
  'uiCleanupCloseoutBaselineSyncService.getModel()',
  'MVP111 收口包',
  '界面收口',
].forEach((token) => {
  if (!dashboard.includes(token)) fail(`Dashboard missing token: ${token}`);
});

const settings = read('src/components/SettingsPage.tsx');
[
  'mvp111-github-baseline-sync',
  '项目基线',
  'GitHub 与本地整理包状态已同步说明',
  'mvp111-pending-ui-cleanup-packages',
].forEach((token) => {
  if (!settings.includes(token)) fail(`SettingsPage missing token: ${token}`);
});

const docs = [
  'docs/CURRENT_ROADMAP_MVP111.md',
  'docs/UI_CLEANUP_CLOSEOUT_BASELINE_SYNC_MVP111.md',
  'HANDOFF_MVP110_TO_MVP111.md',
  'PACKAGE_MANIFEST_MVP111_HANDOFF.txt',
];
for (const doc of docs) {
  if (!fs.existsSync(doc)) fail(`missing ${doc}`);
}

const projectState = read('PROJECT_STATE.md');
[
  '0.149.0-mvp111',
  'GitHub main 当前正式基线：0.146.0-mvp108 / 2e4a4aa',
  'MVP109～MVP111 为待合入 UI 日常化整理包',
].forEach((token) => {
  if (!projectState.includes(token)) fail(`PROJECT_STATE missing token: ${token}`);
});

const nextChat = read('NEXT_CHAT_HANDOFF.md');
[
  'MVP111',
  'UI cleanup closeout + GitHub baseline sync',
  'Metadata Override',
].forEach((token) => {
  if (!nextChat.includes(token)) fail(`NEXT_CHAT_HANDOFF missing token: ${token}`);
});

console.log('[MVP111 verify] PASS UI cleanup closeout and GitHub baseline sync are documented without changing importer/scanner/player file-operation chains.');
