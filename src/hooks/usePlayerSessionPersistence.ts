import { useCallback, useEffect, useRef } from 'react';
import type { AudioTrack, PlayerState } from '../types';
import { sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';
import { playbackHistoryService } from '../services/playbackHistoryService';
import { playerQueuePersistenceService } from '../services/playerQueuePersistenceService';

const LEGACY_LAST_TRACK_ID_KEY = 'last_played_track_id';
const LEGACY_LAST_PROGRESS_KEY = 'last_played_progress';
const LEGACY_LAST_TRACK_JSON_KEY = 'last_played_track_json';
const SAVE_PROGRESS_DELTA_SECONDS = 5;
const SAVE_INTERVAL_MS = 5000;

interface QueueSaveCheckpoint {
  signature: string;
  progress: number;
  savedAt: number;
}

interface HistorySaveCheckpoint {
  trackId: string;
  progress: number;
  savedAt: number;
}

export function restorePlayerSessionState() {
  return playerQueuePersistenceService.getInitialPlayerState();
}

export function usePlayerSessionPersistence(playerState: PlayerState) {
  const lastQueueSaveRef = useRef<QueueSaveCheckpoint | null>(null);
  const lastHistorySaveRef = useRef<HistorySaveCheckpoint | null>(null);

  const getResumeProgress = useCallback((track: AudioTrack): number => (
    playbackHistoryService.getResumeProgress(track.id, track.duration)
  ), []);

  const recordTrackStarted = useCallback((track: AudioTrack, progress: number): void => {
    if (track.rjId) {
      try {
        localStorage.setItem(`asmr_last_played_${track.rjId}`, Date.now().toString());
      } catch {
        // Compatibility metadata must never interrupt playback.
      }
    }
    playbackHistoryService.saveProgress(track, progress, track.duration);
  }, []);

  const recordTrackCompleted = useCallback((track: AudioTrack, progress: number, duration?: number): void => {
    playbackHistoryService.saveProgress(track, progress, duration);
  }, []);

  useEffect(() => {
    const track = playerState.currentTrack;
    if (!track || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(LEGACY_LAST_TRACK_ID_KEY, track.id);
      localStorage.setItem(LEGACY_LAST_PROGRESS_KEY, playerState.progress.toString());
      localStorage.setItem(LEGACY_LAST_TRACK_JSON_KEY, JSON.stringify(sanitizePersistedPlayerTrack(track)));
    } catch {
      // Legacy resume compatibility must never interrupt playback.
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
      Math.abs(progress - lastSaved.progress) >= SAVE_PROGRESS_DELTA_SECONDS ||
      now - lastSaved.savedAt >= SAVE_INTERVAL_MS ||
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
    const progress = Math.max(0, playerState.progress || 0);
    const lastSaved = lastHistorySaveRef.current;
    const shouldSave =
      !lastSaved ||
      lastSaved.trackId !== track.id ||
      Math.abs(progress - lastSaved.progress) >= SAVE_PROGRESS_DELTA_SECONDS ||
      now - lastSaved.savedAt >= SAVE_INTERVAL_MS ||
      !playerState.isPlaying;

    if (!shouldSave) return;
    playbackHistoryService.saveProgress(track, progress, track.duration);
    lastHistorySaveRef.current = { trackId: track.id, progress, savedAt: now };
  }, [playerState.currentTrack?.id, playerState.progress, playerState.isPlaying, playerState.currentTrack?.duration]);

  return {
    getResumeProgress,
    recordTrackCompleted,
    recordTrackStarted,
  };
}
