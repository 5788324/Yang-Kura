#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP101 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(pkg.version), `package version must be 0.139.0-mvp101 or later compatible 0.140.0-mvp102, got ${pkg.version}`);
assert(['0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(lock.version) || ['0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.146.0-mvp108'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.139.0-mvp101 or later compatible 0.140.0-mvp102');
assert(pkg.scripts['verify:mvp101-import-ui-refresh-after-patch'] === 'node scripts/verify-mvp101-import-ui-refresh-after-patch.mjs', 'package.json must expose verify:mvp101-import-ui-refresh-after-patch');
assert(pkg.scripts['verify:all'].includes('verify:mvp101-import-ui-refresh-after-patch'), 'verify:all must include MVP101 verifier');

const main = read('electron/main.ts');
[
  'ImportLibraryIndexPatchUiRefreshRequest',
  'buildMvp101PatchUiRefreshAfterWriteResult',
  'buildMvp101PatchUiRefreshSafetyNotes',
  'yang-kura:import:library-index-patch:refresh-after-write',
  'mvp101-import-ui-refresh-after-patch-complete',
  'mvp101-import-ui-refresh-after-patch-invalid-request',
  'mvp101-import-ui-refresh-after-patch-invalid-source-write',
  'mvp101-import-ui-refresh-after-patch-write-not-complete',
  'mvp101-import-ui-refresh-after-patch-invalid-root-token',
  'mvp101-import-ui-refresh-after-patch-read-failed',
  'mvp101-import-ui-refresh-after-patch-v1',
  "mode: 'refresh-after-patch-write'",
  'readLibraryIndex(targetRoot',
  'yang-kura-library-index-loaded',
  'yang_kura_last_read_library_index_result',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'fileMutationPerformed: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
const mvp101Slice = main.slice(main.indexOf('function buildMvp101PatchUiRefreshSafetyNotes'), main.indexOf('function registerCopyOnlyMainSideStubIpc'));
assert(mvp101Slice.includes('readLibraryIndex'), 'MVP101 must read current library-index.json through existing readLibraryIndex');
assert(!mvp101Slice.includes('fs.writeFile'), 'MVP101 must not write files');
assert(!mvp101Slice.includes('fs.rename'), 'MVP101 must not rename files');
assert(!mvp101Slice.includes('fs.rm'), 'MVP101 must not delete files');
assert(!mvp101Slice.includes('fs.unlink'), 'MVP101 must not unlink files');
assert(!mvp101Slice.includes('sqliteWritten: true'), 'MVP101 must not write SQLite');
assert(!mvp101Slice.includes('scannerRunTriggered: true'), 'MVP101 must not trigger full scanner');

const preload = read('electron/preload.ts');
[
  'ImportLibraryIndexPatchUiRefreshRequest',
  'requestImportLibraryIndexPatchRefreshAfterWrite',
  'yang-kura:import:library-index-patch:refresh-after-write',
].forEach((token) => assert(preload.includes(token), `electron/preload.ts missing token: ${token}`));

const api = read('src/types/electron-api.d.ts');
[
  'YangKuraImportLibraryIndexPatchUiRefreshRequest',
  'YangKuraImportLibraryIndexPatchUiRefreshResult',
  'requestImportLibraryIndexPatchRefreshAfterWrite',
  'mvp101-import-ui-refresh-after-patch-v1',
  'mvp101-import-ui-refresh-after-patch-complete',
  'YangKuraReadLibraryIndexResult',
  'eventName?: \'yang-kura-library-index-loaded\'',
  'cacheKey?: \'yang_kura_last_read_library_index_result\'',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(api.includes(token), `electron-api.d.ts missing token: ${token}`));

const service = read('src/services/importPatchUiRefreshService.ts');
[
  '0.139.0-mvp101',
  'MVP-101 导入后刷新资源库 UI',
  'mvp101-import-ui-refresh-after-patch-v1',
  'yang-kura:import:library-index-patch:refresh-after-write',
  'yang-kura-library-index-loaded',
  'yang_kura_last_read_library_index_result',
  'yang_kura_last_import_patch_refresh_result',
  'readsLibraryIndexJson: true',
  'writesLibraryIndexJson: false',
  'writesSQLite: false',
  'fullScanTriggered: false',
  'fileMutationPerformed: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'Codex 最小实测',
  'refreshAfterPatchWrite',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('importPatchUiRefreshService'), 'services/index must export importPatchUiRefreshService');
assert(serviceIndex.includes('Mvp101ImportUiRefreshModel'), 'services/index must export MVP101 model type');

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp101-import-ui-refresh-after-patch',
  'mvp101-refresh-cards',
  'mvp101-refresh-runtime-contract',
  'mvp101-refresh-result-preview',
  'mvp101-renderer-refresh-storage',
  'mvp101-refresh-steps',
  'mvp101-codex-smoke-test',
  'mvp101-guardrails',
  'importPatchUiRefreshService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp101-import-ui-refresh-after-patch-diagnostics',
  'mvp101-refresh-cards',
  'mvp101-refresh-runtime-contract',
  'mvp101-refresh-result-preview',
  'mvp101-refresh-steps',
  'mvp101-codex-smoke-test',
  'mvp101-guardrails',
  'importPatchUiRefreshService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP101.md',
  'docs/LIBRARY_INDEX_PATCH_UI_REFRESH_MVP101.md',
  'HANDOFF_MVP100_TO_MVP101.md',
  'PACKAGE_MANIFEST_MVP101_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP101.md', 'docs/LIBRARY_INDEX_PATCH_UI_REFRESH_MVP101.md'].map(read).join('\n');
[
  '0.139.0-mvp101',
  'import UI refresh after patch',
  'yang-kura:import:library-index-patch:refresh-after-write',
  'yang-kura-library-index-loaded',
  'Codex 最小实机验收',
  '不接 SQLite',
  '不触发全量扫描',
  '不返回 `absolutePath`',
  'file://',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP101 verify] PASS import UI refresh after patch reads current library-index.json, reuses renderer refresh event, and avoids SQLite/full scan/file mutation/absolutePath/file://.');
