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
): AudioTrack[] {
  const freshById = new Map(currentLibraryTracks.map((track) => [track.id, track]));
  return tracks.map((track) => freshById.get(track.id) ?? track);
}

export function reconcilePlayerStateWithLibrary(
  state: PlayerState,
  currentLibraryTracks: readonly AudioTrack[],
): PlayerState {
  if (state.queue.length === 0 || currentLibraryTracks.length === 0) return state;
  const freshById = new Map(currentLibraryTracks.map((track) => [track.id, track]));
  let changed = false;
  const queue = state.queue.map((track) => {
    const fresh = freshById.get(track.id);
    if (!fresh) return track;
    if (fresh !== track) changed = true;
    return fresh;
  });
  const currentId = state.currentTrack?.id ?? queue[state.currentIndex]?.id;
  const currentTrack = currentId ? freshById.get(currentId) ?? state.currentTrack : state.currentTrack;
  if (currentTrack !== state.currentTrack) changed = true;
  const currentIndex = currentTrack
    ? Math.max(0, queue.findIndex((track) => track.id === currentTrack.id))
    : -1;
  if (currentIndex !== state.currentIndex) changed = true;
  if (!changed) return state;
  return {
    ...state,
    queue,
    currentTrack: currentTrack ?? null,
    currentIndex,
    playbackMode: state.isPlaying && currentTrack?.rootPathToken ? 'resolving-local-media' : state.playbackMode,
    playbackError: currentTrack?.rootPathToken ? null : state.playbackError,
    resolvedMediaUrl: null,
  };
}
