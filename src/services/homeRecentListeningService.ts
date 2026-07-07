import type { AudioTrack, MusicAlbum, PlayerState, Playlist, RJWork } from '../types';
import { playbackHistoryService, type PlaybackHistoryEntry } from './playbackHistoryService';

export type HomeRecentListeningTone = 'brand' | 'purple' | 'green' | 'amber' | 'muted';

export interface HomeRecentListeningBadge {
  label: string;
  tone: HomeRecentListeningTone;
}

export interface HomeContinueListeningCard {
  track: AudioTrack | null;
  title: string;
  subtitle: string;
  helper: string;
  progressPercent: number;
  progressLabel: string;
  sourceLabel: string;
  badges: HomeRecentListeningBadge[];
}

export interface HomeRecentListeningItem {
  id: string;
  track: AudioTrack;
  title: string;
  subtitle: string;
  helper: string;
  progressPercent: number;
  progressLabel: string;
  updatedAtLabel: string;
  kindLabel: string;
  hasSubtitle: boolean;
  sourceLabel: string;
  badges: HomeRecentListeningBadge[];
}

export interface HomeQuickEntryCard {
  id: 'asmr' | 'music' | 'playlist' | 'settings';
  title: string;
  description: string;
  meta: string;
  tone: HomeRecentListeningTone;
}

export interface HomeRecentListeningModel {
  title: string;
  description: string;
  continueCard: HomeContinueListeningCard;
  recentItems: HomeRecentListeningItem[];
  quickEntries: HomeQuickEntryCard[];
  footerHint: string;
}

const clampPercent = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

const formatDurationLabel = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '未知时长';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));
  if (hours <= 0) return `${minutes} 分钟`;
  return `${hours} 小时 ${minutes} 分钟`;
};

const formatUpdatedAt = (value?: string): string => {
  if (!value) return '最近听过';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '最近听过';
  const diffMs = Date.now() - time;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return '刚刚听过';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(value).toLocaleDateString('zh-CN');
};

const hasSubtitle = (track: AudioTrack): boolean =>
  (track.subtitleRelativePaths?.length ?? 0) > 0 ||
  track.lyricsLoadStatus === 'loaded' ||
  (track.lyrics?.length ?? 0) > 0;

const getSourceLabel = (track: AudioTrack): string =>
  track.playbackSourceKind === 'tokenized-local-file' ? '本地音频' : '示例音频';

const getTrackBadges = (track: AudioTrack, entry?: PlaybackHistoryEntry): HomeRecentListeningBadge[] => {
  const badges: HomeRecentListeningBadge[] = [
    { label: track.type === 'asmr' ? '音声' : '音乐', tone: track.type === 'asmr' ? 'purple' : 'green' },
    { label: getSourceLabel(track), tone: track.playbackSourceKind === 'tokenized-local-file' ? 'green' : 'muted' },
  ];
  if (hasSubtitle(track)) badges.push({ label: '有字幕', tone: 'amber' });
  if (entry && !entry.completed && entry.progress > 5) badges.push({ label: '未听完', tone: 'brand' });
  if (entry?.completed) badges.push({ label: '已听完', tone: 'muted' });
  return badges.slice(0, 4);
};

const getEntryByTrackId = (entries: PlaybackHistoryEntry[]): Map<string, PlaybackHistoryEntry> => {
  const result = new Map<string, PlaybackHistoryEntry>();
  entries.forEach((entry) => result.set(entry.trackId, entry));
  return result;
};

const getProgressPercent = (track: AudioTrack, entry?: PlaybackHistoryEntry): number => {
  if (entry) return clampPercent(entry.percent);
  if (track.duration > 0) return 0;
  return 0;
};

const getProgressLabel = (track: AudioTrack, entry?: PlaybackHistoryEntry): string => {
  if (!entry || entry.progress <= 5) return formatDurationLabel(track.duration);
  if (entry.completed) return '已听完';
  return `听到 ${clampPercent(entry.percent)}%`;
};

