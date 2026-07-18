import type { AudioTrack, PlayerState } from '../types';

export interface PendingPlaybackStart {
  trackId: string;
  progress: number;
}

export type TokenizedLocalAudioTrack = AudioTrack & {
  rootPathToken: string;
  sourceRelativePath: string;
};

export function isTokenizedLocalTrack(
  track: AudioTrack | null | undefined,
): track is TokenizedLocalAudioTrack {
  return Boolean(
    track?.rootPathToken &&
    track.sourceRelativePath &&
    track.playbackSourceKind === 'tokenized-local-file',
  );
}

export function clampPlaybackPosition(seconds: number, duration?: number): number {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const safeDuration = Number.isFinite(duration) && (duration ?? 0) > 0 ? duration ?? 0 : 0;
  return safeDuration > 0 ? Math.min(safeSeconds, safeDuration) : safeSeconds;
}

export function resolvePlaybackStart(
  track: AudioTrack | null | undefined,
  pending: PendingPlaybackStart | null | undefined,
  restoredProgress: number,
): number {
  if (!track) return 0;
  const requested = pending?.trackId === track.id ? pending.progress : restoredProgress;
  return clampPlaybackPosition(requested, track.duration);
}

export function getPlaybackEndGuard(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(10, duration * 0.05);
}

export function isPlaybackComplete(progress: number, duration: number): boolean {
  if (!Number.isFinite(duration) || duration <= 0) return false;
  const normalized = clampPlaybackPosition(progress, duration);
  return normalized >= duration - getPlaybackEndGuard(duration);
}

export function isLocalTrackAwaitingAuthorization(track: AudioTrack | null | undefined): boolean {
  return Boolean(
    track?.playbackSourceKind === 'tokenized-local-file' &&
    track.sourceRelativePath &&
    !track.rootPathToken,
  );
}

export function sanitizePersistedPlayerTrack(track: AudioTrack): AudioTrack {
  const tokenizedCover = typeof track.coverUrl === 'string' && track.coverUrl.startsWith('yang-kura-media://');
  return {
    ...track,
    rootPathToken: undefined,
    mediaUrl: undefined,
    coverUrl: tokenizedCover ? '' : track.coverUrl,
    coverSourceKind: tokenizedCover ? 'missing' : track.coverSourceKind,
    lyrics: track.lyricsSourceKind === 'mock' ? track.lyrics : undefined,
    lyricsLoadStatus: track.lyricsLoadStatus === 'loaded' ? 'idle' : track.lyricsLoadStatus,
    lyricsLoadError: undefined,
  };
}

export function reconcileTracksWithLibrary(
  tracks: readonly AudioTrack[],
  currentLibraryTracks: readonly AudioTrack[],
  options: { dropMissing?: boolean } = {},
): AudioTrack[] {
  const freshById = new Map(currentLibraryTracks.map((track) => [track.id, track]));
  return tracks
    .map((track) => freshById.get(track.id) ?? (options.dropMissing ? null : track))
    .filter((track): track is AudioTrack => Boolean(track));
}

export function reconcilePlayerStateWithLibrary(
  state: PlayerState,
  currentLibraryTracks: readonly AudioTrack[],
): PlayerState {
  if (state.queue.length === 0 || currentLibraryTracks.length === 0) return state;
  const freshById = new Map(currentLibraryTracks.map((track) => [track.id, track]));
  const queue = state.queue
    .map((track) => freshById.get(track.id))
    .filter((track): track is AudioTrack => Boolean(track));
  const previousCurrentId = state.currentTrack?.id ?? state.queue[state.currentIndex]?.id;
  const currentTrack = previousCurrentId ? freshById.get(previousCurrentId) ?? queue[0] ?? null : queue[0] ?? null;
  const currentIndex = currentTrack ? queue.findIndex((track) => track.id === currentTrack.id) : -1;
  const currentWasRemoved = Boolean(previousCurrentId && !freshById.has(previousCurrentId));
  const queueChanged = queue.length !== state.queue.length || queue.some((track, index) => track !== state.queue[index]);

  if (!queueChanged && !currentWasRemoved && currentTrack === state.currentTrack && currentIndex === state.currentIndex) return state;
  if (!currentTrack) {
    return {
      ...state,
      queue: [],
      currentTrack: null,
      currentIndex: -1,
      progress: 0,
      isPlaying: false,
      playbackMode: 'idle',
      playbackError: null,
      playbackNotice: '旧播放队列不属于当前资源库，已自动清理。',
      resolvedMediaUrl: null,
    };
  }

  return {
    ...state,
    queue,
    currentTrack,
    currentIndex,
    progress: currentWasRemoved ? 0 : state.progress,
    isPlaying: currentWasRemoved ? false : state.isPlaying,
    playbackMode: currentWasRemoved
      ? 'idle'
      : state.isPlaying && currentTrack.rootPathToken
        ? 'resolving-local-media'
        : state.playbackMode,
    playbackError: null,
    playbackNotice: currentWasRemoved ? '旧播放音轨不属于当前资源库，已切换到当前资源库队列。' : state.playbackNotice,
    resolvedMediaUrl: null,
  };
}
