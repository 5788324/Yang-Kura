import fs from 'node:fs';
import ts from 'typescript';

const settingsPath = 'src/components/SettingsPage.tsx';
const settings = fs.readFileSync(settingsPath, 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const rules = fs.readFileSync('docs/UI_DAILY_SURFACE_RULES.md', 'utf8');
const u26 = fs.readFileSync('docs/U26_SAFE_LIBRARY_MAINTENANCE.md', 'utf8');
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
for (const diagnostic of transpiled.diagnostics ?? []) {
  if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
  const location = diagnostic.start === undefined
    ? 'unknown'
    : (() => {
        const point = ts.getLineAndCharacterOfPosition(
          ts.createSourceFile(settingsPath, settings, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX),
          diagnostic.start,
        );
        return `${point.line + 1}:${point.character + 1}`;
      })();
  failures.push(`SettingsPage TypeScript error ${location}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
}

for (const marker of [
  'const [showLibraryMaintenance, setShowLibraryMaintenance] = useState(false);',
  'id="u26-settings-ai-library-maintenance"',
  'AI 维护',
  '资源库检修',
  'aria-expanded={showLibraryMaintenance}',
  'setShowLibraryMaintenance((value) => !value)',
  'showLibraryMaintenance ? "收起检修工具" : "展开检修工具"',
]) {
  if (!settings.includes(marker)) failures.push(`U26 maintenance toggle missing: ${marker}`);
}

if (settings.includes('<details id="u26-settings-ai-library-maintenance"')) {
  failures.push('unsafe U26 details wrapper must not return');
}
if (settings.includes('u26-settings-ai-library-maintenance-panel')) {
  failures.push('unsafe U26 cross-boundary wrapper marker must not return');
}

const requireVisibilityOpening = (id, dynamic) => {
  const opening = settings.match(new RegExp(`<div id="${id}"([^>]*)>`))?.[0];
  if (!opening) {
    failures.push(`missing maintenance section: ${id}`);
    return;
  }
  if (dynamic) {
    if (!opening.includes('hidden={!showLibraryMaintenance}')) failures.push(`${id} is not hidden by the U26 toggle`);
    if (!opening.includes('aria-hidden={!showLibraryMaintenance}')) failures.push(`${id} aria-hidden does not follow the U26 toggle`);
  } else {
    if (!/\shidden(?:\s|=|>)/.test(opening)) failures.push(`${id} historical card remains visible`);
    if (!opening.includes('aria-hidden="true"')) failures.push(`${id} historical card lacks aria-hidden=true`);
  }
};

requireVisibilityOpening('mvp127-library-index-health-management', true);
requireVisibilityOpening('mvp39-advanced-library-tools', true);
requireVisibilityOpening('mvp54-settings-regression-path', false);

const quickImportIndex = settings.indexOf('打包版快速导入');
const toggleIndex = settings.indexOf('id="u26-settings-ai-library-maintenance"');
const healthIndex = settings.indexOf('id="mvp127-library-index-health-management"');
const asmrPathIndex = settings.indexOf('ASMR / RJ 音声库目录');
if (!(quickImportIndex >= 0 && toggleIndex > quickImportIndex && healthIndex > toggleIndex)) {
  failures.push(`daily/maintenance order invalid: quick=${quickImportIndex}, toggle=${toggleIndex}, health=${healthIndex}`);
}
if (!(asmrPathIndex > healthIndex)) failures.push('ASMR path management was removed or moved before the maintenance section unexpectedly');

for (const marker of [
  '选择本地资源库目录',
  '读取已有记录',
  '一键扫描并应用',
  'ASMR / RJ 音声库目录',
  '流行音乐库目录',
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
  'handleWriteLibraryIndex',
  'handleReadLibraryIndex',
]) {
  if (!settings.includes(marker)) failures.push(`maintenance or library handler removed: ${marker}`);
}

const projectText = `${state}\n${roadmap}\n${rules}\n${u26}`;
for (const marker of [
  'U26',
  'U09～U26',
  '日常层只展示用户实际会使用的功能',
  '资源库设置边界',
  '优先使用独立布尔开关与顶层 `hidden`',
  '不创建跨越现有条件块的新父容器',
]) {
  if (!projectText.includes(marker)) failures.push(`U26 project record missing: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U26 safe library maintenance verifier PASS');
