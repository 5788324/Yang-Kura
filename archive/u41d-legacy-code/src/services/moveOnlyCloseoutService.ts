import { moveOnlyExecutorService, type ImportMoveOnlyExecutorResultPreview } from './moveOnlyExecutorService';
import { moveOnlyExecutionReadinessService } from './moveOnlyExecutionReadinessService';
import { moveOnlyStrategyService, type Mvp103MoveOnlyStrategyTone } from './moveOnlyStrategyService';

export type Mvp106MoveOnlyCloseoutTone = Mvp103MoveOnlyStrategyTone;

export interface Mvp106MoveOnlyCloseoutCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp106MoveOnlyCloseoutTone;
}

export interface Mvp106MoveOnlyCloseoutStage {
  id: string;
  mvp: string;
  title: string;
  status: 'closed' | 'ready-for-cleanup' | 'postponed';
  summary: string;
}

export interface Mvp106MoveOnlyCloseoutResultPreview {
  closeoutVersion: 'mvp106-move-only-closeout-v1';
  mode: 'move-only-closeout';
  copyOnlyChainClosed: true;
  moveOnlyChainClosed: true;
  moveOnlyExecutorAvailable: true;
  smallSampleOnly: true;
  operationLogRequired: true;
  failureStopRequired: true;
  overwriteAllowed: false;
  sourceDirectoryCleanupAllowed: false;
  libraryIndexWrittenInMvp106: false;
  sqliteWritten: false;
  downloaderTouched: false;
  metadataProviderTouched: false;
  mpvTouched: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  codexRequired: false;
  nextRecommendedMvp: 'MVP107 importer daily UI cleanup';
}

export interface Mvp106MoveOnlyCloseoutModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  closeoutResult: Mvp106MoveOnlyCloseoutResultPreview;
  executorBaseline: ImportMoveOnlyExecutorResultPreview;
  cards: Mvp106MoveOnlyCloseoutCard[];
  stages: Mvp106MoveOnlyCloseoutStage[];
  userFacingSummary: string[];
  aiMaintenanceSummary: string[];
  remainingImporterWork: string[];
  cleanupPolicy: string[];
  notTouched: string[];
}

function getToneClassName(tone: Mvp106MoveOnlyCloseoutTone): string {
  return moveOnlyStrategyService.getToneClassName(tone);
}

function getModel(): Mvp106MoveOnlyCloseoutModel {
  const strategy = moveOnlyStrategyService.getModel();
  const readiness = moveOnlyExecutionReadinessService.getModel();
  const executor = moveOnlyExecutorService.getModel();

  return {
    version: '0.144.0-mvp106',
    title: 'MVP-106 move-only 导入收口',
    summary: '收口 MVP103-MVP105 的 move-only 导入链路：策略、执行前门禁、小样本真实 move executor 都已具备。MVP106 不新增文件操作，只给导入器完结状态和下一轮 UI 简化入口。',
    baseline: executor.version,
    closeoutResult: {
      closeoutVersion: 'mvp106-move-only-closeout-v1',
      mode: 'move-only-closeout',
      copyOnlyChainClosed: true,
      moveOnlyChainClosed: true,
      moveOnlyExecutorAvailable: true,
      smallSampleOnly: true,
      operationLogRequired: true,
      failureStopRequired: true,
      overwriteAllowed: false,
      sourceDirectoryCleanupAllowed: false,
      libraryIndexWrittenInMvp106: false,
      sqliteWritten: false,
      downloaderTouched: false,
      metadataProviderTouched: false,
      mpvTouched: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      codexRequired: false,
      nextRecommendedMvp: 'MVP107 importer daily UI cleanup',
    },
    executorBaseline: executor.resultPreview,
    cards: [
      { id: 'copy-closed', title: 'copy-only 已闭环', detail: 'MVP95-MVP102 已完成复制、日志、刷新、写 index、UI 刷新和 closeout。', tone: 'emerald' },
      { id: 'move-closed', title: 'move-only 已具备闭环', detail: 'MVP103-MVP105 已完成策略、门禁和小样本真实 move executor。', tone: 'sky' },
      { id: 'small-sample', title: '小样本限制保留', detail: 'move-only 仍限制最多 20 个文件，不做大规模自动整理。', tone: 'amber' },
      { id: 'ui-next', title: '下一轮清理 UI', detail: '导入器工程说明后续折叠到诊断页 / AI 维护区。', tone: 'violet' },
    ],
    stages: [
      { id: 'mvp103', mvp: 'MVP103', title: strategy.title, status: 'closed', summary: 'move-only 策略、确认、日志、失败处理和 UI 后置原则已落地。' },
      { id: 'mvp104', mvp: 'MVP104', title: readiness.title, status: 'closed', summary: 'move-only 执行前门禁已落地；真实 move 之前需要 CONFIRM_MOVE_IMPORT。' },
      { id: 'mvp105', mvp: 'MVP105', title: executor.title, status: 'closed', summary: '小样本 move-only executor 已落地：不覆盖、失败停止、写 OperationLog、不清理源目录。' },
      { id: 'mvp106', mvp: 'MVP106', title: 'move-only closeout', status: 'ready-for-cleanup', summary: '导入器 copy-only 与 move-only 两条主链路已完成阶段性收口。' },
      { id: 'mvp107', mvp: 'MVP107', title: 'importer daily UI cleanup', status: 'postponed', summary: '下一轮把复杂工程说明折叠到诊断 / AI 维护区，主界面只保留用户日常入口。' },
    ],
    userFacingSummary: [
      '导入器现在有两条路径：复制导入和移动导入。',
      '复制导入是默认推荐方式；移动导入需要明确确认。',
      '移动导入第一版只面向小样本，不做大规模自动整理。',
      '导入失败时停止，不覆盖已有目标，不自动清理源目录。',
    ],
    aiMaintenanceSummary: [
      'MVP95-MVP102 关闭 copy-only 导入链路。',
      'MVP103-MVP106 关闭 move-only 策略到小样本执行链路。',
      'MVP107 应集中处理导入器日常 UI 简化，不再插入下载器 / SQLite / mpv。',
      '工程说明保留给 AI 维护，但应从用户主界面移到诊断页 / AI 维护区。',
    ],
    remainingImporterWork: [
      'MVP107：导入器日常 UI 简化。',
      '后续可选：批量导入汇总页。',
      '后续可选：导入结果历史查看。',
      '后续可选：更完整的失败恢复提示。',
    ],
    cleanupPolicy: [
      '导入器主页面只保留：选择来源、导入预览、冲突、目标路径、执行方式、结果摘要。',
      'MVP86-MVP106 的合同、verifier、IPC、规则卡片移动到诊断页 / AI 维护区。',
      '用户本人不会维护工程说明；保留它们只为 AI 接手和排错。',
      'Codex 非必要不安排。',
    ],
    notTouched: [
      '不新增真实 move / copy / delete / rename 操作。',
      '不再次写 library-index.json。',
      '不接 SQLite。',
      '不接下载器。',
      '不接元数据 Provider。',
      '不接 mpv。',
      '不返回 absolutePath。',
      '不返回 file://。',
    ],
  };
}

export const moveOnlyCloseoutService = {
  getModel,
  getToneClassName,
};
