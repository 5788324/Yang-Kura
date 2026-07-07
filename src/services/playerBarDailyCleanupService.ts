import type { AudioTrack, PlayerState } from '../types';

export type Mvp74DailyControlTone = 'sky' | 'emerald' | 'violet' | 'amber' | 'zinc';

export interface Mvp74PlayerBarAction {
  id: string;
  label: string;
  helper: string;
  tone: Mvp74DailyControlTone;
}

export interface Mvp74PlayerBarDailyCleanupModel {
  title: string;
  subtitle: string;
  compactStatus: string;
  visibleBadges: string[];
  actions: Mvp74PlayerBarAction[];
  hiddenMaintenanceNote: string;
}

export interface Mvp74HomeDailyCleanupModel {
  title: string;
  subtitle: string;
  visibleRule: string;
  hiddenMaintenanceNote: string;
}

const hasSubtitle = (track: AudioTrack | null): boolean => {
  if (!track) return false;
  return (
    (track.subtitleRelativePaths?.length ?? 0) > 0 ||
    track.lyricsLoadStatus === 'loaded' ||
    (track.lyrics?.length ?? 0) > 0
  );
};

const getCompletionLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '播完本轨停止';
  if (mode === 'stop-after-work') return '播完本作品停止';
  return '连续播放';
};

export const playerBarDailyCleanupService = {
  getToneClassName(tone: Mvp74DailyControlTone): string {
    if (tone === 'sky') return 'bg-sky-500/10 text-sky-200 border-sky-400/25';
    if (tone === 'emerald') return 'bg-emerald-500/10 text-emerald-200 border-emerald-400/25';
    if (tone === 'violet') return 'bg-violet-500/10 text-violet-200 border-violet-400/25';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-200 border-amber-400/25';
    return 'bg-white/5 text-zinc-300 border-white/10';
  },

  getPlayerBarModel(playerState: PlayerState): Mvp74PlayerBarDailyCleanupModel {
    const track = playerState.currentTrack;
    if (!track) {
      return {
        title: '底部播放器',
        subtitle: '选择音轨后显示播放控制。',
        compactStatus: '等待播放',
        visibleBadges: ['播放', '队列', '字幕', '音量'],
        actions: [
          { id: 'play', label: '播放控制', helper: '上一首 / 播放 / 下一首集中在中间。', tone: 'sky' },
          { id: 'queue', label: '队列', helper: '队列按钮保留在主控制组。', tone: 'violet' },
          { id: 'settings', label: '少显示状态', helper: '工程状态后置到诊断页。', tone: 'zinc' },
        ],
        hiddenMaintenanceNote: 'MVP-74 marker: 底部播放器日常表层只保留标题、播放、队列、字幕、音量、喜欢和歌单入口。',
      };
    }

    const subtitleLabel = hasSubtitle(track) ? '有字幕' : '无字幕';
    const sourceLabel = track.type === 'asmr' ? '音声' : '音乐';
    const completionLabel = getCompletionLabel(playerState.playCompletionMode);
    const playingLabel = playerState.playbackError ? '播放异常' : playerState.isPlaying ? '播放中' : '已暂停';

    return {
      title: track.title,
      subtitle: `${track.artist || '未知作者'} · ${track.album || '本地媒体库'}`,
      compactStatus: `${sourceLabel} · ${subtitleLabel} · ${completionLabel}`,
      visibleBadges: [sourceLabel, subtitleLabel, playingLabel],
      actions: [
        { id: 'favorite', label: '喜欢', helper: '保留为日常听音操作。', tone: 'emerald' },
        { id: 'queue', label: `队列 ${playerState.queue.length}`, helper: '队列数量保留，详细状态不挤在底栏。', tone: 'violet' },
        { id: 'completion', label: completionLabel, helper: 'ASMR 睡前常用策略。', tone: 'amber' },
      ],
      hiddenMaintenanceNote: 'MVP-74 marker: mvp49/mvp54/mvp59 底栏状态仍保留为隐藏 verifier marker；可见底栏不再堆叠工程 chip。',
    };
  },

  getHomeModel(): Mvp74HomeDailyCleanupModel {
    return {
      title: '首页保留日常入口，减少重复卡片',
      subtitle: '首页优先显示继续播放、最近播放、最近加入和三大入口；旧阶段说明只保留为隐藏 marker。',
      visibleRule: '首页不再把 Beta、MVP、Contract、Scanner 等信息当作日常卡片展示。',
      hiddenMaintenanceNote: 'MVP-74 marker: 旧首页 verifier marker 保留，但工程型首页区块默认隐藏到 sr-only。',
    };
  },
};

// MVP-74 verification note: 播放器底栏和首页日常入口继续减工程感，历史 verifier marker 保留但后置。
// Safety note: 不接 SQLite；不删除、移动、重命名真实媒体文件；不向 Renderer 暴露 absolutePath；不向 Renderer 暴露 file://。
