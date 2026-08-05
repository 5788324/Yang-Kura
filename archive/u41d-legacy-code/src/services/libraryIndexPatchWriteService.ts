import { libraryIndexPatchWriteReadinessService, type Mvp99PatchWriteReadinessPreview } from './libraryIndexPatchWriteReadinessService';

export type Mvp100PatchWriteTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp100PatchWriteCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp100PatchWriteTone;
}

export interface Mvp100PatchWriteContract {
  channel: 'yang-kura:import:library-index-patch:write-confirmed';
  mode: 'library-index-patch-write-confirmed';
  source: 'mvp99-readiness-plus-mvp98-indexPatchPreview';
  requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
  confirmationRequired: true;
  backupRequired: true;
  writesLibraryIndexJson: true;
  writesSQLite: false;
  fullScanTriggered: false;
  deletesExistingItems: false;
  absolutePathAccepted: false;
  fileUrlAccepted: false;
}

export interface Mvp100PatchWriteResultPreview {
  schemaVersion: 1;
  patchWriteVersion: 'mvp100-library-index-patch-write-v1';
  sourceReadinessVersion: 'mvp99-library-index-patch-write-readiness-v1';
  sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1';
  mode: 'library-index-patch-write-confirmed';
  operationPlanId: string;
  targetRootPathToken: string;
  indexPatchWritten: true;
  libraryIndexWritten: true;
  backupCreated: true;
  scannerRunTriggered: false;
  sqliteWritten: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  indexRelativePath: 'library-index.json';
  backupRelativePathPattern: 'library-index.backup.before-mvp100-*.json';
  expectedPatch: Mvp99PatchWriteReadinessPreview['expectedPatch'];
}

export interface Mvp100PatchWriteRule {
  id: string;
  title: string;
  detail: string;
  required: boolean;
  enforced: boolean;
}

export interface Mvp100LibraryIndexPatchWriteModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp100PatchWriteCard[];
  requestContract: Mvp100PatchWriteContract;
  resultPreview: Mvp100PatchWriteResultPreview;
  writeRules: Mvp100PatchWriteRule[];
  failureHandling: string[];
  personalProjectPolicy: {
    privatePersonalUse: true;
    nonCommercial: true;
    notSharedOrOpenSource: true;
    boundaryNote: string;
    speedNote: string;
  };
  guardedBoundaries: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp100PatchWriteTone): string {
  const classes: Record<Mvp100PatchWriteTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp100LibraryIndexPatchWriteModel {
  const readiness = libraryIndexPatchWriteReadinessService.getModel();
  const ready = readiness.readinessPreview;

  return {
    version: '0.138.0-mvp100',
    title: 'MVP-100 library-index patch 真实写入',
    summary: '开始执行 copy-only 导入后的真实 index patch：读取现有 library-index.json，先创建同目录备份，只合并 collections/tracks/covers/subtitles 新增或更新项，不删除旧数据，不接 SQLite。',
    baseline: '0.137.0-mvp99',
    cards: [
      { id: 'real-write', title: '真实写入', detail: 'MVP100 允许在 token root 内写回 library-index.json。', tone: 'emerald' },
      { id: 'backup-first', title: '先备份', detail: '写入前创建 library-index.backup.before-mvp100-*.json。', tone: 'amber' },
      { id: 'merge-only', title: '只合并', detail: '只追加/更新 copy-only patch 项，不删除既有集合、音轨、封面或字幕。', tone: 'sky' },
      { id: 'still-local-json', title: 'JSON 优先', detail: 'SQLite、下载器、元数据、mpv 继续后置。', tone: 'violet' },
    ],
    requestContract: {
      channel: 'yang-kura:import:library-index-patch:write-confirmed',
      mode: 'library-index-patch-write-confirmed',
      source: 'mvp99-readiness-plus-mvp98-indexPatchPreview',
      requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      confirmationRequired: true,
      backupRequired: true,
      writesLibraryIndexJson: true,
      writesSQLite: false,
      fullScanTriggered: false,
      deletesExistingItems: false,
      absolutePathAccepted: false,
      fileUrlAccepted: false,
    },
    resultPreview: {
      schemaVersion: 1,
      patchWriteVersion: 'mvp100-library-index-patch-write-v1',
      sourceReadinessVersion: 'mvp99-library-index-patch-write-readiness-v1',
      sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
      mode: 'library-index-patch-write-confirmed',
      operationPlanId: ready.operationPlanId,
      targetRootPathToken: ready.targetRootPathToken,
      indexPatchWritten: true,
      libraryIndexWritten: true,
      backupCreated: true,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      indexRelativePath: 'library-index.json',
      backupRelativePathPattern: 'library-index.backup.before-mvp100-*.json',
      expectedPatch: ready.expectedPatch,
    },
    writeRules: [
      { id: 'read-existing-index', title: '先读取现有 index', detail: '现有 library-index.json 不存在或解析失败时，不写入。', required: true, enforced: true },
      { id: 'backup-before-write', title: '备份先行', detail: 'backup 使用 wx 写入，不覆盖已有备份。', required: true, enforced: true },
      { id: 'merge-only', title: '只合并 patch', detail: '按 id upsert collections/tracks/covers/subtitles，不删除既有用户数据。', required: true, enforced: true },
      { id: 'sanitize', title: '安全内容检查', detail: '发现 absolutePath/fileUrl/file:// 立即拒绝写入。', required: true, enforced: true },
      { id: 'readback-verify', title: '写后读回校验', detail: '写入后读取并校验 index 结构，返回 sanitized summary。', required: true, enforced: true },
    ],
    failureHandling: [
      '现有 library-index.json 缺失：返回 missing-index，不创建新 index。',
      '现有 index 解析失败：返回 read-index-failed，不覆盖文件。',
      'patch 中出现 absolutePath/file://：返回 unsafe-content，不写入。',
      'backup 创建失败：返回 write-error，不写 index。',
      '写后校验失败：返回 verify-failed，并保留 backupRelativePath 供用户恢复。',
    ],
    personalProjectPolicy: {
      privatePersonalUse: true,
      nonCommercial: true,
      notSharedOrOpenSource: true,
      boundaryNote: '个人本地项目允许受控写入，不再用企业级审批拖慢进度；核心仍是备份、确认、失败不静默覆盖。',
      speedNote: 'MVP100 直接进入真实 patch 写入，结束 copy-only 导入链路长期卡在预览阶段的问题。',
    },
    guardedBoundaries: [
      'MVP100 只写 library-index.json patch，不写 SQLite。',
      'MVP100 不执行 copy/move/delete/rename，不触发全量扫描。',
      'MVP100 不删除旧 collection/track/cover/subtitle。',
      'Renderer 不接收 absolutePath 或 file://。',
      '下载器、元数据 Provider、mpv 继续后置。',
    ],
    nextSteps: ['MVP101 import UI refresh after patch', 'MVP102 copy-only import closeout', 'MVP103 move-only strategy after copy-only closeout'],
  };
}

export const libraryIndexPatchWriteService = {
  getModel,
  getToneClassName,
};
