import fs from 'node:fs';

const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const failures = [];

for (const marker of [
  "import type { LucideIcon } from 'lucide-react';",
  'interface SidebarNavItem',
  'interface SidebarNavSectionProps',
  'const DAILY_NAV_ITEMS: readonly SidebarNavItem[]',
  'const MAINTENANCE_NAV_ITEMS: readonly SidebarNavItem[]',
  'function SidebarNavSection({',
  'items.map((item) =>',
  'aria-labelledby={headingId}',
  "headingId=\"sidebar-daily-navigation\"",
  "headingId=\"sidebar-maintenance-navigation\"",
  'aria-current={isCurrent ? \'page\' : undefined}',
  'focus-visible:ring-2',
  'motion-reduce:animate-none',
  'setAsmrDetailId(null);',
  'setPlaylistDetailId(null);',
  '/* Legacy verifier marker: 导入规划. Current user-facing entry is 导入器. */',
]) {
  if (!sidebar.includes(marker)) failures.push(`Sidebar missing U12 marker: ${marker}`);
}

for (const marker of [
  "{ id: 'dashboard', label: '首页', icon: History }",
  "{ id: 'asmr-lib', label: 'ASMR', icon: Headphones }",
  "{ id: 'music-lib', label: '流行音乐', icon: Music }",
  "{ id: 'playlists', label: '我的歌单', icon: ListMusic }",
  "{ id: 'importer', label: '导入器', icon: ArchiveRestore }",
  "{ id: 'settings', label: '系统设置', icon: Settings }",
  "{ id: 'downloader', label: '下载规划', icon: DownloadCloud }",
  "{ id: 'diagnostics', label: '诊断工具', icon: Cpu }",
]) {
  if (!sidebar.includes(marker)) failures.push(`Sidebar navigation contract changed: ${marker}`);
}

for (const forbidden of [
  'void currentTheme;',
  'item.id as PageType',
  'dailyNavItems.map',
  'maintenanceNavItems.map',
  'aria-label="搜索作品、歌曲、CV或社团"',
]) {
  if (sidebar.includes(forbidden)) failures.push(`Sidebar retains U12 structure debt: ${forbidden}`);
}

const mapOccurrences = (sidebar.match(/items\.map\(\(item\) =>/g) ?? []).length;
if (mapOccurrences !== 1) {
  failures.push(`SidebarNavSection must own exactly one navigation map; found ${mapOccurrences}`);
}

for (const marker of ['U11', 'U12', '侧栏导航', 'MVP130']) {
  if (!projectState.includes(marker) && !roadmap.includes(marker)) {
    failures.push(`project progress missing U12 marker: ${marker}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U12 sidebar navigation structure verifier PASS');
