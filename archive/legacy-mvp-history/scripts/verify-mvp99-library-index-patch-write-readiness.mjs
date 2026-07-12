#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP99 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(pkg.version), `package version must be 0.137.0-mvp99 or later compatible 0.138.0-mvp100/0.139.0-mvp101, got ${pkg.version}`);
assert(['0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.version) || ['0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.137.0-mvp99 or later compatible 0.138.0-mvp100/0.139.0-mvp101');
assert(pkg.scripts['verify:mvp99-library-index-patch-write-readiness'] === 'node scripts/verify-mvp99-library-index-patch-write-readiness.mjs', 'package.json must expose verify:mvp99-library-index-patch-write-readiness');
assert(pkg.scripts['verify:all'].includes('verify:mvp99-library-index-patch-write-readiness'), 'verify:all must include MVP99 verifier');

const service = read('src/services/libraryIndexPatchWriteReadinessService.ts');
[
  'Mvp99LibraryIndexPatchWriteReadinessModel',
  'mvp99-library-index-patch-write-readiness-v1',
  'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
  'readyForMvp100Write: true',
  'writeExecutionAllowedInMvp99: false',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'backupFileNamePattern',
  'library-index.backup.before-mvp100-*.json',
  '个人本地项目',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const index = read('src/services/index.ts');
assert(index.includes("libraryIndexPatchWriteReadinessService"), 'service index must export libraryIndexPatchWriteReadinessService');

const main = read('electron/main.ts');
[
  'ImportLibraryIndexPatchWriteReadinessRequest',
  'buildMvp99LibraryIndexPatchWriteReadinessResult',
  'yang-kura:import:library-index-patch:write-readiness',
  'mvp99-library-index-patch-write-readiness-ready',
  'mvp99-library-index-patch-write-readiness-invalid-request',
  'mvp99-library-index-patch-write-readiness-invalid-root-token',
  'mvp99-library-index-patch-write-readiness-missing-patch-preview',
  'mvp99-library-index-patch-write-readiness-confirmation-required',
  'mvp99-library-index-patch-write-readiness-backup-required',
  'mvp99-library-index-patch-write-readiness-v1',
  "mode: 'library-index-patch-write-readiness'",
  'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
  'backupFileNamePattern',
  'writeExecutionAllowedInMvp99: false',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
const mvp99Function = main.slice(main.indexOf('function buildMvp99LibraryIndexPatchWriteReadinessResult'), main.indexOf('function registerCopyOnlyMainSideStubIpc'));
assert(mvp99Function.includes('writeExecutionAllowedInMvp99: false'), 'MVP99 function must keep writeExecutionAllowedInMvp99 false');
assert(!mvp99Function.includes('fs.writeFile'), 'MVP99 function must not write files');
assert(!mvp99Function.includes('fs.rename'), 'MVP99 function must not rename files');
assert(!mvp99Function.includes('fs.rm'), 'MVP99 function must not delete files');
assert(!mvp99Function.includes('libraryIndexWritten: true'), 'MVP99 function must not mark libraryIndexWritten true');
assert(!mvp99Function.includes('sqliteWritten: true'), 'MVP99 function must not write SQLite');

const preload = read('electron/preload.ts');
[
  'ImportLibraryIndexPatchWriteReadinessRequest',
  'canCheckLibraryIndexPatchWriteReadiness: true',
  'requestImportLibraryIndexPatchWriteReadiness',
  'yang-kura:import:library-index-patch:write-readiness',
].forEach((token) => assert(preload.includes(token), `electron/preload.ts missing token: ${token}`));

const electronApi = read('src/types/electron-api.d.ts');
[
  'YangKuraImportLibraryIndexPatchWriteReadinessRequest',
  'YangKuraLibraryIndexPatchWriteReadinessResult',
  'canCheckLibraryIndexPatchWriteReadiness: true',
  'requestImportLibraryIndexPatchWriteReadiness',
  'mvp99-library-index-patch-write-readiness-v1',
  'mvp99-library-index-patch-write-readiness-ready',
  'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
  'writeExecutionAllowedInMvp99: false',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(electronApi.includes(token), `electron-api.d.ts missing token: ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp99-library-index-patch-write-readiness',
  'mvp99-readiness-cards',
  'mvp99-write-readiness-contract',
  'mvp99-readiness-preview',
  'mvp99-backup-plan',
  'mvp99-confirmation-checklist',
  'mvp99-personal-speed-boundary',
  'mvp99-guardrails',
  'libraryIndexPatchWriteReadinessService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp99-library-index-patch-write-readiness-diagnostics',
  'mvp99-readiness-cards',
  'mvp99-write-readiness-contract',
  'mvp99-readiness-preview',
  'mvp99-confirmation-checklist',
  'mvp99-personal-speed-boundary',
  'mvp99-guardrails',
  'libraryIndexPatchWriteReadinessService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP99.md',
  'docs/LIBRARY_INDEX_PATCH_WRITE_READINESS_MVP99.md',
  'HANDOFF_MVP98_TO_MVP99.md',
  'PACKAGE_MANIFEST_MVP99_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md'].map(read).join('\n');
[
  '0.137.0-mvp99',
  'library-index patch write readiness',
  '个人本地项目',
  '不分享',
  '不商业化',
  'MVP100',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP99 verify] PASS library-index patch write readiness is present and still does not write library-index.json/SQLite or expose absolutePath/file://.');
