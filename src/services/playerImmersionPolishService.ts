import type { PlayerState } from '../types';
import type { PlayerVisualPolishTone } from './playerVisualPolishService';

export interface PlayerImmersionFocusCard {
  label: string;
  value: string;
  helper: string;
  tone: PlayerVisualPolishTone;
}

export interface PlayerImmersionPanelModel {
  eyebrow: string;
  title: string;
  description: string;
  focusLine: string;
  cards: PlayerImmersionFocusCard[];
  emptyLyricsTitle: string;
  emptyLyricsDescription: string;
}

export interface PlayerImmersionDiagnosticsModel {
  title: string;
  description: string;
  improvements: PlayerImmersionFocusCard[];
  guardrails: string[];
}

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const getModeLabel = (mode: 'classic' | 'vinyl' | 'lyrics'): string => {
  if (mode === 'vinyl') return '黑胶沉浸';
  if (mode === 'lyrics') return '歌词专注';
  return '经典详情';
};

const getTabLabel = (tab: 'lyrics' | 'chapters' | 'queue' | 'bookmarks'): string => {
  if (tab === 'chapters') return '章节';
  if (tab === 'queue') return '队列';
  if (tab === 'bookmarks') return '片段标记';
  return '歌词';
};

const getCompletionLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '播完本轨停止';
  if (mode === 'stop-after-work') return '播完本作品停止';
  return '连续播放';
};

const hasSubtitles = (playerState: PlayerState): boolean => {
  const track = playerState.currentTrack;
  if (!track) return false;
  return (
    (track.subtitleRelativePaths?.length ?? 0) > 0 ||
    track.lyricsLoadStatus === 'loaded' ||
    (track.lyrics?.length ?? 0) > 0
  );
};

// MVP-51: full player immersion polish stays UI-only and does not change playback, lyrics, scanner, index, or file access.
export const playerImmersionPolishService = {
  getPanelModel(
    playerState: PlayerState,
    playerStyle: 'classic' | 'vinyl' | 'lyrics',
    activeRightTab: 'lyrics' | 'chapters' | 'queue' | 'bookmarks',
  ): PlayerImmersionPanelModel {
    const track = playerState.currentTrack;
    if (!track) {
      return {
        eyebrow: '播放器大页',
        title: '选择音轨后进入沉浸播放',
        description: '这里会集中显示封面、歌词、队列和播放策略。',
        focusLine: '从音声库或音乐库选择音频开始播放。',
        cards: [
          { label: '播放模式', value: getModeLabel(playerStyle), helper: '可在经典、黑胶、歌词间切换', tone: 'sky' },
          { label: '当前区域', value: getTabLabel(activeRightTab), helper: '歌词、章节、队列集中在右侧区域', tone: 'purple' },
          { label: '队列', value: '0 条', helper: '播放后显示即将播放内容', tone: 'muted' },
        ],
        emptyLyricsTitle: '暂无歌词或字幕',
        emptyLyricsDescription: '选择音轨后，如果识别到同名字幕或歌词，会在这里同步显示。',
      };
    }

    const progress = Math.max(0, Math.min(playerState.progress || 0, track.duration || 0));
    const remaining = Math.max(0, (track.duration || 0) - progress);
    const subtitleReady = hasSubtitles(playerState);

    return {
      eyebrow: track.type === 'asmr' ? '音声沉浸播放' : '音乐沉浸播放',
      title: playerStyle === 'lyrics' ? '歌词专注模式' : playerStyle === 'vinyl' ? '黑胶沉浸模式' : '经典播放详情',
      description: `${track.title} · ${track.artist}`,
      focusLine: `${getCompletionLabel(playerState.playCompletionMode)} · ${formatTime(progress)} / ${formatTime(track.duration)} · 剩余 ${formatTime(remaining)}`,
      cards: [
        { label: '播放模式', value: getModeLabel(playerStyle), helper: '按当前听音场景切换布局', tone: 'sky' },
        { label: '歌词状态', value: subtitleReady ? '可跟随' : '可继续播放', helper: subtitleReady ? '已识别字幕或歌词内容' : '没有字幕也不影响本地播放', tone: subtitleReady ? 'amber' : 'muted' },
        { label: '播放队列', value: `${playerState.queue.length} 条`, helper: getTabLabel(activeRightTab), tone: 'green' },
      ],
      emptyLyricsTitle: subtitleReady ? '字幕暂时没有时间轴内容' : '暂无歌词或字幕',
      emptyLyricsDescription: subtitleReady
        ? '已识别字幕来源，但当前没有可显示的歌词行；可以继续播放音频或切换队列。'
        : '当前音轨没有匹配到歌词或字幕；本地音频播放、进度保存和队列仍可正常使用。',
    };
  },

  getDiagnosticsModel(): PlayerImmersionDiagnosticsModel {
    return {
      title: 'MVP-51 播放器沉浸页继续精修',
      description: '本轮只优化播放器大页的模式说明、歌词空状态和听音焦点，不改变扫描、索引、播放、字幕和打包链路。',
      improvements: [
        { label: '沉浸焦点', value: '已收口', helper: '播放页增加轻量听音焦点栏', tone: 'sky' },
        { label: '歌词空状态', value: '更清楚', helper: '明确无字幕不等于播放异常', tone: 'amber' },
        { label: '代码边界', value: '小 service', helper: '避免继续把展示判断堆进 LyricsPanel', tone: 'green' },
      ],
      guardrails: [
        '不改扫描链路',
        '不改 library-index.json 写入链路',
        '不改 HTMLAudio 播放内核',
        '不接 SQLite / 下载器 / 元数据 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
    };
  },
};
