import type { ChangeEvent, CSSProperties } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { AudioTrack, Playlist } from '../types';

interface PlayerPlaylistMenuProps {
  currentTrack: AudioTrack;
  playlists: Playlist[];
  onClose: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export function PlayerPlaylistMenu({
  currentTrack,
  playlists,
  onClose,
  onSelectPlaylist,
}: PlayerPlaylistMenuProps) {
  return (
    <div
      className="absolute bottom-12 right-0 w-52 bg-player-bg/95 border border-border-color rounded-xl shadow-2xl p-2 z-50 text-left animate-fade-in max-h-56 overflow-y-auto backdrop-blur-xl"
      role="menu"
      aria-label="收藏到歌单"
    >
      <div className="text-[10px] font-bold text-text-secondary px-2 py-1 border-b border-border-color/70 mb-1 flex items-center justify-between">
        <span>请选择收藏的歌单</span>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-hover-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color"
          title="关闭歌单选择"
          aria-label="关闭歌单选择"
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      </div>

      {playlists.length === 0 ? (
        <p className="text-[9px] text-text-muted p-2 text-center">暂无自定义歌单</p>
      ) : (
        <div className="space-y-0.5">
          {playlists.map((playlist) => {
            const exists = playlist.tracks.some((track) => track.id === currentTrack.id);
            const isReadOnly = Boolean(playlist.isSystem);

            return (
              <button
                key={playlist.id}
                type="button"
                role="menuitem"
                disabled={isReadOnly}
                onClick={() => onSelectPlaylist(playlist)}
                className={`w-full text-left text-[11px] rounded px-2 py-1.5 transition-colors flex items-center justify-between truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color ${
                  isReadOnly
                    ? 'text-text-muted cursor-not-allowed opacity-60'
                    : 'text-text-secondary hover:text-brand-color hover:bg-hover-bg'
                }`}
              >
                <span className="truncate flex-1 pr-1">{playlist.name}</span>
                {isReadOnly ? (
                  <span className="text-[8px] bg-card-bg text-text-muted border border-border-color px-1 rounded flex-shrink-0 font-bold">
                    只读
                  </span>
                ) : exists ? (
                  <span className="text-[8px] bg-brand-color/15 text-brand-color border border-brand-color/20 px-1 rounded flex-shrink-0 font-bold">
                    已收藏
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PlayerVolumePopoverProps {
  visibleVolume: number;
  visibleVolumePercent: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PlayerVolumePopover({
  visibleVolume,
  visibleVolumePercent,
  onChange,
}: PlayerVolumePopoverProps) {
  return (
    <div
      className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-player-bg/95 border border-border-color p-3.5 rounded-xl shadow-2xl flex flex-col items-center space-y-2.5 z-50 w-9 h-32 animate-fade-in backdrop-blur-xl"
      style={{ contentVisibility: 'auto' }}
      role="group"
      aria-label="音量调节"
    >
      <div className="absolute -bottom-4 left-0 right-0 h-4 bg-transparent cursor-pointer" aria-hidden="true" />

      <span className="text-[8px] font-mono font-extrabold text-text-secondary leading-none">
        {Math.round(visibleVolumePercent)}%
      </span>
      <div className="relative w-1.5 h-16 bg-border-color rounded-full flex flex-col justify-end overflow-hidden cursor-pointer">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={visibleVolume}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer origin-bottom"
          style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as CSSProperties}
          aria-label="播放音量"
        />
        <div
          className="w-full bg-brand-color rounded-full transition-all"
          style={{ height: `${visibleVolumePercent}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface PlayerSeekPreviewProps {
  percent: number;
  timeLabel: string;
}

export function PlayerSeekPreview({ percent, timeLabel }: PlayerSeekPreviewProps) {
  return (
    <div
      className="absolute bottom-4 bg-player-bg/95 border border-border-color text-text-primary px-3 py-1.5 rounded-xl text-[10px] font-mono pointer-events-none transform -translate-x-1/2 z-[99] shadow-2xl backdrop-blur-xl transition-all duration-75 flex flex-col items-center gap-0.5 border-b-2 border-b-brand-color"
      style={{ left: `${percent * 100}%` }}
      aria-hidden="true"
    >
      <span className="text-brand-color font-bold text-xs tracking-wider">{timeLabel}</span>
      <span className="text-[7.5px] text-text-muted uppercase tracking-widest font-sans font-bold">跳转预览</span>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-player-bg border-r border-b border-border-color rotate-45" />
    </div>
  );
}

interface PlayerEmptyStateProps {
  title: string;
  hint: string;
  regressionLine: string;
}

export function PlayerEmptyState({ title, hint, regressionLine }: PlayerEmptyStateProps) {
  return (
    <div className="flex items-center space-x-3 text-text-muted" role="status">
      <div className="w-11 h-11 rounded-full bg-card-bg border border-border-color flex items-center justify-center">
        <Sparkles className="w-4.5 h-4.5 text-brand-color" aria-hidden="true" />
      </div>
      <div className="text-xs leading-relaxed">
        <p className="font-bold text-text-primary">{title}</p>
        <p id="mvp59-player-empty-hint" className="text-[10px] text-text-muted">{hint}</p>
        <p id="mvp50-player-empty-hint" hidden aria-hidden="true">播放器会显示播放进度、字幕状态和队列数量</p>
        <p id="mvp54-player-empty-regression-hint" hidden aria-hidden="true">{regressionLine}</p>
      </div>
    </div>
  );
}

interface PlayerFloatingLyricsProps {
  text: string;
  onClose: () => void;
}

export function PlayerFloatingLyrics({ text, onClose }: PlayerFloatingLyricsProps) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-player-bg/90 backdrop-blur-xl border border-border-color px-6 py-3.5 rounded-2xl shadow-2xl z-50 transition-all min-w-[340px] max-w-[550px] text-center flex items-center justify-between gap-4 select-none hover:bg-card-bg animate-bounce-subtle"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center space-x-1.5 mb-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
          <p className="text-[9px] text-brand-color font-extrabold tracking-wider uppercase font-mono">
            歌词浮窗同步
          </p>
        </div>
        <p className="text-[11px] font-bold text-text-primary truncate drop-shadow-sm leading-relaxed">
          {text}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded bg-card-bg hover:bg-hover-bg text-text-muted hover:text-text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-color"
        title="关闭歌词浮窗"
        aria-label="关闭歌词浮窗"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

interface PlayerToastProps {
  message: string;
}

export function PlayerToast({ message }: PlayerToastProps) {
  return (
    <div
      className="fixed bottom-24 right-6 z-50 bg-brand-color text-white px-4 py-2.5 rounded-xl shadow-2xl text-[11px] font-bold flex items-center space-x-1.5 animate-fade-in border border-brand-color-hover/30"
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
    </div>
  );
}
