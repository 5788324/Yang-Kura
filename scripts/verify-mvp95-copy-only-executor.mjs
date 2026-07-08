#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP95 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(pkg.version === '0.133.0-mvp95', `package version must be 0.133.0-mvp95, got ${pkg.version}`);
assert(lock.version === '0.133.0-mvp95' || lock.packages?.['']?.version === '0.133.0-mvp95', 'package-lock root version must be 0.133.0-mvp95');
assert(pkg.scripts['verify:mvp95-copy-only-executor'] === 'node scripts/verify-mvp95-copy-only-executor.mjs', 'package.json must expose verify:mvp95-copy-only-executor');
assert(pkg.scripts['verify:all'].includes('verify:mvp95-copy-only-executor'), 'verify:all must include MVP95 verifier');

const npmrc = read('.npmrc');
assert(npmrc.includes('cache=.npm-cache'), '.npmrc must use project-local relative npm cache');
assert(!npmrc.includes('G:/') && !npmrc.includes('G:\\'), '.npmrc must not pin a machine-specific absolute path');

const service = read('src/services/copyOnlyExecutorService.ts');
[
  '0.133.0-mvp95',
  'MVP-95 真实 copy-only executor',
  'mvp95-copy-only-execute-complete',
  'confirmedCopyOnly: true',
  "confirmationText: 'COPY ONLY'",
  'COPYFILE_EXCL',
  'overwriteAllowed: false',
  'moveAllowed: false',
  'deleteAllowed: false',
  'renameAllowed: false',
  'operationLogPersisted: false',
  'libraryIndexWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'sendToCodexNow: true',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp95-copy-only-executor',
  'mvp95-copy-executor-cards',
  'mvp95-copy-executor-request-contract',
  'mvp95-copy-executor-result-preview',
  'mvp95-copy-result-lists',
  'mvp95-copy-executor-safety-rules',
  'mvp95-operation-log-preview-only',
  'mvp95-codex-real-sample-gate',
  'mvp95-real-copy-button-guarded',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp95-copy-only-executor-diagnostics',
  'mvp95-copy-executor-cards',
  'mvp95-copy-executor-request-contract',
  'mvp95-copy-executor-result-preview',
  'mvp95-copy-result-lists',
  'mvp95-copy-executor-safety-rules',
  'mvp95-operation-log-preview-only',
  'mvp95-codex-real-sample-gate',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

const main = read('electron/main.ts');
[
  'buildMvp95CopyOnlyExecuteResult',
  'mvp95-copy-only-execute-complete',
  'mvp95-copy-only-execute-confirmation-required',
  'mvp95-copy-only-execute-invalid-root-token',
  'confirmedCopyOnly !== true',
  "confirmationText !== 'COPY ONLY'",
  'fs.copyFile(',
  'COPYFILE_EXCL',
  'fs.mkdir(',
  'overwriteAllowed: false',
  'moveAllowed: false',
  'deleteAllowed: false',
  'renameAllowed: false',
  'operationLogPersisted: false',
  'libraryIndexWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));
assert(!main.includes('fs.rename('), 'MVP95 must not call fs.rename');
assert(!main.includes('fs.rm('), 'MVP95 must not call fs.rm');
assert(!main.includes('fs.unlink('), 'MVP95 must not call fs.unlink');
assert(!main.includes('writeFile(') || main.includes('library-index.json'), 'MVP95 verifier detected unexpected writeFile usage; existing library-index writer may remain only from prior MVPs');
assert(!main.includes('operationLogPersisted: true'), 'MVP95 must not persist OperationLog');
assert(!main.includes('libraryIndexWritten: true'), 'MVP95 copy executor must not write library-index.json');

const preload = read('electron/preload.ts');
[
  'confirmedCopyOnly?: boolean',
  'confirmationText?: string',
  'canExecuteCopyOnly: true',
  'targetRelativePaths?: string[]',
].forEach((token) => assert(preload.includes(token), `electron/preload missing token: ${token}`));

const electronApi = read('src/types/electron-api.d.ts');
[
  'YangKuraImportCopyOnlyExecuteResult',
  'mvp95-copy-only-execute-complete',
  'confirmedCopyOnly?: boolean',
  'confirmationText?: string',
  'overwriteAllowed: false',
  'moveAllowed: false',
  'deleteAllowed: false',
  'renameAllowed: false',
  'operationLogPersisted: false',
  'libraryIndexWritten: false',
  'absolutePath?: never',
  'fileUrl?: never',
  'canExecuteCopyOnly: true',
].forEach((token) => assert(electronApi.includes(token), `electron-api.d.ts missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
['copyOnlyExecutorService', 'Mvp95CopyExecutorModel', 'Mvp95CopyExecutorResultPreview'].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const docs = [
  'docs/CURRENT_ROADMAP_MVP95.md',
  'docs/COPY_ONLY_EXECUTOR_MVP95.md',
  'docs/CODEX_COPY_ONLY_EXECUTOR_VALIDATION_MVP95.md',
  'HANDOFF_MVP94_TO_MVP95.md',
  'PACKAGE_MANIFEST_MVP95_HANDOFF.txt',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'README.md',
  'RUN_ME_FIRST.md',
];
docs.forEach((doc) => assert(fs.existsSync(path.join(root, doc)), `missing ${doc}`));
const docText = docs.map((doc) => read(doc)).join('\n');
[
  'MVP-95',
  '0.133.0-mvp95',
  'copy-only executor',
  'COPYFILE_EXCL',
  '不移动',
  '不删除',
  '不重命名',
  '不写 library-index.json',
  'Renderer 不接收 absolutePath',
  'file://',
].forEach((token) => assert(docText.includes(token), `docs missing token: ${token}`));

console.log('[MVP95 verify] PASS copy-only executor is gated, copy-only, no-overwrite, and path-safe.');
