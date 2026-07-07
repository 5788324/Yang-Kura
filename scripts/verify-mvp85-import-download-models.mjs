import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error(`[MVP-85] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

assert(['0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(pkg.version), `package.json version must be 0.123.0-mvp85 or compatible MVP-86, got ${pkg.version}`);
assert(['0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.version), `package-lock version must be 0.123.0-mvp85 or compatible MVP-86, got ${lock.version}`);
assert(['0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93'].includes(lock.packages?.['']?.version), 'package-lock root package version must be 0.123.0-mvp85 or compatible MVP-86');
assert(pkg.scripts?.['verify:mvp85-import-download-models'] === 'node scripts/verify-mvp85-import-download-models.mjs', 'package.json must expose MVP85 verifier script');
assert(pkg.scripts?.['verify:all']?.includes('verify:mvp85-import-download-models'), 'verify:all must include MVP85 verifier');

const requiredFiles = [
  'src/services/importDownloadModelContractService.ts',
  'docs/CURRENT_ROADMAP_MVP85.md',
  'docs/IMPORT_DOWNLOAD_MODEL_CONTRACT_MVP85.md',
  'docs/CODEX_PUSH_READY_MVP85.md',
  'HANDOFF_MVP84_TO_MVP85.md',
  'PACKAGE_MANIFEST_MVP85_HANDOFF.txt',
];
for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const service = read('src/services/importDownloadModelContractService.ts');
for (const token of [
  '0.123.0-mvp85',
  'ImportTaskContract',
  'DownloadTaskContract',
  'DownloadManifestContract',
  'MetadataSourceContract',
  'ImportTargetPlanContract',
  'ImportConflictReportContract',
  'unsupported-protected-file',
  'overwrite: false',
  'sourceRootToken',
  'stagingRootToken',
  'absolutePath',
  'file://',
]) {
  assert(service.includes(token), `MVP85 service missing token: ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of [
  'importDownloadModelContractService',
  'mvp85-import-download-models',
  'mvp85-model-cards',
  'mvp85-import-task-contract',
  'mvp85-download-task-contract',
  'mvp85-metadata-source-contract',
  'mvp85-download-manifest-contract',
  'mvp85-model-guardrails',
]) {
  assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`);
}

const serviceIndex = read('src/services/index.ts');
for (const token of ['importDownloadModelContractService', 'ImportTaskContract', 'DownloadTaskContract', 'MetadataSourceContract']) {
  assert(serviceIndex.includes(token), `services index missing token: ${token}`);
}

for (const file of requiredFiles) {
  const content = read(file);
  for (const token of ['0.123.0-mvp85', 'MVP-85']) {
    assert(content.includes(token), `${file} missing ${token}`);
  }
}

for (const file of ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/PROJECT_STATE.md', 'docs/NEXT_CHAT_HANDOFF.md', 'docs/RUN_ME_FIRST.md', '00_NEW_CHAT_START_HERE.md', 'NEW_CHAT_PROMPT.md', 'NEW_CHAT_PROMPT_FULL.md', 'CODEX_MINIMAL_PROMPTS.md']) {
  const content = read(file);
  assert(content.includes('0.123.0-mvp85'), `${file} must mention 0.123.0-mvp85`);
  assert(content.includes('MVP-85'), `${file} must mention MVP-85`);
  assert(content.includes('ImportTask') || content.includes('MetadataSource') || content.includes('DownloadManifest'), `${file} must mention MVP85 model contracts`);
}

const modelDoc = read('docs/IMPORT_DOWNLOAD_MODEL_CONTRACT_MVP85.md');
for (const token of ['ImportTask', 'DownloadTask', 'DownloadManifest', 'MetadataSource', 'copy', 'move', '不做解密器', 'absolutePath', 'file://']) {
  assert(modelDoc.includes(token), `model contract doc missing token: ${token}`);
}

const pushDoc = read('docs/CODEX_PUSH_READY_MVP85.md');
for (const token of ['git clone', 'git push', 'mvp85-import-download-models', 'verify:all', 'GitHub main 不是当前最新基线']) {
  assert(pushDoc.includes(token), `Codex push doc missing token: ${token}`);
}

for (const token of ['fs.unlink(', 'fs.rename(', 'fs.rm(', 'fs.copyFile(', 'better-sqlite3', 'ipcMain.handle("yang-kura:download', 'child_process.spawn', 'fetch(']) {
  assert(!service.includes(token), `MVP85 service introduced implementation-like forbidden token: ${token}`);
}

console.log('MVP-85 import/download model contracts verification passed.');
