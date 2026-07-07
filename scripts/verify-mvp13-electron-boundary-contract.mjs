import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const packageJson = JSON.parse(read('package.json'));
assert(['0.52.0-mvp13', '0.53.0-mvp14', '0.54.0-mvp15', '0.55.0-mvp16', '0.56.0-mvp17', '0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version), 'package.json version must be 0.52.0-mvp13 or a later compatible MVP version');
assert(packageJson.scripts['verify:mvp13-electron-boundary-contract'] === 'node scripts/verify-mvp13-electron-boundary-contract.mjs', 'MVP-13 verify script must be registered');
assert(packageJson.scripts['verify:all'].includes('verify:mvp13-electron-boundary-contract'), 'verify:all must include MVP-13 verifier');

const servicePath = 'src/services/electronFileAccessBoundaryContractService.ts';
const service = read(servicePath);
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const serviceIndex = read('src/services/index.ts');
const doc = read('docs/ELECTRON_FILE_ACCESS_BOUNDARY_MVP13.md');

[
  'ElectronFileAccessBoundaryContract',
  'allowedIpcSurface',
  'DirectoryPickerContract',
  'ReadOnlyDryRunPermissionContract',
  'PathTokenizationContract',
  'ForbiddenFileMutationApiContract',
  'PreloadExposureContract',
  'yang-kura:dialog:select-library-root',
  'returnsAbsolutePathToRenderer: false',
  'canWriteIndex: false',
  'canMutateFiles: false',
  'followSymlinks: false',
  'rendererReceivesAbsolutePath: false',
  'rendererReceivesFileUrl: false',
  'no Electron main/preload implementation in MVP-13',
].forEach((needle) => assert(service.includes(needle), `service missing ${needle}`));

[
  'electronFileAccessBoundaryContractService',
  'MVP-13 Electron Shell Boundary + File Access Contract',
  'allowed IPC surface',
  'directory picker contract',
  'read-only dry-run permission',
  'path tokenization',
  'forbidden file mutation APIs',
  'implementation phases',
].forEach((needle) => assert(diagnostics.includes(needle), `DiagnosticsPage missing ${needle}`));

assert(serviceIndex.includes('electronFileAccessBoundaryContractService'), 'service index must export MVP-13 service');
assert(doc.includes('MVP-13 Electron Shell Boundary + File Access Contract'), 'MVP-13 doc title missing');
assert(doc.includes('allowed IPC surface'), 'MVP-13 doc must mention allowed IPC surface');
assert(doc.includes('Directory picker contract'), 'MVP-13 doc must mention directory picker contract');
assert(doc.includes('Path tokenization'), 'MVP-13 doc must mention path tokenization');
assert(doc.includes('Forbidden file mutation APIs'), 'MVP-13 doc must mention forbidden mutation APIs');

const noRealImplementationFiles = [servicePath, 'src/components/DiagnosticsPage.tsx'];
for (const file of noRealImplementationFiles) {
  const text = read(file);
  assert(!/from\s+['"]electron['"]/.test(text), `${file} must not import electron`);
  assert(!/require\(['"]electron['"]\)/.test(text), `${file} must not require electron`);
  assert(!/from\s+['"]node:fs['"]/.test(text), `${file} must not import node:fs`);
  assert(!/from\s+['"]fs['"]/.test(text), `${file} must not import fs`);
  assert(!/writeFile\s*\(/.test(text), `${file} must not call writeFile`);
  assert(!/unlink\s*\(/.test(text), `${file} must not call unlink`);
  assert(!/rename\s*\(/.test(text), `${file} must not call rename`);
  assert(!/mkdir\s*\(/.test(text), `${file} must not call mkdir`);
  assert(!/spawn\s*\(/.test(text), `${file} must not call spawn`);
  assert(!/exec\s*\(/.test(text), `${file} must not call exec`);
}

if (packageJson.version === '0.52.0-mvp13') {
  assert(!fs.existsSync(path.join(root, 'electron')), 'MVP-13 must not add an electron directory');
  assert(!fs.existsSync(path.join(root, 'src/electron')), 'MVP-13 must not add src/electron');
  assert(!fs.existsSync(path.join(root, 'src/preload.ts')), 'MVP-13 must not add preload.ts');
  assert(!fs.existsSync(path.join(root, 'src/main-electron.ts')), 'MVP-13 must not add Electron main file');
}
if (['0.53.0-mvp14', '0.54.0-mvp15', '0.55.0-mvp16', '0.56.0-mvp17', '0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version)) {
  assert(fs.existsSync(path.join(root, 'electron/main.ts')), 'MVP-14 may add contract-only electron/main.ts');
  assert(fs.existsSync(path.join(root, 'electron/preload.ts')), 'MVP-14 may add contract-only electron/preload.ts');
}

console.log('MVP-13 Electron boundary contract verification passed.');
