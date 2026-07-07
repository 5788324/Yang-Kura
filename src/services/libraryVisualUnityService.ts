import type { MusicAlbum, Playlist, RJWork } from '../types';
import type { LibraryBrowseTone } from './libraryBrowseSurfaceService';
import { libraryBrowseService } from './libraryBrowseService';
import { mediaSurfaceStatusService } from './mediaSurfaceStatusService';

export interface LibraryVisualUnityChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: LibraryBrowseTone;
}

export interface LibraryVisualUnityModel {
  title: string;
  description: string;
  chips: LibraryVisualUnityChip[];
  primaryHint: string;
  secondaryHint: string;
}

export interface LibraryVisualUnityDiagnosticsModel {
  title: string;
  description: string;
  tasks: LibraryVisualUnityChip[];
  guardrails: string[];
}

const yesNoLabel = (value: boolean, yes = '已筛选', no = '全部内容') => value ? yes : no;

const localWorkCount = (works: RJWork[]) =>
  works.filter((work) => libraryBrowseService.getWorkSourceKind(work) === 'local-index').length;

const subtitleWorkCount = (works: RJWork[]) =>
  works.filter((work) => libraryBrowseService.getWorkSubtitleSummary(work).hasSubtitle).length;

const playlistLocalityLabel = (playlists: Playlist[]): string => {
  const userCount = playlists.filter((playlist) => !playlist.isSystem).length;
  if (playlists.length === 0) return '暂无歌单';
  if (userCount === 0) return '示例歌单';
  return `${userCount} 个自建`;
};

