export type BetaGuiRegressionTone = 'safe' | 'warning' | 'info';

export interface BetaGuiRegressionChip {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: BetaGuiRegressionTone;
}

export interface BetaGuiRegressionStep {
  id: string;
  title: string;
  status: string;
  description: string;
  tone: BetaGuiRegressionTone;
}

export interface BetaGuiRegressionSettingsModel {
  title: string;
  description: string;
  chips: BetaGuiRegressionChip[];
  localFlow: BetaGuiRegressionStep[];
  sampleChecklist: string[];
  passCriteria: string[];
}

export interface BetaGuiRegressionDiagnosticsModel extends BetaGuiRegressionSettingsModel {
  commands: string[];
  safetyBoundary: string[];
  nextIfFailed: string[];
}

const toneClassNames: Record<BetaGuiRegressionTone, string> = {
  safe: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
};

const chips: BetaGuiRegressionChip[] = [
  {
    id: 'gui-chain',
    label: 'GUI 链路',
    value: '全页切换复测',
    helper: '首页、音声库、音乐库、详情页、播放器、设置页、诊断页连续切换。',
    tone: 'safe',
  },
  {
    id: 'real-sample',
    label: '真实小样本',
    value: '本地资源库闭环',
    helper: '用少量真实音频验证扫描、写入 index、读取 index、播放和字幕。',
    tone: 'warning',
  },
  {
    id: 'candidate-state',
    label: '候选状态',
    value: 'Beta 0.1 GUI PASS 待确认',
    helper: '本轮只固化确认清单，发现问题进入 MVP-67 修复。',
    tone: 'info',
  },
];

const localFlow: BetaGuiRegressionStep[] = [
  {
    id: 'startup',
    title: '启动应用',
    status: '必须通过',
    description: 'Node 22 / npm 10 下完成 verify:all、build、desktop:setup、strict smoke，再运行 dev:electron。',
    tone: 'safe',
  },
  {
    id: 'navigation',
    title: '页面连续切换',
    status: '必须通过',
    description: '首页、音声库、音乐库、播放器、歌单、设置页、诊断页可来回切换，不白屏、不黑视图。',
    tone: 'safe',
  },
  {
    id: 'library-flow',
    title: '资源库闭环',
    status: '真实样本验证',
    description: '选择小样本目录，dry-run scan，写入 / 读取 library-index.json，并在音声库 / 音乐库展示。',
    tone: 'warning',
  },
  {
    id: 'playback-flow',
    title: '播放与字幕',
    status: '真实样本验证',
    description: '本地音频可播放，进度可保存，LRC / SRT / VTT / ASS 字幕可读取或显示明确空状态。',
    tone: 'warning',
  },
  {
    id: 'external-open',
    title: '外部打开',
    status: '安全验证',
    description: '视频、图片、文件夹走外部打开，不提供删除 / 移动 / 重命名真实媒体文件入口。',
    tone: 'safe',
  },
];

// 真实样本清单
const sampleChecklist = [
  '准备 1 个小型 ASMR / 音声样本目录，包含 1～3 个音频和可选字幕。',
  '准备 1 个小型音乐样本目录，包含 1～2 个音频和可选歌词。',
  '确认目录中可以有图片 / 视频 / 文本，但不要使用大规模真实库做首次回归。',
  '先 dry-run scan，再确认写入 / 备份 library-index.json，最后读取 index。',
  '播放至少 1 条音声音轨和 1 条音乐音轨，确认底部播放器和播放页状态正常。',
];

const passCriteria = [
  '诊断页不再出现黑视图，也不进入 mvp64-diagnostics-runtime-fallback。',
  '主界面不直接显示 C:/、D:/、G:/ 盘符路径或 file://。',
  'Renderer 仍不接收 absolutePath，真实路径只留在 Electron main 侧。',
  '没有删除 / 移动 / 重命名真实媒体文件入口。',
  '发现真实 GUI 问题时，记录到 MVP-67，不在 MVP-66 扩功能。',
];

export const betaGuiRegressionService = {
  getSettingsModel(): BetaGuiRegressionSettingsModel {
    return {
      title: 'MVP-66 Beta 0.1 GUI 全链路回归确认',
      description:
        '本轮用于把 Beta 0.1 候选包的真实 GUI 回归路径固定下来：先确认窗口、页面、诊断页、资源库、播放、字幕、外部打开和安全边界，再决定是否进入 MVP-67 缺陷修复。',
      chips,
      localFlow,
      sampleChecklist,
      passCriteria,
    };
  },
  getDiagnosticsModel(): BetaGuiRegressionDiagnosticsModel {
    return {
      ...this.getSettingsModel(),
      commands: [
        'node -v && npm -v',
        'npm ci --ignore-scripts',
        'npm run verify:all',
        'npm run build',
        'npm run desktop:setup',
        'npm run desktop:smoke-check:strict',
        'npm run dev:electron',
      ],
      safetyBoundary: [
        '不接 SQLite',
        '不接下载器',
        '不接 ASMR.one / DLsite / 网易云元数据抓取',
        '不接 mpv',
        '不删除 / 移动 / 重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
        '不改真实扫描 / 写 index / 播放内核链路',
      ],
      nextIfFailed: [
        'GUI 回归失败：记录具体页面、错误摘要、复现步骤，进入 MVP-67 修复。',
        '诊断页失败：优先抓 DevTools console / fallback 错误摘要，不做整页大拆。',
        '真实样本失败：保留样本结构说明，只修对应 adapter / UI 兜底。',
      ],
    };
  },
  getToneClassName(tone: BetaGuiRegressionTone) {
    return toneClassNames[tone];
  },
};

export type BetaGuiRegressionService = typeof betaGuiRegressionService;
