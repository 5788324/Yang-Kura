import fs from 'node:fs';
import ts from 'typescript';

const sidebarPath = 'src/components/Sidebar.tsx';
const sidebar = fs.readFileSync(sidebarPath, 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const failures = [];

const transpiled = ts.transpileModule(sidebar, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, strict: true },
  fileName: sidebarPath,
  reportDiagnostics: true,
});
for (const diagnostic of (transpiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error)) {
  failures.push(`Sidebar TypeScript diagnostic: ${diagnostic.messageText}`);
}

for (const marker of [
  'interface SidebarNavItem',
  'const DAILY_NAV_ITEMS: readonly SidebarNavItem[]',
  "aria-current={isCurrent ? 'page' : undefined}",
  'focus-visible:ring-2',
  'setAsmrDetailId(null);',
  'setPlaylistDetailId(null);',
  'id="app-sidebar"',
  '<div hidden aria-hidden="true">',
  'id="sidebar-ai-maintenance-toggle"',
  'id="nav-diagnostics"',
  'id="nav-downloader"',
]) if (!sidebar.includes(marker)) failures.push(`Sidebar missing release navigation contract: ${marker}`);

const dailyContract = [
  ['dashboard', '首页'],
  ['asmr-lib', '音声库'],
  ['music-lib', '音乐库'],
  ['playlists', '歌单'],
  ['importer', '导入'],
  ['settings', '设置'],
];
for (const [id, label] of dailyContract) {
  const marker = `{ id: '${id}', label: '${label}'`;
  if (!sidebar.includes(marker)) failures.push(`Sidebar daily destination changed: ${id} / ${label}`);
}

for (const forbidden of [
  'const MAINTENANCE_NAV_ITEMS',
  'interface SidebarNavSectionProps',
  'function SidebarNavSection({',
  'id="sidebar-ai-maintenance-panel"',
  'aria-expanded={showAiMaintenance}',
  'showAiMaintenance && (',
  'const [isAiMaintenanceOpen, setIsAiMaintenanceOpen]',
]) if (sidebar.includes(forbidden)) failures.push(`Visible maintenance implementation remains: ${forbidden}`);

for (const route of [
  "currentPage === 'downloader'",
  "currentPage === 'diagnostics'",
  '<DownloaderPage',
  '<DiagnosticsPageShell',
]) if (!app.includes(route)) failures.push(`Internal maintenance route removed: ${route}`);

const dailyMapCount = (sidebar.match(/DAILY_NAV_ITEMS\.map\(\(item\) =>/g) ?? []).length;
if (dailyMapCount !== 1) failures.push(`Daily navigation must have one rendering map; found ${dailyMapCount}`);

const progressDocuments = `${projectState}\n${roadmap}`;
for (const marker of ['U12', 'U24', 'AI 维护', 'MVP130']) {
  if (!progressDocuments.includes(marker)) failures.push(`project progress missing sidebar fact: ${marker}`);
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('U12 sidebar release navigation verifier PASS');
