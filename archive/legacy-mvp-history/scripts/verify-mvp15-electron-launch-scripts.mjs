import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const packageJson = JSON.parse(read('package.json'));
assert(['0.54.0-mvp15', '0.55.0-mvp16', '0.56.0-mvp17', '0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version), 'package.json version must be MVP-15 or later compatible MVP-16');
assert(packageJson.optionalDependencies?.electron === '^39.8.1', 'electron optionalDependency must be ^39.8.1');
assert(packageJson.scripts['build:electron'] === 'tsc -p tsconfig.electron.json', 'build:electron script missing');
assert(packageJson.scripts['desktop:dev'] === 'npm run build:electron && node scripts/run-electron-dev.mjs', 'desktop:dev script missing');
assert(packageJson.scripts['desktop:preview'] === 'npm run build && npm run build:electron && node scripts/run-electron-preview.mjs', 'desktop:preview script missing');
assert(packageJson.scripts['electron:install'] === 'npm install electron@^39.8.1 --save-dev', 'electron:install helper script missing');
assert(packageJson.scripts['verify:mvp15-electron-launch-scripts'] === 'node scripts/verify-mvp15-electron-launch-scripts.mjs', 'MVP-15 verify script missing');
assert(packageJson.scripts['verify:all'].includes('verify:mvp15-electron-launch-scripts'), 'verify:all must include MVP-15 verifier');

for (const file of [
  'electron/main.ts',
  'electron/preload.ts',
  'tsconfig.electron.json',
  'scripts/run-electron-dev.mjs',
  'scripts/run-electron-preview.mjs',
  'src/types/electron-api.d.ts',
  'src/services/electronShellLaunchContractService.ts',
  'docs/ELECTRON_SHELL_LAUNCH_MVP15.md',
]) assert(exists(file), `missing ${file}`);

const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const apiTypes = read('src/types/electron-api.d.ts');
const service = read('src/services/electronShellLaunchContractService.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');
const runner = read('scripts/run-electron-dev.mjs');
const tsconfig = read('tsconfig.electron.json');
const docs = read('docs/ELECTRON_SHELL_LAUNCH_MVP15.md');
const isMvp19OrLater = ['0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version);
const isMvp20OrLater = ['0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version);
const isMvp23OrLater = ['0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version);

[
  "from 'electron'",
  'BrowserWindow',
  'loadURL',
  'loadFile',
  'contextIsolation: true',
  'nodeIntegration: false',
  isMvp20OrLater ? 'registersScannerIpcHandlers: true' : 'registersScannerIpcHandlers: false',
  isMvp20OrLater ? 'readsRealDirectory: true' : 'readsRealDirectory: false',
  'writesLibraryIndex: false',
].forEach((needle) => assert(main.includes(needle), `electron/main.ts missing ${needle}`));

[
  "from 'electron'",
  'contextBridge.exposeInMainWorld',
  'window.yangKura',
  'selectLibraryRoot',
  'requestScannerDryRun',
  'getElectronShellStatus',
  isMvp19OrLater ? 'hasDirectoryPicker: true' : 'hasDirectoryPicker: false',
  isMvp20OrLater ? 'hasScannerDryRunIpc: true' : 'hasScannerDryRunIpc: false',
  isMvp20OrLater ? 'canReadRealDisk: true' : 'canReadRealDisk: false',
  isMvp23OrLater ? 'canWriteLibraryIndex: true' : 'canWriteLibraryIndex: false',
].forEach((needle) => assert(preload.includes(needle), `electron/preload.ts missing ${needle}`));

if (!isMvp19OrLater) {
  assert(!/ipcRenderer\s*\./.test(preload) && !/import\s+\{[^}]*ipcRenderer/.test(preload), 'MVP-15 preload must not use ipcRenderer yet');
  assert(!/ipcMain\.handle\s*\(/.test(main), 'MVP-15 main must not register scanner IPC yet');
  assert(!main.includes('dialog.showOpenDialog'), 'MVP-15 main must not open directory dialog yet');
}
if (!isMvp20OrLater) assert(!main.includes('fs.readdir'), 'MVP-15~19 main must not scan directories yet');
if (!isMvp23OrLater) assert(!main.includes('writeFile'), 'MVP-15+ main must not write files before MVP-23');
assert(!main.includes('unlink'), 'MVP-15+ main must not delete files');
assert(!main.includes('fs.rename'), 'MVP-15+ main must not rename files');

[
  isMvp20OrLater ? 'mvp20-shell-runtime-read-only-dry-run' : (isMvp19OrLater ? 'mvp19-shell-runtime-dialog-only' : 'mvp18-shell-runtime-stub'),
  'hasRealElectronRuntime: true',
  isMvp19OrLater ? 'hasDirectoryPicker: true' : 'hasDirectoryPicker: false',
  isMvp20OrLater ? 'hasScannerDryRunIpc: true' : 'hasScannerDryRunIpc: false',
  isMvp20OrLater ? 'canReadRealDisk: true' : 'canReadRealDisk: false',
  isMvp23OrLater ? 'canWriteLibraryIndex: true' : 'canWriteLibraryIndex: false',
  'yangKura?: YangKuraRendererApi',
].forEach((needle) => assert(apiTypes.includes(needle), `electron api types missing ${needle}`));

[
  'ElectronShellLaunchContract',
  'MVP-15 Electron Dependency + Shell Launch Scripts',
  'optionalDependency',
  'desktop:dev',
  'desktop:preview',
  'build:electron',
  'canReadRealDisk: false',
  'canWriteLibraryIndex: false',
  'canReturnAbsolutePath: false',
].forEach((needle) => assert(service.includes(needle), `MVP-15 service missing ${needle}`));

[
  'electronShellLaunchContractService',
  'MVP-15 Electron Dependency + Shell Launch Scripts',
  'runtime capabilities',
  'preload runtime stub methods',
  'MVP-15 forbidden actions',
].forEach((needle) => assert(diagnostics.includes(needle), `DiagnosticsPage missing ${needle}`));

assert(serviceIndex.includes('electronShellLaunchContractService'), 'service index must export MVP-15 service');
assert(runner.includes('Electron binary is not installed'), 'electron dev runner must explain missing binary');
assert(runner.includes('YANG_KURA_ELECTRON_DEV'), 'electron dev runner must set YANG_KURA_ELECTRON_DEV');
assert(runner.includes('waitForVite'), 'electron dev runner must wait for Vite');
assert(tsconfig.includes('dist-electron'), 'tsconfig.electron.json must emit dist-electron');
assert(docs.includes('MVP-15 Electron Dependency + Shell Launch Scripts'), 'MVP-15 doc title missing');
assert(docs.includes('optional dependency'), 'MVP-15 doc must explain optional dependency');
assert(docs.includes('No directory picker'), 'MVP-15 doc must say no directory picker');
assert(docs.includes('No scanner IPC'), 'MVP-15 doc must say no scanner IPC');

console.log('MVP-15 Electron launch scripts verification passed.');
