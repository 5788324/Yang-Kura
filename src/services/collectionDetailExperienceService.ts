import type { AudioTrack, MusicAlbum, Playlist, RJWork } from '../types';

export interface CollectionNavigationCrumb {
  label: string;
  value: string;
}

export interface CollectionEmptyStateAction {
  label: string;
  tone: 'primary' | 'muted';
}

export interface CollectionEmptyStateModel {
  title: string;
  description: string;
  helper: string;
  actions: CollectionEmptyStateAction[];
}

export interface CollectionDetailStatusChip {
  label: string;
  tone: 'brand' | 'green' | 'amber' | 'purple' | 'muted';
}

export interface CollectionDetailSummary {
  title: string;
  description: string;
  chips: CollectionDetailStatusChip[];
  stats: Array<{ label: string; value: string }>;
}

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 分钟';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));
  if (hours <= 0) return `${minutes} 分钟`;
  return `${hours} 小时 ${minutes} 分钟`;
};

const isLocalTrack = (track: AudioTrack): boolean =>
  track.playbackSourceKind === 'tokenized-local-file' ||
  track.externalOpenSourceKind === 'tokenized-local-file';

const hasSubtitle = (track: AudioTrack): boolean =>
  Boolean(
    track.lyricsRelativePath ||
      track.lyricsLoadStatus === 'loaded' ||
      (track.subtitleRelativePaths?.length ?? 0) > 0 ||
      (track.lyrics?.length ?? 0) > 0,
  );

const getTrackSourceChip = (tracks: AudioTrack[]): CollectionDetailStatusChip => {
  const localCount = tracks.filter(isLocalTrack).length;
  return localCount > 0
    ? { label: `${localCount} 个本地资源`, tone: 'green' }
    : { label: '示例资源', tone: 'muted' };
};

const getSubtitleChip = (tracks: AudioTrack[]): CollectionDetailStatusChip => {
  const subtitleCount = tracks.filter(hasSubtitle).length;
  return subtitleCount > 0
    ? { label: `${subtitleCount} 个有字幕`, tone: 'amber' }
    : { label: '暂无字幕', tone: 'muted' };
};

