import React, { useState, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  FolderPlus,
  Tv,
  MoreHorizontal,
} from 'lucide-react';
import { PlayerState, AudioTrack, Playlist } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import { listeningExperiencePolishService } from '../services/listeningExperiencePolishService';
import { playerVisualPolishService } from '../services/playerVisualPolishService';
import { betaRegressionChecklistService } from '../services/betaRegressionChecklistService';
import { homePlayerBetaPolishService } from '../services/homePlayerBetaPolishService';
import { playerBarDailyCleanupService } from '../services/playerBarDailyCleanupService';
import { playerUiBugfixService } from '../services/playerUiBugfixService';
import { getActiveLyricText, parseLyrics } from '../player/lyricsTimeline';
import {
  clampPlayerValue,
  formatPlayerTime,
  getPlayerProgressMetrics,
  getPlayerVolumeMetrics,
  getSafeTrackDuration,
  seekFromPointerPosition,
} from '../player/playerBarMath';
import { useAutoDismissMessage, useDelayedVisibility } from '../hooks/usePlayerTransientUi';
import {
  PlayerEmptyState,
  PlayerFloatingLyrics,
  PlayerPlaylistMenu,
  PlayerSeekPreview,
  PlayerToast,
  PlayerVolumePopover,
} from './PlayerTransientPresenters';
import { PlayerTrackSummary, PlayerTransportControls } from './PlayerBarPrimarySections';

interface PlayerBarProps {
  playerState: PlayerState;
  togglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  toggleLoopMode: () => void;
  toggleCompletionMode?: () => void;
  isQueueOpen: boolean;
  toggleQueue: () => void;
  isLyricsOpen: boolean;
  toggleLyrics: () => void;
  
  // Custom interactive extensions
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (track: AudioTrack, playlistId: string) => void;
}

