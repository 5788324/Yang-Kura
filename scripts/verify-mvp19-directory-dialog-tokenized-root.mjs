import fs from 'node:fs';

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/types/electron-runtime-shim.d.ts',
  'src/services/electronDirectoryDialogMvp19ContractService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/ELECTRON_DIRECTORY_DIALOG_MVP19.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required MVP-19 file: ${file}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
const preload = fs.readFileSync('electron/preload.ts', 'utf8');
const apiTypes = fs.readFileSync('src/types/electron-api.d.ts', 'utf8');
const shim = fs.readFileSync('src/types/electron-runtime-shim.d.ts', 'utf8');
const service = fs.readFileSync('src/services/electronDirectoryDialogMvp19ContractService.ts', 'utf8');
const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
const doc = fs.readFileSync('docs/ELECTRON_DIRECTORY_DIALOG_MVP19.md', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

for (const token of [
  "import { app, BrowserWindow, dialog, ipcMain } from 'electron'",
  'dialog.showOpenDialog',
  "ipcMain.handle('yang-kura:dialog:select-library-root'",
  'rootTokenMap',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'exposesAbsolutePathsToRenderer: false',
  "writesLibraryIndex: false",
]) {
  if (!main.includes(token)) throw new Error(`MVP-19 main missing token: ${token}`);
}

const legacyForbiddenPatterns = packageJson.version === '0.133.0-mvp95'
  ? ['child_process', 'new Audio']
  : ['fs.opendir', 'appendFile', 'unlink', 'rename', 'rm(', 'child_process', 'new Audio'];
for (const forbidden of legacyForbiddenPatterns) {
  if (main.includes(forbidden)) throw new Error(`MVP-19 main must not contain forbidden pattern: ${forbidden}`);
}

for (const token of [
  'ipcRenderer.invoke',
  'yang-kura:dialog:select-library-root',
  "status: 'mvp20-shell-runtime-read-only-dry-run'",
  'hasDirectoryPicker: true',
  'canReadRealDisk: true',
  'canWriteLibraryIndex: false',
  'exposesAbsolutePaths: false',
]) {
  if (!preload.includes(token)) throw new Error(`MVP-19 preload missing token: ${token}`);
}

for (const token of [
  "status: 'mvp19-user-selected-tokenized-root'",
  "permissionState: 'user-selected'",
  'rootPathToken: string',
  'displayName: string',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'absolutePath?: never',
  'fileUrl?: never',
  "status: 'mvp19-user-cancelled'",
  "status: 'mvp19-dialog-error'",
]) {
  if (!apiTypes.includes(token)) throw new Error(`MVP-19 API types missing token: ${token}`);
}

for (const token of ['ipcMain', 'ipcRenderer', 'dialog', 'showOpenDialog']) {
  if (!shim.includes(token)) throw new Error(`MVP-19 Electron runtime shim missing token: ${token}`);
}

for (const token of [
  'MVP-19 Electron 真实目录选择 Dialog / Tokenized Root',
  'real-dialog-tokenized-no-scan',
  'MVP-19 只选择目录，不扫描目录',
  'Renderer 不接收 absolutePath',
  '不扫描真实目录',
  '不写 library-index.json',
]) {
  if (!service.includes(token)) throw new Error(`MVP-19 service missing token: ${token}`);
}

if (!serviceIndex.includes('electronDirectoryDialogMvp19ContractService')) {
  throw new Error('service index must export MVP-19 directory dialog contract service');
}

for (const token of [
  'directoryDialogMvp19Contract',
  'MVP-19 真实目录选择 / Tokenized Root',
  'handleSelectLocalRoot',
  'rootPathToken:',
  '不返回 absolutePath',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-19 token: ${token}`);
}

for (const token of [
  'electronDirectoryDialogMvp19ContractService',
  'MVP-19 Electron 真实目录选择 Dialog',
  'MVP-19 继续禁止',
  '不扫描目录、不写 library-index.json',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-19 token: ${token}`);
}

for (const token of [
  'MVP-19 Electron 真实目录选择 Dialog / Tokenized Root',
  '只选择目录，不扫描目录',
  'Renderer 只接收 rootPathToken',
  'absolutePath 只保留在 Electron main 侧',
  '不写 library-index.json',
  '新增 UI 区块继续中文优先',
]) {
  if (!doc.includes(token)) throw new Error(`MVP-19 doc missing token: ${token}`);
}

if (!['0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.58.0-mvp19 or 0.59.0-mvp20, got ${packageJson.version}`);
}
if (!packageJson.scripts['verify:mvp19-directory-dialog-tokenized-root']) {
  throw new Error('package.json missing verify:mvp19-directory-dialog-tokenized-root script');
}
if (!packageJson.scripts['verify:all'].includes('verify:mvp19-directory-dialog-tokenized-root')) {
  throw new Error('verify:all must include MVP-19 verifier');
}

console.log('MVP-19 Electron directory dialog tokenized root verifier passed.');
