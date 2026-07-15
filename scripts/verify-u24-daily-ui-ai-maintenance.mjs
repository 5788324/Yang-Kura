import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const sidebarPath = 'src/components/Sidebar.tsx';
const sidebar = fs.readFileSync(sidebarPath, 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const transpiled = ts.transpileModule(sidebar, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, strict: true },
  fileName: sidebarPath,
  reportDiagnostics: true,
});
const errors = (transpiled.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, `Sidebar TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

const dailyStart = sidebar.indexOf('const DAILY_NAV_ITEMS');
const implementationStart = sidebar.indexOf('const getNavItemClass');
assert.ok(dailyStart >= 0 && implementationStart > dailyStart);
const dailySource = sidebar.slice(dailyStart, implementationStart);

for (const marker of [
  "{ id: 'dashboard', label: '首页'",
  "{ id: 'asmr-lib', label: '音声库'",
  "{ id: 'music-lib', label: '音乐库'",
  "{ id: 'playlists', label: '歌单'",
  "{ id: 'importer', label: '导入'",
  "{ id: 'settings', label: '设置'",
]) assert.ok(dailySource.includes(marker), `daily navigation missing: ${marker}`);

for (const forbidden of ["id: 'downloader'", "id: 'diagnostics'", 'const MAINTENANCE_NAV_ITEMS']) {
  assert.ok(!dailySource.includes(forbidden), `engineering route leaked into daily navigation: ${forbidden}`);
}

for (const marker of [
  '<div hidden aria-hidden="true">',
  'id="sidebar-ai-maintenance-toggle"',
  'id="nav-diagnostics"',
  'id="nav-downloader"',
]) assert.ok(sidebar.includes(marker), `hidden maintenance compatibility missing: ${marker}`);

for (const forbidden of [
  'id="sidebar-ai-maintenance-panel"',
  'aria-expanded={showAiMaintenance}',
  'showAiMaintenance && (',
  'const [isAiMaintenanceOpen, setIsAiMaintenanceOpen]',
]) assert.ok(!sidebar.includes(forbidden), `release UI still exposes maintenance disclosure: ${forbidden}`);

for (const marker of [
  "const DiagnosticsPageShell = lazy(() => import('./components/DiagnosticsPageShell'));",
  "const DownloaderPage = lazy(() => import('./components/DownloaderPage'));",
  "currentPage === 'downloader'",
  '<DownloaderPage onPlayTrack={handlePlayTrack} />',
  "currentPage === 'diagnostics'",
  '<DiagnosticsRuntimeBoundary',
  '<DiagnosticsPageShell',
]) assert.ok(app.includes(marker), `maintenance route was removed instead of hidden: ${marker}`);

const projectDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}\n${fs.readFileSync('docs/U24_DAILY_UI_AI_MAINTENANCE.md', 'utf8')}`;
for (const marker of ['U24', '侧栏去工程化与 AI 维护入口', 'AI 维护', '工程与检修工具', 'Windows GUI', 'MVP130']) {
  assert.ok(projectDocuments.includes(marker), `project progress missing U24 fact: ${marker}`);
}

console.log('U24 hidden maintenance route verifier PASS');
