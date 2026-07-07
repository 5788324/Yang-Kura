import React, { useState, useMemo } from "react";
import {
  Music,
  Disc,
  User,
  Folder,
  Play,
  Plus,
  Heart,
  Search,
  LayoutGrid,
  List,
  FolderOpen,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { MusicAlbum, AudioTrack } from "../types";
import CoverArtwork from "./CoverArtwork";
import {
  mediaSurfaceStatusService,
  type MediaSurfaceBadge,
} from "../services/mediaSurfaceStatusService";
import { collectionDetailExperienceService, type CollectionEmptyStateModel } from "../services/collectionDetailExperienceService";
import { libraryBrowseSurfaceService, type LibraryBrowseTone } from "../services/libraryBrowseSurfaceService";
import { libraryBetaRegressionPolishService } from "../services/libraryBetaRegressionPolishService";
import { libraryVisualUnityService } from "../services/libraryVisualUnityService";
import { libraryCardLayoutPolishService } from "../services/libraryCardLayoutPolishService";

interface MusicLibraryProps {
  albums: MusicAlbum[];
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  searchQuery: string;
}

type SubViewType = "tracks" | "albums" | "artists" | "folders";

// MVP-76 layout class marker: grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4
export default function MusicLibrary({
  albums,
  onPlayTrack,
  onAddToQueue,
  favorites,
  toggleFavorite,
  searchQuery,
}: MusicLibraryProps) {
  const [activeSubView, setActiveSubView] = useState<SubViewType>("tracks");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "added-desc" | "title-asc" | "duration-desc" | "album-asc"
  >("added-desc");
  const [externalOpenMessage, setExternalOpenMessage] = useState<string | null>(
    null,
  );

  const showExternalOpenMessage = (message: string) => {
    setExternalOpenMessage(message);
    window.setTimeout(() => setExternalOpenMessage(null), 2400);
  };

  const getExternalKind = (
    track: AudioTrack,
  ): YangKuraExternalOpenEntryKind => {
    if (
      track.mediaKind === "video" ||
      track.mediaKind === "image" ||
      track.mediaKind === "text" ||
      track.mediaKind === "archive" ||
      track.mediaKind === "other"
    ) {
      return track.mediaKind;
    }
    return "audio";
  };

  const canUseExternalOpen = (track: AudioTrack) =>
    Boolean(
      track.rootPathToken &&
      track.sourceRelativePath &&
      track.externalOpenSourceKind === "tokenized-local-file",
    );
  const canUseHtmlAudio = (track: AudioTrack) =>
    track.mediaKind !== "video" &&
    track.mediaKind !== "image" &&
    track.mediaKind !== "text" &&
    track.mediaKind !== "archive" &&
    track.mediaKind !== "other";

  const handleOpenExternalTrack = async (track: AudioTrack) => {
    if (
      !canUseExternalOpen(track) ||
      !track.rootPathToken ||
      !track.sourceRelativePath
    ) {
      showExternalOpenMessage(
        "当前曲目不是来自真实 library-index.json 的 tokenized 本地文件。",
      );
      return;
    }
    if (!window.yangKura?.requestOpenExternalFile) {
      showExternalOpenMessage(
        "当前不在 Electron 桌面环境，无法调用系统默认应用。",
      );
      return;
    }
    const result = await window.yangKura.requestOpenExternalFile({
      rootPathToken: track.rootPathToken,
      relativePath: track.sourceRelativePath,
      entryId: track.id,
      mode: "open-external-file",
      expectedKind: getExternalKind(track),
    });
    showExternalOpenMessage(result.message);
  };

  const handleOpenTrackInFileManager = async (track: AudioTrack) => {
    if (
      !canUseExternalOpen(track) ||
      !track.rootPathToken ||
      !track.sourceRelativePath
    ) {
      showExternalOpenMessage("当前曲目没有可定位的 tokenized 本地路径。");
      return;
    }
    if (!window.yangKura?.requestOpenInFileManager) {
      showExternalOpenMessage(
        "当前不在 Electron 桌面环境，无法打开文件管理器。",
      );
      return;
    }
    const result = await window.yangKura.requestOpenInFileManager({
      rootPathToken: track.rootPathToken,
      relativePath: track.sourceRelativePath,
      entryId: track.id,
      mode: "open-in-file-manager",
    });
    showExternalOpenMessage(result.message);
  };

  // Flatten all songs from all albums
  const allTracks = useMemo(() => {
    return albums.flatMap((album) => album.tracks);
  }, [albums]);

  // Format single track duration (mm:ss)
  const formatDuration = (seconds: number | undefined) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get list of unique artists
  const artistsList = useMemo(() => {
    const list = new Set<string>();
    albums.forEach((album) => list.add(album.artist));
    return Array.from(list);
  }, [albums]);

  const musicSummary = useMemo(
    () => mediaSurfaceStatusService.getMusicSummary(albums, favorites),
    [albums, favorites],
  );

  const folderGroups = useMemo(() => {
    return albums.map((album) => ({
      name: album.title,
      count: album.tracks.length,
      artist: album.artist,
      localCount: album.tracks.filter(
        (track) =>
          track.playbackSourceKind === "tokenized-local-file" ||
          track.externalOpenSourceKind === "tokenized-local-file",
      ).length,
    }));
  }, [albums]);

  const badgeClassName = (badge: MediaSurfaceBadge) => {
    const base =
      "text-[9px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap";
    const toneMap: Record<MediaSurfaceBadge["tone"], string> = {
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      slate: "bg-zinc-500/10 border-zinc-500/20 text-text-muted",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    };
    return `${base} ${toneMap[badge.tone]}`;
  };

  // Filters based on queries, selected items
  const filteredTracks = useMemo(() => {
    let list = [...allTracks];

    // Filter by global search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (track) =>
          track.title.toLowerCase().includes(q) ||
          track.artist.toLowerCase().includes(q) ||
          track.album.toLowerCase().includes(q),
      );
    }

    // Filter by selected album
    if (selectedAlbumId) {
      list = list.filter((track) => {
        const albumObj = albums.find((a) => a.id === selectedAlbumId);
        return track.album === albumObj?.title;
      });
    }

    // Filter by selected artist
    if (selectedArtist) {
      list = list.filter((track) => track.artist === selectedArtist);
    }

    // Filter by selected folder/album group. Renderer still uses display names only; no raw disk path is exposed.
    if (selectedFolder) {
      list = list.filter((track) => track.album === selectedFolder);
    }

    // Sort tracks
    list.sort((a, b) => {
      if (sortBy === "added-desc") {
        const dateA = a.addedAt || "";
        const dateB = b.addedAt || "";
        return dateB.localeCompare(dateA);
      } else if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "duration-desc") {
        return b.duration - a.duration;
      } else if (sortBy === "album-asc") {
        return a.album.localeCompare(b.album);
      }
      return 0;
    });

    return list;
  }, [
    allTracks,
    searchQuery,
    selectedAlbumId,
    selectedArtist,
    selectedFolder,
    albums,
    sortBy,
  ]);

  const selectedAlbumTitle = selectedAlbumId
    ? albums.find((album) => album.id === selectedAlbumId)?.title ?? null
    : null;

  const musicBrowseSurface = useMemo(
    () =>
      libraryBrowseSurfaceService.getMusicSurfaceModel({
        albums,
        visibleTrackCount: filteredTracks.length,
        activeView: activeSubView,
        searchQuery,
        selectedAlbumTitle,
        selectedArtist,
        selectedFolder,
      }),
    [albums, filteredTracks.length, activeSubView, searchQuery, selectedAlbumTitle, selectedArtist, selectedFolder],
  );

  const musicRegressionPolish = useMemo(
    () => libraryBetaRegressionPolishService.getMusicModel({
      visibleTrackCount: filteredTracks.length,
      totalTrackCount: allTracks.length,
      activeView: activeSubView,
      hasActiveFilters: musicBrowseSurface.hasActiveFilters,
    }),
    [filteredTracks.length, allTracks.length, activeSubView, musicBrowseSurface.hasActiveFilters],
  );

  const musicVisualUnity = useMemo(
    () => libraryVisualUnityService.getMusicModel({
      albums,
      visibleTrackCount: filteredTracks.length,
      activeView: activeSubView,
      hasActiveFilters: musicBrowseSurface.hasActiveFilters,
    }),
    [albums, filteredTracks.length, activeSubView, musicBrowseSurface.hasActiveFilters],
  );

  const mvp76CardLayout = useMemo(
    () => libraryCardLayoutPolishService.getMusicCardLayoutModel({
      albumCount: albums.length,
      visibleTrackCount: filteredTracks.length,
      activeView: activeSubView,
      hasActiveFilters: musicBrowseSurface.hasActiveFilters,
    }),
    [albums.length, filteredTracks.length, activeSubView, musicBrowseSurface.hasActiveFilters],
  );

  const metricToneClassName = (tone: LibraryBrowseTone) => {
    const map: Record<LibraryBrowseTone, string> = {
      brand: 'text-brand-color bg-brand-color/10 border-brand-color/20',
      emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      slate: 'text-text-muted bg-zinc-500/10 border-zinc-500/20',
    };
    return map[tone];
  };

  // Reset drill-downs
  const resetFilters = () => {
    setSelectedAlbumId(null);
    setSelectedArtist(null);
    setSelectedFolder(null);
  };


  const renderEmptyState = (state: CollectionEmptyStateModel, primaryAction?: () => void) => (
    <div id="mvp43-music-empty-state" className="py-14 text-center bg-card-bg/20 rounded-2xl border border-dashed border-border-color px-6">
      <Music className="w-10 h-10 text-text-muted mx-auto stroke-1 mb-3" />
      <p className="text-sm font-bold text-text-primary">{state.title}</p>
      <p className="text-xs text-text-muted mt-2 max-w-lg mx-auto leading-relaxed">{state.description}</p>
      <p className="text-[11px] text-text-muted/70 mt-2">{state.helper}</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={primaryAction ?? resetFilters}
          className="px-3.5 py-2 rounded-xl bg-brand-color text-white text-xs font-bold"
        >
          {state.actions[0]?.label ?? '重置筛选'}
        </button>
        <button
          onClick={() => {
            resetFilters();
            setActiveSubView('tracks');
          }}
          className="px-3.5 py-2 rounded-xl bg-card-bg border border-border-color text-text-secondary text-xs font-bold"
        >
          {state.actions[1]?.label ?? '查看全部歌曲'}
        </button>
      </div>
    </div>
  );

  const handleSubViewChange = (view: SubViewType) => {
    setActiveSubView(view);
    resetFilters();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {externalOpenMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold">
          {externalOpenMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Music className="w-5.5 h-5.5 text-brand-color" />
            <span>音乐库</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            浏览本地歌曲、专辑、艺术家与文件夹分组，减少工程信息，突出播放与收藏。
          </p>
        </div>

        {/* View togglers as requested */}
        <div className="flex bg-card-bg/50 border border-border-color p-1 rounded-xl text-xs font-semibold self-start">
          <button
            onClick={() => handleSubViewChange("tracks")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === "tracks" ? "bg-brand-active text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            <List className="w-3.5 h-3.5" />
            <span>歌曲列表</span>
          </button>
          <button
            onClick={() => handleSubViewChange("albums")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === "albums" ? "bg-brand-active text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>专辑视图</span>
          </button>
          <button
            onClick={() => handleSubViewChange("artists")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === "artists" ? "bg-brand-active text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>艺术家</span>
          </button>
          <button
            onClick={() => handleSubViewChange("folders")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView === "folders" ? "bg-brand-active text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>文件夹视图</span>
          </button>
        </div>
      </div>

      <div
        id="mvp40-music-library-overview"
        className="rounded-2xl bg-card-bg/25 border border-border-color/50 p-4 space-y-3"
      >
        <div id="mvp46-music-browse-summary" className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-text-primary">{musicBrowseSurface.heading}</p>
            <p className="text-xs text-text-muted mt-1">{musicBrowseSurface.resultText} · {musicBrowseSurface.viewText}</p>
          </div>
          {musicBrowseSurface.hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="self-start lg:self-auto px-3 py-1.5 rounded-xl bg-card-bg border border-border-color text-xs font-bold text-text-secondary hover:text-text-primary hover:border-brand-color transition-colors"
            >
              重置筛选
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {musicBrowseSurface.metrics.map((metric) => (
            <div key={metric.id} className={`rounded-xl border px-3 py-2 ${metricToneClassName(metric.tone)}`}>
              <p className="text-[10px] opacity-80">{metric.label}</p>
              <p className="text-lg font-bold font-mono leading-tight">{metric.value}</p>
              <p className="text-[10px] opacity-70">{metric.helper}</p>
            </div>
          ))}
        </div>
        {musicBrowseSurface.activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {musicBrowseSurface.activeFilters.map((filter) => (
              <span key={filter.id} className="px-2 py-1 rounded-lg bg-brand-color/10 border border-brand-color/20 text-[10px] text-brand-color font-bold">
                {filter.label}：{filter.value}
              </span>
            ))}
          </div>
        )}
        <div id="mvp52-music-beta-regression" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {musicRegressionPolish.chips.map((chip) => (
            <div key={chip.id} className={`rounded-xl border px-3 py-2 ${metricToneClassName(chip.tone)}`}>
              <p className="text-[10px] opacity-80">{chip.label}</p>
              <p className="text-xs font-bold leading-tight">{chip.value}</p>
              <p className="text-[10px] opacity-70">{chip.helper}</p>
            </div>
          ))}
        </div>
        <div id="mvp53-music-visual-unity" className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-3 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-text-primary">{musicVisualUnity.title}</p>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{musicVisualUnity.description}</p>
            </div>
            <p className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/15 rounded-full px-2.5 py-1 w-fit">
              {musicVisualUnity.primaryHint}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {musicVisualUnity.chips.map((chip) => (
              <div key={chip.id} className={`rounded-xl border px-3 py-2 ${metricToneClassName(chip.tone)}`}>
                <p className="text-[10px] opacity-80">{chip.label}</p>
                <p className="text-xs font-bold leading-tight">{chip.value}</p>
                <p className="text-[10px] opacity-70">{chip.helper}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">{musicVisualUnity.secondaryHint}</p>
        </div>
      </div>

      {/* Breadcrumbs for drill down views */}
      {(selectedAlbumId || selectedArtist || selectedFolder) && (
        <div className="flex items-center space-x-2 text-xs bg-brand-color/10 border border-brand-color/20 text-brand-color px-3.5 py-2 rounded-xl">
          <span>当前位置：</span>
          <span className="font-bold">
            {selectedAlbumId &&
              `专辑 [${albums.find((a) => a.id === selectedAlbumId)?.title}]`}
            {selectedArtist && `艺术家 [${selectedArtist}]`}
            {selectedFolder && `文件夹 [${selectedFolder}]`}
          </span>
          <button
            onClick={resetFilters}
            className="underline hover:text-brand-color-hover pl-2 cursor-pointer font-semibold"
          >
            返回全部歌曲
          </button>
        </div>
      )}

      {/* Main SubView Content */}
      {activeSubView === "tracks" ||
      selectedAlbumId ||
      selectedArtist ||
      selectedFolder ? (
        /* SubView: Track List */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-text-muted px-2">
            <div>
              <span>
                共找到{" "}
                <span className="text-text-primary font-bold font-mono">
                  {filteredTracks.length}
                </span>{" "}
                首歌曲
              </span>
              <span className="ml-2 hidden sm:inline text-[11px] opacity-70">
                点击曲目播放，视频和图片走外部打开
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>排序方式:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card-bg border border-border-color text-text-primary rounded px-2 py-1 text-xs outline-none focus:border-brand-color transition-colors cursor-pointer"
              >
                <option value="added-desc">最近添加</option>
                <option value="title-asc">歌曲名称</option>
                <option value="duration-desc">播放时长</option>
                <option value="album-asc">专辑名称</option>
              </select>
            </div>
          </div>

          {filteredTracks.length === 0 ? (
            renderEmptyState(collectionDetailExperienceService.getMusicEmptyState({
              view: 'tracks',
              hasFilters: Boolean(selectedAlbumId || selectedArtist || selectedFolder),
              searchQuery,
            }))
          ) : (
            <div id="mvp76-music-track-layout-unity" className="bg-card-bg/40 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40" aria-label={mvp76CardLayout.trackListAriaLabel}>
              <span className="sr-only">mvp76-card-layout-unity：音乐歌曲行在窄屏会换行，封面、标题、状态与操作按钮不挤压。</span>
              {filteredTracks.map((track, idx) => {
                const isFav = favorites.includes(track.id);
                return (
                  <div
                    key={track.id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 hover:bg-hover-bg transition-colors"
                  >
                    <div
                      onClick={() => {
                        if (canUseHtmlAudio(track))
                          onPlayTrack(track, filteredTracks);
                        else void handleOpenExternalTrack(track);
                      }}
                      className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer w-full"
                    >
                      <span className="text-xs text-text-muted font-mono w-6 text-center group-hover:text-brand-color">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <CoverArtwork
                        src={track.coverUrl}
                        title={track.title}
                        subtitle={track.artist}
                        kind="music"
                        className="w-9 h-9 rounded object-cover shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color truncate">
                            {track.title}
                          </h4>
                          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                            {mediaSurfaceStatusService
                              .getTrackBadges(track)
                              .slice(0, 3)
                              .map((badge) => (
                                <span
                                  key={badge.id}
                                  className={badgeClassName(badge)}
                                >
                                  {badge.label}
                                </span>
                              ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-0.5 truncate">
                          {libraryBetaRegressionPolishService.getTrackSecondaryLine(track)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:ml-4 w-full sm:w-auto flex-wrap">
                      <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-2 py-0.5 rounded">
                        {track.fileSize || "5.1 MB"}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {formatDuration(track.duration)}
                      </span>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() => onAddToQueue(track)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-color hover:bg-indigo-500/10 transition-colors"
                          title="加入播放队列"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => void handleOpenExternalTrack(track)}
                          disabled={!canUseExternalOpen(track)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                          title="用系统默认应用打开本地文件"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            void handleOpenTrackInFileManager(track)
                          }
                          disabled={!canUseExternalOpen(track)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                          title="在文件管理器中定位"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (canUseHtmlAudio(track))
                              onPlayTrack(track, filteredTracks);
                            else void handleOpenExternalTrack(track);
                          }}
                          className="p-1.5 rounded-lg bg-brand-color text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeSubView === "albums" ? (
        /* SubView: Albums Cover Wall */
        albums.length === 0 ? (
          renderEmptyState(collectionDetailExperienceService.getMusicEmptyState({ view: 'albums', hasFilters: false, searchQuery }))
        ) : (
        <div id="mvp76-music-card-layout-unity" className={mvp76CardLayout.albumGridClassName} aria-label={mvp76CardLayout.albumGridAriaLabel}>
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={mvp76CardLayout.albumCardClassName}
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-800 mb-3 flex-shrink-0">
                <CoverArtwork
                  src={album.coverUrl}
                  title={album.title}
                  subtitle={album.artist}
                  kind="music"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white bg-brand-color px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>查看收录音轨</span>
                  </span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-text-primary line-clamp-2 min-h-[32px] group-hover:text-brand-color transition-colors">
                {album.title}
              </h3>
              <p className="text-[11px] text-text-muted truncate mt-1">
                {album.artist} · {album.releaseYear} 年发售
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 min-h-[24px] max-h-[48px] overflow-hidden">
                {mediaSurfaceStatusService
                  .getAlbumBadges(album)
                  .slice(0, 3)
                  .map((badge) => (
                    <span key={badge.id} className={badgeClassName(badge)}>
                      {badge.label}
                    </span>
                  ))}
              </div>
              <div className="mt-auto pt-2.5 border-t border-border-color/30 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-secondary font-mono">
                <span>{album.genre}</span>
                <span>{album.tracks.length} 首歌曲</span>
              </div>
            </div>
          ))}
        </div>
        )
      ) : activeSubView === "artists" ? (
        /* SubView: Artists View */
        artistsList.length === 0 ? (
          renderEmptyState(collectionDetailExperienceService.getMusicEmptyState({ view: 'artists', hasFilters: false, searchQuery }))
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {artistsList.map((artist) => {
            const count = allTracks.filter((t) => t.artist === artist).length;
            const artistCover = albums.find(
              (a) => a.artist === artist,
            )?.coverUrl;
            return (
              <div
                key={artist}
                onClick={() => setSelectedArtist(artist)}
                className="group flex items-center space-x-4 p-4 rounded-xl bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/40 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5">
                  <CoverArtwork
                    src={artistCover}
                    title={artist}
                    subtitle="本地艺术家"
                    kind="music"
                    className="w-full h-full object-cover"
                    rounded
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary group-hover:text-brand-color transition-colors">
                    {artist}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1">
                    本地共收录 {count} 首曲目
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : (
        /* SubView: Folder View */
        folderGroups.length === 0 ? (
          renderEmptyState(collectionDetailExperienceService.getMusicEmptyState({ view: 'folders', hasFilters: false, searchQuery }))
        ) : (
        <div className="space-y-3">
          {folderGroups.map((f) => (
            <div
              key={f.name}
              onClick={() => setSelectedFolder(f.name)}
              className="group flex items-center justify-between p-4 rounded-xl bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/40 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-text-primary group-hover:text-brand-color transition-colors truncate">
                    {f.name}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1 font-sans">
                    {f.artist} ·{" "}
                    {f.localCount > 0 ? "来自本地资源记录" : "示例资源分组"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-mono bg-border-color/50 px-2.5 py-1 rounded">
                {f.count} 首音频
              </span>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
}
