export type BetaCandidateTone = 'brand' | 'green' | 'amber' | 'sky' | 'muted';

export interface BetaCandidateChip {
  id: string;
  label: string;
  value: string;
  tone: BetaCandidateTone;
  helper?: string;
}

export interface BetaCandidateChecklistItem {
  id: string;
  title: string;
  description: string;
  status: string;
  tone: BetaCandidateTone;
}

export interface BetaCandidateAboutModel {
  title: string;
  description: string;
  chips: BetaCandidateChip[];
  useFlow: BetaCandidateChecklistItem[];
  boundaryNotes: string[];
  deferred: string[];
}

export interface BetaCandidateDiagnosticsModel {
  title: string;
  description: string;
  summary: BetaCandidateChip[];
  candidateChecklist: BetaCandidateChecklistItem[];
  releaseBoundary: string[];
  deferred: string[];
  nextOptions: string[];
}

const boundaryNotes = [
  '界面不显示真实绝对路径，Renderer 只使用资源库令牌和相对记录。',
  '不会删除、移动、重命名真实媒体文件。',
  'SQLite、下载器、元数据抓取和 mpv 仍属于后置阶段。',
  '当前候选包适合本机人工回归，不等同于商业发布版。',
];

const deferred = ['SQLite', '下载器', 'ASMR.one / DLsite / 网易云元数据抓取', 'mpv 后端', '高级文件整理', '批量重命名', '大组件一次性拆分'];

const useFlow: BetaCandidateChecklistItem[] = [
  {
    id: 'start',
    title: '启动应用',
    description: '确认打包版或开发版可以正常进入首页，不出现黑屏。',
    status: '人工确认',
    tone: 'green',
  },
  {
    id: 'library',
    title: '读取资源库',
    description: '选择本地目录，读取已有 library-index.json，或按设置页流程重新生成记录。',
    status: '主流程',
    tone: 'brand',
  },
  {
    id: 'listen',
    title: '回到播放器',
    description: '从首页、音声库或音乐库选择音轨，确认播放、字幕、队列和继续听入口。',
    status: '日常使用',
    tone: 'sky',
  },
  {
    id: 'external-open',
    title: '外部打开',
    description: '视频、图片和文件夹仍走系统外部打开，不在主界面做复杂文件管理。',
    status: '可验证',
    tone: 'amber',
  },
];

export const betaCandidateCloseoutService = {
  getToneClassName(tone: BetaCandidateTone): string {
    if (tone === 'brand') return 'bg-brand-color/15 text-brand-color border-brand-color/30';
    if (tone === 'green') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    if (tone === 'amber') return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    if (tone === 'sky') return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    return 'bg-white/5 text-zinc-400 border-white/10';
  },

  getAboutModel(): BetaCandidateAboutModel {
    return {
      title: 'Beta 0.1 候选包',
      description: '当前包可作为个人本地媒体库的阶段候选包：适合本机继续测试、听音频和回归检查，不扩展商业发布、下载器或数据库能力。',
      chips: [
        { id: 'version', label: '阶段', value: 'Beta 0.1 候选', tone: 'brand', helper: 'MVP-60 收口' },
        { id: 'data', label: '数据层', value: 'Local JSON Index', tone: 'green', helper: 'SQLite 后置' },
        { id: 'ui', label: '界面', value: '中文媒体库', tone: 'sky', helper: '主界面媒体优先' },
      ],
      useFlow,
      boundaryNotes,
      deferred,
    };
  },

  getDiagnosticsModel(): BetaCandidateDiagnosticsModel {
    return {
      title: 'MVP-60 Beta 0.1 候选包最终整理',
      description: '本轮整理当前能力边界、候选包人工回归清单和后续路线，不新增真实后端能力，不改变任何扫描、索引、播放、字幕或打包链路。',
      summary: [
        { id: 'candidate', label: '候选包', value: '已整理', tone: 'brand' },
        { id: 'baseline', label: 'Beta 0.1', value: '已固定', tone: 'green' },
        { id: 'handoff', label: '交接文档', value: '长期版', tone: 'sky' },
        { id: 'risk', label: '真实链路', value: '未改动', tone: 'muted' },
      ],
      candidateChecklist: useFlow,
      releaseBoundary: boundaryNotes,
      deferred,
      nextOptions: [
        '本机打包版人工回归后修复具体缺陷',
        '首页 / 播放器 / 资源库继续小范围 UI 收口',
        '暂停开发并进入个人试用观察期',
      ],
    };
  },
};
