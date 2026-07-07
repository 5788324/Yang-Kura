import type { AudioTrack, PlayerState } from '../types';

export type PlayerVisualPolishTone = 'brand' | 'sky' | 'purple' | 'green' | 'amber' | 'muted';

export interface PlayerVisualChip {
  label: string;
  tone: PlayerVisualPolishTone;
}

export interface PlayerVisualProgressModel {
  label: string;
  percent: number;
  remainingLabel: string;
}

export interface PlayerVisualBarModel {
  contextLine: string;
  chips: PlayerVisualChip[];
  progress: PlayerVisualProgressModel;
}

export interface PlayerVisualPanelModel {
  title: string;
  subtitle: string;
  modeHint: string;
  progress: PlayerVisualProgressModel;
  chips: PlayerVisualChip[];
  emptyLyricHint: string;
}

export interface PlayerVisualDiagnosticsModel {
  title: string;
  description: string;
  cards: Array<{
    title: string;
    description: string;
    tone: PlayerVisualPolishTone;
  }>;
  safetyRules: string[];
}

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const hasSubtitle = (track: AudioTrack): boolean =>
  (track.subtitleRelativePaths?.length ?? 0) > 0 ||
  track.lyricsLoadStatus === 'loaded' ||
  (track.lyrics?.length ?? 0) > 0;

const getSourceChip = (track: AudioTrack): PlayerVisualChip =>
  track.playbackSourceKind === 'tokenized-local-file'
    ? { label: '本地音频', tone: 'green' }
    : { label: '示例音频', tone: 'muted' };

const getProgressModel = (playerState: PlayerState): PlayerVisualProgressModel => {
  const track = playerState.currentTrack;
  if (!track || !track.duration) {
    return { label: '暂无进度', percent: 0, remainingLabel: '等待播放' };
  }
  const safeProgress = Math.max(0, Math.min(playerState.progress || 0, track.duration));
  const percent = Math.round((safeProgress / track.duration) * 100);
  const remainingSeconds = Math.max(0, track.duration - safeProgress);
  return {
    label: `${formatTime(safeProgress)} / ${formatTime(track.duration)}`,
    percent,
    remainingLabel: remainingSeconds > 0 ? `剩余 ${formatTime(remainingSeconds)}` : '已到结尾',
  };
};

const getPlaybackChip = (playerState: PlayerState): PlayerVisualChip => {
  if (!playerState.currentTrack) return { label: '等待播放', tone: 'muted' };
  if (playerState.playbackError) return { label: '播放异常', tone: 'amber' };
  if (playerState.playbackMode === 'resolving-local-media') return { label: '读取音频', tone: 'sky' };
  if (playerState.isPlaying) return { label: '正在播放', tone: 'green' };
  return { label: '已暂停', tone: 'muted' };
};

const getCompletionLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '播完本轨停止';
  if (mode === 'stop-after-work') return '播完本作品停止';
  return '连续播放';
};

const getTrackTypeLabel = (track: AudioTrack): PlayerVisualChip =>
  track.type === 'asmr'
    ? { label: '音声', tone: 'purple' }
    : { label: '音乐', tone: 'sky' };

// MVP-50: player visual polish stays presentation-only and media-first.
export const playerVisualPolishService = {
  getChipClass(tone: PlayerVisualPolishTone): string {
    if (tone === 'brand') return 'bg-brand-color/15 text-brand-color border-brand-color/30';
    if (tone === 'sky') return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    if (tone === 'purple') return 'bg-purple-500/10 text-purple-300 border-purple-500/25';
    if (tone === 'green') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    return 'bg-white/5 text-zinc-400 border-white/10';
  },

  getPlayerBarModel(playerState: PlayerState): PlayerVisualBarModel {
    const track = playerState.currentTrack;
    const progress = getProgressModel(playerState);
    if (!track) {
      return {
        contextLine: '从音声库或音乐库选择音轨开始播放',
        progress,
        chips: [{ label: '等待播放', tone: 'muted' }],
      };
    }

    return {
      contextLine: `${progress.label} · ${progress.remainingLabel} · 队列 ${playerState.queue.length} 条`,
      progress,
      chips: [
        getPlaybackChip(playerState),
        getTrackTypeLabel(track),
        getSourceChip(track),
        { label: hasSubtitle(track) ? '有字幕' : '无字幕', tone: hasSubtitle(track) ? 'amber' : 'muted' },
      ],
    };
  },

  getLyricsPanelModel(playerState: PlayerState, playerStyle: 'classic' | 'vinyl' | 'lyrics'): PlayerVisualPanelModel {
    const track = playerState.currentTrack;
    const progress = getProgressModel(playerState);
    if (!track) {
      return {
        title: 'Yang-Kura 播放页',
        subtitle: '等待播放',
        modeHint: '选择音轨后显示播放器大页',
        progress,
        chips: [{ label: '等待播放', tone: 'muted' }],
        emptyLyricHint: '暂无音轨。',
      };
    }

    const modeLabel = playerStyle === 'vinyl' ? '黑胶模式' : playerStyle === 'lyrics' ? '歌词模式' : '经典模式';
    return {
      title: track.title,
      subtitle: `${track.artist} · ${track.album}`,
      modeHint: `${modeLabel} · ${getCompletionLabel(playerState.playCompletionMode)} · ${progress.remainingLabel}`,
      progress,
      chips: [
        getPlaybackChip(playerState),
        getTrackTypeLabel(track),
        getSourceChip(track),
        { label: hasSubtitle(track) ? '字幕已识别' : '暂无字幕', tone: hasSubtitle(track) ? 'amber' : 'muted' },
      ],
      emptyLyricHint: hasSubtitle(track)
        ? '字幕文件已识别，但当前没有可显示的时间轴内容。'
        : '暂无歌词或字幕；仍可正常播放本地音频。',
    };
  },

  getDiagnosticsModel(): PlayerVisualDiagnosticsModel {
    return {
      title: 'MVP-50 播放器视觉继续打磨',
      description: '本轮只整理播放器底栏和播放页的视觉状态、进度提示与字幕空状态，不改变扫描、索引、播放、字幕和打包链路。',
      cards: [
        {
          title: '底部播放器更像媒体控件',
          description: '增加进度语境、剩余时长和队列数量提示，减少工具面板感。',
          tone: 'sky',
        },
        {
          title: '播放页信息更集中',
          description: '播放页顶部增加当前模式、播放策略、进度和来源状态，便于全屏听音频。',
          tone: 'purple',
        },
        {
          title: '字幕空状态更清楚',
          description: '没有字幕时明确说明不影响播放，避免误判为音频异常。',
          tone: 'amber',
        },
      ],
      safetyRules: [
        '不接 SQLite',
        '不接下载器或元数据抓取',
        '不接 mpv 后端',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或本地文件 URL',
      ],
    };
  },
};
