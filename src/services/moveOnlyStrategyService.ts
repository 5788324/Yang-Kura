import { copyOnlyImportCloseoutService } from './copyOnlyImportCloseoutService';

export type Mvp103MoveOnlyStrategyTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp103MoveOnlyStrategyCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp103MoveOnlyStrategyTone;
}

export interface Mvp103MoveOnlyPhase {
  id: string;
  mvp: string;
  title: string;
  status: 'planned' | 'blocked-until-confirmed' | 'postponed';
  summary: string;
  acceptance: string;
}

export interface Mvp103MoveOnlyGuardrail {
  id: string;
  rule: string;
  reason: string;
}

export interface Mvp103MoveOnlyStrategyPreview {
  schemaVersion: 1;
  strategyVersion: 'mvp103-move-only-strategy-v1';
  mode: 'move-only-strategy';
  baseline: '0.140.0-mvp102';
  copyOnlyChainClosed: true;
  actualMoveImplemented: false;
  moveOperationTouched: false;
  deleteOperationTouched: false;
  renameOperationTouched: false;
  copyOperationTouched: false;
  libraryIndexWritten: false;
  operationLogWritten: false;
  sqliteWritten: false;
  scannerRunTriggered: false;
  downloaderTouched: false;
  metadataProviderTouched: false;
  mpvTouched: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  codexRequired: false;
  nextRecommendedMvp: 'MVP104 move-only execution readiness';
}

export interface Mvp103MoveOnlyStrategyModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  strategyPreview: Mvp103MoveOnlyStrategyPreview;
  cards: Mvp103MoveOnlyStrategyCard[];
  phases: Mvp103MoveOnlyPhase[];
  moveOnlyRules: string[];
  operationLogPolicy: string[];
  confirmationPolicy: string[];
  rollbackPolicy: string[];
  uiPolicy: string[];
  guardrails: Mvp103MoveOnlyGuardrail[];
  nextImporterCompletionPlan: string[];
}

