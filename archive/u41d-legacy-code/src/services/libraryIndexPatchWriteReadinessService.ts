import { libraryIndexPatchPreviewService, type Mvp98IndexPatchPreviewSummary } from './libraryIndexPatchPreviewService';

export type Mvp99WriteReadinessTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp99WriteReadinessCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp99WriteReadinessTone;
}

export interface Mvp99WriteReadinessChecklistItem {
  id: string;
  title: string;
  detail: string;
  required: boolean;
  ready: boolean;
}

export interface Mvp99BackupPlanPreview {
  backupRequired: true;
  backupFileNamePattern: 'library-index.backup.before-mvp100-*.json';
  backupLocation: 'same-directory-as-library-index';
  overwriteBackup: false;
  restoreNote: string;
}

export interface Mvp99PatchWriteReadinessPreview {
  schemaVersion: 1;
  readinessVersion: 'mvp99-library-index-patch-write-readiness-v1';
  sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1';
  mode: 'library-index-patch-write-readiness';
  previewOnly: true;
  operationPlanId: string;
  targetRootPathToken: string;
  requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
  confirmationRequired: true;
  backupRequired: true;
  readyForMvp100Write: true;
  writeExecutionAllowedInMvp99: false;
  libraryIndexWritten: false;
  scannerRunTriggered: false;
  sqliteWritten: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  expectedPatch: Pick<Mvp98IndexPatchPreviewSummary, 'collectionPatchCount' | 'trackPatchCount' | 'coverPatchCount' | 'subtitlePatchCount' | 'warningCount'>;
}

