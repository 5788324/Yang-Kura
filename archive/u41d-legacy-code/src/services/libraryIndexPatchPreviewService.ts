import { copyOnlyPostCopyRefreshService, type Mvp97RefreshCandidatePreview } from './copyOnlyPostCopyRefreshService';

export type Mvp98PatchPreviewTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp98PatchPreviewCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp98PatchPreviewTone;
}

export interface Mvp98PatchOperationPreview {
  id: string;
  operation: 'upsert-collection' | 'upsert-track' | 'attach-cover' | 'attach-subtitle' | 'warn-only';
  targetRelativePath: string;
  targetBucket: 'collections' | 'tracks' | 'covers' | 'subtitles' | 'warnings';
  previewOnly: true;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp98IndexPatchPreviewSummary {
  schemaVersion: 1;
  patchPreviewVersion: 'mvp98-library-index-patch-preview-v1';
  sourceRefreshPlanVersion: 'mvp97-post-copy-refresh-plan-v1';
  operationPlanId: string;
  mode: 'library-index-patch-preview';
  previewOnly: true;
  targetRootPathToken: string;
  consumedRefreshCandidateCount: number;
  collectionPatchCount: number;
  trackPatchCount: number;
  coverPatchCount: number;
  subtitlePatchCount: number;
  warningCount: number;
  libraryIndexWritten: false;
  scannerRunTriggered: false;
  sqliteWritten: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp98LibraryIndexPatchPreviewModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  personalProjectPolicy: {
    privatePersonalUse: true;
    nonCommercial: true;
    notSharedOrOpenSource: true;
    planningNote: string;
    relaxedBoundaryNote: string;
  };
  cards: Mvp98PatchPreviewCard[];
  requestContract: {
    channel: 'yang-kura:import:library-index-patch:preview';
    mode: 'library-index-patch-preview';
    source: 'mvp97-refresh-candidates';
    previewOnly: true;
    acceptsRefreshCandidatesOnly: true;
    absolutePathAccepted: false;
    fileUrlAccepted: false;
  };
  sampleRefreshCandidates: Mvp97RefreshCandidatePreview[];
  samplePatchPreview: Mvp98IndexPatchPreviewSummary;
  samplePatchOperations: Mvp98PatchOperationPreview[];
  patchPreviewRules: Array<{ id: string; title: string; detail: string; enforced: boolean }>;
  guardedBoundaries: string[];
  speedUpPlan: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp98PatchPreviewTone): string {
  const classes: Record<Mvp98PatchPreviewTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp98LibraryIndexPatchPreviewModel {
  const mvp97 = copyOnlyPostCopyRefreshService.getModel();
  const operationPlanId = mvp97.sampleRefreshPlan.operationPlanId;
  const targetRootPathToken = mvp97.sampleRefreshPlan.targetRootPathToken;
  const samplePatchOperations: Mvp98PatchOperationPreview[] = [
    {
      id: 'mvp98-patch-collection-01',
      operation: 'upsert-collection',
      targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき',
      targetBucket: 'collections',
      previewOnly: true,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    {
      id: 'mvp98-patch-track-01',
      operation: 'upsert-track',
      targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3',
      targetBucket: 'tracks',
      previewOnly: true,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    {
      id: 'mvp98-patch-subtitle-01',
      operation: 'attach-subtitle',
      targetRelativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc',
      targetBucket: 'subtitles',
      previewOnly: true,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
  ];

  return {
    version: '0.136.0-mvp98',
    title: 'MVP-98 library-index patch 预览',
    summary: '把 MVP97 refreshCandidates 转成 indexPatchPreview：只预览 collections / tracks / covers / subtitles 会如何补进 library-index.json；本轮仍不写 index。',
    baseline: '0.135.0-mvp97',
    personalProjectPolicy: {
      privatePersonalUse: true,
      nonCommercial: true,
      notSharedOrOpenSource: true,
      planningNote: 'Yang-Kura 是个人本地项目，不分享、不商业化、不作为开源发布目标。',
      relaxedBoundaryNote: '后续安全边界按“可预览、可确认、可回退、有日志、不乱删”执行；不再为企业级多用户/公网/合规审计写过重流程，避免浪费开发轮次。',
    },
    cards: [
      { id: 'patch-preview', title: 'Patch 预览', detail: '从 refreshCandidates 生成 collections/tracks/covers/subtitles 写入预览。', tone: 'emerald' },
      { id: 'no-write', title: '仍不写入', detail: 'indexPatchWriteAllowed=false，libraryIndexWritten=false。', tone: 'rose' },
      { id: 'faster-path', title: '进度提速', detail: 'MVP98 后直接进入确认写入，不再继续堆过重合同。', tone: 'amber' },
      { id: 'personal-boundary', title: '个人项目边界', detail: '按个人本地可回退原则简化流程，不做企业级防线。', tone: 'sky' },
    ],
    requestContract: {
      channel: 'yang-kura:import:library-index-patch:preview',
      mode: 'library-index-patch-preview',
      source: 'mvp97-refresh-candidates',
      previewOnly: true,
      acceptsRefreshCandidatesOnly: true,
      absolutePathAccepted: false,
      fileUrlAccepted: false,
    },
    sampleRefreshCandidates: mvp97.sampleCandidates,
    samplePatchPreview: {
      schemaVersion: 1,
      patchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
      sourceRefreshPlanVersion: 'mvp97-post-copy-refresh-plan-v1',
      operationPlanId,
      mode: 'library-index-patch-preview',
      previewOnly: true,
      targetRootPathToken,
      consumedRefreshCandidateCount: mvp97.sampleCandidates.length,
      collectionPatchCount: 1,
      trackPatchCount: 1,
      coverPatchCount: 0,
      subtitlePatchCount: 1,
      warningCount: 0,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    samplePatchOperations,
    patchPreviewRules: [
      { id: 'source-refresh-candidates', title: '输入只吃 MVP97 候选', detail: 'MVP98 不重新扫描，只消费 targetRootPathToken + refreshCandidates。', enforced: true },
      { id: 'patch-shape', title: '输出 patch 形状', detail: '只说明 collections/tracks/covers/subtitles 会如何变化。', enforced: true },
      { id: 'no-write', title: '不真实写入', detail: '不写 library-index.json，不接 SQLite，不写 OperationLog。', enforced: true },
      { id: 'token-only', title: '路径仍 token 化', detail: '不返回 absolutePath，不返回 file://。', enforced: true },
    ],
    guardedBoundaries: [
      'MVP98 不写 library-index.json，只生成 indexPatchPreview。',
      'MVP98 不执行 copy/move/delete/rename。',
      'MVP98 不接 SQLite，不触发全量扫描。',
      'Renderer 只看到 token、relativePath、patch 操作和统计。',
      '个人项目边界已放宽：后续不再额外堆企业级审批，但真实写入仍需预览、确认、备份。',
    ],
    speedUpPlan: [
      'MVP99 直接做确认写入准备，不再拆过多纯文档 MVP。',
      'MVP100 做真实 patch 写入 + backup，范围只覆盖 copy-only 新增项。',
      'SQLite、下载器、mpv、元数据继续后置，避免打断导入闭环。',
    ],
    nextSteps: ['MVP99 confirmed index patch write readiness', 'MVP100 write library-index.json patch with backup', 'MVP101 import UI refresh after patch'],
  };
}

export const libraryIndexPatchPreviewService = {
  getModel,
  getToneClassName,
};
