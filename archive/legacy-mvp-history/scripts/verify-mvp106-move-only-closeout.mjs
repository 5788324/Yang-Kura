#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[MVP106 verify] ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(pkg.version), `package version must be 0.144.0-mvp106 or compatible 0.145.0-mvp107, got ${pkg.version}`);
assert(['0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(lock.version) || ['0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.144.0-mvp106 or compatible 0.145.0-mvp107');
assert(pkg.scripts['verify:mvp106-move-only-closeout'] === 'node scripts/verify-mvp106-move-only-closeout.mjs', 'package.json must expose MVP106 verifier');
assert(pkg.scripts['verify:all'].includes('verify:mvp106-move-only-closeout'), 'verify:all must include MVP106 verifier');

const service = read('src/services/moveOnlyCloseoutService.ts');
[
  '0.144.0-mvp106',
  'MVP-106 move-only 导入收口',
  'mvp106-move-only-closeout-v1',
  "mode: 'move-only-closeout'",
  'copyOnlyChainClosed: true',
  'moveOnlyChainClosed: true',
  'smallSampleOnly: true',
  'operationLogRequired: true',
  'failureStopRequired: true',
  'overwriteAllowed: false',
  'sourceDirectoryCleanupAllowed: false',
  'libraryIndexWrittenInMvp106: false',
  'sqliteWritten: false',
  'downloaderTouched: false',
  'metadataProviderTouched: false',
  'mpvTouched: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'codexRequired: false',
  'MVP107 importer daily UI cleanup',
  '用户本人不会维护工程说明',
  'Codex 非必要不安排',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));
['libraryIndexWrittenInMvp106: true','sqliteWritten: true','absolutePathReturned: true','fileUrlReturned: true','codexRequired: true'].forEach((token) => assert(!service.includes(token), `service must not contain ${token}`));
['fs.rename(', 'fs.rm(', 'fs.unlink(', 'fs.writeFile(', 'fs.copyFile('].forEach((token) => assert(!service.includes(token), `MVP106 service must not call ${token}`));

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('moveOnlyCloseoutService'), 'services/index must export moveOnlyCloseoutService');
assert(serviceIndex.includes('Mvp106MoveOnlyCloseoutModel'), 'services/index must export MVP106 model type');

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp106-move-only-closeout',
  'mvp106-move-closeout-cards',
  'mvp106-closeout-result',
  'mvp106-user-summary',
  'mvp106-ai-maintenance-summary',
  'mvp106-next-cleanup-policy',
  'moveOnlyCloseoutService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp106-move-only-closeout-diagnostics',
  'mvp106-move-closeout-cards',
  'mvp106-closeout-result',
  'mvp106-ai-maintenance-summary',
  'mvp106-next-cleanup-policy',
  'moveOnlyCloseoutService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP106.md',
  'docs/MOVE_ONLY_CLOSEOUT_MVP106.md',
  'HANDOFF_MVP105_TO_MVP106.md',
  'PACKAGE_MANIFEST_MVP106_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/CURRENT_ROADMAP_MVP106.md','docs/MOVE_ONLY_CLOSEOUT_MVP106.md'].map(read).join('\n');
[
  '0.144.0-mvp106',
  'move-only closeout',
  'mvp106-move-only-closeout-v1',
  'MVP103-MVP105',
  'MVP107 importer daily UI cleanup',
  '不新增真实 move',
  '不再次写 library-index.json',
  '不接 SQLite',
  '不接下载器',
  '不接元数据 Provider',
  '不接 mpv',
  '不返回 absolutePath',
  '不返回 file://',
  'Codex 非必要不安排',
  '用户本人不会维护工程说明',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP106 verify] PASS move-only closeout closes MVP103-MVP105, preserves small-sample/no-overwrite/failure-stop/log boundaries, does not add fs operations/index/SQLite/downloader/metadata/mpv/absolutePath/file://, and prepares MVP107 importer UI cleanup without Codex.');
