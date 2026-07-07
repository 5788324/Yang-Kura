import type { AudioTrack, MusicAlbum, PlayerState, Playlist, RJWork } from '../types';

export type ListeningExperienceTone = 'brand' | 'purple' | 'green' | 'amber' | 'muted';

export interface ListeningExperienceBadge {
  label: string;
  tone: ListeningExperienceTone;
}

export interface ListeningFocusCard {
  id: 'continue' | 'recent' | 'asmr' | 'music' | 'playlist' | 'settings';
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  tone: ListeningExperienceTone;
}

export interface ListeningDashboardPolishModel {
  title: string;
  description: string;
  helper: string;
  cards: ListeningFocusCard[];
}

export interface PlayerBarPolishModel {
  statusBadges: ListeningExperienceBadge[];
  completionLabel: string;
  completionHint: string;
  emptyHint: string;
}

const hasSubtitle = (track: AudioTrack): boolean =>
  (track.subtitleRelativePaths?.length ?? 0) > 0 ||
  track.lyricsLoadStatus === 'loaded' ||
  (track.lyrics?.length ?? 0) > 0;

const getTrackSourceLabel = (track: AudioTrack): string =>
  track.playbackSourceKind === 'tokenized-local-file' ? '本地音频' : '示例音频';

const getPlaybackModeLabel = (playerState: PlayerState): ListeningExperienceBadge => {
  if (!playerState.currentTrack) return { label: '等待播放', tone: 'muted' };
  if (playerState.playbackError) return { label: '播放异常', tone: 'amber' };
  if (playerState.playbackMode === 'html-audio') return { label: '正在播放', tone: 'green' };
  if (playerState.playbackMode === 'resolving-local-media') return { label: '读取音频', tone: 'brand' };
  if (playerState.isPlaying) return { label: '播放中', tone: 'green' };
  return { label: '已暂停', tone: 'muted' };
};

const getCompletionLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '单轨后停';
  if (mode === 'stop-after-work') return '作品后停';
  return '连续播放';
};

// MVP-49: 听音频入口 and bottom player status stay media-first.
export const listeningExperiencePolishService = {
  getBadgeClass(tone: ListeningExperienceTone): string {
    if (tone === 'brand') return 'bg-brand-color/15 text-brand-color border-brand-color/30';
    if (tone === 'purple') return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    if (tone === 'green') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    return 'bg-white/5 text-text-muted border-white/10';
  },

  getDashboardModel(input: {
    continueTrack: AudioTrack | null;
    recentTracks: AudioTrack[];
    rjWorks: RJWork[];
    musicAlbums: MusicAlbum[];
    playlists: Playlist[];
    hasRealLibrary: boolean;
  }): ListeningDashboardPolishModel {
    const asmrTrackCount = input.rjWorks.reduce((total, work) => total + work.tracks.length, 0);
    const musicTrackCount = input.musicAlbums.reduce((total, album) => total + album.tracks.length, 0);
    const subtitleTrackCount = [...input.rjWorks.flatMap((work) => work.tracks), ...input.musicAlbums.flatMap((album) => album.tracks)]
      .filter((track) => hasSubtitle(track)).length;

    return {
      title: input.continueTrack ? '继续听与常用入口' : '从资源库开始听',
      description: input.hasRealLibrary
        ? '把日常播放入口放在首页，资源扫描和技术细节继续留在设置与诊断页。'
        : '先在设置页导入资源库；播放过音频后，这里会显示继续听和最近播放。',
      helper: subtitleTrackCount > 0
        ? `${subtitleTrackCount} 条音轨已识别字幕，可从播放器歌词页继续查看。`
        : '字幕状态会在资源库和播放器里显示；没有字幕也不影响本地播放。',
      cards: [
        {
          id: 'continue',
          title: input.continueTrack ? '继续播放' : '等待播放',
          description: input.continueTrack ? input.continueTrack.title : '播放一次音频后显示继续入口。',
          meta: input.continueTrack ? getTrackSourceLabel(input.continueTrack) : '暂无历史',
          actionLabel: input.continueTrack ? '继续听' : '去音声库',
          tone: 'brand',
        },
        {
          id: 'recent',
          title: '最近播放',
          description: input.recentTracks.length > 0 ? '查看最近听过的音声和音乐。' : '最近播放为空。',
          meta: `${input.recentTracks.length} 条记录`,
          actionLabel: '查看记录',
          tone: 'purple',
        },
        {
          id: 'asmr',
          title: '音声库',
          description: '按作品、RJ 号、字幕和进度浏览。',
          meta: `${input.rjWorks.length} 个作品 · ${asmrTrackCount} 条音轨`,
          actionLabel: '打开音声库',
          tone: 'purple',
        },
        {
          id: 'music',
          title: '音乐库',
          description: '按专辑、艺术家和文件夹听歌。',
          meta: `${input.musicAlbums.length} 张专辑 · ${musicTrackCount} 首歌`,
          actionLabel: '打开音乐库',
          tone: 'green',
        },
      ],
    };
  },

  getPlayerBarModel(playerState: PlayerState): PlayerBarPolishModel {
    const track = playerState.currentTrack;
    if (!track) {
      return {
        statusBadges: [{ label: '等待播放', tone: 'muted' }],
        completionLabel: getCompletionLabel(playerState.playCompletionMode),
        completionHint: '选择音轨后可调整播放结束策略。',
        emptyHint: '从音声库或音乐库选择音轨开始播放',
      };
    }

    return {
      statusBadges: [
        getPlaybackModeLabel(playerState),
        { label: track.type === 'asmr' ? '音声' : '音乐', tone: track.type === 'asmr' ? 'purple' : 'green' },
        { label: getTrackSourceLabel(track), tone: track.playbackSourceKind === 'tokenized-local-file' ? 'green' : 'muted' },
        { label: hasSubtitle(track) ? '有字幕' : '无字幕', tone: hasSubtitle(track) ? 'amber' : 'muted' },
      ],
      completionLabel: getCompletionLabel(playerState.playCompletionMode),
      completionHint: '用于睡前、ASMR 长音频或连续听歌的结束策略。',
      emptyHint: '从音声库或音乐库选择音轨开始播放',
    };
  },
};
