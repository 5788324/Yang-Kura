import type React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import CoverArtwork from '../components/CoverArtwork';
import { dailyListeningSurfaceService } from '../services/dailyListeningSurfaceService';
import type { AudioTrack, PlayerState } from '../types';

export interface QueueDrawerProps {
  open: boolean;
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  onClose: () => void;
  onPlayTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
}

export default function QueueDrawer({
  open,
  playerState,
  setPlayerState,
  onClose,
  onPlayTrack,
}: QueueDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
      window.requestAnimationFrame(() => document.getElementById('player-queue-toggle')?.focus({ preventScroll: true }));
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const queueSurface = dailyListeningSurfaceService.getQueueSummary(playerState);

  return (
    <div
      id="u29-queue-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="当前播放队列"
      className="absolute right-0 top-0 bottom-0 w-[min(20rem,calc(100vw-3rem))] bg-sidebar-bg/95 backdrop-blur-xl border-l border-border-color z-40 p-4 shadow-2xl flex flex-col justify-between animate-fade-in"
    >
      <div className="flex-1 overflow-hidden flex flex-col">
        <div id="mvp42-queue-drawer-surface" className="border-b border-border-color pb-3 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-text-primary">{queueSurface.title}</span>
              <p className="text-[10px] text-text-muted leading-relaxed">{queueSurface.description}</p>
            </div>
            <button
              id="queue-close-button"
              type="button"
              aria-label="关闭播放队列"
              onClick={onClose}
              className="p-1 rounded hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-bg-primary/45 border border-border-color/50 p-2">
              <p className="text-[9px] text-text-muted">待播</p>
              <p className="text-xs font-bold text-text-primary">{queueSurface.queueCount} 首</p>
            </div>
            <div className="rounded-xl bg-bg-primary/45 border border-border-color/50 p-2">
              <p className="text-[9px] text-text-muted">总时长</p>
              <p className="text-xs font-bold text-text-primary">{queueSurface.totalDurationLabel}</p>
            </div>
            <div className="rounded-xl bg-bg-primary/45 border border-border-color/50 p-2">
              <p className="text-[9px] text-text-muted">位置</p>
              <p className="text-xs font-bold text-text-primary">{queueSurface.currentIndexLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {queueSurface.badges.map((badge) => (
              <span
                key={`${badge.label}-${badge.tone}`}
                className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${dailyListeningSurfaceService.getBadgeClass(badge.tone)}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
          {playerState.queue.length === 0 ? (
            <p className="text-xs text-text-muted italic text-center py-12">{queueSurface.emptyHint}</p>
          ) : (
            playerState.queue.map((track, index) => {
              const isPlayingThis = playerState.currentTrack?.id === track.id;
              return (
                <button
                  type="button"
                  key={`${track.id}_q_${index}`}
                  data-queue-track-id={track.id}
                  data-queue-current={isPlayingThis ? 'true' : 'false'}
                  onClick={() => onPlayTrack(track, playerState.queue)}
                  className={`w-full text-left flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all border ${isPlayingThis ? 'bg-brand-color/15 border-brand-color text-brand-color' : 'hover:bg-hover-bg border-transparent text-text-primary'}`}
                >
                  <CoverArtwork
                    src={track.coverUrl}
                    title={track.title}
                    subtitle={track.artist}
                    kind={track.type === 'asmr' ? 'asmr' : 'music'}
                    className="w-8 h-8 rounded object-cover shadow-sm flex-shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold truncate">{track.title}</span>
                    <span className="block text-[9px] text-text-secondary truncate mt-0.5">{track.artist}</span>
                    <span className="flex flex-wrap gap-1 mt-1">
                      {dailyListeningSurfaceService.getTrackBadges(track, isPlayingThis).slice(0, 3).map((badge) => (
                        <span
                          key={`${track.id}-${badge.label}`}
                          className={`text-[8px] px-1.5 py-0.5 rounded-full border ${dailyListeningSurfaceService.getBadgeClass(badge.tone)}`}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="text-[9px] text-text-muted font-mono">{Math.floor(track.duration / 60)}分</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border-color text-center">
        <button
          type="button"
          onClick={() => setPlayerState((previous) => ({
            ...previous,
            queue: [],
            currentTrack: null,
            isPlaying: false,
            currentIndex: -1,
            progress: 0,
            playbackMode: 'idle',
            playbackError: null,
            resolvedMediaUrl: null,
          }))}
          className="text-[10px] text-rose-400 hover:text-rose-500 font-bold tracking-wider hover:underline w-full cursor-pointer"
        >
          清空当前播放队列
        </button>
      </div>
    </div>
  );
}
