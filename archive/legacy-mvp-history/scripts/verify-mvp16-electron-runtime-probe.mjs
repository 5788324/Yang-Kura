import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const packageJson = JSON.parse(read('package.json'));
assert(['0.55.0-mvp16', '0.56.0-mvp17', '0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version), 'package.json version must be MVP-16 or later compatible MVP-17');
assert(packageJson.scripts['verify:mvp16-electron-runtime-probe'] === 'node scripts/verify-mvp16-electron-runtime-probe.mjs', 'MVP-16 verify script missing');
assert(packageJson.scripts['verify:all'].includes('verify:mvp16-electron-runtime-probe'), 'verify:all must include MVP-16 verifier');

for (const file of [
  'src/services/electronRuntimeProbeService.ts',
  'src/components/DiagnosticsPage.tsx',
  'src/components/SettingsPage.tsx',
  'docs/ELECTRON_RUNTIME_PROBE_MVP16.md',
]) assert(exists(file), `missing ${file}`);

const service = read('src/services/electronRuntimeProbeService.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const settings = read('src/components/SettingsPage.tsx');
const serviceIndex = read('src/services/index.ts');
const docs = read('docs/ELECTRON_RUNTIME_PROBE_MVP16.md');

[
  'ElectronRuntimeProbeModel',
  'MVP-16 Renderer-Side Electron Status Probe',
  'browser-vite',
  'electron-stub',
  'probe-error',
  'window.yangKura',
  'getElectronShellStatus',
  'canReadRealDisk',
  'canWriteLibraryIndex',
  'no real directory picker in MVP-16',
  'no scanner IPC implementation in MVP-16',
].forEach((needle) => assert(service.includes(needle), `runtime probe service missing ${needle}`));

[
  'electronRuntimeProbeService',
  'MVP-16 Renderer-Side Electron Status Probe',
  'runtime capabilities',
  'probe notes',
  'MVP-16 forbidden actions',
  'window.yangKura',
].forEach((needle) => assert(diagnostics.includes(needle), `DiagnosticsPage missing ${needle}`));

[
  'electronRuntimeProbeService',
  'MVP-16 Runtime Probe / 当前运行环境',
  'window.yangKura',
  'disabled in MVP-16',
].forEach((needle) => assert(settings.includes(needle), `SettingsPage missing ${needle}`));

assert(serviceIndex.includes('electronRuntimeProbeService'), 'service index must export MVP-16 service');
assert(docs.includes('MVP-16 Renderer-Side Electron Status Probe'), 'MVP-16 doc title missing');
assert(docs.includes('browser-vite'), 'MVP-16 doc must explain browser-vite mode');
assert(docs.includes('electron-stub'), 'MVP-16 doc must explain electron-stub mode');
assert(docs.includes('MVP-16 does not implement'), 'MVP-16 doc must include safety boundary');

[
  'node:fs',
  'fs.readdir',
  'fs.writeFile',
  'writeFile(',
  'unlink(',
  'rename(',
  'ipcRenderer.invoke',
  'ipcMain.handle',
  'dialog.showOpenDialog',
  'new Audio',
  'sqlite3',
].forEach((forbidden) => {
  assert(!service.includes(forbidden), `runtime probe service must not include ${forbidden}`);
});

console.log('MVP-16 renderer-side Electron runtime probe verification passed.');
