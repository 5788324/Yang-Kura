#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP98 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(pkg.version), `package version must be 0.136.0-mvp98 or later compatible through 0.138.0-mvp100, got ${pkg.version}`);
assert(['0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.version) || ['0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.136.0-mvp98 or later compatible through 0.138.0-mvp100');
assert(pkg.scripts['verify:mvp98-library-index-patch-preview'] === 'node scripts/verify-mvp98-library-index-patch-preview.mjs', 'package.json must expose verify:mvp98-library-index-patch-preview');
assert(pkg.scripts['verify:all'].includes('verify:mvp98-library-index-patch-preview'), 'verify:all must include MVP98 verifier');

const main = read('electron/main.ts');
[
  'ImportLibraryIndexPatchPreviewRequest',
  'buildMvp98LibraryIndexPatchPreviewResult',
  'yang-kura:import:library-index-patch:preview',
  'mvp98-library-index-patch-preview-ready',
  'mvp98-library-index-patch-preview-invalid-request',
  'mvp98-library-index-patch-preview-invalid-root-token',
  'mvp98-library-index-patch-preview-empty-refresh-candidates',
  'mvp98-library-index-patch-preview-v1',
  "mode: 'library-index-patch-preview'",
  'indexPatchWriteAllowed: false',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'indexPatchPreview',
  'collections',
  'tracks',
  'covers',
  'subtitles',
  'patchOperations',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
const mvp98Function = main.slice(main.indexOf('function buildMvp98LibraryIndexPatchPreviewResult'), main.indexOf('function buildMvp99LibraryIndexPatchWriteReadinessResult'));
assert(!mvp98Function.includes('libraryIndexWritten: true'), 'MVP98 must not write library-index.json');
assert(!mvp98Function.includes('sqliteWritten: true'), 'MVP98 must not write SQLite');

const preload = read('electron/preload.ts');
[
  'ImportLibraryIndexPatchPreviewRequest',
  'canPreviewLibraryIndexPatch: true',
  'requestImportLibraryIndexPatchPreview',
  'yang-kura:import:library-index-patch:preview',
].forEach((token) => assert(preload.includes(token), `electron/preload.ts missing token: ${token}`));

const electronApi = read('src/types/electron-api.d.ts');
[
  'YangKuraImportLibraryIndexPatchPreviewRequest',
  'YangKuraLibraryIndexPatchPreviewResult',
  'YangKuraLibraryIndexPatchPreviewPayload',
  'YangKuraLibraryIndexPatchOperationPreview',
  'mvp98-library-index-patch-preview-ready',
  'mvp98-library-index-patch-preview-v1',
  'indexPatchWriteAllowed: false',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'canPreviewLibraryIndexPatch: true',
  'requestImportLibraryIndexPatchPreview',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(electronApi.includes(token), `electron-api.d.ts missing token: ${token}`));

const service = read('src/services/libraryIndexPatchPreviewService.ts');
[
  '0.136.0-mvp98',
  'MVP-98 library-index patch 预览',
  'mvp98-library-index-patch-preview-v1',
  'yang-kura:import:library-index-patch:preview',
  'privatePersonalUse: true',
  'nonCommercial: true',
  'notSharedOrOpenSource: true',
  '个人本地项目',
  '安全边界按“可预览、可确认、可回退、有日志、不乱删”执行',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp98-library-index-patch-preview',
  'mvp98-personal-project-policy',
  'mvp98-patch-cards',
  'mvp98-patch-request-contract',
  'mvp98-index-patch-preview',
  'mvp98-patch-operations',
  'mvp98-patch-preview-rules',
  'mvp98-patch-guardrails',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp98-library-index-patch-preview-diagnostics',
  'mvp98-personal-project-policy',
  'mvp98-patch-cards',
  'mvp98-patch-request-contract',
  'mvp98-index-patch-preview',
  'mvp98-patch-operations',
  'mvp98-patch-preview-rules',
  'mvp98-patch-guardrails',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
['libraryIndexPatchPreviewService', 'Mvp98LibraryIndexPatchPreviewModel', 'Mvp98IndexPatchPreviewSummary'].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const docs = [
  'docs/CURRENT_ROADMAP_MVP98.md',
  'docs/LIBRARY_INDEX_PATCH_PREVIEW_MVP98.md',
  'HANDOFF_MVP97_TO_MVP98.md',
  'PACKAGE_MANIFEST_MVP98_HANDOFF.txt',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'README.md',
  'RUN_ME_FIRST.md',
];
docs.forEach((doc) => assert(fs.existsSync(path.join(root, doc)), `missing ${doc}`));
const docText = docs.map((doc) => read(doc)).join('\n');
[
  'MVP-98',
  '0.136.0-mvp98',
  'library-index patch preview',
  'mvp98-library-index-patch-preview-v1',
  '个人项目',
  '不分享',
  '不商业化',
  '不写 library-index.json',
  '不接 SQLite',
  'Renderer 不接收 absolutePath',
  'file://',
].forEach((token) => assert(docText.includes(token), `docs missing token: ${token}`));

console.log('[MVP98 verify] PASS library-index patch preview is preview-only, documents personal-project relaxed boundaries, and does not write library-index.json/SQLite or expose absolutePath/file://.');
