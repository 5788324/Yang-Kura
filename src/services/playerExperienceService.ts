import type { AudioTrack, PlayerState, PlaybackCompletionMode } from '../types';

export interface PlayerExperienceSummary {
  sourceLabel: string;
  completionModeLabel: string;
  completionModeDescription: string;
  subtitleLabel: string;
  isRealLocalAudio: boolean;
}

const completionModeLabels: Record<PlaybackCompletionMode, string> = {
  'continue-queue': '列表续播',
  'stop-after-track': '播完当前轨停止',
  'stop-after-work': '播完当前作品停止',
};

const completionModeDescriptions: Record<PlaybackCompletionMode, string> = {
  'continue-queue': '当前轨结束后继续播放队列中的下一轨。',
  'stop-after-track': '当前轨结束后暂停，适合睡前或只听单轨。',
  'stop-after-work': '同一 RJ / 同一专辑内继续播放，离开当前作品时暂停。',
};

const completionModeOrder: PlaybackCompletionMode[] = [
  'continue-queue',
  'stop-after-track',
  'stop-after-work',
];

function trackWorkKey(track: AudioTrack | null | undefined): string | null {
  if (!track) return null;
  if (track.rjId) return `rj:${track.rjId}`;
  if (track.album || track.artist) return `album:${track.artist || 'unknown'}::${track.album || 'unknown'}`;
  return null;
}

function getNextTrack(state: PlayerState): AudioTrack | null {
  if (state.queue.length === 0) return null;
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.queue.length) return null;
  return state.queue[nextIndex] ?? null;
}

export const playerExperienceService = {
  getCompletionModeLabel(mode: PlaybackCompletionMode | undefined): string {
    return completionModeLabels[mode ?? 'continue-queue'];
  },

  getCompletionModeDescription(mode: PlaybackCompletionMode | undefined): string {
    return completionModeDescriptions[mode ?? 'continue-queue'];
  },

  getNextCompletionMode(mode: PlaybackCompletionMode | undefined): PlaybackCompletionMode {
    const current = mode ?? 'continue-queue';
    const idx = completionModeOrder.indexOf(current);
    return completionModeOrder[(idx + 1) % completionModeOrder.length];
  },

  getSourceLabel(state: PlayerState): string {
    if (state.playbackError) return '播放异常';
    if (state.playbackMode === 'html-audio') return '本地音频播放';
    if (state.playbackMode === 'resolving-local-media') return '正在解析本地音频';
    if (state.playbackMode === 'unsupported-local-media') return '当前环境无法播放本地音频';
    if (state.currentTrack?.playbackSourceKind === 'tokenized-local-file') return '等待本地音频解析';
    return '演示播放';
  },

  getSubtitleLabel(track: AudioTrack | null | undefined): string {
    if (!track) return '未选择音轨';
    if (track.lyricsLoadStatus === 'loaded') return '字幕已加载';
    if (track.lyricsLoadStatus === 'loading') return '字幕读取中';
    if (track.lyricsLoadStatus === 'missing') return '暂无字幕';
    if (track.lyricsLoadStatus === 'error') return '字幕读取失败';
    if ((track.lyrics?.length ?? 0) > 0 || (track.subtitleRelativePaths?.length ?? 0) > 0) return '有字幕';
    return '暂无字幕';
  },

  getSummary(state: PlayerState): PlayerExperienceSummary {
    return {
      sourceLabel: this.getSourceLabel(state),
      completionModeLabel: this.getCompletionModeLabel(state.playCompletionMode),
      completionModeDescription: this.getCompletionModeDescription(state.playCompletionMode),
      subtitleLabel: this.getSubtitleLabel(state.currentTrack),
      isRealLocalAudio: state.currentTrack?.playbackSourceKind === 'tokenized-local-file',
    };
  },

  shouldStopAtTrackEnd(state: PlayerState): boolean {
    if (!state.currentTrack) return false;
    if (state.loopMode === 'one') return false;
    const mode = state.playCompletionMode ?? 'continue-queue';
    if (mode === 'stop-after-track') return true;
    if (mode === 'stop-after-work') {
      const currentKey = trackWorkKey(state.currentTrack);
      const nextKey = trackWorkKey(getNextTrack(state));
      return !currentKey || !nextKey || currentKey !== nextKey;
    }
    return false;
  },
};
