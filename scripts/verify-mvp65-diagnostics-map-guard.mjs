import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`[MVP-65 FAIL] ${message}`);
  process.exit(1);
};
const requireIncludes = (file, token) => {
  const text = read(file);
  if (!text.includes(token)) fail(`${file} missing token: ${token}`);
};

const pkg = JSON.parse(read('package.json'));
if (!['0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(pkg.version)) fail(`package version expected 0.103.0-mvp65 or compatible MVP-66, got ${pkg.version}`);
if (!pkg.scripts['verify:mvp65-diagnostics-map-guard']) fail('package.json missing verify:mvp65-diagnostics-map-guard script');
if (!pkg.scripts['verify:all'].includes('verify:mvp65-diagnostics-map-guard')) fail('verify:all must include MVP-65 verifier');

requireIncludes('src/components/DiagnosticsPage.tsx', 'function toArray<T = any>(value: unknown): T[]');
requireIncludes('src/components/DiagnosticsPage.tsx', 'MVP-65 verifier marker: 诊断页 undefined.map 修复');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(electronStubSmokeCheck.methods).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(method.safetyAssertions).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(electronStubSmokeCheck.notes).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(electronStubSmokeCheck.forbiddenActions).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(fixtureReport.集合).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(electronDryRunScannerMvp20Contract.acceleratedPlan)');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(storedDryRunReport.discoveredEntries)');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(filteredWorks).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(scannedItems).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(deadLinksList).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(duplicateAnalysis).map');
requireIncludes('src/components/DiagnosticsPage.tsx', 'toArray(group.works).map');

requireIncludes('docs/CURRENT_ROADMAP_MVP65.md', '0.103.0-mvp65');
requireIncludes('docs/DIAGNOSTICS_MAP_GUARD_MVP65.md', 'Cannot read properties of undefined');
requireIncludes('HANDOFF_MVP64_TO_MVP65.md', '0.103.0-mvp65');
requireIncludes('PACKAGE_MANIFEST_MVP65_HANDOFF.txt', 'DiagnosticsPage undefined.map runtime fix');

for (const forbidden of ['better-sqlite3', 'mpv backend', '真实媒体文件删除']) {
  if (read('src/components/DiagnosticsPage.tsx').includes(forbidden)) {
    fail(`DiagnosticsPage should not introduce forbidden implementation token: ${forbidden}`);
  }
}

console.log('MVP-65 diagnostics map guard verification passed.');
