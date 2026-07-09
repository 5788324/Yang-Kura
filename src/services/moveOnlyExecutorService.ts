import { moveOnlyExecutionReadinessService, type ImportMoveExecutionReadinessResult } from './moveOnlyExecutionReadinessService';

export type Mvp105MoveExecutorTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp105MoveExecutorCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp105MoveExecutorTone;
}

export interface ImportMoveOnlyExecutorRequestPreview {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'move-only-small-sample';
  confirmedMoveOnly: true;
  confirmationText: 'CONFIRM_MOVE_IMPORT';
  overwriteAllowed: false;
  maxMoveItems: 20;
  relativePaths: string[];
  targetRelativePaths: string[];
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface ImportMoveOnlyExecutorMovedFilePreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  sizeBytes: number;
  moveMethod: 'rename' | 'copy-verify-unlink';
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface ImportMoveOnlyExecutorSkipPreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: 'target-exists-overwrite-disabled' | 'source-not-file' | 'blocked-by-preflight' | 'remaining-after-failure-stop';
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface ImportMoveOnlyExecutorFailurePreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: string;
  message: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface ImportMoveOnlyExecutorResultPreview {
  ok: boolean;
  status: 'mvp105-move-only-execute-complete-with-operation-log';
  executorVersion: 'mvp105-small-sample-move-only-executor-v1';
  operationPlanId: string;
  executeAllowed: true;
  moveAllowed: true;
  copyAllowed: false;
  overwriteAllowed: false;
  deleteAllowed: false;
  renameAllowed: true;
  sourceDirectoryCleanupAllowed: false;
  operationLogPersisted: true;
  libraryIndexWritten: false;
  scannerRunTriggered: false;
  sqliteWritten: false;
  movedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  failureStopTriggered: boolean;
  movedFiles: ImportMoveOnlyExecutorMovedFilePreview[];
  skippedList: ImportMoveOnlyExecutorSkipPreview[];
  failureList: ImportMoveOnlyExecutorFailurePreview[];
  operationLogPreview: {
    mode: 'move-only';
    persisted: true;
    absolutePathReturned: false;
    fileUrlReturned: false;
  };
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp105SmallSampleMoveOnlyExecutorModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp105MoveExecutorCard[];
  readinessBaseline: ImportMoveExecutionReadinessResult;
  requestPreview: ImportMoveOnlyExecutorRequestPreview;
  resultPreview: ImportMoveOnlyExecutorResultPreview;
  executorRules: string[];
  failureStopPolicy: string[];
  operationLogPolicy: string[];
  uiPolicy: string[];
  codexPolicy: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp105MoveExecutorTone): string {
  const classes: Record<Mvp105MoveExecutorTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp105SmallSampleMoveOnlyExecutorModel {
  const readiness = moveOnlyExecutionReadinessService.getModel().sampleResults[0];
  return {
    version: '0.143.0-mvp105',
    title: 'MVP-105 小样本真实 move-only executor',
    summary: '在 Electron main 侧启用第一版小样本真实 move-only 执行器：必须 CONFIRM_MOVE_IMPORT，overwrite=false，目标冲突跳过，失败停止，写入相对路径 OperationLog，不清理空源目录，不写 index。',
    baseline: '0.142.0-mvp104',
    cards: [
      { id: 'small-sample', title: '小样本真实 move', detail: '最多 20 个文件，专用于受控样本验证。', tone: 'emerald' },
      { id: 'confirm', title: '二次确认', detail: 'confirmedMoveOnly=true 且 confirmationText=CONFIRM_MOVE_IMPORT。', tone: 'amber' },
      { id: 'no-overwrite', title: '禁止覆盖', detail: '目标存在直接 skip；不覆盖、不合并。', tone: 'sky' },
      { id: 'failure-stop', title: '失败停止', detail: '第一个失败后停止后续 move，避免半自动扩散。', tone: 'rose' },
      { id: 'operation-log', title: 'OperationLog', detail: '追加写入 JSONL，只记录相对路径和状态。', tone: 'violet' },
    ],
    readinessBaseline: readiness,
    requestPreview: {
      operationPlanId: 'mvp105-move-only-small-sample-operation-plan',
      rootPathToken: 'source-root-token-mvp105-sample',
      targetRootPathToken: 'target-root-token-mvp105-sample',
      mode: 'move-only-small-sample',
      confirmedMoveOnly: true,
      confirmationText: 'CONFIRM_MOVE_IMPORT',
      overwriteAllowed: false,
      maxMoveItems: 20,
      relativePaths: ['staging/RJ01588893/01_本編.mp3', 'staging/RJ01588893/cover.jpg'],
      targetRelativePaths: ['ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3', 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg'],
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    resultPreview: {
      ok: true,
      status: 'mvp105-move-only-execute-complete-with-operation-log',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: 'mvp105-move-only-small-sample-operation-plan',
      executeAllowed: true,
      moveAllowed: true,
      copyAllowed: false,
      overwriteAllowed: false,
      deleteAllowed: false,
      renameAllowed: true,
      sourceDirectoryCleanupAllowed: false,
      operationLogPersisted: true,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      movedCount: 1,
      skippedCount: 1,
      failedCount: 0,
      createdDirectoryCount: 1,
      failureStopTriggered: false,
      movedFiles: [
        { id: 'mvp105-move-1', sourceRelativePath: 'staging/RJ01588893/01_本編.mp3', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3', sizeBytes: 73400320, moveMethod: 'rename', absolutePathReturned: false, fileUrlReturned: false },
      ],
      skippedList: [
        { id: 'mvp105-move-2', sourceRelativePath: 'staging/RJ01588893/cover.jpg', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg', reasonCode: 'target-exists-overwrite-disabled', absolutePathReturned: false, fileUrlReturned: false },
      ],
      failureList: [],
      operationLogPreview: { mode: 'move-only', persisted: true, absolutePathReturned: false, fileUrlReturned: false },
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    executorRules: [
      '只接受 mode=move-only-small-sample。',
      '最多 20 个文件；超出直接返回 mvp105-move-only-execute-too-many-files。',
      '必须 confirmedMoveOnly=true 和 CONFIRM_MOVE_IMPORT。',
      '源/目标都通过 rootPathToken + relativePath 解析，Renderer 不接收 absolutePath/file://。',
      '目标存在时 skip，不覆盖。',
      '跨盘 rename 失败 EXDEV 时才使用 copy + verify + unlink，且 unlink 只针对已校验复制成功的源文件。',
      '不自动清理空源目录，不删除目录，不写 library-index.json。',
    ],
    failureStopPolicy: [
      '第一个失败后停止后续 move。',
      '停止后的未处理项写入 skippedList，reasonCode=remaining-after-failure-stop。',
      'OperationLog 仍落盘，方便 AI 和用户回看。',
    ],
    operationLogPolicy: [
      '写入 stable logs/import-operation-log.jsonl。',
      'operationLogVersion=mvp105-move-only-operation-log-v1。',
      '只记录 token、相对路径、数量、结果、错误码。',
      '不记录 absolutePath，不记录 file://。',
    ],
    uiPolicy: [
      '导入器主界面不要继续堆复杂说明。',
      'MVP105 只显示简短结果；详细规则后续放诊断页 / AI 维护区。',
      'importer daily UI cleanup 仍在导入器完结后处理。',
    ],
    codexPolicy: ['Codex 非必要不安排。', '本轮只做静态和构建验证；真实小样本可由用户后续自行决定是否安排。'],
    nextSteps: ['MVP106 move-only closeout', 'MVP107 importer daily UI cleanup', '之后再考虑下载器 / 元数据 Provider / mpv / SQLite'],
  };
}

export const moveOnlyExecutorService = {
  getModel,
  getToneClassName,
};
