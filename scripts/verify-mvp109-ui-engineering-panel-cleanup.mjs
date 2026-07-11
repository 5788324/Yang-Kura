import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[MVP109 verify] FAIL ${message}`);
  process.exit(1);
};

const packageJson = JSON.parse(read('package.json'));
if (!['0.147.0-mvp109', '0.148.0-mvp110', '0.149.0-mvp111', '0.150.0-mvp112'].includes(packageJson.version)) {
  fail(`package.json version must be 0.147.0-mvp109, 0.148.0-mvp110, 0.149.0-mvp111, or 0.150.0-mvp112, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp109-ui-engineering-panel-cleanup']) {
  fail('missing verify:mvp109-ui-engineering-panel-cleanup script');
}

const service = read('src/services/uiEngineeringPanelCleanupService.ts');
[
  '0.147.0-mvp109',
  '主页面只展示日常操作和结果摘要',
  'MVP86～MVP108 阶段记录',
  'AI 维护区',
].forEach((token) => {
  if (!service.includes(token)) fail(`service missing token: ${token}`);
});

const importer = read('src/components/ImporterPage.tsx');
[
  'mvp109-importer-daily-surface',
  'uiEngineeringPanelCleanupService.getModel()',
  '导入已有音频资源',
  'AI maintenance folded',
  'mvp109-ui-engineering-panel-cleanup',
].forEach((token) => {
  if (!importer.includes(token)) fail(`ImporterPage missing token: ${token}`);
});
if (!importer.includes('id="mvp108-importer-final-regression-checklist"\n        hidden aria-hidden="true"')) {
  fail('MVP108 regression block must be hidden from the daily importer surface');
}
if (!importer.includes('id="mvp107-importer-daily-ui-cleanup"\n        hidden aria-hidden="true"')) {
  fail('MVP107 cleanup explanation block must be hidden from the daily importer surface');
}

const settings = read('src/components/SettingsPage.tsx');
if (settings.includes('AI 维护后置') || settings.includes('工程信息后置')) {
  fail('SettingsPage still exposes AI/engineering wording as visible badges');
}
if (!settings.includes('维护信息已收起') || !settings.includes('细节已收起')) {
  fail('SettingsPage must use user-facing folded-detail badges');
}

const runtimeBoundary = read('src/components/DiagnosticsRuntimeBoundary.tsx');
if (runtimeBoundary.includes('MVP-64 诊断页运行时保护')) {
  fail('Diagnostics runtime fallback must not expose MVP stage wording');
}
if (runtimeBoundary.includes('Renderer 仍不接收 absolutePath / file://')) {
  fail('Diagnostics runtime fallback must not expose Renderer/absolutePath/file:// wording in visible cards');
}

const docs = [
  'docs/UI_ENGINEERING_PANEL_CLEANUP_MVP109.md',
  'docs/CURRENT_ROADMAP_MVP109.md',
  'HANDOFF_MVP108_TO_MVP109.md',
  'PACKAGE_MANIFEST_MVP109_HANDOFF.txt',
];
for (const doc of docs) {
  if (!fs.existsSync(doc)) fail(`missing ${doc}`);
}

console.log('[MVP109 verify] PASS UI engineering panel cleanup keeps daily surfaces user-facing while preserving AI maintenance details folded.');
