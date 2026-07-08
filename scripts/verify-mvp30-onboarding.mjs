import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read('package.json'));
const settings = read('src/components/SettingsPage.tsx');
const dashboard = read('src/components/Dashboard.tsx');
const roadmap = read('docs/CURRENT_ROADMAP_MVP30.md');
const guide = read('docs/PACKAGED_APP_USER_GUIDE_MVP30.md');

assert(['0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(pkg.version), 'package.json version must be 0.68.0-mvp30 or later compatible MVP-32');
assert(pkg.scripts?.['verify:mvp30-onboarding'] === 'node scripts/verify-mvp30-onboarding.mjs', 'package.json must expose verify:mvp30-onboarding');
assert((pkg.scripts?.['verify:all'] || '').includes('verify:mvp30-onboarding'), 'verify:all must include MVP-30 verifier');

assert(settings.includes('打包版快速导入'), 'SettingsPage must expose packaged quick import card');
assert(settings.includes('读取现有 index'), 'SettingsPage must expose read-existing-index action');
assert(settings.includes('一键扫描并应用'), 'SettingsPage must expose one-click scan/write/read/apply action');
assert(settings.includes('handleQuickScanWriteRead'), 'SettingsPage must implement one-click import handler');
assert(settings.includes('不修改媒体文件'), 'SettingsPage quick import must state media files are not modified');

assert(dashboard.includes('Yang-Kura 本地媒体库'), 'Dashboard must remove prototype label from hero');
assert(dashboard.includes('导入资源库'), 'Dashboard must link first-time users to Settings import flow');

assert(roadmap.includes('MVP-30'), 'MVP-30 roadmap doc must exist and mention MVP-30');
assert(guide.includes('读取现有 index'), 'Packaged app user guide must document reading existing index');
assert(guide.includes('一键扫描并应用'), 'Packaged app user guide must document one-click import');

if (failures.length) {
  console.error('MVP-30 onboarding verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('MVP-30 onboarding verification PASS');