export const libraryVisualUnityService = {
  getAsmrModel(args: {
    works: RJWork[];
    visibleCount: number;
    viewMode: 'grid' | 'list';
    hasActiveFilters: boolean;
  }): LibraryVisualUnityModel {
    const { works, visibleCount, viewMode, hasActiveFilters } = args;
    const trackCount = works.reduce((sum, work) => sum + (work.tracks?.length ?? 0), 0);
    const localCount = localWorkCount(works);
    const subtitleCount = subtitleWorkCount(works);

    return {
      title: '音声库视觉统一',
      description: '把音声库收成“封面浏览 + 列表管理”的中文媒体库表层，减少工具面板感。',
      primaryHint: viewMode === 'grid' ? '当前更适合按封面和作品感浏览。' : '当前更适合批量查看作品状态。',
      secondaryHint: hasActiveFilters ? '当前有筛选条件，重置后可回到完整音声库。' : '当前显示全部音声作品，可按字幕、进度和来源继续缩小范围。',
      chips: [
        { id: 'mode', label: '浏览节奏', value: viewMode === 'grid' ? '封面优先' : '列表管理', helper: '统一成播放器式浏览语言', tone: 'purple' },
        { id: 'result', label: '当前结果', value: `${visibleCount}/${works.length}`, helper: yesNoLabel(hasActiveFilters), tone: hasActiveFilters ? 'amber' : 'brand' },
        { id: 'local', label: '本地作品', value: `${localCount}`, helper: '来自 Local JSON Index', tone: localCount > 0 ? 'emerald' : 'slate' },
        { id: 'subtitle', label: '字幕作品', value: `${subtitleCount}`, helper: `${trackCount} 个音轨中已关联字幕`, tone: subtitleCount > 0 ? 'amber' : 'slate' },
      ],
    };
  },

  getMusicModel(args: {
    albums: MusicAlbum[];
    visibleTrackCount: number;
    activeView: 'tracks' | 'albums' | 'artists' | 'folders';
    hasActiveFilters: boolean;
  }): LibraryVisualUnityModel {
    const { albums, visibleTrackCount, activeView, hasActiveFilters } = args;
    const summary = mediaSurfaceStatusService.getMusicSummary(albums);
    const activeViewLabel = {
      tracks: '歌曲优先',
      albums: '专辑优先',
      artists: '艺术家优先',
      folders: '文件夹优先',
    }[activeView];

    return {
      title: '音乐库视觉统一',
      description: '把音乐库收成歌曲、专辑、艺术家和文件夹四种轻量浏览入口。',
      primaryHint: `当前是${activeViewLabel}的浏览方式。`,
      secondaryHint: hasActiveFilters ? '当前在专辑、艺术家、文件夹或搜索条件内浏览。' : '当前显示全部音乐，可切换专辑墙或艺术家入口。',
      chips: [
        { id: 'view', label: '浏览节奏', value: activeViewLabel, helper: '减少页面解释，只保留播放入口', tone: 'emerald' },
        { id: 'tracks', label: '当前歌曲', value: `${visibleTrackCount}/${summary.trackCount}`, helper: yesNoLabel(hasActiveFilters), tone: hasActiveFilters ? 'amber' : 'brand' },
        { id: 'local', label: '本地歌曲', value: `${summary.localTrackCount}`, helper: '来自 Local JSON Index', tone: summary.localTrackCount > 0 ? 'purple' : 'slate' },
        { id: 'lyrics', label: '歌词歌曲', value: `${summary.subtitleTrackCount}`, helper: '有歌词/字幕记录', tone: summary.subtitleTrackCount > 0 ? 'amber' : 'slate' },
      ],
    };
  },

  getPlaylistModel(args: {
    playlists: Playlist[];
    visibleCount: number;
    hasSearch: boolean;
  }): LibraryVisualUnityModel {
    const { playlists, visibleCount, hasSearch } = args;
    const summary = mediaSurfaceStatusService.getPlaylistSummary(playlists);
    return {
      title: '歌单视觉统一',
      description: '歌单页继续按本地播放器习惯收口，强调播放、排队和不会改动真实媒体文件。',
      primaryHint: hasSearch ? '当前按搜索结果显示歌单。' : '当前显示全部本地与示例歌单。',
      secondaryHint: '从歌单移除只影响歌单记录，不删除、移动或重命名真实文件。',
      chips: [
        { id: 'playlist', label: '歌单', value: `${visibleCount}/${summary.playlistCount}`, helper: playlistLocalityLabel(playlists), tone: hasSearch ? 'amber' : 'brand' },
        { id: 'tracks', label: '音轨', value: `${summary.trackCount}`, helper: '可混合音声与音乐', tone: 'purple' },
        { id: 'asmr', label: '音声', value: `${summary.asmrTrackCount}`, helper: 'ASMR/RJ 音轨', tone: 'amber' },
        { id: 'music', label: '音乐', value: `${summary.musicTrackCount}`, helper: '普通音乐音轨', tone: 'emerald' },
      ],
    };
  },

  getDiagnosticsModel(): LibraryVisualUnityDiagnosticsModel {
    return {
      title: 'MVP-53 资源库视觉统一与回归小修',
      description: '本轮同时收口音声库、音乐库和歌单页的浏览表层，统一中文媒体库文案、轻量状态卡和安全提示。',
      tasks: [
        { id: 'asmr', label: '音声库', value: '视觉统一', helper: '封面浏览 / 列表管理的提示更轻', tone: 'purple' },
        { id: 'music', label: '音乐库', value: '视觉统一', helper: '歌曲、专辑、艺术家、文件夹入口更一致', tone: 'emerald' },
        { id: 'playlist', label: '歌单页', value: '同步收口', helper: '强调播放队列和不改真实文件', tone: 'brand' },
        { id: 'handoff', label: '交接清理', value: '已更新', helper: '替换 MVP-52 交接包并接入 verifier', tone: 'amber' },
      ],
      guardrails: [
        '不改扫描链路',
        '不改 library-index.json 写入 / 读取链路',
        '不改 HTMLAudio 播放内核',
        '不改字幕读取链路',
        '不接 SQLite / 下载器 / 元数据 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
    };
  },
};
