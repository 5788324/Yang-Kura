export type Mvp71SurfaceTone = 'daily' | 'media' | 'maintenance' | 'safe';

export interface Mvp71SurfaceCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp71SurfaceTone;
  actionLabel: string;
  bullets: string[];
}

export interface Mvp71MaintenanceBucket {
  id: string;
  title: string;
  description: string;
  defaultState: 'collapsed' | 'visible';
  contains: string[];
}

export interface Mvp71UserFacingSimplificationModel {
  version: string;
  title: string;
  description: string;
  homeTitle: string;
  homeDescription: string;
  mainEntryCards: Mvp71SurfaceCard[];
  mainSurfaceRules: string[];
  maintenanceTitle: string;
  maintenanceDescription: string;
  maintenanceBuckets: Mvp71MaintenanceBucket[];
  diagnosticBuckets: Mvp71MaintenanceBucket[];
  hiddenEngineeringTerms: string[];
  safetyBoundaries: string[];
}

const mainEntryCards: Mvp71SurfaceCard[] = [
  {
    id: 'continue-listening',
    title: '继续播放',
    description: '从上次播放位置继续听当前音轨，优先服务日常听音频。',
    tone: 'media',
    actionLabel: '继续',
    bullets: ['播放进度', '最近音轨', '本地记录'],
  },
  {
    id: 'recent-listening',
    title: '最近播放',
    description: '展示最近听过的音声和音乐，不混入扫描合同或验证信息。',
    tone: 'daily',
    actionLabel: '查看',
    bullets: ['最近播放', '播放历史', '快速返回'],
  },
  {
    id: 'recently-added',
    title: '最近加入',
    description: '突出新导入的音声作品和音乐专辑，方便导入后直接浏览。',
    tone: 'media',
    actionLabel: '浏览',
    bullets: ['音声库', '音乐库', '封面优先'],
  },
  {
    id: 'asmr-library',
    title: '音声库入口',
    description: '进入 RJ / ASMR 作品库，关注封面、RJ号、字幕状态和播放进度。',
    tone: 'daily',
    actionLabel: '进入音声库',
    bullets: ['RJ作品', '字幕状态', '继续听'],
  },
  {
    id: 'music-library',
    title: '音乐库入口',
    description: '进入普通音乐库，关注专辑、歌曲、艺术家和歌单流转。',
    tone: 'daily',
    actionLabel: '进入音乐库',
    bullets: ['专辑', '歌曲', '艺术家'],
  },
  {
    id: 'playlists',
    title: '歌单入口',
    description: '进入歌单页，统一管理音声音轨和普通音乐音轨的播放集合。',
    tone: 'daily',
    actionLabel: '进入歌单',
    bullets: ['混合歌单', '播放队列', '收藏'],
  },
];

const mainSurfaceRules = [
  '首页只放继续播放、最近播放、最近加入、音声库、音乐库和歌单入口。',
  '音声库、音乐库、歌单和播放器页面减少 MVP / Contract / IPC 等工程提示。',
  '资源异常只用用户能理解的标签展示，例如缺封面、缺字幕、文件不可用。',
  '工程状态、verifier 历史和 Electron 合同默认收进诊断页的折叠区。',
];

const maintenanceBuckets: Mvp71MaintenanceBucket[] = [
  {
    id: 'ai-maintenance',
    title: 'AI 维护区',
    description: '保留给后续 AI / Codex / DeepSeek 读的工程脉络，不放到日常首页。',
    defaultState: 'collapsed',
    contains: ['MVP 历史', 'verifier marker', '回归验收说明'],
  },
  {
    id: 'developer-details',
    title: '开发者详情',
    description: 'Electron、IPC、Scanner、Contract、Dry-run、Index 等技术信息统一放在折叠区。',
    defaultState: 'collapsed',
    contains: ['Electron', 'IPC', 'Scanner', 'Contract', 'Dry-run'],
  },
  {
    id: 'historical-verification',
    title: '历史验证',
    description: '旧 verifier marker 和阶段文档继续保留，但默认不干扰普通浏览。',
    defaultState: 'collapsed',
    contains: ['MVP-01~MVP-70', 'verify:all', '打包回归记录'],
  },
];

const diagnosticBuckets: Mvp71MaintenanceBucket[] = [
  {
    id: 'advanced-diagnostics',
    title: '高级诊断',
    description: '用于定位扫描、索引、桌面端、字幕和外部打开问题。',
    defaultState: 'collapsed',
    contains: ['扫描预览', '索引写入/读取', '外部打开', '播放与字幕'],
  },
  {
    id: 'safe-boundary',
    title: '安全边界',
    description: '集中展示不会执行的危险动作，防止后续任务越界。',
    defaultState: 'visible',
    contains: ['不删除文件', '不移动文件', '不重命名文件'],
  },
];

const hiddenEngineeringTerms = ['MVP', 'verifier', 'Electron', 'IPC', 'Contract', 'Scanner', 'Dry-run', 'Bridge', 'Engine', 'Fallback'];

const safetyBoundaries = [
  '不接 SQLite。',
  '不接下载器。',
  '不接 ASMR.one / DLsite / 网易云元数据抓取。',
  '不接 mpv。',
  '不删除、移动、重命名真实媒体文件。',
  '不向 Renderer 暴露 absolutePath。',
  '不向 Renderer 暴露 file://。',
  '不改真实扫描、写 index、播放内核链路。',
];

export const userFacingSimplificationService = {
  getModel(): Mvp71UserFacingSimplificationModel {
    return {
      version: '0.109.0-mvp71',
      title: 'MVP-71 主界面简化与 AI 维护区收口',
      description: '本轮只收口信息架构：主界面媒体感优先，工程细节默认折叠到 AI 维护区、开发者详情、历史验证和高级诊断。',
      homeTitle: '日常使用入口',
      homeDescription: '首页优先展示继续播放、最近播放、最近加入、音声库、音乐库和歌单入口。',
      mainEntryCards,
      mainSurfaceRules,
      maintenanceTitle: 'AI 维护区默认折叠',
      maintenanceDescription: '工程 / verifier / MVP 历史 / Electron / IPC / Contract / Scanner 等信息保留给维护使用，但不再压到日常主界面。',
      maintenanceBuckets,
      diagnosticBuckets,
      hiddenEngineeringTerms,
      safetyBoundaries,
    };
  },
};
