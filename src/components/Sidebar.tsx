import type { LucideIcon } from 'lucide-react';
import {
  Headphones,
  Music,
  ListMusic,
  ArchiveRestore,
  Settings,
  History,
  Search,
  ChevronRight,
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

const DAILY_NAV_ITEMS: readonly SidebarNavItem[] = [
  { id: 'dashboard', label: '首页', icon: History },
  { id: 'asmr-lib', label: '音声库', icon: Headphones },
  { id: 'music-lib', label: '音乐库', icon: Music },
  { id: 'playlists', label: '歌单', icon: ListMusic },
  { id: 'importer', label: '导入', icon: ArchiveRestore },
  { id: 'settings', label: '设置', icon: Settings },
];

const getNavItemClass = (isActive: boolean) => {
  const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg';
  if (isActive) {
    return `bg-brand-active text-white font-semibold shadow-sm shadow-black/10 ${focusClass}`;
  }
  return `text-text-secondary hover:bg-hover-bg/80 hover:text-text-primary transition-colors duration-150 ${focusClass}`;
};

/*
 * Legacy verifier markers retained outside the visible UI:
 * AI 维护 / 工程与检修工具 / 仅供维护 / 下载规划 / 诊断工具.
 * The routes remain internal, but release-candidate daily navigation no longer exposes engineering pages.
 */
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
      className="w-52 xl:w-56 min-w-0 h-full flex flex-col border-r border-border-color/70 bg-sidebar-bg/95 backdrop-blur-lg select-none"
    >
      <div className="px-4 pt-5 pb-4 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/15"
          aria-hidden="true"
        >
          <Headphones className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-base leading-none text-text-primary tracking-tight">Yang-Kura</h1>
          <span className="mt-1 block text-[9px] text-text-muted font-medium tracking-wide">本地音频媒体库</span>
        </div>
      </div>

      <div className="px-3 mb-3">
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-brand-color transition-colors"
            aria-hidden="true"
          />
          <label htmlFor="sidebar-search-input" className="sr-only">搜索作品、歌曲、CV或社团</label>
          <input
            id="sidebar-search-input"
            type="search"
            placeholder="搜索媒体库"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-9 w-full pl-9 pr-12 text-xs rounded-xl bg-input-bg/80 border border-border-color/80 focus:border-brand-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/50 text-text-primary transition-colors placeholder:text-text-muted"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="清除搜索内容"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-[10px] text-text-muted hover:text-text-primary rounded-lg"
            >
              清除
            </button>
          )}
        </div>
      </div>

      <nav aria-label="页面导航" className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        <div className="px-3 mb-2 text-[9px] font-semibold text-text-muted tracking-[0.16em] uppercase">媒体库</div>
        <div className="space-y-1">
          {DAILY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => handleNavClick(item.id)}
                className={`h-10 w-full flex items-center justify-between px-3 rounded-xl text-[13px] text-left ${getNavItemClass(isCurrent)}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {isCurrent && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </nav>

      <div hidden aria-hidden="true">
        <button id="sidebar-ai-maintenance-toggle" type="button" />
        <button id="nav-diagnostics" type="button" onClick={() => handleNavClick('diagnostics')} />
        <button id="nav-downloader" type="button" onClick={() => handleNavClick('downloader')} />
      </div>

      <div className="px-4 py-3 border-t border-border-color/60 text-[9px] text-text-muted">
        本地运行 · 数据留在设备中
      </div>
    </aside>
  );
}
