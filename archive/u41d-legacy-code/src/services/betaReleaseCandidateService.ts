export type BetaReleaseCandidateTone = 'safe' | 'warning' | 'info';

export interface BetaReleaseCandidateCard {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: BetaReleaseCandidateTone;
}

export interface BetaReleaseCandidateStep {
  id: string;
  title: string;
  status: string;
  description: string;
  tone: BetaReleaseCandidateTone;
}

export interface BetaReleaseCandidateModel {
  title: string;
  description: string;
  cards: BetaReleaseCandidateCard[];
  confirmedCapabilities: string[];
  releaseChecklist: BetaReleaseCandidateStep[];
  knownNonBlockingItems: string[];
  freezeBoundary: string[];
  nextSteps: string[];
}

export interface BetaReleaseCandidateDiagnosticsModel extends BetaReleaseCandidateModel {
  recommendedCommands: string[];
  rcDecisionNotes: string[];
}

const toneClassNames: Record<BetaReleaseCandidateTone, string> = {
  safe: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
};

const cards: BetaReleaseCandidateCard[] = [
  {
    id: 'candidate-status',
    label: '候选状态',
    value: 'Beta 0.1 Release Candidate',
    helper: '真实样本 GUI 链路已通过，当前重点是固定边界和准备 RC 包，而不是继续加功能。',
    tone: 'safe',
  },
  {
    id: 'real-chain',
    label: '真实链路',
    value: '扫描 / 播放 / 字幕 / 图片 / 视频通过',
    helper: '用户本机确认：选择音声库目录后一键扫描并应用，音频、歌词、图片、视频均可播放或打开。',
    tone: 'safe',
  },
  {
    id: 'scope-freeze',
    label: '功能冻结',
    value: '只修真实缺陷',
    helper: 'Beta 0.1 RC 前不进入 SQLite、下载器、mpv、元数据抓取和高级文件整理。',
    tone: 'warning',
  },
];

const confirmedCapabilities = [
  '选择音声库目录并完成一键扫描并应用',
  '写入 / 备份 library-index.json，并从 index 读取资源库记录',
  '音声库真实音频可播放',
  '歌词 / 字幕可读取，缺失时显示明确空状态',
  '图片 / 视频可走系统外部打开',
  '首页、音声库、音乐库、播放器、设置页、诊断页可连续切换',
  '诊断页黑视图与 undefined.map 已修复',
  'Electron desktop:setup 与 strict smoke 已能验证 Electron binary',
];

const releaseChecklist: BetaReleaseCandidateStep[] = [
  {
    id: 'source-validation',
    title: '源码验证',
    status: '已纳入 verify:all',
    description: 'Node 22 / npm 10 下执行 lint、build:electron、verify:all、build 和 high audit。',
    tone: 'safe',
  },
  {
    id: 'desktop-validation',
    title: '桌面启动',
    status: '已固定流程',
    description: 'desktop:setup → desktop:smoke-check:strict → dev:electron，用于本机 GUI 回归。',
    tone: 'safe',
  },
  {
    id: 'real-sample-validation',
    title: '真实样本',
    status: '用户已确认通过',
    description: '真实音声库样本已完成扫描、播放、歌词、图片、视频链路确认。',
    tone: 'safe',
  },
  {
    id: 'release-freeze',
    title: 'RC 冻结',
    status: '只修缺陷',
    description: 'MVP-69 后只修本机可复现问题，不继续扩展大功能。',
    tone: 'warning',
  },
];

const knownNonBlockingItems = [
  'Electron moderate advisory 仍存在，但 npm audit --audit-level=high 通过。',
  'Vite chunk size warning 仍存在，不影响当前 Beta 0.1 RC。',
  '诊断页内容仍然偏多，Beta 0.1 后按分组折叠，不在 RC 前大删。',
  '普通 desktop:smoke-check 在未运行 desktop:setup 前可能显示 Electron WARN，这是预期 advisory。',
];

const freezeBoundary = [
  '不接 SQLite',
  '不接下载器',
  '不接 ASMR.one / DLsite / 网易云元数据抓取',
  '不接 mpv 后端',
  '不删除 / 移动 / 重命名真实媒体文件',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不改真实扫描 / 写 index / 播放内核链路',
  '不做大组件一次性拆分',
];

const nextSteps = [
  '若用户继续确认无阻塞，可将当前包标记为 Beta 0.1 RC 可用包。',
  '若发现真实样本缺陷，进入小修轮，只修具体可复现问题。',
  'Beta 0.1 后再安排诊断页折叠、设置页精简和资源库体验增强。',
];

export const betaReleaseCandidateService = {
  getSettingsModel(): BetaReleaseCandidateModel {
    return {
      title: 'MVP-69 Beta 0.1 Release Candidate 整包确认',
      description:
        '真实样本 GUI 链路已经通过。本轮固定 Beta 0.1 RC 能力边界、已知非阻塞项和后续只修缺陷的推进方式。',
      cards,
      confirmedCapabilities,
      releaseChecklist,
      knownNonBlockingItems,
      freezeBoundary,
      nextSteps,
    };
  },
  getDiagnosticsModel(): BetaReleaseCandidateDiagnosticsModel {
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
      rcDecisionNotes: [
        'MVP-69 是 Beta 0.1 Release Candidate 整包确认轮，不扩展业务功能。',
        '真实样本链路已确认：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。',
        '后续若继续推进，应优先做 RC 缺陷修复或 Beta 0.1 发布说明，而不是进入下载器 / SQLite / mpv。',
      ],
    };
  },
  getToneClassName(tone: BetaReleaseCandidateTone) {
    return toneClassNames[tone];
  },
};

export type BetaReleaseCandidateService = typeof betaReleaseCandidateService;
