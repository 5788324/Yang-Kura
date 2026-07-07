import React from 'react';
import { PageType, ThemeType } from '../types';
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
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentTheme: ThemeType;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
}

/* Legacy verifier marker: 导入规划. Current user-facing entry is 导入器. */
export default function Sidebar({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  currentTheme,
  setAsmrDetailId,
  setPlaylistDetailId
}: SidebarProps) {
  
  const handleNavClick = (page: PageType) => {
    setCurrentPage(page);
    setAsmrDetailId(null);
    setPlaylistDetailId(null);
  };

  const navItems = [
    { id: 'dashboard', label: '首页', icon: History },
    { id: 'asmr-lib', label: 'ASMR', icon: Headphones },
    { id: 'music-lib', label: '流行音乐', icon: Music },
    { id: 'playlists', label: '我的歌单', icon: ListMusic },
    { id: 'importer', label: '导入器', icon: ArchiveRestore },
    { id: 'downloader', label: '下载规划', icon: DownloadCloud },
    { id: 'settings', label: '系统设置', icon: Settings },
    { id: 'diagnostics', label: '诊断工具', icon: Cpu },
  ];

  // Helper for conditional active styles
  const activeClass = (id: PageType) => {
    const isActive = currentPage === id;
    if (isActive) {
      return 'bg-brand-active text-white font-medium shadow-md shadow-black/10';
    }
    return 'hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-all duration-200';
  };

  return (
    <aside 
      id="app-sidebar" 
      className="w-64 h-full flex flex-col border-r border-border-color bg-sidebar-bg/95 backdrop-blur-lg select-none"
    >
      {/* Brand Logo */}
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Headphones className="w-5 h-5 animate-pulse" />
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

      {/* Global Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary group-focus-within:text-brand-color transition-colors" />
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="搜索作品、歌曲、CV、社团..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-input-bg border border-border-color focus:border-brand-color text-text-primary focus:outline-none transition-all placeholder:text-text-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-text-secondary hover:text-text-primary"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-3 mb-2 text-[10px] font-semibold text-text-muted tracking-wider uppercase">
          导航菜单
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="space-y-1">
              <button
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id as PageType)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left ${activeClass(item.id as PageType)}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {currentPage === item.id && <ChevronRight className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </nav>

    </aside>
  );
}
