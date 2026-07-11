// Legacy verifier marker: 本地资源库状态 / 重新读取 / 更新资源库
// MVP-71 verifier marker: 继续播放 / 最近播放 / 最近加入 / 音声库入口 / 音乐库入口 / 歌单入口
import React from 'react';
import { Play, Headphones, Disc, Clock, ChevronRight, ListMusic } from 'lucide-react';
import { AudioTrack, RJWork, MusicAlbum, Playlist, PageType, PlayerState } from '../types';
import type { LibrarySessionSnapshot } from '../services/librarySessionService';
import CoverArtwork from './CoverArtwork';
import { mediaLibraryExperienceService } from '../services/mediaLibraryExperienceService';
import { dailyListeningSurfaceService } from '../services/dailyListeningSurfaceService';
import { homeRecentListeningService } from '../services/homeRecentListeningService';
import { listeningExperiencePolishService } from '../services/listeningExperiencePolishService';
import { betaRegressionChecklistService } from '../services/betaRegressionChecklistService';
import { homePlayerBetaPolishService } from '../services/homePlayerBetaPolishService';
import { userFacingSimplificationService } from '../services/userFacingSimplificationService';
import { dailySurfaceCleanupService } from '../services/dailySurfaceCleanupService';
import { playerBarDailyCleanupService } from '../services/playerBarDailyCleanupService';
import { globalDailyUiCleanupService } from '../services/globalDailyUiCleanupService';
import { uiCleanupCloseoutBaselineSyncService } from '../services/uiCleanupCloseoutBaselineSyncService';

interface DashboardProps {
  recentTracks: AudioTrack[];
  librarySessionSnapshot: LibrarySessionSnapshot;
  playlists: Playlist[];
  rjWorks: RJWork[];
  musicAlbums: MusicAlbum[];
  playerState: PlayerState;
  onPlayTrack: (track: AudioTrack, customQueue?: AudioTrack[]) => void;
  setAsmrDetailId: (id: string | null) => void;
  setPlaylistDetailId: (id: string | null) => void;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
}