export const homeRecentListeningService = {
  getBadgeClass(tone: HomeRecentListeningTone): string {
    if (tone === 'brand') return 'bg-brand-color/15 text-brand-color border-brand-color/30';
    if (tone === 'purple') return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    if (tone === 'green') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    return 'bg-white/5 text-text-muted border-white/10';
  },

  getModel(input: {
    recentTracks: AudioTrack[];
    playerState: PlayerState;
    rjWorks: RJWork[];
    musicAlbums: MusicAlbum[];
    playlists: Playlist[];
    hasRealLibrary: boolean;
    fallbackTrack?: AudioTrack | null;
  }): HomeRecentListeningModel {
    const historyEntries = playbackHistoryService.load();
    const entryMap = getEntryByTrackId(historyEntries);
    const currentTrack = input.playerState.currentTrack;
    const firstRecent = input.recentTracks[0];
    const continueTrack = currentTrack || firstRecent || input.fallbackTrack || null;
    const continueEntry = continueTrack ? entryMap.get(continueTrack.id) : undefined;
    const recentItems = input.recentTracks.slice(0, 6).map((track) => {
      const entry = entryMap.get(track.id);
      const progressPercent = getProgressPercent(track, entry);
      const kindLabel = track.type === 'asmr' ? '音声' : '音乐';
      return {
        id: `recent-${track.id}`,
        track,
        title: track.title,
        subtitle: track.rjId ? `${track.rjId} · ${track.artist}` : `${track.artist} · ${track.album}`,
        helper: entry?.completed ? '已听完，可以重听' : entry && entry.progress > 5 ? '可以继续上次位置' : '最近播放记录',
        progressPercent,
        progressLabel: getProgressLabel(track, entry),
        updatedAtLabel: formatUpdatedAt(entry?.updatedAt),
        kindLabel,
        hasSubtitle: hasSubtitle(track),
        sourceLabel: getSourceLabel(track),
        badges: getTrackBadges(track, entry),
      };
    });

    const asmrTrackCount = input.rjWorks.reduce((total, work) => total + work.tracks.length, 0);
    const musicTrackCount = input.musicAlbums.reduce((total, album) => total + album.tracks.length, 0);
    const subtitleCount = [...input.rjWorks.flatMap((work) => work.tracks), ...input.musicAlbums.flatMap((album) => album.tracks)]
      .filter((track) => hasSubtitle(track)).length;

    return {
      title: continueTrack ? '继续听上次的内容' : '今天想听什么',
      description: input.hasRealLibrary
        ? '首页优先放播放入口和最近记录；扫描、索引和技术信息继续放在设置与诊断页。'
        : '先导入资源库；播放过音频后，首页会自动显示最近播放和继续播放。',
      continueCard: {
        track: continueTrack,
        title: continueTrack?.title ?? '暂无继续播放记录',
        subtitle: continueTrack ? (continueTrack.rjId ? `${continueTrack.rjId} · ${continueTrack.artist}` : `${continueTrack.artist} · ${continueTrack.album}`) : '播放任意本地音频后会出现在这里',
        helper: currentTrack ? '当前正在播放，可继续控制队列。' : continueTrack ? '从最近播放或历史进度恢复。' : '先去音声库或音乐库选择一首音频。',
        progressPercent: continueTrack ? getProgressPercent(continueTrack, continueEntry) : 0,
        progressLabel: continueTrack ? getProgressLabel(continueTrack, continueEntry) : '等待播放',
        sourceLabel: continueTrack ? getSourceLabel(continueTrack) : '本地记录',
        badges: continueTrack ? getTrackBadges(continueTrack, continueEntry) : [{ label: '等待播放', tone: 'muted' }],
      },
      recentItems,
      quickEntries: [
        {
          id: 'asmr',
          title: '音声库',
          description: '按作品、RJ 号、字幕状态继续浏览。',
          meta: `${input.rjWorks.length} 个作品 · ${asmrTrackCount} 条音轨`,
          tone: 'purple',
        },
        {
          id: 'music',
          title: '音乐库',
          description: '查看普通音乐专辑和歌曲列表。',
          meta: `${input.musicAlbums.length} 张专辑 · ${musicTrackCount} 首歌`,
          tone: 'green',
        },
        {
          id: 'playlist',
          title: '歌单',
          description: '打开常听歌单或整理播放队列。',
          meta: `${input.playlists.length} 个歌单`,
          tone: 'brand',
        },
        {
          id: 'settings',
          title: input.hasRealLibrary ? '更新资源库' : '导入资源库',
          description: input.hasRealLibrary ? '重新读取记录或执行安全扫描。' : '选择目录并读取现有记录。',
          meta: subtitleCount > 0 ? `${subtitleCount} 条音轨带字幕` : '设置页处理导入流程',
          tone: 'amber',
        },
      ],
      footerHint: '首页只保留日常播放入口；详细扫描、索引和验证信息请到设置页或诊断页查看。',
    };
  },
};
