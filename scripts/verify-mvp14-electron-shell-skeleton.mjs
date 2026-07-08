import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const packageJson = JSON.parse(read('package.json'));
assert(['0.53.0-mvp14', '0.54.0-mvp15', '0.55.0-mvp16', '0.56.0-mvp17', '0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(packageJson.version), 'package.json version must be MVP-14 or later compatible MVP-15');
assert(packageJson.scripts['verify:mvp14-electron-shell-skeleton'] === 'node scripts/verify-mvp14-electron-shell-skeleton.mjs', 'MVP-14 verify script must be registered');
assert(packageJson.scripts['verify:all'].includes('verify:mvp14-electron-shell-skeleton'), 'verify:all must include MVP-14 verifier');

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/services/electronShellSkeletonContractService.ts',
  'docs/ELECTRON_SHELL_SKELETON_MVP14.md',
];
for (const file of requiredFiles) {
  assert(exists(file), `missing ${file}`);
}

const globalTypes = read('src/types/electron-api.d.ts');
const service = read('src/services/electronShellSkeletonContractService.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');
const doc = read('docs/ELECTRON_SHELL_SKELETON_MVP14.md');

[
  'interface Window',
  'yangKura?: YangKuraRendererApi',
  'selectLibraryRoot',
  'requestScannerDryRun',
  'getElectronShellStatus',
].forEach((needle) => assert(globalTypes.includes(needle), `electron api d.ts missing ${needle}`));

[
  'ElectronShellSkeletonContract',
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'stubCapabilities',
  'selectLibraryRoot',
  'requestScannerDryRun',
  'getElectronShellStatus',
].forEach((needle) => assert(service.includes(needle), `MVP-14 service missing ${needle}`));

[
  'electronShellSkeletonContractService',
  'MVP-14 Electron Shell Skeleton + Preload Type Contract',
  'stub shell files',
  'window.yangKura typed methods',
  'future implementation order',
  'MVP-14 forbidden actions',
].forEach((needle) => assert(diagnostics.includes(needle), `DiagnosticsPage missing ${needle}`));

assert(serviceIndex.includes('electronShellSkeletonContractService'), 'service index must export MVP-14 service');
assert(doc.includes('MVP-14 Electron Shell Skeleton + Preload Type Contract'), 'MVP-14 doc title missing');
assert(doc.includes('No Electron runtime dependency'), 'MVP-14 doc must preserve historical no-runtime decision');

if (packageJson.version === '0.53.0-mvp14') {
  for (const file of requiredFiles.slice(0, 3)) {
    const text = read(file);
    assert(!/from\s+['"]electron['"]/.test(text), `${file} must not import electron in MVP-14`);
    assert(!/contextBridge\.exposeInMainWorld\s*\(/.test(text), `${file} must not expose contextBridge runtime in MVP-14`);
    assert(!/BrowserWindow\s*\(/.test(text), `${file} must not create BrowserWindow in MVP-14`);
  }
  assert(!('electron' in (packageJson.dependencies ?? {})), 'MVP-14 must not add electron runtime dependency');
  assert(!('electron' in (packageJson.devDependencies ?? {})), 'MVP-14 must not add electron devDependency yet');
}

console.log('MVP-14 Electron shell skeleton verification passed.');
