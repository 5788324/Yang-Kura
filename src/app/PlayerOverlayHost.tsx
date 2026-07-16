import { Suspense, lazy } from 'react';
import { Headphones, Play, X } from 'lucide-react';
import type { AudioTrack, PlayerState, RJWork } from '../types';

const LyricsPanel = lazy(() => import('../components/LyricsPanel'));

export interface ResumePlaybackPrompt {
  show: boolean;
  track: AudioTrack;
  progress: number;
}

export interface PlayerOverlayHostProps {
  isLyricsOpen: boolean;
  resumePrompt: ResumePlaybackPrompt | null;
  playerState: PlayerState;
  rjWorks: RJWork[];
  favorites: string[];
  onCloseLyrics: () => void;
  onDismissResume: () => void;
  onResumePlayback: (prompt: ResumePlaybackPrompt) => void;
  onPlayTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  togglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (progress: number) => void;
  onVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: (trackId: string) => void;
  toggleLoopMode: () => void;
  toggleCompletionMode: () => void;
}

export default function PlayerOverlayHost({
  isLyricsOpen,
  resumePrompt,
  playerState,
  rjWorks,
  favorites,
  onCloseLyrics,
  onDismissResume,
  onResumePlayback,
  onPlayTrack,
  togglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  toggleMute,
  toggleFavorite,
  toggleLoopMode,
  toggleCompletionMode,
}: PlayerOverlayHostProps) {
  return (
    <>
      {isLyricsOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-sm text-white">正在打开播放详情…</div>}>
          <LyricsPanel
            playerState={playerState}
            onClose={onCloseLyrics}
            onPlayTrack={(track) => onPlayTrack(track)}
            rjWorks={rjWorks}
            togglePlay={togglePlay}
            onPrev={onPrev}
            onNext={onNext}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            toggleMute={toggleMute}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            toggleLoopMode={toggleLoopMode}
            toggleCompletionMode={toggleCompletionMode}
          />
        </Suspense>
      )}

      {resumePrompt?.show && (
        <div
          id="legacy-resume-toast"
          role="status"
          className="fixed bottom-24 left-6 z-50 max-w-[calc(100vw-3rem)] sm:max-w-sm p-4 rounded-xl bg-card-bg/95 backdrop-blur-xl border border-brand-color/50 shadow-2xl flex flex-col space-y-3"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-brand-color/10 text-brand-color flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-text-primary">秒级断点续播</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                检测到上次播放到《{resumePrompt.track.title}》第{' '}
                <span className="font-mono text-brand-color font-bold">
                  {Math.floor(resumePrompt.progress / 60)}:{resumePrompt.progress % 60 < 10 ? '0' : ''}{resumePrompt.progress % 60}
                </span>{' '}
                秒。是否继续播放？
              </p>
            </div>
            <button
              type="button"
              aria-label="关闭续播提示"
              onClick={onDismissResume}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-end space-x-2 text-[10px]">
            <button
              type="button"
              onClick={onDismissResume}
              className="px-2.5 py-1.5 rounded bg-zinc-900 text-text-secondary hover:text-text-primary transition-colors font-semibold cursor-pointer"
            >
              忽略
            </button>
            <button
              type="button"
              onClick={() => onResumePlayback(resumePrompt)}
              className="px-3 py-1.5 rounded bg-brand-color hover:bg-brand-color-hover text-white flex items-center space-x-1.5 font-bold transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current text-white" />
              <span>恢复续播</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
