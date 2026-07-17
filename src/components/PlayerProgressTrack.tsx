import type {
  ChangeEventHandler,
  MouseEventHandler,
  RefObject,
} from 'react';
import { PlayerSeekPreview } from './PlayerTransientPresenters';

interface PlayerProgressTrackProps {
  hasTrack: boolean;
  duration: number;
  displayProgress: number;
  progressPercent: number;
  isDragging: boolean;
  hoverPercent: number | null;
  hoverTimeLabel: string | null;
  progressTrackRef: RefObject<HTMLDivElement | null>;
  onTrackMouseMove: MouseEventHandler<HTMLDivElement>;
  onTrackMouseLeave: MouseEventHandler<HTMLDivElement>;
  onTrackClick: MouseEventHandler<HTMLDivElement>;
  onRangeStart: () => void;
  onRangeChange: ChangeEventHandler<HTMLInputElement>;
  onRangeCommit: () => void;
}

export function PlayerProgressTrack({
  hasTrack,
  duration,
  displayProgress,
  progressPercent,
  isDragging,
  hoverPercent,
  hoverTimeLabel,
  progressTrackRef,
  onTrackMouseMove,
  onTrackMouseLeave,
  onTrackClick,
  onRangeStart,
  onRangeChange,
  onRangeCommit,
}: PlayerProgressTrackProps) {
  return (
    <div
      id="mvp75-playerbar-progress-stability"
      ref={progressTrackRef}
      onMouseMove={onTrackMouseMove}
      onMouseLeave={onTrackMouseLeave}
      onClick={onTrackClick}
      className="absolute -top-1.5 left-0 right-0 h-4 flex items-center bg-transparent cursor-pointer group/progress z-50"
      title={hasTrack && duration > 0 ? '点击或拖拽跳转进度' : '等待可播放音轨'}
    >
      <div className="w-full h-1 bg-border-color/80 group-hover/progress:h-1.5 rounded-full relative transition-all duration-150 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-color to-brand-color-hover group-hover/progress:brightness-110 transition-all rounded-r-full relative"
          style={{ width: `${progressPercent}%`, transitionProperty: isDragging ? 'none' : undefined }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-text-primary rounded-full shadow-lg border-2 border-brand-color scale-0 group-hover/progress:scale-100 transition-transform duration-150 z-50"
            aria-hidden="true"
          />
        </div>
      </div>

      {hoverPercent !== null && hoverTimeLabel !== null && hasTrack && (
        <PlayerSeekPreview percent={hoverPercent} timeLabel={hoverTimeLabel} />
      )}

      {hasTrack && (
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={displayProgress}
          disabled={duration <= 0}
          onMouseDown={onRangeStart}
          onTouchStart={onRangeStart}
          onChange={onRangeChange}
          onMouseUp={onRangeCommit}
          onTouchEnd={onRangeCommit}
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="播放进度"
        />
      )}
    </div>
  );
}
