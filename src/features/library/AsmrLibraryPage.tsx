import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckSquare2,
  Clock3,
  Edit3,
  FileText,
  Grid2X2,
  Heart,
  Headphones,
  List,
  ListPlus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import CoverArtwork from '../../components/CoverArtwork';
import {
  libraryBrowseService,
  type WorkPlaybackFilter,
  type WorkSourceFilter,
  type WorkSubtitleFilter,
} from '../../services/libraryBrowseService';
import {
  LARGE_LIBRARY_RENDER_LIMITS,
  libraryPerformanceService,
} from '../../services/libraryPerformanceService';
import { Button, Dialog, Feedback, MediaCard, Surface, TrackRow } from '../../shared/ui';
import type { Playlist, RJStatus, RJWork } from '../../types';

export interface AsmrLibraryPageProps {
  rjWorks: RJWork[];
  setAsmrDetailId: (id: string | null) => void;
  searchQuery: string;
  onUpdateRjWork?: (updated: RJWork) => void;
  onDeleteRjWork?: (id: string) => void;
  onRefetchRjMetadata?: (rjId: string) => void;
  onAddRjWorkTracksToPlaylist?: (rjId: string, playlistId: string) => void;
  playlists?: Playlist[];
}

type ViewMode = 'grid' | 'list';
type SearchField = 'all' | 'id' | 'title' | 'circle' | 'cv' | 'tag' | 'filename';
type PersonalStatusFilter = 'all' | 'unheard' | 'listening' | 'completed' | 'abandoned';
type SortMode = 'added-desc' | 'played-desc' | 'rating-desc' | 'date-desc' | 'title-asc' | 'id-desc' | 'id-asc' | 'duration-desc' | 'filesize-desc';

interface EditDraft {
  id: string;
  title: string;
  circle: string;
  cvs: string;
  releaseDate: string;
  description: string;
  tags: string;
}

function formatDuration(seconds: number | undefined) {
  if (!Number.isFinite(seconds)) return '未统计';
  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (hours > 0) return `${hours} 小时 ${minutes} 分`;
  return `${minutes} 分钟`;
}

function statusLabel(status: RJStatus) {
  if (status === 'identified') return '资源正常';
  if (status === 'missing-cover') return '缺少封面';
  if (status === 'missing-audio') return '缺少音频';
  return '需要检查';
}

function statusTone(status: RJStatus) {
  if (status === 'identified') return 'success';
  if (status === 'missing-cover') return 'warning';
  return 'danger';
}

