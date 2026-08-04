import type { AudioTrack } from '../types';
import type { LibraryBrowseTone } from './libraryBrowseSurfaceService';

export interface LibraryBetaRegressionChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: LibraryBrowseTone;
}

export interface LibraryBetaRegressionModel {
  title: string;
  description: string;
  chips: LibraryBetaRegressionChip[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
}

export interface LibraryBetaRegressionDiagnosticsModel {
  title: string;
  description: string;
  fixes: LibraryBetaRegressionChip[];
  guardrails: string[];
}

const viewLabel = {
  grid: '封面浏览',
  list: '列表浏览',
  tracks: '歌曲列表',
  albums: '专辑浏览',
  artists: '艺术家浏览',
  folders: '文件夹浏览',
} as const;

const uniqueNonEmpty = (values: Array<string | undefined | null>): string[] => {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
  }
  return output;
};

const filterStateLabel = (hasActiveFilters: boolean): string => hasActiveFilters ? '已筛选' : '全部内容';

export const libraryBetaRegressionPolishService = {
  getAsmrModel(args: {
    visibleCount: number;
    totalCount: number;
    viewMode: 'grid' | 'list';
    hasActiveFilters: boolean;
  }): LibraryBetaRegressionModel {
    const { visibleCount, totalCount, viewMode, hasActiveFilters } = args;
    return {
      title: '音声库浏览微调',
      description: '本轮只修正浏览层的空状态、筛选提示和轻量文案，不改变扫描、索引或真实文件。',
      chips: [
        { id: 'view', label: '浏览方式', value: viewLabel[viewMode], helper: '保留封面与列表两种入口', tone: 'purple' },
        { id: 'result', label: '当前结果', value: `${visibleCount}/${totalCount}`, helper: '按当前搜索和筛选展示', tone: 'brand' },
        { id: 'filter', label: '筛选状态', value: filterStateLabel(hasActiveFilters), helper: hasActiveFilters ? '可一键重置' : '未限制范围', tone: hasActiveFilters ? 'amber' : 'emerald' },
      ],
      emptyTitle: hasActiveFilters ? '没有符合条件的音声作品' : '音声库暂无作品',
      emptyDescription: hasActiveFilters
        ? '当前搜索或筛选条件过窄，可以重置筛选后再浏览。'
        : '选择资源库并读取索引后，这里会显示本地 ASMR/RJ 作品。',
      emptyActionLabel: '重置筛选',
    };
  },

  getMusicModel(args: {
    visibleTrackCount: number;
    totalTrackCount: number;
    activeView: 'tracks' | 'albums' | 'artists' | 'folders';
    hasActiveFilters: boolean;
  }): LibraryBetaRegressionModel {
    const { visibleTrackCount, totalTrackCount, activeView, hasActiveFilters } = args;
    return {
      title: '音乐库浏览微调',
      description: '本轮修正音乐库曲目信息重复、浏览提示和空状态，继续保持中文媒体库表层。',
      chips: [
        { id: 'view', label: '当前视图', value: viewLabel[activeView], helper: '歌曲 / 专辑 / 艺术家 / 文件夹', tone: 'emerald' },
        { id: 'result', label: '当前歌曲', value: `${visibleTrackCount}/${totalTrackCount}`, helper: '按当前视图与搜索展示', tone: 'brand' },
        { id: 'filter', label: '筛选状态', value: filterStateLabel(hasActiveFilters), helper: hasActiveFilters ? '可返回全部歌曲' : '未限制范围', tone: hasActiveFilters ? 'amber' : 'purple' },
      ],
      emptyTitle: hasActiveFilters ? '没有符合条件的音乐' : '音乐库暂无歌曲',
      emptyDescription: hasActiveFilters
        ? '当前专辑、艺术家、文件夹或搜索条件下没有可显示曲目，可以返回全部歌曲。'
        : '选择音乐目录并读取索引后，这里会显示本地歌曲、专辑和艺术家。',
      emptyActionLabel: '返回全部歌曲',
    };
  },

  getTrackSecondaryLine(track: AudioTrack): string {
    const parts = uniqueNonEmpty([track.artist, track.album]);
    if (parts.length === 0) return track.type === 'asmr' ? '本地音声' : '本地音乐';
    return parts.join(' · ');
  },

  getDiagnosticsModel(): LibraryBetaRegressionDiagnosticsModel {
    return {
      title: 'MVP-52 资源库浏览回归修复',
      description: '本轮只做音声库与音乐库的轻量回归修复：曲目信息去重、空状态更清楚、筛选提示更稳，不改变真实数据链路。',
      fixes: [
        { id: 'music-line', label: '音乐曲目', value: '已去重', helper: '避免艺术家名称重复显示', tone: 'emerald' },
        { id: 'empty-state', label: '空状态', value: '更清楚', helper: '筛选为空时提供明确恢复入口', tone: 'amber' },
        { id: 'browse-copy', label: '浏览文案', value: '更轻', helper: '继续减少工程信息和状态堆叠', tone: 'purple' },
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
