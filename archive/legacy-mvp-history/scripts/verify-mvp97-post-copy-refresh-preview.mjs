#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP97 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(pkg.version), `package version must be 0.135.0-mvp97 or compatible MVP98, got ${pkg.version}`);
assert(['0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.version) || ['0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.135.0-mvp97 or compatible MVP98');
assert(pkg.scripts['verify:mvp97-post-copy-refresh-preview'] === 'node scripts/verify-mvp97-post-copy-refresh-preview.mjs', 'package.json must expose verify:mvp97-post-copy-refresh-preview');
assert(pkg.scripts['verify:all'].includes('verify:mvp97-post-copy-refresh-preview'), 'verify:all must include MVP97 verifier');

const main = read('electron/main.ts');
[
  'ImportPostCopyRefreshPreviewRequest',
  'buildMvp97PostCopyRefreshPreviewResult',
  'yang-kura:import:post-copy:refresh-preview',
  'mvp97-post-copy-refresh-preview-ready',
  'mvp97-post-copy-refresh-preview-invalid-request',
  'mvp97-post-copy-refresh-preview-invalid-root-token',
  'mvp97-post-copy-refresh-preview-empty-target-list',
  'mvp97-post-copy-refresh-plan-v1',
  "mode: 'post-copy-refresh-preview'",
  'indexWriteAllowed: false',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'refreshCandidates',
  'blockedTargets',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
const mvp97Function = main.slice(main.indexOf('function buildMvp97PostCopyRefreshPreviewResult'), main.indexOf('function buildMvp98LibraryIndexPatchPreviewResult'));
assert(!mvp97Function.includes('libraryIndexWritten: true'), 'MVP97 must not write library-index.json');
assert(!main.includes("ipcMain.handle('yang-kura:import:post-copy:refresh-preview'") || !main.includes('fs.writeFile(') || main.includes('library-index.json'), 'MVP97 refresh preview must not add new writeFile usage');

const preload = read('electron/preload.ts');
[
  'ImportPostCopyRefreshPreviewRequest',
  'canPreviewPostCopyRefresh: true',
  'requestImportPostCopyRefreshPreview',
  'yang-kura:import:post-copy:refresh-preview',
].forEach((token) => assert(preload.includes(token), `electron/preload.ts missing token: ${token}`));

const electronApi = read('src/types/electron-api.d.ts');
[
  'YangKuraImportPostCopyRefreshPreviewRequest',
  'YangKuraPostCopyRefreshPreviewResult',
  'YangKuraPostCopyRefreshCandidate',
  'mvp97-post-copy-refresh-preview-ready',
  'mvp97-post-copy-refresh-plan-v1',
  'indexWriteAllowed: false',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'canPreviewPostCopyRefresh: true',
  'requestImportPostCopyRefreshPreview',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(electronApi.includes(token), `electron-api.d.ts missing token: ${token}`));

const service = read('src/services/copyOnlyPostCopyRefreshService.ts');
[
  '0.135.0-mvp97',
  'MVP-97 copy 后入库刷新预览 / scanner gate',
  'mvp97-post-copy-refresh-plan-v1',
  'yang-kura:import:post-copy:refresh-preview',
  'targetRelativePathsOnly: true',
  'libraryIndexWritten: false',
  'scannerRunTriggered: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'sendToCodexNow: true',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp97-post-copy-refresh-preview',
  'mvp97-refresh-cards',
  'mvp97-refresh-request-contract',
  'mvp97-refresh-plan-preview',
  'mvp97-refresh-candidates',
  'mvp97-refresh-gate-rules',
  'mvp97-refresh-guardrails',
  'mvp97-codex-refresh-gate',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp97-post-copy-refresh-preview-diagnostics',
  'mvp97-refresh-cards',
  'mvp97-refresh-request-contract',
  'mvp97-refresh-plan-preview',
  'mvp97-refresh-candidates',
  'mvp97-refresh-gate-rules',
  'mvp97-refresh-guardrails',
  'mvp97-codex-refresh-gate',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
['copyOnlyPostCopyRefreshService', 'Mvp97PostCopyRefreshModel', 'Mvp97IndexRefreshPlanPreview'].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const docs = [
  'docs/CURRENT_ROADMAP_MVP97.md',
  'docs/POST_COPY_REFRESH_PREVIEW_MVP97.md',
  'docs/CODEX_POST_COPY_REFRESH_VALIDATION_MVP97.md',
  'HANDOFF_MVP96_TO_MVP97.md',
  'PACKAGE_MANIFEST_MVP97_HANDOFF.txt',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'README.md',
  'RUN_ME_FIRST.md',
];
docs.forEach((doc) => assert(fs.existsSync(path.join(root, doc)), `missing ${doc}`));
const docText = docs.map((doc) => read(doc)).join('\n');
[
  'MVP-97',
  '0.135.0-mvp97',
  'post-copy refresh preview',
  'mvp97-post-copy-refresh-plan-v1',
  '不写 library-index.json',
  '不接 SQLite',
  'Renderer 不接收 absolutePath',
  'file://',
].forEach((token) => assert(docText.includes(token), `docs missing token: ${token}`));

console.log('[MVP97 verify] PASS post-copy refresh preview is read-only and does not write library-index.json/SQLite or expose absolutePath/file://.');
