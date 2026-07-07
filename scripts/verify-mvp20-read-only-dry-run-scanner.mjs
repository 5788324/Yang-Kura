import fs from 'node:fs';

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/services/electronDryRunScannerMvp20ContractService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/ELECTRON_DRY_RUN_SCANNER_MVP20.md',
  'docs/CURRENT_ROADMAP_MVP20.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required MVP-20 file: ${file}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
const preload = fs.readFileSync('electron/preload.ts', 'utf8');
const apiTypes = fs.readFileSync('src/types/electron-api.d.ts', 'utf8');
const service = fs.readFileSync('src/services/electronDryRunScannerMvp20ContractService.ts', 'utf8');
const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
const doc = fs.readFileSync('docs/ELECTRON_DRY_RUN_SCANNER_MVP20.md', 'utf8');
const roadmap = fs.readFileSync('docs/CURRENT_ROADMAP_MVP20.md', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lockJson = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

for (const token of [
  "status: 'mvp20-shell-runtime-read-only-dry-run'",
  "ipcMain.handle('yang-kura:scanner:dry-run:request'",
  'runReadOnlyDryRun',
  'rootTokenMap.get',
  'fs.readdir',
  'withFileTypes: true',
  'relativePath',
  'indexWriteAllowed: false',
  'absolutePathsReturned: false',
  'fileUrlReturned: false',
  'writesLibraryIndex: false',
  'exposesAbsolutePathsToRenderer: false',
]) {
  if (!main.includes(token)) throw new Error(`MVP-20 main missing token: ${token}`);
}

for (const forbidden of [
  'appendFile',
  'unlink',
  'rename(',
  'rm(',
  'child_process',
  'new Audio',
  'fileURLToPath(result.filePaths',
]) {
  if (main.includes(forbidden)) throw new Error(`MVP-20 main must not contain forbidden mutation/playback pattern: ${forbidden}`);
}

for (const token of [
  'yang-kura:scanner:dry-run:request',
  'hasScannerDryRunIpc: true',
  'canReadRealDisk: true',
  'canWriteLibraryIndex: false',
  'exposesAbsolutePaths: false',
]) {
  if (!preload.includes(token)) throw new Error(`MVP-20 preload missing token: ${token}`);
}

for (const token of [
  "status: 'mvp20-read-only-dry-run-complete'",
  "status: 'mvp20-dry-run-invalid-request' | 'mvp20-invalid-root-token' | 'mvp20-dry-run-error'",
  'YangKuraScannerDryRunSummary',
  'YangKuraScannerDryRunDiscoveredEntry',
  'relativePath: string',
  'absolutePath?: never',
  'fileUrl?: never',
  'indexWriteAllowed: false',
  'absolutePathsReturned: false',
  'fileUrlReturned: false',
]) {
  if (!apiTypes.includes(token)) throw new Error(`MVP-20 API types missing token: ${token}`);
}

for (const token of [
  'MVP-20 Electron 小样本只读 Dry-run 扫描',
  'read-only-dry-run-enabled',
  '个人项目实用优先',
  'MVP-23：写入 library-index.json',
  '不返回 absolutePath',
  '不删除 / 不移动 / 不重命名文件',
]) {
  if (!service.includes(token)) throw new Error(`MVP-20 service missing token: ${token}`);
}

if (!serviceIndex.includes('electronDryRunScannerMvp20ContractService')) {
  throw new Error('service index must export MVP-20 dry-run scanner contract service');
}

for (const token of [
  'handleRunDryRunPreview',
  'MVP-20 小样本只读 Dry-run 扫描',
  'requestScannerDryRun',
  'maxEntries: 10000',
  'maxDepth: 12',
  'relativePath',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-20 token: ${token}`);
}

for (const token of [
  'electronDryRunScannerMvp20ContractService',
  'MVP-20 Electron 小样本只读 Dry-run 扫描',
  '加速后的后续任务',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-20 token: ${token}`);
}

for (const token of [
  'MVP-20 Electron 小样本只读 Dry-run 扫描',
  '用户主动选择目录',
  '只读遍历目录',
  '不写 library-index.json',
  'relativePath',
]) {
  if (!doc.includes(token)) throw new Error(`MVP-20 doc missing token: ${token}`);
}

for (const token of [
  '0.59.0-mvp20', '0.60.0-mvp22',
  'YesPlayMusic-like UI',
  '个人项目实用优先',
  'HANDOFF_SUMMARY_MVP18.md',
]) {
  if (!roadmap.includes(token)) throw new Error(`Current roadmap missing token: ${token}`);
}

if (fs.existsSync('HANDOFF_SUMMARY_MVP18.md')) {
  throw new Error('Obsolete HANDOFF_SUMMARY_MVP18.md should be removed from current package');
}
if (!['0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(packageJson.version)) {
  throw new Error(`Expected package version 0.59.0-mvp20 or later compatible MVP version, got ${packageJson.version}`);
}
if (!['0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lockJson.version) || !['0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lockJson.packages?.['']?.version)) {
  throw new Error('package-lock.json must be updated to a compatible MVP version');
}
if (!packageJson.scripts['verify:mvp20-read-only-dry-run-scanner']) {
  throw new Error('package.json missing verify:mvp20-read-only-dry-run-scanner script');
}
if (!packageJson.scripts['verify:all'].includes('verify:mvp20-read-only-dry-run-scanner')) {
  throw new Error('verify:all must include MVP-20 verifier');
}

console.log('MVP-20 Electron read-only dry-run scanner verifier passed.');
