import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const topBar = fs.readFileSync('src/app/TopBar.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const navigation = fs.readFileSync('src/app/navigation.ts', 'utf8');
const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const failures = [];

if (app.includes("from './mockData'")) failures.push('App.tsx still imports mock defaults');
for (const marker of [
  "useLocalStorage<RJWork[]>('sqlite_rj_works', [])",
  'playlistPersistenceService.hydrateInitialPlaylists([])',
  "useLocalStorage<MusicAlbum[]>('sqlite_music_albums', [])",
  "useLocalStorage<string[]>('sqlite_favorites', [])",
  'recentTracks={recentTracks}',
]) if (!app.includes(marker)) failures.push(`missing clean-profile marker: ${marker}`);

for (const forbidden of ['导入器预览 / 详情导航 / 媒体库体验', '<span>真实音频可播</span>']) {
  if (`${app}\n${topBar}`.includes(forbidden)) failures.push(`engineering header text remains: ${forbidden}`);
}
for (const status of ['尚未选择资源库', '资源库待重新连接', '已加载 ${librarySessionSnapshot.lastIndex.trackCount} 条音轨']) {
  if (!topBar.includes(status)) failures.push(`TopBar missing runtime library status: ${status}`);
}
if (!app.includes('<TopBar librarySessionSnapshot={librarySessionSnapshot} />')) {
  failures.push('App does not compose the production TopBar boundary');
}

if (!dashboard.includes('id="u02-home-empty-state"')) failures.push('clean-profile home empty state missing');
for (const forbidden of ['id="mvp110-dashboard-daily-surface"', 'id="mvp111-ui-cleanup-closeout"', 'MVP111 收口包', '>界面收口<']) {
  if (dashboard.includes(forbidden)) failures.push(`visible development section remains: ${forbidden}`);
}

if (!sidebar.includes("import { DAILY_NAVIGATION_ROUTES } from '../app/navigation';")) {
  failures.push('Sidebar does not consume canonical navigation');
}
for (const marker of [
  'id="app-sidebar"',
  '<div hidden aria-hidden="true">',
  'id="sidebar-ai-maintenance-toggle"',
  'id="nav-diagnostics"',
  'id="nav-downloader"',
]) if (!sidebar.includes(marker)) failures.push(`release sidebar contract missing: ${marker}`);

for (const [id, label] of [
  ['dashboard', '首页'],
  ['asmr-lib', '音声库'],
  ['music-lib', '音乐库'],
  ['playlists', '歌单'],
  ['importer', '导入'],
  ['settings', '设置'],
]) {
  if (!navigation.includes(`id: '${id}'`) || !navigation.includes(`label: '${label}'`)) {
    failures.push(`canonical daily navigation missing: ${id} / ${label}`);
  }
}
for (const id of ['downloader', 'diagnostics']) {
  const routeStart = navigation.indexOf(`${id}:`);
  const routeEnd = navigation.indexOf('\n  },', routeStart);
  const routeSource = routeStart >= 0 ? navigation.slice(routeStart, routeEnd >= 0 ? routeEnd : undefined) : '';
  if (!routeSource.includes('visibleInSidebar: false')) failures.push(`maintenance route visible in sidebar: ${id}`);
}

for (const forbidden of ['const DAILY_NAV_ITEMS', 'const MAINTENANCE_NAV_ITEMS', 'id="sidebar-ai-maintenance-panel"', 'showAiMaintenance && (']) {
  if (sidebar.includes(forbidden)) failures.push(`obsolete navigation implementation remains: ${forbidden}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U02 minimal UI productization verifier PASS');
