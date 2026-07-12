import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/components/DiagnosticsRuntimeBoundary.tsx',
  'src/services/diagnosticsBlackViewFixService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/App.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP64.md',
  'docs/DIAGNOSTICS_BLACK_VIEW_FIX_MVP64.md',
  'scripts/verify-mvp64-diagnostics-black-view-fix.mjs',
  'HANDOFF_MVP63_TO_MVP64.md',
  'PACKAGE_MANIFEST_MVP64_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-64 file: ${file}`);
}

if (!['0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) throw new Error(`Expected 0.102.0-mvp64 or later compatible MVP-65, got ${packageJson.version}`);
if (!['0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.version) || !['0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.102.0-mvp64 or later compatible MVP-65');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp64-diagnostics-black-view-fix')) {
  throw new Error('verify:all must include MVP-64 verifier');
}

const boundary = read('src/components/DiagnosticsRuntimeBoundary.tsx');
for (const token of [
  'DiagnosticsRuntimeBoundary',
  'getDerivedStateFromError',
  'componentDidCatch',
  'mvp64-diagnostics-runtime-fallback',
  '诊断页已进入安全降级视图',
  '重新尝试打开诊断页',
  'absolutePath',
  'file://',
]) {
  if (!boundary.includes(token)) throw new Error(`DiagnosticsRuntimeBoundary missing token: ${token}`);
}

const app = read('src/App.tsx');
for (const token of [
  'DiagnosticsRuntimeBoundary',
  'resetKey={`diagnostics-${rjWorks.length}-${musicAlbums.length}-${scanStatus}`}',
  '<DiagnosticsPage',
]) {
  if (!app.includes(token)) throw new Error(`App.tsx missing MVP-64 token: ${token}`);
}

const service = read('src/services/diagnosticsBlackViewFixService.ts');
for (const token of [
  'diagnosticsBlackViewFixService',
  'MVP-64 诊断页黑视图修复',
  'mvp64-diagnostics-runtime-fallback',
  '不接 SQLite',
  'absolutePath',
  'file://',
]) {
  if (!service.includes(token)) throw new Error(`diagnosticsBlackViewFixService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-64 service should not introduce forbidden token: ${forbidden}`);
}

const settings = read('src/components/SettingsPage.tsx');
for (const token of [
  'diagnosticsBlackViewFixService',
  'mvp64-diagnostics-black-view-fix',
  'mvp64DiagnosticsBlackViewFix.nextRetest',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-64 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'MVP-64 verifier marker',
  'DiagnosticsRuntimeBoundary',
  'mvp64-diagnostics-runtime-fallback',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-64 marker token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['diagnosticsBlackViewFixService', 'DiagnosticsBlackViewFixModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-64 export token: ${token}`);
}

const docs = read('docs/DIAGNOSTICS_BLACK_VIEW_FIX_MVP64.md');
for (const token of [
  '0.102.0-mvp64',
  'DiagnosticsRuntimeBoundary',
  'mvp64-diagnostics-runtime-fallback',
  '不接 SQLite',
  'absolutePath',
  'file://',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-64 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.102.0-mvp64') && !content.includes('0.103.0-mvp65')) throw new Error(`${file} missing compatible MVP-64/MVP-65 version marker`);
  if (!content.includes('MVP-64') && !content.includes('MVP-65')) throw new Error(`${file} missing MVP-64/MVP-65 marker`);
  if (!content.includes('mvp64-diagnostics-black-view-fix') && !content.includes('mvp65-diagnostics-map-guard')) throw new Error(`${file} missing MVP-64/MVP-65 settings marker`);
}

console.log('MVP-64 diagnostics black-view runtime guard verification passed.');
