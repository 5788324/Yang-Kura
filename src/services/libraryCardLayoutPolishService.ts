export type Mvp76CardLayoutTone = 'brand' | 'emerald' | 'amber' | 'purple' | 'slate';

export interface Mvp76LayoutChecklistItem {
  id: string;
  label: string;
  description: string;
  tone: Mvp76CardLayoutTone;
}

export interface Mvp76AsmrCardLayoutModel {
  ariaLabel: string;
  gridClassName: string;
  cardClassName: string;
  checklist: Mvp76LayoutChecklistItem[];
  note: string;
}

export interface Mvp76MusicCardLayoutModel {
  trackListAriaLabel: string;
  albumGridAriaLabel: string;
  albumGridClassName: string;
  albumCardClassName: string;
  checklist: Mvp76LayoutChecklistItem[];
  note: string;
}

export interface Mvp76DiagnosticsLayoutModel {
  title: string;
  description: string;
  layoutChecks: Mvp76LayoutChecklistItem[];
  guardrails: string[];
}

const sharedCardClass = 'group bg-card-bg/40 hover:bg-card-bg border border-border-color/60 hover:border-brand-color/50 rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shadow-sm relative min-w-0';

// mvp76-card-layout-unity: central card layout guard for ASMR and music library surfaces.
export const libraryCardLayoutPolishService = {
  getAsmrCardLayoutModel(args: {
    visibleCount: number;
    totalCount: number;
    viewMode: 'grid' | 'list';
    hasActiveFilters: boolean;
  }): Mvp76AsmrCardLayoutModel {
    const { visibleCount, totalCount, viewMode, hasActiveFilters } = args;
    return {
      ariaLabel: 'MVP76 音声库卡片布局统一：封面比例、标题截断、状态换行与安全列宽',
      gridClassName: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5 items-stretch',
      cardClassName: `${sharedCardClass} min-h-[390px]`,
      note: `当前 ${visibleCount}/${totalCount} 个音声作品，${viewMode === 'grid' ? '封面浏览' : '列表浏览'}，${hasActiveFilters ? '已启用筛选' : '未启用筛选'}。`,
      checklist: [
        { id: 'columns', label: '安全列宽', description: '避免在普通桌面宽度强行四列导致卡片过窄。', tone: 'brand' },
        { id: 'cover', label: '固定封面比例', description: '封面保持 aspect-square，不因标题或标签数量改变比例。', tone: 'purple' },
        { id: 'title', label: '长标题截断', description: '作品标题固定两行，社团和 CV 使用 min-w-0 / truncate。', tone: 'emerald' },
        { id: 'chips', label: '状态换行', description: '字幕、进度、时长状态允许换行，不再挤出卡片。', tone: 'amber' },
      ],
    };
  },

  getMusicCardLayoutModel(args: {
    albumCount: number;
    visibleTrackCount: number;
    activeView: 'tracks' | 'albums' | 'artists' | 'folders';
    hasActiveFilters: boolean;
  }): Mvp76MusicCardLayoutModel {
    const { albumCount, visibleTrackCount, activeView, hasActiveFilters } = args;
    return {
      trackListAriaLabel: 'MVP76 音乐库歌曲行布局统一：窄屏换行、标题截断、操作区不挤压',
      albumGridAriaLabel: 'MVP76 音乐库专辑卡片布局统一：封面比例、标题高度、徽章区域和底部信息稳定',
      albumGridClassName: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5 items-stretch',
      albumCardClassName: `${sharedCardClass} p-3 min-h-[360px]`,
      note: `当前 ${visibleTrackCount} 首可见歌曲，${albumCount} 张专辑，浏览方式为 ${activeView}，${hasActiveFilters ? '已启用筛选' : '未启用筛选'}。`,
      checklist: [
        { id: 'track-row', label: '歌曲行换行', description: '操作按钮在窄屏下换到下一行，不压缩标题和封面。', tone: 'emerald' },
        { id: 'album-grid', label: '专辑列宽', description: '专辑墙与音声墙使用一致列宽节奏。', tone: 'brand' },
        { id: 'album-title', label: '标题高度', description: '专辑标题固定两行，避免同一行卡片高度跳动。', tone: 'purple' },
        { id: 'footer', label: '底部对齐', description: '类型和曲目数固定在底部，减少卡片下沿错位。', tone: 'amber' },
      ],
    };
  },

  getDiagnosticsModel(): Mvp76DiagnosticsLayoutModel {
    return {
      title: 'MVP-76 音声库 / 音乐库卡片视觉统一',
      description: '本轮只做媒体库卡片和歌曲行布局稳定性收口，重点检查封面比例、长标题、状态徽章、窄屏换行和卡片高度。',
      layoutChecks: [
        { id: 'asmr-grid', label: '音声库卡片', description: 'mvp76-asmr-card-layout-unity：安全列宽、固定封面、状态换行。', tone: 'brand' },
        { id: 'music-grid', label: '音乐库专辑', description: 'mvp76-music-card-layout-unity：与音声墙统一列宽与卡片结构。', tone: 'emerald' },
        { id: 'track-list', label: '音乐歌曲行', description: 'mvp76-music-track-layout-unity：窄屏下操作区换行，不遮挡标题。', tone: 'purple' },
        { id: 'overflow', label: '溢出保护', description: 'min-w-0、truncate、line-clamp 和 flex-wrap 避免长文本挤爆布局。', tone: 'amber' },
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
