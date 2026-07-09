#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`[MVP103 verify] ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.141.0-mvp103', '0.142.0-mvp104', '0.143.0-mvp105', '0.144.0-mvp106', '0.145.0-mvp107', '0.146.0-mvp108'];
assert(compatibleVersions.includes(pkg.version), `package version must be 0.141.0-mvp103 or compatible 0.142.0-mvp104/0.143.0-mvp105/0.144.0-mvp106/0.145.0-mvp107, got ${pkg.version}`);
assert(compatibleVersions.includes(lock.version) || compatibleVersions.includes(lock.packages?.['']?.version), 'package-lock root version must be 0.141.0-mvp103 or compatible 0.142.0-mvp104/0.143.0-mvp105/0.144.0-mvp106/0.145.0-mvp107');
assert(pkg.scripts['verify:mvp103-move-only-strategy'] === 'node scripts/verify-mvp103-move-only-strategy.mjs', 'package.json must expose verify:mvp103-move-only-strategy');
assert(pkg.scripts['verify:all'].includes('verify:mvp103-move-only-strategy'), 'verify:all must include MVP103 verifier');

const service = read('src/services/moveOnlyStrategyService.ts');
[
  '0.141.0-mvp103',
  'MVP-103 move-only 导入策略',
  'mvp103-move-only-strategy-v1',
  'actualMoveImplemented: false',
  'moveOperationTouched: false',
  'deleteOperationTouched: false',
  'renameOperationTouched: false',
  'copyOperationTouched: false',
  'libraryIndexWritten: false',
  'operationLogWritten: false',
  'sqliteWritten: false',
  'scannerRunTriggered: false',
  'downloaderTouched: false',
  'metadataProviderTouched: false',
  'mpvTouched: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'codexRequired: false',
  'MVP104 move-only execution readiness',
  'UI 清理后置',
  '诊断页 / AI 维护区',
  'Codex 非必要不安排',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));

['fs.rename(', 'fs.rm(', 'fs.unlink(', 'fs.writeFile(', 'fs.copyFile(', 'actualMoveImplemented: true', 'moveOperationTouched: true', 'sqliteWritten: true', 'absolutePathReturned: true', 'fileUrlReturned: true'].forEach((token) => {
  assert(!service.includes(token), `service must not contain ${token}`);
});

const serviceIndex = read('src/services/index.ts');
assert(serviceIndex.includes('moveOnlyStrategyService'), 'services/index must export moveOnlyStrategyService');
assert(serviceIndex.includes('Mvp103MoveOnlyStrategyModel'), 'services/index must export MVP103 model type');

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp103-move-only-strategy',
  'mvp103-move-only-cards',
  'mvp103-strategy-preview',
  'mvp103-move-only-phases',
  'mvp103-move-rules',
  'mvp103-ui-policy',
  'mvp103-guardrails',
  'moveOnlyStrategyService',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'mvp103-move-only-strategy-diagnostics',
  'mvp103-move-only-cards',
  'mvp103-strategy-preview',
  'mvp103-move-only-phases',
  'mvp103-ui-policy',
  'mvp103-guardrails',
  'moveOnlyStrategyService',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP103.md',
  'docs/MOVE_ONLY_STRATEGY_MVP103.md',
  'HANDOFF_MVP102_TO_MVP103.md',
  'PACKAGE_MANIFEST_MVP103_HANDOFF.txt',
].forEach((file) => assert(fs.existsSync(path.join(root, file)), `${file} must exist`));

const docs = ['README.md', 'PROJECT_STATE.md', 'NEXT_CHAT_HANDOFF.md', 'RUN_ME_FIRST.md', 'docs/CURRENT_ROADMAP_MVP103.md', 'docs/MOVE_ONLY_STRATEGY_MVP103.md'].map(read).join('\n');
[
  '0.141.0-mvp103',
  'move-only strategy',
  'mvp103-move-only-strategy-v1',
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
  '诊断页 / AI 维护区',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP103 verify] PASS move-only strategy is documented, surfaced in importer/diagnostics, keeps real move/fs.rename/fs.rm/fs.unlink/SQLite/downloader/metadata/mpv/absolutePath/file:// out of scope, and records Codex/UI cleanup policy.');
