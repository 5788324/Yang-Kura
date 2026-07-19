import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { PlayerState } from '../types';
import {
  clampPlaybackPosition,
  isTokenizedLocalTrack,
  resolvePlaybackStart,
  type PendingPlaybackStart,
} from '../player/playerRuntimePolicy';
import {
  mpvPlaybackPreferenceService,
  type MpvPlaybackPreference,
} from '../services/mpvPlaybackPreferenceService';

interface UsePlayerBackendOptions {
  playerState: PlayerState;
  setPlayerState: Dispatch<SetStateAction<PlayerState>>;
  initialPendingSeek: PendingPlaybackStart | null;
  onEnded: () => void;
}

export interface PlayerBackendController {
  prepareInitialSeek(trackId: string, progress: number): void;
  restartCurrentTrack(): void;
  pauseHtmlAudio(): void;
  seek(seconds: number): void;
}

function safeDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

const HTML_AUDIO_METADATA_TIMEOUT_MS = 10_000;
const HTML_AUDIO_PLAY_TIMEOUT_MS = 10_000;

function htmlAudioFallbackFailureMessage(extension?: string): string {
  const format = extension ? `.${extension}` : '当前格式';
  return `基础播放在 10 秒内无法读取或启动${format}音频。请在“设置 → 播放方式”中选择 mpv，或改用基础播放支持的音频编码。`;
}

async function waitForHtmlAudioMetadata(audio: HTMLAudioElement, extension?: string): Promise<void> {
  if (audio.readyState >= 1) return;
  await new Promise<void>((resolve, reject) => {
    let timer: number | undefined;
    const cleanup = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      audio.removeEventListener('loadedmetadata', handleReady);
      audio.removeEventListener('error', handleFailure);
    };
    const handleReady = () => {
      cleanup();
      resolve();
    };
    const handleFailure = () => {
      cleanup();
      const detail = audio.error?.message || (audio.error ? `错误码 ${audio.error.code}` : '未知媒体错误');
      reject(new Error(`基础播放无法读取当前音频元数据：${detail}。请在“设置 → 播放方式”中选择 mpv。`));
    };
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(htmlAudioFallbackFailureMessage(extension)));
    }, HTML_AUDIO_METADATA_TIMEOUT_MS);
    audio.addEventListener('loadedmetadata', handleReady, { once: true });
    audio.addEventListener('error', handleFailure, { once: true });
  });
}

