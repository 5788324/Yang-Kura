import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent, RefObject } from 'react';
import type { AudioTrack } from '../types';
import {
  clampPlayerValue,
  getPlayerProgressMetrics,
  getSafeTrackDuration,
  seekFromPointerPosition,
} from '../player/playerBarMath';

interface UsePlayerSeekInteractionOptions {
  currentTrack: AudioTrack | null;
  progress: number;
  onSeek: (seconds: number) => void;
}

export interface PlayerSeekInteraction {
  duration: number;
  displayProgress: number;
  progressPercent: number;
  hoverPercent: number | null;
  hoverTime: number | null;
  isDragging: boolean;
  progressTrackRef: RefObject<HTMLDivElement | null>;
  onTrackClick: (event: MouseEvent<HTMLDivElement>) => void;
  onTrackMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  onTrackMouseLeave: () => void;
  onRangeStart: () => void;
  onRangeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRangeCommit: () => void;
}

export function usePlayerSeekInteraction({
  currentTrack,
  progress,
  onSeek,
}: UsePlayerSeekInteractionOptions): PlayerSeekInteraction {
  const [hoverPreview, setHoverPreview] = useState<{ percent: number; time: number } | null>(null);
  const [dragPreviewSeconds, setDragPreviewSeconds] = useState<number | null>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const pendingSeekSecondsRef = useRef<number | null>(null);

  const duration = getSafeTrackDuration(currentTrack);
  const { currentDisplayProgress: displayProgress, progressPercent } = useMemo(
    () => getPlayerProgressMetrics(progress, dragPreviewSeconds, duration),
    [dragPreviewSeconds, duration, progress],
  );

  const onTrackClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!currentTrack || duration <= 0) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const targetSeconds = seekFromPointerPosition(event.clientX, rect.left, rect.width, duration);
      if (targetSeconds !== null) onSeek(targetSeconds);
    },
    [currentTrack, duration, onSeek],
  );

  const onTrackMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!currentTrack || duration <= 0 || !progressTrackRef.current) return;

      const rect = progressTrackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const percent = clampPlayerValue((event.clientX - rect.left) / rect.width, 0, 1);
      setHoverPreview({ percent, time: percent * duration });
    },
    [currentTrack, duration],
  );

  const onTrackMouseLeave = useCallback(() => {
    setHoverPreview(null);
  }, []);

  const onRangeStart = useCallback(() => {
    pendingSeekSecondsRef.current = displayProgress;
    setDragPreviewSeconds(displayProgress);
  }, [displayProgress]);

  const onRangeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const parsedValue = Number.parseFloat(event.target.value);
      const nextValue = duration > 0
        ? clampPlayerValue(Number.isFinite(parsedValue) ? parsedValue : 0, 0, duration)
        : 0;

      pendingSeekSecondsRef.current = nextValue;
      setDragPreviewSeconds(nextValue);
    },
    [duration],
  );

  const onRangeCommit = useCallback(() => {
    const finalSeek = pendingSeekSecondsRef.current;
    if (finalSeek !== null && duration > 0) {
      onSeek(clampPlayerValue(finalSeek, 0, duration));
    }

    pendingSeekSecondsRef.current = null;
    setDragPreviewSeconds(null);
  }, [duration, onSeek]);

  return {
    duration,
    displayProgress,
    progressPercent,
    hoverPercent: hoverPreview?.percent ?? null,
    hoverTime: hoverPreview?.time ?? null,
    isDragging: dragPreviewSeconds !== null,
    progressTrackRef,
    onTrackClick,
    onTrackMouseMove,
    onTrackMouseLeave,
    onRangeStart,
    onRangeChange,
    onRangeCommit,
  };
}
