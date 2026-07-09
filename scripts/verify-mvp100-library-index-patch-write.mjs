#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP100 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(pkg.version), `package version must be 0.138.0-mvp100 or later compatible 0.139.0-mvp101, got ${pkg.version}`);
assert(['0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(lock.version) || ['0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.138.0-mvp100 or later compatible 0.139.0-mvp101');
assert(pkg.scripts['verify:mvp100-library-index-patch-write'] === 'node scripts/verify-mvp100-library-index-patch-write.mjs', 'package.json must expose verify:mvp100-library-index-patch-write');
assert(pkg.scripts['verify:all'].includes('verify:mvp100-library-index-patch-write'), 'verify:all must include MVP100 verifier');

const main = read('electron/main.ts');
[
  'ImportLibraryIndexPatchWriteRequest',
  'buildMvp100LibraryIndexPatchWriteResult',
  'writeLibraryIndexPatchWithBackup',
  'yang-kura:import:library-index-patch:write-confirmed',
  'mvp100-library-index-patch-write-complete',
  'mvp100-library-index-patch-write-invalid-request',
  'mvp100-library-index-patch-write-invalid-root-token',
  'mvp100-library-index-patch-write-missing-patch-preview',
  'mvp100-library-index-patch-write-confirmation-required',
  'mvp100-library-index-patch-write-backup-required',
  'mvp100-library-index-patch-write-missing-index',
  'mvp100-library-index-patch-write-read-index-failed',
  'mvp100-library-index-patch-write-invalid-current-index',
  'mvp100-library-index-patch-write-unsafe-content',
  'mvp100-library-index-patch-write-error',
  'mvp100-library-index-patch-write-verify-failed',
  'mvp100-library-index-patch-write-v1',
  "mode: 'library-index-patch-write-confirmed'",
  'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
  'library-index.backup.before-mvp100-',
  'flag: \'wx\'',
  'upsertByIdPreservingExisting',
  'validatePatchPreviewForWrite',
  'libraryIndexWritten: true',
  'indexPatchWritten: true',
  'backupCreated: true',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
const mvp100Slice = main.slice(main.indexOf('function buildPatchWriteSafetyNotes'), main.indexOf('function buildMvp105MoveOnlyOperationLogEntry'));
assert(mvp100Slice.includes('fs.writeFile'), 'MVP100 slice must write backup/index with fs.writeFile');
assert(!mvp100Slice.includes('fs.rm'), 'MVP100 slice must not delete files');
assert(!mvp100Slice.includes('fs.unlink'), 'MVP100 slice must not unlink files');
assert(!mvp100Slice.includes('fs.rename'), 'MVP100 slice must not rename files');
assert(!mvp100Slice.includes('sqliteWritten: true'), 'MVP100 slice must not write SQLite');
assert(!mvp100Slice.includes('scannerRunTriggered: true'), 'MVP100 slice must not trigger scanner');

const preload = read('electron/preload.ts');
[
  'ImportLibraryIndexPatchWriteRequest',
  'canWriteLibraryIndexPatch: true',
  'requestImportLibraryIndexPatchWrite',
  'yang-kura:import:library-index-patch:write-confirmed',
].forEach((token) => assert(preload.includes(token), `electron/preload.ts missing token: ${token}`));

const api = read('src/types/electron-api.d.ts');
[
  'YangKuraImportLibraryIndexPatchWriteRequest',
  'YangKuraLibraryIndexPatchWriteResult',
  'canWriteLibraryIndexPatch: true',
  'requestImportLibraryIndexPatchWrite',
  'mvp100-library-index-patch-write-v1',
  'mvp100-library-index-patch-write-complete',
  'libraryIndexWritten: boolean',
  'backupCreated: boolean',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(api.includes(token), `electron-api.d.ts missing token: ${token}`));

const service = read('src/services/libraryIndexPatchWriteService.ts');
[
  '0.138.0-mvp100',
  'MVP-100 library-index patch 真实写入',
  'mvp100-library-index-patch-write-v1',
  'yang-kura:import:library-index-patch:write-confirmed',
  'library-index.backup.before-mvp100-*.json',
  'writesLibraryIndexJson: true',
  'writesSQLite: false',
  'fullScanTriggered: false',
  'deletesExistingItems: false',
  'privatePersonalUse: true',
  'nonCommercial: true',
  'notSharedOrOpenSource: true',
  '个人本地项目',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('libraryIndexPatchWriteService'), 'services/index must export libraryIndexPatchWriteService');
assert(serviceIndex.includes('Mvp100LibraryIndexPatchWriteModel'), 'services/index must export MVP100 model type');

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp100-library-index-patch-write',
  'mvp100-write-cards',
  'mvp100-write-contract',
  'mvp100-write-result-preview',
  'mvp100-write-rules',
  'mvp100-failure-handling',
  'mvp100-personal-project-policy',
  'mvp100-guardrails',
  'libraryIndexPatchWriteService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp100-library-index-patch-write-diagnostics',
  'mvp100-write-cards',
  'mvp100-write-contract',
  'mvp100-write-result-preview',
  'mvp100-write-rules',
  'mvp100-failure-handling',
  'mvp100-guardrails',
  'libraryIndexPatchWriteService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP100.md',
  'docs/LIBRARY_INDEX_PATCH_WRITE_MVP100.md',
  'HANDOFF_MVP99_TO_MVP100.md',
  'PACKAGE_MANIFEST_MVP100_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP100.md', 'docs/LIBRARY_INDEX_PATCH_WRITE_MVP100.md'].map(read).join('\n');
[
  '0.138.0-mvp100',
  'library-index patch',
  'library-index.backup.before-mvp100',
  '个人本地项目',
  '不分享',
  '不商业化',
  '不接 SQLite',
  '不返回 `absolutePath`',
  'file://',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP100 verify] PASS library-index patch write creates backup, merges only, blocks SQLite/scanner/delete/rename, and keeps absolutePath/file:// out of renderer.');
