#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP102 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(pkg.version), `package version must be 0.140.0-mvp102 or compatible 0.141.0-mvp103, got ${pkg.version}`);
assert(['0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(lock.version) || ['0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.140.0-mvp102 or compatible 0.141.0-mvp103');
assert(pkg.scripts['verify:mvp102-copy-only-import-closeout'] === 'node scripts/verify-mvp102-copy-only-import-closeout.mjs', 'package.json must expose verify:mvp102-copy-only-import-closeout');
assert(pkg.scripts['verify:all'].includes('verify:mvp102-copy-only-import-closeout'), 'verify:all must include MVP102 verifier');

const service = read('src/services/copyOnlyImportCloseoutService.ts');
[
  '0.140.0-mvp102',
  'MVP-102 copy-only 导入闭环收口',
  'mvp102-copy-only-import-closeout-v1',
  'MVP95-MVP101',
  'copyOnlyExecutorService',
  'copyOnlyOperationLogService',
  'copyOnlyPostCopyRefreshService',
  'libraryIndexPatchPreviewService',
  'libraryIndexPatchWriteReadinessService',
  'libraryIndexPatchWriteService',
  'importPatchUiRefreshService',
  'codexPrompt',
  'Codex 最小实测',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'downloaderTouched: false',
  'metadataProviderTouched: false',
  'mpvTouched: false',
  'moveDeleteRenameTouched: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const forbiddenServiceTokens = ['fs.copyFile', 'fs.writeFile', 'fs.rename', 'fs.rm', 'fs.unlink', 'sqliteWritten: true', 'moveDeleteRenameTouched: true'];
forbiddenServiceTokens.forEach((token) => assert(!service.includes(token), `service must not contain ${token}`));

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('copyOnlyImportCloseoutService'), 'services/index must export copyOnlyImportCloseoutService');
assert(serviceIndex.includes('Mvp102CopyOnlyImportCloseoutModel'), 'services/index must export MVP102 model type');

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp102-copy-only-import-closeout',
  'mvp102-closeout-cards',
  'mvp102-closeout-result',
  'mvp102-closed-stage-list',
  'mvp102-acceptance-checklist',
  'mvp102-codex-prompt',
  'mvp102-guardrails',
  'copyOnlyImportCloseoutService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp102-copy-only-import-closeout-diagnostics',
  'mvp102-closeout-cards',
  'mvp102-closeout-result',
  'mvp102-closed-stage-list',
  'mvp102-codex-prompt',
  'mvp102-guardrails',
  'copyOnlyImportCloseoutService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP102.md',
  'docs/COPY_ONLY_IMPORT_CLOSEOUT_MVP102.md',
  'HANDOFF_MVP101_TO_MVP102.md',
  'PACKAGE_MANIFEST_MVP102_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP102.md', 'docs/COPY_ONLY_IMPORT_CLOSEOUT_MVP102.md'].map(read).join('\n');
[
  '0.140.0-mvp102',
  'copy-only import closeout',
  'mvp102-copy-only-import-closeout-v1',
  'MVP95',
  'MVP101',
  'Codex 最小实机验收',
  '不接 SQLite',
  '不接下载器',
  '不接元数据 Provider',
  '不接 mpv',
  '不返回 `absolutePath`',
  'file://',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP102 verify] PASS copy-only import closeout records MVP95-MVP101 chain, Codex minimal smoke prompt, and keeps SQLite/downloader/metadata/mpv/move-delete-rename/absolutePath/file:// out of scope.');
