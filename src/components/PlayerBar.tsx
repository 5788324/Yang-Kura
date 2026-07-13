import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { PlayerState, AudioTrack, Playlist } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import { listeningExperiencePolishService } from '../services/listeningExperiencePolishService';
import { playerVisualPolishService } from '../services/playerVisualPolishService';
import { betaRegressionChecklistService } from '../services/betaRegressionChecklistService';
import { homePlayerBetaPolishService } from '../services/homePlayerBetaPolishService';
import { playerBarDailyCleanupService } from '../services/playerBarDailyCleanupService';
import { playerUiBugfixService } from '../services/playerUiBugfixService';
import { getActiveLyricText, parseLyrics } from '../player/lyricsTimeline';
import { formatPlayerTime, getPlayerVolumeMetrics } from '../player/playerBarMath';
import { usePlayerSeekInteraction } from '../hooks/usePlayerSeekInteraction';
import { useAutoDismissMessage, useDelayedVisibility } from '../hooks/usePlayerTransientUi';
import {
  PlayerEmptyState,
  PlayerFloatingLyrics,
  PlayerToast,
} from './PlayerTransientPresenters';
import { PlayerProgressTrack } from './PlayerProgressTrack';
import { PlayerTrackSummary, PlayerTransportControls } from './PlayerBarPrimarySections';
import { PlayerAuxiliaryControls, PlayerCompatibilityMarkers } from './PlayerBarAuxiliaryControls';

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
  toggleLyrics,
  favorites,
  toggleFavorite,
  playlists,
  onAddToPlaylist
}: PlayerBarProps) {
  
  const { currentTrack, isPlaying, progress, volume, isMuted, loopMode } = playerState;

  // Local state controls
  const {
    isVisible: isVolumePopoverVisible,
    show: handleVolumeMouseEnter,
    scheduleHide: handleVolumeMouseLeave,
  } = useDelayedVisibility();
  const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false);
  const [isFloatingLyricsVisible, setIsFloatingLyricsVisible] = useState(false);
  const { message: playerToastMessage, showMessage: setPlayerToastMessage } = useAutoDismissMessage();

  const {
    duration: totalDuration,
    displayProgress: currentDisplayProgress,
    progressPercent,
    hoverPercent,
    hoverTime,
    isDragging: isProgressDragging,
    progressTrackRef,
    onTrackClick: handleProgressTrackClick,
    onTrackMouseMove: handleProgressTrackMouseMove,
    onTrackMouseLeave: handleProgressTrackMouseLeave,
    onRangeStart: beginProgressDrag,
    onRangeChange: updateProgressDrag,
    onRangeCommit: commitProgressDrag,
  } = usePlayerSeekInteraction({ currentTrack, progress, onSeek });

  const handleVolumeSlide = (e: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    if (!currentTrack) return;

    const exists = playlist.tracks.some((track) => track.id === currentTrack.id);
    const isReadOnly = Boolean(playlist.isSystem);

    if (isReadOnly) {
      setPlayerToastMessage('系统示例歌单不可修改，请新建自建歌单');
    } else if (!exists) {
      onAddToPlaylist(currentTrack, playlist.id);
      setPlayerToastMessage(`成功收藏到歌单《${playlist.name}》`);
    } else {
      setPlayerToastMessage('已存在于该歌单中');
    }

    setIsPlaylistMenuOpen(false);
  };

  const handleTogglePlaylist = () => {
    if (currentTrack) setIsPlaylistMenuOpen((visible) => !visible);
  };

  const handleToggleFloatingLyrics = () => {
    if (!currentTrack) return;
    setIsFloatingLyricsVisible(!isFloatingLyricsVisible);
    setPlayerToastMessage(isFloatingLyricsVisible ? '歌词浮窗已关闭' : '歌词浮窗已开启');
  };

  const handleMoreActions = () => {
    setPlayerToastMessage('更多播放操作将在后续版本开放');
  };

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
      <PlayerProgressTrack
        hasTrack={Boolean(currentTrack)}
        duration={totalDuration}
        displayProgress={currentDisplayProgress}
        progressPercent={progressPercent}
        isDragging={isProgressDragging}
        hoverPercent={hoverPercent}
        hoverTimeLabel={hoverTime !== null ? formatPlayerTime(hoverTime) : null}
        progressTrackRef={progressTrackRef}
        onTrackMouseMove={handleProgressTrackMouseMove}
        onTrackMouseLeave={handleProgressTrackMouseLeave}
        onTrackClick={handleProgressTrackClick}
        onRangeStart={beginProgressDrag}
        onRangeChange={updateProgressDrag}
        onRangeCommit={commitProgressDrag}
      />

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
              setPlayerToastMessage(isLiked ? '已取消喜欢' : '已添加到喜欢');
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

      <PlayerAuxiliaryControls
        hasTrack={Boolean(currentTrack)}
        completionLabel={mvp49Player.completionLabel}
        completionHint={mvp49Player.completionHint}
        canToggleCompletion={Boolean(toggleCompletionMode)}
        onToggleCompletion={() => toggleCompletionMode?.()}
        currentTrack={currentTrack}
        playlists={playlists}
        isPlaylistMenuOpen={isPlaylistMenuOpen}
        onTogglePlaylist={handleTogglePlaylist}
        onClosePlaylist={() => setIsPlaylistMenuOpen(false)}
        onSelectPlaylist={handlePlaylistSelect}
        isFloatingLyricsVisible={isFloatingLyricsVisible}
        onToggleFloatingLyrics={handleToggleFloatingLyrics}
        isMuted={isMuted}
        isVolumePopoverVisible={isVolumePopoverVisible}
        visibleVolume={visibleVolume}
        visibleVolumePercent={visibleVolumePercent}
        onToggleMute={toggleMute}
        onVolumeMouseEnter={handleVolumeMouseEnter}
        onVolumeMouseLeave={handleVolumeMouseLeave}
        onVolumeChange={handleVolumeSlide}
        onMoreActions={handleMoreActions}
      />

      <PlayerCompatibilityMarkers
        betaChips={mvp59PlayerBeta.chips}
        hiddenMaintenanceNote={mvp79PlayerUi.hiddenMaintenanceNote}
      />

      {/* 10. Floating lyrics overlay */}
      {isFloatingLyricsVisible && currentTrack && (
        <PlayerFloatingLyrics
          text={activeLyric}
          onClose={() => setIsFloatingLyricsVisible(false)}
        />
      )}

      {/* Elegant Action Success Float Toast */}
      {playerToastMessage && <PlayerToast message={playerToastMessage} />}
    </div>
  );
}
