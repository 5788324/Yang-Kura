import type { AudioTrack, PlayerState } from '../types';
import { playerExperienceService } from './playerExperienceService';

export type PlayerSurfaceMode = 'classic' | 'vinyl' | 'lyrics';
export type PlayerSurfaceTone = 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate' | 'purple' | 'sky';

export interface PlayerSurfaceChip {
  id: string;
  label: string;
  tone: PlayerSurfaceTone;
}

export interface PlayerSurfaceStat {
  id: string;
  label: string;
  value: string;
}

export interface PlayerSurfaceSummary {
  modeTitle: string;
  modeDescription: string;
  sourceHint: string;
  listeningContext: string;
  lyricHint: string;
  footerStatus: string;
  chips: PlayerSurfaceChip[];
  stats: PlayerSurfaceStat[];
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '未知时长';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function countLyrics(track: AudioTrack | null | undefined): number {
  return track?.lyrics?.length ?? 0;
}

function countSubtitleSources(track: AudioTrack | null | undefined): number {
  return track?.subtitleRelativePaths?.length ?? 0;
}

function isLocalTrack(track: AudioTrack | null | undefined): boolean {
  return track?.playbackSourceKind === 'tokenized-local-file';
}

function getModeTitle(mode: PlayerSurfaceMode): string {
  if (mode === 'vinyl') return '黑胶沉浸';
  if (mode === 'lyrics') return '歌词专注';
  return '播放详情';
}

function getModeDescription(mode: PlayerSurfaceMode, track: AudioTrack): string {
  if (mode === 'vinyl') {
    return track.type === 'asmr'
      ? '适合长音声和睡前收听，保留唱片、分轨和播放策略。'
      : '保留唱片视觉、封面氛围和底部控制，适合专辑播放。';
  }
  if (mode === 'lyrics') return '突出当前歌词 / 字幕，降低其他控件干扰。';
  return track.type === 'asmr'
    ? '查看封面、RJ 信息、分轨、队列和字幕。'
    : '查看封面、专辑、歌手、队列和歌词。';
}

function getListeningContext(track: AudioTrack): string {
  if (track.type === 'asmr') {
    return track.rjId ? `${track.rjId} · ${track.album}` : `音声作品 · ${track.album}`;
  }
  return `${track.artist} · ${track.album}`;
}

function getLyricHint(track: AudioTrack): string {
  if (track.lyricsLoadStatus === 'loaded') return '本地字幕已加载，可随时间高亮';
  if (track.lyricsLoadStatus === 'loading') return '正在读取本地字幕';
  if (track.lyricsLoadStatus === 'error') return '字幕读取失败，请检查字幕文件';
  if (track.lyricsLoadStatus === 'missing') return '当前音轨暂无字幕';
  if (countLyrics(track) > 0) return '内置歌词可用于滚动显示';
  if (countSubtitleSources(track) > 0) return '发现字幕候选，可读取后显示';
  return '暂无歌词 / 字幕，可正常播放音频';
}

function getSourceHint(state: PlayerState): string {
  const sourceLabel = playerExperienceService.getSourceLabel(state);
  const subtitleLabel = playerExperienceService.getSubtitleLabel(state.currentTrack);
  return `${sourceLabel} · ${subtitleLabel}`;
}

function getFooterStatus(state: PlayerState): string {
  const summary = playerExperienceService.getSummary(state);
  return `${summary.sourceLabel} · ${summary.completionModeLabel} · ${summary.subtitleLabel}`;
}

function getChips(state: PlayerState): PlayerSurfaceChip[] {
  const track = state.currentTrack;
  if (!track) return [];

  const chips: PlayerSurfaceChip[] = [
    {
      id: track.type,
      label: track.type === 'asmr' ? '音声' : '音乐',
      tone: track.type === 'asmr' ? 'purple' : 'emerald',
    },
    {
      id: isLocalTrack(track) ? 'local' : 'sample',
      label: isLocalTrack(track) ? '本地资源' : '示例资源',
      tone: isLocalTrack(track) ? 'indigo' : 'slate',
    },
  ];

  const subtitleCount = countSubtitleSources(track);
  const lyricCount = countLyrics(track);
  if (subtitleCount > 0 || lyricCount > 0) {
    chips.push({ id: 'lyrics', label: '有歌词', tone: 'emerald' });
  }
  if (track.rjId) chips.push({ id: 'rj', label: track.rjId, tone: 'sky' });
  if (state.playCompletionMode === 'stop-after-track') chips.push({ id: 'stop-track', label: '单轨停止', tone: 'amber' });
  if (state.playCompletionMode === 'stop-after-work') chips.push({ id: 'stop-work', label: '作品停止', tone: 'amber' });
  return chips;
}

function getStats(state: PlayerState): PlayerSurfaceStat[] {
  const track = state.currentTrack;
  if (!track) return [];
  const progressPercent = track.duration > 0 ? Math.min(100, Math.max(0, Math.round((state.progress / track.duration) * 100))) : 0;
  return [
    { id: 'duration', label: '总时长', value: formatDuration(track.duration) },
    { id: 'progress', label: '播放进度', value: `${progressPercent}%` },
    { id: 'queue', label: '队列', value: `${state.queue.length} 首` },
    { id: 'lyrics', label: '歌词行', value: `${countLyrics(track)} 行` },
  ];
}

export const playerSurfaceExperienceService = {
  getSummary(state: PlayerState, mode: PlayerSurfaceMode): PlayerSurfaceSummary | null {
    const track = state.currentTrack;
    if (!track) return null;
    return {
      modeTitle: getModeTitle(mode),
      modeDescription: getModeDescription(mode, track),
      sourceHint: getSourceHint(state),
      listeningContext: getListeningContext(track),
      lyricHint: getLyricHint(track),
      footerStatus: getFooterStatus(state),
      chips: getChips(state),
      stats: getStats(state),
    };
  },

  getModeTitle,
  getModeDescription,
};
