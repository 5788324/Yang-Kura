#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => { console.error(`[MVP107 verify] ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const compatibleVersions = ['0.145.0-mvp107', '0.146.0-mvp108'];
assert(compatibleVersions.includes(pkg.version), `package version must be 0.145.0-mvp107 or compatible 0.146.0-mvp108, got ${pkg.version}`);
assert(compatibleVersions.includes(lock.version) || compatibleVersions.includes(lock.packages?.['']?.version), 'package-lock root version must be 0.145.0-mvp107 or compatible 0.146.0-mvp108');
assert(pkg.scripts['verify:mvp107-importer-daily-ui-cleanup'] === 'node scripts/verify-mvp107-importer-daily-ui-cleanup.mjs', 'package.json must expose MVP107 verifier');
assert(pkg.scripts['verify:all'].includes('verify:mvp107-importer-daily-ui-cleanup'), 'verify:all must include MVP107 verifier');

const service = read('src/services/importerDailyUiCleanupService.ts');
[
  '0.145.0-mvp107',
  'MVP-107 导入器日常界面简化',
  'mvp107-importer-daily-ui-cleanup-v1',
  'mode: "importer-daily-ui-cleanup"',
  'copyOnlyChainClosed: true',
  'moveOnlyChainClosed: true',
  'dailyImporterSurfaceEnabled: true',
  'aiMaintenanceFoldEnabled: true',
  'userFacingFirst: true',
  'engineeringDetailsHiddenByDefault: true',
  'importerExecutionChanged: false',
  'fileOperationsChanged: false',
  'libraryIndexWrittenInMvp107: false',
  'sqliteWritten: false',
  'downloaderTouched: false',
  'metadataProviderTouched: false',
  'mpvTouched: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'codexRequired: false',
  '用户本人不会阅读和维护工程说明',
  'MVP108 importer final regression checklist',
].forEach((token) => assert(service.includes(token), `service missing token: ${token}`));
['importerExecutionChanged: true','fileOperationsChanged: true','libraryIndexWrittenInMvp107: true','sqliteWritten: true','absolutePathReturned: true','fileUrlReturned: true','codexRequired: true'].forEach((token) => assert(!service.includes(token), `service must not contain ${token}`));
['fs.rename(', 'fs.rm(', 'fs.unlink(', 'fs.writeFile(', 'fs.copyFile(', 'ipcMain.handle('].forEach((token) => assert(!service.includes(token), `MVP107 service must not call ${token}`));

const importer = read('src/components/ImporterPage.tsx');
[
  'importerDailyUiCleanupService',
  'mvp107-importer-daily-ui-cleanup',
  'mvp107-daily-import-status-cards',
  'mvp107-daily-import-actions',
  'mvp107-daily-import-steps',
  'mvp107-user-facing-importer-surface',
  'mvp107-importer-ai-maintenance-fold',
  'mvp107-hidden-engineering-details',
  'AI 维护区 / 历史工程说明（默认折叠）',
].forEach((token) => assert(importer.includes(token), `ImporterPage missing token: ${token}`));
['fs.rename(', 'fs.rm(', 'fs.unlink(', 'fs.writeFile(', 'fs.copyFile('].forEach((token) => assert(!importer.includes(token), `ImporterPage must not contain ${token}`));

const diagnostics = read('src/components/DiagnosticsPage.tsx');
[
  'importerDailyUiCleanupService',
  'mvp107-importer-daily-ui-cleanup-diagnostics',
  'mvp107-daily-import-status-cards-diagnostics',
  'mvp107-importer-ai-maintenance-summary',
  'mvp107-cleanup-result',
  'mvp107-not-touched',
].forEach((token) => assert(diagnostics.includes(token), `DiagnosticsPage missing token: ${token}`));

const serviceIndex = read('src/services/index.ts');
['importerDailyUiCleanupService','Mvp107ImporterDailyUiCleanupModel','Mvp107ImporterDailyUiCleanupResult'].forEach((token) => assert(serviceIndex.includes(token), `services/index missing token: ${token}`));

[
  'docs/CURRENT_ROADMAP_MVP107.md',
  'docs/IMPORTER_DAILY_UI_CLEANUP_MVP107.md',
  'HANDOFF_MVP106_TO_MVP107.md',
  'PACKAGE_MANIFEST_MVP107_HANDOFF.txt',
].forEach((file) => assert(exists(file), `${file} must exist`));

const docs = ['README.md','PROJECT_STATE.md','NEXT_CHAT_HANDOFF.md','RUN_ME_FIRST.md','docs/CURRENT_ROADMAP_MVP107.md','docs/IMPORTER_DAILY_UI_CLEANUP_MVP107.md'].map(read).join('\n');
[
  '0.145.0-mvp107',
  'importer daily UI cleanup',
  'mvp107-importer-daily-ui-cleanup-v1',
  'AI 维护区',
  '用户本人不会看，也不会维护',
  '导入器主页面只保留',
  '不改 copy-only executor',
  '不改 move-only executor',
  '不再次写 library-index.json',
  '不接 SQLite',
  '不接下载器',
  '不接元数据 Provider',
  '不接 mpv',
  '不返回 absolutePath',
  '不返回 file://',
  'Codex 非必要不安排',
].forEach((token) => assert(docs.includes(token), `docs missing token: ${token}`));

console.log('[MVP107 verify] PASS importer daily UI cleanup adds a user-facing daily importer surface, folds MVP86-MVP106 engineering details into AI maintenance, and does not change import execution/file/index/SQLite/downloader/metadata/mpv/path exposure scope.');
