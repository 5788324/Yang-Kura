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
import { DAILY_NAVIGATION_ROUTES } from '../app/navigation';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentTheme: ThemeType;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
}

const NAVIGATION_ICONS: Record<PageType, LucideIcon> = {
  dashboard: History,
  'asmr-lib': Headphones,
  'music-lib': Music,
  playlists: ListMusic,
  importer: ArchiveRestore,
  settings: Settings,
  downloader: ArchiveRestore,
  diagnostics: Settings,
};

const getNavItemClass = (isActive: boolean) => {
  const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg';
  if (isActive) {
    return `bg-brand-active text-white font-semibold shadow-sm shadow-black/10 ${focusClass}`;
  }
  return `text-text-secondary hover:bg-hover-bg/80 hover:text-text-primary transition-colors duration-150 ${focusClass}`;
};

/*
 * Engineering routes remain available through the maintenance boundary but are
 * intentionally absent from daily navigation. Their labels and visibility now
 * come from src/app/navigation.ts instead of page-local arrays.
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
          className="w-9 h-9 rounded-xl bg-brand-color/10 border border-brand-color/25 flex items-center justify-center text-brand-color shadow-sm"
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
          {DAILY_NAVIGATION_ROUTES.map((route) => {
            const Icon = NAVIGATION_ICONS[route.id];
            const isCurrent = currentPage === route.id;
            return (
              <button
                key={route.id}
                id={`nav-${route.id}`}
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => handleNavClick(route.id)}
                className={`h-10 w-full flex items-center justify-between px-3 rounded-xl text-[13px] text-left ${getNavItemClass(isCurrent)}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{route.label}</span>
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
