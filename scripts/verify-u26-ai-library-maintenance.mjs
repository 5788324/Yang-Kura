import fs from 'node:fs';
import ts from 'typescript';

const settingsPath = 'src/components/SettingsPage.tsx';
const settings = fs.readFileSync(settingsPath, 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const rules = fs.readFileSync('docs/UI_DAILY_SURFACE_RULES.md', 'utf8');
const u26 = fs.readFileSync('docs/U26_AI_LIBRARY_MAINTENANCE.md', 'utf8');
const failures = [];

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
if (errors.length > 0) {
  const formatted = errors.map((item) => {
    const message = ts.flattenDiagnosticMessageText(item.messageText, ' ');
    if (!item.file || item.start === undefined) return message;
    const location = item.file.getLineAndCharacterOfPosition(item.start);
    return `${location.line + 1}:${location.character + 1} ${message}`;
  });
  failures.push(`SettingsPage TypeScript diagnostics: ${formatted.join('; ')}`);
}

const detailsOpening = settings.match(/<details id="u26-settings-ai-library-maintenance"([^>]*)>/)?.[0];
if (!detailsOpening) failures.push('U26 AI library maintenance details missing');
else if (/\sopen(?:\s|=|>)/.test(detailsOpening)) failures.push('AI library maintenance must be closed by default');

for (const marker of [
  '<summary',
  'AI 维护',
  '资源库检修',
  '日常无需展开',
  'id="u26-settings-ai-library-maintenance-panel"',
]) {
  if (!settings.includes(marker)) failures.push(`U26 maintenance disclosure missing: ${marker}`);
}

const detailsStart = settings.indexOf('id="u26-settings-ai-library-maintenance"');
const asmrLibraryIndex = settings.indexOf('ASMR / RJ 音声库目录');
const detailsEnd = asmrLibraryIndex >= 0 ? settings.lastIndexOf('</details>', asmrLibraryIndex) : -1;
if (!(detailsStart >= 0 && detailsEnd > detailsStart && asmrLibraryIndex > detailsEnd)) {
  failures.push(`U26 maintenance details boundary invalid: start=${detailsStart}, end=${detailsEnd}, asmr=${asmrLibraryIndex}`);
}

const maintenanceRegion = detailsStart >= 0 && detailsEnd > detailsStart
  ? settings.slice(detailsStart, detailsEnd)
  : '';
const requiredMaintenanceMarkers = [
  'id="mvp127-library-index-health-management"',
  'id="mvp128-controlled-index-cleanup"',
  'id="mvp129-index-maintenance-closeout"',
  'id="mvp39-advanced-library-tools"',
];
let previousIndex = -1;
for (const marker of requiredMaintenanceMarkers) {
  const index = maintenanceRegion.indexOf(marker);
  if (!(index > previousIndex)) failures.push(`maintenance capability not enclosed in expected order: ${marker}`);
  previousIndex = index;
}

const regressionOpening = settings.match(/<div id="mvp54-settings-regression-path"([^>]*)>/)?.[0];
if (!regressionOpening) failures.push('MVP54 compatibility marker missing');
else if (!/\shidden(?:\s|=|>)/.test(regressionOpening) || !regressionOpening.includes('aria-hidden="true"')) {
  failures.push('MVP54 historical regression card must remain hidden');
}

for (const marker of [
  '选择本地资源库目录',
  '打包版快速导入',
  '读取已有记录',
  '一键扫描并应用',
  '音乐库路径',
]) {
  if (!settings.includes(marker)) failures.push(`daily library capability missing: ${marker}`);
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
  if (!settings.includes(marker)) failures.push(`maintenance handler removed: ${marker}`);
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
  if (!projectText.includes(marker)) failures.push(`U26 project record missing: ${marker}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U26 AI library maintenance verifier PASS');
