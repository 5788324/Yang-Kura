import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/electronRegressionHardeningService.ts',
  'src/services/localRegressionFixService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'scripts/setup-electron-desktop.mjs',
  'scripts/desktop-smoke-check.mjs',
  'scripts/run-electron-dev.mjs',
  'scripts/run-electron-preview.mjs',
  'docs/CURRENT_ROADMAP_MVP62.md',
  'docs/ELECTRON_REGRESSION_HARDENING_MVP62.md',
  'scripts/verify-mvp62-electron-regression-hardening.mjs',
  'HANDOFF_MVP61_TO_MVP62.md',
  'PACKAGE_MANIFEST_MVP62_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-62 file: ${file}`);
}

if (!['0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.100.0-mvp62 or 0.101.0-mvp63, got ${packageJson.version}`);
}
if (!['0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageLock.version) || !['0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.100.0-mvp62 or 0.101.0-mvp63');
}

for (const [scriptName, expected] of [
  ['dev:electron', 'npm run desktop:dev'],
  ['desktop:setup', 'node scripts/setup-electron-desktop.mjs'],
  ['desktop:smoke-check:strict', 'node scripts/desktop-smoke-check.mjs --strict-electron'],
  ['verify:mvp62-electron-regression-hardening', 'node scripts/verify-mvp62-electron-regression-hardening.mjs'],
]) {
  if (packageJson.scripts?.[scriptName] !== expected) {
    throw new Error(`package.json script ${scriptName} must equal ${expected}`);
  }
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp62-electron-regression-hardening')) {
  throw new Error('verify:all must include MVP-62 verifier');
}
if (packageJson.engines?.node !== '>=22 <23' || packageJson.engines?.npm !== '>=10 <11') {
  throw new Error('MVP-62 must keep formal Node 22 / npm 10 validation engines');
}

const setup = read('scripts/setup-electron-desktop.mjs');
for (const token of [
  'npm rebuild electron',
  'npm install + npm rebuild electron',
  "['rebuild', 'electron']",
  'path.txt',
  'electron --version',
  'cmd.exe',
  '/d',
  '/c',
]) {
  if (!setup.includes(token)) throw new Error(`setup-electron-desktop missing token: ${token}`);
}

const smoke = read('scripts/desktop-smoke-check.mjs');
for (const token of [
  '--strict-electron',
  'cmd.exe',
  '/d',
  '/c',
  'electronPathTxt',
  'getElectronResolvedBinaryPath',
  'Electron binary metadata path.txt exists',
  'Electron resolved binary exists',
  'desktop:setup runs npm rebuild electron',
  'Windows .cmd wrappers are launched through cmd.exe /d /c',
]) {
  if (!smoke.includes(token)) throw new Error(`desktop-smoke-check missing MVP-62 token: ${token}`);
}
if (smoke.includes("spawnSync(electronBin, ['--version']")) {
  throw new Error('desktop-smoke-check must not directly spawn electron.cmd on Windows');
}

const preview = read('scripts/run-electron-preview.mjs');
for (const token of ['spawnLogged', 'cmd.exe', '/d', '/c', 'npm run desktop:setup']) {
  if (!preview.includes(token)) throw new Error(`run-electron-preview missing MVP-62 token: ${token}`);
}

const service = read('src/services/electronRegressionHardeningService.ts');
for (const token of [
  'electronRegressionHardeningService',
  'MVP-62',
  'Electron GUI 回归加固',
  'cmd.exe /d /c',
  'npm rebuild electron',
  'Node 22.12+',
  'desktop:setup',
  'desktop:smoke-check:strict',
]) {
  if (!service.includes(token)) throw new Error(`electronRegressionHardeningService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-62 service should not introduce forbidden token: ${forbidden}`);
}

const settings = read('src/components/SettingsPage.tsx');
for (const token of [
  'electronRegressionHardeningService',
  'mvp62-electron-regression-hardening',
  'mvp62ElectronHardening.guiFlow',
  'Electron GUI 回归顺序',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-62 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'electronRegressionHardeningService',
  'mvp62-electron-regression-hardening-review',
  'mvp62ElectronHardening.fixes',
  'Electron 回归',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-62 token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['electronRegressionHardeningService', 'ElectronRegressionHardeningSettingsModel', 'ElectronRegressionHardeningDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-62 export token: ${token}`);
}

const docs = read('docs/ELECTRON_REGRESSION_HARDENING_MVP62.md');
for (const token of [
  'MVP-62 是 Electron strict smoke / setup 可靠性修复轮',
  'npm run desktop:setup',
  'npm rebuild electron',
  'npm run desktop:smoke-check:strict',
  'cmd.exe /d /c',
  'Node 22.12+',
  'path.txt',
  'dist/electron.exe',
  'mvp62-electron-regression-hardening',
  'mvp62-electron-regression-hardening-review',
  '不删除 / 移动 / 重命名',
  'absolutePath',
  'file://',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-62 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64')) throw new Error(`${file} missing 0.100.0-mvp62`);
  if (!content.includes('MVP-62')) throw new Error(`${file} missing MVP-62`);
}

console.log('MVP-62 Electron regression hardening verification passed.');
