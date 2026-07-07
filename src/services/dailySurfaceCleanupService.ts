export type Mvp72DailySurfaceTone = 'primary' | 'library' | 'playback' | 'maintenance' | 'safe';

export interface Mvp72DailySurfaceCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp72DailySurfaceTone;
  actionLabel: string;
  visibleOnHome: boolean;
}

export interface Mvp72MaintenanceGroup {
  id: string;
  title: string;
  description: string;
  defaultState: 'collapsed' | 'visible';
  items: string[];
}

export interface Mvp72DailySurfaceCleanupModel {
  version: string;
  title: string;
  description: string;
  homePrinciple: string;
  userVisibleRule: string;
  homeCards: Mvp72DailySurfaceCard[];
  settingsRules: string[];
  diagnosticsGroups: Mvp72MaintenanceGroup[];
  hiddenFromDailySurface: string[];
  nextWorkItems: string[];
  safetyBoundaries: string[];
}

const homeCards: Mvp72DailySurfaceCard[] = [
  {
    id: 'continue-listening',
    title: '继续播放',
    description: '保留在首页第一优先级，直接回到上次音轨和播放位置。',
    tone: 'playback',
    actionLabel: '播放',
    visibleOnHome: true,
  },
  {
    id: 'recent-listening',
    title: '最近播放',
    description: '用普通媒体库语言展示历史，不显示 verifier、IPC 或扫描合同。',
    tone: 'primary',
    actionLabel: '查看',
    visibleOnHome: true,
  },
  {
    id: 'recently-added',
    title: '最近加入',
    description: '导入资源后优先看新作品、新专辑和可播放音轨。',
    tone: 'library',
    actionLabel: '浏览',
    visibleOnHome: true,
  },
  {
    id: 'library-entry',
    title: '资源库入口',
    description: '音声库、音乐库、歌单保留为清晰入口，不混入工程说明。',
    tone: 'library',
    actionLabel: '进入',
    visibleOnHome: true,
  },
  {
    id: 'maintenance-folded',
    title: '维护信息折叠',
    description: 'MVP 历史、Electron、IPC、Scanner、Contract 等只留在诊断折叠区。',
    tone: 'maintenance',
    actionLabel: '维护',
    visibleOnHome: false,
  },
];

const settingsRules = [
  '设置页日常区只强调选择目录、读取资源库记录、一键扫描并应用。',
  '桌面端状态、扫描预览、写入预览和历史验证默认保留在折叠区。',
  '主界面可见文案使用中文媒体库语言，不展示 MVP 阶段标签。',
  '需要 AI 维护时，再展开开发者详情和高级诊断。',
];

const diagnosticsGroups: Mvp72MaintenanceGroup[] = [
  {
    id: 'daily-diagnostics',
    title: '日常诊断',
    description: '只保留普通用户能理解的健康状况、资源库扫描、命名检查、文件状态、重复资源。',
    defaultState: 'visible',
    items: ['健康状况', '资源库扫描', '命名检查', '文件状态', '重复资源'],
  },
  {
    id: 'ai-maintenance-history',
    title: 'AI 维护与历史验证',
    description: '保留 verifier marker、MVP 阶段记录和 Codex / DeepSeek 交接信息。',
    defaultState: 'collapsed',
    items: ['verifier marker', 'MVP 历史', '交接文档', '回归命令'],
  },
  {
    id: 'developer-contracts',
    title: '开发者合同与桌面端细节',
    description: 'Electron、IPC、Scanner、Dry-run、Index、Contract 等维护信息继续折叠。',
    defaultState: 'collapsed',
    items: ['Electron', 'IPC', 'Scanner', 'Dry-run', 'Index', 'Contract'],
  },
];

const hiddenFromDailySurface = [
  'MVP 阶段标签',
  'verifier 细节',
  'Electron / IPC 合同',
  'Scanner / Dry-run / Contract',
  'Bridge / Engine / Fallback',
  'absolutePath / file:// 技术说明',
];

const nextWorkItems = [
  '继续精修首页视觉层级，减少重复入口。',
  '播放器大页继续向黑胶 / 歌词 / 封面氛围方向打磨。',
  '诊断页后续可以按阶段把 MVP-01~MVP-72 历史折成组。',
  '回住所后再把 MVP70/MVP71/MVP72 推送到 GitHub。',
];

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

export const dailySurfaceCleanupService = {
  getModel(): Mvp72DailySurfaceCleanupModel {
    return {
      version: '0.110.0-mvp72',
      title: 'MVP-72 日常界面继续收口',
      description: '在 MVP-71 的主界面简化基础上，继续把可见文案改成正常媒体库语言，并把工程细节留在折叠维护区。',
      homePrinciple: '首页先服务听音频：继续播放、最近播放、最近加入、资源库入口。',
      userVisibleRule: '普通页面不显示 MVP / verifier / IPC / Scanner / Contract 等工程词。',
      homeCards,
      settingsRules,
      diagnosticsGroups,
      hiddenFromDailySurface,
      nextWorkItems,
      safetyBoundaries,
    };
  },
};
