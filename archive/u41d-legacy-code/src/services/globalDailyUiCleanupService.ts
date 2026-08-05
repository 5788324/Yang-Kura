export type Mvp110DailyUiTone = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';

export interface Mvp110DailyUiCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp110DailyUiTone;
}

export interface Mvp110DailyUiSurface {
  id: string;
  title: string;
  visibleGoal: string;
  foldedDetails: string[];
}

export interface Mvp110GlobalDailyUiCleanupModel {
  version: '0.148.0-mvp110';
  title: string;
  summary: string;
  dailyRule: string;
  visibleCards: Mvp110DailyUiCard[];
  surfaces: Mvp110DailyUiSurface[];
  termsMovedBehindMaintenance: string[];
  guardrails: string[];
}

const model: Mvp110GlobalDailyUiCleanupModel = {
  version: '0.148.0-mvp110',
  title: '主界面继续日常化',
  summary:
    '本轮继续把首页、设置页、下载页和播放器周边的工程说明后置。普通用户只看到播放、导入、资源库、设置和结果；维护上下文继续保留给诊断页与 AI 维护区。',
  dailyRule:
    '主界面不展示阶段号、合同词、内部令牌、运行时探针、IPC/verifier 历史；必要说明改成中文日常用语，技术锚点放进 sr-only 或折叠维护区。',
  visibleCards: [
    {
      id: 'home-media-actions',
      title: '首页只保留媒体入口',
      description: '继续播放、最近播放、音声库、音乐库、歌单和导入资源库。',
      tone: 'emerald',
    },
    {
      id: 'settings-user-words',
      title: '设置页改成日常说法',
      description: '目录授权、读取已有记录、一键更新资源库；不再露出 rootPathToken / dry-run / Renderer 等词。',
      tone: 'sky',
    },
    {
      id: 'downloader-planning-copy',
      title: '下载页降级为规划入口',
      description: '下载功能尚未接入真实来源；页面只保留导入/下载生态预览，不出现加密通道、缓存提取等误导文案。',
      tone: 'violet',
    },
    {
      id: 'diagnostics-maintenance-only',
      title: '诊断页承接维护信息',
      description: '历史验证、合同、IPC、边界说明继续保留，但默认不进入日常页面。',
      tone: 'amber',
    },
  ],
  surfaces: [
    {
      id: 'dashboard',
      title: '首页',
      visibleGoal: '像媒体库首页，不像项目状态仪表盘。',
      foldedDetails: ['MVP 历史', '回归提示', '资源库内部状态'],
    },
    {
      id: 'settings',
      title: '设置页',
      visibleGoal: '像资源库与外观设置，不像 Electron 调试台。',
      foldedDetails: ['运行环境探针', '目录令牌', '扫描合同', '写入预览细节'],
    },
    {
      id: 'downloader',
      title: '下载页',
      visibleGoal: '明确“规划中”，不暗示已经能联网下载或解析平台内容。',
      foldedDetails: ['Provider 名称', '下载引擎设计', '未来任务模型'],
    },
    {
      id: 'player',
      title: '播放器',
      visibleGoal: '优先显示播放、队列、字幕、睡眠定时，不显示技术实现状态。',
      foldedDetails: ['HTMLAudio / mpv 路线', '播放内核边界'],
    },
  ],
  termsMovedBehindMaintenance: [
    'rootPathToken',
    'dry-run',
    'Renderer',
    'absolutePath',
    'file://',
    'IPC',
    'Contract',
    'verifier',
    'MVP 阶段号',
  ],
  guardrails: [
    '不修改 copy-only / move-only 执行器。',
    '不修改 scanner / library-index 写入 / 读取链路。',
    '不接 SQLite、下载器真实来源、元数据 Provider、mpv。',
    '不删除、移动、重命名真实媒体文件。',
    '不向主界面展示真实路径或 file://。',
  ],
};

export const globalDailyUiCleanupService = {
  getModel(): Mvp110GlobalDailyUiCleanupModel {
    return model;
  },
  getToneClassName(tone: Mvp110DailyUiTone): string {
    if (tone === 'emerald') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    if (tone === 'sky') return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    if (tone === 'violet') return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    if (tone === 'rose') return 'border-rose-500/20 bg-rose-500/10 text-rose-50';
    return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
  },
};
