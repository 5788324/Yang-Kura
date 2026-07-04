import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Search, 
  AlertCircle, 
  ImageOff, 
  AudioLines, 
  CheckCircle, 
  Clock, 
  Calendar,
  Grid,
  Filter,
  ArrowUpDown,
  Edit3,
  Trash2,
  Heart,
  ListPlus,
  RefreshCw,
  Plus,
  X,
  FileText,
  Subtitles,
  Star,
  Building2,
  Mic,
  Tag
} from 'lucide-react';
import { RJWork, RJStatus, ThemeType, Playlist } from '../types';
import { QUICK_CIRCLES, QUICK_TAGS, QUICK_VAS } from '../quickFiltersData';

interface AsmrLibraryProps {
  rjWorks: RJWork[];
  setAsmrDetailId: (id: string | null) => void;
  searchQuery: string;
  onUpdateRjWork?: (updated: RJWork) => void;
  onDeleteRjWork?: (id: string) => void;
  onRefetchRjMetadata?: (rjId: string) => void;
  onAddRjWorkTracksToPlaylist?: (rjId: string, playlistId: string) => void;
  playlists?: Playlist[];
}

export default function AsmrLibrary({
  rjWorks,
  setAsmrDetailId,
  searchQuery,
  onUpdateRjWork,
  onDeleteRjWork,
  onRefetchRjMetadata,
  onAddRjWorkTracksToPlaylist,
  playlists = []
}: AsmrLibraryProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchField, setSearchField] = useState<'all' | 'id' | 'title' | 'circle' | 'cv' | 'tag' | 'filename'>('all');
  const [localQuery, setLocalQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id-desc' | 'id-asc' | 'duration-desc' | 'date-desc' | 'added-desc' | 'rating-desc' | 'title-asc' | 'size-desc' | 'played-desc' | 'filesize-desc'>('added-desc');

  // Quick filters modal states (Requirement 3)
  const [quickFilterType, setQuickFilterType] = useState<'none' | 'circle' | 'cv' | 'tag'>('none');
  const [quickFilterSearch, setQuickFilterSearch] = useState<string>('');

  // Memoized filtered items for Quick Filter Modals (Requirement 3)
  const displayItems = useMemo(() => {
    let list = [];
    if (quickFilterType === 'circle') list = QUICK_CIRCLES;
    else if (quickFilterType === 'cv') list = QUICK_VAS;
    else if (quickFilterType === 'tag') list = QUICK_TAGS;

    if (!quickFilterSearch.trim()) return list;
    const q = quickFilterSearch.toLowerCase();
    return list.filter(item => item.name.toLowerCase().includes(q));
  }, [quickFilterType, quickFilterSearch]);

  // Right click context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    rjId: string;
  } | null>(null);

  // Edit metadata modal state
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    rjId: string;
    title: string;
    circle: string;
    cvsStr: string;
    releaseDate: string;
    description: string;
    tags: string[];
  } | null>(null);

  // Manual tag input state
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Refetching loading overlay state on cards
  const [refetchingIds, setRefetchingIds] = useState<string[]>([]);

  // Show a mini success feedback alert
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Close context menu on any click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu) {
        setContextMenu(prev => prev ? { ...prev, visible: false } : null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu]);

  // Handler: trigger custom right-click on an album
  const handleContextMenu = (e: React.MouseEvent, rjId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      rjId
    });
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2000);
  };

  // Helper: Format duration (seconds -> h小时m分钟)
  const formatTotalDuration = (seconds: number) => {
    if (seconds === 0) return '0分钟';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}小时${m}分钟`;
    }
    return `${m}分钟`;
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    rjWorks.forEach(work => work.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [rjWorks]);

  // Compute status stats
  const stats = useMemo(() => {
    const result = {
      total: rjWorks.length,
      identified: 0,
      missingCover: 0,
      missingAudio: 0,
      warning: 0
    };
    rjWorks.forEach(work => {
      if (work.status === 'identified') result.identified++;
      else if (work.status === 'missing-cover') result.missingCover++;
      else if (work.status === 'missing-audio') result.missingAudio++;
      else if (work.status === 'warning') result.warning++;
    });
    return result;
  }, [rjWorks]);

  // Filter and sort RJ items
  const filteredAndSortedWorks = useMemo(() => {
    let list = [...rjWorks];

    // Filter by global OR local query
    const rawQ = (localQuery || searchQuery || '').trim().toLowerCase();
    if (rawQ.length > 0) {
      list = list.filter(item => {
        switch (searchField) {
          case 'id':
            return item.id.toLowerCase().includes(rawQ);
          case 'title':
            return item.title.toLowerCase().includes(rawQ);
          case 'circle':
            return item.circle.toLowerCase().includes(rawQ);
          case 'cv':
            return item.cvs.some(cv => cv.toLowerCase().includes(rawQ));
          case 'tag':
            return item.tags.some(t => t.toLowerCase().includes(rawQ));
          case 'filename':
            // Search inside track filepaths
            return item.tracks?.some(t => t.fileTreePath?.toLowerCase().includes(rawQ));
          default: // 'all' (模糊)
            return (
              item.title.toLowerCase().includes(rawQ) ||
              item.id.toLowerCase().includes(rawQ) ||
              item.circle.toLowerCase().includes(rawQ) ||
              item.cvs.some(cv => cv.toLowerCase().includes(rawQ)) ||
              item.tags.some(t => t.toLowerCase().includes(rawQ)) ||
              item.tracks?.some(t => t.fileTreePath?.toLowerCase().includes(rawQ))
            );
        }
      });
    }

    // Filter by status tab
    if (statusFilter !== 'all') {
      list = list.filter(item => item.status === statusFilter);
    }

    // Filter by selected tag
    if (selectedTag) {
      list = list.filter(item => item.tags.includes(selectedTag));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'id-desc') {
        return b.id.localeCompare(a.id);
      } else if (sortBy === 'id-asc') {
        return a.id.localeCompare(b.id);
      } else if (sortBy === 'duration-desc') {
        return b.totalDuration - a.totalDuration;
      } else if (sortBy === 'date-desc') {
        return b.releaseDate.localeCompare(a.releaseDate);
      } else if (sortBy === 'added-desc') {
        const dateA = a.addedAt || '';
        const dateB = b.addedAt || '';
        return dateB.localeCompare(dateA);
      } else if (sortBy === 'rating-desc') {
        const ratingA = a.rating || Number(localStorage.getItem(`asmr_rating_${a.id}`)) || 0;
        const ratingB = b.rating || Number(localStorage.getItem(`asmr_rating_${b.id}`)) || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return b.id.localeCompare(a.id); // Tiebreaker
      } else if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'size-desc' || sortBy === 'filesize-desc') {
        return b.fileCount - a.fileCount;
      } else if (sortBy === 'played-desc') {
        const playedA = Number(localStorage.getItem(`asmr_last_played_${a.id}`)) || 0;
        const playedB = Number(localStorage.getItem(`asmr_last_played_${b.id}`)) || 0;
        if (playedB !== playedA) return playedB - playedA;
        return b.id.localeCompare(a.id); // Tiebreaker
      }
      return 0;
    });

    return list;
  }, [rjWorks, searchQuery, localQuery, searchField, statusFilter, selectedTag, sortBy]);

  // Render color-coded status badge
  const renderStatusBadge = (status: RJStatus) => {
    switch (status) {
      case 'identified':
        return (
          <span className="flex items-center space-x-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
            <CheckCircle className="w-2.5 h-2.5" />
            <span>已识别</span>
          </span>
        );
      case 'missing-cover':
        return (
          <span className="flex items-center space-x-1 bg-amber-500/20 border border-amber-400/30 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
            <ImageOff className="w-2.5 h-2.5" />
            <span>缺封面</span>
          </span>
        );
      case 'missing-audio':
        return (
          <span className="flex items-center space-x-1 bg-rose-500/20 border border-rose-400/30 text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
            <AudioLines className="w-2.5 h-2.5" />
            <span>缺音频</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center space-x-1 bg-red-500/20 border border-red-400/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>异常</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and statistics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Headphones className="w-5.5 h-5.5 text-brand-color" />
            <span>ASMR 媒体库</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            自动匹配 DLsite 元数据，支持本地双耳 3D 录音分类整理。
          </p>
        </div>
      </div>

      {/* Comprehensive Search & Filter Control Panel (Requirements 4, 5, 7) */}
      <div className="bg-card-bg/20 border border-border-color/50 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search fields input group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={
                searchField === 'all' ? '输入 标题/RJ号/社团/声优/标签/文件名 模糊检索...' :
                searchField === 'id' ? '输入 RJ 编码 (例如 RJ100204)...' :
                searchField === 'title' ? '输入作品标题检索...' :
                searchField === 'circle' ? '输入制作社团检索...' :
                searchField === 'cv' ? '输入声优/CV姓名检索...' :
                searchField === 'tag' ? '输入标签名称筛选...' : '输入音轨文件名检索 (flac/mp3/lrc)...'
              }
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-border-color/80 hover:border-brand-color focus:border-brand-color rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary outline-none transition-all placeholder-zinc-500"
            />
            {localQuery && (
              <button 
                onClick={() => setLocalQuery('')} 
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Dropdown to select search filter attribute */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
            className="bg-card-bg border border-border-color text-text-primary rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-color cursor-pointer transition-colors font-semibold"
          >
            <option value="all">🔍 综合模糊搜索</option>
            <option value="id">🆔 按 RJ作品号</option>
            <option value="title">📖 按 作品标题</option>
            <option value="circle">🤝 按 制作社团</option>
            <option value="cv">🎙️ 按 声优 / CV</option>
            <option value="tag">🏷️ 按 分类标签</option>
            <option value="filename">📄 按 音频文件名</option>
          </select>

          {/* Quick Filters (Requirement 3: 社团, 声优, 标签) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                setQuickFilterType('circle');
                setQuickFilterSearch('');
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-text-primary hover:text-brand-color border border-border-color hover:border-brand-color rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>社团</span>
            </button>
            <button
              onClick={() => {
                setQuickFilterType('cv');
                setQuickFilterSearch('');
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-text-primary hover:text-brand-color border border-border-color hover:border-brand-color rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>声优</span>
            </button>
            <button
              onClick={() => {
                setQuickFilterType('tag');
                setQuickFilterSearch('');
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-text-primary hover:text-brand-color border border-border-color hover:border-brand-color rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>标签</span>
            </button>
          </div>
        </div>

        {/* View Mode & Sorting Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-950/50 border border-border-color/60 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-color text-white shadow' : 'text-text-muted hover:text-text-primary'}`}
              title="封面墙网格卡片"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-color text-white shadow' : 'text-text-muted hover:text-text-primary'}`}
              title="表格详细列表"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border-color/60 hidden sm:block" />

          {/* Sort selection */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-card-bg border border-border-color text-text-primary rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-color cursor-pointer transition-colors font-semibold"
            >
              <option value="added-desc">🕒 最近添加</option>
              <option value="played-desc">🎧 最近播放</option>
              <option value="rating-desc">⭐ 评分最高</option>
              <option value="date-desc">📅 发售日期: 新→旧</option>
              <option value="title-asc">📖 标题 A-Z</option>
              <option value="id-desc">🆔 RJ号: 从高到低</option>
              <option value="id-asc">🆔 RJ号: 从低到高</option>
              <option value="duration-desc">⏳ 总播放时长</option>
              <option value="filesize-desc">📦 物理文件大小 (体积)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-text-muted flex justify-between items-center px-1">
        <span>当前共过滤出 <span className="text-text-primary font-bold font-mono">{filteredAndSortedWorks.length}</span> 个 RJ 音声作品</span>
        {viewMode === 'list' ? <span>📊 表格详细列表管理模式</span> : <span>🎨 封面墙美学浏览模式</span>}
      </div>

      {/* RJ Render Area */}
      {filteredAndSortedWorks.length === 0 ? (
        <div className="py-16 text-center bg-card-bg/20 rounded-2xl border border-dashed border-border-color flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-text-muted mb-3 stroke-1" />
          <h3 className="text-sm font-semibold text-text-primary">无匹配音声资源</h3>
          <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
            请确认是否输入了正确的关键词，或改变/重置搜索条件。
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* TABLE LIST VIEW (Requirement 4) */
        <div className="bg-card-bg/25 border border-border-color/40 rounded-xl overflow-hidden overflow-x-auto shadow-inner">
          <table className="w-full text-left text-[11px] text-text-secondary border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/40 border-b border-border-color/40 text-text-muted text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3 w-14 text-center">封面</th>
                <th className="p-3 w-20">RJ作品号</th>
                <th className="p-3 min-w-[280px] max-w-[400px]">作品标题</th>
                <th className="p-3 w-36">制作社团</th>
                <th className="p-3 w-32">参与声优</th>
                <th className="p-3 min-w-[160px]">标签</th>
                <th className="p-3 w-24 text-center">总播放时长</th>
                <th className="p-3 w-24 text-center">字幕状态</th>
                <th className="p-3 w-24 text-center">诊断状态</th>
                <th className="p-3 w-24 text-center">添加日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/20">
              {filteredAndSortedWorks.map(rj => {
                // Check if any track has subtitles associated
                const hasSubtitle = rj.tracks?.some(t => {
                  const stored = localStorage.getItem(`asmr_track_subtitles_${rj.id}`);
                  if (stored) {
                    try {
                      const map = JSON.parse(stored);
                      return map[t.id] && map[t.id] !== 'none';
                    } catch (e) {}
                  }
                  return false;
                });
                
                return (
                  <tr 
                    key={rj.id} 
                    onClick={() => setAsmrDetailId(rj.id)}
                    onContextMenu={(e) => handleContextMenu(e, rj.id)}
                    className="hover:bg-hover-bg/60 transition-colors cursor-pointer group"
                  >
                    <td className="p-2.5">
                      <div className="w-9 h-9 rounded overflow-hidden bg-zinc-800 border border-white/5">
                        {rj.coverUrl ? (
                          <img src={rj.coverUrl} alt={rj.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600 font-bold">Cover</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-zinc-300 group-hover:text-brand-color transition-colors">
                      {rj.id}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-text-primary group-hover:text-brand-color transition-colors truncate max-w-[280px] sm:max-w-[360px]" title={rj.title}>
                        {rj.title}
                      </div>
                    </td>
                    <td className="p-3 truncate max-w-[140px] font-medium" title={rj.circle}>
                      {rj.circle}
                    </td>
                    <td className="p-3 truncate max-w-[120px]" title={rj.cvs.join(', ')}>
                      {rj.cvs.join(', ')}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {rj.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] bg-border-color/30 text-text-secondary px-1.5 py-0.2 rounded font-medium">
                            {t}
                          </span>
                        ))}
                        {rj.tags.length > 2 && <span className="text-[9px] text-text-muted">+{rj.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold">
                      {formatTotalDuration(rj.totalDuration)}
                    </td>
                    <td className="p-3 text-center">
                      {hasSubtitle ? (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                          [中/双语]
                        </span>
                      ) : (
                        <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                          无
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">{renderStatusBadge(rj.status)}</div>
                    </td>
                    <td className="p-3 text-center font-mono text-[10px] text-text-muted">
                      {rj.addedAt ? rj.addedAt.split(' ')[0] : '2026-07-02'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARD WALL VIEW (Requirement 4) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5">
          {filteredAndSortedWorks.map(rj => {
            const hasSubtitle = rj.tracks?.some(t => {
              const stored = localStorage.getItem(`asmr_track_subtitles_${rj.id}`);
              if (stored) {
                try {
                  const map = JSON.parse(stored);
                  return map[t.id] && map[t.id] !== 'none';
                } catch (e) {}
              }
              return false;
            });

            return (
              <div 
                key={rj.id}
                onClick={() => setAsmrDetailId(rj.id)}
                onContextMenu={(e) => handleContextMenu(e, rj.id)}
                className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl shadow-sm relative"
              >
                {/* Cover area */}
                <div className="relative aspect-square w-full bg-zinc-850 overflow-hidden">
                  {rj.coverUrl ? (
                    <img 
                      src={rj.coverUrl} 
                      alt={rj.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-850 text-zinc-500 text-xs">
                      <ImageOff className="w-12 h-12 mb-2 stroke-1 text-zinc-600" />
                      <span>本地未检测到 Cover 封面</span>
                    </div>
                  )}
                  {/* Refetching loading overlay */}
                  {refetchingIds.includes(rj.id) && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-10 space-y-2 p-3 text-center">
                      <RefreshCw className="w-7 h-7 text-brand-color animate-spin" />
                      <span className="text-[10px] text-zinc-300 font-semibold leading-relaxed">正在并发请求代理接口补全元数据...</span>
                    </div>
                  )}
                  {/* Overlay status badging */}
                  <div className="absolute top-2.5 right-2.5">
                    {renderStatusBadge(rj.status)}
                  </div>
                  {/* RJ number tag */}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold font-mono text-zinc-100 border border-white/5 flex items-center space-x-1.5">
                    <span>{rj.id}</span>
                    {hasSubtitle && (
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" title="已关联本地中文字幕" />
                    )}
                  </div>
                </div>

                {/* Work Details info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-brand-color transition-colors" title={rj.title}>
                      {rj.title}
                    </h3>
                    <div className="flex flex-wrap items-center text-[10px] text-text-muted gap-x-2">
                      <span className="truncate max-w-[125px]" title={rj.circle}>{rj.circle}</span>
                      <span className="text-border-color">|</span>
                      <span className="truncate max-w-[100px]" title={rj.cvs.join('/')}>CV: {rj.cvs.join('/')}</span>
                    </div>
                  </div>

                  {/* Tags preview */}
                  <div className="flex flex-wrap gap-1 overflow-hidden h-5.5">
                    {rj.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] bg-border-color/30 text-text-secondary px-1.5 py-0.5 rounded truncate">
                        {tag}
                      </span>
                    ))}
                    {rj.tags.length > 3 && (
                      <span className="text-[9px] text-text-muted px-1 py-0.5">
                        +{rj.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer specs */}
                  <div className="pt-3 border-t border-border-color/40 flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span className="flex items-center space-x-1">
                      <AudioLines className="w-3 h-3 text-indigo-400" />
                      <span>{rj.fileCount} 个分轨</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      {hasSubtitle && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-bold" title="本作品已自动关联物理字幕">
                          LRC 字幕
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-pink-400" />
                        <span>{formatTotalDuration(rj.totalDuration)}</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce-subtle">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 w-52 text-xs font-medium text-text-primary select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action: Edit Metadata */}
          <button
            onClick={() => {
              const rj = rjWorks.find(item => item.id === contextMenu.rjId);
              if (rj) {
                setEditModal({
                  visible: true,
                  rjId: rj.id,
                  title: rj.title,
                  circle: rj.circle,
                  cvsStr: rj.cvs.join(', '),
                  releaseDate: rj.releaseDate,
                  description: rj.description || '',
                  tags: [...rj.tags]
                });
              }
              setContextMenu(prev => prev ? { ...prev, visible: false } : null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>编辑本地元数据 & 标签</span>
          </button>

          {/* Action: Refetch Metadata */}
          <button
            onClick={() => {
              const rjId = contextMenu.rjId;
              setRefetchingIds(prev => [...prev, rjId]);
              setContextMenu(prev => prev ? { ...prev, visible: false } : null);
              
              setTimeout(() => {
                onRefetchRjMetadata?.(rjId);
                setRefetchingIds(prev => prev.filter(id => id !== rjId));
                showFeedback('元数据与音轨信息已并发抓取并补全！');
              }, 1200);
            }}
            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>重新抓取 ASMR.one 元数据</span>
          </button>

          {/* Submenu: Add to Playlist */}
          <div className="relative group/sub border-t border-white/5 my-1 pt-1">
            <div className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center justify-between text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <div className="flex items-center space-x-2">
                <ListPlus className="w-3.5 h-3.5 text-pink-400" />
                <span>添加到我的歌单</span>
              </div>
              <span className="text-[9px] text-text-muted">▶</span>
            </div>
            {/* Playlists Popover Submenu */}
            <div className="absolute left-full top-0 ml-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 hidden group-hover/sub:block w-44">
              {playlists.length === 0 ? (
                <div className="px-3 py-2 text-[10px] text-text-muted">暂无任何歌单</div>
              ) : (
                playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAddRjWorkTracksToPlaylist?.(contextMenu.rjId, p.id);
                      setContextMenu(prev => prev ? { ...prev, visible: false } : null);
                      showFeedback(`已成功导入《${p.name}》`);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/5 rounded-md truncate transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Action: Toggle Favorite */}
          <button
            onClick={() => {
              const rj = rjWorks.find(item => item.id === contextMenu.rjId);
              if (rj && onUpdateRjWork) {
                const isFav = rj.tags.includes('我的喜欢');
                const nextTags = isFav 
                  ? rj.tags.filter(t => t !== '我的喜欢') 
                  : [...rj.tags, '我的喜欢'];
                onUpdateRjWork({ ...rj, tags: nextTags });
                showFeedback(isFav ? '已取消标星收藏' : '已收藏到“我的喜欢”');
              }
              setContextMenu(prev => prev ? { ...prev, visible: false } : null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-t border-white/5 mt-1 pt-1"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span>收藏 / 取消 喜欢</span>
          </button>

          {/* Action: Delete */}
          <button
            onClick={() => {
              if (confirm('确定要从本地ASMR库中彻底删除该 RJ 专辑吗？(此操作不可逆)')) {
                onDeleteRjWork?.(contextMenu.rjId);
                showFeedback('该专辑已物理删除。');
              }
              setContextMenu(prev => prev ? { ...prev, visible: false } : null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer border-t border-white/5 mt-1 pt-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>物理移除此作品</span>
          </button>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editModal && editModal.visible && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setEditModal(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/25">
              <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>编辑本地元数据 & 标签修改 ({editModal.rjId})</span>
              </h3>
              <button 
                onClick={() => setEditModal(null)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-5 overflow-y-auto scrollbar-thin space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">作品标题 (Title)</label>
                <input 
                  type="text"
                  value={editModal.title}
                  onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">制作社团 (Circle)</label>
                  <input 
                    type="text"
                    value={editModal.circle}
                    onChange={(e) => setEditModal({ ...editModal, circle: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">发售日期</label>
                  <input 
                    type="text"
                    value={editModal.releaseDate}
                    onChange={(e) => setEditModal({ ...editModal, releaseDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs font-mono outline-none focus:border-brand-color transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">声优 / CV (用英文逗号隔开)</label>
                <input 
                  type="text"
                  value={editModal.cvsStr}
                  onChange={(e) => setEditModal({ ...editModal, cvsStr: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">专辑详情/简介</label>
                <textarea 
                  rows={3}
                  value={editModal.description}
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-text-primary text-xs outline-none focus:border-brand-color transition-colors resize-none scrollbar-thin"
                />
              </div>

              {/* Tags Area */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">本地标签管理</label>
                
                {/* Render current tags pills */}
                <div className="flex flex-wrap gap-1.5">
                  {editModal.tags.length === 0 ? (
                    <span className="text-[10px] text-text-muted italic">暂无任何手动或自动分配的标签</span>
                  ) : (
                    editModal.tags.map(t => (
                      <span 
                        key={t}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800 text-[10px] text-text-secondary border border-white/5 font-medium"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => setEditModal({
                            ...editModal,
                            tags: editModal.tags.filter(tag => tag !== t)
                          })}
                          className="hover:text-rose-400 transition-colors font-bold text-[11px] cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Tag Input adder */}
                <div className="flex items-center space-x-2 mt-2">
                  <input 
                    type="text"
                    value={newTagInput}
                    placeholder="按回车或点击按钮追加新标签..."
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newTagInput.trim();
                        if (val && !editModal.tags.includes(val)) {
                          setEditModal({
                            ...editModal,
                            tags: [...editModal.tags, val]
                          });
                          setNewTagInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-zinc-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-color transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newTagInput.trim();
                      if (val && !editModal.tags.includes(val)) {
                        setEditModal({
                          ...editModal,
                          tags: [...editModal.tags, val]
                        });
                        setNewTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-text-primary text-[11px] font-bold transition-colors cursor-pointer border border-white/5"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-white/5 flex items-center justify-end space-x-2 bg-black/25">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer border border-white/5"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const original = rjWorks.find(item => item.id === editModal.rjId);
                  if (original && onUpdateRjWork) {
                    onUpdateRjWork({
                      ...original,
                      title: editModal.title,
                      circle: editModal.circle,
                      cvs: editModal.cvsStr.split(',').map(s => s.trim()).filter(Boolean),
                      releaseDate: editModal.releaseDate,
                      description: editModal.description,
                      tags: editModal.tags
                    });
                  }
                  setEditModal(null);
                  showFeedback('元数据及标签保存修改成功！');
                }}
                className="px-4 py-2 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Modal (Requirement 3: 社团, 声优, 标签 grid overlay) */}
      {quickFilterType !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center space-x-2">
                {quickFilterType === 'circle' && <Building2 className="w-5 h-5 text-brand-color" />}
                {quickFilterType === 'cv' && <Mic className="w-5 h-5 text-brand-color" />}
                {quickFilterType === 'tag' && <Tag className="w-5 h-5 text-brand-color" />}
                <h3 className="font-bold text-base text-text-primary">
                  {quickFilterType === 'circle' && 'All circles'}
                  {quickFilterType === 'cv' && 'All vas'}
                  {quickFilterType === 'tag' && 'All tags'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setQuickFilterType('none');
                  setQuickFilterSearch('');
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="p-4 border-b border-white/5 bg-black/10">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder={
                    quickFilterType === 'circle' ? 'Search for a circles...' :
                    quickFilterType === 'cv' ? 'Search for a vas...' : 'Search for a tags...'
                  }
                  value={quickFilterSearch}
                  onChange={(e) => setQuickFilterSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary outline-none hover:border-brand-color focus:border-brand-color transition-colors placeholder-zinc-600"
                  autoFocus
                />
                {quickFilterSearch && (
                  <button 
                    onClick={() => setQuickFilterSearch('')}
                    className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Grid List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              {displayItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-text-muted italic">
                  没有找到匹配的筛选项目
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {displayItems.map((item, index) => (
                    <div
                      key={item.name + '_' + index}
                      onClick={() => {
                        // Apply filter
                        setSearchField(
                          quickFilterType === 'circle' ? 'circle' :
                          quickFilterType === 'cv' ? 'cv' : 'tag'
                        );
                        setLocalQuery(item.name);
                        
                        // Close modal
                        setQuickFilterType('none');
                        setQuickFilterSearch('');
                        
                        showFeedback(`已自动应用筛选: ${item.name}`);
                      }}
                      className="bg-zinc-950/40 hover:bg-zinc-800 border border-white/5 hover:border-brand-color rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm"
                    >
                      <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary truncate mr-2" title={item.name}>
                        {item.name}
                      </span>
                      <span className="bg-[#138e78] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center justify-center min-w-[2.2rem] text-center flex-shrink-0">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
