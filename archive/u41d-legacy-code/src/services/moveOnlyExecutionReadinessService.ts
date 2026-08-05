import { importTargetPathPlanningPreviewService, type ImportTargetPathPlanningResult } from './importTargetPathPlanningPreviewService';
import { moveOnlyStrategyService, type Mvp103MoveOnlyStrategyTone } from './moveOnlyStrategyService';

export type Mvp104MoveReadinessTone = Mvp103MoveOnlyStrategyTone;
export type Mvp104MovePreflightStatus = 'pass' | 'warning' | 'blocker';
export type Mvp104MoveReadinessState = 'ready-for-small-sample-executor' | 'blocked-until-user-confirmation' | 'blocked-by-conflict';

export interface Mvp104MoveReadinessCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp104MoveReadinessTone;
}

export interface ImportMovePreflightCheck {
  id: string;
  label: string;
  status: Mvp104MovePreflightStatus;
  detail: string;
  requiredBeforeMove: boolean;
}

export interface ImportMoveConfirmationPreview {
  taskId: string;
  confirmationText: 'CONFIRM_MOVE_IMPORT';
  requiredUserChoice: 'move-only';
  copyOnlyRecommended: true;
  executeButtonState: 'disabled-readiness-only';
  requirements: string[];
}

export interface ImportMoveFileExecutionPlanPreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  action: 'move' | 'skip' | 'blocked';
  overwrite: false;
  sourceCleanupAllowed: false;
  status: 'planned-after-mvp104' | 'blocked' | 'skipped';
  reason?: string;
}

export interface ImportMoveOperationLogPreviewEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  event: 'preflight' | 'confirm' | 'move-plan' | 'skip' | 'blocker';
  message: string;
  sourceRelativePath?: string;
  targetRelativePath?: string;
  timestamp: string;
}

export interface ImportMoveExecutionReadinessResult {
  taskId: string;
  detectedType: string;
  title: string;
  readinessVersion: 'mvp104-move-only-execution-readiness-v1';
  mode: 'move-only-execution-readiness';
  readinessState: Mvp104MoveReadinessState;
  canExecuteMoveInMvp104: false;
  nextExecutorMvp: 'MVP105 small-sample move-only executor';
  plannedMoveCount: number;
  plannedSkipCount: number;
  plannedBlockedCount: number;
  totalPlannedItems: number;
  preflightChecks: ImportMovePreflightCheck[];
  confirmation: ImportMoveConfirmationPreview;
  fileExecutionPlanPreview: ImportMoveFileExecutionPlanPreview[];
  operationLogPreview: ImportMoveOperationLogPreviewEntry[];
  absolutePathReturned: false;
  fileUrlReturned: false;
  sqliteWritten: false;
  libraryIndexWritten: false;
  realMoveExecuted: false;
  fsRenameCalled: false;
  fsRmCalled: false;
  fsUnlinkCalled: false;
}

export interface Mvp104MoveOnlyExecutionReadinessModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  readinessCards: Mvp104MoveReadinessCard[];
  sampleResults: ImportMoveExecutionReadinessResult[];
  requiredExecutorInputs: string[];
  blockedUntilMvp105: string[];
  failureStopPolicy: string[];
  personalProjectSpeedPolicy: string[];
  uiCleanupNote: string[];
  nextSteps: string[];
}

const PREVIEW_NOW = '1970-01-01T00:00:00.000Z';

function makeCheck(id: string, label: string, status: Mvp104MovePreflightStatus, detail: string, requiredBeforeMove = true): ImportMovePreflightCheck {
  return { id, label, status, detail, requiredBeforeMove };
}

function buildFilePlan(targetPlan: ImportTargetPathPlanningResult): ImportMoveFileExecutionPlanPreview[] {
  return targetPlan.plannedFiles.map((file, index) => {
    const tooLong = file.warnings.some((warning) => warning.includes('超过'));
    const skipped = file.action === 'skip';
    return {
      id: `mvp104-move-file-${String(index + 1).padStart(2, '0')}`,
      sourceRelativePath: file.sourceRelativePath,
      targetRelativePath: file.targetRelativePath,
      action: tooLong ? 'blocked' : skipped ? 'skip' : 'move',
      overwrite: false,
      sourceCleanupAllowed: false,
      status: tooLong ? 'blocked' : skipped ? 'skipped' : 'planned-after-mvp104',
      reason: tooLong
        ? '目标路径过长，MVP105 真实 move 前必须人工处理。'
        : skipped
          ? '源计划标记为跳过；move-only 不会移动该项。'
          : undefined,
    };
  });
}

