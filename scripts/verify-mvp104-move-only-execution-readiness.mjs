#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP104 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(pkg.version), `package version must be 0.142.0-mvp104 or compatible 0.143.0-mvp105/0.144.0-mvp106/0.145.0-mvp107, got ${pkg.version}`);
assert(['0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(lock.version) || ['0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'].includes(lock.packages?.['']?.version), 'package-lock root version must be 0.142.0-mvp104 or compatible 0.143.0-mvp105/0.144.0-mvp106/0.145.0-mvp107');
assert(pkg.scripts['verify:mvp104-move-only-execution-readiness'] === 'node scripts/verify-mvp104-move-only-execution-readiness.mjs', 'package.json must expose verify:mvp104-move-only-execution-readiness');
assert(pkg.scripts['verify:all'].includes('verify:mvp104-move-only-execution-readiness'), 'verify:all must include MVP104 verifier');

const service = read('src/services/moveOnlyExecutionReadinessService.ts');
[
  '0.142.0-mvp104',
  'MVP-104 move-only 执行前门禁',
  'mvp104-move-only-execution-readiness-v1',
  'move-only-execution-readiness',
  'CONFIRM_MOVE_IMPORT',
  'disabled-readiness-only',
  'canExecuteMoveInMvp104: false',
  'realMoveExecuted: false',
  'fsRenameCalled: false',
  'fsRmCalled: false',
  'fsUnlinkCalled: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'sqliteWritten: false',
  'libraryIndexWritten: false',
  'MVP105 small-sample move-only executor',
  '不安排 Codex',
  'UI 清理不插队',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

['fs.rename(', 'fs.rm(', 'fs.unlink(', 'fs.writeFile(', 'fs.copyFile(', 'realMoveExecuted: true', 'fsRenameCalled: true', 'sqliteWritten: true', 'absolutePathReturned: true', 'fileUrlReturned: true'].forEach((token) => {
  assert(!service.includes(token), `service must not contain ${token}`);
});

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('moveOnlyExecutionReadinessService'), 'services/index must export moveOnlyExecutionReadinessService');
assert(serviceIndex.includes('Mvp104MoveOnlyExecutionReadinessModel'), 'services/index must export MVP104 model type');

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp104-move-only-execution-readiness',
  'mvp104-move-readiness-cards',
  'mvp104-readiness-result',
  'mvp104-move-preflight-checks',
  'mvp104-required-executor-inputs',
  'mvp104-failure-stop-policy',
  'mvp104-personal-speed-policy',
  'moveOnlyExecutionReadinessService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp104-move-only-execution-readiness-diagnostics',
  'mvp104-move-readiness-cards',
  'mvp104-readiness-result',
  'mvp104-move-preflight-checks',
  'mvp104-required-executor-inputs',
  'mvp104-failure-stop-policy',
  'moveOnlyExecutionReadinessService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP104.md',
  'docs/MOVE_ONLY_EXECUTION_READINESS_MVP104.md',
  'HANDOFF_MVP103_TO_MVP104.md',
  'PACKAGE_MANIFEST_MVP104_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP104.md', 'docs/MOVE_ONLY_EXECUTION_READINESS_MVP104.md'].map(read).join('\n');
[
  '0.142.0-mvp104',
  'move-only execution readiness',
  'mvp104-move-only-execution-readiness-v1',
  'CONFIRM_MOVE_IMPORT',
  'disabled-readiness-only',
  '不执行真实 move',
  'fs.rename',
  'fs.rm',
  'fs.unlink',
  '不接 SQLite',
  '不接下载器',
  '不接元数据 Provider',
  '不接 mpv',
  'absolutePath',
  'file://',
  'Codex 非必要不安排',
  'UI 清理不插队',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP104 verify] PASS move-only execution readiness gate is documented, surfaced in importer/diagnostics, keeps real move/fs.rename/fs.rm/fs.unlink/SQLite/downloader/metadata/mpv/absolutePath/file:// out of scope, and prepares MVP105 without requiring Codex.');
