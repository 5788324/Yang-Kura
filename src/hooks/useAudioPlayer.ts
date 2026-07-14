import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, AudioTrack } from '../types';
import { playerExperienceService } from '../services/playerExperienceService';
import { playerQueuePersistenceService } from '../services/playerQueuePersistenceService';
import { playbackHistoryService } from '../services/playbackHistoryService';
import { mpvPlaybackPreferenceService, type MpvPlaybackPreference } from '../services/mpvPlaybackPreferenceService';
import {
  clampPlaybackPosition,
  isLocalTrackAwaitingAuthorization,
  reconcilePlayerStateWithLibrary,
  resolvePlaybackStart,
} from '../player/playerRuntimePolicy';

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
    playbackNotice: null,
    resolvedMediaUrl: null,
    ...restoredQueueState,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mpvPreferenceRef = useRef<MpvPlaybackPreference>(mpvPlaybackPreferenceService.getPreference());
  const forceHtmlFallbackTrackRef = useRef<{ trackId: string; reason: string } | null>(null);
  const pendingInitialSeekRef = useRef<{ trackId: string; progress: number } | null>(
    restoredQueueState?.currentTrack
      ? { trackId: restoredQueueState.currentTrack.id, progress: restoredQueueState.progress }
      : null,
  );
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
      const current = stateRef.current.currentTrack;
      if (current) {
        const target = resolvePlaybackStart(current, pendingInitialSeekRef.current, stateRef.current.progress);
        if (target > 0 && Math.abs(audio.currentTime - target) > 0.1) audio.currentTime = target;
        if (pendingInitialSeekRef.current?.trackId === current.id) pendingInitialSeekRef.current = null;
      }
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


  useEffect(() => {
    const handlePreferenceChanged = (event: Event) => {
      const custom = event as CustomEvent<MpvPlaybackPreference>;
      mpvPreferenceRef.current = custom.detail ?? mpvPlaybackPreferenceService.getPreference();
    };
    window.addEventListener(mpvPlaybackPreferenceService.updateEventName, handlePreferenceChanged);
    return () => window.removeEventListener(mpvPlaybackPreferenceService.updateEventName, handlePreferenceChanged);
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
        playbackNotice: null,
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
        if (current.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
          void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'seek', seconds: 0 });
          void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'resume' });
          setPlayerState((prev) => ({ ...prev, progress: 0, isPlaying: true }));
        } else if (audio) {
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
        playbackNotice: null,
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
      playbackNotice: null,
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
      if (willPlay && isLocalTrackAwaitingAuthorization(prev.currentTrack)) {
        return {
          ...prev,
          isPlaying: false,
          playbackMode: 'idle',
          playbackError: '当前音轨需要重新授权资源库并读取 Index 后才能播放。',
          playbackNotice: null,
        };
      }
      if (willPlay && prev.playbackMode === 'idle') {
        pendingInitialSeekRef.current = {
          trackId: prev.currentTrack.id,
          progress: clampPlaybackPosition(prev.progress, prev.currentTrack.duration),
        };
      }
      const nextPlaybackMode = willPlay && prev.playbackMode === 'idle'
        ? (isTokenizedLocalTrack(prev.currentTrack) ? 'resolving-local-media' : 'mock-simulated')
        : prev.playbackMode;
      return { ...prev, isPlaying: willPlay, playbackMode: nextPlaybackMode, playbackError: null };
    });
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    const normalized = clampPlaybackPosition(seconds, stateRef.current.currentTrack?.duration);
    const audio = audioRef.current;
    if (stateRef.current.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
      void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'seek', seconds: normalized });
    } else if (audio && stateRef.current.playbackMode === 'html-audio') {
      audio.currentTime = normalized;
    }
    setPlayerState(prev => ({ ...prev, progress: normalized }));
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
    if (!window.yangKura?.onMpvPlaybackEvent) return;
    return window.yangKura.onMpvPlaybackEvent((event) => {
      const current = stateRef.current.currentTrack;
      if (!current || event.trackId !== current.id) return;

      if (event.type === 'ready') {
        forceHtmlFallbackTrackRef.current = null;
        setPlayerState((prev) => ({ ...prev, playbackMode: 'mpv', playbackError: null, playbackNotice: null, resolvedMediaUrl: null }));
      } else if (event.type === 'time') {
        setPlayerState((prev) => prev.playbackMode === 'mpv' ? { ...prev, progress: Math.max(0, event.positionSeconds) } : prev);
      } else if (event.type === 'duration') {
        setPlayerState((prev) => {
          if (!prev.currentTrack || prev.currentTrack.id !== event.trackId) return prev;
          const duration = safeDuration(event.durationSeconds);
          if (!duration) return prev;
          const updatedTrack = { ...prev.currentTrack, duration };
          return {
            ...prev,
            currentTrack: updatedTrack,
            queue: prev.queue.map((track) => track.id === updatedTrack.id ? { ...track, duration } : track),
          };
        });
      } else if (event.type === 'pause-state') {
        setPlayerState((prev) => prev.playbackMode === 'mpv' ? { ...prev, isPlaying: !event.paused } : prev);
      } else if (event.type === 'ended') {
        handleAutoTrackEndedRef.current();
      } else if (event.type === 'fallback-requested') {
        forceHtmlFallbackTrackRef.current = { trackId: event.trackId, reason: event.reason };
        pendingInitialSeekRef.current = { trackId: event.trackId, progress: Math.max(0, event.resumeSeconds) };
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: true,
          progress: Math.max(0, event.resumeSeconds),
          playbackMode: 'resolving-local-media',
          playbackError: null,
          playbackNotice: `${event.message} 正在从上次位置切换到 HTMLAudio。`,
          resolvedMediaUrl: null,
        }));
      } else if (event.type === 'error') {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          playbackMode: 'unsupported-local-media',
          playbackError: event.message,
        }));
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const audio = audioRef.current;

    const clearHtmlAudio = () => {
      if (!audio) return;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };

    const startHtmlAudioFallback = async (mpvMessage?: string) => {
      if (!window.yangKura?.requestResolveTrackMediaUrl || !currentTrack || !isTokenizedLocalTrack(currentTrack)) {
        throw new Error(mpvMessage || '当前 Electron preload 未提供本地音频解析接口。');
      }
      const result = await window.yangKura.requestResolveTrackMediaUrl({
        rootPathToken: currentTrack.rootPathToken,
        relativePath: currentTrack.sourceRelativePath,
        trackId: currentTrack.id,
        expectedKind: 'audio',
      });
      if (!result.ok) throw new Error([mpvMessage, result.message].filter(Boolean).join('；'));
      if (cancelled || !audioRef.current) return;

      audioRef.current.src = result.mediaUrl;
      audioRef.current.volume = stateRef.current.volume;
      audioRef.current.muted = stateRef.current.isMuted;
      const initialSeek = resolvePlaybackStart(currentTrack, pendingInitialSeekRef.current, stateRef.current.progress);
      audioRef.current.load();
      if (audioRef.current.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          const target = audioRef.current;
          if (!target) return reject(new Error('HTMLAudio 实例已释放。'));
          const cleanup = () => {
            target.removeEventListener('loadedmetadata', handleReady);
            target.removeEventListener('error', handleFailure);
          };
          const handleReady = () => { cleanup(); resolve(); };
          const handleFailure = () => { cleanup(); reject(new Error('HTMLAudio 无法读取音频元数据。')); };
          target.addEventListener('loadedmetadata', handleReady, { once: true });
          target.addEventListener('error', handleFailure, { once: true });
        });
      }
      if (cancelled || !audioRef.current) return;
      audioRef.current.currentTime = initialSeek;
      if (pendingInitialSeekRef.current?.trackId === currentTrack.id) pendingInitialSeekRef.current = null;
      setPlayerState((prev) => ({
        ...prev,
        playbackMode: 'html-audio',
        playbackError: null,
        playbackNotice: mpvMessage ? (mpvMessage.startsWith('已按设置') ? mpvMessage : `mpv 不可用，已切换 HTMLAudio：${mpvMessage}`) : prev.playbackNotice,
        resolvedMediaUrl: result.mediaUrl,
        currentTrack: prev.currentTrack ? { ...prev.currentTrack, mediaUrl: result.mediaUrl } : prev.currentTrack,
      }));
      if (stateRef.current.isPlaying) {
        await audioRef.current.play();
      }
    };

    if (!currentTrack) {
      clearHtmlAudio();
      if (window.yangKura?.requestMpvPlaybackCommand) {
        void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'stop' });
      }
      return;
    }

    if (!isTokenizedLocalTrack(currentTrack)) {
      clearHtmlAudio();
      if (window.yangKura?.requestMpvPlaybackCommand) {
        void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'stop' });
      }
      setPlayerState((prev) => ({
        ...prev,
        playbackMode: prev.isPlaying ? 'mock-simulated' : 'idle',
        resolvedMediaUrl: null,
        playbackError: null,
        playbackNotice: null,
      }));
      return;
    }

    if (!playerState.isPlaying || playerState.playbackMode === 'mpv' || playerState.playbackMode === 'html-audio') return;

    const start = async () => {
      setPlayerState((prev) => ({ ...prev, playbackMode: 'resolving-local-media', playbackError: null, resolvedMediaUrl: null }));
      let mpvFailureMessage: string | undefined;
      const forcedHtmlFallback = forceHtmlFallbackTrackRef.current?.trackId === currentTrack.id;
      const shouldAttemptMpv = mpvPlaybackPreferenceService.shouldAttemptMpv(mpvPreferenceRef.current) && !forcedHtmlFallback;
      if (shouldAttemptMpv && window.yangKura?.requestMpvPlaybackStart) {
        try {
          const mpvResult = await window.yangKura.requestMpvPlaybackStart({
            rootPathToken: currentTrack.rootPathToken,
            relativePath: currentTrack.sourceRelativePath,
            trackId: currentTrack.id,
            mode: 'mpv-playback-start',
            startSeconds: resolvePlaybackStart(currentTrack, pendingInitialSeekRef.current, stateRef.current.progress),
            volume: stateRef.current.volume,
            muted: stateRef.current.isMuted,
          });
          if (cancelled) {
            if (mpvResult.ok) void window.yangKura.requestMpvPlaybackCommand?.({ mode: 'mpv-playback-command', command: 'stop' });
            return;
          }
          if (mpvResult.ok) {
            forceHtmlFallbackTrackRef.current = null;
            if (pendingInitialSeekRef.current?.trackId === currentTrack.id) pendingInitialSeekRef.current = null;
            clearHtmlAudio();
            setPlayerState((prev) => ({ ...prev, playbackMode: 'mpv', playbackError: null, playbackNotice: null, resolvedMediaUrl: null }));
            return;
          }
          mpvFailureMessage = mpvResult.message;
        } catch (error) {
          mpvFailureMessage = error instanceof Error ? error.message : String(error);
        }
      }

      if (!shouldAttemptMpv && !forcedHtmlFallback) {
        mpvFailureMessage = '已按设置仅使用 HTMLAudio。';
      } else if (forcedHtmlFallback && !mpvFailureMessage) {
        mpvFailureMessage = forceHtmlFallbackTrackRef.current?.reason || 'mpv 运行中断。';
      }

      try {
        await startHtmlAudioFallback(mpvFailureMessage);
        forceHtmlFallbackTrackRef.current = null;
      } catch (error) {
        if (cancelled) return;
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          playbackMode: 'unsupported-local-media',
          playbackError: error instanceof Error ? error.message : String(error),
          playbackNotice: null,
          resolvedMediaUrl: null,
        }));
      }
    };

    void start();
    return () => {
      cancelled = true;
    };
  }, [currentTrackId, currentTrackRootToken, currentTrackRelativePath, playerState.isPlaying, playerState.playbackMode]);


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
    if (playerState.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
      void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'set-volume', volume: playerState.volume });
      void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'set-muted', muted: playerState.isMuted });
      return;
    }
    const audio = audioRef.current;
    if (!audio || playerState.playbackMode !== 'html-audio') return;
    audio.volume = playerState.volume;
    audio.muted = playerState.isMuted;
  }, [playerState.volume, playerState.isMuted, playerState.playbackMode]);

  useEffect(() => {
    if (playerState.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
      void window.yangKura.requestMpvPlaybackCommand({
        mode: 'mpv-playback-command',
        command: playerState.isPlaying ? 'resume' : 'pause',
      });
      return;
    }
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


  const handleReconcileQueueWithLibrary = useCallback((currentLibraryTracks: AudioTrack[]) => {
    setPlayerState((previous) => {
      const next = reconcilePlayerStateWithLibrary(previous, currentLibraryTracks);
      if (next.currentTrack && next.currentTrack !== previous.currentTrack && next.progress > 0) {
        pendingInitialSeekRef.current = { trackId: next.currentTrack.id, progress: next.progress };
      }
      return next;
    });
  }, []);

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
    handleReconcileQueueWithLibrary,
  };
}
