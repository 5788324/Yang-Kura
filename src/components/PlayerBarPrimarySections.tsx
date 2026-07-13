import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import type { AudioTrack, PlayerState } from '../types';
import CoverArtwork from './CoverArtwork';

interface StatusBadge {
  label: string;
  tone: string;
}

interface PlayerTrackSummaryProps {
  track: AudioTrack;
  isPlaying: boolean;
  isLiked: boolean;
  playbackError?: string | null;
  playbackNotice?: string | null;
  compactStatus: string;
  visibleBadges: string[];
  hiddenMaintenanceNote: string;
  completionModeDescription: string;
  statusBadges: StatusBadge[];
  visualContextLine: string;
  regressionLine: string;
  compactLine: string;
  onOpenLyrics: () => void;
  onToggleFavorite: () => void;
}

export function PlayerTrackSummary({
  track,
  isPlaying,
  isLiked,
  playbackError,
  playbackNotice,
  compactStatus,
  visibleBadges,
  hiddenMaintenanceNote,
  completionModeDescription,
  statusBadges,
  visualContextLine,
  regressionLine,
  compactLine,
  onOpenLyrics,
  onToggleFavorite,
}: PlayerTrackSummaryProps) {
  return (
    <>
      <div
        onClick={onOpenLyrics}
        className={`relative w-12 h-12 rounded-full overflow-hidden bg-black/60 border border-zinc-800 flex-shrink-0 cursor-pointer shadow-xl group/album transition-transform hover:scale-105 ${
          isPlaying ? 'animate-spin-slow' : ''
        }`}
        role="button"
        tabIndex={0}
        aria-label={`打开《${track.title}》全屏歌词`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpenLyrics();
          }
        }}
      >
        <CoverArtwork
          src={track.coverUrl}
          title={track.title}
          subtitle={track.artist}
          kind={track.type === 'asmr' ? 'asmr' : 'music'}
          className="w-full h-full object-cover rounded-full p-1"
          rounded
        />
        <div className="absolute inset-0 m-auto w-3.5 h-3.5 bg-zinc-950 border border-zinc-700 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenLyrics}
            className="text-[13px] font-bold text-zinc-100 hover:text-sky-400 cursor-pointer transition-colors truncate text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 rounded"
            title={track.title}
          >
            {track.title}
          </button>
          <span className="text-[8px] bg-sky-500/15 text-sky-400 border border-sky-500/25 px-1 py-px rounded font-extrabold uppercase tracking-wide flex-shrink-0">
            本地
          </span>
        </div>
        <p className="text-xs text-zinc-400 truncate mt-1" title={track.artist}>
          {track.artist}
        </p>
        {playbackError ? (
          <p className="text-[9px] text-rose-300 truncate mt-0.5" title={playbackError}>
            播放失败：{playbackError}
          </p>
        ) : playbackNotice ? (
          <p className="text-[9px] text-amber-300 truncate mt-0.5" title={playbackNotice}>
            播放提示：{playbackNotice}
          </p>
        ) : (
          <>
            <div
              id="mvp74-playerbar-daily-control-strip"
              className="mt-1.5 flex items-center gap-1.5 text-[9px] text-zinc-400 truncate"
              title={hiddenMaintenanceNote}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400/90 flex-shrink-0" />
              <span className="truncate">{compactStatus}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {visibleBadges.slice(0, 3).map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-zinc-300">
                  {badge}
                </span>
              ))}
            </div>
            <div id="mvp49-player-status-strip" hidden aria-hidden="true" title={completionModeDescription}>
              {statusBadges.slice(0, 3).map((badge) => (
                <span key={`${badge.label}-${badge.tone}`}>{badge.label}</span>
              ))}
            </div>
            <div id="mvp50-player-visual-strip" hidden aria-hidden="true" title={visualContextLine}>
              <span>{visualContextLine}</span>
            </div>
            <div id="mvp54-player-regression-strip" hidden aria-hidden="true" title={regressionLine}>
              <span>{regressionLine}</span>
            </div>
            <div id="mvp59-player-compact-strip" hidden aria-hidden="true" title={compactLine}>
              <span>{compactLine}</span>
            </div>
            <div id="mvp74-playerbar-maintenance-markers" hidden aria-hidden="true">
              {hiddenMaintenanceNote}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center pl-3 border-l border-zinc-800/80 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleFavorite}
          className="flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors group/heart focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 rounded"
          title={isLiked ? '取消喜欢' : '喜欢这首音声'}
          aria-label={isLiked ? '取消喜欢' : '添加到喜欢'}
          aria-pressed={isLiked}
        >
          <Heart
            className={`w-4.5 h-4.5 transition-all ${
              isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'group-hover/heart:scale-110'
            }`}
            aria-hidden="true"
          />
          <span className="text-[10px] font-bold text-zinc-500 group-hover/heart:text-zinc-300">
            喜欢
          </span>
        </button>
      </div>
    </>
  );
}

