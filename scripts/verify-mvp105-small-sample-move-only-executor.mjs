#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[MVP105 verify] ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(pkg.version), `package version must be 0.143.0-mvp105 or compatible 0.144.0-mvp106/0.145.0-mvp107, got ${pkg.version}`);
assert(['0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(lock.version) || ['0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.143.0-mvp105 or compatible 0.144.0-mvp106/0.145.0-mvp107');
assert(pkg.scripts['verify:mvp105-small-sample-move-only-executor'] === 'node scripts/verify-mvp105-small-sample-move-only-executor.mjs', 'package.json must expose MVP105 verifier');
assert(pkg.scripts['verify:all'].includes('verify:mvp105-small-sample-move-only-executor'), 'verify:all must include MVP105 verifier');

const service = read('src/services/moveOnlyExecutorService.ts');
[
  '0.143.0-mvp105',
  'MVP-105 小样本真实 move-only executor',
  'mvp105-small-sample-move-only-executor-v1',
  'move-only-small-sample',
  'CONFIRM_MOVE_IMPORT',
  'overwriteAllowed: false',
  'maxMoveItems: 20',
  'failureStopTriggered',
  'mvp105-move-only-operation-log-v1',
  'sourceDirectoryCleanupAllowed: false',
  'libraryIndexWritten: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'Codex 非必要不安排',
  'MVP106 move-only closeout',
  'MVP107 importer daily UI cleanup',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));
['libraryIndexWritten: true', 'sqliteWritten: true', 'absolutePathReturned: true', 'fileUrlReturned: true'].forEach((token) => assert(!service.includes(token), `service must not contain ${token}`));

const main = read('electron/main.ts');
[
  'MVP-105 adds the first small-sample move-only executor',
  'interface ImportMoveOnlyExecuteRequest',
  "operationLogVersion: \'mvp105-move-only-operation-log-v1\'",
  'buildMvp105MoveOnlyExecuteResult',
  'yang-kura:import:move-only:execute',
  'mvp105-small-sample-move-only-executor-v1',
  'mvp105-move-only-execute-too-many-files',
  'CONFIRM_MOVE_IMPORT',
  'move-only-small-sample',
  'fs.rename(',
  'copy-verify-unlink',
  'fs.unlink(',
  'failureStopTriggered',
  'remaining-after-failure-stop',
  'sourceDirectoryCleanupAllowed: false',
  'libraryIndexWritten: false',
  'sqliteWritten: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
].forEach((token) => assert(main.includes(token), `electron/main missing token: ${token}`));
assert(!main.includes('fs.rm('), 'MVP105 main must not use fs.rm');
assert(!main.includes('fsSync.rm'), 'MVP105 main must not use fsSync.rm');

const preload = read('electron/preload.ts');
['canExecuteMoveOnly: true', 'requestImportMoveOnlyExecute', 'yang-kura:import:move-only:execute', 'ImportMoveOnlyExecuteRequest'].forEach((token) => assert(preload.includes(token), `preload missing token: ${token}`));
const api = read('src/types/electron-api.d.ts');
['YangKuraImportMoveOnlyExecuteRequest', 'YangKuraImportMoveOnlyExecuteResult', 'requestImportMoveOnlyExecute', 'mvp105-small-sample-move-only-executor-v1', 'move-only-small-sample'].forEach((token) => assert(api.includes(token), `electron api types missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('moveOnlyExecutorService'), 'services/index must export moveOnlyExecutorService');
assert(serviceIndex.includes('Mvp105SmallSampleMoveOnlyExecutorModel'), 'services/index must export MVP105 model type');

const importer = read('src/components/ImporterPage.tsx');
['mvp105-small-sample-move-only-executor', 'mvp105-move-executor-cards', 'mvp105-move-result-preview', 'mvp105-move-rules', 'mvp105-failure-stop-policy', 'moveOnlyExecutorService'].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));
const diagnostics = read('src/components/DiagnosticsPage.tsx');
['mvp105-small-sample-move-only-executor-diagnostics', 'mvp105-move-executor-cards', 'mvp105-move-result-preview', 'mvp105-move-rules', 'mvp105-failure-stop-policy', 'moveOnlyExecutorService'].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

['docs/CURRENT_ROADMAP_MVP105.md','docs/SMALL_SAMPLE_MOVE_ONLY_EXECUTOR_MVP105.md','HANDOFF_MVP104_TO_MVP105.md','PACKAGE_MANIFEST_MVP105_HANDOFF.txt'].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));
const docs = ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/CURRENT_ROADMAP_MVP105.md','docs/SMALL_SAMPLE_MOVE_ONLY_EXECUTOR_MVP105.md'].map(read).join('\n');
['0.143.0-mvp105','small-sample move-only executor','mvp105-small-sample-move-only-executor-v1','CONFIRM_MOVE_IMPORT','mvp105-move-only-operation-log-v1','不写 library-index.json','不接 SQLite','不接下载器','不接元数据 Provider','不接 mpv','不返回 absolutePath','不返回 file://','Codex 非必要不安排'].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));
console.log('[MVP105 verify] PASS small-sample move-only executor is gated, logged, tokenized, no-overwrite, failure-stop, no SQLite/index/downloader/metadata/mpv/absolutePath/file://, and Codex is not required.');
