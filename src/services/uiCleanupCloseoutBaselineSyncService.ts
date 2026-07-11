export type Mvp111CloseoutTone = 'emerald' | 'sky' | 'amber' | 'violet';

export interface Mvp111CloseoutCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp111CloseoutTone;
}

export interface Mvp111BaselineItem {
  label: string;
  value: string;
  note: string;
}

export interface Mvp111UiCleanupCloseoutModel {
  version: '0.149.0-mvp111';
  title: string;
  summary: string;
  dailyConclusion: string;
  githubBaseline: Mvp111BaselineItem[];
  pendingLocalPackages: string[];
  closeoutCards: Mvp111CloseoutCard[];
  nextRecommendedStep: string;
  guardrails: string[];
}

const model: Mvp111UiCleanupCloseoutModel = {
  version: '0.149.0-mvp111',
  title: '界面日常化收口',
  summary:
    'MVP109 与 MVP110 已完成主界面去工程面板感；MVP111 做收口与 GitHub 基线同步说明。日常界面继续优先显示播放、资源库、导入、歌单和设置，维护信息保留在诊断页或折叠区。',
  dailyConclusion:
    '导入器已通过 MVP108 小样本验收；GitHub main 当前正式基线仍是 MVP108，MVP109～MVP111 属于待合入的 UI 日常化整理包。',
  githubBaseline: [
    {
      label: 'GitHub main',
      value: '0.146.0-mvp108 / 2e4a4aa',
      note: '导入器最终回归清单已合入并推送。',
    },
    {
      label: '当前整理包',
      value: '0.149.0-mvp111',
      note: '基于 MVP110，继续收口 UI 文案与交接状态。',
    },
    {
      label: '导入器状态',
      value: 'copy-only / move-only 小样本 PASS',
      note: '后续只在发现实际问题时做最小 bugfix。',
    },
  ],
  pendingLocalPackages: [
    'MVP109：主界面去 AI 工程面板感',
    'MVP110：全局 UI 日常化',
    'MVP111：UI cleanup closeout + GitHub baseline sync',
  ],
  closeoutCards: [
    {
      id: 'daily-ui-ready',
      title: '日常界面收口',
      description: '首页、设置、下载规划页和导入器主页面继续面向普通使用，不再把阶段号和内部合同放在显眼位置。',
      tone: 'emerald',
    },
    {
      id: 'github-baseline-known',
      title: 'GitHub 基线明确',
      description: '正式仓库当前停在 MVP108；MVP109～MVP111 是待合入的 UI 清理序列，合入时只需命令验收。',
      tone: 'sky',
    },
    {
      id: 'maintenance-preserved',
      title: '维护信息保留',
      description: '历史 verifier、MVP 锚点、技术边界和 AI 接手线索继续保留，但默认进入维护区。',
      tone: 'amber',
    },
    {
      id: 'metadata-next',
      title: '下一阶段准备',
      description: 'UI 收口后，建议进入本地元数据编辑层 Metadata Override；先本地编辑，不联网抓取。',
      tone: 'violet',
    },
  ],
  nextRecommendedStep: 'Metadata Override / 本地元数据编辑层。先做作品标题、RJ号、社团、声优、标签、封面、备注、评分等本地覆盖，不接真实 Provider。',
  guardrails: [
    '不修改 copy-only / move-only 执行器。',
    '不修改 scanner、library-index 写入、读取、播放、字幕和外部打开链路。',
    '不接 SQLite、真实下载器、联网元数据 Provider、mpv。',
    '不删除、移动、重命名真实媒体文件。',
    '不向日常主界面展示 absolutePath 或 file://。',
  ],
};

export const uiCleanupCloseoutBaselineSyncService = {
  getModel(): Mvp111UiCleanupCloseoutModel {
    return model;
  },
  getToneClassName(tone: Mvp111CloseoutTone): string {
    if (tone === 'emerald') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    if (tone === 'sky') return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    if (tone === 'violet') return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
  },
};
