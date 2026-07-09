import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/services/importerFinalRegressionChecklistService.ts',
  'src/components/ImporterPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/CURRENT_ROADMAP_MVP108.md',
  'docs/IMPORTER_FINAL_REGRESSION_CHECKLIST_MVP108.md',
  'HANDOFF_MVP107_TO_MVP108.md',
  'PACKAGE_MANIFEST_MVP108_HANDOFF.txt',
];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    throw new Error(`[MVP108 verify] Missing file: ${rel}`);
  }
  return fs.readFileSync(file, 'utf8');
}

for (const rel of requiredFiles) read(rel);

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '0.146.0-mvp108') {
  throw new Error(`[MVP108 verify] package.json version mismatch: ${pkg.version}`);
}
if (!pkg.scripts['verify:mvp108-importer-final-regression-checklist']) {
  throw new Error('[MVP108 verify] Missing verify:mvp108-importer-final-regression-checklist script');
}
if (!pkg.scripts['verify:all']?.includes('verify:mvp108-importer-final-regression-checklist')) {
  throw new Error('[MVP108 verify] verify:all does not include MVP108 verifier');
}

const service = read('src/services/importerFinalRegressionChecklistService.ts');
const importer = read('src/components/ImporterPage.tsx');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const docs = read('docs/IMPORTER_FINAL_REGRESSION_CHECKLIST_MVP108.md') + '\n' + read('docs/CURRENT_ROADMAP_MVP108.md');

const serviceMarkers = [
  'mvp108-importer-final-regression-checklist-v1',
  'developmentPausedAfterCloseout: true',
  'copyOnlyChainClosed: true',
  'moveOnlyChainClosed: true',
  'importerUiCleanupDone: true',
  'requiresManualPackagedRegression: true',
  'codexRequired: false',
  'fileOperationsChanged: false',
  'libraryIndexWrittenInMvp108: false',
  'sqliteWritten: false',
  'downloaderTouched: false',
  'metadataProviderTouched: false',
  'mpvTouched: false',
  'absolutePathReturned: false',
  'fileUrlReturned: false',
  'pause development and run human review',
  'MVP108 后暂停新增导入器功能',
];
for (const marker of serviceMarkers) {
  if (!service.includes(marker)) {
    throw new Error(`[MVP108 verify] Service marker missing: ${marker}`);
  }
}

const uiMarkers = [
  'mvp108-importer-final-regression-checklist',
  'mvp108-release-gate-cards',
  'mvp108-manual-review-steps',
  'mvp108-importer-final-audit-findings',
  'mvp108-development-pause-scope',
  'importerFinalRegressionChecklistService',
];
for (const marker of uiMarkers) {
  if (!importer.includes(marker)) {
    throw new Error(`[MVP108 verify] Importer UI marker missing: ${marker}`);
  }
}

const diagnosticMarkers = [
  'mvp108-importer-final-regression-checklist-diagnostics',
  'mvp108-release-gate-cards-diagnostics',
  'mvp108-final-regression-result',
  'mvp108-audit-findings',
  'mvp108-pause-scope',
  'primaryMvp108ImporterFinalRegressionResult',
];
for (const marker of diagnosticMarkers) {
  if (!diagnostics.includes(marker)) {
    throw new Error(`[MVP108 verify] Diagnostics marker missing: ${marker}`);
  }
}

const docMarkers = [
  'MVP108',
  '导入器最终回归清单',
  '暂停开发',
  '不安排 Codex',
  'copy-only',
  'move-only',
  '不接 SQLite',
  '不接下载器',
  '不接元数据 Provider',
  '不接 mpv',
  '不返回 absolutePath',
  '不返回 file://',
];
for (const marker of docMarkers) {
  if (!docs.includes(marker)) {
    throw new Error(`[MVP108 verify] Documentation marker missing: ${marker}`);
  }
}

const forbiddenServicePatterns = [
  'fs.rename',
  'fs.rm',
  'fs.unlink',
  'fs.copyFile',
  'writeFile',
  'appendFile',
  'ipcMain.handle',
  'ipcRenderer.invoke',
];
for (const marker of forbiddenServicePatterns) {
  if (service.includes(marker)) {
    throw new Error(`[MVP108 verify] Service must remain checklist-only; found: ${marker}`);
  }
}

console.log('[MVP108 verify] PASS importer final regression checklist pauses development and changes no file-operation/index behavior.');
