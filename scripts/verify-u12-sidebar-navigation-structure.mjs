import fs from 'node:fs';

const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const failures = [];

const structureMarkers = [
  'interface SidebarNavItem',
  'interface SidebarNavSectionProps',
  'const DAILY_NAV_ITEMS: readonly SidebarNavItem[]',
  'const MAINTENANCE_NAV_ITEMS: readonly SidebarNavItem[]',
  'function SidebarNavSection({',
  'aria-labelledby={headingId}',
  'headingId="sidebar-daily-navigation"',
  'headingId="sidebar-maintenance-navigation"',
  "aria-current={isCurrent ? 'page' : undefined}",
  'focus-visible:ring-2',
  'motion-reduce:animate-none',
  'setAsmrDetailId(null);',
  'setPlaylistDetailId(null);',
];

for (const marker of structureMarkers) {
  if (!sidebar.includes(marker)) failures.push(`Sidebar missing U12 structure contract: ${marker}`);
}

const navigationContract = [
  ['dashboard', '首页'],
  ['asmr-lib', 'ASMR'],
  ['music-lib', '流行音乐'],
  ['playlists', '我的歌单'],
  ['importer', '导入器'],
  ['settings', '系统设置'],
  ['downloader', '下载规划'],
  ['diagnostics', '诊断工具'],
];

for (const [id, label] of navigationContract) {
  const marker = `{ id: '${id}', label: '${label}'`;
  if (!sidebar.includes(marker)) failures.push(`Sidebar destination contract changed: ${id} / ${label}`);
}

for (const forbidden of [
  'void currentTheme;',
  'item.id as PageType',
  'dailyNavItems.map',
  'maintenanceNavItems.map',
]) {
  if (sidebar.includes(forbidden)) failures.push(`Sidebar retains duplicated implementation: ${forbidden}`);
}

const mapOccurrences = (sidebar.match(/items\.map\(\(item\) =>/g) ?? []).length;
if (mapOccurrences !== 1) {
  failures.push(`SidebarNavSection must own exactly one navigation map; found ${mapOccurrences}`);
}

const progressDocuments = `${projectState}\n${roadmap}`;
for (const marker of ['U11', 'U12', '侧栏导航', 'MVP130']) {
  if (!progressDocuments.includes(marker)) failures.push(`project progress missing U12 fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U12 sidebar navigation structure verifier PASS');
