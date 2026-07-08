import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));

const requiredFiles = [
  'src/services/electronBinaryPathFixService.ts',
  'src/services/electronRegressionHardeningService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'scripts/setup-electron-desktop.mjs',
  'scripts/desktop-smoke-check.mjs',
  'docs/CURRENT_ROADMAP_MVP63.md',
  'docs/ELECTRON_BINARY_PATH_FIX_MVP63.md',
  'scripts/verify-mvp63-electron-binary-path-fix.mjs',
  'HANDOFF_MVP62_TO_MVP63.md',
  'PACKAGE_MANIFEST_MVP63_HANDOFF.txt',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-63 file: ${file}`);
}

if (!['0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version)) {
  throw new Error(`Expected package version 0.101.0-mvp63, got ${packageJson.version}`);
}
if (!['0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.version) || !['0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.101.0-mvp63');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp63-electron-binary-path-fix')) {
  throw new Error('verify:all must include MVP-63 verifier');
}
if (packageJson.engines?.node !== '>=22 <23' || packageJson.engines?.npm !== '>=10 <11') {
  throw new Error('MVP-63 must keep formal Node 22 / npm 10 validation engines');
}

const setup = read('scripts/setup-electron-desktop.mjs');
for (const token of [
  'getElectronResolvedBinaryCandidatePaths',
  'path.isAbsolute(relativeBinary)',
  "path.join(electronPackageDir, 'dist', basename)",
  'basename-only metadata',
  'Candidate paths',
  'npm rebuild electron',
  'electron --version',
]) {
  if (!setup.includes(token)) throw new Error(`setup-electron-desktop missing MVP-63 token: ${token}`);
}
if (setup.includes('return path.join(electronPackageDir, relativeBinary);')) {
  throw new Error('setup-electron-desktop must not use single package-root resolution for path.txt');
}

const smoke = read('scripts/desktop-smoke-check.mjs');
for (const token of [
  'getElectronResolvedBinaryCandidatePaths',
  "path.join(electronPackageDir, 'dist', basename)",
  'basename-only metadata',
  'Candidate paths',
  'cmd.exe',
  '/d',
  '/c',
  'MVP-63 electron binary path docs',
  'docs/ELECTRON_BINARY_PATH_FIX_MVP63.md',
  'dist/<binary>',
]) {
  if (!smoke.includes(token)) throw new Error(`desktop-smoke-check missing MVP-63 token: ${token}`);
}
if (smoke.includes('return path.join(electronPackageDir, relativeBinary);')) {
  throw new Error('desktop-smoke-check must not use single package-root resolution for path.txt');
}
if (smoke.includes("spawnSync(electronBin, ['--version']")) {
  throw new Error('desktop-smoke-check must keep Windows .cmd wrapper behind cmd.exe /d /c');
}

const service = read('src/services/electronBinaryPathFixService.ts');
for (const token of [
  'electronBinaryPathFixService',
  'MVP-63',
  'Electron binary 路径修复',
  'node_modules/electron/dist/electron.exe',
  'dist/electron.exe',
  'false negative fixed',
  'diagnostics-retest',
  '不接 SQLite',
  'absolutePath',
  'file://',
]) {
  if (!service.includes(token)) throw new Error(`electronBinaryPathFixService missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-63 service should not introduce forbidden token: ${forbidden}`);
}

const settings = read('src/components/SettingsPage.tsx');
for (const token of [
  'electronBinaryPathFixService',
  'mvp63-electron-binary-path-fix',
  'mvp63ElectronBinaryPathFix.testFlow',
  'MVP-63 本机复测顺序',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-63 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'electronBinaryPathFixService',
  'mvp63-electron-binary-path-fix-review',
  'mvp63ElectronBinaryPathFix.retestFocus',
  'Electron binary path',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-63 token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['electronBinaryPathFixService', 'ElectronBinaryPathFixSettingsModel', 'ElectronBinaryPathFixDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-63 export token: ${token}`);
}

const docs = read('docs/ELECTRON_BINARY_PATH_FIX_MVP63.md');
for (const token of [
  'MVP-63',
  '0.101.0-mvp63',
  'path.txt = electron.exe',
  'actual binary = node_modules/electron/dist/electron.exe',
  'wrong script check = node_modules/electron/electron.exe',
  'getElectronResolvedBinaryCandidatePaths',
  'node_modules/electron/dist/electron.exe',
  'mvp63-electron-binary-path-fix',
  'mvp63-electron-binary-path-fix-review',
  '不新增业务功能',
  'absolutePath',
  'file://',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-63 docs missing token: ${token}`);
}

for (const file of ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/PROJECT_STATE.md','docs/NEXT_CHAT_HANDOFF.md','docs/RUN_ME_FIRST.md','00_NEW_CHAT_START_HERE.md','NEW_CHAT_PROMPT.md','NEW_CHAT_PROMPT_FULL.md','CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  if (!content.includes('0.101.0-mvp63') && !content.includes('0.102.0-mvp64')) throw new Error(`${file} missing compatible MVP-63/MVP-64 version`);
  if (!content.includes('MVP-63')) throw new Error(`${file} missing MVP-63`);
  if (!content.includes('mvp63-electron-binary-path-fix')) throw new Error(`${file} missing MVP-63 settings marker`);
}

console.log('MVP-63 Electron binary path false-negative fix verification passed.');
