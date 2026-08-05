export type BetaFinalHandoffTone = 'safe' | 'warning' | 'info';

export interface BetaFinalHandoffCard {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: BetaFinalHandoffTone;
}

export interface BetaFinalHandoffStep {
  id: string;
  title: string;
  description: string;
  status: string;
  tone: BetaFinalHandoffTone;
}

export interface BetaFinalHandoffModel {
  title: string;
  description: string;
  cards: BetaFinalHandoffCard[];
  finalPackageChecklist: BetaFinalHandoffStep[];
  userConfirmedFlow: string[];
  codexLightCheck: string[];
  handoffRules: string[];
  frozenBoundaries: string[];
  nextRoute: string[];
  nonBlockingNotes: string[];
}

export interface BetaFinalHandoffDiagnosticsModel extends BetaFinalHandoffModel {
  recommendedCommands: string[];
  releaseDecision: string[];
}

const toneClassNames: Record<BetaFinalHandoffTone, string> = {
  safe: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
};

const cards: BetaFinalHandoffCard[] = [
  {
    id: 'final-status',
    label: '最终状态',
    value: 'Beta 0.1 RC 可交付包',
    helper: 'MVP-70 固定发布说明、交接边界和后续维护路线，不再扩大功能范围。',
    tone: 'safe',
  },
  {
    id: 'confirmed-flow',
    label: '真实链路',
    value: '扫描 / 播放 / 歌词 / 图片 / 视频通过',
    helper: '用户已在本机确认真实音声库目录一键扫描并应用后，音频、歌词、图片、视频均可播放或打开。',
    tone: 'safe',
  },
  {
    id: 'handoff-ready',
    label: '交接策略',
    value: '可暂停 / 可后续维护 / 可继续小修',
    helper: '后续优先记录真实缺陷并小修；不要直接进入 SQLite、下载器、mpv 或元数据抓取。',
    tone: 'warning',
  },
];

const finalPackageChecklist: BetaFinalHandoffStep[] = [
  {
    id: 'version-fixed',
    title: '版本固定',
    status: '已固定到 MVP-70',
    description: '当前包作为 Beta 0.1 RC 最终交接说明轮，保留 MVP-69 的 RC 能力边界。',
    tone: 'safe',
  },
  {
    id: 'source-validation',
    title: '源码验证',
    status: '保留标准命令',
    description: 'Node 22 / npm 10 下继续使用 verify:all、build、high audit 作为源码基线。',
    tone: 'safe',
  },
  {
    id: 'gui-validation',
    title: 'GUI 验证',
    status: '用户已确认主链路通过',
    description: '后续无需每轮重复大测；发现真实问题再进入小修轮。',
    tone: 'safe',
  },
  {
    id: 'scope-freeze',
    title: '功能冻结',
    status: '继续冻结',
    description: 'Beta 0.1 RC 不再接入大功能，只修可复现缺陷和少量说明问题。',
    tone: 'warning',
  },
];

const userConfirmedFlow = [
  '选择音声库目录',
  '点击一键扫描并应用',
  '音频可以播放',
  '歌词可以读取',
  '图片可以打开',
  '视频可以打开',
  '诊断页黑视图与 undefined.map 已修复',
];

const codexLightCheck = [
  'node -v / npm -v 确认 Node 22 / npm 10',
  'npm ci --ignore-scripts',
  'npm run verify:all',
  'npm run build',
  'npm run desktop:setup',
  'npm run desktop:smoke-check:strict',
  '必要时 npm run dev:electron 做轻量窗口确认',
];

const handoffRules = [
  '新对话或 Codex 接手时先读 README / PROJECT_STATE / NEXT_CHAT_HANDOFF / RUN_ME_FIRST。',
  '先确认当前状态是 Beta 0.1 RC 可交付包，不要默认继续加功能。',
  '真实缺陷必须有复现路径，再进入小修轮。',
  '诊断页内容偏多属于开发阶段正常状态，Beta 0.1 后再分组折叠。',
  '不要删除历史 verifier marker，必要时只做隐藏或折叠。',
];

const frozenBoundaries = [
  '不接 SQLite',
  '不接下载器',
  '不接 ASMR.one / DLsite / 网易云元数据抓取',
  '不接 mpv 后端',
  '不删除 / 移动 / 重命名真实媒体文件',
  '不向 Renderer 暴露 absolutePath 或 file://',
  '不改真实扫描 / 写 index / 播放内核链路',
  '不做大组件一次性拆分',
];

const nextRoute = [
  '如无阻塞，可暂停开发，把当前包作为 Beta 0.1 RC 使用。',
  '如发现真实样本缺陷，进入 MVP-71 小修轮，只修具体问题。',
  'Beta 0.1 后优先安排诊断页折叠、设置页精简、资源库体验增强。',
];

const nonBlockingNotes = [
  'Electron moderate advisory 仍存在，但 npm audit --audit-level=high 通过。',
  'Vite chunk size warning 仍存在，不阻塞当前 RC。',
  '普通 desktop:smoke-check 在未运行 desktop:setup 前可能显示 Electron WARN，这是 advisory。',
  '诊断页内容仍偏多，后续应折叠分组而不是立即大删。',
];

export const betaFinalHandoffService = {
  getSettingsModel(): BetaFinalHandoffModel {
    return {
      title: 'MVP-70 Beta 0.1 最终交接包',
      description:
        '当前包用于固定 Beta 0.1 RC 的交付说明、接手规则、轻量验证命令和后续维护路线。它不是新功能轮。',
      cards,
      finalPackageChecklist,
      userConfirmedFlow,
      codexLightCheck,
      handoffRules,
      frozenBoundaries,
      nextRoute,
      nonBlockingNotes,
    };
  },
  getDiagnosticsModel(): BetaFinalHandoffDiagnosticsModel {
    return {
      ...this.getSettingsModel(),
      recommendedCommands: codexLightCheck,
      releaseDecision: [
        'MVP-70 可作为 Beta 0.1 RC 最终交接包。',
        '用户本机真实链路已确认：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。',
        '后续若继续开发，优先进入真实缺陷小修或 Beta 0.1 后体验增强，不直接进入大功能。',
      ],
    };
  },
  getToneClassName(tone: BetaFinalHandoffTone) {
    return toneClassNames[tone];
  },
};

export type BetaFinalHandoffService = typeof betaFinalHandoffService;
