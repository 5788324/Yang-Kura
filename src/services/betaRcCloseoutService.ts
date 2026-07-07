export type BetaRcCloseoutTone = 'safe' | 'warning' | 'info';

export interface BetaRcCloseoutChip {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: BetaRcCloseoutTone;
}

export interface BetaRcCloseoutStep {
  id: string;
  title: string;
  status: string;
  description: string;
  tone: BetaRcCloseoutTone;
}

export interface BetaRcCloseoutModel {
  title: string;
  description: string;
  chips: BetaRcCloseoutChip[];
  confirmedFlow: BetaRcCloseoutStep[];
  rcChecks: string[];
  knownNotes: string[];
}

export interface BetaRcCloseoutDiagnosticsModel extends BetaRcCloseoutModel {
  recommendedCommands: string[];
  safetyBoundary: string[];
  nextSteps: string[];
}

const toneClassNames: Record<BetaRcCloseoutTone, string> = {
  safe: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
};

const chips: BetaRcCloseoutChip[] = [
  {
    id: 'real-asmr-pass',
    label: '真实样本链路',
    value: '音声库已通过',
    helper: '用户本机确认：选择音声库目录后，一键扫描并应用，音频、歌词、图片、视频均可播放或打开。',
    tone: 'safe',
  },
  {
    id: 'rc-state',
    label: '候选状态',
    value: 'Beta 0.1 GUI PASS 候选',
    helper: 'MVP-67 固化当前通过结果，进入 RC 收口，不继续扩大功能范围。',
    tone: 'info',
  },
  {
    id: 'remaining-risk',
    label: '剩余风险',
    value: '只记录真实缺陷',
    helper: '音乐库大样本、更多字幕格式、打包安装包可作为后续复测项，不在本轮扩功能。',
    tone: 'warning',
  },
];

const confirmedFlow: BetaRcCloseoutStep[] = [
  {
    id: 'select-asmr-directory',
    title: '选择音声库目录',
    status: '用户本机通过',
    description: '通过真实目录选择器选择音声库目录，Renderer 只显示目录名和授权状态，不暴露真实绝对路径。',
    tone: 'safe',
  },
  {
    id: 'scan-and-apply',
    title: '一键扫描并应用',
    status: '用户本机通过',
    description: '完成 dry-run / 写入或备份 library-index.json / 读取 index 的本地资源库闭环。',
    tone: 'safe',
  },
  {
    id: 'play-audio',
    title: '音频播放',
    status: '用户本机通过',
    description: '音频可播放，底部播放器和播放页可继续使用。',
    tone: 'safe',
  },
  {
    id: 'lyrics-image-video',
    title: '歌词 / 图片 / 视频',
    status: '用户本机通过',
    description: '歌词可读取，图片和视频可走外部打开，不删除、不移动、不重命名真实媒体文件。',
    tone: 'safe',
  },
];

const rcChecks = [
  '诊断页已从黑视图修复到可正常打开，不再触发 mvp64-diagnostics-runtime-fallback。',
  '真实音声库样本链路已通过：目录选择、扫描并应用、播放、歌词、图片、视频。',
  '主界面继续不显示真实盘符路径或 file://。',
  '设置页 / 诊断页继续记录本地安全边界和后置功能。',
  'Beta 0.1 RC 阶段只修真实回归缺陷，不继续扩大功能面。',
];

const knownNotes = [
  '音乐库如需更严格确认，可用 1～2 个音乐文件再做补充 GUI 复测。',
  'Vite chunk size warning 和 Electron moderate advisory 仍是已知非阻塞项。',
  '诊断页内容偏多是开发阶段正常现象，Beta 0.1 后再做折叠瘦身。',
];

export const betaRcCloseoutService = {
  getSettingsModel(): BetaRcCloseoutModel {
    return {
      title: 'MVP-67 Beta 0.1 RC 收口',
      description:
        '真实音声库样本链路已经在用户本机通过。本轮把通过结果、RC 边界和后续缺陷入口固化下来，准备进入 Beta 0.1 Release Candidate。',
      chips,
      confirmedFlow,
      rcChecks,
      knownNotes,
    };
  },
  getDiagnosticsModel(): BetaRcCloseoutDiagnosticsModel {
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
      safetyBoundary: [
        '不接 SQLite',
        '不接下载器',
        '不接 ASMR.one / DLsite / 网易云元数据抓取',
        '不接 mpv',
        '不删除 / 移动 / 重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
        '不改真实扫描 / 写 index / 播放内核链路',
      ],
      nextSteps: [
        '若用户继续确认音乐库样本通过，可将 Beta 0.1 GUI PASS 候选推进为 Beta 0.1 RC。',
        '若真实样本发现缺陷，只记录具体复现路径并进入下一轮小修，不新增大功能。',
        'Beta 0.1 RC 后再考虑诊断页折叠瘦身和使用说明收口。',
      ],
    };
  },
  getToneClassName(tone: BetaRcCloseoutTone) {
    return toneClassNames[tone];
  },
};

export type BetaRcCloseoutService = typeof betaRcCloseoutService;
