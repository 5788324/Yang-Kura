import fs from 'node:fs';
import path from 'node:path';

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pkg = json('package.json');
const lock = json('package-lock.json');

assert(['0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(pkg.version), `package.json version must be 0.127.0-mvp89 or compatible MVP-90, got ${pkg.version}`);
assert(['0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.version), `package-lock version must be 0.127.0-mvp89 or compatible MVP-90, got ${lock.version}`);
assert(['0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.127.0-mvp89 or compatible MVP-90');
assert(pkg.scripts?.['verify:mvp89-import-conflict-detection'] === 'node scripts/verify-mvp89-import-conflict-detection.mjs', 'package.json must expose MVP89 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp89-import-conflict-detection'), 'verify:all must include MVP89 verifier');

const requiredFiles = [
  'src/services/importConflictDetectionPreviewService.ts',
  'src/components/ImporterPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/CURRENT_ROADMAP_MVP89.md',
  'docs/IMPORT_CONFLICT_DETECTION_MVP89.md',
  'HANDOFF_MVP88_TO_MVP89.md',
  'PACKAGE_MANIFEST_MVP89_HANDOFF.txt',
];
for (const file of requiredFiles) assert(fs.existsSync(file), `missing required MVP89 file: ${file}`);

const service = read('src/services/importConflictDetectionPreviewService.ts');
for (const token of [
  '0.127.0-mvp89',
  'importConflictDetectionPreviewService',
  'buildImportConflictPreview',
  'ImportConflictExistingCollectionPreview',
  'duplicateCodeCount',
  'duplicateAlbumCount',
  'duplicateFileNameCount',
  'sameSizeSuspectCount',
  'hashCandidateCount',
  'MVP89 不计算真实 hash',
  'Renderer 不接收 absolutePath 或 file://',
]) {
  assert(service.includes(token), `service missing token: ${token}`);
}

for (const forbidden of [
  'fs.copyFile(',
  'fs.rename(',
  'fs.rm(',
  'fs.unlink(',
  'fs.writeFile(',
  'createReadStream(',
  'crypto.createHash(',
  'child_process',
  'sqlite3',
  'better-sqlite3',
]) {
  assert(!service.includes(forbidden), `service must not implement forbidden operation: ${forbidden}`);
}

const importer = read('src/components/ImporterPage.tsx');
for (const token of [
  'importConflictDetectionPreviewService',
  'mvp89-import-conflict-detection-preview',
  'mvp89-conflict-rule-cards',
  'mvp89-conflict-summary',
  'mvp89-conflict-report-preview',
  'mvp89-hash-strategy-preview',
  'mvp89-conflict-guardrails',
  'no real hash calculation',
]) {
  assert(importer.includes(token), `ImporterPage missing MVP89 token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'importConflictDetectionPreviewService',
  'mvp89-import-conflict-detection-diagnostics',
  'mvp89-conflict-rule-cards',
  'mvp89-conflict-report-preview',
  'mvp89-hash-strategy-preview',
  'mvp89-conflict-guardrails',
  'no real hash calculation',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing MVP89 token: ${token}`);
}

const index = read('src/services/index.ts');
for (const token of [
  "export {importConflictDetectionPreviewService, buildImportConflictPreview}",
  'Mvp89ImportConflictDetectionModel',
]) {
  assert(index.includes(token), `services/index missing token: ${token}`);
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md']) {
  const text = read(file);
  assert(text.includes('0.127.0-mvp89') || text.includes('0.128.0-mvp90'), `${file} missing version`);
  assert(text.includes('MVP-89'), `${file} missing MVP-89`);
  assert(text.includes('导入冲突检测'), `${file} missing MVP89 summary`);
}

for (const file of ['docs/CURRENT_ROADMAP_MVP89.md', 'docs/IMPORT_CONFLICT_DETECTION_MVP89.md', 'HANDOFF_MVP88_TO_MVP89.md']) {
  const text = read(file);
  for (const token of ['MVP-89', '0.127.0-mvp89', '不计算真实 hash', '不复制文件', '不移动文件']) {
    assert(text.includes(token), `${file} missing token: ${token}`);
  }
}

console.log('MVP89 import conflict detection verifier passed.');