function getToneClassName(tone: Mvp103MoveOnlyStrategyTone): string {
  const classes: Record<Mvp103MoveOnlyStrategyTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp103MoveOnlyStrategyModel {
  const copyOnlyCloseout = copyOnlyImportCloseoutService.getModel();

  return {
    version: '0.141.0-mvp103',
    title: 'MVP-103 move-only 导入策略',
    summary: 'copy-only 导入已经在 MVP102 收口。本轮只定义下一段受控 move-only 导入路线：移动必须显式选择、先预览、先检查冲突、写操作日志、失败不继续清理源目录。MVP103 不执行 fs.rename、fs.rm、fs.unlink，也不再次写 library-index.json。',
    baseline: copyOnlyCloseout.version,
    strategyPreview: {
      schemaVersion: 1,
      strategyVersion: 'mvp103-move-only-strategy-v1',
      mode: 'move-only-strategy',
      baseline: '0.140.0-mvp102',
      copyOnlyChainClosed: copyOnlyCloseout.closeoutResult.importChainClosed,
      actualMoveImplemented: false,
      moveOperationTouched: false,
      deleteOperationTouched: false,
      renameOperationTouched: false,
      copyOperationTouched: false,
      libraryIndexWritten: false,
      operationLogWritten: false,
      sqliteWritten: false,
      scannerRunTriggered: false,
      downloaderTouched: false,
      metadataProviderTouched: false,
      mpvTouched: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      codexRequired: false,
      nextRecommendedMvp: 'MVP104 move-only execution readiness',
    },
    cards: [
      { id: 'copy-closed', title: 'copy-only 已闭环', detail: 'MVP95-MVP102 已经完成可回退的 copy-only 导入链路。', tone: 'emerald' },
      { id: 'move-opt-in', title: 'move 必须显式选择', detail: '移动不是默认动作；用户必须在导入计划中选择 move-only。', tone: 'amber' },
      { id: 'no-real-move', title: '本轮不移动文件', detail: 'MVP103 只定义策略，不调用 fs.rename / fs.rm / fs.unlink。', tone: 'rose' },
      { id: 'ui-after-import', title: 'UI 清理后置', detail: '导入器完结后再把工程说明折叠到诊断 / AI 维护区。', tone: 'violet' },
    ],
    phases: [
      { id: 'mvp103', mvp: 'MVP103', title: 'move-only strategy', status: 'planned', summary: '定义移动导入的策略、确认、日志、失败处理和 UI 折叠后置原则。', acceptance: '服务、文档、UI 摘要和 verifier 存在；不执行真实移动。' },
      { id: 'mvp104', mvp: 'MVP104', title: 'move-only execution readiness', status: 'planned', summary: '基于目标路径规划与冲突检测，生成 move-only readiness gate。', acceptance: '可判断 move 是否允许；仍不执行 move。' },
      { id: 'mvp105', mvp: 'MVP105', title: 'move-only executor', status: 'blocked-until-confirmed', summary: '在二次确认后执行真实移动，并写入最小 OperationLog。', acceptance: '只处理小样本；失败停止；不覆盖；不静默删除。' },
      { id: 'mvp106', mvp: 'MVP106', title: 'move-only closeout', status: 'planned', summary: '收口 move-only 导入链路，记录用户可理解的结果摘要。', acceptance: '导入器可以说明 copy / move 两条路径已经闭环。' },
      { id: 'mvp107', mvp: 'MVP107', title: 'importer daily UI cleanup', status: 'postponed', summary: '把 MVP86-MVP106 的工程说明折叠到诊断页 / AI 维护区。', acceptance: '导入器主页面只保留用户日常需要看的入口、计划、结果和错误。' },
    ],
    moveOnlyRules: [
      'copy-only 仍是默认推荐动作；move-only 是用户主动选择的高风险动作。',
      'move-only 必须基于已存在的 ImportPlan / TargetPathPlan / ConflictReport。',
      '目标位置存在同名文件时默认跳过，不覆盖。',
      '移动执行前必须显示源摘要、目标摘要、冲突摘要、将要移动的数量和总大小。',
      '移动执行后必须能触发与 copy-only 相同的 post-copy refresh / index patch / UI refresh 链路。',
      '跨盘移动实现时优先按“copy 到目标、校验、再清理源”的安全模型设计；不要假设 fs.rename 永远成功。',
    ],
    operationLogPolicy: [
      'move-only 必须写 OperationLog；至少记录 taskId、planId、sourceRootToken、targetRootToken、相对路径、结果、错误码。',
      '日志给 AI 维护和失败恢复用；主界面只显示简单成功/失败摘要。',
      '日志不向 renderer 暴露 absolutePath 或 file://。',
      '失败时记录 failedItems，不继续清理源目录。',
    ],
    confirmationPolicy: [
      'move-only 需要二次确认，不允许只点一次就执行。',
      '确认文案建议：CONFIRM_MOVE_IMPORT。',
      '二次确认页面要明确：移动会改变源目录状态；copy-only 更安全。',
      '个人项目边界按“少浪费、可理解、可回退”执行，不做企业级权限系统。',
    ],
    rollbackPolicy: [
      'MVP 阶段不承诺自动回滚完整目录树。',
      '失败时必须停止、保留源文件、保留目标已成功项，并展示失败列表。',
      '如果采用 copy+verify+cleanup，cleanup 必须只针对已确认成功复制的源文件。',
      '任何批量清理空目录都后置，不混入第一版 move-only executor。',
    ],
    uiPolicy: [
      '导入器主界面最终只保留日常用户会看的内容：选择来源、预览、冲突、目标路径、执行按钮、结果。',
      'MVP86-MVP106 的工程卡片、合同、verifier 文案后续统一折叠到诊断页 / AI 维护区。',
      '用户本人不维护这些工程说明；保留它们只是方便 AI 接手和排错。',
      'importer daily UI cleanup 在导入器 copy + move 两条主链路收口后执行。',
    ],
    guardrails: [
      { id: 'no-real-fs', rule: 'MVP103 不调用真实文件变更 API。', reason: '本轮只做 move-only 策略，不做 executor。' },
      { id: 'no-silent-delete', rule: '后续 move-only 不允许静默删除源文件。', reason: '个人项目可以放宽边界，但不能无日志、无确认地破坏资源。' },
      { id: 'no-overwrite', rule: '目标冲突默认跳过，不覆盖。', reason: '避免把已有媒体库文件覆盖掉。' },
      { id: 'no-sqlite', rule: 'SQLite 继续后置。', reason: '导入器闭环优先，数据库迁移不插队。' },
      { id: 'no-codex-by-default', rule: 'Codex 非必要不安排。', reason: 'Codex 额度少，只留给必要实机测试或关键验收。' },
    ],
    nextImporterCompletionPlan: [
      'MVP104：move-only execution readiness，仍不执行 move。',
      'MVP105：小样本真实 move-only executor，必须二次确认、写日志、不覆盖、失败停止。',
      'MVP106：move-only closeout，把 copy-only 与 move-only 两条导入路径收口。',
      'MVP107：importer daily UI cleanup，把工程说明收进诊断 / AI 维护区。',
    ],
  };
}

export const moveOnlyStrategyService = {
  getModel,
  getToneClassName,
};
