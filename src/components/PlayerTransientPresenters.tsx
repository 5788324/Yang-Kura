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
      className="absolute bottom-12 right-0 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-left animate-fade-in max-h-56 overflow-y-auto"
      role="menu"
      aria-label="收藏到歌单"
    >
      <div className="text-[10px] font-bold text-zinc-400 px-2 py-1 border-b border-zinc-800/60 mb-1 flex items-center justify-between">
        <span>请选择收藏的歌单</span>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          title="关闭歌单选择"
          aria-label="关闭歌单选择"
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      </div>

      {playlists.length === 0 ? (
        <p className="text-[9px] text-zinc-500 p-2 text-center">暂无自定义歌单</p>
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
                className={`w-full text-left text-[11px] rounded px-2 py-1.5 transition-colors flex items-center justify-between truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isReadOnly
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-300 hover:text-sky-400 hover:bg-zinc-900/60'
                }`}
              >
                <span className="truncate flex-1 pr-1">{playlist.name}</span>
                {isReadOnly ? (
                  <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1 rounded flex-shrink-0 font-bold">
                    只读
                  </span>
                ) : exists ? (
                  <span className="text-[8px] bg-sky-500/15 text-sky-400 px-1 rounded flex-shrink-0 font-bold">
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
      className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-xl shadow-2xl flex flex-col items-center space-y-2.5 z-50 w-9 h-32 animate-fade-in"
      style={{ contentVisibility: 'auto' }}
      role="group"
      aria-label="音量调节"
    >
      <div className="absolute -bottom-4 left-0 right-0 h-4 bg-transparent cursor-pointer" aria-hidden="true" />

      <span className="text-[8px] font-mono font-extrabold text-zinc-400 leading-none">
        {Math.round(visibleVolumePercent)}%
      </span>
      <div className="relative w-1.5 h-16 bg-zinc-900 rounded-full flex flex-col justify-end overflow-hidden cursor-pointer">
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
          className="w-full bg-sky-400 rounded-full transition-all"
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
      className="absolute bottom-4 bg-zinc-950/95 border border-zinc-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-mono pointer-events-none transform -translate-x-1/2 z-[99] shadow-2xl backdrop-blur-xl transition-all duration-75 flex flex-col items-center gap-0.5 border-b-2 border-b-sky-500"
      style={{ left: `${percent * 100}%` }}
      aria-hidden="true"
    >
      <span className="text-sky-300 font-bold text-xs tracking-wider">{timeLabel}</span>
      <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-sans font-bold">跳转预览</span>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
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
    <div className="flex items-center space-x-3 text-zinc-500" role="status">
      <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800/40 flex items-center justify-center">
        <Sparkles className="w-4.5 h-4.5 text-sky-400" aria-hidden="true" />
      </div>
      <div className="text-xs leading-relaxed">
        <p className="font-bold text-zinc-300">{title}</p>
        <p id="mvp59-player-empty-hint" className="text-[10px] text-zinc-500">{hint}</p>
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
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 px-6 py-3.5 rounded-2xl shadow-2xl z-50 transition-all min-w-[340px] max-w-[550px] text-center flex items-center justify-between gap-4 select-none hover:bg-zinc-900 animate-bounce-subtle"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center space-x-1.5 mb-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
          <p className="text-[9px] text-sky-400 font-extrabold tracking-wider uppercase font-mono">
            歌词浮窗同步
          </p>
        </div>
        <p className="text-[11px] font-bold text-white truncate drop-shadow-sm leading-relaxed">
          {text}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
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
      className="fixed bottom-24 right-6 z-50 bg-sky-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-[11px] font-bold flex items-center space-x-1.5 animate-fade-in border border-sky-400/20"
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
    </div>
  );
}
