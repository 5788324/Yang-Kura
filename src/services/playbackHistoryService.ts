import type { AudioTrack } from '../types';

const STORAGE_KEY = 'yang_kura_playback_history_v1';
const MAX_HISTORY_ITEMS = 50;
const MIN_RESUME_SECONDS = 5;
const END_GUARD_SECONDS = 10;

export interface PlaybackHistoryEntry {
  trackId: string;
  title: string;
  artist: string;
  album: string;
  progress: number;
  duration: number;
  percent: number;
  completed: boolean;
  playCount: number;
  updatedAt: string;
  track: AudioTrack;
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampProgress(progress: number, duration: number): number {
  const normalized = Math.max(0, safeNumber(progress));
  if (!duration) return normalized;
  return Math.min(normalized, duration);
}

function sanitizeTrack(track: AudioTrack): AudioTrack {
  return {
    ...track,
    mediaUrl: undefined,
    lyrics: track.lyricsSourceKind === 'mock' ? track.lyrics : undefined,
    lyricsLoadStatus: track.lyricsLoadStatus === 'loaded' ? 'idle' : track.lyricsLoadStatus,
    lyricsLoadError: undefined,
  };
}

function parseHistory(raw: string | null): PlaybackHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PlaybackHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.trackId === 'string' && entry.track);
  } catch {
    return [];
  }
}

function writeHistory(entries: PlaybackHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ITEMS)));
    window.dispatchEvent(new Event('yang-kura-playback-history-updated'));
  } catch {
    // Keep playback stable if localStorage is unavailable or full.
  }
}

function flattenTrackMap(allTracks: AudioTrack[] = []): Map<string, AudioTrack> {
  const result = new Map<string, AudioTrack>();
  allTracks.forEach((track) => result.set(track.id, track));
  return result;
}

export const playbackHistoryService = {
  storageKey: STORAGE_KEY,

  load(): PlaybackHistoryEntry[] {
    return parseHistory(localStorage.getItem(STORAGE_KEY));
  },

  clear(): void {
    writeHistory([]);
  },

  getResumeProgress(trackId: string, durationHint?: number): number {
    const entry = this.load().find((item) => item.trackId === trackId);
    if (!entry || entry.completed) return 0;
    const duration = safeNumber(durationHint) || entry.duration;
    const progress = clampProgress(entry.progress, duration);
    if (progress < MIN_RESUME_SECONDS) return 0;
    if (duration > 0 && progress >= Math.max(0, duration - END_GUARD_SECONDS)) return 0;
    return progress;
  },

  saveProgress(track: AudioTrack, progressInput: number, durationInput?: number): PlaybackHistoryEntry[] {
    const duration = safeNumber(durationInput) || safeNumber(track.duration);
    const progress = clampProgress(progressInput, duration);
    const percent = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;
    const completed = duration > 0 && (percent >= 95 || progress >= Math.max(0, duration - END_GUARD_SECONDS));
    const existing = this.load();
    const previous = existing.find((entry) => entry.trackId === track.id);
    const nextEntry: PlaybackHistoryEntry = {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      progress,
      duration,
      percent,
      completed,
      playCount: previous ? previous.playCount + (previous.progress <= 0 && progress > 0 ? 1 : 0) : 1,
      updatedAt: new Date().toISOString(),
      track: sanitizeTrack(track),
    };
    const next = [nextEntry, ...existing.filter((entry) => entry.trackId !== track.id)].slice(0, MAX_HISTORY_ITEMS);
    writeHistory(next);
    return next;
  },

  getRecentTracks(allTracks: AudioTrack[] = []): AudioTrack[] {
    const byId = flattenTrackMap(allTracks);
    return this.load().map((entry) => {
      const freshTrack = byId.get(entry.trackId);
      const baseTrack = freshTrack || entry.track;
      return {
        ...baseTrack,
        duration: safeNumber(baseTrack.duration) || entry.duration,
      };
    });
  },

  getSummary(allTracks: AudioTrack[] = []): { count: number; playableCount: number; lastUpdatedAt?: string } {
    const entries = this.load();
    const byId = flattenTrackMap(allTracks);
    return {
      count: entries.length,
      playableCount: entries.filter((entry) => Boolean(byId.get(entry.trackId)?.rootPathToken || entry.track.rootPathToken)).length,
      lastUpdatedAt: entries[0]?.updatedAt,
    };
  },
};
