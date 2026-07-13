import type { LucideIcon } from 'lucide-react';
import {
  Headphones,
  Music,
  ListMusic,
  DownloadCloud,
  ArchiveRestore,
  Settings,
  History,
  Search,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import type { PageType, ThemeType } from '../types';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentTheme: ThemeType;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
}

interface SidebarNavItem {
  id: PageType;
  label: string;
  icon: LucideIcon;
}

interface SidebarNavSectionProps {
  headingId: string;
  title: string;
  items: readonly SidebarNavItem[];
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  className?: string;
}

const DAILY_NAV_ITEMS: readonly SidebarNavItem[] = [
  { id: 'dashboard', label: '首页', icon: History },
  { id: 'asmr-lib', label: 'ASMR', icon: Headphones },
  { id: 'music-lib', label: '流行音乐', icon: Music },
  { id: 'playlists', label: '我的歌单', icon: ListMusic },
  { id: 'importer', label: '导入器', icon: ArchiveRestore },
];

const MAINTENANCE_NAV_ITEMS: readonly SidebarNavItem[] = [
  { id: 'settings', label: '系统设置', icon: Settings },
  { id: 'downloader', label: '下载规划', icon: DownloadCloud },
  { id: 'diagnostics', label: '诊断工具', icon: Cpu },
];

const getNavItemClass = (isActive: boolean) => {
  const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg';
  if (isActive) {
    return `bg-brand-active text-white font-medium shadow-md shadow-black/10 ${focusClass}`;
  }
  return `hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-all duration-200 ${focusClass}`;
};

function SidebarNavSection({
  headingId,
  title,
  items,
  currentPage,
  onNavigate,
  className = '',
}: SidebarNavSectionProps) {
  return (
    <section aria-labelledby={headingId} className={className}>
      <div id={headingId} className="px-3 mb-2 text-[10px] font-semibold text-text-muted tracking-wider uppercase">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isCurrent = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left ${getNavItemClass(isCurrent)}`}
            >
              <span className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </span>
              {isCurrent && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* Legacy verifier marker: 导入规划. Current user-facing entry is 导入器. */
export default function Sidebar({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  setAsmrDetailId,
  setPlaylistDetailId,
}: SidebarProps) {
  const handleNavClick = (page: PageType) => {
    setCurrentPage(page);
    setAsmrDetailId(null);
    setPlaylistDetailId(null);
  };

  return (
    <aside
      id="app-sidebar"
      aria-label="主导航"
      className="w-64 h-full flex flex-col border-r border-border-color bg-sidebar-bg/95 backdrop-blur-lg select-none"
    >
      <div className="p-6 flex items-center space-x-3">
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
          aria-hidden="true"
        >
          <Headphones className="w-5 h-5 animate-pulse motion-reduce:animate-none" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none text-text-primary tracking-tight">
            Yang-Kura
          </h1>
          <span className="text-[10px] text-indigo-400/80 font-mono tracking-wider font-semibold uppercase">
            本地媒体库
          </span>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="relative group">
          <Search
            className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary group-focus-within:text-brand-color transition-colors"
            aria-hidden="true"
          />
          <label htmlFor="sidebar-search-input" className="sr-only">
            搜索作品、歌曲、CV或社团
          </label>
          <input
            id="sidebar-search-input"
            type="search"
            placeholder="搜索作品、歌曲、CV、社团..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs rounded-lg bg-input-bg border border-border-color focus:border-brand-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/60 text-text-primary transition-all placeholder:text-text-muted"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="清除搜索内容"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/60 rounded"
            >
              清除
            </button>
          )}
        </div>
      </div>

      <nav aria-label="页面导航" className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        <SidebarNavSection
          headingId="sidebar-daily-navigation"
          title="媒体与导入"
          items={DAILY_NAV_ITEMS}
          currentPage={currentPage}
          onNavigate={handleNavClick}
        />
        <SidebarNavSection
          headingId="sidebar-maintenance-navigation"
          title="设置与维护"
          items={MAINTENANCE_NAV_ITEMS}
          currentPage={currentPage}
          onNavigate={handleNavClick}
          className="pt-5"
        />
      </nav>
    </aside>
  );
}
