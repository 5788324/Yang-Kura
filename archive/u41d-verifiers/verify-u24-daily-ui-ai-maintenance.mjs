import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const sidebarPath = 'src/components/Sidebar.tsx';
const sidebar = fs.readFileSync(sidebarPath, 'utf8');
const navigation = fs.readFileSync('src/app/navigation.ts', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const router = fs.readFileSync('src/app/AppRouter.tsx', 'utf8');

const transpiled = ts.transpileModule(sidebar, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, strict: true },
  fileName: sidebarPath,
  reportDiagnostics: true,
});
const errors = (transpiled.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, `Sidebar TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

assert.ok(navigation.includes('export const APP_ROUTE_REGISTRY'), 'canonical route registry missing');
assert.ok(navigation.includes('export const DAILY_NAVIGATION_ROUTES'), 'daily navigation projection missing');
assert.ok(navigation.includes('export const MAINTENANCE_ROUTES'), 'maintenance route projection missing');

for (const [id, label] of [
  ['dashboard', '首页'],
  ['asmr-lib', '音声库'],
  ['music-lib', '音乐库'],
  ['playlists', '歌单'],
  ['importer', '导入'],
  ['settings', '设置'],
]) {
  assert.ok(navigation.includes(`id: '${id}'`), `daily route missing: ${id}`);
  assert.ok(navigation.includes(`label: '${label}'`), `daily label missing: ${label}`);
}

for (const [id, label] of [['downloader', '下载规划'], ['diagnostics', 'AI 维护']]) {
  const routeStart = navigation.indexOf(`${id}:`);
  const routeEnd = navigation.indexOf('\n  },', routeStart);
  const routeSource = routeStart >= 0 ? navigation.slice(routeStart, routeEnd >= 0 ? routeEnd : undefined) : '';
  assert.ok(routeSource.includes(`label: '${label}'`), `maintenance label missing: ${id}`);
  assert.ok(routeSource.includes("section: 'maintenance'"), `maintenance section missing: ${id}`);
  assert.ok(routeSource.includes('daily: false'), `maintenance route marked daily: ${id}`);
  assert.ok(routeSource.includes('visibleInSidebar: false'), `maintenance route leaked into daily sidebar: ${id}`);
}

assert.ok(sidebar.includes("import { DAILY_NAVIGATION_ROUTES } from '../app/navigation';"));
for (const marker of [
  '<div hidden aria-hidden="true">',
  'id="sidebar-ai-maintenance-toggle"',
  'id="nav-diagnostics"',
  'id="nav-downloader"',
]) assert.ok(sidebar.includes(marker), `hidden maintenance compatibility missing: ${marker}`);

for (const forbidden of [
  'const DAILY_NAV_ITEMS',
  'const MAINTENANCE_NAV_ITEMS',
  'id="sidebar-ai-maintenance-panel"',
  'aria-expanded={showAiMaintenance}',
  'showAiMaintenance && (',
]) assert.ok(!sidebar.includes(forbidden), `obsolete maintenance implementation remains: ${forbidden}`);

assert.ok(app.includes("import AppRouter from './app/AppRouter';"), 'AppRouter boundary import missing');
assert.ok(app.includes('<AppRouter'), 'AppRouter boundary composition missing');
for (const marker of [
  "const DiagnosticsPageShell = lazy(() => import('../components/DiagnosticsPageShell'));",
  "const DownloaderPage = lazy(() => import('../components/DownloaderPage'));",
  "props.currentPage === 'downloader'",
  '<DownloaderPage onPlayTrack={props.onPlayTrack} />',
  "props.currentPage === 'diagnostics'",
  '<DiagnosticsRuntimeBoundary',
  '<DiagnosticsPageShell',
]) assert.ok(router.includes(marker), `maintenance route was removed instead of moved to AppRouter: ${marker}`);

const projectDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}\n${fs.readFileSync('docs/U24_DAILY_UI_AI_MAINTENANCE.md', 'utf8')}`;
for (const marker of ['U24', '侧栏去工程化与 AI 维护入口', 'AI 维护', '工程与检修工具', 'Windows GUI', 'MVP130']) {
  assert.ok(projectDocuments.includes(marker), `project progress missing U24 fact: ${marker}`);
}

console.log('U24 hidden maintenance route verifier PASS');
