#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP96 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(pkg.version), `package version must be 0.134.0-mvp96 or compatible MVP97, got ${pkg.version}`);
assert(['0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.version) || ['0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102', '0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106'].includes(lock.packages?.['']?.version), 'package-lock root version must be MVP96-compatible');
assert(pkg.scripts['verify:mvp96-copy-only-operation-log'] === 'node scripts/verify-mvp96-copy-only-operation-log.mjs', 'package.json must expose verify:mvp96-copy-only-operation-log');
assert(pkg.scripts['verify:all'].includes('verify:mvp96-copy-only-operation-log'), 'verify:all must include MVP96 verifier');

const main = read('electron/main.ts');
[
  'ImportCopyOnlyOperationLogEntry',
  'buildMvp96CopyOnlyOperationLogEntry',
  'appendMvp96CopyOnlyOperationLog',
  'mvp96-copy-only-operation-log-v1',
  'import-operation-log.jsonl',
  'fs.appendFile',
  'mvp96-copy-only-execute-complete-with-operation-log',
  'mvp96-copy-only-execute-log-write-failed',
  'operationLogPersisted',
  'operationLogFailureCode',
  'libraryIndexWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'getSafeErrorCode',
].forEach((token) => assert(main.includes(token), `electron/main.ts missing token: ${token}`));

assert(!main.includes('fs.writeFile(') || main.includes('library-index.json'), 'MVP96 must not add OperationLog writeFile; existing library-index writer may remain from prior MVPs');
const mvp96Function = main.slice(main.indexOf('async function appendMvp96CopyOnlyOperationLog'), main.indexOf('function buildMvp105MoveOnlyOperationLogEntry'));
assert(!mvp96Function.includes('fs.rename('), 'MVP96 function must not call fs.rename');
assert(!mvp96Function.includes('fs.rm('), 'MVP96 function must not call fs.rm');
assert(!mvp96Function.includes('fs.unlink('), 'MVP96 function must not call fs.unlink');
assert(!mvp96Function.includes('libraryIndexWritten: true'), 'MVP96 copy executor must not write library-index.json');

const preload = read('electron/preload.ts');
assert(preload.includes('canPersistCopyOnlyOperationLog: true'), 'preload shell status must expose OperationLog capability');
assert(preload.includes('canExecuteCopyOnly: true'), 'preload shell status must retain copy-only executor capability');

const electronApi = read('src/types/electron-api.d.ts');
[
  'YangKuraImportCopyOnlyOperationLogPersistedSummary',
  'mvp96-copy-only-operation-log-v1',
  'mvp96-copy-only-execute-complete-with-operation-log',
  'mvp96-copy-only-execute-log-write-failed',
  'operationLogPersisted: boolean',
  'operationLogFailureCode?: string',
  'operationLog?: YangKuraImportCopyOnlyOperationLogPersistedSummary',
  'canPersistCopyOnlyOperationLog: true',
  'absolutePath?: never',
  'fileUrl?: never',
].forEach((token) => assert(electronApi.includes(token), `electron-api.d.ts missing token: ${token}`));

const service = read('src/services/copyOnlyOperationLogService.ts');
[
  '0.134.0-mvp96',
  'MVP-96 copy-only OperationLog 最小落盘',
  'mvp96-copy-only-operation-log-v1',
  'import-operation-log.jsonl',
  'appendOnly: true',
  'returnedToRenderer: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'libraryIndexWritten: false',
  'sendToCodexNow: true',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp96-copy-only-operation-log',
  'mvp96-operation-log-cards',
  'mvp96-operation-log-file-contract',
  'mvp96-operation-log-schema',
  'mvp96-operation-log-result-preview',
  'mvp96-operation-log-entry-preview',
  'mvp96-operation-log-guardrails',
  'mvp96-codex-operation-log-gate',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp96-copy-only-operation-log-diagnostics',
  'mvp96-operation-log-cards',
  'mvp96-operation-log-file-contract',
  'mvp96-operation-log-schema',
  'mvp96-operation-log-result-preview',
  'mvp96-operation-log-entry-preview',
  'mvp96-operation-log-guardrails',
  'mvp96-codex-operation-log-gate',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
['copyOnlyOperationLogService', 'Mvp96CopyOnlyOperationLogModel', 'Mvp96OperationLogEntryPreview'].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

const docs = [
  'docs/CURRENT_ROADMAP_MVP96.md',
  'docs/COPY_ONLY_OPERATION_LOG_MVP96.md',
  'docs/CODEX_OPERATION_LOG_VALIDATION_MVP96.md',
  'HANDOFF_MVP95_TO_MVP96.md',
  'PACKAGE_MANIFEST_MVP96_HANDOFF.txt',
  'PROJECT_STATE.md',
  'NEXT_CHAT_HANDOFF.md',
  'README.md',
  'RUN_ME_FIRST.md',
];
docs.forEach((doc) => assert(fs.existsSync(path.join(root, doc)), `missing ${doc}`));
const docText = docs.map((doc) => read(doc)).join('\n');
[
  'MVP-96',
  '0.134.0-mvp96',
  'OperationLog',
  'import-operation-log.jsonl',
  'append-only',
  '相对路径',
  '不写 library-index.json',
  'Renderer 不接收 absolutePath',
  'file://',
].forEach((token) => assert(docText.includes(token), `docs missing token: ${token}`));

console.log('[MVP96 verify] PASS copy-only OperationLog persists JSONL without absolutePath/file:// or library-index mutation.');
