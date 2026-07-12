import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Repeat1, 
  Shuffle, 
  ListMusic, 
  Heart, 
  FolderPlus, 
  Tv, 
  MoreHorizontal, 
  X,
  Sparkles
} from 'lucide-react';
import { PlayerState, AudioTrack, Playlist } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import { listeningExperiencePolishService } from '../services/listeningExperiencePolishService';
import { playerVisualPolishService } from '../services/playerVisualPolishService';
import { betaRegressionChecklistService } from '../services/betaRegressionChecklistService';
import { homePlayerBetaPolishService } from '../services/homePlayerBetaPolishService';
import { playerBarDailyCleanupService } from '../services/playerBarDailyCleanupService';
import { playerUiBugfixService } from '../services/playerUiBugfixService';
import CoverArtwork from './CoverArtwork';

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
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [desktopLyricsActive, setDesktopLyricsActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hover & Drag preview states
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const pendingSeekValueRef = React.useRef<number | null>(null);

  // Volume hover timer buffer
  const volumeTimeoutRef = React.useRef<any>(null);

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
    setShowVolumeSlider(true);
  };

  const handleVolumeMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 800); // 800ms delay gives plenty of time to transition mouse cleanly
  };

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Format seconds to mm:ss
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const getSafeDuration = (track: AudioTrack | null): number => {
    if (!track || !Number.isFinite(track.duration) || track.duration <= 0) return 0;
    return track.duration;
  };

  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseLrcFractionalSeconds = (fraction: string | undefined): number => {
    if (!fraction) return 0;
    const parsed = Number.parseInt(fraction, 10);
    if (!Number.isFinite(parsed)) return 0;
    return parsed / Math.pow(10, fraction.length);
  };

  const seekFromPointer = (clientX: number, rect: DOMRect, duration: number) => {
    if (duration <= 0 || rect.width <= 0) return null;
    const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
    return percent * duration;
  };

  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const duration = getSafeDuration(currentTrack);
    if (!currentTrack || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newProgress = seekFromPointer(e.clientX, rect, duration);
    if (newProgress !== null) onSeek(newProgress);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const duration = getSafeDuration(currentTrack);
    if (!currentTrack || !progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const percent = clamp((e.clientX - rect.left) / rect.width, 0, 1);
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

  const totalDuration = getSafeDuration(currentTrack);
  const safeProgress = Number.isFinite(progress) ? Math.max(0, progress) : 0;
  const currentDisplayProgress = totalDuration > 0 ? clamp(dragValue !== null ? dragValue : safeProgress, 0, totalDuration) : 0;
  const progressPercent = totalDuration > 0 ? clamp((currentDisplayProgress / totalDuration) * 100, 0, 100) : 0;
  const safeVolume = clamp(Number.isFinite(volume) ? volume : 0, 0, 1);
  const visibleVolume = isMuted ? 0 : safeVolume;
  const visibleVolumePercent = clamp(visibleVolume * 100, 0, 100);
  const isLiked = currentTrack ? favorites.includes(currentTrack.id) : false;
  const playerSummary = playerExperienceService.getSummary(playerState);
  const mvp49Player = listeningExperiencePolishService.getPlayerBarModel(playerState);
  const mvp50PlayerVisual = playerVisualPolishService.getPlayerBarModel(playerState);
  const mvp54PlayerRegression = betaRegressionChecklistService.getPlayerModel(playerState);
  const mvp59PlayerBeta = homePlayerBetaPolishService.getPlayerBarModel(playerState);
  const mvp74PlayerBar = playerBarDailyCleanupService.getPlayerBarModel(playerState);
  const mvp79PlayerUi = playerUiBugfixService.getModel();

  // Real-time parsed lyrics parser for Desktop Floating Overlay (Requirement 10)
  const parsedLyrics = useMemo(() => {
    if (!currentTrack || !currentTrack.lyrics) return [];
    return currentTrack.lyrics.map(line => {
      const timeReg = /\[(\d+):(\d+)(?:\.(\d+))?\]/;
      const match = line.match(timeReg);
      if (!match) return { time: -1, text: line };
      const mins = parseInt(match[1]);
      const secs = parseInt(match[2]);
      const ms = parseLrcFractionalSeconds(match[3]);
      const time = mins * 60 + secs + ms;
      const text = line.replace(timeReg, '').trim();
      return { time, text };
    }).filter(item => item.time >= 0);
  }, [currentTrack]);

  const activeLyric = useMemo(() => {
    if (!currentTrack) return '';
    if (parsedLyrics.length === 0) return 'Yang-Kura 本地音频播放中';
    let active = parsedLyrics[0].text;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (progress >= parsedLyrics[i].time) {
        active = parsedLyrics[i].text;
      } else {
        break;
      }
    }
    return active;
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
          <div 
            className="absolute bottom-4 bg-zinc-950/95 border border-zinc-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-mono pointer-events-none transform -translate-x-1/2 z-[99] shadow-2xl backdrop-blur-xl transition-all duration-75 flex flex-col items-center gap-0.5 border-b-2 border-b-sky-500"
            style={{ left: `${hoverPercent * 100}%` }}
          >
            <span className="text-sky-300 font-bold text-xs tracking-wider">{formatTime(hoverTime)}</span>
            <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-sans font-bold">跳转预览</span>
            {/* Tooltip triangle indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
          </div>
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
              const val = totalDuration > 0 ? clamp(Number.isFinite(parsedValue) ? parsedValue : 0, 0, totalDuration) : 0;
              pendingSeekValueRef.current = val;
              setDragValue(val);
            }}
            onMouseUp={() => {
              const finalSeek = pendingSeekValueRef.current;
              if (finalSeek !== null && totalDuration > 0) {
                onSeek(clamp(finalSeek, 0, totalDuration));
              }
              pendingSeekValueRef.current = null;
              setDragValue(null);
            }}
            onTouchEnd={() => {
              const finalSeek = pendingSeekValueRef.current;
              if (finalSeek !== null && totalDuration > 0) {
                onSeek(clamp(finalSeek, 0, totalDuration));
              }
              pendingSeekValueRef.current = null;
              setDragValue(null);
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}
      </div>

      {/* Left side: Vinyl circle style cover art + Metadata & Stats (Heart rate) */}
      <div 
        className="w-1/3 flex items-center space-x-4 pr-4"
        onClick={(e) => e.stopPropagation()}
      >
        {currentTrack ? (
          <>
            {/* Spinning Vinyl Album Art */}
            <div 
              onClick={toggleLyrics}
              className={`relative w-12 h-12 rounded-full overflow-hidden bg-black/60 border border-zinc-800 flex-shrink-0 cursor-pointer shadow-xl group/album transition-transform hover:scale-105 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              <CoverArtwork
                src={currentTrack.coverUrl}
                title={currentTrack.title}
                subtitle={currentTrack.artist}
                kind={currentTrack.type === 'asmr' ? 'asmr' : 'music'}
                className="w-full h-full object-cover rounded-full p-1"
                rounded
              />
              {/* Vinyl center pin point */}
              <div className="absolute inset-0 m-auto w-3.5 h-3.5 bg-zinc-950 border border-zinc-700 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h3 
                  onClick={toggleLyrics}
                  className="text-[13px] font-bold text-zinc-100 hover:text-sky-400 cursor-pointer transition-colors truncate"
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </h3>
                {/* 本地 badge matching the mockup */}
                <span className="text-[8px] bg-sky-500/15 text-sky-400 border border-sky-500/25 px-1 py-px rounded font-extrabold uppercase tracking-wide flex-shrink-0">
                  本地
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-1" title={currentTrack.artist}>
                {currentTrack.artist}
              </p>
              {playerState.playbackError ? (
                <p className="text-[9px] text-rose-300 truncate mt-0.5" title={playerState.playbackError}>
                  播放失败：{playerState.playbackError}
                </p>
              ) : playerState.playbackNotice ? (
                <p className="text-[9px] text-amber-300 truncate mt-0.5" title={playerState.playbackNotice}>
                  播放提示：{playerState.playbackNotice}
                </p>
              ) : (
                <>
                <div id="mvp74-playerbar-daily-control-strip" className="mt-1.5 flex items-center gap-1.5 text-[9px] text-zinc-400 truncate" title={mvp74PlayerBar.hiddenMaintenanceNote}>
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400/90 flex-shrink-0" />
                  <span className="truncate">{mvp74PlayerBar.compactStatus}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {mvp74PlayerBar.visibleBadges.slice(0, 3).map((badge) => (
                    <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-zinc-300">
                      {badge}
                    </span>
                  ))}
                </div>
                <div id="mvp49-player-status-strip" hidden aria-hidden="true" title={playerSummary.completionModeDescription}>
                  {mvp49Player.statusBadges.slice(0, 3).map((badge) => (
                    <span key={`${badge.label}-${badge.tone}`}>{badge.label}</span>
                  ))}
                </div>
                <div id="mvp50-player-visual-strip" hidden aria-hidden="true" title={mvp50PlayerVisual.contextLine}>
                  <span>{mvp50PlayerVisual.contextLine}</span>
                </div>
                <div id="mvp54-player-regression-strip" hidden aria-hidden="true" title={mvp54PlayerRegression.compactLine}>
                  <span>{mvp54PlayerRegression.compactLine}</span>
                </div>
                <div id="mvp59-player-compact-strip" hidden aria-hidden="true" title={mvp59PlayerBeta.compactLine}>
                  <span>{mvp59PlayerBeta.compactLine}</span>
                </div>
                <div id="mvp74-playerbar-maintenance-markers" hidden aria-hidden="true">{mvp74PlayerBar.hiddenMaintenanceNote}</div>
                </>
              )}
            </div>

            {/* Favorite button wrapper (Comments removed as requested) */}
            <div className="flex items-center pl-3 border-l border-zinc-800/80 flex-shrink-0">
              <button 
                onClick={() => {
                  toggleFavorite(currentTrack.id);
                  setToastMessage(isLiked ? '已取消喜欢' : '已添加到喜欢');
                }}
                className="flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors group/heart"
                title={isLiked ? '取消喜欢' : '喜欢这首音声'}
              >
                <Heart 
                  className={`w-4.5 h-4.5 transition-all ${
                    isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'group-hover/heart:scale-110'
                  }`} 
                />
                <span className="text-[10px] font-bold text-zinc-500 group-hover/heart:text-zinc-300">
                  喜欢
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3 text-zinc-500">
            <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800/40 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-sky-400" />
            </div>
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-zinc-300">{mvp59PlayerBeta.emptyTitle}</p>
              <p id="mvp59-player-empty-hint" className="text-[10px] text-zinc-500">{mvp59PlayerBeta.emptyHint}</p>
              <p id="mvp50-player-empty-hint" hidden aria-hidden="true">播放器会显示播放进度、字幕状态和队列数量</p>
              <p id="mvp54-player-empty-regression-hint" hidden aria-hidden="true">{mvp54PlayerRegression.compactLine}</p>
            </div>
          </div>
        )}
      </div>

      {/* Center: Play controls (Tighter and perfectly aligned layout matching standard music apps) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center"
      >
        <div className="flex items-center bg-zinc-900/40 border border-zinc-900 px-5 py-2.5 rounded-full shadow-inner space-x-5">
          {/* Loop Mode Selection */}
          <button
            onClick={toggleLoopMode}
            disabled={!currentTrack}
            className={`p-1.5 rounded-lg transition-all ${
              !currentTrack ? 'opacity-30' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer hover:scale-105'
            }`}
            title={loopMode === 'shuffle' ? '随机播放' : loopMode === 'one' ? '单曲循环' : '列表循环'}
          >
            {loopMode === 'shuffle' ? (
              <Shuffle className="w-4 h-4 text-sky-400" />
            ) : loopMode === 'one' ? (
              <Repeat1 className="w-4 h-4 text-pink-400" />
            ) : (
              <Repeat className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Previous Button */}
          <button
            onClick={onPrev}
            disabled={!currentTrack}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-200 disabled:opacity-30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="上一首"
          >
            <SkipBack className="w-4.5 h-4.5" />
          </button>

          {/* Play/Pause Button (Requirement 2) */}
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-11 h-11 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            title={playerState.playbackMode === 'resolving-local-media' ? '正在解析本地音频' : isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={!currentTrack}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-200 disabled:opacity-30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="下一首"
          >
            <SkipForward className="w-4.5 h-4.5" />
          </button>

          {/* Play Queue trigger moved to the center cluster, as shown in beautiful music bar blueprints */}
          <button
            onClick={toggleQueue}
            disabled={!currentTrack}
            className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
              !currentTrack ? 'opacity-30' : ''
            } ${
              isQueueOpen 
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/20' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer hover:scale-105'
            }`}
            title="当前播放队列"
          >
            <ListMusic className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold ml-1 text-zinc-500">{playerState.queue.length}</span>
          </button>

          {/* Timeline counter pill */}
          <div className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1 pl-3.5 border-l border-zinc-800">
            <span className="text-sky-400 font-bold">{formatTime(currentDisplayProgress)}</span>
            <span className="text-zinc-600">/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>

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
          >
            <FolderPlus className="w-4.5 h-4.5" />
          </button>

          {/* Playlist picker popup dropdown */}
          {showPlaylistDropdown && currentTrack && (
            <div className="absolute bottom-12 right-0 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-left animate-fade-in max-h-56 overflow-y-auto">
              <p className="text-[10px] font-bold text-zinc-400 px-2 py-1 border-b border-zinc-800/60 mb-1 flex items-center justify-between">
                <span>请选择收藏的歌单</span>
                <X className="w-3 h-3 hover:text-white cursor-pointer" onClick={() => setShowPlaylistDropdown(false)} />
              </p>
              {playlists.length === 0 ? (
                <p className="text-[9px] text-zinc-500 p-2 text-center">暂无自定义歌单</p>
              ) : (
                <div className="space-y-0.5">
                  {playlists.map(p => {
                    const exists = p.tracks.some(t => t.id === currentTrack.id);
                    const isReadOnly = Boolean(p.isSystem);
                    return (
                      <button
                        key={p.id}
                        disabled={isReadOnly}
                        onClick={() => {
                          if (isReadOnly) {
                            setToastMessage('系统示例歌单不可修改，请新建自建歌单');
                          } else if (!exists) {
                            onAddToPlaylist(currentTrack, p.id);
                            setToastMessage(`成功收藏到歌单《${p.name}》`);
                          } else {
                            setToastMessage(`已存在于该歌单中`);
                          }
                          setShowPlaylistDropdown(false);
                        }}
                        className={`w-full text-left text-[11px] rounded px-2 py-1.5 transition-colors flex items-center justify-between truncate ${isReadOnly ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 hover:text-sky-400 hover:bg-zinc-900/60'}`}
                      >
                        <span className="truncate flex-1 pr-1">{p.name}</span>
                        {isReadOnly ? (
                          <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1 rounded flex-shrink-0 font-bold">只读</span>
                        ) : exists && (
                          <span className="text-[8px] bg-sky-500/15 text-sky-400 px-1 rounded flex-shrink-0 font-bold">已收藏</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5 text-zinc-500" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>
          
          {/* Hover Popover Slider widget with invisible physical overlay bridge */}
          {showVolumeSlider && (
            <div 
              className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-xl shadow-2xl flex flex-col items-center space-y-2.5 z-50 w-9 h-32 animate-fade-in"
              style={{ contentVisibility: 'auto' }}
            >
              {/* Invisible bridge to prevent mouse leaving container when moving cursor upward */}
              <div className="absolute -bottom-4 left-0 right-0 h-4 bg-transparent cursor-pointer" />

              <span className="text-[8px] font-mono font-extrabold text-zinc-400 leading-none">
                {Math.round(visibleVolumePercent)}%
              </span>
              <div className="relative w-1.5 h-16 bg-zinc-900 rounded-full flex flex-col justify-end overflow-hidden cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={visibleVolume}
                  onChange={handleVolumeSlide}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer origin-bottom"
                  style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
                />
                <div 
                  className="w-full bg-sky-400 rounded-full transition-all"
                  style={{ height: `${visibleVolumePercent}%` }}
                />
              </div>
            </div>
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
        <div 
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening full lyrics panel when clicking floating overlay
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 px-6 py-3.5 rounded-2xl shadow-2xl z-50 transition-all min-w-[340px] max-w-[550px] text-center flex items-center justify-between gap-4 select-none hover:bg-zinc-900 animate-bounce-subtle"
        >
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-[9px] text-sky-400 font-extrabold tracking-wider uppercase font-mono">
                歌词浮窗同步
              </p>
            </div>
            <p className="text-[11px] font-bold text-white truncate drop-shadow-sm leading-relaxed">
              {activeLyric}
            </p>
          </div>
          <button 
            onClick={() => setDesktopLyricsActive(false)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="关闭歌词浮窗"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Elegant Action Success Float Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-sky-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-[11px] font-bold flex items-center space-x-1.5 animate-fade-in border border-sky-400/20">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