export default function AsmrLibraryPage({
  rjWorks,
  setAsmrDetailId,
  searchQuery,
  onUpdateRjWork,
  onDeleteRjWork,
  onRefetchRjMetadata,
  onAddRjWorkTracksToPlaylist,
  playlists = [],
}: AsmrLibraryPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [localQuery, setLocalQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('added-desc');
  const [sourceFilter, setSourceFilter] = useState<WorkSourceFilter>('all');
  const [subtitleFilter, setSubtitleFilter] = useState<WorkSubtitleFilter>('all');
  const [playbackFilter, setPlaybackFilter] = useState<WorkPlaybackFilter>('all');
  const [personalStatusFilter, setPersonalStatusFilter] = useState<PersonalStatusFilter>('all');
  const [circleFilter, setCircleFilter] = useState('all');
  const [cvFilter, setCvFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [renderLimit, setRenderLimit] = useState(LARGE_LIBRARY_RENDER_LIMITS.asmrInitial);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set<string>());
  const [targetPlaylistId, setTargetPlaylistId] = useState(playlists[0]?.id ?? '');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const deferredGlobalQuery = useDeferredValue(searchQuery);
  const deferredLocalQuery = useDeferredValue(localQuery);

  useEffect(() => {
    if (!targetPlaylistId && playlists[0]?.id) setTargetPlaylistId(playlists[0].id);
    if (targetPlaylistId && !playlists.some((playlist) => playlist.id === targetPlaylistId)) {
      setTargetPlaylistId(playlists[0]?.id ?? '');
    }
  }, [playlists, targetPlaylistId]);

  useEffect(() => {
    const validIds = new Set(rjWorks.map((work) => work.id));
    setSelectedIds((current) => {
      const next = new Set([...current].filter((id) => validIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [rjWorks]);

  const searchIndex = useMemo(() => libraryPerformanceService.buildAsmrSearchIndex(rjWorks), [rjWorks]);
  const circleOptions = useMemo(() => [...new Set(rjWorks.map((work) => work.circle).filter(Boolean))].sort(), [rjWorks]);
  const cvOptions = useMemo(() => [...new Set(rjWorks.flatMap((work) => work.cvs).filter(Boolean))].sort(), [rjWorks]);
  const tagOptions = useMemo(() => [...new Set(rjWorks.flatMap((work) => work.tags).filter(Boolean))].sort(), [rjWorks]);

  const filteredWorks = useMemo(() => {
    const historyMap = libraryBrowseService.buildHistoryMap();
    const normalizedQuery = libraryPerformanceService.normalizeQuery(deferredLocalQuery || deferredGlobalQuery || '');
    const list = rjWorks.filter((work) => {
      if (normalizedQuery) {
        const matches = searchField === 'id'
          ? work.id.toLocaleLowerCase().includes(normalizedQuery)
          : searchField === 'title'
            ? work.title.toLocaleLowerCase().includes(normalizedQuery)
            : searchField === 'circle'
              ? work.circle.toLocaleLowerCase().includes(normalizedQuery)
              : searchField === 'cv'
                ? work.cvs.some((cv) => cv.toLocaleLowerCase().includes(normalizedQuery))
                : searchField === 'tag'
                  ? work.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedQuery))
                  : searchField === 'filename'
                    ? work.tracks.some((track) => track.fileTreePath?.toLocaleLowerCase().includes(normalizedQuery))
                    : searchIndex.get(work.id)?.includes(normalizedQuery) ?? false;
        if (!matches) return false;
      }
      if (circleFilter !== 'all' && work.circle !== circleFilter) return false;
      if (cvFilter !== 'all' && !work.cvs.includes(cvFilter)) return false;
      if (tagFilter !== 'all' && !work.tags.includes(tagFilter)) return false;
      if (personalStatusFilter !== 'all' && (work.personalStatus ?? 'unheard') !== personalStatusFilter) return false;
      return libraryBrowseService.matchesSourceFilter(work, sourceFilter) &&
        libraryBrowseService.matchesSubtitleFilter(work, subtitleFilter) &&
        libraryBrowseService.matchesPlaybackFilter(work, playbackFilter, historyMap);
    });

    return list.sort((a, b) => {
      if (sortBy === 'id-desc') return b.id.localeCompare(a.id);
      if (sortBy === 'id-asc') return a.id.localeCompare(b.id);
      if (sortBy === 'duration-desc') return b.totalDuration - a.totalDuration;
      if (sortBy === 'date-desc') return b.releaseDate.localeCompare(a.releaseDate);
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'filesize-desc') return b.fileCount - a.fileCount;
      if (sortBy === 'rating-desc') return (b.rating ?? 0) - (a.rating ?? 0) || b.id.localeCompare(a.id);
      if (sortBy === 'played-desc') {
        return libraryBrowseService.getLastPlayedSortValue(b, historyMap) -
          libraryBrowseService.getLastPlayedSortValue(a, historyMap) || b.id.localeCompare(a.id);
      }
      return (b.addedAt ?? '').localeCompare(a.addedAt ?? '');
    });
  }, [circleFilter, cvFilter, deferredGlobalQuery, deferredLocalQuery, personalStatusFilter, playbackFilter, rjWorks, searchField, searchIndex, sortBy, sourceFilter, subtitleFilter, tagFilter]);

  useEffect(() => {
    setRenderLimit(LARGE_LIBRARY_RENDER_LIMITS.asmrInitial);
  }, [circleFilter, cvFilter, deferredGlobalQuery, deferredLocalQuery, personalStatusFilter, playbackFilter, searchField, sortBy, sourceFilter, subtitleFilter, tagFilter, viewMode]);

  const visibleWorks = useMemo(
    () => libraryPerformanceService.sliceRenderWindow(filteredWorks, renderLimit),
    [filteredWorks, renderLimit],
  );
  const renderWindow = useMemo(
    () => libraryPerformanceService.getRenderWindowModel(filteredWorks.length, visibleWorks.length, LARGE_LIBRARY_RENDER_LIMITS.asmrStep, '音声作品'),
    [filteredWorks.length, visibleWorks.length],
  );
  const allResultsSelected = filteredWorks.length > 0 && filteredWorks.every((work) => selectedIds.has(work.id));
  const isSearchPending = deferredGlobalQuery !== searchQuery || deferredLocalQuery !== localQuery;
  const hasFilters = Boolean(
    localQuery || searchQuery || circleFilter !== 'all' || cvFilter !== 'all' || tagFilter !== 'all' ||
    sourceFilter !== 'all' || subtitleFilter !== 'all' || playbackFilter !== 'all' || personalStatusFilter !== 'all',
  );

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const resetFilters = () => {
    setLocalQuery('');
    setSearchField('all');
    setCircleFilter('all');
    setCvFilter('all');
    setTagFilter('all');
    setSourceFilter('all');
    setSubtitleFilter('all');
    setPlaybackFilter('all');
    setPersonalStatusFilter('all');
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllResults = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allResultsSelected) filteredWorks.forEach((work) => next.delete(work.id));
      else filteredWorks.forEach((work) => next.add(work.id));
      return next;
    });
  };

  const addSelectionToPlaylist = () => {
    if (!targetPlaylistId || selectedIds.size === 0 || !onAddRjWorkTracksToPlaylist) return;
    const selectedWorks = rjWorks.filter((work) => selectedIds.has(work.id));
    selectedWorks.forEach((work) => onAddRjWorkTracksToPlaylist(work.id, targetPlaylistId));
    const playlistName = playlists.find((playlist) => playlist.id === targetPlaylistId)?.name ?? '歌单';
    showFeedback(`已将 ${selectedWorks.length} 个作品加入「${playlistName}」。`);
    setSelectedIds(new Set<string>());
  };

  const openEditor = (work: RJWork) => {
    setEditDraft({
      id: work.id,
      title: work.title,
      circle: work.circle,
      cvs: work.cvs.join(', '),
      releaseDate: work.releaseDate,
      description: work.description,
      tags: work.tags.join(', '),
    });
  };

  const saveEditDraft = () => {
    if (!editDraft || !onUpdateRjWork) return;
    const original = rjWorks.find((work) => work.id === editDraft.id);
    if (!original) return;
    onUpdateRjWork({
      ...original,
      title: editDraft.title.trim() || original.title,
      circle: editDraft.circle.trim() || original.circle,
      cvs: editDraft.cvs.split(/[,，]/).map((value) => value.trim()).filter(Boolean),
      releaseDate: editDraft.releaseDate.trim(),
      description: editDraft.description.trim(),
      tags: editDraft.tags.split(/[,，]/).map((value) => value.trim()).filter(Boolean),
    });
    setEditDraft(null);
    showFeedback('作品显示信息已保存。');
  };

  const toggleFavorite = (work: RJWork) => {
    if (!onUpdateRjWork) return;
    const isFavorite = work.tags.includes('我的喜欢');
    onUpdateRjWork({
      ...work,
      tags: isFavorite ? work.tags.filter((tag) => tag !== '我的喜欢') : [...work.tags, '我的喜欢'],
    });
    showFeedback(isFavorite ? '已取消喜欢。' : '已加入“我的喜欢”。');
  };

  const removeWork = (work: RJWork) => {
    if (!onDeleteRjWork) return;
    if (!window.confirm(`仅从当前界面列表移除《${work.title}》？不会删除、移动或重命名磁盘文件。`)) return;
    onDeleteRjWork(work.id);
    showFeedback('已从当前列表移除，磁盘文件未改变。');
  };

  const renderBadges = (work: RJWork) => {
    const subtitle = libraryBrowseService.getWorkSubtitleSummary(work);
    const playback = libraryBrowseService.getWorkPlaybackSummary(work);
    return (
      <>
        <span className="u37b-badge" data-tone={statusTone(work.status)}>{statusLabel(work.status)}</span>
        <span className="u37b-badge" data-tone={subtitle.hasSubtitle ? 'success' : 'neutral'}>
          {subtitle.hasSubtitle ? `字幕 ${subtitle.subtitleTrackCount}/${subtitle.totalTrackCount || 0}` : '无字幕'}
        </span>
        {playback.state !== 'unplayed' ? (
          <span className="u37b-badge" data-tone="info">{libraryBrowseService.formatPlaybackText(playback)}</span>
        ) : null}
      </>
    );
  };

  const renderActions = (work: RJWork) => (
    <>
      <button
        type="button"
        className="u37b-icon-button"
        aria-label={`编辑 ${work.title}`}
        title="编辑显示信息"
        onClick={(event) => { event.stopPropagation(); openEditor(work); }}
      ><Edit3 aria-hidden="true" /></button>
      <button
        type="button"
        className="u37b-icon-button"
        aria-label={`刷新 ${work.title}`}
        title="刷新卡片显示信息"
        onClick={(event) => {
          event.stopPropagation();
          onRefetchRjMetadata?.(work.id);
          showFeedback('本地显示信息已刷新。');
        }}
      ><RefreshCw aria-hidden="true" /></button>
      <button
        type="button"
        className="u37b-icon-button"
        data-active={work.tags.includes('我的喜欢') ? 'true' : 'false'}
        aria-label={work.tags.includes('我的喜欢') ? `取消喜欢 ${work.title}` : `喜欢 ${work.title}`}
        title="喜欢"
        onClick={(event) => { event.stopPropagation(); toggleFavorite(work); }}
      ><Heart aria-hidden="true" /></button>
      <button
        type="button"
        className="u37b-icon-button"
        data-tone="danger"
        aria-label={`移除 ${work.title}`}
        title="从当前列表移除"
        onClick={(event) => { event.stopPropagation(); removeWork(work); }}
      ><Trash2 aria-hidden="true" /></button>
    </>
  );

  return (
    <div className="u37b-asmr-library" data-u37b-asmr-library={viewMode}>
      <header className="u37b-page-heading">
        <div>
          <p className="u37b-page-heading__eyebrow">本地作品</p>
          <h2><Headphones aria-hidden="true" />音声库</h2>
          <p>浏览 ASMR/RJ 作品，按字幕、播放进度、社团、声优和个人状态筛选。</p>
        </div>
        <div className="u37b-page-heading__stats">
          <strong>{filteredWorks.length}</strong>
          <span>当前结果 / 共 {rjWorks.length} 个作品</span>
        </div>
      </header>

      <Surface padding="md" className="u37b-library-toolbar" aria-label="音声库筛选工具栏">
        <div className="u37b-library-toolbar__search">
          <Search aria-hidden="true" />
          <input
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
            placeholder="搜索标题、RJ 号、社团、声优、标签或文件名"
            aria-label="搜索音声作品"
          />
          {localQuery ? (
            <button type="button" onClick={() => setLocalQuery('')} aria-label="清除搜索"><X aria-hidden="true" /></button>
          ) : null}
        </div>
        <select value={searchField} onChange={(event) => setSearchField(event.target.value as SearchField)} aria-label="搜索字段">
          <option value="all">综合搜索</option>
          <option value="id">RJ 作品号</option>
          <option value="title">作品标题</option>
          <option value="circle">制作社团</option>
          <option value="cv">声优 / CV</option>
          <option value="tag">标签</option>
          <option value="filename">文件名</option>
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortMode)} aria-label="排序方式">
          <option value="added-desc">最近添加</option>
          <option value="played-desc">最近播放</option>
          <option value="rating-desc">评分最高</option>
          <option value="date-desc">发售日期</option>
          <option value="title-asc">标题 A-Z</option>
          <option value="id-desc">RJ 号从高到低</option>
          <option value="id-asc">RJ 号从低到高</option>
          <option value="duration-desc">总时长</option>
          <option value="filesize-desc">分轨数量</option>
        </select>
        <div className="u37b-segmented" aria-label="浏览模式">
          <button type="button" data-active={viewMode === 'grid'} onClick={() => setViewMode('grid')} aria-label="封面浏览"><Grid2X2 aria-hidden="true" /></button>
          <button type="button" data-active={viewMode === 'list'} onClick={() => setViewMode('list')} aria-label="列表浏览"><List aria-hidden="true" /></button>
        </div>

        <div className="u37b-library-toolbar__filters">
          <select value={circleFilter} onChange={(event) => setCircleFilter(event.target.value)} aria-label="社团筛选">
            <option value="all">全部社团</option>
            {circleOptions.map((circle) => <option key={circle} value={circle}>{circle}</option>)}
          </select>
          <select value={cvFilter} onChange={(event) => setCvFilter(event.target.value)} aria-label="声优筛选">
            <option value="all">全部声优</option>
            {cvOptions.map((cv) => <option key={cv} value={cv}>{cv}</option>)}
          </select>
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="标签筛选">
            <option value="all">全部标签</option>
            {tagOptions.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as WorkSourceFilter)} aria-label="来源筛选">
            <option value="all">全部来源</option>
            <option value="local-index">本地资源</option>
            <option value="demo">示例资源</option>
          </select>
          <select value={subtitleFilter} onChange={(event) => setSubtitleFilter(event.target.value as WorkSubtitleFilter)} aria-label="字幕筛选">
            <option value="all">全部字幕</option>
            <option value="has-subtitle">有字幕</option>
            <option value="missing-subtitle">无字幕</option>
          </select>
          <select value={playbackFilter} onChange={(event) => setPlaybackFilter(event.target.value as WorkPlaybackFilter)} aria-label="播放状态筛选">
            <option value="all">全部播放状态</option>
            <option value="unplayed">未播放</option>
            <option value="in-progress">听过 / 未听完</option>
            <option value="completed">已听完</option>
          </select>
          <select value={personalStatusFilter} onChange={(event) => setPersonalStatusFilter(event.target.value as PersonalStatusFilter)} aria-label="个人状态筛选">
            <option value="all">全部个人标记</option>
            <option value="unheard">待听</option>
            <option value="listening">收听中</option>
            <option value="completed">已完成</option>
            <option value="abandoned">已搁置</option>
          </select>
          {hasFilters ? <Button variant="ghost" size="sm" onClick={resetFilters}>重置筛选</Button> : null}
        </div>
      </Surface>

      <Surface padding="sm" tone="subtle" className="u37b-selection-bar" data-active={selectedIds.size > 0 ? 'true' : 'false'}>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={allResultsSelected ? <CheckSquare2 aria-hidden="true" /> : <Square aria-hidden="true" />}
          onClick={toggleAllResults}
          disabled={filteredWorks.length === 0}
        >
          {allResultsSelected ? '取消全选' : '全选当前结果'}
        </Button>
        <span>已选择 <strong>{selectedIds.size}</strong> 个作品</span>
        <div className="u37b-selection-bar__actions">
          <select value={targetPlaylistId} onChange={(event) => setTargetPlaylistId(event.target.value)} aria-label="目标歌单" disabled={playlists.length === 0}>
            {playlists.length === 0 ? <option value="">暂无歌单</option> : null}
            {playlists.map((playlist) => <option key={playlist.id} value={playlist.id}>{playlist.name}</option>)}
          </select>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<ListPlus aria-hidden="true" />}
            onClick={addSelectionToPlaylist}
            disabled={selectedIds.size === 0 || !targetPlaylistId || !onAddRjWorkTracksToPlaylist}
          >
            批量加入歌单
          </Button>
          {selectedIds.size > 0 ? <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set<string>())}>清除选择</Button> : null}
        </div>
      </Surface>

      <div id="mvp126-asmr-render-window" className="u37b-render-window">
        <span>{isSearchPending ? '正在更新搜索结果…' : renderWindow.summary}</span>
        {renderWindow.hasMore ? (
          <Button variant="ghost" size="sm" onClick={() => setRenderLimit((value) => value + LARGE_LIBRARY_RENDER_LIMITS.asmrStep)}>
            再显示 {renderWindow.nextCount} 项
          </Button>
        ) : null}
      </div>

      {filteredWorks.length === 0 ? (
        <Surface padding="lg" tone="subtle" className="u37b-empty-state">
          <Feedback
            tone="info"
            title="没有符合条件的音声作品"
            description="调整搜索词或筛选条件，不会修改资源库文件和 Index。"
            action={<Button variant="primary" onClick={resetFilters}>查看全部作品</Button>}
          />
        </Surface>
      ) : viewMode === 'grid' ? (
        <div className="u37b-media-grid u37b-asmr-grid" aria-label="音声作品封面列表">
          {visibleWorks.map((work) => (
            <MediaCard
              key={work.id}
              data-u37b-asmr-card={work.id}
              data-selected={selectedIds.has(work.id) ? 'true' : 'false'}
              title={work.title}
              subtitle={`${work.id} · ${work.circle}`}
              interactive
              role="button"
              tabIndex={0}
              onClick={() => setAsmrDetailId(work.id)}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setAsmrDetailId(work.id); }
              }}
              visual={(
                <div className="u37b-card-visual">
                  <CoverArtwork
                    src={work.coverUrl}
                    title={work.title}
                    subtitle={work.id}
                    kind="asmr"
                    className="h-full w-full object-cover"
                  />
                  <label className="u37b-card-select" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(work.id)}
                      onChange={() => toggleSelected(work.id)}
                      aria-label={`选择 ${work.title}`}
                    />
                    <span aria-hidden="true">{selectedIds.has(work.id) ? <Check /> : null}</span>
                  </label>
                </div>
              )}
              meta={(
                <div className="u37b-card-meta">
                  <span>{work.cvs.join(' / ') || '未标注声优'}</span>
                  <span><Clock3 aria-hidden="true" />{formatDuration(work.totalDuration)}</span>
                  <span><FileText aria-hidden="true" />{work.fileCount} 个分轨</span>
                </div>
              )}
              badges={renderBadges(work)}
              actions={renderActions(work)}
            />
          ))}
        </div>
      ) : (
        <Surface padding="sm" className="u37b-track-list u37b-asmr-list" aria-label="音声作品列表">
          {visibleWorks.map((work) => (
            <TrackRow
              key={work.id}
              className={selectedIds.has(work.id) ? 'u37b-track-row--selected' : ''}
              title={work.title}
              subtitle={`${work.id} · ${work.circle} · ${work.cvs.join(' / ') || '未标注声优'}`}
              duration={formatDuration(work.totalDuration)}
              onActivate={() => setAsmrDetailId(work.id)}
              leading={(
                <CoverArtwork
                  src={work.coverUrl}
                  title={work.title}
                  subtitle={work.id}
                  kind="asmr"
                  className="h-full w-full object-cover"
                />
              )}
              badges={renderBadges(work)}
              actions={(
                <>
                  <label className="u37b-inline-select">
                    <input type="checkbox" checked={selectedIds.has(work.id)} onChange={() => toggleSelected(work.id)} aria-label={`选择 ${work.title}`} />
                    <span aria-hidden="true">{selectedIds.has(work.id) ? <Check /> : null}</span>
                  </label>
                  {renderActions(work)}
                </>
              )}
            />
          ))}
        </Surface>
      )}

      {feedback ? <div className="u37b-toast" role="status"><Check aria-hidden="true" />{feedback}</div> : null}

      <Dialog
        open={Boolean(editDraft)}
        title={editDraft ? `编辑 ${editDraft.id}` : '编辑作品'}
        description="只修改 Yang-Kura 的本地显示覆盖，不会重命名或移动磁盘文件。"
        onClose={() => setEditDraft(null)}
        footer={(
          <div className="u37b-dialog-actions">
            <Button variant="ghost" onClick={() => setEditDraft(null)}>取消</Button>
            <Button variant="primary" onClick={saveEditDraft} disabled={!editDraft}>保存</Button>
          </div>
        )}
      >
        {editDraft ? (
          <div className="u37b-form-grid">
            <label><span>作品标题</span><input value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} /></label>
            <label><span>制作社团</span><input value={editDraft.circle} onChange={(event) => setEditDraft({ ...editDraft, circle: event.target.value })} /></label>
            <label><span>声优 / CV</span><input value={editDraft.cvs} onChange={(event) => setEditDraft({ ...editDraft, cvs: event.target.value })} /></label>
            <label><span>发售日期</span><input value={editDraft.releaseDate} onChange={(event) => setEditDraft({ ...editDraft, releaseDate: event.target.value })} /></label>
            <label className="u37b-form-grid__wide"><span>标签（逗号分隔）</span><input value={editDraft.tags} onChange={(event) => setEditDraft({ ...editDraft, tags: event.target.value })} /></label>
            <label className="u37b-form-grid__wide"><span>个人备注</span><textarea rows={5} value={editDraft.description} onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })} /></label>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
