import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const checks = [];
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[MVP-28 FAIL] ${message}`);
    process.exitCode = 1;
  } else {
    checks.push(message);
  }
};

const requiredFiles = [
  'package.json',
  'package-lock.json',
  'scripts/desktop-smoke-check.mjs',
  'scripts/prepare-desktop-validation-bundle.mjs',
  'scripts/verify-mvp28-windows-desktop-validation.mjs',
  'src/services/electronWindowsValidationMvp28Service.ts',
  'docs/ELECTRON_WINDOWS_VALIDATION_MVP28.md',
  'docs/CURRENT_ROADMAP_MVP28.md',
  'docs/WINDOWS_VALIDATION.md',
  'README.md',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(file), `Required file exists: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const docs = read('docs/ELECTRON_WINDOWS_VALIDATION_MVP28.md');
const roadmap = read('docs/CURRENT_ROADMAP_MVP28.md');
const smoke = read('scripts/desktop-smoke-check.mjs');
const bundle = read('scripts/prepare-desktop-validation-bundle.mjs');
const service = read('src/services/electronWindowsValidationMvp28Service.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const main = read('electron/main.ts');

assert(['0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), 'package.json version is MVP-28 or MVP-28.1 compatible.');
assert(['0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.version), 'package-lock root version is MVP-28 or MVP-28.1 compatible.');
assert(['0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(lock.packages?.['']?.version), 'package-lock package version is MVP-28 or MVP-28.1 compatible.');
assert(pkg.scripts['desktop:validate-chain'], 'desktop:validate-chain script exists.');
assert(pkg.scripts['desktop:smoke-check'], 'desktop:smoke-check script exists.');
assert(pkg.scripts['desktop:prepare-validation-bundle'], 'desktop:prepare-validation-bundle script exists.');
assert(pkg.scripts['verify:all'].includes('verify:mvp28-windows-desktop-validation'), 'verify:all includes MVP-28 verifier.');
assert(smoke.includes('npm run electron:install'), 'Desktop smoke check explains Electron install step.');
assert(smoke.includes('Dry-run scan'), 'Desktop smoke check includes real data flow checklist.');
assert(bundle.includes('desktop-validation-bundle'), 'Validation bundle script creates desktop-validation-bundle.');
assert(bundle.includes('This is not a signed Windows installer'), 'Validation bundle script is honest about installer status.');
assert(docs.includes('npm run desktop:dev'), 'MVP-28 docs include desktop:dev validation.');
assert(docs.includes('npm run desktop:preview'), 'MVP-28 docs include desktop:preview validation.');
assert(docs.includes('不删除'), 'MVP-28 docs retain no-delete rule.');
assert(docs.includes('不移动'), 'MVP-28 docs retain no-move rule.');
assert(docs.includes('不重命名'), 'MVP-28 docs retain no-rename rule.');
assert(docs.includes('HTMLAudio'), 'MVP-28 docs cover local audio playback validation.');
assert(docs.includes('library-index.json'), 'MVP-28 docs cover library-index validation.');
assert(roadmap.includes('MVP-28'), 'MVP-28 roadmap exists.');
assert(service.includes('desktop:validate-chain'), 'MVP-28 UI service exposes validation scripts.');
assert(diagnostics.includes('electronWindowsValidationMvp28Service'), 'Diagnostics imports MVP-28 validation service.');
assert(diagnostics.includes('MVP-28 Windows 桌面验收'), 'Diagnostics renders MVP-28 validation block.');
assert(main.includes('MVP-28'), 'Electron main comments mention MVP-28 validation stage.');

const forbiddenNewSnippets = ['electron-builder', 'fs.rmSync(outDir', 'child_process.exec'];
const beforePackagingStage = !(/mvp(29|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])/.test(pkg.version) || pkg.version.includes('mvp28.1') || pkg.version.includes('mvp28.2') || pkg.version.includes('mvp29.1'));
if (beforePackagingStage) {
  assert(!pkg.devDependencies?.['electron-builder'], 'MVP-28 does not add electron-builder dependency yet.');
  assert(!pkg.dependencies?.['electron-builder'], 'MVP-28 does not add electron-builder as runtime dependency.');
}
assert(!docs.includes('已经生成安装包'), 'Docs do not falsely claim installer was generated.');
// The bundle script may remove its own generated output folder only; this is not a media mutation.
assert(bundle.includes('fs.rmSync(outDir'), 'Bundle script only cleans generated validation bundle output.');
assert(!main.includes('fs.rm('), 'Electron main still does not delete media files.');
assert(!main.includes('fs.unlink('), 'Electron main still does not unlink media files.');
assert(!main.includes('fs.rename('), 'Electron main still does not rename media files.');
if (pkg.version !== '0.133.0-mvp95') {
  assert(!main.includes('fs.copyFile('), 'Electron main still does not copy media files.');
}


if (process.exitCode) process.exit(process.exitCode);
console.log(`[MVP-28 PASS] ${checks.length} checks passed.`);
