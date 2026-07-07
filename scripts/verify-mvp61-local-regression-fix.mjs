import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/localRegressionFixService.ts',
  'src/services/libraryIndexAdapter.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'scripts/desktop-smoke-check.mjs',
  'scripts/run-electron-dev.mjs',
  'scripts/run-electron-preview.mjs',
  'docs/CURRENT_ROADMAP_MVP61.md',
  'docs/LOCAL_REGRESSION_FIX_MVP61.md',
  'scripts/verify-mvp61-local-regression-fix.mjs',
  'HANDOFF_MVP60_TO_MVP61.md',
  'PACKAGE_MANIFEST_MVP61_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-61 file: ${file}`);
}

if (!['0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.99.0-mvp61 or later compatible MVP-62, got ${packageJson.version}`);
}
if (!['0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageLock.version) || !['0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.99.0-mvp61 or later compatible MVP-62');
}

for (const [scriptName, expected] of [
  ['dev:electron', 'npm run desktop:dev'],
  ['desktop:setup', ['0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageJson.version) ? 'node scripts/setup-electron-desktop.mjs' : 'npm run electron:install'],
  ['desktop:smoke-check:strict', 'node scripts/desktop-smoke-check.mjs --strict-electron'],
  ['verify:mvp61-local-regression-fix', 'node scripts/verify-mvp61-local-regression-fix.mjs'],
]) {
  if (packageJson.scripts?.[scriptName] !== expected) {
    throw new Error(`package.json script ${scriptName} must equal ${expected}`);
  }
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp61-local-regression-fix')) {
  throw new Error('verify:all must include MVP-61 verifier');
}
if (packageJson.engines?.node !== '>=22 <23' || packageJson.engines?.npm !== '>=10 <11') {
  throw new Error('MVP-61 must keep Node 22 / npm 10 formal validation engines');
}

const service = read('src/services/localRegressionFixService.ts');
for (const token of [
  'localRegressionFixService',
  'getSettingsModel',
  'getDiagnosticsModel',
  '本机回归启动修复',
  'Node 22 / npm 10',
  'dev:electron',
  'desktop:setup',
  'desktop:smoke-check:strict',
  'collection.folderPath',
]) {
  if (!service.includes(token)) throw new Error(`localRegressionFixService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-61 service should not introduce forbidden token: ${forbidden}`);
}

const smoke = read('scripts/desktop-smoke-check.mjs');
for (const token of [
  '--strict-electron',
  'desktop:setup',
  'desktop:smoke-check:strict',
  'electron --version',
  'YANG_KURA_STRICT_ELECTRON_SMOKE',
  'advisory by default',
]) {
  if (!smoke.includes(token)) throw new Error(`desktop-smoke-check missing token: ${token}`);
}
if (!smoke.includes('spawnElectronVersion') && !smoke.includes("spawnSync(electronBin, ['--version']")) {
  throw new Error('desktop-smoke-check must execute Electron --version in strict validation path');
}

const runDev = read('scripts/run-electron-dev.mjs');
for (const token of ['npm run desktop:setup', 'YANG_KURA_VITE_DEV_URL', 'http://127.0.0.1:3001']) {
  if (!runDev.includes(token)) throw new Error(`run-electron-dev missing MVP-61 token: ${token}`);
}
const runPreview = read('scripts/run-electron-preview.mjs');
if (!runPreview.includes('npm run desktop:setup')) {
  throw new Error('run-electron-preview must point users to desktop:setup');
}

const adapter = read('src/services/libraryIndexAdapter.ts');
for (const token of [
  'normalizeCollectionFolderLabel',
  'collection.folderPath',
  'file://',
  '资源库记录',
]) {
  if (!adapter.includes(token)) throw new Error(`libraryIndexAdapter missing MVP-61 path safety token: ${token}`);
}
if (!adapter.includes('/^[A-Za-z]:[\\\\/]/.test(value)') && !adapter.includes('/^[A-Za-z]:[\\/]/.test(value)')) {
  throw new Error('libraryIndexAdapter must reject drive absolute paths in folderPath labels');
}

const settings = read('src/components/SettingsPage.tsx');
for (const token of [
  'localRegressionFixService',
  'mvp61-local-regression-fix',
  'mvp61LocalRegression.localFlow',
  '本机 GUI 回归顺序',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-61 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'localRegressionFixService',
  'mvp61-local-regression-fix-review',
  'mvp61LocalRegressionFix.blockersFixed',
  '本机回归',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-61 token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['localRegressionFixService', 'LocalRegressionFixSettingsModel', 'LocalRegressionFixDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-61 export token: ${token}`);
}

const docs = read('docs/LOCAL_REGRESSION_FIX_MVP61.md');
for (const token of [
  'MVP-61 是本机回归阻塞修复轮',
  'npm run dev:electron',
  'npm run desktop:setup',
  'npm run desktop:smoke-check:strict',
  'Node `>=22 <23`',
  'collection.folderPath',
  '不删除 / 移动 / 重命名',
  'absolutePath',
  'file://',
  'mvp61-local-regression-fix',
  'mvp61-local-regression-fix-review',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-61 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.99.0-mvp61') && !content.includes('0.100.0-mvp62') && !content.includes('0.101.0-mvp63') && !content.includes('0.102.0-mvp64') && !content.includes('0.103.0-mvp65')) throw new Error(`${file} missing 0.99.0-mvp61`);
  if (!content.includes('MVP-61')) throw new Error(`${file} missing MVP-61`);
}

console.log('MVP-61 local regression launch fix verification passed.');
