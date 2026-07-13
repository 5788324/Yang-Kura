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
  'const [isAiMaintenanceOpen, setIsAiMaintenanceOpen] = useState(false);',
  'const showAiMaintenance = isAiMaintenanceOpen || isMaintenancePage;',
  'id="sidebar-ai-maintenance-toggle"',
  'aria-expanded={showAiMaintenance}',
  'aria-controls="sidebar-ai-maintenance-panel"',
  'id="sidebar-ai-maintenance-panel"',
  'AI 维护',
  '工程与检修工具',
  'showAiMaintenance && (',
];

for (const marker of structureMarkers) {
  if (!sidebar.includes(marker)) failures.push(`Sidebar missing navigation structure contract: ${marker}`);
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

const dailyStart = sidebar.indexOf('const DAILY_NAV_ITEMS');
const maintenanceStart = sidebar.indexOf('const MAINTENANCE_NAV_ITEMS');
const settingsIndex = sidebar.indexOf("{ id: 'settings', label: '系统设置'");
const downloaderIndex = sidebar.indexOf("{ id: 'downloader', label: '下载规划'");
const diagnosticsIndex = sidebar.indexOf("{ id: 'diagnostics', label: '诊断工具'");
if (!(dailyStart >= 0 && settingsIndex > dailyStart && settingsIndex < maintenanceStart)) {
  failures.push('系统设置 must remain in the always-visible daily navigation');
}
if (!(maintenanceStart >= 0 && downloaderIndex > maintenanceStart && diagnosticsIndex > maintenanceStart)) {
  failures.push('engineering routes must remain inside the maintenance navigation contract');
}

for (const forbidden of [
  'void currentTheme;',
  'item.id as PageType',
  'dailyNavItems.map',
  'maintenanceNavItems.map',
  'title="设置与维护"',
]) {
  if (sidebar.includes(forbidden)) failures.push(`Sidebar retains outdated implementation: ${forbidden}`);
}

const mapOccurrences = (sidebar.match(/items\.map\(\(item\) =>/g) ?? []).length;
if (mapOccurrences !== 1) {
  failures.push(`SidebarNavSection must own exactly one navigation map; found ${mapOccurrences}`);
}

const progressDocuments = `${projectState}\n${roadmap}`;
for (const marker of ['U12', 'U24', '侧栏导航', 'AI 维护', 'MVP130']) {
  if (!progressDocuments.includes(marker)) failures.push(`project progress missing sidebar fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U12 sidebar navigation structure verifier PASS');
