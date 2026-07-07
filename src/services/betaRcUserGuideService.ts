export type BetaRcUserGuideTone = 'safe' | 'warning' | 'info';

export interface BetaRcUserGuideCard {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: BetaRcUserGuideTone;
}

export interface BetaRcUserGuideStep {
  id: string;
  title: string;
  description: string;
  status: string;
  tone: BetaRcUserGuideTone;
}

export interface BetaRcUserGuideModel {
  title: string;
  description: string;
  cards: BetaRcUserGuideCard[];
  firstRunGuide: BetaRcUserGuideStep[];
  packagingGuide: string[];
  diagnosticsFoldPlan: string[];
  safetyBoundary: string[];
  nextSteps: string[];
}

export interface BetaRcUserGuideDiagnosticsModel extends BetaRcUserGuideModel {
  recommendedCommands: string[];
  rcNotes: string[];
}

const toneClassNames: Record<BetaRcUserGuideTone, string> = {
  safe: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
};

const cards: BetaRcUserGuideCard[] = [
  {
    id: 'rc-status',
    label: '当前状态',
    value: 'Beta 0.1 RC 使用说明收口',
    helper: 'MVP-68 不扩功能，只把如何使用、如何启动、如何理解诊断页写清楚。',
    tone: 'safe',
  },
  {
    id: 'user-flow',
    label: '首次使用',
    value: '选择目录 → 扫描并应用 → 播放',
    helper: '真实样本链路已通过：音频、歌词、图片、视频均可播放或打开。',
    tone: 'info',
  },
  {
    id: 'diagnostics-plan',
    label: '诊断页计划',
    value: '先保留，后折叠',
    helper: 'Beta 0.1 前保留技术保险箱；后续按日常检查、开发者详情、历史验证分组折叠。',
    tone: 'warning',
  },
];

const firstRunGuide: BetaRcUserGuideStep[] = [
  {
    id: 'open-app',
    title: '启动 Yang-Kura',
    status: '本机 GUI 路径已打通',
    description: '使用 Node 22 / npm 10 环境，开发模式执行 dev:electron；打包测试先跑 desktop:setup 与 strict smoke。',
    tone: 'safe',
  },
  {
    id: 'choose-library',
    title: '选择资源库目录',
    status: '主流程入口',
    description: '设置页选择音声库或音乐库目录。界面只显示目录名、记录状态和授权状态，不展示真实绝对路径。',
    tone: 'safe',
  },
  {
    id: 'scan-apply',
    title: '一键扫描并应用',
    status: '已通过真实样本',
    description: '首次使用或资源变化后，执行扫描并应用。流程会写入 / 备份 library-index.json，不删除、不移动、不重命名真实媒体文件。',
    tone: 'safe',
  },
  {
    id: 'listen-and-open',
    title: '听音频与打开外部文件',
    status: '已通过真实样本',
    description: '音频由内置播放器播放；歌词正常读取；图片和视频走系统外部打开。没有字幕时显示明确空状态。',
    tone: 'info',
  },
];

const packagingGuide = [
  '开发验证：npm ci --ignore-scripts → npm run verify:all → npm run build。',
  '桌面 GUI 验证：npm run desktop:setup → npm run desktop:smoke-check:strict → npm run dev:electron。',
  '如 3000 端口被旧进程占用，先关闭旧 Vite / Electron / Node 进程，或设置 YANG_KURA_VITE_DEV_URL 到空闲端口。',
  'Beta 0.1 RC 阶段先保留源码包交付；正式安装包可在下一阶段单独做打包版回归。',
];

const diagnosticsFoldPlan = [
  'Beta 0.1 前：诊断页继续保留完整内容，作为回归看板、技术保险箱和历史 verifier 锚点。',
  'Beta 0.1 后：默认展示日常检查、资源库状态、播放与字幕、本地安全边界。',
  '开发者详情：Electron / 打包回归 / 历史 MVP 验证 / legacy marker 后续折叠到高级区。',
  '不在 MVP-68 大删诊断内容，避免破坏历史 verifier 和近期黑视图修复成果。',
];

const safetyBoundary = [
  '不接 SQLite',
  '不接下载器',
  '不接 ASMR.one / DLsite / 网易云元数据抓取',
  '不接 mpv',
  '不删除 / 移动 / 重命名真实媒体文件',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不改真实扫描 / 写 index / 播放内核链路',
];

const nextSteps = [
  '若用户继续使用真实样本未发现阻塞，可进入 Beta 0.1 Release Candidate 整包确认。',
  '若发现具体真实缺陷，进入小修轮，只修复可复现问题，不新增大功能。',
  '诊断页瘦身应作为 Beta 0.1 后的低风险折叠任务，而不是当前大拆。',
];

export const betaRcUserGuideService = {
  getSettingsModel(): BetaRcUserGuideModel {
    return {
      title: 'MVP-68 Beta 0.1 RC 使用说明收口',
      description:
        '当前真实样本链路已经通过。本轮把首次使用、桌面验证、打包前检查、诊断页折叠计划写清楚，方便进入 Beta 0.1 RC。',
      cards,
      firstRunGuide,
      packagingGuide,
      diagnosticsFoldPlan,
      safetyBoundary,
      nextSteps,
    };
  },
  getDiagnosticsModel(): BetaRcUserGuideDiagnosticsModel {
    return {
      ...this.getSettingsModel(),
      recommendedCommands: [
        'node -v && npm -v',
        'npm ci --ignore-scripts',
        'npm run verify:all',
        'npm run build',
        'npm run desktop:setup',
        'npm run desktop:smoke-check:strict',
        'npm run dev:electron',
      ],
      rcNotes: [
        'MVP-68 不是新功能轮，而是 Beta 0.1 RC 使用说明 / 打包说明 / 诊断页折叠计划收口。',
        '真实链路已确认：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。',
        '诊断页内容多属于当前开发阶段正常现象，后续只做折叠分组，不在本轮大删。',
      ],
    };
  },
  getToneClassName(tone: BetaRcUserGuideTone) {
    return toneClassNames[tone];
  },
};

export type BetaRcUserGuideService = typeof betaRcUserGuideService;
