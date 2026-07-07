import { copyOnlySampleReadinessService, type Mvp92CopyOnlyIpcContract } from './copyOnlySampleReadinessService';

export type Mvp93CopyStubTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';
export type Mvp93CopyStubStatus = 'stubbed-blocked' | 'typed-only' | 'main-side-only' | 'renderer-token-only';

export interface Mvp93CopyStubCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp93CopyStubTone;
}

export interface Mvp93CopyOnlyStubChannel {
  channel: string;
  methodName: string;
  status: Mvp93CopyStubStatus;
  purpose: string;
  rendererPayloadRule: string;
  mainReturnRule: string;
  executesRealCopy: false;
}

export interface Mvp93CopyOnlyStubBlockedResult {
  ok: false;
  status: 'mvp93-copy-only-stub-blocked';
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
  executeAllowed: false;
  copiedCount: 0;
  skippedCount: number;
  failedCount: number;
  message: string;
  safetyNotes: string[];
}

export interface Mvp93CopyOnlyStubPreflightPreview {
  operationPlanId: string;
  taskId: string;
  sourceRootToken: string;
  targetRootToken: string;
  plannedFileCount: number;
  preflightStatus: 'blocked-stub-only';
  executeButtonState: 'disabled';
  blockedResult: Mvp93CopyOnlyStubBlockedResult;
}

export interface Mvp93MainSideStubGuard {
  id: string;
  title: string;
  detail: string;
  enforcedByStub: boolean;
}

export interface Mvp93CodexPromptLine {
  id: string;
  prompt: string;
  sendToCodexNow: false;
  reason: string;
}

export interface Mvp93CopyOnlyMainSideStubModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp93CopyStubCard[];
  stubChannels: Mvp93CopyOnlyStubChannel[];
  preflightPreview: Mvp93CopyOnlyStubPreflightPreview;
  mainSideGuards: Mvp93MainSideStubGuard[];
  codexPromptLines: Mvp93CodexPromptLine[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp93CopyStubTone): string {
  const classes: Record<Mvp93CopyStubTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

const SAFETY_NOTES = [
  'MVP93 copy-only main-side stub 始终返回 blocked，不执行真实复制。',
  'Renderer 只能传 rootPathToken / targetRootPathToken / relativePath，不传 absolutePath 或 file://。',
  '真实路径解析仍属于 Electron main 侧；本轮不会创建目录或写文件。',
  'copy-only execute 在 MVP93 中保持 disabled-preview-only。',
];

export function buildCopyOnlyStubBlockedResult(params: {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  plannedFileCount: number;
}): Mvp93CopyOnlyStubBlockedResult {
  return {
    ok: false,
    status: 'mvp93-copy-only-stub-blocked',
    operationPlanId: params.operationPlanId,
    rootPathToken: params.rootPathToken,
    targetRootPathToken: params.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: false,
    copiedCount: 0,
    skippedCount: params.plannedFileCount,
    failedCount: 0,
    message: 'MVP93 只注册 copy-only main-side stub 合同，真实 copy 仍被阻断。',
    safetyNotes: SAFETY_NOTES,
  };
}

function mapIpcContract(contract: Mvp92CopyOnlyIpcContract): Mvp93CopyOnlyStubChannel {
  const methodName = contract.channel
    .replace('yang-kura:import:copy-only:', 'requestImportCopyOnly')
    .replace(/(^|:|-)([a-z])/g, (_, _sep: string, letter: string) => letter.toUpperCase());
  return {
    channel: contract.channel,
    methodName,
    status: contract.channel.endsWith(':execute') ? 'stubbed-blocked' : 'typed-only',
    purpose: contract.purpose,
    rendererPayloadRule: contract.rendererPayloadRule,
    mainReturnRule: contract.channel.endsWith(':execute')
      ? 'main 侧必须返回 mvp93-copy-only-stub-blocked，不执行真实 copy。'
      : 'main 侧只返回 mock preflight / confirmation / cancel 状态，不写文件。',
    executesRealCopy: false,
  };
}

function getModel(): Mvp93CopyOnlyMainSideStubModel {
  const previousModel = copyOnlySampleReadinessService.getModel();
  const sourcePreview = previousModel.samplePreview;
  const plannedFileCount = sourcePreview.plannedCopyCount + sourcePreview.plannedSkipCount + sourcePreview.plannedFailureCount;
  const blockedResult = buildCopyOnlyStubBlockedResult({
    operationPlanId: 'mvp93-copy-only-stub-operation-plan',
    rootPathToken: 'source-root-token-mvp93-sample',
    targetRootPathToken: 'target-root-token-mvp93-sample',
    plannedFileCount,
  });

  return {
    version: '0.131.0-mvp93',
    title: 'MVP-93 copy-only main-side stub',
    summary: '在 Electron main/preload/type 层冻结 copy-only stub 通道和 blocked result；Renderer 继续只能传 token 与相对路径，真实 copy 执行仍禁用。',
    baseline: '0.130.0-mvp92',
    cards: [
      {id: 'main-stub', title: 'main-side stub', detail: '注册 copy-only 通道名称和返回结构，但 execute 始终 blocked。', tone: 'emerald'},
      {id: 'preload-types', title: 'preload 类型', detail: 'window.yangKura 增加 copy-only stub 方法类型，不暴露真实路径。', tone: 'sky'},
      {id: 'renderer-token', title: 'Renderer token only', detail: 'UI 只允许 token + relativePath；absolutePath / file:// 仍禁止。', tone: 'violet'},
      {id: 'blocked-execute', title: '执行阻断', detail: 'MVP93 不执行 copy，不创建目录，不写 OperationLog。', tone: 'rose'},
      {id: 'codex-later', title: 'Codex 后置', detail: '当前不用 Codex；真实 copy 前再暂停并发验收提示词。', tone: 'amber'},
    ],
    stubChannels: previousModel.ipcContracts.map(mapIpcContract),
    preflightPreview: {
      operationPlanId: blockedResult.operationPlanId,
      taskId: sourcePreview.sourceTaskId,
      sourceRootToken: blockedResult.rootPathToken,
      targetRootToken: blockedResult.targetRootPathToken,
      plannedFileCount,
      preflightStatus: 'blocked-stub-only',
      executeButtonState: 'disabled',
      blockedResult,
    },
    mainSideGuards: [
      {id: 'no-copy-call', title: '不调用复制 API', detail: 'main-side stub 不得调用任何真实文件复制 API。', enforcedByStub: true},
      {id: 'no-directory-create', title: '不创建目录', detail: 'MVP93 不创建目标目录，只返回 blocked preview。', enforcedByStub: true},
      {id: 'no-index-write', title: '不写 index', detail: 'copy-only stub 不写 library-index.json，也不写 OperationLog 文件。', enforcedByStub: true},
      {id: 'no-path-leak', title: '不泄漏真实路径', detail: '所有返回值都包含 absolutePathReturned=false 与 fileUrlReturned=false。', enforcedByStub: true},
      {id: 'button-disabled', title: '按钮保持禁用', detail: '导入器页面真实 copy 按钮仍 disabled。', enforcedByStub: true},
      {id: 'codex-before-real-copy', title: '真实 copy 前 Codex', detail: '下一次如果要进入真实执行器，先暂停开发并让 Codex 本机验收。', enforcedByStub: true},
    ],
    codexPromptLines: [
      {id: 'not-now', prompt: '当前 MVP93 不需要 Codex 介入，因为没有真实 copy。', sendToCodexNow: false, reason: '只做 stub 和 blocked result。'},
      {id: 'next-real-copy', prompt: '进入真实 copy 前，请 Codex 检查 Electron main/preload copy-only handler、样本目录、验证命令和未跟踪文件。', sendToCodexNow: false, reason: 'MVP94 或更后续才需要。'},
    ],
    guardedBoundaries: [
      'MVP93 不执行真实 copy。',
      'MVP93 不创建目录，不写 OperationLog，不写 library-index.json。',
      'MVP93 不移动、删除、重命名、覆盖任何真实文件。',
      'MVP93 不读取真实导入源文件内容，不计算 hash。',
      'Renderer 不接收 absolutePath 或 file://。',
      '真实 copy 前必须暂停并交给 Codex 做本机关键验收。',
    ],
    nextSteps: ['MVP94 copy-only real preflight with Codex gate', '真实 copy 执行器仍需二次确认', 'move / SQLite / mpv 继续后置'],
  };
}

export const copyOnlyMainSideStubService = {
  getModel,
  getToneClassName,
  buildCopyOnlyStubBlockedResult,
};
