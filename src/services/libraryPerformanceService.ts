import type { AudioTrack, MusicAlbum, RJWork } from '../types';

export const LARGE_LIBRARY_RENDER_LIMITS = Object.freeze({
  asmrInitial: 72,
  asmrStep: 72,
  musicTracksInitial: 160,
  musicTracksStep: 160,
  musicAlbumsInitial: 72,
  musicAlbumsStep: 72,
  musicGroupsInitial: 120,
  musicGroupsStep: 120,
});

export interface LibraryRenderWindowModel {
  totalCount: number;
  visibleCount: number;
  remainingCount: number;
  hasMore: boolean;
  nextCount: number;
  summary: string;
}

export interface MusicSearchIndex {
  albumTextById: Map<string, string>;
  trackTextById: Map<string, string>;
}

export interface LibraryPerformanceDiagnosticsModel {
  title: string;
  description: string;
  syntheticFixture: {
    asmrWorks: number;
    musicAlbums: number;
    totalTracks: number;
  };
  renderBudgets: Array<{ id: string; label: string; value: string; helper: string }>;
  safeguards: string[];
  benchmarkCommand: string;
}

function normalizeParts(parts: Array<string | number | undefined | null>): string {
  return parts
    .filter((value): value is string | number => value !== undefined && value !== null)
    .join('\u0001')
    .toLowerCase();
}

function audioTrackSearchText(track: AudioTrack): string {
  return normalizeParts([
    track.id,
    track.title,
    track.artist,
    track.album,
    track.circle,
    track.rjId,
    track.fileTreePath,
    track.sourceRelativePath,
  ]);
}

export const libraryPerformanceService = {
  normalizeQuery(value: string): string {
    return value.trim().toLowerCase();
  },

  buildAsmrSearchIndex(works: RJWork[]): Map<string, string> {
    return new Map(
      works.map((work) => [
        work.id,
        normalizeParts([
          work.id,
          work.title,
          work.circle,
          work.cvs.join('\u0001'),
          work.tags.join('\u0001'),
          work.description,
          work.personalNotes,
          work.personalStatus,
          ...work.tracks.map(audioTrackSearchText),
        ]),
      ]),
    );
  },

  buildMusicSearchIndex(albums: MusicAlbum[]): MusicSearchIndex {
    const albumTextById = new Map<string, string>();
    const trackTextById = new Map<string, string>();

    albums.forEach((album) => {
      const albumContext = normalizeParts([
        album.id,
        album.title,
        album.artist,
        album.genre,
        album.releaseYear,
      ]);
      albumTextById.set(
        album.id,
        normalizeParts([albumContext, ...album.tracks.map(audioTrackSearchText)]),
      );
      album.tracks.forEach((track) => {
        trackTextById.set(track.id, normalizeParts([albumContext, audioTrackSearchText(track)]));
      });
    });

    return { albumTextById, trackTextById };
  },

  sliceRenderWindow<T>(items: T[], limit: number): T[] {
    if (items.length <= limit) return items;
    return items.slice(0, Math.max(1, limit));
  },

  getRenderWindowModel(totalCount: number, visibleCount: number, step: number, noun: string): LibraryRenderWindowModel {
    const safeTotal = Math.max(0, totalCount);
    const safeVisible = Math.min(safeTotal, Math.max(0, visibleCount));
    const remainingCount = Math.max(0, safeTotal - safeVisible);
    const nextCount = Math.min(remainingCount, Math.max(1, step));
    return {
      totalCount: safeTotal,
      visibleCount: safeVisible,
      remainingCount,
      hasMore: remainingCount > 0,
      nextCount,
      summary: remainingCount > 0
        ? `当前渲染 ${safeVisible}/${safeTotal} 个${noun}，其余按需加载。`
        : `已显示全部 ${safeTotal} 个${noun}。`,
    };
  },

  getDiagnosticsModel(): LibraryPerformanceDiagnosticsModel {
    return {
      title: '大资源库性能保护',
      description: '使用生成数据验证搜索和排序；真实资源库不会被扫描、复制、移动或修改。',
      syntheticFixture: {
        asmrWorks: 4_000,
        musicAlbums: 1_500,
        totalTracks: 50_000,
      },
      renderBudgets: [
        { id: 'asmr', label: '音声作品首屏', value: `${LARGE_LIBRARY_RENDER_LIMITS.asmrInitial} 项`, helper: '继续浏览时分批加载' },
        { id: 'music-track', label: '音乐曲目首屏', value: `${LARGE_LIBRARY_RENDER_LIMITS.musicTracksInitial} 项`, helper: '避免一次创建上万行 DOM' },
        { id: 'music-album', label: '音乐专辑首屏', value: `${LARGE_LIBRARY_RENDER_LIMITS.musicAlbumsInitial} 项`, helper: '封面墙按需扩展' },
        { id: 'search', label: '搜索输入', value: 'Deferred', helper: '输入与大列表过滤解耦' },
      ],
      safeguards: [
        '只生成内存测试数据，不读取任何真实媒体路径。',
        'Renderer 仍不接收 absolutePath 或 file://。',
        '音声库、音乐库只限制 DOM 渲染量，不截断搜索结果总数。',
        '主要页面按路由拆包；完整诊断内容需要用户主动打开。',
      ],
      benchmarkCommand: 'npm run test:library:performance',
    };
  },
};
