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
  Sparkles,
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
  diagnostics: Settings,
};

const PRIMARY_MEDIA_IDS = new Set<PageType>(['asmr-lib', 'music-lib']);

const getNavItemClass = (isActive: boolean) => {
  const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg';
  return isActive
    ? `k2-nav-item k2-nav-item--active text-text-primary ${focusClass}`
    : `k2-nav-item text-text-secondary hover:text-text-primary ${focusClass}`;
};

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

  const primaryMediaRoutes = DAILY_NAVIGATION_ROUTES.filter((route) => PRIMARY_MEDIA_IDS.has(route.id));
  const secondaryRoutes = DAILY_NAVIGATION_ROUTES.filter(
    (route) => !PRIMARY_MEDIA_IDS.has(route.id) && route.id !== 'settings',
  );
  const settingsRoute = DAILY_NAVIGATION_ROUTES.find((route) => route.id === 'settings');

  return (
    <aside
      id="app-sidebar"
      aria-label="主导航"
      className="k2-sidebar w-56 xl:w-60 min-w-0 h-full flex flex-col select-none"
    >
      <div className="k2-sidebar__brand px-4 pt-5 pb-4 flex items-center gap-3">
        <div className="k2-sidebar__brand-mark" aria-hidden="true">
          <Headphones className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-[15px] leading-none text-text-primary tracking-[-0.02em]">Kura</h1>
            <span className="k2-beta-pill">Desktop 2</span>
          </div>
          <span className="mt-1.5 block text-[9px] text-text-muted font-medium tracking-[0.12em] uppercase">Private listening space</span>
        </div>
      </div>

      <div className="px-3.5 mb-4">
        <div className="k2-sidebar-search relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-brand-color transition-colors"
            aria-hidden="true"
          />
          <label htmlFor="sidebar-search-input" className="sr-only">搜索作品、歌曲、CV或社团</label>
          <input
            id="sidebar-search-input"
            type="search"
            placeholder="搜索音声与音乐"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-10 w-full pl-9 pr-12 text-xs rounded-[14px] bg-transparent focus-visible:outline-none text-text-primary placeholder:text-text-muted"
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

      <nav aria-label="页面导航" className="flex-1 px-3 py-1 overflow-y-auto scrollbar-thin">
        <div className="k2-sidebar__section-label">媒体</div>
        <div className="space-y-2 mb-5">
          {primaryMediaRoutes.map((route) => {
            const Icon = NAVIGATION_ICONS[route.id];
            const isCurrent = currentPage === route.id;
            const subline = route.id === 'asmr-lib' ? 'RJ / ASMR / Voice' : 'Songs / Albums / Artists';
            return (
              <button
                key={route.id}
                id={`nav-${route.id}`}
                type="button"
                data-k2-media-nav={route.id}
                data-active={isCurrent ? 'true' : 'false'}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => handleNavClick(route.id)}
                className="k2-media-nav-card w-full text-left"
              >
                <span className="k2-media-nav-card__icon"><Icon aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-text-primary">{route.label}</span>
                  <span className="mt-0.5 block truncate text-[9px] tracking-wide text-text-muted">{subline}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="k2-sidebar__section-label">空间</div>
        <div className="space-y-1">
          {secondaryRoutes.map((route) => {
            const Icon = NAVIGATION_ICONS[route.id];
            const isCurrent = currentPage === route.id;
            return (
              <button
                key={route.id}
                id={`nav-${route.id}`}
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => handleNavClick(route.id)}
                className={`h-10 w-full flex items-center justify-between px-3 rounded-xl text-[12px] text-left ${getNavItemClass(isCurrent)}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{route.label}</span>
                </span>
                {isCurrent && <span className="k2-nav-item__dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </nav>

      <div hidden aria-hidden="true">
        <button id="sidebar-ai-maintenance-toggle" type="button" />
        <button id="nav-diagnostics" type="button" onClick={() => handleNavClick('diagnostics')} />
      </div>

      <div className="k2-sidebar__footer px-3.5 pb-3 pt-2">
        {settingsRoute ? (
          <button
            id="nav-settings"
            type="button"
            aria-current={currentPage === 'settings' ? 'page' : undefined}
            onClick={() => handleNavClick('settings')}
            className={`h-10 w-full flex items-center gap-3 px-3 rounded-xl text-[12px] text-left ${getNavItemClass(currentPage === 'settings')}`}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span className="flex-1">{settingsRoute.label}</span>
          </button>
        ) : null}
        <div className="k2-local-badge mt-2 flex items-center gap-2 px-3 py-2 text-[9px] text-text-muted">
          <Sparkles className="w-3 h-3 text-brand-color" aria-hidden="true" />
          <span>本地优先 · 私人媒体空间</span>
        </div>
      </div>
    </aside>
  );
}
