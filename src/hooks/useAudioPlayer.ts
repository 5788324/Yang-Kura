import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, AudioTrack } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import { playerQueuePersistenceService } from '../services/playerQueuePersistenceService';
import { playbackHistoryService } from '../services/playbackHistoryService';

function isTokenizedLocalTrack(track: AudioTrack | null | undefined): track is AudioTrack & { rootPathToken: string; sourceRelativePath: string } {
  return Boolean(track?.rootPathToken && track?.sourceRelativePath && track.playbackSourceKind === 'tokenized-local-file');
}

function safeDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function useAudioPlayer() {
  const restoredQueueState = playerQueuePersistenceService.getInitialPlayerState();
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
    resolvedMediaUrl: null,
    ...restoredQueueState,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingInitialSeekRef = useRef<{ trackId: string; progress: number } | null>(null);
  const lastHistorySaveRef = useRef<{ trackId: string; progress: number; savedAt: number } | null>(null);
  const lastQueueSaveRef = useRef<{ signature: string; progress: number; savedAt: number } | null>(null);
  const stateRef = useRef(playerState);
  stateRef.current = playerState;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setPlayerState((prev) => {
        if (prev.playbackMode !== 'html-audio') return prev;
        return { ...prev, progress: audio.currentTime || 0 };
      });
    };

    const handleLoadedMetadata = () => {
      setPlayerState((prev) => {
        if (!prev.currentTrack || prev.playbackMode !== 'html-audio') return prev;
        const duration = safeDuration(audio.duration);
        if (!duration) return prev;
        const updatedTrack = { ...prev.currentTrack, duration };
        const updatedQueue = prev.queue.map((track) => (track.id === updatedTrack.id ? { ...track, duration } : track));
        return { ...prev, currentTrack: updatedTrack, queue: updatedQueue };
      });
    };

    const handleEnded = () => {
      handleAutoTrackEndedRef.current(audio);
    };

    const handleError = () => {
      const message = audio.error ? `HTMLAudio 播放失败：${audio.error.message || `错误码 ${audio.error.code}`}` : 'HTMLAudio 播放失败。';
      setPlayerState((prev) => ({ ...prev, isPlaying: false, playbackError: message, playbackMode: 'unsupported-local-media' }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  const handleNextTrackRef = useRef<() => void>(() => {});
  const handleAutoTrackEndedRef = useRef<(audio?: HTMLAudioElement) => void>(() => {});

  const handleNextTrack = useCallback(() => {
    setPlayerState(prev => {
      if (prev.queue.length === 0) return prev;

      let nextIndex = prev.currentIndex + 1;
      if (prev.loopMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      } else if (nextIndex >= prev.queue.length) {
        nextIndex = 0;
      }

      const nextTrack = prev.queue[nextIndex];
      const resumeProgress = playbackHistoryService.getResumeProgress(nextTrack.id, nextTrack.duration);
      pendingInitialSeekRef.current = { trackId: nextTrack.id, progress: resumeProgress };
      return {
        ...prev,
        currentIndex: nextIndex,
        currentTrack: nextTrack,
        progress: resumeProgress,
        isPlaying: true,
        playbackMode: isTokenizedLocalTrack(nextTrack) ? 'resolving-local-media' : 'mock-simulated',
        playbackError: null,
        resolvedMediaUrl: null,
      };
    });
  }, []);

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  useEffect(() => {
    handleAutoTrackEndedRef.current = (audio?: HTMLAudioElement) => {
      const current = stateRef.current;
      if (current.currentTrack) {
        playbackHistoryService.saveProgress(
          current.currentTrack,
          current.currentTrack.duration || current.progress,
          current.currentTrack.duration,
        );
      }

      if (current.loopMode === 'one') {
        if (audio) {
          audio.currentTime = 0;
          void audio.play().catch((error) => {
            setPlayerState((prev) => ({
              ...prev,
              isPlaying: false,
              playbackError: error instanceof Error ? error.message : String(error),
            }));
          });
        } else {
          setPlayerState((prev) => ({ ...prev, progress: 0 }));
        }
        return;
      }

      if (playerExperienceService.shouldStopAtTrackEnd(current)) {
        if (audio) audio.pause();
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          progress: prev.currentTrack?.duration ?? prev.progress,
          playbackError: null,
        }));
        return;
      }

      handleNextTrackRef.current();
    };
  }, []);

  const handlePrevTrack = useCallback(() => {
    setPlayerState(prev => {
      if (prev.queue.length === 0) return prev;

      let prevIndex = prev.currentIndex - 1;
      if (prev.loopMode === 'shuffle') {
        prevIndex = Math.floor(Math.random() * prev.queue.length);
      } else if (prevIndex < 0) {
        prevIndex = prev.queue.length - 1;
      }

      const prevTrack = prev.queue[prevIndex];
      const resumeProgress = playbackHistoryService.getResumeProgress(prevTrack.id, prevTrack.duration);
      pendingInitialSeekRef.current = { trackId: prevTrack.id, progress: resumeProgress };
      return {
        ...prev,
        currentIndex: prevIndex,
        currentTrack: prevTrack,
        progress: resumeProgress,
        isPlaying: true,
        playbackMode: isTokenizedLocalTrack(prevTrack) ? 'resolving-local-media' : 'mock-simulated',
        playbackError: null,
        resolvedMediaUrl: null,
      };
    });
  }, []);

  const handlePlayTrack = useCallback((track: AudioTrack, customQueue?: AudioTrack[]) => {
    const playQueue = customQueue && customQueue.length > 0 ? customQueue : [track];
    const idx = playQueue.findIndex(t => t.id === track.id);

    if (track.rjId) {
      localStorage.setItem(`asmr_last_played_${track.rjId}`, Date.now().toString());
    }

    const resumeProgress = playbackHistoryService.getResumeProgress(track.id, track.duration);
    pendingInitialSeekRef.current = { trackId: track.id, progress: resumeProgress };
    playbackHistoryService.saveProgress(track, resumeProgress, track.duration);

    setPlayerState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: resumeProgress,
      queue: playQueue,
      currentIndex: idx >= 0 ? idx : 0,
      playbackMode: isTokenizedLocalTrack(track) ? 'resolving-local-media' : 'mock-simulated',
      playbackError: null,
      resolvedMediaUrl: null,
    }));
  }, []);

  const handleAddToQueue = useCallback((track: AudioTrack) => {
    setPlayerState(prev => {
      const isAlreadyInQueue = prev.queue.some(t => t.id === track.id);
      const updatedQueue = isAlreadyInQueue ? prev.queue : [...prev.queue, track];
      return {
        ...prev,
        queue: updatedQueue,
        currentIndex: prev.currentIndex === -1 ? 0 : prev.currentIndex,
        currentTrack: prev.currentTrack ? prev.currentTrack : track,
      };
    });
  }, []);

  const handleTogglePlay = useCallback(() => {
    setPlayerState(prev => {
      if (!prev.currentTrack) return prev;
      const willPlay = !prev.isPlaying;
      const nextPlaybackMode = willPlay && prev.playbackMode === 'idle'
        ? (isTokenizedLocalTrack(prev.currentTrack) ? 'resolving-local-media' : 'mock-simulated')
        : prev.playbackMode;
      return { ...prev, isPlaying: willPlay, playbackMode: nextPlaybackMode, playbackError: null };
    });
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio && stateRef.current.playbackMode === 'html-audio') {
      audio.currentTime = Math.max(0, seconds);
    }
    setPlayerState(prev => ({ ...prev, progress: Math.max(0, seconds) }));
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    const normalized = Math.max(0, Math.min(1, vol));
    setPlayerState(prev => ({ ...prev, volume: normalized, isMuted: normalized === 0 }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleToggleLoopMode = useCallback(() => {
    setPlayerState(prev => {
      let nextMode: 'all' | 'one' | 'shuffle' = 'all';
      if (prev.loopMode === 'all') nextMode = 'one';
      else if (prev.loopMode === 'one') nextMode = 'shuffle';
      return { ...prev, loopMode: nextMode };
    });
  }, []);

  const handleToggleCompletionMode = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      playCompletionMode: playerExperienceService.getNextCompletionMode(prev.playCompletionMode),
    }));
  }, []);

  const setPlayerProgress = useCallback((seconds: number) => {
    setPlayerState(prev => ({ ...prev, progress: seconds }));
  }, []);

  const currentTrack = playerState.currentTrack;
  const currentTrackId = currentTrack?.id;
  const currentTrackRootToken = currentTrack?.rootPathToken;
  const currentTrackRelativePath = currentTrack?.sourceRelativePath;

  useEffect(() => {
    let cancelled = false;
    const audio = audioRef.current;

    if (!currentTrack) {
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
      return;
    }

    if (!isTokenizedLocalTrack(currentTrack)) {
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
      setPlayerState((prev) => ({
        ...prev,
        playbackMode: prev.isPlaying ? 'mock-simulated' : 'idle',
        resolvedMediaUrl: null,
        playbackError: null,
      }));
      return;
    }

    if (playerState.playbackMode === 'html-audio' && playerState.resolvedMediaUrl) {
      return;
    }

    if (!playerState.isPlaying && playerState.playbackMode === 'idle') {
      return;
    }

    if (!window.yangKura?.requestResolveTrackMediaUrl) {
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        playbackMode: 'unsupported-local-media',
        playbackError: '当前不在 Electron 运行环境，无法解析本地音频。请使用 npm run desktop:dev。',
        resolvedMediaUrl: null,
      }));
      return;
    }

    setPlayerState((prev) => ({ ...prev, playbackMode: 'resolving-local-media', playbackError: null, resolvedMediaUrl: null }));

    window.yangKura.requestResolveTrackMediaUrl({
      rootPathToken: currentTrack.rootPathToken,
      relativePath: currentTrack.sourceRelativePath,
      trackId: currentTrack.id,
      expectedKind: 'audio',
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          playbackMode: 'unsupported-local-media',
          playbackError: result.message,
          resolvedMediaUrl: null,
        }));
        return;
      }

      if (!audioRef.current) return;
      audioRef.current.src = result.mediaUrl;
      const initialSeek = pendingInitialSeekRef.current?.trackId === currentTrack.id ? pendingInitialSeekRef.current.progress : 0;
      audioRef.current.currentTime = Math.max(0, initialSeek);
      audioRef.current.volume = stateRef.current.volume;
      audioRef.current.muted = stateRef.current.isMuted;
      audioRef.current.load();

      setPlayerState((prev) => ({
        ...prev,
        playbackMode: 'html-audio',
        playbackError: null,
        resolvedMediaUrl: result.mediaUrl,
        currentTrack: prev.currentTrack ? { ...prev.currentTrack, mediaUrl: result.mediaUrl } : prev.currentTrack,
      }));

      if (stateRef.current.isPlaying) {
        void audioRef.current.play().catch((error) => {
          setPlayerState((prev) => ({
            ...prev,
            isPlaying: false,
            playbackMode: 'unsupported-local-media',
            playbackError: error instanceof Error ? error.message : String(error),
          }));
        });
      }
    }).catch((error) => {
      if (cancelled) return;
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        playbackMode: 'unsupported-local-media',
        playbackError: error instanceof Error ? error.message : String(error),
        resolvedMediaUrl: null,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrackId, currentTrackRootToken, currentTrackRelativePath, playerState.isPlaying, playerState.playbackMode, playerState.resolvedMediaUrl]);


  useEffect(() => {
    let cancelled = false;

    if (!currentTrack || !isTokenizedLocalTrack(currentTrack)) return;

    if (!window.yangKura?.requestReadTrackLyrics) {
      setPlayerState((prev) => {
        if (!prev.currentTrack || prev.currentTrack.id !== currentTrack.id) return prev;
        return {
          ...prev,
          currentTrack: {
            ...prev.currentTrack,
            lyricsLoadStatus: 'error',
            lyricsLoadError: '当前 Electron preload 未暴露字幕读取接口。',
          },
        };
      });
      return;
    }

    setPlayerState((prev) => {
      if (!prev.currentTrack || prev.currentTrack.id !== currentTrack.id) return prev;
      const updatedTrack = {
        ...prev.currentTrack,
        lyricsLoadStatus: 'loading' as const,
        lyricsLoadError: undefined,
      };
      return {
        ...prev,
        currentTrack: updatedTrack,
        queue: prev.queue.map((track) => (track.id === updatedTrack.id ? { ...track, ...updatedTrack } : track)),
      };
    });

    window.yangKura.requestReadTrackLyrics({
      rootPathToken: currentTrack.rootPathToken,
      trackId: currentTrack.id,
      trackRelativePath: currentTrack.sourceRelativePath,
      mode: 'read-track-lyrics',
      subtitleRelativePaths: currentTrack.subtitleRelativePaths ?? [],
    }).then((result) => {
      if (cancelled) return;
      setPlayerState((prev) => {
        if (!prev.currentTrack || prev.currentTrack.id !== currentTrack.id) return prev;
        const updatedTrack = result.ok
          ? {
              ...prev.currentTrack,
              lyrics: result.normalizedLrcLines.length > 0 ? result.normalizedLrcLines : undefined,
              lyricsSourceKind: 'local-file' as const,
              lyricsRelativePath: result.subtitleRelativePath,
              lyricsLoadStatus: result.normalizedLrcLines.length > 0 ? ('loaded' as const) : ('missing' as const),
              lyricsLoadError: result.normalizedLrcLines.length > 0 ? undefined : result.message,
            }
          : {
              ...prev.currentTrack,
              lyricsLoadStatus: result.status === 'mvp26-track-lyrics-missing-file' ? ('missing' as const) : ('error' as const),
              lyricsLoadError: result.message,
            };
        return {
          ...prev,
          currentTrack: updatedTrack,
          queue: prev.queue.map((track) => (track.id === updatedTrack.id ? { ...track, ...updatedTrack } : track)),
        };
      });
    }).catch((error) => {
      if (cancelled) return;
      setPlayerState((prev) => {
        if (!prev.currentTrack || prev.currentTrack.id !== currentTrack.id) return prev;
        const updatedTrack = {
          ...prev.currentTrack,
          lyricsLoadStatus: 'error' as const,
          lyricsLoadError: error instanceof Error ? error.message : String(error),
        };
        return {
          ...prev,
          currentTrack: updatedTrack,
          queue: prev.queue.map((track) => (track.id === updatedTrack.id ? { ...track, ...updatedTrack } : track)),
        };
      });
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrackId, currentTrackRootToken, currentTrackRelativePath]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playerState.playbackMode !== 'html-audio') return;
    audio.volume = playerState.volume;
    audio.muted = playerState.isMuted;
  }, [playerState.volume, playerState.isMuted, playerState.playbackMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playerState.playbackMode !== 'html-audio') return;

    if (playerState.isPlaying) {
      void audio.play().catch((error) => {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          playbackMode: 'unsupported-local-media',
          playbackError: error instanceof Error ? error.message : String(error),
        }));
      });
    } else {
      audio.pause();
    }
  }, [playerState.isPlaying, playerState.playbackMode, playerState.resolvedMediaUrl]);

  // Simulated fallback progress for mock data and browser preview mode.
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (playerState.isPlaying && playerState.currentTrack && playerState.playbackMode === 'mock-simulated') {
      timer = setInterval(() => {
        setPlayerState(prev => {
          if (!prev.currentTrack || !prev.isPlaying || prev.playbackMode !== 'mock-simulated') return prev;
          const duration = safeDuration(prev.currentTrack.duration);
          const nextProgress = prev.progress + 1;

          if (duration > 0 && nextProgress >= duration) {
            return { ...prev, progress: duration };
          }
          return { ...prev, progress: nextProgress };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playerState.isPlaying, playerState.currentTrack?.id, playerState.playbackMode]);

  const progress = playerState.progress;
  const isPlaying = playerState.isPlaying;
  const currentTrackDuration = playerState.currentTrack?.duration;
  const currentTrackIsRealAudio = isTokenizedLocalTrack(playerState.currentTrack);

  useEffect(() => {
    if (
      !currentTrackIsRealAudio &&
      isPlaying &&
      currentTrackId &&
      currentTrackDuration &&
      progress >= currentTrackDuration
    ) {
      handleAutoTrackEndedRef.current();
    }
  }, [isPlaying, progress, currentTrackId, currentTrackDuration, currentTrackIsRealAudio, playerState.loopMode]);

  useEffect(() => {
    if (playerState.currentTrack) {
      localStorage.setItem('last_played_track_id', playerState.currentTrack.id);
      localStorage.setItem('last_played_progress', playerState.progress.toString());
      localStorage.setItem('last_played_track_json', JSON.stringify(playerState.currentTrack));
    }
  }, [playerState.currentTrack?.id, playerState.progress]);

  useEffect(() => {
    const now = Date.now();
    if (playerState.queue.length === 0) {
      if (lastQueueSaveRef.current) {
        playerQueuePersistenceService.clear();
        lastQueueSaveRef.current = null;
      }
      return;
    }

    const signature = playerQueuePersistenceService.getSaveSignature(playerState);
    const progress = Math.max(0, playerState.progress || 0);
    const lastSaved = lastQueueSaveRef.current;
    const shouldSave =
      !lastSaved ||
      lastSaved.signature !== signature ||
      Math.abs(progress - lastSaved.progress) >= 5 ||
      now - lastSaved.savedAt >= 5000 ||
      !playerState.isPlaying;

    if (!shouldSave) return;
    playerQueuePersistenceService.saveFromPlayerState(playerState);
    lastQueueSaveRef.current = { signature, progress, savedAt: now };
  }, [
    playerState.queue,
    playerState.currentTrack?.id,
    playerState.currentIndex,
    playerState.progress,
    playerState.volume,
    playerState.isMuted,
    playerState.loopMode,
    playerState.playCompletionMode,
    playerState.isPlaying,
  ]);


  useEffect(() => {
    const track = playerState.currentTrack;
    if (!track) return;
    const now = Date.now();
    const lastSaved = lastHistorySaveRef.current;
    const progress = Math.max(0, playerState.progress || 0);
    const shouldSave =
      !lastSaved ||
      lastSaved.trackId !== track.id ||
      Math.abs(progress - lastSaved.progress) >= 5 ||
      now - lastSaved.savedAt >= 5000 ||
      !playerState.isPlaying;
    if (!shouldSave) return;
    playbackHistoryService.saveProgress(track, progress, track.duration);
    lastHistorySaveRef.current = { trackId: track.id, progress, savedAt: now };
  }, [playerState.currentTrack?.id, playerState.progress, playerState.isPlaying, playerState.currentTrack?.duration]);

  return {
    playerState,
    setPlayerState,
    handlePlayTrack,
    handleAddToQueue,
    handleTogglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleSeek,
    handleVolumeChange,
    handleToggleMute,
    handleToggleLoopMode,
    handleToggleCompletionMode,
  };
}
