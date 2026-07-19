#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const importer = read('src/components/ImporterPage.tsx');
const importerWorkflowPath = path.resolve('src/features/importer/importerDailyWorkflow.ts');
const importerWorkflowSource = read('src/features/importer/importerDailyWorkflow.ts');
const app = read('src/App.tsx');
const router = read('src/app/AppRouter.tsx');
const libraryPage = read('src/features/library/AsmrLibraryPage.tsx');
const settings = read('src/components/SettingsPageDaily.tsx');
const versionSource = read('src/appVersion.ts');
const vite = read('vite.config.ts');
const main = read('electron/main.ts');
const preloadContract = read('electron/preload/contracts.ts');
const typings = read('src/types/electron-api.d.ts');
const cdpRuntime = read('scripts/u40b/cdp-runtime.mjs');
const stable = read('scripts/run-stable-regression.mjs');
const workflow = read('.github/workflows/u41b-daily-user-entry.yml');
const pkg = JSON.parse(read('package.json'));

for (const token of [
  'data-u41b-importer-daily="ready"',
  "selectionRole: 'import-source'",
  "selectionRole: 'import-target'",
  'requestScannerDryRun',
  'requestImportCopyOnlyPreflight',
  'requestImportCopyOnlyExecute',
  'requestImportMoveOnlyExecute',
  'requestImportPostCopyRefreshPreview',
  'requestImportLibraryIndexPatchPreview',
  'requestImportLibraryIndexPatchWriteReadiness',
  'requestImportLibraryIndexPatchWrite',
  'requestImportLibraryIndexPatchRefreshAfterWrite',
  'libraryReadCoordinatorService.acceptResult',
  'CONFIRM_MOVE_IMPORT',
  'COPY ONLY',
]) assert.match(importer, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `ImporterPage missing ${token}`);

assert.ok(importer.split('\n').length < 800, 'daily importer must stay compact and must not restore the historical 4000-line model page');
assert.doesNotMatch(importer, /importerUiStateService|importerMvp\d+|mock preview only|只预览不执行/i);
assert.match(preloadContract, /selectionRole\?: 'library-root' \| 'import-source' \| 'import-target'/);
assert.match(typings, /selectionRole\?: 'library-root' \| 'import-source' \| 'import-target'/);
assert.match(main, /YANG_KURA_E2E_IMPORT_SOURCE_ROOT/);
assert.match(main, /YANG_KURA_E2E_IMPORT_TARGET_ROOT/);
assert.match(main, /选择导入来源目录/);
assert.match(main, /选择目标资源库目录/);
assert.match(cdpRuntime, /extraEnv = \{\}/);
assert.match(cdpRuntime, /\.\.\.extraEnv/);

assert.doesNotMatch(app, /handleRefetchRjMetadata|randomCover|演示数据未联网|本地显示信息已刷新/);
assert.doesNotMatch(router, /onRefetchRjMetadata/);
assert.doesNotMatch(libraryPage, /刷新卡片显示信息|onRefetchRjMetadata|randomCover/);

assert.match(settings, /YANG_KURA_APP_VERSION/);
assert.doesNotMatch(settings, /0\.169\.0-beta\.2/);
assert.match(versionSource, /__YANG_KURA_APP_VERSION__/);
assert.match(vite, /__YANG_KURA_APP_VERSION__/);
assert.equal(pkg.version, '0.170.0-beta.3');
assert.equal(pkg.scripts?.['verify:u41b-daily-user-entry'], 'node scripts/verify-u41b-daily-user-entry.mjs');
assert.equal(pkg.scripts?.['test:u41b:importer-e2e'], 'node scripts/test-u41b-importer-daily-e2e.mjs');
assert.match(stable, /verify:u41b-daily-user-entry/);
assert.match(workflow, /npm run verify:u41b-daily-user-entry/);
assert.match(workflow, /npm run test:u31:importer-transactions/);
assert.match(workflow, /npm run test:u41b:importer-e2e/);

const transpiled = ts.transpileModule(importerWorkflowSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  fileName: importerWorkflowPath,
}).outputText;
const helper = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`);
assert.equal(helper.normalizeImportRelativePath('a\\b\\01.wav'), 'a/b/01.wav');
assert.throws(() => helper.normalizeImportRelativePath('../escape.wav'));
assert.throws(() => helper.normalizeImportRelativePath('C:/escape.wav'));
assert.equal(helper.sanitizeImportFolderName('RJ:123? / demo. '), 'RJ_123_/demo');
assert.equal(helper.buildImportTargetRelativePath('RJ001', 'disc\\01.wav'), 'RJ001/disc/01.wav');
assert.equal(helper.getImportExecutionLimit('copy'), 200);
assert.equal(helper.getImportExecutionLimit('move'), 20);
assert.equal(helper.isImportableScannerEntry({ entryKind: 'audio', plannedAction: 'include-track' }), true);
assert.equal(helper.isImportableScannerEntry({ entryKind: 'directory', plannedAction: 'create-collection-candidate' }), false);

console.log('[U41-B daily user entry] PASS');
console.log('importer=real tokenized four-step flow; fake metadata refresh removed; version=single source');
