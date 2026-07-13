export interface DurationLike {
  duration: number;
}

export interface PlayerProgressMetrics {
  currentDisplayProgress: number;
  progressPercent: number;
}

export interface PlayerVolumeMetrics {
  visibleVolume: number;
  visibleVolumePercent: number;
}

export function clampPlayerValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getSafeTrackDuration(track: DurationLike | null | undefined): number {
  if (!track || !Number.isFinite(track.duration) || track.duration <= 0) return 0;
  return track.duration;
}

export function formatPlayerTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function seekFromPointerPosition(
  clientX: number,
  left: number,
  width: number,
  duration: number,
): number | null {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(duration) || duration <= 0) return null;
  const percent = clampPlayerValue((clientX - left) / width, 0, 1);
  return percent * duration;
}

export function getPlayerProgressMetrics(
  progress: number,
  dragValue: number | null,
  duration: number,
): PlayerProgressMetrics {
  if (!Number.isFinite(duration) || duration <= 0) {
    return { currentDisplayProgress: 0, progressPercent: 0 };
  }

  const safeProgress = Number.isFinite(progress) ? Math.max(0, progress) : 0;
  const sourceProgress = dragValue !== null && Number.isFinite(dragValue) ? dragValue : safeProgress;
  const currentDisplayProgress = clampPlayerValue(sourceProgress, 0, duration);

  return {
    currentDisplayProgress,
    progressPercent: clampPlayerValue((currentDisplayProgress / duration) * 100, 0, 100),
  };
}

export function getPlayerVolumeMetrics(volume: number, isMuted: boolean): PlayerVolumeMetrics {
  const safeVolume = clampPlayerValue(Number.isFinite(volume) ? volume : 0, 0, 1);
  const visibleVolume = isMuted ? 0 : safeVolume;

  return {
    visibleVolume,
    visibleVolumePercent: clampPlayerValue(visibleVolume * 100, 0, 100),
  };
}