interface PlayerTransportControlsProps {
  hasTrack: boolean;
  loopMode: PlayerState['loopMode'];
  playbackMode: PlayerState['playbackMode'];
  isPlaying: boolean;
  isQueueOpen: boolean;
  queueCount: number;
  currentTimeLabel: string;
  durationLabel: string;
  onToggleLoopMode: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleQueue: () => void;
}

export function PlayerTransportControls({
  hasTrack,
  loopMode,
  playbackMode,
  isPlaying,
  isQueueOpen,
  queueCount,
  currentTimeLabel,
  durationLabel,
  onToggleLoopMode,
  onPrevious,
  onTogglePlay,
  onNext,
  onToggleQueue,
}: PlayerTransportControlsProps) {
  const loopLabel = loopMode === 'shuffle' ? '随机播放' : loopMode === 'one' ? '单曲循环' : '列表循环';
  const playLabel = playbackMode === 'resolving-local-media' ? '正在解析本地音频' : isPlaying ? '暂停' : '播放';

  return (
    <div className="flex-1 flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
      <div
        className="flex items-center bg-zinc-900/40 border border-zinc-900 px-5 py-2.5 rounded-full shadow-inner space-x-5"
        role="group"
        aria-label="播放控制"
      >
        <button
          type="button"
          onClick={onToggleLoopMode}
          disabled={!hasTrack}
          className={`p-1.5 rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
            !hasTrack ? 'opacity-30' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer hover:scale-105'
          }`}
          title={loopLabel}
          aria-label={`切换播放模式，当前为${loopLabel}`}
        >
          {loopMode === 'shuffle' ? (
            <Shuffle className="w-4 h-4 text-sky-400" aria-hidden="true" />
          ) : loopMode === 'one' ? (
            <Repeat1 className="w-4 h-4 text-pink-400" aria-hidden="true" />
          ) : (
            <Repeat className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasTrack}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-200 disabled:opacity-30 transition-all cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          title="上一首"
          aria-label="上一首"
        >
          <SkipBack className="w-4.5 h-4.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!hasTrack}
          className="w-11 h-11 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          title={playLabel}
          aria-label={playLabel}
          aria-pressed={isPlaying}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" aria-hidden="true" />
          ) : (
            <Play className="w-5 h-5 text-white translate-x-0.5" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasTrack}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-200 disabled:opacity-30 transition-all cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          title="下一首"
          aria-label="下一首"
        >
          <SkipForward className="w-4.5 h-4.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleQueue}
          disabled={!hasTrack}
          className={`p-1.5 rounded-lg transition-all flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
            !hasTrack ? 'opacity-30' : ''
          } ${
            isQueueOpen
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer hover:scale-105'
          }`}
          title="当前播放队列"
          aria-label={`当前播放队列，共 ${queueCount} 首`}
          aria-pressed={isQueueOpen}
        >
          <ListMusic className="w-4 h-4" aria-hidden="true" />
          <span className="text-[9px] font-mono font-bold ml-1 text-zinc-500">{queueCount}</span>
        </button>

        <div className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1 pl-3.5 border-l border-zinc-800" aria-label={`播放时间 ${currentTimeLabel}，总时长 ${durationLabel}`}>
          <span className="text-sky-400 font-bold">{currentTimeLabel}</span>
          <span className="text-zinc-600">/</span>
          <span>{durationLabel}</span>
        </div>
      </div>
    </div>
  );
}
