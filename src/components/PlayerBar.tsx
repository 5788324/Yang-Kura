import type { ChangeEvent } from 'react';
import type { PlayerState, AudioTrack, Playlist } from '../types';
import { useFloatingLyricText } from '../hooks/useFloatingLyricText';
import { usePlayerBarActions } from '../hooks/usePlayerBarActions';
import { usePlayerSeekInteraction } from '../hooks/usePlayerSeekInteraction';
import { useDelayedVisibility } from '../hooks/usePlayerTransientUi';
import { formatPlayerTime } from '../player/playerBarMath';
import { createPlayerBarPresentationModel } from '../player/playerBarPresentationModel';
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
  const { currentTrack, progress } = playerState;
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
  const presentation = createPlayerBarPresentationModel({
    playerState,
    displayProgress: currentDisplayProgress,
    duration: totalDuration,
  });

  const handleVolumeSlide = (event: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number.parseFloat(event.target.value));
  };

  return (
    <div
      id="app-player-bar"
      className="h-20 bg-zinc-950 border-t border-zinc-800/80 px-8 flex items-center justify-between select-none relative z-50 text-white"
      data-mvp79-player-ui-bugfix="true"
    >
      <PlayerProgressTrack
        hasTrack={presentation.hasTrack}
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
            isLiked={isLiked}
            {...presentation.trackSummary}
            onOpenLyrics={toggleLyrics}
            onToggleFavorite={toggleCurrentFavorite}
          />
        ) : (
          <PlayerEmptyState {...presentation.emptyState} />
        )}
      </div>

      <PlayerTransportControls
        {...presentation.transport}
        isQueueOpen={isQueueOpen}
        onToggleLoopMode={toggleLoopMode}
        onPrevious={onPrev}
        onTogglePlay={togglePlay}
        onNext={onNext}
        onToggleQueue={toggleQueue}
      />

      <PlayerAuxiliaryControls
        {...presentation.auxiliary}
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
        isVolumePopoverVisible={isVolumePopoverVisible}
        onToggleMute={toggleMute}
        onVolumeMouseEnter={handleVolumeMouseEnter}
        onVolumeMouseLeave={handleVolumeMouseLeave}
        onVolumeChange={handleVolumeSlide}
        onMoreActions={showMoreActions}
      />

      <PlayerCompatibilityMarkers {...presentation.compatibility} />

      {isFloatingLyricsVisible && currentTrack && (
        <PlayerFloatingLyrics text={activeLyric} onClose={closeFloatingLyrics} />
      )}

      {playerToastMessage && <PlayerToast message={playerToastMessage} />}
    </div>
  );
}
