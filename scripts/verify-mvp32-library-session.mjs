import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const app = read('src/App.tsx');
const dashboard = read('src/components/Dashboard.tsx');
const settings = read('src/components/SettingsPage.tsx');
const service = read('src/services/librarySessionService.ts');

assert(['0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version), 'package.json version must be 0.70.0-mvp32 or later compatible MVP-33');
assert(pkg.scripts?.['verify:mvp32-library-session'] === 'node scripts/verify-mvp32-library-session.mjs', 'package.json must expose MVP-32 verifier');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp32-library-session'), 'verify:all must include MVP-32 verifier');

assert(exists('src/services/librarySessionService.ts'), 'librarySessionService must exist');
assert(service.includes('yang_kura_library_session_v1'), 'library session storage key must be stable');
assert(service.includes('recordRootSelected'), 'library session must record selected roots');
assert(service.includes('recordIndexRead'), 'library session must record index reads');
assert(service.includes('recordIndexWrite'), 'library session must record index writes');
assert(service.includes('重启后请先重新选择该目录'), 'library session must explain packaged permission recovery');
assert(service.includes('absolutePath') === false, 'library session service must not persist absolutePath wording');

assert(app.includes('librarySessionService.getSnapshot'), 'App must hydrate library session snapshot');
assert(app.includes('librarySessionSnapshot={librarySessionSnapshot}'), 'App must pass library session snapshot to Dashboard');
assert(app.includes('librarySessionService.recordIndexRead'), 'App must refresh library session when stored index is applied');

assert(dashboard.includes('本地资源库状态'), 'Dashboard must show local library status');
assert(dashboard.includes('已连接本地资源库'), 'Dashboard must show connected library state');
assert(dashboard.includes('等待导入资源库'), 'Dashboard must show empty library state');
assert(dashboard.includes('重新读取 / 更新资源库'), 'Dashboard must route users back to Settings for index recovery/update');

assert(settings.includes('上次资源库'), 'SettingsPage must show last library/session card');
assert(settings.includes('librarySessionService.getUserFacingStatus'), 'SettingsPage must display user-facing session guidance');
assert(settings.includes('librarySessionService.recordRootSelected'), 'SettingsPage must record root selection');
assert(settings.includes('librarySessionService.recordIndexRead'), 'SettingsPage must record index read');
assert(settings.includes('librarySessionService.recordIndexWrite'), 'SettingsPage must record index write');

assert(exists('docs/CURRENT_ROADMAP_MVP32.md'), 'MVP-32 roadmap doc must exist');
assert(exists('docs/LIBRARY_SESSION_MVP32.md'), 'MVP-32 library session doc must exist');

if (failures.length) {
  console.error('MVP-32 library session verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-32 library session verification PASS');
