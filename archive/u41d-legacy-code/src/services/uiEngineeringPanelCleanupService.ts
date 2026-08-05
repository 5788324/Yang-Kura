export type Mvp109UiCleanupTone = 'emerald' | 'sky' | 'violet' | 'amber';

export interface Mvp109UiCleanupCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp109UiCleanupTone;
}

export interface Mvp109UiEngineeringPanelCleanupModel {
  version: '0.147.0-mvp109';
  title: string;
  summary: string;
  userFacingRule: string;
  primarySurfaceChanges: Mvp109UiCleanupCard[];
  hiddenMaintenanceAreas: string[];
  deferredCleanup: string[];
}

const model: Mvp109UiEngineeringPanelCleanupModel = {
  version: '0.147.0-mvp109',
  title: '导入流程已收口',
  summary:
    '导入器阶段已收尾，本轮把主界面继续压回日常使用：用户只看导入、播放、资源库和结果；AI 维护、MVP 历史、IPC、verifier、合同说明继续保留但默认折叠。',
  userFacingRule:
    '主页面只展示日常操作和结果摘要；工程词、合同、verifier、IPC、历史 MVP 记录默认进入诊断页或 AI 维护区。',
  primarySurfaceChanges: [
    {
      id: 'importer-daily-entry',
      title: '导入器只保留日常入口',
      description: '选择来源、查看预览、处理冲突、复制或移动、刷新资源库。',
      tone: 'emerald',
    },
    {
      id: 'maintenance-folded',
      title: '维护信息默认折叠',
      description: 'MVP 历史、IPC、合同、verifier、边界说明继续保留给 AI，但不占用日常界面。',
      tone: 'violet',
    },
    {
      id: 'home-media-first',
      title: '首页媒体优先',
      description: '首页继续突出继续播放、最近播放、音声库、音乐库和歌单入口。',
      tone: 'sky',
    },
    {
      id: 'diagnostics-only-engineering',
      title: '诊断页承接工程信息',
      description: '主页面不再解释实现细节；需要排查时再进入诊断或 AI 维护区。',
      tone: 'amber',
    },
  ],
  hiddenMaintenanceAreas: [
    'MVP86～MVP108 阶段记录',
    'IPC / preload / main-side contract',
    'verifier marker 与历史兼容锚点',
    'no SQLite / no absolutePath / no file:// 等 AI 维护边界',
    'Codex 非必要不安排的验收说明',
  ],
  deferredCleanup: [
    '全站历史文档归档需要先调整旧 verifier，暂不硬删。',
    '下载器、元数据、mpv、SQLite 进入新阶段前再分别做用户界面简化。',
    '诊断页本身可以继续保留工程信息，但默认必须折叠。',
  ],
};

export const uiEngineeringPanelCleanupService = {
  getModel(): Mvp109UiEngineeringPanelCleanupModel {
    return model;
  },
  getToneClassName(tone: Mvp109UiCleanupTone): string {
    if (tone === 'emerald') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    if (tone === 'sky') return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    if (tone === 'amber') return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
  },
};
