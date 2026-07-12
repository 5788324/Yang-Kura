import fs from 'node:fs';

const requiredFiles = [
  'src/services/asmrDetailSurfaceService.ts',
  'src/components/AsmrDetail.tsx',
  'src/components/DiagnosticsPage.tsx',
  'src/services/index.ts',
  'docs/CURRENT_ROADMAP_MVP56.md',
  'docs/ASMR_DETAIL_SURFACE_MVP56.md',
  'scripts/verify-mvp56-asmr-detail-surface.mjs',
  ...(['0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(JSON.parse(fs.readFileSync('package.json', 'utf8')).version)
    ? ['HANDOFF_MVP56_TO_MVP57.md', 'PACKAGE_MANIFEST_MVP57_HANDOFF.txt']
    : ['HANDOFF_MVP55_TO_MVP56.md', 'PACKAGE_MANIFEST_MVP56_HANDOFF.txt']),
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing MVP-56 file: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

if (!['0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.94.0-mvp56 or compatible MVP-57, got ${packageJson.version}`);
}
if (!['0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.version) || !['0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageLock.packages?.['']?.version)) {
  throw new Error('package-lock root version must be 0.94.0-mvp56 or compatible MVP-57');
}
if (!packageJson.scripts?.['verify:mvp56-asmr-detail-surface']) {
  throw new Error('Missing verify:mvp56-asmr-detail-surface script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp56-asmr-detail-surface')) {
  throw new Error('verify:all does not include MVP-56 verifier');
}

const service = fs.readFileSync('src/services/asmrDetailSurfaceService.ts', 'utf8');
for (const token of [
  'asmrDetailSurfaceService',
  'AsmrDetailHeroModel',
  'AsmrDetailTrackSummaryModel',
  'getInitialFolderRecord',
  'getTrackRecordLabel',
  'MVP-56 音声详情摘要模型抽离',
  '<资源库记录>',
  '不向 Renderer 暴露 absolutePath 或 file://',
]) {
  if (!service.includes(token)) throw new Error(`MVP-56 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'sqlite3', 'better-sqlite3']) {
  if (service.includes(forbidden)) throw new Error(`MVP-56 service should not introduce forbidden token: ${forbidden}`);
}

const asmrDetail = fs.readFileSync('src/components/AsmrDetail.tsx', 'utf8');
for (const token of [
  'asmrDetailSurfaceService',
  'mvp56-asmr-detail-summary',
  'mvp56-asmr-track-summary',
  'mvp56HeroModel',
  'mvp56TrackSummary',
  'mvp56RecordModel',
  '本地记录：',
  '资源库记录',
]) {
  if (!asmrDetail.includes(token)) throw new Error(`AsmrDetail missing MVP-56 token: ${token}`);
}
if (asmrDetail.includes('F:\\ASMR')) {
  throw new Error('AsmrDetail should not keep default F:\\ASMR example after MVP-56');
}
if (asmrDetail.includes('文件路径:')) {
  throw new Error('AsmrDetail should use 本地记录 instead of 文件路径');
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'asmrDetailSurfaceService',
  'mvp56-asmr-detail-surface-review',
  'mvp56AsmrDetailSurface.summary',
  '低风险收口项',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-56 token: ${token}`);
}

const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
for (const token of ['asmrDetailSurfaceService', 'AsmrDetailHeroModel', 'AsmrDetailDiagnosticsModel']) {
  if (!serviceIndex.includes(token)) throw new Error(`services/index.ts missing MVP-56 export token: ${token}`);
}

const docs = fs.readFileSync('docs/ASMR_DETAIL_SURFACE_MVP56.md', 'utf8');
for (const token of [
  '音声详情页摘要模型抽离',
  'mvp56-asmr-detail-summary',
  'mvp56-asmr-track-summary',
  'mvp56-asmr-detail-surface-review',
  '资源库记录',
  '不接 SQLite',
  '不删除 / 移动 / 重命名',
  'absolutePath',
  'file://',
]) {
  if (!docs.includes(token)) throw new Error(`MVP-56 docs missing token: ${token}`);
}

for (const staleFile of ['HANDOFF_MVP54_TO_MVP55.md', 'PACKAGE_MANIFEST_MVP55_HANDOFF.txt']) {
  if (fs.existsSync(staleFile)) throw new Error(`Stale MVP-55 handoff/package file should be removed: ${staleFile}`);
}

console.log('MVP-56 ASMR detail surface verification passed.');
