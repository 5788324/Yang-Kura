import { copyOnlyOperationLogService, type Mvp96OperationLogEntryPreview } from './copyOnlyOperationLogService';

export type Mvp97PostCopyRefreshTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp97PostCopyRefreshCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp97PostCopyRefreshTone;
}

export interface Mvp97RefreshCandidatePreview {
  id: string;
  targetRelativePath: string;
  entryKind: 'audio' | 'video' | 'cover' | 'image' | 'subtitle' | 'text' | 'archive' | 'other';
  plannedAction: 'include-track' | 'attach-cover' | 'attach-subtitle' | 'warn-only';
  sizeBytes: number;
  warningCodes: string[];
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp97IndexRefreshPlanPreview {
  schemaVersion: 1;
  refreshPlanVersion: 'mvp97-post-copy-refresh-plan-v1';
  operationPlanId: string;
  sourceOperationLogVersion: 'mvp96-copy-only-operation-log-v1';
  mode: 'post-copy-refresh-preview';
  previewOnly: true;
  targetRootPathToken: string;
  candidateCount: number;
  audioCount: number;
  coverCount: number;
  subtitleCount: number;
  warningCount: number;
  collectionCandidateRelativePaths: string[];
  libraryIndexWritten: false;
  scannerRunTriggered: false;
  sqliteWritten: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp97PostCopyRefreshModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp97PostCopyRefreshCard[];
  requestContract: {
    channel: 'yang-kura:import:post-copy:refresh-preview';
    mode: 'post-copy-refresh-preview';
    source: 'copy-only-operation-log';
    targetRelativePathsOnly: true;
    absolutePathAccepted: false;
    fileUrlAccepted: false;
  };
  sampleOperationLog: Mvp96OperationLogEntryPreview;
  sampleRefreshPlan: Mvp97IndexRefreshPlanPreview;
  sampleCandidates: Mvp97RefreshCandidatePreview[];
  refreshGateRules: Array<{ id: string; title: string; detail: string; enforced: boolean }>;
  guardedBoundaries: string[];
  codexGate: {
    sendToCodexNow: true;
    reason: string;
    requiredAfterBuild: string;
  };
  nextSteps: string[];
}

function getToneClassName(tone: Mvp97PostCopyRefreshTone): string {
  const classes: Record<Mvp97PostCopyRefreshTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp97PostCopyRefreshModel {
  const operationLog = copyOnlyOperationLogService.getModel().sampleLogEntry;
  const sampleCandidates: Mvp97RefreshCandidatePreview[] = [
    {
      id: 'mvp97-refresh-track-01',
      targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3',
      entryKind: 'audio',
      plannedAction: 'include-track',
      sizeBytes: 73400320,
      warningCodes: [],
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    {
      id: 'mvp97-refresh-lyric-01',
      targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc',
      entryKind: 'subtitle',
      plannedAction: 'attach-subtitle',
      sizeBytes: 4096,
      warningCodes: [],
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
  ];
  const sampleRefreshPlan: Mvp97IndexRefreshPlanPreview = {
    schemaVersion: 1,
    refreshPlanVersion: 'mvp97-post-copy-refresh-plan-v1',
    operationPlanId: operationLog.operationPlanId,
    sourceOperationLogVersion: operationLog.operationLogVersion,
    mode: 'post-copy-refresh-preview',
    previewOnly: true,
    targetRootPathToken: operationLog.targetRootPathToken,
    candidateCount: sampleCandidates.length,
    audioCount: 1,
    coverCount: 0,
    subtitleCount: 1,
    warningCount: 0,
    collectionCandidateRelativePaths: ['ASMR/RJ01588893 - 雨音耳かき'],
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
  };

  return {
    version: '0.135.0-mvp97',
    title: 'MVP-97 copy 后入库刷新预览 / scanner gate',
    summary: '把 MVP96 copy-only OperationLog 转换成 post-copy refresh plan：main 侧只读检查目标相对路径，生成可扫描候选和入库刷新预览；仍不写 library-index.json。',
    baseline: '0.134.0-mvp96',
    cards: [
      { id: 'refresh-preview', title: '刷新预览', detail: '从 copied targetRelativePaths 生成 refresh plan。', tone: 'emerald' },
      { id: 'main-readonly', title: 'main 侧只读', detail: '只 stat 已复制目标文件，不写 index。', tone: 'sky' },
      { id: 'candidate-map', title: '候选映射', detail: '按 audio/cover/subtitle/text 分类，给后续 index patch 使用。', tone: 'violet' },
      { id: 'index-blocked', title: '入库仍阻断', detail: 'libraryIndexWritten=false，scannerRunTriggered=false。', tone: 'rose' },
      { id: 'codex-gate', title: '本机验收', detail: '需要确认日志→刷新预览不泄漏绝对路径。', tone: 'amber' },
    ],
    requestContract: {
      channel: 'yang-kura:import:post-copy:refresh-preview',
      mode: 'post-copy-refresh-preview',
      source: 'copy-only-operation-log',
      targetRelativePathsOnly: true,
      absolutePathAccepted: false,
      fileUrlAccepted: false,
    },
    sampleOperationLog: operationLog,
    sampleRefreshPlan,
    sampleCandidates,
    refreshGateRules: [
      { id: 'operation-log-source', title: '来自 OperationLog', detail: '只接受 operationPlanId、targetRootPathToken、targetRelativePaths；不接受真实路径。', enforced: true },
      { id: 'target-token', title: '目标 token root', detail: '所有目标相对路径必须解析在 targetRootPathToken 下。', enforced: true },
      { id: 'readonly-stat', title: '只读 stat', detail: '允许 fs.stat 检查目标文件状态；不允许 writeFile / appendFile / copyFile。', enforced: true },
      { id: 'index-block', title: '入库阻断', detail: '只生成 indexRefreshPlan preview，不写 library-index.json。', enforced: true },
      { id: 'scanner-gate', title: '扫描门禁', detail: '后续扫描/写 index 必须另开 MVP 和 Codex gate。', enforced: true },
    ],
    guardedBoundaries: [
      'MVP97 不执行 copy/move/delete/rename。',
      'MVP97 不写 import-operation-log.jsonl，只消费 MVP96 的结果。',
      'MVP97 不写 library-index.json，不接 SQLite，不触发全量扫描。',
      'Renderer 只接收 token、targetRelativePath、分类和计数。',
      '返回结果必须保持 absolutePathReturned=false / fileUrlReturned=false。',
    ],
    codexGate: {
      sendToCodexNow: true,
      reason: 'MVP97 新增 post-copy refresh preview IPC，需要 Codex 确认它只读、不写 index、不返回 absolutePath/file://。',
      requiredAfterBuild: '用 MVP96 copy 样本生成 targetRelativePaths，调用 refresh preview，检查返回候选和 plan；确认 library-index.json 未生成/未修改。',
    },
    nextSteps: ['Codex MVP97 refresh preview 验收', 'MVP98 library-index patch preview', 'MVP99 confirmed index merge gate'],
  };
}

export const copyOnlyPostCopyRefreshService = {
  getModel,
  getToneClassName,
};
