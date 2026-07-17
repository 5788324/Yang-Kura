import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlayerState, AudioTrack } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import {
  activateQueueTarget,
  appendTrackToQueue,
  resolveAdjacentQueueTarget,
  startTrackQueue,
} from '../player/playerQueueTransitions';
import { restorePlayerSessionState, usePlayerSessionPersistence } from './usePlayerSessionPersistence';
import { usePlayerBackend } from './usePlayerBackend';
import { usePlayerSubtitles } from './usePlayerSubtitles';
import {
  clampPlaybackPosition,
  isLocalTrackAwaitingAuthorization,
  isTokenizedLocalTrack,
  reconcilePlayerStateWithLibrary,
} from '../player/playerRuntimePolicy';

export function useAudioPlayer() {
  const restoredQueueState = restorePlayerSessionState();
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 0.75,
    queue: [],
    currentIndex: -1,
    isMuted: false,
    loopMode: 'all',
    playCompletionMode: 'continue-queue',
    playbackMode: 'idle',
    playbackError: null,
    playbackNotice: null,
    resolvedMediaUrl: null,
    ...restoredQueueState,
  });

  const stateRef = useRef(playerState);
  stateRef.current = playerState;

  const {
    getResumeProgress,
    recordTrackCompleted,
    recordTrackStarted,
  } = usePlayerSessionPersistence(playerState);

  const handleNextTrackRef = useRef<() => void>(() => {});
  const handleAutoTrackEndedRef = useRef<() => void>(() => {});
  const backend = usePlayerBackend({
    playerState,
    setPlayerState,
    initialPendingSeek: restoredQueueState?.currentTrack
      ? {
          trackId: restoredQueueState.currentTrack.id,
          progress: restoredQueueState.progress,
        }
      : null,
    onEnded: () => handleAutoTrackEndedRef.current(),
  });

  const handleNextTrack = useCallback(() => {
    setPlayerState((previous) => {
      const target = resolveAdjacentQueueTarget(previous, 'next');
      if (!target) return previous;
      const resumeProgress = getResumeProgress(target.track);
      backend.prepareInitialSeek(target.track.id, resumeProgress);
      return activateQueueTarget(
        previous,
        target,
        resumeProgress,
        isTokenizedLocalTrack(target.track) ? 'resolving-local-media' : 'mock-simulated',
      );
    });
  }, [backend.prepareInitialSeek, getResumeProgress]);

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  useEffect(() => {
    handleAutoTrackEndedRef.current = () => {
      const current = stateRef.current;
      if (current.currentTrack) {
        recordTrackCompleted(
          current.currentTrack,
          current.currentTrack.duration || current.progress,
          current.currentTrack.duration,
        );
      }

      if (current.loopMode === 'one') {
        backend.restartCurrentTrack();
        return;
      }

      if (playerExperienceService.shouldStopAtTrackEnd(current)) {
        backend.pauseHtmlAudio();
        setPlayerState((previous) => ({
          ...previous,
          isPlaying: false,
          progress: previous.currentTrack?.duration ?? previous.progress,
          playbackError: null,
        }));
        return;
      }

      handleNextTrackRef.current();
    };
  }, [backend.pauseHtmlAudio, backend.restartCurrentTrack, recordTrackCompleted]);

  const handlePrevTrack = useCallback(() => {
    setPlayerState((previous) => {
      const target = resolveAdjacentQueueTarget(previous, 'previous');
      if (!target) return previous;
      const resumeProgress = getResumeProgress(target.track);
      backend.prepareInitialSeek(target.track.id, resumeProgress);
      return activateQueueTarget(
        previous,
        target,
        resumeProgress,
        isTokenizedLocalTrack(target.track) ? 'resolving-local-media' : 'mock-simulated',
      );
    });
  }, [backend.prepareInitialSeek, getResumeProgress]);

  const handlePlayTrack = useCallback((track: AudioTrack, customQueue?: AudioTrack[]) => {
    const resumeProgress = getResumeProgress(track);
    backend.prepareInitialSeek(track.id, resumeProgress);
    recordTrackStarted(track, resumeProgress);
    setPlayerState((previous) => startTrackQueue(
      previous,
      track,
      customQueue,
      resumeProgress,
      isTokenizedLocalTrack(track) ? 'resolving-local-media' : 'mock-simulated',
    ));
  }, [backend.prepareInitialSeek, getResumeProgress, recordTrackStarted]);

  const handleAddToQueue = useCallback((track: AudioTrack) => {
    setPlayerState((previous) => appendTrackToQueue(previous, track));
  }, []);

  const handleTogglePlay = useCallback(() => {
    setPlayerState((previous) => {
      if (!previous.currentTrack) return previous;
      const willPlay = !previous.isPlaying;
      if (willPlay && isLocalTrackAwaitingAuthorization(previous.currentTrack)) {
        return {
          ...previous,
          isPlaying: false,
          playbackMode: 'idle',
          playbackError: '当前音轨需要重新授权资源库并读取 Index 后才能播放。',
          playbackNotice: null,
        };
      }
      if (willPlay && previous.playbackMode === 'idle') {
        backend.prepareInitialSeek(
          previous.currentTrack.id,
          clampPlaybackPosition(previous.progress, previous.currentTrack.duration),
        );
      }
      const nextPlaybackMode = willPlay && previous.playbackMode === 'idle'
        ? (isTokenizedLocalTrack(previous.currentTrack) ? 'resolving-local-media' : 'mock-simulated')
        : previous.playbackMode;
      return {
        ...previous,
        isPlaying: willPlay,
        playbackMode: nextPlaybackMode,
        playbackError: null,
      };
    });
  }, [backend.prepareInitialSeek]);

  const handleVolumeChange = useCallback((volume: number) => {
    const normalized = Math.max(0, Math.min(1, volume));
    setPlayerState((previous) => ({
      ...previous,
      volume: normalized,
      isMuted: normalized === 0,
    }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setPlayerState((previous) => ({ ...previous, isMuted: !previous.isMuted }));
  }, []);

  const handleToggleLoopMode = useCallback(() => {
    setPlayerState((previous) => {
      let nextMode: 'all' | 'one' | 'shuffle' = 'all';
      if (previous.loopMode === 'all') nextMode = 'one';
      else if (previous.loopMode === 'one') nextMode = 'shuffle';
      return { ...previous, loopMode: nextMode };
    });
  }, []);

  const handleToggleCompletionMode = useCallback(() => {
    setPlayerState((previous) => ({
      ...previous,
      playCompletionMode: playerExperienceService.getNextCompletionMode(previous.playCompletionMode),
    }));
  }, []);

  usePlayerSubtitles({
    currentTrack: playerState.currentTrack,
    setPlayerState,
  });

  const handleReconcileQueueWithLibrary = useCallback((currentLibraryTracks: AudioTrack[]) => {
    setPlayerState((previous) => {
      const next = reconcilePlayerStateWithLibrary(previous, currentLibraryTracks);
      if (next.currentTrack && next.currentTrack !== previous.currentTrack && next.progress > 0) {
        backend.prepareInitialSeek(next.currentTrack.id, next.progress);
      }
      return next;
    });
  }, [backend.prepareInitialSeek]);

  return {
    playerState,
    setPlayerState,
    handlePlayTrack,
    handleAddToQueue,
    handleTogglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleSeek: backend.seek,
    handleVolumeChange,
    handleToggleMute,
    handleToggleLoopMode,
    handleToggleCompletionMode,
    handleReconcileQueueWithLibrary,
  };
}
