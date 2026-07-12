import fs from 'node:fs';
const app = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const failures = [];
if (app.includes("from './mockData'")) failures.push('App.tsx still imports mock defaults');
for (const marker of ["useLocalStorage<RJWork[]>('sqlite_rj_works', [])", 'playlistPersistenceService.hydrateInitialPlaylists([])', "useLocalStorage<MusicAlbum[]>('sqlite_music_albums', [])", "useLocalStorage<string[]>('sqlite_favorites', [])", 'recentTracks={recentTracks}']) if (!app.includes(marker)) failures.push('missing clean-profile marker: '+marker);
for (const forbidden of ['导入器预览 / 详情导航 / 媒体库体验', '<span>真实音频可播</span>']) if (app.includes(forbidden)) failures.push('engineering header text remains: '+forbidden);
for (const status of ['尚未选择资源库', '资源库待重新连接', '已加载 ${librarySessionSnapshot.lastIndex.trackCount} 条音轨']) if (!app.includes(status)) failures.push('missing runtime library status: '+status);
if (!dashboard.includes('id="u02-home-empty-state"')) failures.push('clean-profile home empty state missing');
for (const forbidden of ['id="mvp110-dashboard-daily-surface"', 'id="mvp111-ui-cleanup-closeout"', 'MVP111 收口包', '>界面收口<']) if (dashboard.includes(forbidden)) failures.push('visible development section remains: '+forbidden);
for (const marker of ['const dailyNavItems', 'const maintenanceNavItems', '媒体与导入', '设置与维护']) if (!sidebar.includes(marker)) failures.push('sidebar grouping marker missing: '+marker);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('U02 minimal UI productization verifier PASS');
