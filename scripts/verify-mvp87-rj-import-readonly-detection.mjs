import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-87] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

assert(['0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(pkg.version), `package.json version must be 0.125.0-mvp87 or compatible, got ${pkg.version}`);
assert(['0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(lock.version), `package-lock version must be 0.125.0-mvp87 or compatible, got ${lock.version}`);
assert(['0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.125.0-mvp87 or compatible');
assert(pkg.scripts?.['verify:mvp87-rj-import-readonly-detection'] === 'node scripts/verify-mvp87-rj-import-readonly-detection.mjs', 'package.json must expose MVP87 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp87-rj-import-readonly-detection'), 'verify:all must include MVP87 verifier');

const requiredFiles = [
  'src/services/rjImportReadOnlyDetectionService.ts',
  'docs/CURRENT_ROADMAP_MVP87.md',
  'docs/RJ_IMPORT_READONLY_DETECTION_MVP87.md',
  'HANDOFF_MVP86_TO_MVP87.md',
  'PACKAGE_MANIFEST_MVP87_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const service = read('src/services/rjImportReadOnlyDetectionService.ts');
for (const token of [
  '0.125.0-mvp87',
  'Mvp87RjImportReadonlyDetectionModel',
  'RjImportReadonlyDetectionResult',
  'normalizeRjCode',
  'classifyImportRelativePath',
  'buildRjImportReadonlyPreview',
  'sourceRootToken',
  'sourceDisplayName',
  'relativePaths',
  'ImportTaskContract',
  'MetadataSourceContract',
  'ImportConflictReportContract',
  'targetRelativeDirectory',
  'overwrite: false',
  'absolutePath',
  'file://',
  'MVP91',
  'MVP92',
]) {
  assert(service.includes(token), `MVP87 service missing token: ${token}`);
}

const importerPage = read('src/components/ImporterPage.tsx');
for (const token of [
  'rjImportReadOnlyDetectionService',
  'mvp87-rj-import-readonly-detection',
  'mvp87-rj-import-category-counts',
  'mvp87-rj-code-detection',
  'mvp87-rj-detected-import-task',
  'mvp87-rj-readonly-file-classification',
  'mvp87-rj-readonly-warnings',
  'mvp87-rj-import-readonly-guardrails',
]) {
  assert(importerPage.includes(token), `ImporterPage missing token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'rjImportReadOnlyDetectionService',
  'mvp87-rj-import-readonly-detection-diagnostics',
  'mvp87-rj-detection-rule-cards',
  'mvp87-rj-import-category-counts',
  'mvp87-rj-readonly-import-task',
  'mvp87-rj-readonly-guardrails',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['rjImportReadOnlyDetectionService', 'normalizeRjCode', 'RjImportReadonlyDetectionResult']) {
  assert(serviceIndex.includes(token), `services index missing token: ${token}`);
}

for (const file of requiredFiles) {
  const content = read(file);
  for (const token of ['0.125.0-mvp87', 'MVP-87', 'RJ']) {
    assert(content.includes(token), `${file} missing ${token}`);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  assert(content.includes('0.125.0-mvp87'), `${file} must mention 0.125.0-mvp87`);
  assert(content.includes('MVP-87'), `${file} must mention MVP-87`);
  assert(content.includes('RJ 专辑导入只读识别') || content.includes('mvp87-rj-import-readonly-detection') || content.includes('normalizeRjCode'), `${file} must mention MVP87 RJ readonly detection`);
}

for (const token of ['fs.unlink(', 'fs.rename(', 'fs.rm(', 'fs.copyFile(', 'better-sqlite3', 'ipcMain.handle("yang-kura:import', 'child_process.spawn', 'fetch(']) {
  assert(!service.includes(token), `MVP87 service introduced implementation-like forbidden token: ${token}`);
  assert(!importerPage.includes(token), `ImporterPage introduced implementation-like forbidden token: ${token}`);
}

console.log('MVP-87 RJ import readonly detection verification passed.');
