import { copyOnlyMainSideStubService } from './copyOnlyMainSideStubService';

export type Mvp94PreflightTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';
export type Mvp94PreflightCheckStatus = 'pass' | 'warning' | 'blocked' | 'pending-main-runtime';

export interface Mvp94PreflightCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp94PreflightTone;
}

export interface Mvp94PreflightFileCheckPreview {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  sourceExists: boolean;
  sourceIsFile: boolean;
  targetExists: boolean;
  targetParentExists: boolean;
  blockedReasonCodes: string[];
}

export interface Mvp94MainSidePreflightContract {
  id: string;
  title: string;
  detail: string;
  status: Mvp94PreflightCheckStatus;
}

export interface Mvp94PreflightResultPreview {
  ok: true;
  status: 'mvp94-copy-only-preflight-real-check-complete';
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  absolutePathReturned: false;
  fileUrlReturned: false;
  executeAllowed: false;
  copyAllowed: false;
  copiedCount: 0;
  createdDirectoryCount: 0;
  checkedFileCount: number;
  sourceMissingCount: number;
  targetExistingCount: number;
  targetParentMissingCount: number;
  fileChecks: Mvp94PreflightFileCheckPreview[];
  message: string;
  safetyNotes: string[];
}

export interface Mvp94CopyOnlyPreflightRealCheckModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp94PreflightCard[];
  mainSideContracts: Mvp94MainSidePreflightContract[];
  sampleResult: Mvp94PreflightResultPreview;
  blockedExecutionRules: string[];
  codexGate: {
    sendToCodexNow: false;
    reason: string;
    nextCodexTrigger: string;
  };
  nextSteps: string[];
}

function getToneClassName(tone: Mvp94PreflightTone): string {
  const classes: Record<Mvp94PreflightTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp94CopyOnlyPreflightRealCheckModel {
  const previousModel = copyOnlyMainSideStubService.getModel();
  return {
    version: '0.132.0-mvp94',
    title: 'MVP-94 copy-only preflight 真实化',
    summary: 'Electron main 侧 copy-only preflight 可以检查 token、source relativePath、target relativePath、源文件存在性、目标冲突和父目录状态；execute 仍然 disabled，不 copy、不 mkdir、不写日志。',
    baseline: '0.131.0-mvp93',
    cards: [
      {id: 'real-preflight', title: '真实预检', detail: 'preflight handler 不再只是 stub；可在 main 侧只读检查源/目标状态。', tone: 'emerald'},
      {id: 'token-only', title: 'token-only', detail: 'Renderer 仍只传 rootPathToken / targetRootPathToken / relativePath。', tone: 'sky'},
      {id: 'no-copy', title: '不执行 copy', detail: 'MVP94 不调用 fs.copyFile，不创建目录，不写 OperationLog。', tone: 'rose'},
      {id: 'target-conflict', title: '目标冲突', detail: '只返回 targetExists / parentExists / blockedReasonCodes。', tone: 'amber'},
      {id: 'codex-later', title: 'Codex 后置', detail: '真实 copy 执行器前再暂停交给 Codex。', tone: 'violet'},
    ],
    mainSideContracts: [
      {id: 'validate-source-token', title: '校验源 token', detail: 'rootPathToken 必须存在于 Electron main 侧 token map。', status: 'pass'},
      {id: 'validate-target-token', title: '校验目标 token', detail: 'targetRootPathToken 必须存在于 Electron main 侧 token map。', status: 'pass'},
      {id: 'resolve-safe-source', title: '安全解析源相对路径', detail: '拒绝绝对路径、..、file://、空路径和越界路径。', status: 'pass'},
      {id: 'resolve-safe-target', title: '安全解析目标相对路径', detail: '目标路径同样只允许 token 根目录内的相对路径。', status: 'pass'},
      {id: 'stat-only', title: '只读 stat', detail: '只允许 fs.stat / access 级别预检，不创建或修改任何文件。', status: 'pass'},
      {id: 'execute-disabled', title: '执行禁用', detail: 'preflight 成功也必须 executeAllowed=false / copyAllowed=false。', status: 'blocked'},
    ],
    sampleResult: {
      ok: true,
      status: 'mvp94-copy-only-preflight-real-check-complete',
      operationPlanId: previousModel.preflightPreview.operationPlanId.replace('mvp93', 'mvp94'),
      rootPathToken: previousModel.preflightPreview.sourceRootToken,
      targetRootPathToken: previousModel.preflightPreview.targetRootToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      createdDirectoryCount: 0,
      checkedFileCount: 3,
      sourceMissingCount: 0,
      targetExistingCount: 1,
      targetParentMissingCount: 1,
      fileChecks: [
        {id: 'track-01', sourceRelativePath: 'RJ01588893/01_本編.mp3', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3', sourceExists: true, sourceIsFile: true, targetExists: false, targetParentExists: true, blockedReasonCodes: []},
        {id: 'cover', sourceRelativePath: 'RJ01588893/cover.jpg', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg', sourceExists: true, sourceIsFile: true, targetExists: true, targetParentExists: true, blockedReasonCodes: ['target-exists']},
        {id: 'lyric', sourceRelativePath: 'RJ01588893/01_本編.zh.lrc', targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc', sourceExists: true, sourceIsFile: true, targetExists: false, targetParentExists: false, blockedReasonCodes: ['target-parent-missing-preview-only']},
      ],
      message: 'MVP94 preflight 可返回真实只读检查报告，但仍不允许执行 copy。',
      safetyNotes: ['no fs.copyFile', 'no mkdir', 'no OperationLog write', 'no absolutePath returned', 'no file:// returned'],
    },
    blockedExecutionRules: [
      'preflight 成功也不能自动进入 execute。',
      'execute handler 继续返回 blocked。',
      '不创建目标目录；只返回 targetParentExists。',
      '不覆盖同名文件；只返回 targetExists。',
      '不落盘 OperationLog；只展示 preview。',
      'Renderer 不获得 absolutePath 或 file://。',
    ],
    codexGate: {
      sendToCodexNow: false,
      reason: 'MVP94 仍是只读预检，不执行真实 copy。',
      nextCodexTrigger: '下一步如果要调用 fs.copyFile / mkdir / 写 OperationLog，必须暂停开发并让 Codex 做本机 gate。',
    },
    nextSteps: ['MVP95 copy-only real executor gate with Codex', '真实 copy 执行器仍需二次确认', 'move / SQLite / mpv 继续后置'],
  };
}

export const copyOnlyPreflightRealCheckService = {
  getModel,
  getToneClassName,
};