export const collectionDetailExperienceService = {
  getBreadcrumbs(input: {
    section: '首页' | '音声库' | '音乐库' | '歌单';
    current: string;
    parent?: string;
  }): CollectionNavigationCrumb[] {
    const crumbs: CollectionNavigationCrumb[] = [{ label: '当前位置', value: input.section }];
    if (input.parent) crumbs.push({ label: '分组', value: input.parent });
    crumbs.push({ label: '当前', value: input.current });
    return crumbs;
  },

  getAsmrDetailSummary(work: RJWork): CollectionDetailSummary {
    const tracks = work.tracks ?? [];
    const completedCount = tracks.filter((track) => track.lyricsLoadStatus === 'loaded').length;
    return {
      title: '作品资源概况',
      description: tracks.length > 0
        ? '这里显示当前作品的音轨、字幕与本地来源状态；实际扫描和路径细节保留在设置高级区与诊断页。'
        : '这个作品暂时没有可播放音轨。可以返回音声库重新筛选，或在设置页重新读取资源库记录。',
      chips: [
        { label: '音声作品', tone: 'purple' },
        getTrackSourceChip(tracks),
        getSubtitleChip(tracks),
        { label: work.status === 'identified' ? '信息已记录' : '需要检查', tone: work.status === 'identified' ? 'green' : 'amber' },
      ],
      stats: [
        { label: '音轨', value: `${tracks.length}` },
        { label: '总时长', value: formatDuration(work.totalDuration) },
        { label: '字幕', value: `${tracks.filter(hasSubtitle).length}` },
        { label: '已读歌词', value: `${completedCount}` },
      ],
    };
  },

  getMusicEmptyState(input: {
    view: 'tracks' | 'albums' | 'artists' | 'folders';
    hasFilters: boolean;
    searchQuery?: string;
  }): CollectionEmptyStateModel {
    if (input.hasFilters || input.searchQuery?.trim()) {
      return {
        title: '没有找到匹配的音乐',
        description: '当前搜索或筛选条件下没有可显示的音轨。',
        helper: '可以清空搜索词、重置过滤器，或回到全部歌曲列表。',
        actions: [
          { label: '重置筛选', tone: 'primary' },
          { label: '查看全部歌曲', tone: 'muted' },
        ],
      };
    }
    const viewText = input.view === 'albums' ? '专辑' : input.view === 'artists' ? '艺术家' : input.view === 'folders' ? '分组' : '音轨';
    return {
      title: `音乐库暂无${viewText}`,
      description: '读取本地资源库记录后，音乐音轨、专辑与艺术家会在这里显示。',
      helper: '先到设置页选择音乐库目录，读取已有资源记录，或执行一键扫描并应用。',
      actions: [
        { label: '去设置页导入', tone: 'primary' },
        { label: '保留当前示例视图', tone: 'muted' },
      ],
    };
  },

  getAsmrEmptyState(): CollectionEmptyStateModel {
    return {
      title: '这个作品还没有音轨',
      description: '当前作品详情中没有可播放音频。可能是资源库记录尚未读取、扫描范围不完整，或该目录只包含图片/文本等外部文件。',
      helper: '返回音声库检查其他作品；资源发生变化时，到设置页重新读取或扫描资源库记录。',
      actions: [
        { label: '返回音声库', tone: 'primary' },
        { label: '查看作品信息', tone: 'muted' },
      ],
    };
  },

  getPlaylistEmptyState(playlist?: Playlist): CollectionEmptyStateModel {
    if (!playlist) {
      return {
        title: '还没有选中歌单',
        description: '选择一个歌单查看音轨，或新建自己的本地歌单。',
        helper: '歌单只保存音轨引用，不保存真实路径或媒体链接。',
        actions: [{ label: '新建歌单', tone: 'primary' }],
      };
    }
    return {
      title: playlist.isSystem ? '系统示例歌单暂无音轨' : '这个歌单还没有音轨',
      description: playlist.isSystem
        ? '系统示例歌单只用于展示布局，不会连接真实下载或在线账号。'
        : '从音声库、音乐库或播放器底栏把喜欢的音轨加入这个歌单。',
      helper: playlist.isSystem
        ? '可以新建自己的本地歌单，或从媒体库选择音轨播放。'
        : '移除歌单音轨只会修改歌单列表，不会删除、移动或重命名真实文件。',
      actions: [
        { label: playlist.isSystem ? '新建本地歌单' : '去媒体库添加', tone: 'primary' },
        { label: '返回歌单列表', tone: 'muted' },
      ],
    };
  },

  getPlaylistDetailSummary(playlist: Playlist): CollectionDetailSummary {
    const tracks = playlist.tracks ?? [];
    const asmrCount = tracks.filter((track) => track.type === 'asmr').length;
    const musicCount = tracks.filter((track) => track.type === 'music').length;
    const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0);
    return {
      title: playlist.isSystem ? '系统示例歌单' : '本地自建歌单',
      description: tracks.length > 0
        ? '歌单可以混合音声和普通音乐，并使用同一套播放器队列。'
        : '这个歌单暂时为空，添加音轨后会在这里显示播放顺序。',
      chips: [
        { label: playlist.isSystem ? '系统示例' : '本地歌单', tone: playlist.isSystem ? 'muted' : 'green' },
        { label: `${asmrCount} 音声`, tone: 'purple' },
        { label: `${musicCount} 音乐`, tone: 'green' },
        getSubtitleChip(tracks),
      ],
      stats: [
        { label: '音轨', value: `${tracks.length}` },
        { label: '总时长', value: formatDuration(totalDuration) },
        { label: '音声', value: `${asmrCount}` },
        { label: '音乐', value: `${musicCount}` },
      ],
    };
  },
};
