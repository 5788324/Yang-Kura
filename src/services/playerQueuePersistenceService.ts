import type { AudioTrack, PlayerState, PlaybackCompletionMode } from '../types';
import { sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';

const STORAGE_KEY = 'yang_kura_player_queue_v1';
const UPDATE_EVENT_NAME = 'yang-kura-player-queue-updated';
const VERSION = 1 as const;
const MAX_QUEUE_ITEMS = 300;

export interface PersistedPlayerQueueSnapshot {
  version: typeof VERSION;
  updatedAt: string;
  queue: AudioTrack[];
  currentTrackId: string | null;
  currentIndex: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  loopMode: PlayerState['loopMode'];
  playCompletionMode: PlaybackCompletionMode;
}

export interface PlayerQueuePersistenceSummary {
  hasQueue: boolean;
  queueCount: number;
  currentTrackTitle?: string;
  currentIndex: number;
  updatedAt?: string;
  playCompletionMode: PlaybackCompletionMode;
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizeTrackForQueue(track: AudioTrack): AudioTrack {
  return sanitizePersistedPlayerTrack(track);
}

function emitUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(UPDATE_EVENT_NAME));
}

function normalizeSnapshot(input: Partial<PersistedPlayerQueueSnapshot> | null | undefined): PersistedPlayerQueueSnapshot | null {
  if (!input || input.version !== VERSION || !Array.isArray(input.queue)) return null;
  const queue = input.queue
    .filter((track): track is AudioTrack => Boolean(track && typeof track.id === 'string' && typeof track.title === 'string'))
    .slice(0, MAX_QUEUE_ITEMS)
    .map(sanitizeTrackForQueue);
  if (queue.length === 0) return null;

  const fallbackIndex = typeof input.currentTrackId === 'string'
    ? queue.findIndex((track) => track.id === input.currentTrackId)
    : -1;
  const rawIndex = Math.trunc(safeNumber(input.currentIndex, fallbackIndex >= 0 ? fallbackIndex : 0));
  const currentIndex = Math.max(0, Math.min(queue.length - 1, rawIndex));
  const currentTrackId = queue[currentIndex]?.id ?? null;

  return {
    version: VERSION,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date(0).toISOString(),
    queue,
    currentTrackId,
    currentIndex,
    progress: Math.max(0, safeNumber(input.progress)),
    volume: Math.max(0, Math.min(1, safeNumber(input.volume, 0.75))),
    isMuted: Boolean(input.isMuted),
    loopMode: input.loopMode === 'one' || input.loopMode === 'shuffle' ? input.loopMode : 'all',
    playCompletionMode:
      input.playCompletionMode === 'stop-after-track' || input.playCompletionMode === 'stop-after-work'
        ? input.playCompletionMode
        : 'continue-queue',
  };
}

function parseSnapshot(raw: string | null): PersistedPlayerQueueSnapshot | null {
  if (!raw) return null;
  try {
    return normalizeSnapshot(JSON.parse(raw) as Partial<PersistedPlayerQueueSnapshot>);
  } catch {
    return null;
  }
}

function createSnapshotFromState(state: PlayerState): PersistedPlayerQueueSnapshot | null {
  const queue = state.queue.slice(0, MAX_QUEUE_ITEMS).map(sanitizeTrackForQueue);
  if (queue.length === 0) return null;
  const currentTrackId = state.currentTrack?.id ?? queue[state.currentIndex]?.id ?? queue[0]?.id ?? null;
  const indexFromTrack = currentTrackId ? queue.findIndex((track) => track.id === currentTrackId) : -1;
  const currentIndex = indexFromTrack >= 0 ? indexFromTrack : Math.max(0, Math.min(queue.length - 1, state.currentIndex));
  return {
    version: VERSION,
    updatedAt: new Date().toISOString(),
    queue,
    currentTrackId: queue[currentIndex]?.id ?? null,
    currentIndex,
    progress: Math.max(0, safeNumber(state.progress)),
    volume: Math.max(0, Math.min(1, safeNumber(state.volume, 0.75))),
    isMuted: Boolean(state.isMuted),
    loopMode: state.loopMode,
    playCompletionMode: state.playCompletionMode ?? 'continue-queue',
  };
}

export const playerQueuePersistenceService = {
  storageKey: STORAGE_KEY,
  updateEventName: UPDATE_EVENT_NAME,

  load(): PersistedPlayerQueueSnapshot | null {
    if (typeof localStorage === 'undefined') return null;
    return parseSnapshot(localStorage.getItem(STORAGE_KEY));
  },

  save(snapshot: PersistedPlayerQueueSnapshot | null): void {
    if (typeof localStorage === 'undefined') return;
    try {
      if (!snapshot || snapshot.queue.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      }
      emitUpdated();
    } catch {
      // Playback must remain usable even if localStorage is unavailable or full.
    }
  },

  saveFromPlayerState(state: PlayerState): PersistedPlayerQueueSnapshot | null {
    const snapshot = createSnapshotFromState(state);
    this.save(snapshot);
    return snapshot;
  },

  clear(): void {
    this.save(null);
  },

  getInitialPlayerState(): Pick<PlayerState, 'queue' | 'currentTrack' | 'currentIndex' | 'progress' | 'volume' | 'isMuted' | 'loopMode' | 'playCompletionMode'> | null {
    const snapshot = this.load();
    if (!snapshot) return null;
    const currentTrack = snapshot.queue[snapshot.currentIndex] ?? snapshot.queue[0] ?? null;
    return {
      queue: snapshot.queue,
      currentTrack,
      currentIndex: currentTrack ? snapshot.currentIndex : -1,
      progress: currentTrack ? snapshot.progress : 0,
      volume: snapshot.volume,
      isMuted: snapshot.isMuted,
      loopMode: snapshot.loopMode,
      playCompletionMode: snapshot.playCompletionMode,
    };
  },

  getSaveSignature(state: PlayerState): string {
    return JSON.stringify({
      ids: state.queue.map((track) => track.id),
      currentTrackId: state.currentTrack?.id ?? null,
      currentIndex: state.currentIndex,
      volume: Math.round(state.volume * 100),
      isMuted: state.isMuted,
      loopMode: state.loopMode,
      playCompletionMode: state.playCompletionMode ?? 'continue-queue',
    });
  },

  getSummary(snapshot: PersistedPlayerQueueSnapshot | null = this.load()): PlayerQueuePersistenceSummary {
    if (!snapshot) {
      return {
        hasQueue: false,
        queueCount: 0,
        currentIndex: -1,
        playCompletionMode: 'continue-queue',
      };
    }
    const current = snapshot.queue[snapshot.currentIndex] ?? snapshot.queue[0];
    return {
      hasQueue: snapshot.queue.length > 0,
      queueCount: snapshot.queue.length,
      currentTrackTitle: current?.title,
      currentIndex: snapshot.currentIndex,
      updatedAt: snapshot.updatedAt,
      playCompletionMode: snapshot.playCompletionMode,
    };
  },
};