export function buildMoveOnlyExecutionReadinessPreview(targetPlan: ImportTargetPathPlanningResult): ImportMoveExecutionReadinessResult {
  const fileExecutionPlanPreview = buildFilePlan(targetPlan);
  const blockers = targetPlan.conflictReport.blockers + fileExecutionPlanPreview.filter((item) => item.status === 'blocked').length;
  const warnings = targetPlan.conflictReport.warnings;
  const plannedMoveItems = fileExecutionPlanPreview.filter((item) => item.action === 'move');
  const plannedSkipItems = fileExecutionPlanPreview.filter((item) => item.action === 'skip');
  const plannedBlockedItems = fileExecutionPlanPreview.filter((item) => item.action === 'blocked');
  const readinessState: Mvp104MoveReadinessState = blockers > 0
    ? 'blocked-by-conflict'
    : 'blocked-until-user-confirmation';

  const preflightChecks: ImportMovePreflightCheck[] = [
    makeCheck('move-mode-explicit', 'move-only 模式显式选择', 'warning', 'MVP104 只生成门禁；MVP105 前必须由用户显式选择 move-only。'),
    makeCheck('target-plan-ready', '目标路径计划存在', targetPlan.plannedFiles.length > 0 ? 'pass' : 'blocker', 'move-only 必须消费 MVP90 targetRelativePath 计划。'),
    makeCheck('conflict-report-reviewed', '冲突报告复核', blockers > 0 ? 'blocker' : warnings > 0 ? 'warning' : 'pass', targetPlan.conflictReport.summary),
    makeCheck('overwrite-disabled', '禁止覆盖', 'pass', 'overwrite 固定 false；目标存在时跳过或阻塞。'),
    makeCheck('operation-log-required', '操作日志必填', 'pass', 'MVP105 必须记录 planned / moved / skipped / failed；主界面只显示简短结果。'),
    makeCheck('source-cleanup-blocked', '源清理禁用', 'pass', 'MVP104 不允许清理源；MVP105 也只能在成功移动项上受控处理。'),
  ];

  const confirmation: ImportMoveConfirmationPreview = {
    taskId: targetPlan.taskId,
    confirmationText: 'CONFIRM_MOVE_IMPORT',
    requiredUserChoice: 'move-only',
    copyOnlyRecommended: true,
    executeButtonState: 'disabled-readiness-only',
    requirements: [
      '确认来源目录和目标目录。',
      '确认 copy-only 更安全，move-only 会改变来源目录状态。',
      '确认冲突和跳过列表。',
      '输入 CONFIRM_MOVE_IMPORT。',
    ],
  };

  const operationLogPreview: ImportMoveOperationLogPreviewEntry[] = [
    { id: 'mvp104-log-01', level: 'info', event: 'preflight', message: `move-only 预检 ${preflightChecks.length} 项；MVP104 不执行真实 move。`, timestamp: PREVIEW_NOW },
    { id: 'mvp104-log-02', level: 'warning', event: 'confirm', message: 'MVP105 前必须二次确认 CONFIRM_MOVE_IMPORT。', timestamp: PREVIEW_NOW },
    ...plannedMoveItems.slice(0, 4).map((item, index) => ({
      id: `mvp104-log-${String(index + 3).padStart(2, '0')}`,
      level: 'info' as const,
      event: 'move-plan' as const,
      message: `计划 move：${item.sourceRelativePath} → ${item.targetRelativePath}`,
      sourceRelativePath: item.sourceRelativePath,
      targetRelativePath: item.targetRelativePath,
      timestamp: PREVIEW_NOW,
    })),
    ...plannedBlockedItems.map((item, index) => ({
      id: `mvp104-blocker-${String(index + 1).padStart(2, '0')}`,
      level: 'error' as const,
      event: 'blocker' as const,
      message: item.reason || 'move-only blocker',
      sourceRelativePath: item.sourceRelativePath,
      targetRelativePath: item.targetRelativePath,
      timestamp: PREVIEW_NOW,
    })),
  ];

  return {
    taskId: targetPlan.taskId,
    detectedType: targetPlan.detectedType,
    title: targetPlan.detectedTitle,
    readinessVersion: 'mvp104-move-only-execution-readiness-v1',
    mode: 'move-only-execution-readiness',
    readinessState,
    canExecuteMoveInMvp104: false,
    nextExecutorMvp: 'MVP105 small-sample move-only executor',
    plannedMoveCount: plannedMoveItems.length,
    plannedSkipCount: plannedSkipItems.length,
    plannedBlockedCount: plannedBlockedItems.length,
    totalPlannedItems: fileExecutionPlanPreview.length,
    preflightChecks,
    confirmation,
    fileExecutionPlanPreview,
    operationLogPreview,
    absolutePathReturned: false,
    fileUrlReturned: false,
    sqliteWritten: false,
    libraryIndexWritten: false,
    realMoveExecuted: false,
    fsRenameCalled: false,
    fsRmCalled: false,
    fsUnlinkCalled: false,
  };
}

