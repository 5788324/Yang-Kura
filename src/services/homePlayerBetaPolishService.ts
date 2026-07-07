import type { AudioTrack, PlayerState } from '../types';

export type HomePlayerBetaTone = 'brand' | 'sky' | 'green' | 'amber' | 'muted';

export interface HomePlayerBetaChip {
  id: string;
  label: string;
  value: string;
  tone: HomePlayerBetaTone;
}

export interface HomePlayerBetaDashboardModel {
  title: string;
  description: string;
  chips: HomePlayerBetaChip[];
  helper: string;
}

export interface HomePlayerBetaPlayerModel {
  compactLine: string;
  emptyTitle: string;
  emptyHint: string;
  chips: HomePlayerBetaChip[];
}

export interface HomePlayerBetaLyricsModel {
  title: string;
  subtitle: string;
  focusLine: string;
  emptyTitle: string;
  emptyDescription: string;
  chips: HomePlayerBetaChip[];
}

export interface HomePlayerBetaDiagnosticsModel {
  title: string;
  description: string;
  summary: HomePlayerBetaChip[];
  cleanupPlan: string[];
  guardrails: string[];
  deferred: string[];
}

const hasSubtitle = (track: AudioTrack): boolean =>
  (track.subtitleRelativePaths?.length ?? 0) > 0 ||
  track.lyricsLoadStatus === 'loaded' ||
  (track.lyrics?.length ?? 0) > 0;

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const getPlaybackLabel = (playerState: PlayerState): string => {
  if (!playerState.currentTrack) return '待播放';
  if (playerState.playbackError) return '播放异常';
  if (playerState.playbackMode === 'resolving-local-media') return '读取音频';
  if (playerState.isPlaying) return '正在听';
  return '已暂停';
};

const getTrackSourceLabel = (track: AudioTrack): string =>
  track.playbackSourceKind === 'tokenized-local-file' ? '本地音频' : '示例音频';

const getCompletionLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '播完本轨停';
  if (mode === 'stop-after-work') return '播完作品停';
  return '连续播放';
};

const getTrackTypeLabel = (track: AudioTrack): string => (track.type === 'asmr' ? '音声' : '音乐');

const getProgressLabel = (playerState: PlayerState): string => {
  const track = playerState.currentTrack;
  if (!track) return '暂无进度';
  return `${formatTime(playerState.progress)} / ${formatTime(track.duration)}`;
};