export default function PlayerBar({
  playerState,
  togglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  toggleMute,
  toggleLoopMode,
  toggleCompletionMode,
  isQueueOpen,
  toggleQueue,
  isLyricsOpen,
  toggleLyrics,
  favorites,
  toggleFavorite,
  playlists,
  onAddToPlaylist
}: PlayerBarProps) {
  
  const { currentTrack, isPlaying, progress, volume, isMuted, loopMode } = playerState;

  // Local state controls
  const {
    isVisible: showVolumeSlider,
    show: handleVolumeMouseEnter,
    scheduleHide: handleVolumeMouseLeave,
  } = useDelayedVisibility();
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [desktopLyricsActive, setDesktopLyricsActive] = useState(false);
  const { message: toastMessage, showMessage: setToastMessage } = useAutoDismissMessage();

  // Hover & Drag preview states
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const pendingSeekValueRef = React.useRef<number | null>(null);

  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const duration = getSafeTrackDuration(currentTrack);
    if (!currentTrack || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newProgress = seekFromPointerPosition(e.clientX, rect.left, rect.width, duration);
    if (newProgress !== null) onSeek(newProgress);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const duration = getSafeTrackDuration(currentTrack);
    if (!currentTrack || !progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const percent = clampPlayerValue((e.clientX - rect.left) / rect.width, 0, 1);
    setHoverPercent(percent);
    setHoverTime(percent * duration);
  };

  const handleProgressMouseLeave = () => {
    setHoverPercent(null);
    setHoverTime(null);
  };

  const handleVolumeSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    if (!currentTrack) return;

    const exists = playlist.tracks.some((track) => track.id === currentTrack.id);
    const isReadOnly = Boolean(playlist.isSystem);

    if (isReadOnly) {
      setToastMessage('系统示例歌单不可修改，请新建自建歌单');
    } else if (!exists) {
      onAddToPlaylist(currentTrack, playlist.id);
      setToastMessage(`成功收藏到歌单《${playlist.name}》`);
    } else {
      setToastMessage('已存在于该歌单中');
    }

    setShowPlaylistDropdown(false);
  };

  const totalDuration = getSafeTrackDuration(currentTrack);
  const { currentDisplayProgress, progressPercent } = getPlayerProgressMetrics(progress, dragValue, totalDuration);
  const { visibleVolume, visibleVolumePercent } = getPlayerVolumeMetrics(volume, isMuted);
  const isLiked = currentTrack ? favorites.includes(currentTrack.id) : false;
  const playerSummary = playerExperienceService.getSummary(playerState);
  const mvp49Player = listeningExperiencePolishService.getPlayerBarModel(playerState);
  const mvp50PlayerVisual = playerVisualPolishService.getPlayerBarModel(playerState);
  const mvp54PlayerRegression = betaRegressionChecklistService.getPlayerModel(playerState);
  const mvp59PlayerBeta = homePlayerBetaPolishService.getPlayerBarModel(playerState);
  const mvp74PlayerBar = playerBarDailyCleanupService.getPlayerBarModel(playerState);
  const mvp79PlayerUi = playerUiBugfixService.getModel();

  // Desktop floating lyrics reuse the shared LRC timeline contract.
  const parsedLyrics = useMemo(() => parseLyrics(currentTrack?.lyrics), [currentTrack]);

  const activeLyric = useMemo(() => {
    if (!currentTrack) return '';
    return getActiveLyricText(parsedLyrics, progress, 'Yang-Kura 本地音频播放中');
  }, [parsedLyrics, progress, currentTrack]);

  return (
    <div 
      id="app-player-bar" 
      className="h-20 bg-zinc-950 border-t border-zinc-800/80 px-8 flex items-center justify-between select-none relative z-50 text-white"
      data-mvp79-player-ui-bugfix="true"
    >
      {/* 1. Thin Progress Bar Line at the top of Player bar */}
      <div
        id="mvp75-playerbar-progress-stability" 
        ref={progressBarRef}
        onMouseMove={handleProgressMouseMove}
        onMouseLeave={handleProgressMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          handleProgressSeek(e);
        }}
        className="absolute -top-1.5 left-0 right-0 h-4 flex items-center bg-transparent cursor-pointer group/progress z-50"
        title={currentTrack && totalDuration > 0 ? '点击或拖拽跳转进度' : '等待可播放音轨'}
      >
        <div className="w-full h-1 bg-zinc-900 group-hover/progress:h-1.5 rounded-full relative transition-all duration-150 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 to-sky-400 group-hover/progress:from-sky-400 group-hover/progress:to-sky-300 transition-all rounded-r-full relative"
            style={{ width: `${progressPercent}%`, transitionProperty: dragValue !== null ? 'none' : undefined }}
          >
            {/* Glowing active thumb indicator on hover */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-sky-400 scale-0 group-hover/progress:scale-100 transition-transform duration-150 z-50" />
          </div>
        </div>

        {/* Hover seek-preview tooltip */}
        {hoverPercent !== null && hoverTime !== null && currentTrack && (
          <PlayerSeekPreview
            percent={hoverPercent}
            timeLabel={formatPlayerTime(hoverTime)}
          />
        )}

        {/* Invisible precise seeker range overlay */}
        {currentTrack && (
          <input 
            type="range" 
            min="0"
            max={totalDuration || 0}
            value={currentDisplayProgress}
            disabled={totalDuration <= 0}
            onMouseDown={() => {
              pendingSeekValueRef.current = currentDisplayProgress;
              setDragValue(currentDisplayProgress);
            }}
            onTouchStart={() => {
              pendingSeekValueRef.current = currentDisplayProgress;
              setDragValue(currentDisplayProgress);
            }}
            onChange={(e) => {
              const parsedValue = parseFloat(e.target.value);
              const val = totalDuration > 0 ? clampPlayerValue(Number.isFinite(parsedValue) ? parsedValue : 0, 0, totalDuration) : 0;
              pendingSeekValueRef.current = val;
              setDragValue(val);
            }}
            onMouseUp={() => {
              const finalSeek = pendingSeekValueRef.current;
              if (finalSeek !== null && totalDuration > 0) {
                onSeek(clampPlayerValue(finalSeek, 0, totalDuration));
              }
              pendingSeekValueRef.current = null;
              setDragValue(null);
            }}
            onTouchEnd={() => {
              const finalSeek = pendingSeekValueRef.current;
              if (finalSeek !== null && totalDuration > 0) {
                onSeek(clampPlayerValue(finalSeek, 0, totalDuration));
              }
              pendingSeekValueRef.current = null;
              setDragValue(null);
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="播放进度"
          />
        )}
      </div>

      {/* Left side: Vinyl circle style cover art + Metadata & Stats (Heart rate) */}
      <div 
        className="w-1/3 flex items-center space-x-4 pr-4"
        onClick={(e) => e.stopPropagation()}
      >
        {currentTrack ? (
          <PlayerTrackSummary
            track={currentTrack}
            isPlaying={isPlaying}
            isLiked={isLiked}
            playbackError={playerState.playbackError}
            playbackNotice={playerState.playbackNotice}
            compactStatus={mvp74PlayerBar.compactStatus}
            visibleBadges={mvp74PlayerBar.visibleBadges}
            hiddenMaintenanceNote={mvp74PlayerBar.hiddenMaintenanceNote}
            completionModeDescription={playerSummary.completionModeDescription}
            statusBadges={mvp49Player.statusBadges}
            visualContextLine={mvp50PlayerVisual.contextLine}
            regressionLine={mvp54PlayerRegression.compactLine}
            compactLine={mvp59PlayerBeta.compactLine}
            onOpenLyrics={toggleLyrics}
            onToggleFavorite={() => {
              toggleFavorite(currentTrack.id);
              setToastMessage(isLiked ? '已取消喜欢' : '已添加到喜欢');
            }}
          />
        ) : (
          <PlayerEmptyState
            title={mvp59PlayerBeta.emptyTitle}
            hint={mvp59PlayerBeta.emptyHint}
            regressionLine={mvp54PlayerRegression.compactLine}
          />
        )}
      </div>

      <PlayerTransportControls
        hasTrack={Boolean(currentTrack)}
        loopMode={loopMode}
        playbackMode={playerState.playbackMode}
        isPlaying={isPlaying}
        isQueueOpen={isQueueOpen}
        queueCount={playerState.queue.length}
        currentTimeLabel={formatPlayerTime(currentDisplayProgress)}
        durationLabel={formatPlayerTime(totalDuration)}
        onToggleLoopMode={toggleLoopMode}
        onPrevious={onPrev}
        onTogglePlay={togglePlay}
        onNext={onNext}
        onToggleQueue={toggleQueue}
      />

      {/* Right side: Volume, folder save, and desktop lyrics (No "全景声" and no lyrics "词" button) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-1/3 flex items-center justify-end space-x-4 pl-4"
      >
        <div id="mvp59-player-beta-chips" hidden aria-hidden="true">
          {mvp59PlayerBeta.chips.map((chip) => (
            <span key={chip.id}>{chip.label}：{chip.value}</span>
          ))}
        </div>

        {/* Completion strategy: user-facing ASMR/music stop behavior */}
        <button
          type="button"
          onClick={toggleCompletionMode}
          disabled={!currentTrack || !toggleCompletionMode}
          className="text-[10px] border border-zinc-800 bg-zinc-900/60 text-zinc-300 px-2.5 py-1 rounded-full font-bold flex-shrink-0 hover:border-sky-500/40 hover:text-sky-300 disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300 transition-colors"
          title={mvp49Player.completionHint}
          aria-label={`播放完成策略：${mvp49Player.completionLabel}`}
        >
          <span hidden aria-hidden="true">播放策略</span><span hidden aria-hidden="true">策略：</span>{mvp49Player.completionLabel}
        </button>

        {/* 9. 收藏到歌单 [+] Folder Save */}
        <div className="relative">
          <button
            onClick={() => {
              if (currentTrack) setShowPlaylistDropdown(!showPlaylistDropdown);
            }}
            disabled={!currentTrack}
            className={`p-2 rounded-xl transition-all border flex items-center justify-center ${
              !currentTrack ? 'opacity-30 border-transparent' : ''
            } ${
              showPlaylistDropdown
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-400' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent hover:border-zinc-800/80 cursor-pointer'
            }`}
            title="收藏到歌单"
            aria-label="收藏到歌单"
            aria-haspopup="menu"
            aria-expanded={showPlaylistDropdown}
          >
            <FolderPlus className="w-4.5 h-4.5" />
          </button>

          {/* Playlist picker popup dropdown */}
          {showPlaylistDropdown && currentTrack && (
            <PlayerPlaylistMenu
              currentTrack={currentTrack}
              playlists={playlists}
              onClose={() => setShowPlaylistDropdown(false)}
              onSelectPlaylist={handlePlaylistSelect}
            />
          )}
        </div>

        {/* 10. 歌词浮窗 */}
        <button
          onClick={() => {
            if (currentTrack) {
              setDesktopLyricsActive(!desktopLyricsActive);
              setToastMessage(desktopLyricsActive ? '歌词浮窗已关闭' : '歌词浮窗已开启');
            }
          }}
          disabled={!currentTrack}
          className={`p-2 rounded-xl transition-all border flex items-center justify-center ${
            !currentTrack ? 'opacity-30 border-transparent' : ''
          } ${
            desktopLyricsActive 
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-extrabold scale-105' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent hover:border-zinc-800/80 cursor-pointer'
          }`}
          title="歌词浮窗开关"
          aria-label={desktopLyricsActive ? '关闭歌词浮窗' : '开启歌词浮窗'}
          aria-pressed={desktopLyricsActive}
        >
          <Tv className="w-4.5 h-4.5" />
        </button>

        <span className="text-zinc-800">|</span>

        {/* 7. Volume Hover Vertical Slider with seamless hover bridge */}
        <div 
          className="relative flex items-center justify-center"
          onMouseEnter={handleVolumeMouseEnter}
          onMouseLeave={handleVolumeMouseLeave}
        >
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
            title={isMuted ? "取消静音" : "静音"}
            aria-label={isMuted ? '取消静音' : '静音'}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5 text-zinc-500" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>
          
          {/* Hover Popover Slider widget with invisible physical overlay bridge */}
          {showVolumeSlider && (
            <PlayerVolumePopover
              visibleVolume={visibleVolume}
              visibleVolumePercent={visibleVolumePercent}
              onChange={handleVolumeSlide}
            />
          )}
        </div>

        {/* More placeholder: no silent/dead button; gives explicit feedback until the menu is implemented. */}
        <button
          onClick={() => setToastMessage('更多播放操作将在后续版本开放')}
          className="text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
          title="更多播放操作（后续开放）"
          aria-label="更多播放操作（后续开放）"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div id="mvp79-player-ui-bugfix" hidden aria-hidden="true">{mvp79PlayerUi.hiddenMaintenanceNote}</div>

      {/* 10. Floating lyrics overlay */}
      {desktopLyricsActive && currentTrack && (
        <PlayerFloatingLyrics
          text={activeLyric}
          onClose={() => setDesktopLyricsActive(false)}
        />
      )}

      {/* Elegant Action Success Float Toast */}
      {toastMessage && <PlayerToast message={toastMessage} />}
    </div>
  );
}
