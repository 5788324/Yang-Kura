import type { AudioTrack, PlayerState, Playlist } from '../types';

export interface DailyListeningBadge {
  label: string;
  tone: 'brand' | 'green' | 'amber' | 'purple' | 'muted';
}

export interface DailyListeningQueueSummary {
  title: string;
  description: string;
  emptyHint: string;
  queueCount: number;
  asmrCount: number;
  musicCount: number;
  totalDurationLabel: string;
  currentIndexLabel: string;
  completionModeLabel: string;
  badges: DailyListeningBadge[];
}

export interface DailyListeningCard {
  id: string;
  title: string;
  subtitle: string;
  helper: string;
  track?: AudioTrack;
  kind: 'continue' | 'recent' | 'queue' | 'playlist';
}

export interface DailyListeningDashboardModel {
  title: string;
  description: string;
  cards: DailyListeningCard[];
  badges: DailyListeningBadge[];
}

const formatDurationLabel = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 分钟';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));
  if (hours <= 0) return `${minutes} 分钟`;
  return `${hours} 小时 ${minutes} 分钟`;
};

const completionModeLabel = (mode: PlayerState['playCompletionMode']): string => {
  if (mode === 'stop-after-track') return '播完当前轨停止';
  if (mode === 'stop-after-work') return '播完当前作品停止';
  return '列表续播';
};

const getTrackBadges = (track: AudioTrack | null | undefined, isCurrent = false): DailyListeningBadge[] => {
  if (!track) return [];
  const badges: DailyListeningBadge[] = [];
  if (isCurrent) badges.push({ label: '正在播放', tone: 'brand' });
  badges.push({ label: track.type === 'asmr' ? '音声' : '音乐', tone: track.type === 'asmr' ? 'purple' : 'green' });
  badges.push({ label: track.playbackSourceKind === 'tokenized-local-file' ? '本地资源' : '示例资源', tone: track.playbackSourceKind === 'tokenized-local-file' ? 'green' : 'muted' });
  if ((track.subtitleRelativePaths?.length ?? 0) > 0 || track.lyricsLoadStatus === 'loaded' || (track.lyrics?.length ?? 0) > 0) {
    badges.push({ label: '有字幕', tone: 'amber' });
  }
  if (track.mediaKind && track.mediaKind !== 'audio') {
    badges.push({ label: '外部打开', tone: 'muted' });
  }
  return badges.slice(0, 5);
};

export const dailyListeningSurfaceService = {
  getBadgeClass(tone: DailyListeningBadge['tone']): string {
    if (tone === 'brand') return 'bg-brand-color/15 text-brand-color border-brand-color/30';
    if (tone === 'green') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    if (tone === 'purple') return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    return 'bg-white/5 text-text-muted border-white/10';
  },

  getTrackBadges,

  getQueueSummary(playerState: PlayerState): DailyListeningQueueSummary {
    const queue = playerState.queue;
    const currentTrack = playerState.currentTrack;
    const asmrCount = queue.filter((track) => track.type === 'asmr').length;
    const musicCount = queue.filter((track) => track.type === 'music').length;
    const totalDuration = queue.reduce((total, track) => total + (Number.isFinite(track.duration) ? track.duration : 0), 0);
    const currentIndex = currentTrack ? Math.max(0, queue.findIndex((track) => track.id === currentTrack.id)) : -1;
    const completion = completionModeLabel(playerState.playCompletionMode);

    return {
      title: queue.length > 0 ? '当前播放队列' : '播放队列为空',
      description: queue.length > 0
        ? '队列会在本机保存，下次打开后恢复；只保存音轨信息，不保存真实路径或媒体链接。'
        : '从音声库、音乐库或歌单里播放内容后，这里会显示接下来要听的顺序。',
      emptyHint: '队列为空，先从音声库、音乐库或歌单选择一首音频。',
      queueCount: queue.length,
      asmrCount,
      musicCount,
      totalDurationLabel: formatDurationLabel(totalDuration),
      currentIndexLabel: currentIndex >= 0 ? `${currentIndex + 1} / ${queue.length}` : '未选择',
      completionModeLabel: completion,
      badges: [
        { label: `${queue.length} 首`, tone: 'brand' },
        { label: `${asmrCount} 音声`, tone: 'purple' },
        { label: `${musicCount} 音乐`, tone: 'green' },
        { label: completion, tone: playerState.playCompletionMode === 'continue-queue' ? 'muted' : 'amber' },
      ],
    };
  },

  getDashboardModel(input: {
    recentTracks: AudioTrack[];
    playerState: PlayerState;
    playlists: Playlist[];
  }): DailyListeningDashboardModel {
    const queueSummary = this.getQueueSummary(input.playerState);
    const currentTrack = input.playerState.currentTrack;
    const firstRecent = input.recentTracks[0];
    const firstPlaylist = input.playlists.find((playlist) => playlist.tracks.length > 0);

    const cards: DailyListeningCard[] = [];
    if (currentTrack) {
      cards.push({
        id: 'current-track',
        kind: 'continue',
        title: currentTrack.title,
        subtitle: currentTrack.artist,
        helper: `当前队列 ${queueSummary.currentIndexLabel} · ${queueSummary.completionModeLabel}`,
        track: currentTrack,
      });
    } else if (firstRecent) {
      cards.push({
        id: 'recent-first',
        kind: 'recent',
        title: firstRecent.title,
        subtitle: firstRecent.artist,
        helper: '从最近播放恢复',
        track: firstRecent,
      });
    }

    cards.push({
      id: 'queue-summary',
      kind: 'queue',
      title: queueSummary.queueCount > 0 ? `${queueSummary.queueCount} 首待播` : '队列待建立',
      subtitle: queueSummary.totalDurationLabel,
      helper: queueSummary.queueCount > 0 ? queueSummary.completionModeLabel : '播放音声或音乐后会自动建立队列',
    });

    if (firstPlaylist) {
      cards.push({
        id: `playlist-${firstPlaylist.id}`,
        kind: 'playlist',
        title: firstPlaylist.name,
        subtitle: `${firstPlaylist.tracks.length} 首音轨`,
        helper: firstPlaylist.sourceKind === 'user-local' ? '你的本地歌单' : '系统示例歌单',
      });
    }

    return {
      title: currentTrack ? '继续你的播放队列' : '选择今天要听的内容',
      description: currentTrack
        ? '可以从当前位置继续，也可以切到队列、歌单或最近播放。'
        : '首页保留日常播放入口；扫描、索引和调试信息继续放在设置与诊断页。',
      cards: cards.slice(0, 3),
      badges: queueSummary.badges,
    };
  },
};
