import fs from 'node:fs';

const requiredFiles = [
  'src/services/betaRegressionChecklistService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/Dashboard.tsx',
  'src/components/PlayerBar.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP54.md',
  'docs/BETA_REGRESSION_CHECKLIST_MVP54.md',
  'scripts/verify-mvp54-beta-regression-checklist.mjs',
  ...(['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(JSON.parse(fs.readFileSync('package.json', 'utf8')).version)
    ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.94.0-mvp56'
    ? ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt']
    : ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt']),
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-54 file: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

if (!['0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.92.0-mvp54 or compatible MVP-55, got ${packageJson.version}`);
}
if (!['0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.version) || !['0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.92.0-mvp54 or compatible MVP-55');
}
if (!packageJson.scripts?.['verify:mvp54-beta-regression-checklist']) {
  throw new Error('Missing verify:mvp54-beta-regression-checklist script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp54-beta-regression-checklist')) {
  throw new Error('verify:all does not include MVP-54 verifier');
}

const service = fs.readFileSync('src/services/betaRegressionChecklistService.ts', 'utf8');
for (const token of [
  'betaRegressionChecklistService',
  'BetaRegressionDiagnosticsModel',
  'getSettingsModel',
  'getDashboardModel',
  'getPlayerModel',
  'getDiagnosticsModel',
  'MVP-54 Beta 回归清单与小范围收口',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`MVP-54 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-54 service should not introduce forbidden token: ${forbidden}`);
}

const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
for (const token of [
  'betaRegressionChecklistService',
  'mvp54-settings-regression-path',
  'mvp54BetaRegression.chips',
  'Beta 回归路径',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-54 token: ${token}`);
}

const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
for (const token of [
  'betaRegressionChecklistService',
  'mvp54-home-regression-hint',
  'mvp54Regression.chips',
]) {
  if (!dashboard.includes(token)) throw new Error(`Dashboard missing MVP-54 token: ${token}`);
}

const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const token of [
  'betaRegressionChecklistService',
  'mvp54-player-regression-strip',
  'mvp54-player-empty-regression-hint',
  'mvp54PlayerRegression.compactLine',
]) {
  if (!player.includes(token)) throw new Error(`PlayerBar missing MVP-54 token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'betaRegressionChecklistService',
  'mvp54-beta-regression-checklist',
  'mvp54BetaRegressionChecklist.checklist',
  'Beta 回归清单',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-54 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
for (const token of ['betaRegressionChecklistService', 'BetaRegressionDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-54 export token: ${token}`);
}

const docs = fs.readFileSync('docs/BETA_REGRESSION_CHECKLIST_MVP54.md', 'utf8');
for (const token of ['Beta 回归清单', 'mvp54-settings-regression-path', 'mvp54-home-regression-hint', 'mvp54-player-regression-strip', 'mvp54-beta-regression-checklist', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
  if (!docs.includes(token)) throw new Error(`MVP-54 docs missing token: ${token}`);
}

for (const staleFile of ['HANDOFF_MVP52_TO_MVP53.md', 'PACKAGE_MANIFEST_MVP53_HANDOFF.txt', 'HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt']) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-53 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-54 beta regression checklist verification passed.');