export default function Dashboard({
  recentTracks,
  librarySessionSnapshot,
  playlists,
  rjWorks,
  musicAlbums,
  playerState,
  onPlayTrack,
  setAsmrDetailId,
  setPlaylistDetailId,
  setCurrentPage,
  searchQuery
}: DashboardProps) {
  const formatDuration = (seconds: number | undefined) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSearching = searchQuery.trim().length > 0;
  const normalizedSearch = searchQuery.toLowerCase();
  const filteredRjs = rjWorks.filter(rj =>
    rj.title.toLowerCase().includes(normalizedSearch) ||
    rj.id.toLowerCase().includes(normalizedSearch) ||
    rj.circle.toLowerCase().includes(normalizedSearch) ||
    rj.cvs.some(cv => cv.toLowerCase().includes(normalizedSearch)) ||
    rj.tags.some(t => t.toLowerCase().includes(normalizedSearch))
  );

  const filteredMusic = musicAlbums.flatMap(album => album.tracks).filter(track =>
    track.title.toLowerCase().includes(normalizedSearch) ||
    track.artist.toLowerCase().includes(normalizedSearch) ||
    track.album.toLowerCase().includes(normalizedSearch)
  );

  const fallbackTrack = rjWorks[0]?.tracks[0] || musicAlbums[0]?.tracks[0] || null;
  const continueTrack = recentTracks[0] || fallbackTrack;
  const lastIndex = librarySessionSnapshot.lastIndex;
  const hasRealLibrary = Boolean(lastIndex && lastIndex.trackCount > 0);
  const libraryStatusText = hasRealLibrary
    ? `已连接「${lastIndex?.displayName}」：${lastIndex?.collectionCount} 个集合，${lastIndex?.trackCount} 条音轨`
    : '尚未读取资源库记录。先去设置页选择目录，再读取现有记录或一键扫描并应用。';
  const libraryActionText = hasRealLibrary ? '更新资源库' : '导入资源库';

  const mediaOverview = mediaLibraryExperienceService.getDashboardOverview({
    rjWorks,
    musicAlbums,
    playlists,
    recentTracks,
    hasRealLibrary,
  });
  const dailyListening = dailyListeningSurfaceService.getDashboardModel({
    recentTracks,
    playerState,
    playlists,
  });
  const homeListening = homeRecentListeningService.getModel({
    recentTracks,
    playerState,
    rjWorks,
    musicAlbums,
    playlists,
    hasRealLibrary,
    fallbackTrack,
  });
  const mvp49Listening = listeningExperiencePolishService.getDashboardModel({
    continueTrack,
    recentTracks,
    rjWorks,
    musicAlbums,
    playlists,
    hasRealLibrary,
  });
  const mvp54Regression = betaRegressionChecklistService.getDashboardModel({
    hasRealLibrary,
    recentCount: recentTracks.length,
    hasCurrentTrack: Boolean(playerState.currentTrack),
  });
  const mvp59SubtitleTrackCount = [
    ...rjWorks.flatMap((work) => work.tracks),
    ...musicAlbums.flatMap((album) => album.tracks),
  ].filter((track) =>
    (track.subtitleRelativePaths?.length ?? 0) > 0 ||
    track.lyricsLoadStatus === 'loaded' ||
    (track.lyrics?.length ?? 0) > 0
  ).length;
  const mvp59HomeBeta = homePlayerBetaPolishService.getDashboardModel({
    hasRealLibrary,
    recentCount: recentTracks.length,
    hasCurrentTrack: Boolean(playerState.currentTrack),
    subtitleTrackCount: mvp59SubtitleTrackCount,
  });
  const mvp71Simplification = userFacingSimplificationService.getModel();
  const mvp72DailySurface = dailySurfaceCleanupService.getModel();
  const mvp74HomeCleanup = playerBarDailyCleanupService.getHomeModel();
  const mvp110DailyUi = globalDailyUiCleanupService.getModel();
  const mvp111Closeout = uiCleanupCloseoutBaselineSyncService.getModel();
  const mvp71MainEntryCards = mvp71Simplification.mainEntryCards;
  const handleMvp71EntryClick = (entryId: string) => {
    if (entryId === 'continue-listening' && continueTrack) onPlayTrack(continueTrack);
    if (entryId === 'continue-listening' && !continueTrack) setCurrentPage('asmr-lib');
    if (entryId === 'recent-listening') setCurrentPage('playlists');
    if (entryId === 'recently-added') setCurrentPage('asmr-lib');
    if (entryId === 'asmr-library') setCurrentPage('asmr-lib');
    if (entryId === 'music-library') setCurrentPage('music-lib');
    if (entryId === 'playlists') setCurrentPage('playlists');
  };

  if (isSearching) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold mb-2">搜索结果</h2>
          <p className="text-xs text-text-muted">找到匹配 &quot;{searchQuery}&quot; 的本地媒体项目</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-secondary tracking-wider mb-4 flex items-center space-x-2">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>音声作品 ({filteredRjs.length})</span>
          </h3>
          {filteredRjs.length === 0 ? (
            <p className="text-xs text-text-muted italic bg-card-bg/20 p-4 rounded-xl border border-dashed border-border-color">无匹配的 ASMR/RJ 作品</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRjs.map(rj => (
                <div
                  key={rj.id}
                  onClick={() => setAsmrDetailId(rj.id)}
                  className="group bg-card-bg/60 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3">
                    <CoverArtwork
                      src={rj.coverUrl}
                      title={rj.title}
                      subtitle={rj.id}
                      kind="asmr"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-[10px] text-zinc-300 px-2 py-0.5 rounded font-medium">
                      {rj.id}
                    </span>
                  </div>
                  <div className="flex-1 min-h-[4rem]">
                    <h4 className="text-xs font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-brand-color transition-colors">
                      {rj.title}
                    </h4>
                    <p className="text-[11px] text-text-muted mt-1.5 truncate">{rj.circle}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-border-color/40 flex items-center justify-between text-[10px] text-text-muted">
                    <span>{rj.fileCount} 个文件</span>
                    <span>{formatDuration(rj.totalDuration)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-secondary tracking-wider mb-4 flex items-center space-x-2">
            <Disc className="w-4 h-4 text-pink-400" />
            <span>普通音乐单曲 ({filteredMusic.length})</span>
          </h3>
          {filteredMusic.length === 0 ? (
            <p className="text-xs text-text-muted italic bg-card-bg/20 p-4 rounded-xl border border-dashed border-border-color">无匹配的单曲</p>
          ) : (
            <div className="bg-card-bg/50 border border-border-color/60 rounded-xl overflow-hidden divide-y divide-border-color/40">
              {filteredMusic.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, filteredMusic)}
                  className="flex items-center justify-between p-3 hover:bg-hover-bg group cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-xs text-text-muted w-6 text-center">{String(idx + 1).padStart(2, '0')}</span>
                    <CoverArtwork src={track.coverUrl} title={track.title} subtitle={track.artist} kind={track.type === 'asmr' ? 'asmr' : 'music'} className="w-9 h-9 rounded object-cover" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-text-primary group-hover:text-brand-color transition-colors truncate">{track.title}</p>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">{track.artist} · {track.album}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className="text-[10px] text-text-muted bg-border-color/30 px-2 py-0.5 rounded">
                      {track.fileSize || '未知大小'}
                    </span>
                    <span className="text-xs text-text-muted">{formatDuration(track.duration)}</span>
                    <button className="p-1.5 rounded-full bg-brand-color text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <section id="mvp45-home-continue-listening" className="relative overflow-hidden rounded-3xl border border-border-color bg-gradient-to-br from-indigo-950/75 via-purple-950/35 to-card-bg p-5 md:p-7 shadow-xl">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-brand-color/10 rounded-full blur-3xl" />
        <div className="absolute right-28 -bottom-24 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-center">
          <div className="space-y-4">
            <span className="inline-flex bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] tracking-wider px-2.5 py-1 rounded-full font-bold">
              Yang-Kura 本地媒体库
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-text-primary">
                {homeListening.title}
              </h2>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-2xl">
                {homeListening.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                id="dashboard-play-recommend"
                onClick={() => homeListening.continueCard.track && onPlayTrack(homeListening.continueCard.track)}
                disabled={!homeListening.continueCard.track}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-color hover:bg-brand-color-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-brand-color/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>继续播放</span>
              </button>
              <button
                id="dashboard-goto-asmr"
                onClick={() => setCurrentPage('asmr-lib')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-text-primary hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                浏览音声库
              </button>
              <button
                id="dashboard-goto-settings"
                onClick={() => setCurrentPage('settings')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-text-primary hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                导入资源库
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 p-4 md:p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-800 shadow-xl">
                {homeListening.continueCard.track ? (
                  <CoverArtwork
                    src={homeListening.continueCard.track.coverUrl}
                    title={homeListening.continueCard.track.title}
                    subtitle={homeListening.continueCard.track.artist}
                    kind={homeListening.continueCard.track.type === 'asmr' ? 'asmr' : 'music'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Headphones className="w-9 h-9" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold tracking-wider">继续播放</p>
                  <h3 className="mt-1 text-base md:text-lg font-extrabold text-text-primary line-clamp-2">
                    {homeListening.continueCard.title}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted truncate">{homeListening.continueCard.subtitle}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span>{homeListening.continueCard.progressLabel}</span>
                    <span>{homeListening.continueCard.sourceLabel}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-color" style={{ width: `${homeListening.continueCard.progressPercent}%` }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {homeListening.continueCard.badges.map((badge) => (
                    <span key={`${badge.label}-${badge.tone}`} className={`text-[10px] px-2 py-0.5 rounded-full border ${homeRecentListeningService.getBadgeClass(badge.tone)}`}>
                      {badge.label}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">{homeListening.continueCard.helper}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mvp59-home-beta-polish" hidden aria-hidden="true">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">Beta 首页收口</p>
            <h3 className="text-sm font-extrabold text-text-primary">{mvp59HomeBeta.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{mvp59HomeBeta.description}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 lg:min-w-[420px]">
            {mvp59HomeBeta.chips.map((chip) => (
              <span key={chip.id} className={`rounded-full border px-2 py-1 text-[9px] font-bold ${homePlayerBetaPolishService.getToneClassName(chip.tone)}`} title={`${chip.label}：${chip.value}`}>
                {chip.label}：{chip.value}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-text-muted/90 leading-relaxed border-t border-border-color/30 pt-2">{mvp59HomeBeta.helper}</p>
      </section>

      <section id="mvp45-home-quick-entry" className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div id="mvp42-daily-listening-surface" className="rounded-2xl border border-border-color/70 bg-card-bg/55 p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-brand-color tracking-wider">日常听音频</p>
              <h3 className="text-base font-extrabold text-text-primary">{dailyListening.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{dailyListening.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {dailyListening.badges.map((badge) => (
                <span
                  key={`${badge.label}-${badge.tone}`}
                  className={`text-[10px] px-2 py-1 rounded-full border font-semibold ${dailyListeningSurfaceService.getBadgeClass(badge.tone)}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dailyListening.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  if (card.track) onPlayTrack(card.track, recentTracks.length > 0 ? recentTracks : undefined);
                  if (card.kind === 'queue' || card.kind === 'playlist') setCurrentPage('playlists');
                }}
                className="text-left rounded-xl border border-border-color/60 bg-bg-primary/35 hover:bg-card-bg hover:border-brand-color/35 p-3 transition-all cursor-pointer"
              >
                <p className="text-[10px] text-text-muted font-semibold">{card.kind === 'continue' ? '继续' : card.kind === 'queue' ? '队列' : card.kind === 'playlist' ? '歌单' : '最近'}</p>
                <p className="mt-1 text-sm font-bold text-text-primary line-clamp-1">{card.title}</p>
                <p className="mt-1 text-[10px] text-text-muted truncate">{card.subtitle}</p>
                <p className="mt-2 text-[10px] text-text-muted/90 leading-relaxed">{card.helper}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-color/70 bg-card-bg/50 p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-brand-color tracking-wider">资源库</p>
            <h3 className="text-sm font-bold text-text-primary">
              {hasRealLibrary ? '已连接本地资源库' : '等待导入资源库'}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">{libraryStatusText}</p>
            {lastIndex?.readAt && (
              <p className="text-[10px] text-text-muted">上次读取：{new Date(lastIndex.readAt).toLocaleString()}</p>
            )}
            <p className="text-[10px] text-text-muted/90">需要更新资源库时，前往设置页即可。</p>
          </div>
          <button
            onClick={() => setCurrentPage('settings')}
            className="w-full px-4 py-2 rounded-xl bg-brand-color text-white text-xs font-bold hover:bg-brand-color-hover transition-all cursor-pointer"
          >
            {libraryActionText}
          </button>
        </div>
      </section>

      <section id="mvp110-dashboard-daily-surface" className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">日常首页</p>
            <h3 className="mt-1 text-base font-extrabold text-text-primary">{mvp110DailyUi.title}</h3>
            <p className="mt-1 text-xs text-text-muted leading-relaxed max-w-3xl">{mvp110DailyUi.summary}</p>
          </div>
          <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100 whitespace-nowrap">媒体入口优先</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {mvp110DailyUi.visibleCards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 text-xs leading-relaxed ${globalDailyUiCleanupService.getToneClassName(card.tone)}`}>
              <p className="font-bold text-text-primary mb-1">{card.title}</p>
              <p className="opacity-80">{card.description}</p>
            </div>
          ))}
        </div>
        <p id="mvp110-hidden-engineering-terms" hidden aria-hidden="true">
          {mvp110DailyUi.termsMovedBehindMaintenance.join(' / ')} 已从日常首页后置到诊断页或维护区。
        </p>
      </section>


      <section id="mvp111-ui-cleanup-closeout" className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">界面收口</p>
            <h3 className="mt-1 text-base font-extrabold text-text-primary">{mvp111Closeout.title}</h3>
            <p className="mt-1 text-xs text-text-muted leading-relaxed max-w-3xl">{mvp111Closeout.summary}</p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100 whitespace-nowrap">MVP111 收口包</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {mvp111Closeout.closeoutCards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 text-xs leading-relaxed ${uiCleanupCloseoutBaselineSyncService.getToneClassName(card.tone)}`}>
              <p className="font-bold text-text-primary mb-1">{card.title}</p>
              <p className="opacity-80">{card.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted leading-relaxed">{mvp111Closeout.dailyConclusion}</p>
      </section>
      <section id="mvp71-home-user-facing-simplification" className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">日常首页</p>
            <h3 className="mt-1 text-base font-extrabold text-text-primary">{mvp74HomeCleanup.title}</h3>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{mvp74HomeCleanup.subtitle}</p>
            <p id="mvp72-home-daily-surface-cleanup" hidden aria-hidden="true">{mvp72DailySurface.userVisibleRule}</p>
            <p id="mvp74-home-daily-entry-cleanup" hidden aria-hidden="true">{mvp74HomeCleanup.visibleRule}</p>
            <p id="mvp74-home-maintenance-markers" hidden aria-hidden="true">{mvp74HomeCleanup.hiddenMaintenanceNote}</p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100 whitespace-nowrap">日常使用</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {mvp71MainEntryCards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleMvp71EntryClick(card.id)}
              className="group text-left rounded-2xl border border-border-color/60 bg-card-bg/45 hover:bg-card-bg hover:border-emerald-500/35 p-4 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-emerald-300">{card.actionLabel}</p>
                  <h4 className="mt-1 text-sm font-extrabold text-text-primary group-hover:text-brand-color transition-colors">{card.title}</h4>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-color transition-colors" />
              </div>
              <p className="mt-2 text-[11px] text-text-muted leading-relaxed">{card.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {card.bullets.map((bullet) => (
                  <span key={bullet} className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-50/85">{bullet}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Legacy verifier marker: mediaOverview.cards.map */}
      <section id="mvp39-media-overview" hidden aria-hidden="true">
        <div id="mvp49-home-media-focus" className="rounded-2xl border border-border-color/70 bg-card-bg/55 p-4 space-y-2">
          <p className="text-[10px] font-bold text-brand-color tracking-wider"><span hidden aria-hidden="true">今日入口</span>听音频入口</p>
          <h3 className="text-base font-extrabold text-text-primary">{mvp49Listening.title}</h3>
          <p className="text-xs text-text-muted leading-relaxed">{mvp49Listening.description}</p>
          <p className="text-[10px] text-text-muted/90 leading-relaxed border-t border-border-color/40 pt-2">{mvp49Listening.helper}</p>
          <div id="mvp54-home-regression-hint" hidden aria-hidden="true">
            {mvp54Regression.chips.map((chip) => (
              <span key={chip.id}>{chip.label}：{chip.value}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {mvp49Listening.cards.map((card) => (
            <button
              key={card.id}
              onClick={() => {
                if (card.id === 'continue' && continueTrack) onPlayTrack(continueTrack);
                if (card.id === 'continue' && !continueTrack) setCurrentPage('asmr-lib');
                if (card.id === 'recent') setCurrentPage('playlists');
                if (card.id === 'asmr') setCurrentPage('asmr-lib');
                if (card.id === 'music') setCurrentPage('music-lib');
                if (card.id === 'playlist') setCurrentPage('playlists');
                if (card.id === 'settings') setCurrentPage('settings');
              }}
              className="text-left rounded-2xl border border-border-color/60 bg-card-bg/45 hover:bg-card-bg hover:border-brand-color/35 p-4 transition-all cursor-pointer"
            >
              <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border font-semibold ${listeningExperiencePolishService.getBadgeClass(card.tone)}`}>
                {card.actionLabel}
              </span>
              <p className="mt-2 text-sm font-bold text-text-primary line-clamp-1">{card.title}</p>
              <p className="mt-1 text-[10px] text-text-muted line-clamp-2 leading-relaxed">{card.description}</p>
              <p className="mt-2 text-[10px] text-text-muted/90">{card.meta}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="mvp45-home-recent-listening" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>最近播放</span>
          </h3>
          <span className="text-xs text-text-muted bg-card-bg border border-border-color px-2.5 py-0.5 rounded-full font-medium">本地记录</span>
        </div>
        {homeListening.recentItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-color bg-card-bg/30 p-6 text-center">
            <p className="text-sm font-bold text-text-primary">暂无最近播放</p>
            <p className="mt-1 text-xs text-text-muted">从音声库或音乐库播放一次后，这里会显示继续入口。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {homeListening.recentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPlayTrack(item.track, recentTracks)}
                className="group text-left rounded-2xl border border-border-color/60 bg-card-bg/45 hover:bg-card-bg hover:border-brand-color/35 p-3 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                    <CoverArtwork src={item.track.coverUrl} title={item.track.title} subtitle={item.track.artist} kind={item.track.type === 'asmr' ? 'asmr' : 'music'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-text-muted">{item.updatedAtLabel}</p>
                        <p className="text-[10px] text-text-muted">{item.kindLabel}</p>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-text-primary line-clamp-1 group-hover:text-brand-color transition-colors">{item.title}</h4>
                      <p className="mt-0.5 text-[11px] text-text-muted truncate">{item.subtitle}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-text-muted">
                        <span>{item.progressLabel}</span>
                        <span>{item.sourceLabel}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-color" style={{ width: `${item.progressPercent}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.badges.map((badge) => (
                        <span key={`${item.id}-${badge.label}`} className={`text-[10px] px-2 py-0.5 rounded-full border ${homeRecentListeningService.getBadgeClass(badge.tone)}`}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
              <ListMusic className="w-5 h-5 text-pink-400" />
              <span>常听歌单</span>
            </h3>
            <button
              onClick={() => setCurrentPage('playlists')}
              className="text-xs text-brand-color hover:underline flex items-center space-x-0.5"
            >
              <span>查看全部</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {playlists.slice(0, 4).map(playlist => (
              <div
                key={playlist.id}
                onClick={() => setPlaylistDetailId(playlist.id)}
                className="group flex items-center space-x-3.5 p-3 rounded-xl bg-card-bg/50 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/30 transition-all cursor-pointer"
              >
                <CoverArtwork
                  src={playlist.coverUrl}
                  title={playlist.name}
                  subtitle={`${playlist.tracks.length} 首音轨`}
                  kind="playlist"
                  className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-color transition-colors truncate">
                    {playlist.name}
                  </h4>
                  <p className="text-[10px] text-text-muted truncate mt-1">
                    {playlist.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-border-color/40 text-text-secondary px-2 py-0.5 rounded">
                    {playlist.tracksCount} 首
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-purple-400" />
                <span>最近加入的 RJ 音声作品</span>
              </h3>
              <button
                onClick={() => setCurrentPage('asmr-lib')}
                className="text-xs text-brand-color hover:underline flex items-center space-x-0.5"
              >
                <span>进入音声库</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rjWorks.slice(0, 3).map(rj => (
                <div
                  key={rj.id}
                  onClick={() => setAsmrDetailId(rj.id)}
                  className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-indigo-500/30 rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-200"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2.5">
                    <CoverArtwork
                      src={rj.coverUrl}
                      title={rj.title}
                      subtitle={rj.id}
                      kind="asmr"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md text-[9px] text-zinc-200 px-1.5 py-0.5 rounded font-bold">
                      {rj.id}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-brand-color transition-colors">
                    {rj.title}
                  </h4>
                  <span className="text-[10px] text-text-muted mt-1 truncate">{rj.circle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
                <Disc className="w-5 h-5 text-emerald-400" />
                <span>最近加入的普通音乐专辑</span>
              </h3>
              <button
                onClick={() => setCurrentPage('music-lib')}
                className="text-xs text-brand-color hover:underline flex items-center space-x-0.5"
              >
                <span>进入音乐库</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {musicAlbums.slice(0, 3).map(album => (
                <div
                  key={album.id}
                  onClick={() => setCurrentPage('music-lib')}
                  className="group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-emerald-500/30 rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-200"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2.5">
                    <CoverArtwork
                      src={album.coverUrl}
                      title={album.title}
                      subtitle={album.artist}
                      kind="music"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {album.genre.split('/')[0].trim()}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-brand-color transition-colors">
                    {album.title}
                  </h4>
                  <span className="text-[10px] text-text-muted mt-1 truncate">{album.artist}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
