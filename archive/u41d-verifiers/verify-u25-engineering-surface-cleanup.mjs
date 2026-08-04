import fs from 'node:fs';

const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const navigation = fs.readFileSync('src/app/navigation.ts', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const router = fs.readFileSync('src/app/AppRouter.tsx', 'utf8');
const state = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const rules = fs.readFileSync('docs/UI_DAILY_SURFACE_RULES.md', 'utf8');
const failures = [];

const requireHiddenSection = (text, id) => {
  const match = text.match(new RegExp(`<section id="${id}"([^>]*)>`));
  if (!match) {
    failures.push(`missing historical section: ${id}`);
    return;
  }
  if (!/\shidden(?:\s|>|=)/.test(match[0]) || !match[0].includes('aria-hidden="true"')) {
    failures.push(`engineering section remains visible: ${id}`);
  }
};

requireHiddenSection(dashboard, 'mvp71-home-user-facing-simplification');
for (const id of [
  'mvp124-mpv-stability-diagnostics',
  'mvp125-player-acceptance-checklist',
  'mvp123-mpv-windows-sample-check',
  'mvp44-settings-daily-flow',
  'mvp58-settings-personal-workflow',
  'mvp71-settings-user-facing-simplification',
  'mvp80-settings-daily-finalize',
  'mvp110-settings-daily-language',
  'mvp111-github-baseline-sync',
]) requireHiddenSection(settings, id);

const maintenanceSections = [...settings.matchAll(/<section id="(mvp(?:54|55|60|61|62|63|64|66|67|68|69|70)-[^"]+)"([^>]*)>/g)];
if (maintenanceSections.length < 8) failures.push(`maintenance history coverage unexpectedly small: ${maintenanceSections.length}`);
for (const match of maintenanceSections) {
  if (!/\shidden(?:\s|>|=)/.test(match[0]) || !match[0].includes('aria-hidden="true"')) {
    failures.push(`maintenance history remains visible: ${match[1]}`);
  }
}

const scannerMarker = '{/* MVP-07 Scanner Contract UI Flow */}';
const scannerIndex = settings.indexOf(scannerMarker);
if (scannerIndex < 0) failures.push('scanner contract compatibility marker missing');
else {
  const scannerWindow = settings.slice(scannerIndex, scannerIndex + 260);
  if (!scannerWindow.includes('<div hidden aria-hidden="true"')) failures.push('scanner contract engineering window remains visible');
}

for (const marker of [
  'id="mvp123-mpv-settings-status"',
  '本地音频播放后端',
  '选择本地资源库目录',
  '打包版快速导入',
  '关于本品',
  'id="mvp58-about-personal-privacy"',
]) if (!settings.includes(marker)) failures.push(`daily setting capability missing: ${marker}`);

const allowedVisibleSections = [
  settings.match(/<section id="mvp123-mpv-settings-status"([^>]*)>/)?.[0],
  settings.match(/<section id="mvp58-about-personal-privacy"([^>]*)>/)?.[0],
].filter(Boolean);
for (const opening of allowedVisibleSections) {
  if (/\shidden(?:\s|>|=)/.test(opening)) failures.push(`user-facing setting was hidden: ${opening}`);
}

for (const marker of [
  "import { DAILY_NAVIGATION_ROUTES } from '../app/navigation';",
  '<div hidden aria-hidden="true">',
  'id="sidebar-ai-maintenance-toggle"',
  'id="nav-downloader"',
  'id="nav-diagnostics"',
]) if (!sidebar.includes(marker)) failures.push(`hidden maintenance boundary missing: ${marker}`);

for (const [id, label] of [['downloader', '下载规划'], ['diagnostics', 'AI 维护']]) {
  const routeStart = navigation.indexOf(`${id}:`);
  const routeEnd = navigation.indexOf('\n  },', routeStart);
  const routeSource = routeStart >= 0 ? navigation.slice(routeStart, routeEnd >= 0 ? routeEnd : undefined) : '';
  if (!routeSource.includes(`label: '${label}'`)) failures.push(`maintenance route label missing: ${id}`);
  if (!routeSource.includes("section: 'maintenance'")) failures.push(`maintenance route section missing: ${id}`);
  if (!routeSource.includes('visibleInSidebar: false')) failures.push(`maintenance route is visible in sidebar: ${id}`);
}

for (const forbidden of ['const DAILY_NAV_ITEMS', 'const MAINTENANCE_NAV_ITEMS', 'id="sidebar-ai-maintenance-panel"', 'aria-expanded={showAiMaintenance}', 'showAiMaintenance && (']) {
  if (sidebar.includes(forbidden)) failures.push(`obsolete maintenance UI remains: ${forbidden}`);
}

if (!app.includes("import AppRouter from './app/AppRouter';") || !app.includes('<AppRouter')) {
  failures.push('AppRouter boundary missing from App');
}
for (const marker of [
  "props.currentPage === 'downloader'",
  "props.currentPage === 'diagnostics'",
  '<DownloaderPage',
  '<DiagnosticsPageShell',
]) if (!router.includes(marker)) failures.push(`maintenance route removed: ${marker}`);

const policyText = `${state}\n${roadmap}\n${rules}`;
for (const marker of [
  '日常层只展示用户实际会使用的功能',
  '诊断、回归、工程状态',
  'AI 维护',
  '不得长期污染主界面',
  'U25',
]) if (!policyText.includes(marker)) failures.push(`project UI hard rule missing: ${marker}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U25 engineering surface cleanup verifier PASS');
