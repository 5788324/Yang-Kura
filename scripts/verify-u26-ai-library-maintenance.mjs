import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const settingsPath = 'src/components/SettingsPage.tsx';
const settings = fs.readFileSync(settingsPath, 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const rules = fs.readFileSync('docs/UI_DAILY_SURFACE_RULES.md', 'utf8');
const u26 = fs.readFileSync('docs/U26_AI_LIBRARY_MAINTENANCE.md', 'utf8');

const transpiled = ts.transpileModule(settings, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: settingsPath,
  reportDiagnostics: true,
});
const errors = (transpiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, `SettingsPage TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

const detailsOpening = settings.match(/<details id="u26-settings-ai-library-maintenance"([^>]*)>/)?.[0];
assert.ok(detailsOpening, 'U26 AI library maintenance details missing');
assert.ok(!/\sopen(?:\s|=|>)/.test(detailsOpening), 'AI library maintenance must be closed by default');

for (const marker of [
  '<summary',
  'AI 维护',
  '资源库检修',
  '日常无需展开',
  'id="u26-settings-ai-library-maintenance-panel"',
]) {
  assert.ok(settings.includes(marker), `U26 maintenance disclosure missing: ${marker}`);
}

const detailsStart = settings.indexOf('id="u26-settings-ai-library-maintenance"');
const detailsEnd = settings.indexOf('</details>', detailsStart);
assert.ok(detailsStart >= 0 && detailsEnd > detailsStart, 'U26 maintenance details boundary invalid');

const requiredMaintenanceMarkers = [
  'id="mvp127-library-index-health-management"',
  'id="mvp128-controlled-index-cleanup"',
  'id="mvp129-index-maintenance-closeout"',
  'id="mvp39-advanced-library-tools"',
];
let previousIndex = detailsStart;
for (const marker of requiredMaintenanceMarkers) {
  const index = settings.indexOf(marker);
  assert.ok(index > previousIndex && index < detailsEnd, `maintenance capability not enclosed in AI maintenance: ${marker}`);
  previousIndex = index;
}

const regressionOpening = settings.match(/<div id="mvp54-settings-regression-path"([^>]*)>/)?.[0];
assert.ok(regressionOpening, 'MVP54 compatibility marker missing');
assert.ok(/\shidden(?:\s|=|>)/.test(regressionOpening) && regressionOpening.includes('aria-hidden="true"'), 'MVP54 historical regression card must remain hidden');

const asmrLibraryIndex = settings.indexOf('ASMR / RJ 音声库目录');
assert.ok(asmrLibraryIndex > detailsEnd, 'daily ASMR path management must remain outside AI maintenance');

for (const marker of [
  '选择本地资源库目录',
  '打包版快速导入',
  '读取已有记录',
  '一键扫描并应用',
  '音乐库路径',
]) {
  assert.ok(settings.includes(marker), `daily library capability missing: ${marker}`);
}

for (const marker of [
  'handleCheckLibraryIndexHealth',
  'handleGenerateIndexRemovalPreview',
  'handleWriteIndexRemoval',
  'handleLoadIndexMaintenance',
  'handleRestoreIndexBackup',
  'handlePreviewBackupRetention',
  'handleRunDryRunPreview',
  'handleGenerateIndexWritePreview',
]) {
  assert.ok(settings.includes(marker), `maintenance handler removed: ${marker}`);
}

const projectText = `${state}\n${roadmap}\n${rules}\n${u26}`;
for (const marker of [
  'U26',
  'AI 维护',
  '缺失文件检查',
  '备份恢复',
  '默认折叠',
  '日常层只展示用户实际会使用的功能',
]) {
  assert.ok(projectText.includes(marker), `U26 project record missing: ${marker}`);
}

console.log('U26 AI library maintenance verifier PASS');
