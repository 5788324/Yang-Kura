import fs from 'node:fs';

const requiredFiles = [
  'src/services/electronDirectoryPickerStubContractService.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/services/electronStubSmokeCheckService.ts',
  'src/components/DiagnosticsPage.tsx',
  'src/components/SettingsPage.tsx',
  'docs/ELECTRON_DIRECTORY_PICKER_STUB_MVP18.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required MVP-18 file: ${file}`);
}

const service = fs.readFileSync('src/services/electronDirectoryPickerStubContractService.ts', 'utf8');
const preload = fs.readFileSync('electron/preload.ts', 'utf8');
const apiTypes = fs.readFileSync('src/types/electron-api.d.ts', 'utf8');
const smokeService = fs.readFileSync('src/services/electronStubSmokeCheckService.ts', 'utf8');
const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const serviceIndex = fs.readFileSync('src/services/index.ts', 'utf8');
const doc = fs.readFileSync('docs/ELECTRON_DIRECTORY_PICKER_STUB_MVP18.md', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredTokens = [
  'MVP-18 Electron 目录选择 Stub 合同',
  'mvp18-tokenized-root-stub',
  'rootPathToken',
  'libraryType',
  'permissionState',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'Renderer 只接收 rootPathToken',
  '不返回 absolutePath',
];

for (const token of requiredTokens) {
  if (!service.includes(token)) throw new Error(`MVP-18 service missing token: ${token}`);
}

for (const token of [
  'ipcRenderer.invoke',
  'yang-kura:dialog:select-library-root',
  'rootPathToken',
  'hasDirectoryPicker: true',
  'canWriteLibraryIndex: false',
]) {
  if (!preload.includes(token)) throw new Error(`MVP-18/19 preload missing token: ${token}`);
}

for (const token of [
  "status: 'mvp19-user-selected-tokenized-root'",
  'rootPathToken: string',
  'displayName: string',
  'absolutePath?: never',
  'fileUrl?: never',
]) {
  if (!apiTypes.includes(token)) throw new Error(`MVP-18/19 electron API type missing token: ${token}`);
}

for (const token of [
  'mvp19-user-selected-tokenized-root expected after user click',
  'absolutePath must stay undefined',
  'fileUrl must stay undefined',
]) {
  if (!smokeService.includes(token)) throw new Error(`MVP-18/19 smoke service missing token: ${token}`);
}

for (const token of [
  'electronDirectoryPickerStubContractService',
  'MVP-18 Electron 目录选择 Stub',
  'rootPathToken',
  '未来返回字段合同',
  'MVP-18 禁止动作',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-18 token: ${token}`);
}

for (const token of [
  'directoryPickerStubContract',
  'MVP-19 真实目录选择',
  'rootPathToken',
  '不返回 absolutePath',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-18/19 token: ${token}`);
}

if (!serviceIndex.includes('electronDirectoryPickerStubContractService')) {
  throw new Error('service index must export MVP-18 directory picker stub service');
}

if (!doc.includes('新增 UI 区块应以中文为主')) {
  throw new Error('MVP-18 doc must record Chinese-first UI rule');
}

const forbiddenPatterns = [
  'dialog.showOpenDialog',
  'ipcRenderer',
  'ipcMain.handle',
  'fs.readdir',
  'writeFile',
  'appendFile',
  'unlink',
  'rename',
  'rm(',
  'child_process',
  'new Audio',
];

for (const file of [service, smokeService]) {
  for (const pattern of forbiddenPatterns) {
    if (file.includes(pattern)) throw new Error(`MVP-18 services must not contain forbidden pattern: ${pattern}`);
  }
}

if (!packageJson.scripts['verify:mvp18-directory-picker-stub']) {
  throw new Error('package.json missing verify:mvp18-directory-picker-stub script');
}
if (!packageJson.scripts['verify:all'].includes('verify:mvp18-directory-picker-stub')) {
  throw new Error('verify:all must include MVP-18 verifier');
}
if (!['0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.57.0-mvp18 or 0.58.0-mvp19, got ${packageJson.version}`);
}

console.log('MVP-18 Electron directory picker stub verifier passed.');
