import React, { useMemo, useState } from "react";
import {
  ListMusic,
  Play,
  Plus,
  Heart,
  Trash,
  ArrowLeft,
  Clock,
  Headphones,
  Music,
  Bookmark,
  Share2,
  CheckCircle,
  HelpCircle,
  ListPlus,
} from "lucide-react";
import { Playlist, AudioTrack } from "../types";
import CoverArtwork from "./CoverArtwork";
import {
  mediaSurfaceStatusService,
  type MediaSurfaceBadge,
} from "../services/mediaSurfaceStatusService";
import { collectionDetailExperienceService, type CollectionDetailStatusChip, type CollectionEmptyStateModel } from "../services/collectionDetailExperienceService";
import { libraryVisualUnityService } from "../services/libraryVisualUnityService";
import type { LibraryBrowseTone } from "../services/libraryBrowseSurfaceService";

interface PlaylistPageProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  setPlaylistDetailId: (id: string | null) => void;
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  searchQuery: string;
}

export default function PlaylistPage({
  playlists,
  activePlaylistId,
  setPlaylistDetailId,
  onPlayTrack,
  onAddToQueue,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveTrackFromPlaylist,
  favorites,
  toggleFavorite,
  searchQuery,
}: PlaylistPageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  const handleSubmitNewPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName, newPlaylistDescription);
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setShowCreateForm(false);
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const playlistSummary = useMemo(
    () => mediaSurfaceStatusService.getPlaylistSummary(playlists),
    [playlists],
  );

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


  const detailChipClassName = (chip: CollectionDetailStatusChip) => {
    const base = "text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap";
    const toneMap: Record<CollectionDetailStatusChip["tone"], string> = {
      brand: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      muted: "bg-zinc-500/10 border-zinc-500/20 text-text-muted",
    };
    return `${base} ${toneMap[chip.tone]}`;
  };

  const visualUnityToneClassName = (tone: LibraryBrowseTone) => {
    const map: Record<LibraryBrowseTone, string> = {
      brand: "text-brand-color bg-brand-color/10 border-brand-color/20",
      emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      slate: "text-text-muted bg-zinc-500/10 border-zinc-500/20",
    };
    return map[tone];
  };

  const renderPlaylistEmptyState = (state: CollectionEmptyStateModel, primaryAction?: () => void) => (
    <div id="mvp43-playlist-empty-state" className="py-14 text-center bg-card-bg/20 rounded-2xl border border-dashed border-border-color px-6">
      <ListMusic className="w-10 h-10 text-text-muted mx-auto mb-3 stroke-1" />
      <p className="text-sm font-bold text-text-primary">{state.title}</p>
      <p className="text-xs text-text-muted mt-2 max-w-lg mx-auto leading-relaxed">{state.description}</p>
      <p className="text-[11px] text-text-muted/70 mt-2">{state.helper}</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={primaryAction ?? (() => setPlaylistDetailId(null))}
          className="px-3.5 py-2 rounded-xl bg-brand-color text-white text-xs font-bold"
        >
          {state.actions[0]?.label ?? '返回歌单列表'}
        </button>
        <button
          onClick={() => setPlaylistDetailId(null)}
          className="px-3.5 py-2 rounded-xl bg-card-bg border border-border-color text-text-secondary text-xs font-bold"
        >
          {state.actions[1]?.label ?? '返回歌单列表'}
        </button>
      </div>
    </div>
  );

  // Play entire playlist
  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      onPlayTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  // Add all playlist tracks to player queue
  const handleQueuePlaylist = (playlist: Playlist) => {
    playlist.tracks.forEach((track) => {
      onAddToQueue(track);
    });
  };

  // Filter playlists by search query (if any)
  const filteredPlaylists = playlists.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const playlistVisualUnity = useMemo(
    () => libraryVisualUnityService.getPlaylistModel({
      playlists,
      visibleCount: filteredPlaylists.length,
      hasSearch: Boolean(searchQuery.trim()),
    }),
    [playlists, filteredPlaylists.length, searchQuery],
  );

  if (activePlaylist) {
    const activePlaylistSummary = collectionDetailExperienceService.getPlaylistDetailSummary(activePlaylist);
    const activePlaylistEmptyState = collectionDetailExperienceService.getPlaylistEmptyState(activePlaylist);
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Back navigation */}
        <button
          id="playlist-back"
          onClick={() => setPlaylistDetailId(null)}
          className="flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-card-bg/40 border border-border-color px-3.5 py-2 rounded-xl hover:bg-card-bg transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回歌单列表</span>
        </button>

        {/* Playlist Hero Detail Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card-bg/50 border border-border-color/80 p-6 flex flex-col md:flex-row gap-6 items-start">
          {activePlaylist.coverUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundImage: `url(${activePlaylist.coverUrl})` }}
            />
          )}

          <CoverArtwork
            src={activePlaylist.coverUrl}
            title={activePlaylist.name}
            subtitle={`${activePlaylist.tracks.length} 首音轨`}
            kind="playlist"
            className="w-40 h-40 md:w-44 md:h-44 rounded-xl object-cover shadow-xl border border-white/5 relative z-10"
          />

          <div className="flex-1 space-y-4 relative z-10 min-w-0">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activePlaylist.isSystem ? "系统示例歌单" : "本地自建歌单"}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary truncate">
                {activePlaylist.name}
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                {activePlaylist.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
              <span>
                创建者:{" "}
                <span className="text-text-primary font-medium">
                  {activePlaylist.creator}
                </span>
              </span>
              <span>•</span>
              <span>
                收录音频:{" "}
                <span className="text-text-primary font-bold font-mono">
                  {activePlaylist.tracksCount} 个
                </span>
              </span>
              <span>•</span>
              <span>
                类型:{" "}
                <span className="text-text-primary">音声 / 音乐混合库</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {mediaSurfaceStatusService
                .getPlaylistBadges(activePlaylist)
                .map((badge) => (
                  <span key={badge.id} className={badgeClassName(badge)}>
                    {badge.label}
                  </span>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="play-all-playlist"
                onClick={() => handlePlayPlaylist(activePlaylist)}
                disabled={activePlaylist.tracks.length === 0}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold shadow-lg shadow-brand-color/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>立即顺序播放</span>
              </button>
              <button
                id="queue-all-playlist"
                onClick={() => handleQueuePlaylist(activePlaylist)}
                disabled={activePlaylist.tracks.length === 0}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-card-bg hover:bg-hover-bg border border-border-color text-text-primary text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <ListPlus className="w-4 h-4" />
                <span>加入播放队列</span>
              </button>
              {!activePlaylist.isSystem && (
                <button
                  onClick={() => onDeletePlaylist(activePlaylist.id)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                  <span>删除歌单</span>
                </button>
              )}
            </div>
          </div>
        </div>


        <section id="mvp43-playlist-detail-navigation" className="rounded-2xl bg-card-bg/35 border border-border-color/60 p-4 space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <span>当前位置：歌单</span>
            <span className="text-text-muted/50">/</span>
            <span className="text-text-primary font-semibold">{activePlaylist.name}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-text-primary">{activePlaylistSummary.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{activePlaylistSummary.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activePlaylistSummary.chips.map((chip) => (
                  <span key={chip.label} className={detailChipClassName(chip)}>{chip.label}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activePlaylistSummary.stats.map((item) => (
                <div key={item.label} className="rounded-xl bg-bg-primary/30 border border-border-color/50 px-3 py-2">
                  <p className="text-[10px] text-text-muted">{item.label}</p>
                  <p className="text-sm font-bold text-text-primary font-mono mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tracks List Table (Mixed ASMR and Normal tracks) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted px-2">
            <span>收录音轨明细 ({activePlaylist.tracks.length})</span>
            <span className="flex items-center space-x-1 font-sans text-brand-color bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>支持音声作品与普通音乐混合播放</span>
            </span>
          </div>

          {activePlaylist.tracks.length === 0 ? (
            renderPlaylistEmptyState(activePlaylistEmptyState, () => setPlaylistDetailId(null))
          ) : (
            <div className="bg-card-bg/40 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40">
              {activePlaylist.tracks.map((track, idx) => {
                const isFav = favorites.includes(track.id);
                return (
                  <div
                    key={track.id}
                    className="group flex items-center justify-between p-3.5 hover:bg-hover-bg transition-colors"
                  >
                    {/* Cover & Title */}
                    <div
                      onClick={() => onPlayTrack(track, activePlaylist.tracks)}
                      className="flex items-center space-x-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="text-xs text-text-muted font-mono w-6 text-center group-hover:text-brand-color">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <CoverArtwork
                        src={track.coverUrl}
                        title={track.title}
                        subtitle={track.artist}
                        kind={track.type === "asmr" ? "asmr" : "music"}
                        className="w-10 h-10 rounded object-cover shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color truncate">
                            {track.title}
                          </h4>
                          {/* Type badge (ASMR or Music) */}
                          {track.type === "asmr" ? (
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-mono font-bold px-1.5 py-px rounded flex items-center space-x-0.5 flex-shrink-0">
                              <Headphones className="w-2.5 h-2.5" />
                              <span>音声</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-px rounded flex items-center space-x-0.5 flex-shrink-0">
                              <Music className="w-2.5 h-2.5" />
                              <span>音乐</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1 truncate">
                          {track.artist} ·{" "}
                          <span className="text-text-muted">{track.album}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center space-x-4 ml-4">
                      <span className="text-[10px] text-text-muted font-mono bg-border-color/30 px-2 py-0.5 rounded">
                        {track.fileSize || "24.1 MB"}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {formatDuration(track.duration)}
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="收藏"
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
                        {!activePlaylist.isSystem && (
                          <button
                            onClick={() =>
                              onRemoveTrackFromPlaylist(
                                activePlaylist.id,
                                track.id,
                              )
                            }
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="从歌单移除；不会删除真实文件，不会改动真实媒体文件"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            onPlayTrack(track, activePlaylist.tracks)
                          }
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
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* List View Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <ListMusic className="w-5.5 h-5.5 text-brand-color" />
              <span>歌单</span>
            </h2>
            <p className="text-xs text-text-muted mt-1">
              共 ${filteredPlaylists.length} 个歌单、${playlistSummary.trackCount} 首音轨；自建歌单保存在本机。
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm((value) => !value)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-color px-4 text-xs font-semibold text-white shadow-sm shadow-brand-color/20 hover:bg-brand-color-hover"
          >
            <Plus className="w-4 h-4" />
            <span>新建歌单</span>
          </button>
        </div>

        <div
          id="mvp40-playlist-overview"
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { label: "歌单", value: playlistSummary.playlistCount },
            { label: "自建", value: playlistSummary.userPlaylistCount },
            { label: "音轨", value: playlistSummary.trackCount },
            { label: "音声", value: playlistSummary.asmrTrackCount },
            { label: "音乐", value: playlistSummary.musicTrackCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-card-bg/35 border border-border-color/60 px-4 py-3"
            >
              <p className="text-[10px] text-text-muted">{item.label}</p>
              <p className="text-lg font-bold text-text-primary font-mono mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div id="mvp53-playlist-visual-unity" className="rounded-2xl border border-pink-500/15 bg-pink-500/5 p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-text-primary">{playlistVisualUnity.title}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{playlistVisualUnity.description}</p>
            </div>
            <p className="text-[10px] text-pink-300 font-bold bg-pink-500/10 border border-pink-500/15 rounded-full px-2.5 py-1 w-fit">
              {playlistVisualUnity.primaryHint}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {playlistVisualUnity.chips.map((chip) => (
              <div key={chip.id} className={`rounded-xl border px-3 py-2 ${visualUnityToneClassName(chip.tone)}`}>
                <p className="text-[10px] opacity-80">{chip.label}</p>
                <p className="text-xs font-bold leading-tight">{chip.value}</p>
                <p className="text-[10px] opacity-70">{chip.helper}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">{playlistVisualUnity.secondaryHint}</p>
        </div>

        {showCreateForm && (
          <div className="bg-card-bg/45 border border-border-color/70 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
            <label className="space-y-1.5">
              <span className="text-[10px] text-text-muted font-bold">
                歌单名称
              </span>
              <input
                value={newPlaylistName}
                onChange={(event) => setNewPlaylistName(event.target.value)}
                placeholder="例如：睡前听完当前轨"
                className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-color"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] text-text-muted font-bold">
                说明
              </span>
              <input
                value={newPlaylistDescription}
                onChange={(event) =>
                  setNewPlaylistDescription(event.target.value)
                }
                placeholder="可选：说明这个歌单的用途"
                className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-color"
              />
            </label>
            <button
              onClick={handleSubmitNewPlaylist}
              disabled={!newPlaylistName.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              保存歌单
            </button>
          </div>
        )}
      </div>

      {/* Playlist Grid */}
      {filteredPlaylists.length === 0 ? (
        renderPlaylistEmptyState(collectionDetailExperienceService.getPlaylistEmptyState(undefined), () => setShowCreateForm(true))
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => setPlaylistDetailId(playlist.id)}
            className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
          >
            {/* Cover Area */}
            <div className="relative aspect-[16/9] w-full bg-zinc-800 overflow-hidden">
              <CoverArtwork
                src={playlist.coverUrl}
                title={playlist.name}
                subtitle={`${playlist.tracks.length} 首音轨`}
                kind="playlist"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] bg-pink-500/80 backdrop-blur-md text-white font-mono px-2 py-0.5 rounded-md w-fit mb-1 font-bold">
                  {playlist.isSystem
                    ? "系统示例"
                    : playlist.sourceKind === "demo-user"
                      ? "示例自建"
                      : "自建歌单"}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-color transition-colors truncate">
                  {playlist.name}
                </h3>
              </div>
            </div>

            {/* Description & Specs */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {playlist.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {mediaSurfaceStatusService
                  .getPlaylistBadges(playlist)
                  .slice(0, 4)
                  .map((badge) => (
                    <span key={badge.id} className={badgeClassName(badge)}>
                      {badge.label}
                    </span>
                  ))}
              </div>

              <div className="pt-3 border-t border-border-color/30 flex items-center justify-between text-[10px] text-text-muted font-mono">
                <span>作者: {playlist.creator}</span>
                <span className="bg-border-color/50 px-2 py-0.5 rounded font-bold text-text-secondary">
                  {playlist.tracksCount} 首音频
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
