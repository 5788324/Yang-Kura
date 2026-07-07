import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const packageJson = JSON.parse(read('package.json'));
const builderConfig = read('electron-builder.config.cjs');
const electronMain = read('electron/main.ts');

assert(['0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(packageJson.version), 'package.json version must be MVP-29 or later compatible MVP-32');
assert(packageJson.devDependencies?.['electron-builder'], 'electron-builder must be a devDependency');
assert(packageJson.scripts.postinstall === 'node scripts/patch-electron-builder-mvp29.mjs', 'postinstall must patch electron-builder MVP-29 compatibility');
assert(exists('scripts/patch-electron-builder-mvp29.mjs'), 'MVP-29 electron-builder patch script must exist');
assert(packageJson.scripts['desktop:pack']?.includes('electron-builder/cli.js --win portable'), 'desktop:pack must build Windows portable');
assert(packageJson.scripts['desktop:dist']?.includes('portable nsis'), 'desktop:dist must build portable and NSIS');
assert(packageJson.scripts['verify:mvp29-windows-packaging'] === 'node scripts/verify-mvp29-windows-packaging.mjs', 'MVP-29 verifier script must be registered');
assert(packageJson.scripts['verify:all'].includes('verify:mvp29-windows-packaging'), 'verify:all must include MVP-29 verifier');

for (const needle of ["productName: 'Yang Kura'", "output: 'release'", "target: 'portable'", "target: 'nsis'", "!node_modules/**/*", "!**/library-index.json", "!backups/**/*", "!data/**/*", "!cache/**/*", "!**/*.log", "main: 'dist-electron/main.js'"]) {
  assert(builderConfig.includes(needle), 'electron-builder config missing ' + needle);
}

for (const forbidden of ['C:\\Users\\YANG\\Music\\arsm.one', 'C:/Users/YANG/Music/arsm.one', 'E:\\arsm']) {
  assert(!builderConfig.includes(forbidden), 'builder config must not hardcode ' + forbidden);
  assert(!packageJson.scripts['desktop:pack'].includes(forbidden), 'desktop:pack must not hardcode ' + forbidden);
  assert(!packageJson.scripts['desktop:dist'].includes(forbidden), 'desktop:dist must not hardcode ' + forbidden);
}

for (const needle of ['stableUserDataPath', 'stableSessionDataPath', 'stableCachePath', 'stableLogsPath', 'stableCrashDumpsPath', 'disk-cache-dir']) {
  assert(electronMain.includes(needle), 'electron/main.ts missing stable storage token ' + needle);
}

for (const doc of ['docs/CURRENT_ROADMAP_MVP29.md', 'docs/ELECTRON_WINDOWS_PACKAGING_MVP29.md']) {
  assert(exists(doc), doc + ' must exist');
  assert(read(doc).includes('MVP-29'), doc + ' must mention MVP-29');
}

console.log('[MVP-29 PASS] Windows packaging configuration verification passed.');