// MVP-59: home/player beta polish is presentation-only and keeps all file safety boundaries unchanged.
export const homePlayerBetaPolishService = {
  getToneClassName(tone: HomePlayerBetaTone): string {
    if (tone === 'brand') return 'bg-brand-color/15 text-brand-color border-brand-color/30';
    if (tone === 'sky') return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    if (tone === 'green') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    return 'bg-white/5 text-zinc-400 border-white/10';
  },

  getDashboardModel(input: {
    hasRealLibrary: boolean;
    recentCount: number;
    hasCurrentTrack: boolean;
    subtitleTrackCount: number;
  }): HomePlayerBetaDashboardModel {
    return {
      title: '首页听音频收口',
      description: '首页只保留继续听、最近听和资源库入口；扫描细节、验证信息继续留在设置与诊断页。',
      helper: input.hasRealLibrary
        ? '资源库已读取后，首页优先用于继续听，不再展示大块工程状态。'
        : '选择资源库并读取本地记录后，首页会显示继续听和最近播放。',
      chips: [
        { id: 'library', label: '资源库', value: input.hasRealLibrary ? '已读取' : '待读取', tone: input.hasRealLibrary ? 'green' : 'muted' },
        { id: 'recent', label: '最近播放', value: `${input.recentCount} 条`, tone: input.recentCount > 0 ? 'sky' : 'muted' },
        { id: 'player', label: '播放器', value: input.hasCurrentTrack ? '有音频' : '待播放', tone: input.hasCurrentTrack ? 'brand' : 'muted' },
        { id: 'subtitle', label: '字幕', value: input.subtitleTrackCount > 0 ? `${input.subtitleTrackCount} 条` : '未匹配', tone: input.subtitleTrackCount > 0 ? 'amber' : 'muted' },
      ],
    };
  },

  getPlayerBarModel(playerState: PlayerState): HomePlayerBetaPlayerModel {
    const track = playerState.currentTrack;
    if (!track) {
      return {
        compactLine: '从音声库或音乐库选择音轨开始播放',
        emptyTitle: '本地音频播放器',
        emptyHint: '选择音轨后显示进度、字幕状态和队列。',
        chips: [{ id: 'player', label: '状态', value: '待播放', tone: 'muted' }],
      };
    }

    const subtitleReady = hasSubtitle(track);
    const compactLine = `${getPlaybackLabel(playerState)} · ${getTrackTypeLabel(track)} · ${getTrackSourceLabel(track)} · ${getProgressLabel(playerState)} · ${getCompletionLabel(playerState.playCompletionMode)}`;

    return {
      compactLine,
      emptyTitle: '本地音频播放器',
      emptyHint: '选择音轨后显示进度、字幕状态和队列。',
      chips: [
        { id: 'state', label: '状态', value: getPlaybackLabel(playerState), tone: playerState.isPlaying ? 'green' : 'muted' },
        { id: 'source', label: '来源', value: getTrackSourceLabel(track), tone: track.playbackSourceKind === 'tokenized-local-file' ? 'green' : 'muted' },
        { id: 'subtitle', label: '字幕', value: subtitleReady ? '已匹配' : '未匹配', tone: subtitleReady ? 'amber' : 'muted' },
      ],
    };
  },

  getLyricsPanelModel(playerState: PlayerState, playerStyle: 'classic' | 'vinyl' | 'lyrics'): HomePlayerBetaLyricsModel {
    const track = playerState.currentTrack;
    const styleLabel = playerStyle === 'classic' ? '经典详情' : playerStyle === 'vinyl' ? '黑胶沉浸' : '歌词专注';
    if (!track) {
      return {
        title: '播放器页',
        subtitle: '等待选择音轨',
        focusLine: '从音声库或音乐库选择音轨后进入播放页。',
        emptyTitle: '暂无歌词或字幕',
        emptyDescription: '选择音轨后，如果有匹配的 LRC / SRT / VTT / ASS，会在这里显示。',
        chips: [{ id: 'mode', label: '模式', value: styleLabel, tone: 'muted' }],
      };
    }

    const subtitleReady = hasSubtitle(track);
    return {
      title: '正在听',
      subtitle: `${track.title} · ${track.artist}`,
      focusLine: `${styleLabel} · ${getPlaybackLabel(playerState)} · ${getProgressLabel(playerState)}`,
      emptyTitle: subtitleReady ? '字幕暂时没有可显示内容' : '暂无歌词或字幕',
      emptyDescription: subtitleReady
        ? '已识别字幕来源，但当前没有可显示的歌词行；可继续播放音频或切换队列。'
        : '当前音轨没有匹配到歌词或字幕；本地音频播放、进度保存和队列仍可正常使用。',
      chips: [
        { id: 'mode', label: '模式', value: styleLabel, tone: 'sky' },
        { id: 'source', label: '来源', value: getTrackSourceLabel(track), tone: track.playbackSourceKind === 'tokenized-local-file' ? 'green' : 'muted' },
        { id: 'subtitle', label: '字幕', value: subtitleReady ? '已匹配' : '未匹配', tone: subtitleReady ? 'amber' : 'muted' },
        { id: 'queue', label: '队列', value: `${playerState.queue.length} 条`, tone: playerState.queue.length > 0 ? 'brand' : 'muted' },
      ],
    };
  },

  getDiagnosticsModel(): HomePlayerBetaDiagnosticsModel {
    return {
      title: 'MVP-59 首页与播放器最终 Beta 视觉小修',
      description: '本轮继续降低首页和播放器的状态面板感，统一播放器页中文文案，不改变任何真实扫描、索引、播放、字幕或打包链路。',
      summary: [
        { id: 'home', label: '首页', value: '更轻', tone: 'brand' },
        { id: 'player', label: '播放器底栏', value: '更紧凑', tone: 'sky' },
        { id: 'lyrics', label: '播放页文案', value: '更统一', tone: 'green' },
        { id: 'risk', label: '真实链路', value: '未改动', tone: 'muted' },
      ],
      cleanupPlan: [
        '首页只保留听音频入口、最近播放和资源库入口。',
        '播放器底栏用一行中文状态替代多行工程式状态。',
        '歌词页继续说明无字幕不影响播放。',
        '诊断页保留本轮验证和后置项说明。',
      ],
      guardrails: [
        '不改扫描链路',
        '不改 library-index.json 写入链路',
        '不改 HTMLAudio 播放内核',
        '不向 Renderer 暴露 absolutePath 或 file://',
        '不删除、移动、重命名真实媒体文件',
      ],
      deferred: ['SQLite', '下载器', '元数据抓取', 'mpv 后端', '高级文件整理', '大组件一次性拆分'],
    };
  },
};
