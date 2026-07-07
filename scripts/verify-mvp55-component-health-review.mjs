import fs from 'node:fs';

const requiredFiles = [
  'src/services/componentHealthReviewService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP55.md',
  'docs/COMPONENT_HEALTH_REVIEW_MVP55.md',
  'scripts/verify-mvp55-component-health-review.mjs',
  ...(['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(JSON.parse(fs.readFileSync('package.json', 'utf8')).version)
    ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt']
    : JSON.parse(fs.readFileSync('package.json', 'utf8')).version === '0.94.0-mvp56'
    ? ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt']
    : ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt']),
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-55 file: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

if (!['0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.93.0-mvp55 or compatible MVP-56, got ${packageJson.version}`);
}
if (!['0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.version) || !['0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.93.0-mvp55 or compatible MVP-56');
}
if (!packageJson.scripts?.['verify:mvp55-component-health-review']) {
  throw new Error('Missing verify:mvp55-component-health-review script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp55-component-health-review')) {
  throw new Error('verify:all does not include MVP-55 verifier');
}

const service = fs.readFileSync('src/services/componentHealthReviewService.ts', 'utf8');
for (const token of [
  'componentHealthReviewService',
  'ComponentHealthDiagnosticsModel',
  'getSettingsModel',
  'getDiagnosticsModel',
  'MVP-55 组件体检与低风险结构清理计划',
  'DiagnosticsPage.tsx',
  'LyricsPanel.tsx',
  '不做大组件一次性拆分',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`MVP-55 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-55 service should not introduce forbidden token: ${forbidden}`);
}

const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
for (const token of [
  'componentHealthReviewService',
  'mvp55-settings-component-health',
  'mvp55ComponentHealth.chips',
  'mvp55ComponentHealth.title',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-55 token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'componentHealthReviewService',
  'mvp55-component-health-review',
  'mvp55ComponentHealthReview.components',
  '低风险清理计划',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-55 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
for (const token of ['componentHealthReviewService', 'ComponentHealthDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-55 export token: ${token}`);
}

const docs = fs.readFileSync('docs/COMPONENT_HEALTH_REVIEW_MVP55.md', 'utf8');
for (const token of ['组件体检', 'mvp55-settings-component-health', 'mvp55-component-health-review', '先抽 service', '不一次性拆大组件', '不接 SQLite', '不删除 / 移动 / 重命名', 'absolutePath', 'file://']) {
  if (!docs.includes(token)) throw new Error(`MVP-55 docs missing token: ${token}`);
}

for (const staleFile of ['HANDOFF_MVP53_TO_MVP54.md', 'PACKAGE_MANIFEST_MVP54_HANDOFF.txt']) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-54 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-55 component health review verification passed.');
