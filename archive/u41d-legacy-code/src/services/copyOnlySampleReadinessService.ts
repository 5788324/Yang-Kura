import { importCopyExecutionReadinessService, type ImportCopyExecutionReadinessResult } from './importCopyExecutionReadinessService';

export type Mvp92CopySampleTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';
export type Mvp92CopyGateStatus = 'required' | 'blocked-in-mvp92' | 'codex-only';

export interface Mvp92CopySampleCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp92CopySampleTone;
}

export interface Mvp92MinimalSampleRequirement {
  id: string;
  title: string;
  requirement: string;
  reason: string;
  required: boolean;
}

export interface Mvp92CodexValidationStep {
  id: string;
  phase: 'prepare' | 'verify' | 'manual-check' | 'report';
  title: string;
  command?: string;
  expected: string;
  blocksRealCopy: boolean;
}

export interface Mvp92CopyOnlyIpcContract {
  channel: string;
  direction: 'renderer-to-main' | 'main-to-renderer';
  purpose: string;
  rendererPayloadRule: string;
  mainSideRule: string;
  implementedInMvp92: false;
}

export interface Mvp92MainSideCopyContract {
  id: string;
  title: string;
  detail: string;
  requiredBeforeImplementation: boolean;
}

export interface Mvp92CopyExecutionGate {
  id: string;
  label: string;
  status: Mvp92CopyGateStatus;
  detail: string;
}

export interface Mvp92CopyOnlySampleReadinessPreview {
  sourceTaskId: string;
  sampleName: string;
  sampleSourceRoot: string;
  sampleTargetRoot: string;
  plannedCopyCount: number;
  plannedSkipCount: number;
  plannedFailureCount: number;
  requiredUserConfirmation: string;
  gates: Mvp92CopyExecutionGate[];
  sourceReadiness: ImportCopyExecutionReadinessResult;
}

export interface Mvp92CopyOnlySampleReadinessModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  sampleReadinessCards: Mvp92CopySampleCard[];
  minimalSampleRequirements: Mvp92MinimalSampleRequirement[];
  codexValidationSteps: Mvp92CodexValidationStep[];
  ipcContracts: Mvp92CopyOnlyIpcContract[];
  mainSideCopyContracts: Mvp92MainSideCopyContract[];
  samplePreview: Mvp92CopyOnlySampleReadinessPreview;
  guardedBoundaries: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp92CopySampleTone): string {
  const classes: Record<Mvp92CopySampleTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

export function buildCopyOnlySampleReadinessPreview(sourceReadiness: ImportCopyExecutionReadinessResult): Mvp92CopyOnlySampleReadinessPreview {
  return {
    sourceTaskId: sourceReadiness.taskId,
    sampleName: 'MVP92 最小 copy-only 样本',
    sampleSourceRoot: 'C:/YangKuraSandbox/import-source/RJ01588893 - copy-only-sample',
    sampleTargetRoot: 'C:/YangKuraSandbox/import-target/ASMR/RJ01588893 - copy-only-sample',
    plannedCopyCount: sourceReadiness.plannedCopyCount,
    plannedSkipCount: sourceReadiness.plannedSkipCount,
    plannedFailureCount: sourceReadiness.plannedFailureCount,
    requiredUserConfirmation: sourceReadiness.confirmation.confirmationText,
    gates: [
      {id: 'codex-local-run', label: 'Codex 本机验收', status: 'codex-only', detail: '真实 copy 前必须在本机使用一次性样本目录跑 npm 验证和手工检查。'},
      {id: 'sample-only', label: '只用一次性样本', status: 'required', detail: '不得直接拿正式 E:/MediaLibrary 或真实下载目录作为第一轮 copy 样本。'},
      {id: 'no-overwrite', label: '禁止覆盖', status: 'required', detail: 'copy-only 实现必须保持 overwrite=false；同名目标进入 skipped/failure。'},
      {id: 'renderer-no-path', label: 'Renderer 不见真实路径', status: 'required', detail: 'UI 只显示 token/displayName/relativePath，不显示 absolutePath 或 file://。'},
      {id: 'implementation-blocked', label: 'MVP92 不实现执行器', status: 'blocked-in-mvp92', detail: '本轮只冻结合同和验收任务书，执行按钮继续禁用。'},
    ],
    sourceReadiness,
  };
}

const GUARDED_BOUNDARIES = [
  'MVP92 不实现真实 copy only 执行器。',
  'MVP92 不调用 copyFile / rename / remove / unlink。',
  'MVP92 不读取真实文件系统，不创建目录。',
  'MVP92 不写 library-index.json，不接 SQLite。',
  'MVP92 只定义 Codex 本机关键验收任务书和 IPC/main-side 合同。',
  'Renderer 仍不接收 absolutePath 或 file://。',
];

function getModel(): Mvp92CopyOnlySampleReadinessModel {
  const copyReadiness = importCopyExecutionReadinessService.getModel().sampleResults[0];
  const samplePreview = buildCopyOnlySampleReadinessPreview(copyReadiness);

  return {
    version: '0.130.0-mvp92',
    title: 'MVP-92 copy only 最小真实样本准备',
    summary: '为下一步真实 copy only 导入准备 Codex 本机验收任务书、一次性样本目录要求、copy-only IPC 合同和 main-side 安全合同；当前仍不执行任何文件操作。',
    baseline: '0.129.0-mvp91',
    sampleReadinessCards: [
      {id: 'sample-directory', title: '最小样本目录', detail: '第一轮真实 copy 只能使用一次性沙盒样本，不碰正式资源库。', tone: 'emerald'},
      {id: 'codex-gate', title: 'Codex 关键验收', detail: '真实 copy 前让 Codex 在本机检查命令、UI、操作日志和目标目录。', tone: 'sky'},
      {id: 'ipc-contract', title: 'copy-only IPC 合同', detail: '先定义 preflight / confirm / execute / progress / result / cancel，不急于实现。', tone: 'violet'},
      {id: 'main-side-only', title: 'main 侧执行', detail: '未来真实路径解析和 copy 必须在 Electron main / worker 侧执行。', tone: 'amber'},
      {id: 'execution-blocked', title: '本轮不执行', detail: 'MVP92 只做任务书和合同，执行按钮继续禁用。', tone: 'rose'},
    ],
    minimalSampleRequirements: [
      {id: 'disposable-source', title: '一次性来源目录', requirement: '准备 C:/YangKuraSandbox/import-source/RJ01588893 - copy-only-sample', reason: '第一轮真实 copy 必须可随时删除重建，不能直接拿正式资源库。', required: true},
      {id: 'disposable-target', title: '一次性目标目录', requirement: '准备 C:/YangKuraSandbox/import-target，允许程序在其下创建目标子目录。', reason: '目标目录必须与正式仓库隔离，避免误写正式库。', required: true},
      {id: 'sample-files', title: '样本文件结构', requirement: '至少包含 2 个音频、1 个 cover、1 个 lrc、1 个 txt。', reason: '覆盖 audio/image/subtitle/text 分类和路径规划。', required: true},
      {id: 'no-real-media-root', title: '禁止正式库首测', requirement: '不得使用 E:/MediaLibrary、E:/arsm 或真实下载目录作为首轮 copy 样本。', reason: '先验证执行器安全，再扩大到真实资源。', required: true},
      {id: 'clean-before-after', title: '前后状态可比对', requirement: '运行前记录来源/目标文件数量，运行后比对目标新增文件与源文件保留情况。', reason: '确认 copy only 没有删除、移动、覆盖源文件。', required: true},
    ],
    codexValidationSteps: [
      {id: 'npm-ci', phase: 'prepare', title: '安装依赖', command: 'npm ci --ignore-scripts', expected: '依赖安装通过；仅允许 Electron moderate audit 提示。', blocksRealCopy: true},
      {id: 'lint', phase: 'verify', title: '类型检查', command: 'npm run lint', expected: 'TypeScript 通过。', blocksRealCopy: true},
      {id: 'build-electron', phase: 'verify', title: 'Electron 构建', command: 'npm run build:electron', expected: 'Electron TypeScript 构建通过。', blocksRealCopy: true},
      {id: 'verify-mvp92', phase: 'verify', title: 'MVP92 专项验证', command: 'npm run verify:mvp92-copy-sample-readiness', expected: '专项 verifier 通过。', blocksRealCopy: true},
      {id: 'verify-all', phase: 'verify', title: '完整验证链', command: 'npm run verify:all', expected: '完整 verifier 通过；如超时需分段补跑。', blocksRealCopy: true},
      {id: 'manual-sample', phase: 'manual-check', title: '人工检查样本目录', expected: '确认样本目录是 disposable sandbox，不是正式媒体库。', blocksRealCopy: true},
      {id: 'report', phase: 'report', title: '提交验收报告', expected: '报告命令结果、样本路径、未跟踪文件、是否可进入真实 copy 实现。', blocksRealCopy: true},
    ],
    ipcContracts: [
      {channel: 'yang-kura:import:copy-only:preflight', direction: 'renderer-to-main', purpose: '请求 main 侧检查 token、目标目录、冲突和空间条件。', rendererPayloadRule: '只传 taskId/rootToken/relativePath/targetRelativePath。', mainSideRule: 'main 侧解析真实路径并返回可读预检结果。', implementedInMvp92: false},
      {channel: 'yang-kura:import:copy-only:confirm', direction: 'renderer-to-main', purpose: '提交用户二次确认和确认文本。', rendererPayloadRule: '必须包含 confirmationText，不包含 absolutePath。', mainSideRule: 'main 侧记录确认快照，但不得自动执行。', implementedInMvp92: false},
      {channel: 'yang-kura:import:copy-only:execute', direction: 'renderer-to-main', purpose: '未来触发 copy-only 执行。', rendererPayloadRule: '必须引用已通过 preflight 的 operationPlanId。', mainSideRule: '只允许 copy，不允许 move/delete/rename，不允许 overwrite。', implementedInMvp92: false},
      {channel: 'yang-kura:import:copy-only:progress', direction: 'main-to-renderer', purpose: '返回进度事件。', rendererPayloadRule: 'Renderer 只读显示，不自行推断真实路径。', mainSideRule: 'progress 只返回相对路径、状态和错误码。', implementedInMvp92: false},
      {channel: 'yang-kura:import:copy-only:result', direction: 'main-to-renderer', purpose: '返回 copied/skipped/failed 汇总和 OperationLog。', rendererPayloadRule: 'UI 显示结果并提示用户复查。', mainSideRule: 'result 必须包含 OperationLog，不得隐藏失败项。', implementedInMvp92: false},
      {channel: 'yang-kura:import:copy-only:cancel', direction: 'renderer-to-main', purpose: '未来取消排队中的 copy-only 任务。', rendererPayloadRule: '只传 operationPlanId。', mainSideRule: '不得中断正在写入中的单文件操作；取消后返回 skipped。', implementedInMvp92: false},
    ],
    mainSideCopyContracts: [
      {id: 'token-map', title: 'Token Map', detail: '真实 absolutePath 只保存在 main 侧 token map；Renderer 只能拿 token 和显示名。', requiredBeforeImplementation: true},
      {id: 'path-containment', title: '路径 containment', detail: '源/目标真实路径必须限制在用户选择的 source/target root 内，拒绝 .. 逃逸。', requiredBeforeImplementation: true},
      {id: 'mkdir-target', title: '目标目录创建', detail: '只允许在目标 root 下创建规划目录；创建前再次检查目标不在正式库禁区。', requiredBeforeImplementation: true},
      {id: 'copy-only', title: 'copy only', detail: '只复制文件，保留源文件；同名目标默认 skip/fail，不覆盖。', requiredBeforeImplementation: true},
      {id: 'operation-log', title: 'OperationLog', detail: '每个文件写入 planned/copied/skipped/failed 事件；失败必须带 errorCode。', requiredBeforeImplementation: true},
      {id: 'post-verify', title: '执行后复核', detail: '执行后比对目标文件数量和大小；不把结果自动写进 library-index.json。', requiredBeforeImplementation: true},
    ],
    samplePreview,
    guardedBoundaries: GUARDED_BOUNDARIES,
    nextSteps: ['MVP93 copy-only main-side stub / still disabled', 'Codex 本机关键验收', 'MVP94 最小真实 copy 样本执行', 'SQLite 评估继续后置'],
  };
}

export const copyOnlySampleReadinessService = {
  getModel,
  getToneClassName,
  buildCopyOnlySampleReadinessPreview,
};