export interface Mvp99LibraryIndexPatchWriteReadinessModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp99WriteReadinessCard[];
  requestContract: {
    channel: 'yang-kura:import:library-index-patch:write-readiness';
    mode: 'library-index-patch-write-readiness';
    source: 'mvp98-indexPatchPreview';
    requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
    confirmationRequired: true;
    backupRequired: true;
    previewOnly: true;
    writeExecutionAllowedInMvp99: false;
    absolutePathAccepted: false;
    fileUrlAccepted: false;
  };
  readinessPreview: Mvp99PatchWriteReadinessPreview;
  backupPlan: Mvp99BackupPlanPreview;
  confirmationChecklist: Mvp99WriteReadinessChecklistItem[];
  personalProjectPolicy: {
    privatePersonalUse: true;
    nonCommercial: true;
    notSharedOrOpenSource: true;
    speedNote: string;
    boundaryNote: string;
  };
  guardedBoundaries: string[];
  mvp100ImplementationNotes: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp99WriteReadinessTone): string {
  const classes: Record<Mvp99WriteReadinessTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp99LibraryIndexPatchWriteReadinessModel {
  const mvp98 = libraryIndexPatchPreviewService.getModel();
  const patch = mvp98.samplePatchPreview;
  const readinessPreview: Mvp99PatchWriteReadinessPreview = {
    schemaVersion: 1,
    readinessVersion: 'mvp99-library-index-patch-write-readiness-v1',
    sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
    mode: 'library-index-patch-write-readiness',
    previewOnly: true,
    operationPlanId: patch.operationPlanId,
    targetRootPathToken: patch.targetRootPathToken,
    requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
    confirmationRequired: true,
    backupRequired: true,
    readyForMvp100Write: true,
    writeExecutionAllowedInMvp99: false,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    expectedPatch: {
      collectionPatchCount: patch.collectionPatchCount,
      trackPatchCount: patch.trackPatchCount,
      coverPatchCount: patch.coverPatchCount,
      subtitlePatchCount: patch.subtitlePatchCount,
      warningCount: patch.warningCount,
    },
  };

  return {
    version: '0.137.0-mvp99',
    title: 'MVP-99 index patch 写入准备门禁',
    summary: '为 MVP100 真实写入 library-index.json 做最后准备：确认 patch 来源、二次确认、备份策略、失败保留原 index；本轮只返回 readiness，不执行写入。',
    baseline: '0.136.0-mvp98',
    cards: [
      { id: 'readiness-gate', title: '写入门禁', detail: '确认 indexPatchPreview 可以进入 MVP100 写入流程。', tone: 'emerald' },
      { id: 'backup-required', title: '备份必需', detail: 'MVP100 写入前必须生成同目录 backup，且不覆盖旧备份。', tone: 'amber' },
      { id: 'still-no-write', title: '本轮不写', detail: 'MVP99 不写 library-index.json，只验证准备条件。', tone: 'rose' },
      { id: 'faster-next', title: '下一轮直写', detail: 'MVP100 直接做真实 patch 写入，不再继续堆纯合同。', tone: 'sky' },
    ],
    requestContract: {
      channel: 'yang-kura:import:library-index-patch:write-readiness',
      mode: 'library-index-patch-write-readiness',
      source: 'mvp98-indexPatchPreview',
      requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      confirmationRequired: true,
      backupRequired: true,
      previewOnly: true,
      writeExecutionAllowedInMvp99: false,
      absolutePathAccepted: false,
      fileUrlAccepted: false,
    },
    readinessPreview,
    backupPlan: {
      backupRequired: true,
      backupFileNamePattern: 'library-index.backup.before-mvp100-*.json',
      backupLocation: 'same-directory-as-library-index',
      overwriteBackup: false,
      restoreNote: 'MVP100 写入失败时必须保留原 library-index.json；恢复时优先让用户从备份文件手动选择，不做静默覆盖。',
    },
    confirmationChecklist: [
      { id: 'patch-preview-present', title: '已有 MVP98 patch 预览', detail: '必须来自 mvp98-library-index-patch-preview-v1。', required: true, ready: true },
      { id: 'tokenized-root', title: '目标库仍使用 token', detail: 'Renderer 不接收 absolutePath 或 file://。', required: true, ready: true },
      { id: 'confirmation-text', title: '二次确认文本', detail: 'MVP100 写入前要求确认文本 CONFIRM_WRITE_LIBRARY_INDEX_PATCH。', required: true, ready: true },
      { id: 'backup-before-write', title: '写入前备份', detail: '写入前必须创建不覆盖旧文件的 backup。', required: true, ready: true },
      { id: 'no-sqlite', title: 'SQLite 继续后置', detail: '本阶段只 patch Local JSON Index。', required: true, ready: true },
    ],
    personalProjectPolicy: {
      privatePersonalUse: true,
      nonCommercial: true,
      notSharedOrOpenSource: true,
      speedNote: '按个人本地项目提速：MVP99 只保留必要确认、备份、日志、失败保留原文件，不再套企业级审批流。',
      boundaryNote: '安全边界从“绝对禁止写入”转为“允许受控写入”：预览、确认、备份、失败不覆盖、日志可追踪。',
    },
    guardedBoundaries: [
      'MVP99 不写 library-index.json，不执行 fs.writeFile / fs.rename / fs.rm。',
      'MVP99 不接 SQLite，不触发全量扫描。',
      'MVP99 不执行 copy/move/delete/rename。',
      'MVP99 不向 Renderer 返回 absolutePath 或 file://。',
      'MVP100 才允许在 token root 内写入 library-index.json patch，且必须先备份。',
    ],
    mvp100ImplementationNotes: [
      'MVP100 写入范围只覆盖 copy-only 新增项生成的 patch。',
      '写入前读取现有 library-index.json；若解析失败，返回错误，不覆盖。',
      '写入前生成 backup；backup 文件名带时间戳，不覆盖已有 backup。',
      'patch 合并只追加/更新 collections/tracks/covers/subtitles，不删除既有用户数据。',
      '写入完成后返回 sanitized summary；仍不返回 absolutePath/file://。',
    ],
    nextSteps: ['MVP100 write library-index.json patch with backup', 'MVP101 import UI refresh after patch', 'MVP102 copy-only import closeout'],
  };
}

export const libraryIndexPatchWriteReadinessService = {
  getModel,
  getToneClassName,
};
