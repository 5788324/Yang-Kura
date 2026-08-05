import type {ImportConflictReportContract} from './importDownloadModelContractService';
import {
  importTargetPathPlanningPreviewService,
  type ImportTargetPathPlanningResult,
  type ImportTargetPathPreviewFile,
} from './importTargetPathPlanningPreviewService';

export type Mvp91CopyReadinessTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';
export type Mvp91CopyPreflightStatus = 'pass' | 'warning' | 'blocker';
export type Mvp91CopyExecutionButtonState = 'disabled-preview-only' | 'future-confirm-required';

export interface Mvp91CopyReadinessCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp91CopyReadinessTone;
}

export interface ImportCopyPreflightCheck {
  id: string;
  label: string;
  status: Mvp91CopyPreflightStatus;
  detail: string;
  requiredBeforeCopy: boolean;
}

export interface ImportCopyConfirmationRequirement {
  id: string;
  label: string;
  detail: string;
  required: boolean;
}

export interface ImportCopyConfirmationPreview {
  taskId: string;
  title: string;
  confirmationText: string;
  executeButtonState: Mvp91CopyExecutionButtonState;
  requirements: ImportCopyConfirmationRequirement[];
}

export interface ImportCopyFileExecutionPlan {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  action: 'copy' | 'skip';
  overwrite: false;
  status: 'planned' | 'skipped' | 'blocked';
  reason?: string;
}

export interface ImportOperationLogPreviewEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  event: 'preflight' | 'confirm' | 'copy-plan' | 'skip' | 'failure';
  message: string;
  sourceRelativePath?: string;
  targetRelativePath?: string;
  timestamp: string;
}

export interface ImportCopyFailurePreviewItem {
  id: string;
  sourceRelativePath: string;
  targetRelativePath?: string;
  reason: string;
  blocksExecution: boolean;
}

export interface ImportCopySkipPreviewItem {
  id: string;
  sourceRelativePath: string;
  targetRelativePath?: string;
  reason: string;
}

export interface ImportCopyExecutionReadinessResult {
  taskId: string;
  detectedType: string;
  title: string;
  canExecuteInMvp91: false;
  futureCopyMode: 'copy-only';
  plannedCopyCount: number;
  plannedSkipCount: number;
  plannedFailureCount: number;
  preflightChecks: ImportCopyPreflightCheck[];
  confirmation: ImportCopyConfirmationPreview;
  fileExecutionPlan: ImportCopyFileExecutionPlan[];
  operationLogPreview: ImportOperationLogPreviewEntry[];
  skippedList: ImportCopySkipPreviewItem[];
  failureList: ImportCopyFailurePreviewItem[];
  conflictReport: ImportConflictReportContract;
}

export interface Mvp91ImportCopyExecutionReadinessModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  readinessCards: Mvp91CopyReadinessCard[];
  sampleResults: ImportCopyExecutionReadinessResult[];
  operationLogFields: string[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

const PREVIEW_NOW = '1970-01-01T00:00:00.000Z';

function makeCheck(id: string, label: string, status: Mvp91CopyPreflightStatus, detail: string, requiredBeforeCopy = true): ImportCopyPreflightCheck {
  return {id, label, status, detail, requiredBeforeCopy};
}

function makeLog(index: number, level: ImportOperationLogPreviewEntry['level'], event: ImportOperationLogPreviewEntry['event'], message: string, file?: ImportTargetPathPreviewFile): ImportOperationLogPreviewEntry {
  return {
    id: `mvp91-operation-log-${String(index + 1).padStart(2, '0')}`,
    level,
    event,
    message,
    sourceRelativePath: file?.sourceRelativePath,
    targetRelativePath: file?.targetRelativePath,
    timestamp: PREVIEW_NOW,
  };
}

function buildFilePlan(file: ImportTargetPathPreviewFile, index: number): ImportCopyFileExecutionPlan {
  const hasBlockingWarning = file.warnings.some((warning) => warning.includes('超过'));
  return {
    id: `mvp91-copy-file-${String(index + 1).padStart(2, '0')}`,
    sourceRelativePath: file.sourceRelativePath,
    targetRelativePath: file.targetRelativePath,
    action: hasBlockingWarning ? 'skip' : 'copy',
    overwrite: false,
    status: hasBlockingWarning ? 'blocked' : 'planned',
    reason: hasBlockingWarning ? '目标路径过长，真实 copy 前必须缩短路径。' : undefined,
  };
}

export function buildImportCopyExecutionReadinessPreview(targetPlan: ImportTargetPathPlanningResult): ImportCopyExecutionReadinessResult {
  const fileExecutionPlan = targetPlan.plannedFiles.map(buildFilePlan);
  const blockedFiles = fileExecutionPlan.filter((file) => file.status === 'blocked');
  const plannedFiles = fileExecutionPlan.filter((file) => file.status === 'planned');
  const skippedList: ImportCopySkipPreviewItem[] = targetPlan.plannedFiles
    .filter((file) => file.action === 'skip')
    .map((file, index) => ({
      id: `mvp91-skip-${String(index + 1).padStart(2, '0')}`,
      sourceRelativePath: file.sourceRelativePath,
      targetRelativePath: file.targetRelativePath,
      reason: '源预览标记为跳过，copy only 执行前不会复制该文件。',
    }));
  const failureList: ImportCopyFailurePreviewItem[] = blockedFiles.map((file, index) => ({
    id: `mvp91-failure-${String(index + 1).padStart(2, '0')}`,
    sourceRelativePath: file.sourceRelativePath,
    targetRelativePath: file.targetRelativePath,
    reason: file.reason || '预检失败，真实 copy 前必须人工处理。',
    blocksExecution: true,
  }));

  const preflightChecks = [
    makeCheck('tokenized-source-root', '来源目录令牌存在', 'pass', '只要求 sourceRootToken，不向 Renderer 暴露 absolutePath。'),
    makeCheck('target-plan-ready', '目标路径计划已生成', targetPlan.plannedFiles.length > 0 ? 'pass' : 'blocker', 'copy only 必须消费 MVP90 targetRelativePath 预览。'),
    makeCheck('overwrite-disabled', '覆盖策略关闭', 'pass', 'overwrite 固定 false；真实 copy 阶段不得覆盖同名文件。'),
    makeCheck('conflict-review-required', '冲突报告已复核', targetPlan.conflictReport.blockers > 0 ? 'blocker' : targetPlan.conflictReport.warnings > 0 ? 'warning' : 'pass', targetPlan.conflictReport.summary),
    makeCheck('operation-log-required', '操作日志必填', 'pass', '真实 copy 前必须生成 OperationLog，记录 planned / copied / skipped / failed。'),
    makeCheck('codex-gate', 'Codex 本机关键验收', 'warning', '真实 copy 前建议让 Codex 在本机跑最小样本验收。', false),
  ];

  const confirmation: ImportCopyConfirmationPreview = {
    taskId: targetPlan.taskId,
    title: `${targetPlan.detectedTitle} · copy only 二次确认`,
    confirmationText: '我确认仅复制文件，不覆盖、不移动、不删除源文件。',
    executeButtonState: 'disabled-preview-only',
    requirements: [
      {id: 'review-source', label: '确认来源目录', detail: '用户必须确认导入来源是正确目录。', required: true},
      {id: 'review-target', label: '确认目标路径', detail: '用户必须确认目标目录和文件名清理结果。', required: true},
      {id: 'review-conflicts', label: '确认冲突报告', detail: '存在 blocker 时不得进入真实 copy。', required: true},
      {id: 'review-copy-only', label: '确认 copy only', detail: '第一版只复制，保留源文件。', required: true},
    ],
  };

  const operationLogPreview = [
    makeLog(0, 'info', 'preflight', `预检 ${preflightChecks.length} 项，MVP91 只生成日志预览。`),
    makeLog(1, 'info', 'confirm', '二次确认文本已定义，但执行按钮仍禁用。'),
    ...plannedFiles.slice(0, 4).map((file, index) => makeLog(index + 2, 'info', 'copy-plan', `计划 copy：${file.sourceRelativePath} → ${file.targetRelativePath}`, targetPlan.plannedFiles.find((planned) => planned.sourceRelativePath === file.sourceRelativePath))),
    ...failureList.map((file, index) => makeLog(index + 6, 'error', 'failure', file.reason)),
  ];

  return {
    taskId: targetPlan.taskId,
    detectedType: targetPlan.detectedType,
    title: targetPlan.detectedTitle,
    canExecuteInMvp91: false,
    futureCopyMode: 'copy-only',
    plannedCopyCount: plannedFiles.length,
    plannedSkipCount: skippedList.length,
    plannedFailureCount: failureList.length,
    preflightChecks,
    confirmation,
    fileExecutionPlan,
    operationLogPreview,
    skippedList,
    failureList,
    conflictReport: targetPlan.conflictReport,
  };
}

function getToneClassName(tone: Mvp91CopyReadinessTone): string {
  const classes: Record<Mvp91CopyReadinessTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

const GUARDED_BOUNDARIES = [
  'MVP91 不执行 fs.copyFile / copyFileSync。',
  '不移动、不删除、不重命名真实媒体文件。',
  '不写 library-index.json，不接 SQLite。',
  '二次确认只做模型，执行按钮 disabled-preview-only。',
  'OperationLog 只做 preview，不落盘。',
  'Renderer 不接收 absolutePath 或 file://。',
];

function getModel(): Mvp91ImportCopyExecutionReadinessModel {
  const targetPathModel = importTargetPathPlanningPreviewService.getModel();
  const sampleResults = targetPathModel.sampleResults.map(buildImportCopyExecutionReadinessPreview);

  return {
    version: '0.129.0-mvp91',
    title: 'MVP-91 copy only 导入前执行合同',
    summary: '为后续真实 copy only 导入冻结预检、二次确认、OperationLog、失败列表与跳过列表模型；当前仍不执行任何文件操作。',
    baseline: '0.128.0-mvp90',
    readinessCards: [
      {id: 'preflight-contract', title: '预检合同', detail: '真实 copy 前必须检查 token、目标计划、冲突报告、overwrite=false。', tone: 'emerald'},
      {id: 'confirmation-contract', title: '二次确认', detail: '用户必须确认来源、目标、冲突和 copy only 模式。', tone: 'sky'},
      {id: 'operation-log-contract', title: 'OperationLog', detail: '后续真实执行要记录 planned / copied / skipped / failed。', tone: 'violet'},
      {id: 'failure-skip-contract', title: '失败 / 跳过列表', detail: '失败不吞掉，跳过不隐式删除，全部进入可读列表。', tone: 'amber'},
      {id: 'disabled-execution', title: '执行继续禁用', detail: 'MVP91 只做执行前合同，不调用文件系统。', tone: 'rose'},
    ],
    sampleResults,
    operationLogFields: ['taskId', 'timestamp', 'event', 'level', 'sourceRelativePath', 'targetRelativePath', 'message', 'errorCode?'],
    guardedBoundaries: GUARDED_BOUNDARIES,
    nextSteps: ['MVP92 copy only 最小真实样本', 'Codex 本机关键验收', '失败回滚策略', 'SQLite 评估后置'],
  };
}

export const importCopyExecutionReadinessService = {
  getModel,
  getToneClassName,
  buildImportCopyExecutionReadinessPreview,
};