function getToneClassName(tone: Mvp104MoveReadinessTone): string {
  return moveOnlyStrategyService.getToneClassName(tone);
}

function getModel(): Mvp104MoveOnlyExecutionReadinessModel {
  const targetPathPlanning = importTargetPathPlanningPreviewService.getModel();
  const moveStrategy = moveOnlyStrategyService.getModel();
  const sampleResults = targetPathPlanning.sampleResults.map(buildMoveOnlyExecutionReadinessPreview);

  return {
    version: '0.142.0-mvp104',
    title: 'MVP-104 move-only 执行前门禁',
    summary: '为下一轮小样本真实 move-only executor 压缩准备工作：消费目标路径计划和冲突报告，生成二次确认、禁覆盖、日志、失败停止和源清理禁用门禁。MVP104 仍不执行真实移动。',
    baseline: moveStrategy.version,
    readinessCards: [
      { id: 'gate-ready', title: '门禁就绪', detail: 'MVP104 已把 move-only 需要的确认、冲突、日志和失败策略收成一处。', tone: 'emerald' },
      { id: 'execute-disabled', title: '本轮不执行', detail: '执行按钮仍是 disabled-readiness-only；真实 move 留给 MVP105。', tone: 'rose' },
      { id: 'copy-recommended', title: 'copy 仍是推荐', detail: '个人项目可以提速，但 move 仍需显式选择。', tone: 'amber' },
      { id: 'ui-cleanup-later', title: 'UI 清理后置', detail: '导入器完结后再把工程卡片折叠到 AI 维护区。', tone: 'violet' },
    ],
    sampleResults,
    requiredExecutorInputs: [
      'sourceRootToken',
      'targetRootPathToken',
      'ImportPlan / TargetPathPlan',
      'ConflictReport',
      'confirmationText = CONFIRM_MOVE_IMPORT',
      'overwrite = false',
      'operationLog enabled',
    ],
    blockedUntilMvp105: [
      '真实 fs.rename / cross-device copy+verify+cleanup 执行器。',
      '真实 OperationLog 落盘。',
      '真实源目录清理。',
      '真实 post-move refresh / index patch 串联。',
    ],
    failureStopPolicy: [
      '遇到 blocker 不进入执行。',
      '执行中遇到失败必须停止当前批次，不继续清理源目录。',
      '目标存在同名文件时跳过或阻塞，不覆盖。',
      '失败结果必须进入 OperationLog 和用户可读摘要。',
    ],
    personalProjectSpeedPolicy: [
      '不做企业级权限系统。',
      '不安排 Codex，除非后续真实 move 需要本机关键验收。',
      '以预览、确认、日志、失败停止作为最小安全边界。',
      '导入器主线优先完结，UI 清理不插队。',
    ],
    uiCleanupNote: [
      '当前导入器工程说明保留给 AI 维护。',
      '用户本人不会阅读这些工程卡片。',
      'MVP107 再把工程说明折叠到诊断页 / AI 维护区。',
    ],
    nextSteps: [
      'MVP105：小样本真实 move-only executor。',
      'MVP106：move-only closeout。',
      'MVP107：importer daily UI cleanup。',
    ],
  };
}

export const moveOnlyExecutionReadinessService = {
  getModel,
  getToneClassName,
  buildMoveOnlyExecutionReadinessPreview,
};
