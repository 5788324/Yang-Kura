import { copyOnlyExecutorService, type Mvp95CopyExecutorResultPreview } from './copyOnlyExecutorService';

export type Mvp96OperationLogTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp96OperationLogCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp96OperationLogTone;
}

export interface Mvp96OperationLogSchemaField {
  id: string;
  field: string;
  rule: string;
  required: boolean;
}

export interface Mvp96OperationLogPersistedSummaryPreview {
  schemaVersion: 1;
  operationLogVersion: 'mvp96-copy-only-operation-log-v1';
  operationId: string;
  operationPlanId: string;
  eventType: 'copy-only-execute';
  mode: 'copy-only';
  wroteAt: string;
  persisted: true;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp96OperationLogEntryPreview {
  schemaVersion: 1;
  operationLogVersion: 'mvp96-copy-only-operation-log-v1';
  operationId: string;
  operationPlanId: string;
  eventType: 'copy-only-execute';
  mode: 'copy-only';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  createdDirectoryRelativePaths: string[];
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
}

export interface Mvp96CopyOnlyOperationLogModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp96OperationLogCard[];
  logFileContract: {
    filename: 'import-operation-log.jsonl';
    storageScope: 'electron-app-logs';
    appendOnly: true;
    returnedToRenderer: false;
    absolutePathReturned: false;
    fileUrlReturned: false;
  };
  schemaFields: Mvp96OperationLogSchemaField[];
  sampleExecutorResult: Omit<Mvp95CopyExecutorResultPreview, 'status' | 'operationLogPersisted' | 'operationLogPreview'> & {
    status: 'mvp96-copy-only-execute-complete-with-operation-log';
    operationLogPersisted: true;
    operationLog: Mvp96OperationLogPersistedSummaryPreview;
    operationLogPreview: Omit<Mvp95CopyExecutorResultPreview['operationLogPreview'], 'persisted'> & { persisted: true };
  };
  sampleLogEntry: Mvp96OperationLogEntryPreview;
  guardedBoundaries: string[];
  codexGate: {
    sendToCodexNow: true;
    reason: string;
    requiredAfterBuild: string;
  };
  nextSteps: string[];
}

function getToneClassName(tone: Mvp96OperationLogTone): string {
  const classes: Record<Mvp96OperationLogTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp96CopyOnlyOperationLogModel {
  const executor = copyOnlyExecutorService.getModel();
  const baseResult = executor.resultPreview;
  const operationLog: Mvp96OperationLogPersistedSummaryPreview = {
    schemaVersion: 1,
    operationLogVersion: 'mvp96-copy-only-operation-log-v1',
    operationId: 'mvp96-copy-only-sample-operation-id',
    operationPlanId: baseResult.operationPlanId,
    eventType: 'copy-only-execute',
    mode: 'copy-only',
    wroteAt: '2026-07-08T00:00:00.000Z',
    persisted: true,
    absolutePathReturned: false,
    fileUrlReturned: false,
  };
  const sampleLogEntry: Mvp96OperationLogEntryPreview = {
    ...operationLog,
    rootPathToken: executor.requestPreview.rootPathToken,
    targetRootPathToken: executor.requestPreview.targetRootPathToken,
    requestedFileCount: executor.requestPreview.relativePaths.length,
    copiedCount: baseResult.copiedCount,
    skippedCount: baseResult.skippedCount,
    failedCount: baseResult.failedCount,
    createdDirectoryCount: baseResult.createdDirectoryCount,
    createdDirectoryRelativePaths: ['ASMR/RJ01588893 - 雨音耳かき'],
    copiedFiles: baseResult.copiedFiles.map(({ id, sourceRelativePath, targetRelativePath, sizeBytes }) => ({ id, sourceRelativePath, targetRelativePath, sizeBytes })),
    skippedList: baseResult.skippedList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode })),
    failureList: baseResult.failureList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode, message }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode, message })),
    libraryIndexWritten: false,
  };
  return {
    version: '0.134.0-mvp96',
    title: 'MVP-96 copy-only OperationLog 最小落盘',
    summary: 'copy-only executor 在完成真实 copy/skip/failure 分流后，向 Electron app logs 写入 append-only JSONL 操作日志；日志只包含 token、相对路径、状态和计数。',
    baseline: '0.133.0-mvp95',
    cards: [
      { id: 'persisted-log', title: '日志落盘', detail: '写入 import-operation-log.jsonl；每次执行追加一行 JSON。', tone: 'emerald' },
      { id: 'relative-only', title: '相对路径', detail: '日志不包含 absolutePath，不包含 file://。', tone: 'sky' },
      { id: 'append-only', title: '追加写入', detail: '使用 appendFile，不覆盖旧日志。', tone: 'violet' },
      { id: 'no-index', title: '不入库', detail: '仍不写 library-index.json，不触发扫描刷新。', tone: 'rose' },
      { id: 'codex-gate', title: '本机验收', detail: '需要 Codex 用真实样本确认日志内容。', tone: 'amber' },
    ],
    logFileContract: {
      filename: 'import-operation-log.jsonl',
      storageScope: 'electron-app-logs',
      appendOnly: true,
      returnedToRenderer: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    schemaFields: [
      { id: 'version', field: 'operationLogVersion', rule: '固定 mvp96-copy-only-operation-log-v1。', required: true },
      { id: 'id', field: 'operationId', rule: 'main 侧生成 UUID；Renderer 不提供绝对路径。', required: true },
      { id: 'tokens', field: 'rootPathToken / targetRootPathToken', rule: '记录 token，不记录真实路径。', required: true },
      { id: 'counts', field: 'copiedCount / skippedCount / failedCount', rule: '与 executor 返回计数一致。', required: true },
      { id: 'lists', field: 'copiedFiles / skippedList / failureList', rule: '只允许 sourceRelativePath / targetRelativePath / reasonCode。', required: true },
      { id: 'guards', field: 'absolutePathReturned / fileUrlReturned', rule: '必须为 false。', required: true },
    ],
    sampleExecutorResult: {
      ...baseResult,
      status: 'mvp96-copy-only-execute-complete-with-operation-log',
      operationLogPersisted: true,
      operationLog,
      operationLogPreview: { ...baseResult.operationLogPreview, persisted: true },
    },
    sampleLogEntry,
    guardedBoundaries: [
      'OperationLog 写入 Electron app logs 下的 import-operation-log.jsonl，但不把日志绝对路径返回 Renderer。',
      '日志条目只包含 rootPathToken、targetRootPathToken、relativePath、计数、状态和 reasonCode。',
      '失败信息必须脱敏，不允许把 fs error message 里的绝对路径传给 Renderer 或写进日志。',
      '仍不写 library-index.json，不接 SQLite，不触发重新扫描。',
      '仍不 move/delete/rename，不覆盖目标文件。',
    ],
    codexGate: {
      sendToCodexNow: true,
      reason: 'MVP96 引入 appendFile 日志落盘，需要 Codex 本机确认 copy/skip/failure 三类日志都只包含相对路径。',
      requiredAfterBuild: '跑真实样本 copy-only；检查 import-operation-log.jsonl 新增行；确认不含盘符、反斜杠绝对路径、file://、library-index.json 写入。',
    },
    nextSteps: ['Codex MVP96 日志落盘验收', 'MVP97 导入后扫描/入库刷新设计', 'SQLite 仍后置'],
  };
}

export const copyOnlyOperationLogService = {
  getModel,
  getToneClassName,
};