async function playHtmlAudioWithTimeout(audio: HTMLAudioElement, extension?: string): Promise<void> {
  let timer: number | undefined;
  try {
    await Promise.race([
      audio.play(),
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(
          () => reject(new Error(htmlAudioFallbackFailureMessage(extension))),
          HTML_AUDIO_PLAY_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

function clearHtmlAudio(audio: HTMLAudioElement | null): void {
  if (!audio) return;
  audio.pause();
  delete audio.dataset.yangKuraTrackId;
  audio.removeAttribute('src');
  audio.load();
}

export function usePlayerBackend({
  playerState,
  setPlayerState,
  initialPendingSeek,
  onEnded,
}: UsePlayerBackendOptions): PlayerBackendController {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mpvPreferenceRef = useRef<MpvPlaybackPreference>(mpvPlaybackPreferenceService.getPreference());
  const forceHtmlFallbackTrackRef = useRef<{ trackId: string; reason: string } | null>(null);
  const pendingInitialSeekRef = useRef<PendingPlaybackStart | null>(initialPendingSeek);
  const stateRef = useRef(playerState);
  const onEndedRef = useRef(onEnded);
  stateRef.current = playerState;
  onEndedRef.current = onEnded;

  const prepareInitialSeek = useCallback((trackId: string, progress: number) => {
    pendingInitialSeekRef.current = { trackId, progress };
  }, []);

  const pauseHtmlAudio = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const restartCurrentTrack = useCallback(() => {
    const current = stateRef.current;
    if (current.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
      void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'seek', seconds: 0 });
      void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'resume' });
      setPlayerState((previous) => ({ ...previous, progress: 0, isPlaying: true }));
      return;
    }

    const audio = audioRef.current;
    if (audio && current.playbackMode === 'html-audio') {
      audio.currentTime = 0;
      void audio.play().catch((error) => {
        setPlayerState((previous) => ({
          ...previous,
          isPlaying: false,
          playbackError: error instanceof Error ? error.message : String(error),
        }));
      });
      return;
    }

    setPlayerState((previous) => ({ ...previous, progress: 0 }));
  }, [setPlayerState]);

  const seek = useCallback((seconds: number) => {
    const current = stateRef.current;
    const normalized = clampPlaybackPosition(seconds, current.currentTrack?.duration);
    if (current.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
      void window.yangKura.requestMpvPlaybackCommand({
        mode: 'mpv-playback-command',
        command: 'seek',
        seconds: normalized,
      });
    } else if (audioRef.current && current.playbackMode === 'html-audio') {
      audioRef.current.currentTime = normalized;
    }
    setPlayerState((previous) => ({ ...previous, progress: normalized }));
  }, [setPlayerState]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setPlayerState((previous) => {
        if (previous.playbackMode !== 'html-audio') return previous;
        return { ...previous, progress: audio.currentTime || 0 };
      });
    };

    const handleLoadedMetadata = () => {
      const loadedTrackId = audio.dataset.yangKuraTrackId;
      const current = stateRef.current.currentTrack;
      if (!loadedTrackId || !current || current.id !== loadedTrackId) return;

      const target = resolvePlaybackStart(current, pendingInitialSeekRef.current, stateRef.current.progress);
      if (target > 0 && Math.abs(audio.currentTime - target) > 0.1) audio.currentTime = target;
      if (pendingInitialSeekRef.current?.trackId === current.id) pendingInitialSeekRef.current = null;

      setPlayerState((previous) => {
        if (!previous.currentTrack || previous.currentTrack.id !== loadedTrackId) return previous;
        const duration = safeDuration(audio.duration);
        if (!duration) return previous;
        const updatedTrack = { ...previous.currentTrack, duration };
        const updatedQueue = previous.queue.map((track) => (
          track.id === updatedTrack.id ? { ...track, duration } : track
        ));
        return { ...previous, currentTrack: updatedTrack, queue: updatedQueue };
      });
    };

    const handleEnded = () => onEndedRef.current();

    const handleError = () => {
      const message = audio.error
        ? `HTMLAudio 播放失败：${audio.error.message || `错误码 ${audio.error.code}`}`
        : 'HTMLAudio 播放失败。';
      setPlayerState((previous) => ({
        ...previous,
        isPlaying: false,
        playbackError: message,
        playbackMode: 'unsupported-local-media',
      }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      clearHtmlAudio(audio);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [setPlayerState]);

  useEffect(() => {
    const handlePreferenceChanged = (event: Event) => {
      const custom = event as CustomEvent<MpvPlaybackPreference>;
      mpvPreferenceRef.current = custom.detail ?? mpvPlaybackPreferenceService.getPreference();
    };
    window.addEventListener(mpvPlaybackPreferenceService.updateEventName, handlePreferenceChanged);
    return () => window.removeEventListener(mpvPlaybackPreferenceService.updateEventName, handlePreferenceChanged);
  }, []);

  useEffect(() => {
    if (!window.yangKura?.onMpvPlaybackEvent) return;
    return window.yangKura.onMpvPlaybackEvent((event) => {
      const current = stateRef.current.currentTrack;
      if (!current || event.trackId !== current.id) return;

      if (event.type === 'ready') {
        forceHtmlFallbackTrackRef.current = null;
        setPlayerState((previous) => ({
          ...previous,
          playbackMode: 'mpv',
          playbackError: null,
          playbackNotice: null,
          resolvedMediaUrl: null,
        }));
      } else if (event.type === 'time') {
        setPlayerState((previous) => (
          previous.playbackMode === 'mpv'
            ? { ...previous, progress: Math.max(0, event.positionSeconds) }
            : previous
        ));
      } else if (event.type === 'duration') {
        setPlayerState((previous) => {
          if (!previous.currentTrack || previous.currentTrack.id !== event.trackId) return previous;
          const duration = safeDuration(event.durationSeconds);
          if (!duration) return previous;
          const updatedTrack = { ...previous.currentTrack, duration };
          return {
            ...previous,
            currentTrack: updatedTrack,
            queue: previous.queue.map((track) => (
              track.id === updatedTrack.id ? { ...track, duration } : track
            )),
          };
        });
      } else if (event.type === 'pause-state') {
        setPlayerState((previous) => (
          previous.playbackMode === 'mpv'
            ? { ...previous, isPlaying: !event.paused }
            : previous
        ));
      } else if (event.type === 'ended') {
        onEndedRef.current();
      } else if (event.type === 'fallback-requested') {
        forceHtmlFallbackTrackRef.current = { trackId: event.trackId, reason: event.reason };
        pendingInitialSeekRef.current = {
          trackId: event.trackId,
          progress: Math.max(0, event.resumeSeconds),
        };
        setPlayerState((previous) => ({
          ...previous,
          isPlaying: true,
          progress: Math.max(0, event.resumeSeconds),
          playbackMode: 'resolving-local-media',
          playbackError: null,
          playbackNotice: `${event.message} 正在从上次位置切换到 HTMLAudio。`,
          resolvedMediaUrl: null,
        }));
      } else if (event.type === 'error') {
        setPlayerState((previous) => ({
          ...previous,
          isPlaying: false,
          playbackMode: 'unsupported-local-media',
          playbackError: event.message,
        }));
      }
    });
  }, [setPlayerState]);

  const currentTrack = playerState.currentTrack;
  const currentTrackId = currentTrack?.id;
  const currentTrackRootToken = currentTrack?.rootPathToken;
  const currentTrackRelativePath = currentTrack?.sourceRelativePath;

  useEffect(() => {
    let cancelled = false;
    const audio = audioRef.current;

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

      audioRef.current.dataset.yangKuraTrackId = currentTrack.id;
      audioRef.current.src = result.mediaUrl;
      audioRef.current.volume = stateRef.current.volume;
      audioRef.current.muted = stateRef.current.isMuted;
      const initialSeek = resolvePlaybackStart(
        currentTrack,
        pendingInitialSeekRef.current,
        stateRef.current.progress,
      );
      audioRef.current.load();
      await waitForHtmlAudioMetadata(audioRef.current, result.extension);
      if (cancelled || !audioRef.current) return;
      audioRef.current.currentTime = initialSeek;
      if (pendingInitialSeekRef.current?.trackId === currentTrack.id) pendingInitialSeekRef.current = null;
      const resolvedDuration = safeDuration(audioRef.current.duration);
      setPlayerState((previous) => {
        if (!previous.currentTrack || previous.currentTrack.id !== currentTrack.id) return previous;
        const updatedTrack = {
          ...previous.currentTrack,
          mediaUrl: result.mediaUrl,
          ...(resolvedDuration > 0 ? { duration: resolvedDuration } : {}),
        };
        return {
          ...previous,
          playbackMode: 'html-audio',
          playbackError: null,
          playbackNotice: mpvMessage
            ? (mpvMessage.startsWith('已按设置')
                ? mpvMessage
                : `mpv 不可用，已切换 HTMLAudio：${mpvMessage}`)
            : previous.playbackNotice,
          resolvedMediaUrl: result.mediaUrl,
          currentTrack: updatedTrack,
          queue: resolvedDuration > 0
            ? previous.queue.map((track) => (
                track.id === updatedTrack.id ? { ...track, duration: resolvedDuration } : track
              ))
            : previous.queue,
        };
      });
      if (stateRef.current.isPlaying) await playHtmlAudioWithTimeout(audioRef.current, result.extension);
    };

    if (!currentTrack) {
      clearHtmlAudio(audio);
      if (window.yangKura?.requestMpvPlaybackCommand) {
        void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'stop' });
      }
      return;
    }

    if (!isTokenizedLocalTrack(currentTrack)) {
      clearHtmlAudio(audio);
      if (window.yangKura?.requestMpvPlaybackCommand) {
        void window.yangKura.requestMpvPlaybackCommand({ mode: 'mpv-playback-command', command: 'stop' });
      }
      setPlayerState((previous) => ({
        ...previous,
        playbackMode: previous.isPlaying ? 'mock-simulated' : 'idle',
        resolvedMediaUrl: null,
        playbackError: null,
        playbackNotice: null,
      }));
      return;
    }

    if (
      !playerState.isPlaying ||
      playerState.playbackMode === 'mpv' ||
      playerState.playbackMode === 'html-audio'
    ) return;

    const start = async () => {
      setPlayerState((previous) => ({
        ...previous,
        playbackMode: 'resolving-local-media',
        playbackError: null,
        resolvedMediaUrl: null,
      }));
      let mpvFailureMessage: string | undefined;
      const forcedHtmlFallback = forceHtmlFallbackTrackRef.current?.trackId === currentTrack.id;
      const shouldAttemptMpv = (
        mpvPlaybackPreferenceService.shouldAttemptMpv(mpvPreferenceRef.current) &&
        !forcedHtmlFallback
      );
      if (shouldAttemptMpv && window.yangKura?.requestMpvPlaybackStart) {
        try {
          const mpvResult = await window.yangKura.requestMpvPlaybackStart({
            rootPathToken: currentTrack.rootPathToken,
            relativePath: currentTrack.sourceRelativePath,
            trackId: currentTrack.id,
            mode: 'mpv-playback-start',
            startSeconds: resolvePlaybackStart(
              currentTrack,
              pendingInitialSeekRef.current,
              stateRef.current.progress,
            ),
            volume: stateRef.current.volume,
            muted: stateRef.current.isMuted,
          });
          if (cancelled) {
            if (mpvResult.ok) {
              void window.yangKura.requestMpvPlaybackCommand?.({
                mode: 'mpv-playback-command',
                command: 'stop',
              });
            }
            return;
          }
          if (mpvResult.ok) {
            forceHtmlFallbackTrackRef.current = null;
            if (pendingInitialSeekRef.current?.trackId === currentTrack.id) {
              pendingInitialSeekRef.current = null;
            }
            clearHtmlAudio(audioRef.current);
            setPlayerState((previous) => ({
              ...previous,
              playbackMode: 'mpv',
              playbackError: null,
              playbackNotice: null,
              resolvedMediaUrl: null,
            }));
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
        clearHtmlAudio(audioRef.current);
        setPlayerState((previous) => ({
          ...previous,
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
  }, [
    currentTrackId,
    currentTrackRootToken,
    currentTrackRelativePath,
    playerState.isPlaying,
    playerState.playbackMode,
    setPlayerState,
  ]);

  useEffect(() => {
    if (playerState.playbackMode === 'mpv' && window.yangKura?.requestMpvPlaybackCommand) {
      void window.yangKura.requestMpvPlaybackCommand({
        mode: 'mpv-playback-command',
        command: 'set-volume',
        volume: playerState.volume,
      });
      void window.yangKura.requestMpvPlaybackCommand({
        mode: 'mpv-playback-command',
        command: 'set-muted',
        muted: playerState.isMuted,
      });
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
        setPlayerState((previous) => ({
          ...previous,
          isPlaying: false,
          playbackMode: 'unsupported-local-media',
          playbackError: error instanceof Error ? error.message : String(error),
        }));
      });
    } else {
      audio.pause();
    }
  }, [
    playerState.isPlaying,
    playerState.playbackMode,
    playerState.resolvedMediaUrl,
    setPlayerState,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (
      playerState.isPlaying &&
      playerState.currentTrack &&
      playerState.playbackMode === 'mock-simulated'
    ) {
      timer = setInterval(() => {
        setPlayerState((previous) => {
          if (
            !previous.currentTrack ||
            !previous.isPlaying ||
            previous.playbackMode !== 'mock-simulated'
          ) return previous;
          const duration = safeDuration(previous.currentTrack.duration);
          const nextProgress = previous.progress + 1;
          if (duration > 0 && nextProgress >= duration) {
            return { ...previous, progress: duration };
          }
          return { ...previous, progress: nextProgress };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    playerState.isPlaying,
    playerState.currentTrack?.id,
    playerState.playbackMode,
    setPlayerState,
  ]);

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
      onEndedRef.current();
    }
  }, [
    isPlaying,
    progress,
    currentTrackId,
    currentTrackDuration,
    currentTrackIsRealAudio,
    playerState.loopMode,
  ]);

  return {
    prepareInitialSeek,
    restartCurrentTrack,
    pauseHtmlAudio,
    seek,
  };
}
