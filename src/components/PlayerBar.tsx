import type { ChangeEvent } from 'react';
import type { PlayerState, AudioTrack, Playlist } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import { listeningExperiencePolishService } from '../services/listeningExperiencePolishService';
import { playerVisualPolishService } from '../services/playerVisualPolishService';
import { betaRegressionChecklistService } from '../services/betaRegressionChecklistService';
import { homePlayerBetaPolishService } from '../services/homePlayerBetaPolishService';
import { playerBarDailyCleanupService } from '../services/playerBarDailyCleanupService';
import { playerUiBugfixService } from '../services/playerUiBugfixService';
import { formatPlayerTime, getPlayerVolumeMetrics } from '../player/playerBarMath';
import { useFloatingLyricText } from '../hooks/useFloatingLyricText';
import { usePlayerBarActions } from '../hooks/usePlayerBarActions';
import { usePlayerSeekInteraction } from '../hooks/usePlayerSeekInteraction';
import { useDelayedVisibility } from '../hooks/usePlayerTransientUi';
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
  onAddToPlaylist,
}: PlayerBarProps) {
  const { currentTrack, isPlaying, progress, volume, isMuted, loopMode } = playerState;
  const hasTrack = currentTrack !== null;
  const canToggleCompletion = toggleCompletionMode !== undefined;

  const {
    isVisible: isVolumePopoverVisible,
    show: handleVolumeMouseEnter,
    scheduleHide: handleVolumeMouseLeave,
  } = useDelayedVisibility();

  const {
    isLiked,
    isPlaylistMenuOpen,
    isFloatingLyricsVisible,
    playerToastMessage,
    toggleCurrentFavorite,
    togglePlaylistMenu,
    closePlaylistMenu,
    selectPlaylist,
    toggleFloatingLyrics,
    closeFloatingLyrics,
    showMoreActions,
  } = usePlayerBarActions({
    currentTrack,
    favorites,
    toggleFavorite,
    onAddToPlaylist,
  });

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

  const activeLyric = useFloatingLyricText(currentTrack, progress);

  const handleVolumeSlide = (event: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number.parseFloat(event.target.value));
  };

  const { visibleVolume, visibleVolumePercent } = getPlayerVolumeMetrics(volume, isMuted);
  const playerSummary = playerExperienceService.getSummary(playerState);
  const mvp49Player = listeningExperiencePolishService.getPlayerBarModel(playerState);
  const mvp50PlayerVisual = playerVisualPolishService.getPlayerBarModel(playerState);
  const mvp54PlayerRegression = betaRegressionChecklistService.getPlayerModel(playerState);
  const mvp59PlayerBeta = homePlayerBetaPolishService.getPlayerBarModel(playerState);
  const mvp74PlayerBar = playerBarDailyCleanupService.getPlayerBarModel(playerState);
  const mvp79PlayerUi = playerUiBugfixService.getModel();

  return (
    <div
      id="app-player-bar"
      className="h-20 bg-zinc-950 border-t border-zinc-800/80 px-8 flex items-center justify-between select-none relative z-50 text-white"
      data-mvp79-player-ui-bugfix="true"
    >
      <PlayerProgressTrack
        hasTrack={hasTrack}
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

      <div
        className="w-1/3 flex items-center space-x-4 pr-4"
        onClick={(event) => event.stopPropagation()}
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
            onToggleFavorite={toggleCurrentFavorite}
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
        hasTrack={hasTrack}
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
        hasTrack={hasTrack}
        completionLabel={mvp49Player.completionLabel}
        completionHint={mvp49Player.completionHint}
        canToggleCompletion={canToggleCompletion}
        onToggleCompletion={() => toggleCompletionMode?.()}
        currentTrack={currentTrack}
        playlists={playlists}
        isPlaylistMenuOpen={isPlaylistMenuOpen}
        onTogglePlaylist={togglePlaylistMenu}
        onClosePlaylist={closePlaylistMenu}
        onSelectPlaylist={selectPlaylist}
        isFloatingLyricsVisible={isFloatingLyricsVisible}
        onToggleFloatingLyrics={toggleFloatingLyrics}
        isMuted={isMuted}
        isVolumePopoverVisible={isVolumePopoverVisible}
        visibleVolume={visibleVolume}
        visibleVolumePercent={visibleVolumePercent}
        onToggleMute={toggleMute}
        onVolumeMouseEnter={handleVolumeMouseEnter}
        onVolumeMouseLeave={handleVolumeMouseLeave}
        onVolumeChange={handleVolumeSlide}
        onMoreActions={showMoreActions}
      />

      <PlayerCompatibilityMarkers
        betaChips={mvp59PlayerBeta.chips}
        hiddenMaintenanceNote={mvp79PlayerUi.hiddenMaintenanceNote}
      />

      {isFloatingLyricsVisible && currentTrack && (
        <PlayerFloatingLyrics text={activeLyric} onClose={closeFloatingLyrics} />
      )}

      {playerToastMessage && <PlayerToast message={playerToastMessage} />}
    </div>
  );
}
