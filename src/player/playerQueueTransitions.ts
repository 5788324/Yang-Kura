import type { AudioTrack, PlayerState } from '../types';

export type PlayerQueueDirection = 'next' | 'previous';
export type QueuePlaybackMode = NonNullable<PlayerState['playbackMode']>;

export interface PlayerQueueTarget {
  index: number;
  track: AudioTrack;
}

export function resolveAdjacentQueueTarget(
  state: PlayerState,
  direction: PlayerQueueDirection,
  random: () => number = Math.random,
): PlayerQueueTarget | null {
  if (state.queue.length === 0) return null;

  let index: number;
  if (state.loopMode === 'shuffle') {
    const normalizedRandom = Math.max(0, Math.min(0.999999999, random()));
    index = Math.floor(normalizedRandom * state.queue.length);
  } else if (direction === 'next') {
    index = state.currentIndex + 1;
    if (index >= state.queue.length) index = 0;
  } else {
    index = state.currentIndex - 1;
    if (index < 0) index = state.queue.length - 1;
  }

  const track = state.queue[index];
  return track ? { index, track } : null;
}

export function activateQueueTarget(
  state: PlayerState,
  target: PlayerQueueTarget,
  resumeProgress: number,
  playbackMode: QueuePlaybackMode,
): PlayerState {
  return {
    ...state,
    currentIndex: target.index,
    currentTrack: target.track,
    progress: resumeProgress,
    isPlaying: true,
    playbackMode,
    playbackError: null,
    playbackNotice: null,
    resolvedMediaUrl: null,
  };
}

export function startTrackQueue(
  state: PlayerState,
  track: AudioTrack,
  customQueue: AudioTrack[] | undefined,
  resumeProgress: number,
  playbackMode: QueuePlaybackMode,
): PlayerState {
  const queue = customQueue && customQueue.length > 0 ? customQueue : [track];
  const matchedIndex = queue.findIndex((candidate) => candidate.id === track.id);
  return {
    ...state,
    currentTrack: track,
    isPlaying: true,
    progress: resumeProgress,
    queue,
    currentIndex: matchedIndex >= 0 ? matchedIndex : 0,
    playbackMode,
    playbackError: null,
    playbackNotice: null,
    resolvedMediaUrl: null,
  };
}

export function appendTrackToQueue(state: PlayerState, track: AudioTrack): PlayerState {
  const queue = state.queue.some((candidate) => candidate.id === track.id)
    ? state.queue
    : [...state.queue, track];
  return {
    ...state,
    queue,
    currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
    currentTrack: state.currentTrack ?? track,
  };
}
