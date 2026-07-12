import type { RefObject } from 'react';
import { ChevronDown } from 'lucide-react';

export type FullPlayerStyle = 'classic' | 'vinyl' | 'lyrics';

interface FullPlayerHeaderProps {
  isInactive: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  playerStyle: FullPlayerStyle;
  onPlayerStyleChange: (style: FullPlayerStyle) => void;
  modeTitle: string;
  sourceHint: string;
}

const styleOptions: Array<{ value: FullPlayerStyle; label: string }> = [
  { value: 'classic', label: '经典模式' },
  { value: 'vinyl', label: '黑胶唱片' },
  { value: 'lyrics', label: '歌词模式' },
];

/**
 * Pure header for the full-screen player.
 * It renders navigation and view selection only; player commands and lifecycle
 * behavior remain owned by LyricsPanel and its dedicated hooks.
 */
export default function FullPlayerHeader({
  isInactive,
  closeButtonRef,
  onClose,
  playerStyle,
  onPlayerStyleChange,
  modeTitle,
  sourceHint,
}: FullPlayerHeaderProps) {
  return (
    <div
      id="mvp78-player-header-wrap-safe"
      className={`relative z-10 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 bg-transparent backdrop-blur-sm transition-all duration-700 ${
        isInactive ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center space-x-4">
        <button
          ref={closeButtonRef}
          id="lyrics-close-btn"
          onClick={onClose}
          className="p-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5 border border-white/5 active:scale-95"
          title="收起播放页"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="text-xs font-semibold">返回</span>
        </button>

        <div aria-hidden="true" className="hidden sm:flex items-center space-x-1.5 pl-2">
          <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
          <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/20" />
        </div>
      </div>

      <div className="order-3 w-full justify-center sm:order-none sm:w-auto flex flex-wrap bg-white/5 border border-white/10 p-0.5 rounded-full text-xs font-semibold shadow-inner">
        {styleOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPlayerStyleChange(option.value)}
            className={`px-3 sm:px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              playerStyle === option.value
                ? 'bg-brand-color text-white shadow-md font-bold scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="text-right hidden sm:block">
        <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold tracking-wider">
          {modeTitle}
        </span>
        <p className="text-[10px] text-zinc-400 mt-1">{sourceHint}</p>
      </div>
    </div>
  );
}
