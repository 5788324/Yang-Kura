import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const sidebarPath = 'src/components/Sidebar.tsx';
const sidebar = fs.readFileSync(sidebarPath, 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const transpiled = ts.transpileModule(sidebar, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: sidebarPath,
  reportDiagnostics: true,
});
const errors = (transpiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, `Sidebar TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

const dailyStart = sidebar.indexOf('const DAILY_NAV_ITEMS');
const maintenanceStart = sidebar.indexOf('const MAINTENANCE_NAV_ITEMS');
const implementationStart = sidebar.indexOf('const getNavItemClass');
assert.ok(dailyStart >= 0 && maintenanceStart > dailyStart && implementationStart > maintenanceStart);

const dailySource = sidebar.slice(dailyStart, maintenanceStart);
const maintenanceSource = sidebar.slice(maintenanceStart, implementationStart);

for (const marker of [
  "{ id: 'dashboard', label: '首页'",
  "{ id: 'asmr-lib', label: 'ASMR'",
  "{ id: 'music-lib', label: '流行音乐'",
  "{ id: 'playlists', label: '我的歌单'",
  "{ id: 'importer', label: '导入器'",
  "{ id: 'settings', label: '系统设置'",
]) {
  assert.ok(dailySource.includes(marker), `daily navigation missing: ${marker}`);
}
for (const forbidden of ["id: 'downloader'", "id: 'diagnostics'"]) {
  assert.ok(!dailySource.includes(forbidden), `engineering route leaked into daily navigation: ${forbidden}`);
}
for (const marker of [
  "{ id: 'downloader', label: '下载规划'",
  "{ id: 'diagnostics', label: '诊断工具'",
]) {
  assert.ok(maintenanceSource.includes(marker), `maintenance navigation missing: ${marker}`);
}
assert.ok(!maintenanceSource.includes("id: 'settings'"), 'settings must not be hidden inside AI maintenance');

for (const marker of [
  'const [isAiMaintenanceOpen, setIsAiMaintenanceOpen] = useState(false);',
  'const isMaintenancePage = MAINTENANCE_NAV_ITEMS.some((item) => item.id === currentPage);',
  'const showAiMaintenance = isAiMaintenanceOpen || isMaintenancePage;',
  'id="sidebar-ai-maintenance-toggle"',
  'aria-expanded={showAiMaintenance}',
  'aria-controls="sidebar-ai-maintenance-panel"',
  'id="sidebar-ai-maintenance-panel"',
  'showAiMaintenance && (',
  'AI 维护',
  '工程与检修工具',
  'title="日常使用"',
  'title="仅供维护"',
]) {
  assert.ok(sidebar.includes(marker), `AI maintenance disclosure missing: ${marker}`);
}

for (const forbidden of [
  '设置与维护',
  'items={MAINTENANCE_NAV_ITEMS}\n          currentPage',
]) {
  assert.ok(!sidebar.includes(forbidden), `old always-visible maintenance UI remains: ${forbidden}`);
}

for (const marker of [
  "const DiagnosticsPageShell = lazy(() => import('./components/DiagnosticsPageShell'));",
  "const DownloaderPage = lazy(() => import('./components/DownloaderPage'));",
  "currentPage === 'downloader'",
  '<DownloaderPage onPlayTrack={handlePlayTrack} />',
  "currentPage === 'diagnostics'",
  '<DiagnosticsRuntimeBoundary',
  '<DiagnosticsPageShell',
]) {
  assert.ok(app.includes(marker), `maintenance route was removed instead of hidden: ${marker}`);
}

const projectDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}\n${fs.readFileSync('docs/U24_DAILY_UI_AI_MAINTENANCE.md', 'utf8')}`;
for (const marker of [
  'U09～U24',
  'AI 维护',
  '工程与检修工具',
  'Windows GUI',
  'MVP130',
]) {
  assert.ok(projectDocuments.includes(marker), `project progress missing U24 fact: ${marker}`);
}

console.log('U24 daily UI AI maintenance verifier PASS');
