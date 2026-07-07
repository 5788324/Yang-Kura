import type { MusicAlbum, RJWork } from '../types';
import {
  libraryBrowseService,
  type WorkPlaybackFilter,
  type WorkSourceFilter,
  type WorkSubtitleFilter,
} from './libraryBrowseService';
import { mediaSurfaceStatusService } from './mediaSurfaceStatusService';

export type LibraryBrowseTone = 'brand' | 'emerald' | 'amber' | 'purple' | 'slate';

export interface LibraryBrowseMetric {
  id: string;
  label: string;
  value: string | number;
  helper: string;
  tone: LibraryBrowseTone;
}

export interface ActiveBrowseFilter {
  id: string;
  label: string;
  value: string;
}

export interface AsmrBrowseSurfaceModel {
  heading: string;
  description: string;
  metrics: LibraryBrowseMetric[];
  activeFilters: ActiveBrowseFilter[];
  resultText: string;
  viewText: string;
  hasActiveFilters: boolean;
}

export interface MusicBrowseSurfaceModel {
  heading: string;
  description: string;
  metrics: LibraryBrowseMetric[];
  activeFilters: ActiveBrowseFilter[];
  resultText: string;
  viewText: string;
  hasActiveFilters: boolean;
}

const sourceLabel: Record<WorkSourceFilter, string> = {
  all: '全部来源',
  'local-index': '本地资源',
  demo: '示例资源',
};

const subtitleLabel: Record<WorkSubtitleFilter, string> = {
  all: '全部字幕',
  'has-subtitle': '有字幕',
  'missing-subtitle': '无字幕',
};

const playbackLabel: Record<WorkPlaybackFilter, string> = {
  all: '全部进度',
  unplayed: '未播放',
  'in-progress': '未听完',
  completed: '已听完',
};

const musicViewLabel = {
  tracks: '歌曲列表',
  albums: '专辑浏览',
  artists: '艺术家浏览',
  folders: '文件夹浏览',
} as const;

export const libraryBrowseSurfaceService = {
  getAsmrSurfaceModel(args: {
    works: RJWork[];
    visibleCount: number;
    viewMode: 'grid' | 'list';
    sourceFilter: WorkSourceFilter;
    subtitleFilter: WorkSubtitleFilter;
    playbackFilter: WorkPlaybackFilter;
    statusFilter: string;
    selectedTag: string | null;
    searchQuery: string;
  }): AsmrBrowseSurfaceModel {
    const {
      works,
      visibleCount,
      viewMode,
      sourceFilter,
      subtitleFilter,
      playbackFilter,
      statusFilter,
      selectedTag,
      searchQuery,
    } = args;
    const localWorks = works.filter((work) => libraryBrowseService.getWorkSourceKind(work) === 'local-index').length;
    const subtitleWorks = works.filter((work) => libraryBrowseService.getWorkSubtitleSummary(work).hasSubtitle).length;
    const warningWorks = works.filter((work) => work.status !== 'identified').length;
    const trackCount = works.reduce((sum, work) => sum + (work.tracks?.length ?? 0), 0);

    const activeFilters: ActiveBrowseFilter[] = [];
    if (searchQuery.trim()) activeFilters.push({ id: 'search', label: '搜索', value: searchQuery.trim() });
    if (sourceFilter !== 'all') activeFilters.push({ id: 'source', label: '来源', value: sourceLabel[sourceFilter] });
    if (subtitleFilter !== 'all') activeFilters.push({ id: 'subtitle', label: '字幕', value: subtitleLabel[subtitleFilter] });
    if (playbackFilter !== 'all') activeFilters.push({ id: 'playback', label: '进度', value: playbackLabel[playbackFilter] });
    if (statusFilter !== 'all') activeFilters.push({ id: 'status', label: '状态', value: statusFilter });
    if (selectedTag) activeFilters.push({ id: 'tag', label: '标签', value: selectedTag });

    return {
      heading: '音声库浏览',
      description: '按作品、字幕和播放进度浏览本地 ASMR/RJ 资源。',
      metrics: [
        { id: 'works', label: '作品', value: works.length, helper: '当前索引', tone: 'purple' },
        { id: 'tracks', label: '音轨', value: trackCount, helper: '可播放条目', tone: 'brand' },
        { id: 'local', label: '本地', value: localWorks, helper: '真实资源记录', tone: 'emerald' },
        { id: 'subtitle', label: '字幕', value: subtitleWorks, helper: '已关联字幕', tone: 'amber' },
      ],
      activeFilters,
      resultText: `显示 ${visibleCount} / ${works.length} 个音声作品`,
      viewText: viewMode === 'list' ? '列表浏览' : '封面浏览',
      hasActiveFilters: activeFilters.length > 0 || warningWorks > 0,
    };
  },

  getMusicSurfaceModel(args: {
    albums: MusicAlbum[];
    visibleTrackCount: number;
    activeView: keyof typeof musicViewLabel;
    searchQuery: string;
    selectedAlbumTitle?: string | null;
    selectedArtist?: string | null;
    selectedFolder?: string | null;
  }): MusicBrowseSurfaceModel {
    const { albums, visibleTrackCount, activeView, searchQuery, selectedAlbumTitle, selectedArtist, selectedFolder } = args;
    const summary = mediaSurfaceStatusService.getMusicSummary(albums);
    const activeFilters: ActiveBrowseFilter[] = [];
    if (searchQuery.trim()) activeFilters.push({ id: 'search', label: '搜索', value: searchQuery.trim() });
    if (selectedAlbumTitle) activeFilters.push({ id: 'album', label: '专辑', value: selectedAlbumTitle });
    if (selectedArtist) activeFilters.push({ id: 'artist', label: '艺术家', value: selectedArtist });
    if (selectedFolder) activeFilters.push({ id: 'folder', label: '文件夹', value: selectedFolder });

    return {
      heading: '音乐库浏览',
      description: '按歌曲、专辑、艺术家和文件夹浏览普通音乐。',
      metrics: [
        { id: 'albums', label: '专辑', value: summary.albumCount, helper: '收录专辑', tone: 'emerald' },
        { id: 'tracks', label: '歌曲', value: summary.trackCount, helper: '全部音轨', tone: 'brand' },
        { id: 'local', label: '本地', value: summary.localTrackCount, helper: '真实资源记录', tone: 'purple' },
        { id: 'subtitle', label: '歌词', value: summary.subtitleTrackCount, helper: '有字幕/歌词', tone: 'amber' },
      ],
      activeFilters,
      resultText: `显示 ${visibleTrackCount} / ${summary.trackCount} 首歌曲`,
      viewText: musicViewLabel[activeView],
      hasActiveFilters: activeFilters.length > 0,
    };
  },
};
