import { copyOnlyPreflightRealCheckService, type Mvp94PreflightResultPreview } from './copyOnlyPreflightRealCheckService';

export type Mvp95CopyExecutorTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp95CopyExecutorCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp95CopyExecutorTone;
}

export interface Mvp95CopyExecutorContractRule {
  id: string;
  title: string;
  detail: string;
  enforced: boolean;
}

export interface Mvp95CopyExecutorRequestPreview {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'copy-only-stub';
  confirmedCopyOnly: true;
  confirmationText: 'COPY ONLY';
  relativePaths: string[];
  targetRelativePaths: string[];
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp95CopyExecutorCopiedFilePreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  sizeBytes: number;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp95CopyExecutorSkipPreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp95CopyExecutorFailurePreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: string;
  message: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp95CopyExecutorResultPreview {
  ok: boolean;
  status: 'mvp95-copy-only-execute-complete';
  operationPlanId: string;
  executeAllowed: true;
  copyAllowed: true;
  overwriteAllowed: false;
  moveAllowed: false;
  deleteAllowed: false;
  renameAllowed: false;
  operationLogPersisted: false;
  libraryIndexWritten: false;
  copiedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  copiedFiles: Mvp95CopyExecutorCopiedFilePreview[];
  skippedList: Mvp95CopyExecutorSkipPreview[];
  failureList: Mvp95CopyExecutorFailurePreview[];
  operationLogPreview: {
    mode: 'copy-only';
    persisted: false;
    absolutePathReturned: false;
    fileUrlReturned: false;
  };
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp95CopyExecutorModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp95CopyExecutorCard[];
  requestPreview: Mvp95CopyExecutorRequestPreview;
  preflightBaseline: Mvp94PreflightResultPreview;
  resultPreview: Mvp95CopyExecutorResultPreview;
  executorRules: Mvp95CopyExecutorContractRule[];
  codexGate: {
    sendToCodexNow: true;
    reason: string;
    requiredAfterBuild: string;
  };
  guardedBoundaries: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp95CopyExecutorTone): string {
  const classes: Record<Mvp95CopyExecutorTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp95CopyExecutorModel {
  const preflight = copyOnlyPreflightRealCheckService.getModel().sampleResult;
  return {
    version: '0.133.0-mvp95',
    title: 'MVP-95 真实 copy-only executor',
    summary: '在 Electron main 侧启用第一版真实 copy-only 执行器：必须二次确认，只复制，不覆盖，不移动，不删除，不写 library-index.json。',
    baseline: '0.132.0-mvp94',
    cards: [
      { id: 'real-copy', title: '真实 copy', detail: 'execute handler 可在 main 侧执行受控 copy-only。', tone: 'emerald' },
      { id: 'confirm-gate', title: '二次确认', detail: '必须 confirmedCopyOnly=true 且 confirmationText=COPY ONLY。', tone: 'amber' },
      { id: 'no-overwrite', title: '不覆盖', detail: '使用 COPYFILE_EXCL；目标存在直接 skip。', tone: 'sky' },
      { id: 'relative-log', title: '相对路径日志', detail: '仅返回 copied / skipped / failure 的相对路径。', tone: 'violet' },
      { id: 'no-index', title: '不入库', detail: '不写 OperationLog 文件，不写 library-index.json。', tone: 'rose' },
    ],
    requestPreview: {
      operationPlanId: 'mvp95-copy-only-executor-operation-plan',
      rootPathToken: 'source-root-token-mvp95-sample',
      targetRootPathToken: 'target-root-token-mvp95-sample',
      mode: 'copy-only-stub',
      confirmedCopyOnly: true,
      confirmationText: 'COPY ONLY',
      relativePaths: ['RJ01588893/01_本編.mp3', 'RJ01588893/cover.jpg', 'RJ01588893/01_本編.zh.lrc'],
      targetRelativePaths: ['ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3', 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg', 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc'],
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    preflightBaseline: preflight,
    resultPreview: {
      ok: true,
      status: 'mvp95-copy-only-execute-complete',
      operationPlanId: 'mvp95-copy-only-executor-operation-plan',
      executeAllowed: true,
      copyAllowed: true,
      overwriteAllowed: false,
      moveAllowed: false,
      deleteAllowed: false,
      renameAllowed: false,
      operationLogPersisted: false,
      libraryIndexWritten: false,
      copiedCount: 2,
      skippedCount: 1,
      failedCount: 0,
      createdDirectoryCount: 1,
      copiedFiles: [
        { id: 'track-01', sourceRelativePath: 'RJ01588893/01_本編.mp3', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3', sizeBytes: 73400320, absolutePathReturned: false, fileUrlReturned: false },
        { id: 'lyric', sourceRelativePath: 'RJ01588893/01_本編.zh.lrc', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc', sizeBytes: 4096, absolutePathReturned: false, fileUrlReturned: false },
      ],
      skippedList: [
        { id: 'cover', sourceRelativePath: 'RJ01588893/cover.jpg', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg', reasonCode: 'target-exists-overwrite-disabled', absolutePathReturned: false, fileUrlReturned: false },
      ],
      failureList: [],
      operationLogPreview: { mode: 'copy-only', persisted: false, absolutePathReturned: false, fileUrlReturned: false },
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    executorRules: [
      { id: 'token-root', title: '目标必须在 token root 下', detail: '源/目标都通过 rootPathToken + relativePath 解析，越界路径直接失败。', enforced: true },
      { id: 'confirmation', title: '必须二次确认', detail: '无确认字段时返回 mvp95-copy-only-execute-confirmation-required。', enforced: true },
      { id: 'copyfile-excl', title: '禁止覆盖', detail: '目标存在 skip；copy 阶段也使用 COPYFILE_EXCL 防竞态覆盖。', enforced: true },
      { id: 'mkdir-parent-only', title: '仅创建父目录', detail: '只在 targetRootPathToken 内创建目标父目录，记录 createdDirectoryRelativePaths。', enforced: true },
      { id: 'no-source-mutation', title: '源文件零变更', detail: '不 move、不 delete、不 rename 源文件。', enforced: true },
      { id: 'no-index-write', title: '不写入库文件', detail: 'operationLogPreview 不落盘，library-index.json 不写。', enforced: true },
    ],
    codexGate: {
      sendToCodexNow: true,
      reason: 'MVP95 首次启用真实 copy/mkdir，需要 Codex 用本机最小样本执行验收。',
      requiredAfterBuild: '把源码包交给 Codex 跑静态扫描、真实样本 copy-only、未提交产物检查。',
    },
    guardedBoundaries: [
      'MVP95 只允许 copy，不允许 move/delete/rename。',
      'overwriteAllowed 固定 false。',
      '不写 OperationLog 文件，只返回 operationLogPreview。',
      '不写 library-index.json，不触发扫描入库。',
      'Renderer 不接收 absolutePath 或 file://。',
      '下一轮进入导入后刷新前，必须先看 Codex 本机样本结果。',
    ],
    nextSteps: ['Codex MVP95 本机真实样本验收', 'MVP96 copy-only operation log 落盘设计', 'MVP97 copy 后扫描/入库刷新仍需另行 gate'],
  };
}

export const copyOnlyExecutorService = {
  getModel,
  getToneClassName,
};
