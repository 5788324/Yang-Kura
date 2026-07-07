import type { PlayerState } from '../types';

export type Mvp73PlayerFocusTone = 'sky' | 'emerald' | 'violet' | 'amber' | 'zinc';

export interface Mvp73PlayerFocusChip {
  label: string;
  tone: Mvp73PlayerFocusTone;
}

export interface Mvp73PlayerFocusCard {
  title: string;
  description: string;
  tone: Mvp73PlayerFocusTone;
}

export interface Mvp73PlayerDailyVisualFocusModel {
  eyebrow: string;
  title: string;
  subtitle: string;
  modeLabel: string;
  focusLine: string;
  chips: Mvp73PlayerFocusChip[];
  cards: Mvp73PlayerFocusCard[];
  hiddenMaintenanceNote: string;
}

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const hasSubtitle = (playerState: PlayerState): boolean => {
  const track = playerState.currentTrack;
  if (!track) return false;
  return (
    (track.subtitleRelativePaths?.length ?? 0) > 0 ||
    track.lyricsLoadStatus === 'loaded' ||
    (track.lyrics?.length ?? 0) > 0
  );
};

const getModeLabel = (mode: 'classic' | 'vinyl' | 'lyrics'): string => {
  if (mode === 'vinyl') return '黑胶沉浸';
  if (mode === 'lyrics') return '歌词专注';
  return '播放详情';
};

const getCompletionLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '播完本轨停止';
  if (mode === 'stop-after-work') return '播完本作品停止';
  return '连续播放';
};

export const playerDailyVisualFocusService = {
  getChipClass(tone: Mvp73PlayerFocusTone): string {
    if (tone === 'sky') return 'bg-sky-500/10 text-sky-200 border-sky-400/25';
    if (tone === 'emerald') return 'bg-emerald-500/10 text-emerald-200 border-emerald-400/25';
    if (tone === 'violet') return 'bg-violet-500/10 text-violet-200 border-violet-400/25';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-200 border-amber-400/25';
    return 'bg-white/5 text-zinc-300 border-white/10';
  },

  getPanelModel(playerState: PlayerState, playerStyle: 'classic' | 'vinyl' | 'lyrics'): Mvp73PlayerDailyVisualFocusModel {
    const track = playerState.currentTrack;
    const modeLabel = getModeLabel(playerStyle);
    if (!track) {
      return {
        eyebrow: 'Yang-Kura 播放页',
        title: '选择音轨后开始播放',
        subtitle: '这里会集中显示封面、歌词、队列和睡前控制。',
        modeLabel,
        focusLine: '从音声库、音乐库或歌单选择音频。',
        chips: [
          { label: modeLabel, tone: 'sky' },
          { label: '等待播放', tone: 'zinc' },
        ],
        cards: [
          { title: '黑胶 / 封面', description: '播放页优先显示封面和当前音轨。', tone: 'violet' },
          { title: '歌词 / 字幕', description: '有歌词时跟随时间，没有歌词也不影响播放。', tone: 'amber' },
          { title: '队列 / 睡前', description: '队列、播放结束策略和睡前低亮度保留在底栏。', tone: 'emerald' },
        ],
        hiddenMaintenanceNote: 'MVP-73 marker: 工程、verifier、MVP 历史信息继续后置到诊断页，不进入播放器日常表层。',
      };
    }

    const progress = Math.max(0, Math.min(playerState.progress || 0, track.duration || 0));
    const remaining = Math.max(0, (track.duration || 0) - progress);
    const subtitleReady = hasSubtitle(playerState);
    const playingLabel = playerState.playbackError ? '播放异常' : playerState.isPlaying ? '正在播放' : '已暂停';

    return {
      eyebrow: track.type === 'asmr' ? '音声播放' : '音乐播放',
      title: track.title,
      subtitle: `${track.artist || '未知作者'} · ${track.album || '本地媒体库'}`,
      modeLabel,
      focusLine: `${formatTime(progress)} / ${formatTime(track.duration)} · 剩余 ${formatTime(remaining)} · ${getCompletionLabel(playerState.playCompletionMode)}`,
      chips: [
        { label: modeLabel, tone: 'sky' },
        { label: playingLabel, tone: playerState.playbackError ? 'amber' : playerState.isPlaying ? 'emerald' : 'zinc' },
        { label: subtitleReady ? '字幕可用' : '暂无字幕', tone: subtitleReady ? 'amber' : 'zinc' },
        { label: `队列 ${playerState.queue.length} 条`, tone: 'violet' },
      ],
      cards: [
        {
          title: playerStyle === 'vinyl' ? '黑胶氛围' : playerStyle === 'lyrics' ? '歌词专注' : '详情播放',
          description: playerStyle === 'lyrics' ? '弱化封面和工程信息，集中阅读当前歌词。' : '突出封面、标题、进度和本地听音控制。',
          tone: 'sky',
        },
        {
          title: subtitleReady ? '字幕已识别' : '音频优先',
          description: subtitleReady ? '歌词页可跟随播放进度显示字幕。' : '没有 LRC / SRT 时仍保持正常播放和队列体验。',
          tone: subtitleReady ? 'amber' : 'zinc',
        },
        {
          title: '睡前控制',
          description: `${getCompletionLabel(playerState.playCompletionMode)}，可配合低亮度屏保使用。`,
          tone: 'emerald',
        },
      ],
      hiddenMaintenanceNote: 'MVP-73 marker: 播放器表层只展示听音信息；工程、verifier、MVP 历史、IPC、Scanner、Contract 信息不进入播放器可见区域。',
    };
  },
};

// MVP-73 verification note: 工程、verifier、MVP 历史、Electron、IPC、Scanner、Contract 信息不进入播放器可见区域。
// Safety note: 不接 SQLite；不删除、移动、重命名真实媒体文件；不向 Renderer 暴露 absolutePath；不向 Renderer 暴露 file://。
