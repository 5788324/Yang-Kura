import fs from 'node:fs';

const requiredFiles = [
  'electron/main.ts',
  'electron/preload.ts',
  'src/types/electron-api.d.ts',
  'src/services/electronDryRunReportIndexPreviewMvp22Service.ts',
  'src/services/index.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/ELECTRON_DRY_RUN_REPORT_AND_INDEX_PREVIEW_MVP21_22.md',
  'docs/CURRENT_ROADMAP_MVP22.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`[MVP-21/22] Missing required file: ${file}`);
  }
}

const read = (file) => fs.readFileSync(file, 'utf8');
const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const api = read('src/types/electron-api.d.ts');
const settings = read('src/components/SettingsPage.tsx');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const service = read('src/services/electronDryRunReportIndexPreviewMvp22Service.ts');
const pkg = JSON.parse(read('package.json'));

const mustContain = [
  [main, 'yang-kura:index:write-preview-request', 'main registers write-index preview IPC'],
  [main, 'lastDryRunResultMap', 'main caches last dry-run result'],
  [main, 'buildIndexWritePreview', 'main builds index write preview'],
  [main, 'indexWritePerformed: false', 'main does not write index in preview stage'],
  [main, 'rootPathToken:', 'preview index stores tokenized root path'],
  [preload, 'requestWriteIndexPreview', 'preload exposes narrow preview method'],
  [api, 'YangKuraWriteIndexPreviewResult', 'renderer type declares preview result'],
  [api, 'absolutePath?: never', 'renderer result forbids absolutePath'],
  [api, 'fileUrl?: never', 'renderer result forbids fileUrl'],
  [settings, 'yang_kura_last_dry_run_result', 'Settings persists latest dry-run report'],
  [settings, 'yang_kura_last_index_write_preview', 'Settings persists index preview'],
  [settings, '生成写入预览', 'Settings exposes preview button'],
  [diagnostics, '最近一次 dry-run 报告', 'Diagnostics renders formal dry-run report'],
  [diagnostics, 'library-index.json 写入预览', 'Diagnostics renders write-index preview'],
  [service, 'MVP-21/22 Dry-run 报告与 Index 写入预览', 'MVP-21/22 service title exists'],
];

for (const [content, needle, reason] of mustContain) {
  if (!content.includes(needle)) {
    throw new Error(`[MVP-21/22] Expected ${reason}: ${needle}`);
  }
}

const forbiddenMain = ['fs.appendFile', 'fs.rm', 'fs.unlink', 'fs.rename', 'child_process'];
for (const token of forbiddenMain) {
  if (main.includes(token)) {
    throw new Error(`[MVP-21/22] Forbidden mutation or process API in electron/main.ts: ${token}`);
  }
}

const compatibleStage = /mvp(2[2-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])/.test(pkg.version) || pkg.version.includes('mvp28.1') || pkg.version.includes('mvp28.2') || pkg.version.includes('mvp29.1');
if (!compatibleStage) {
  throw new Error('[MVP-21/22] package version must include mvp22 or a later compatible stage');
}
if (!pkg.scripts?.['verify:mvp21-22-dry-run-report-index-preview']) {
  throw new Error('[MVP-21/22] package script verify:mvp21-22-dry-run-report-index-preview is missing');
}
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp21-22-dry-run-report-index-preview')) {
  throw new Error('[MVP-21/22] verify:all must include MVP-21/22 verifier');
}

console.log('[MVP-21/22] dry-run report + index write preview contract verification passed.');
