import { copyOnlyExecutorService } from './copyOnlyExecutorService';
import { copyOnlyOperationLogService } from './copyOnlyOperationLogService';
import { copyOnlyPostCopyRefreshService } from './copyOnlyPostCopyRefreshService';
import { libraryIndexPatchPreviewService } from './libraryIndexPatchPreviewService';
import { libraryIndexPatchWriteReadinessService } from './libraryIndexPatchWriteReadinessService';
import { libraryIndexPatchWriteService } from './libraryIndexPatchWriteService';
import { importPatchUiRefreshService } from './importPatchUiRefreshService';

export type Mvp102CloseoutTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp102CloseoutCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp102CloseoutTone;
}

export interface Mvp102CloseoutStage {
  id: string;
  mvp: string;
  title: string;
  status: 'complete' | 'requires-codex-smoke-test' | 'postponed';
  summary: string;
  output: string;
}

export interface Mvp102CopyOnlyImportCloseoutResultPreview {
  schemaVersion: 1;
  closeoutVersion: 'mvp102-copy-only-import-closeout-v1';
  mode: 'copy-only-import-closeout';
  baseline: '0.139.0-mvp101';
  closedRange: 'MVP95-MVP101';
  importChainClosed: true;
  userFacingMvpComplete: true;
  codexSmokeTestRecommended: true;
  libraryIndexJsonWriteAlreadyImplemented: true;
  libraryIndexPatchWriteVersion: 'mvp100-library-index-patch-write-v1';
  uiRefreshVersion: 'mvp101-import-ui-refresh-after-patch-v1';
  copyOperationLogWritten: true;
  backupRequired: true;
  scannerRunTriggered: false;
  sqliteWritten: false;
  downloaderTouched: false;
  metadataProviderTouched: false;
  mpvTouched: false;
  moveDeleteRenameTouched: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  nextRecommendedMvp: 'MVP103 move-only strategy or importer daily UI cleanup';
}

export interface Mvp102CopyOnlyImportCloseoutModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp102CloseoutCard[];
  closeoutResult: Mvp102CopyOnlyImportCloseoutResultPreview;
  completedStages: Mvp102CloseoutStage[];
  acceptanceChecklist: string[];
  codexPrompt: string[];
  guardedBoundaries: string[];
  nextOptions: string[];
}

function getToneClassName(tone: Mvp102CloseoutTone): string {
  const classes: Record<Mvp102CloseoutTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp102CopyOnlyImportCloseoutModel {
  const copyExecutor = copyOnlyExecutorService.getModel();
  const operationLog = copyOnlyOperationLogService.getModel();
  const postCopyRefresh = copyOnlyPostCopyRefreshService.getModel();
  const patchPreview = libraryIndexPatchPreviewService.getModel();
  const writeReadiness = libraryIndexPatchWriteReadinessService.getModel();
  const patchWrite = libraryIndexPatchWriteService.getModel();
  const uiRefresh = importPatchUiRefreshService.getModel();

  return {
    version: '0.140.0-mvp102',
    title: 'MVP-102 copy-only 导入闭环收口',
    summary: 'MVP95 到 MVP101 已经形成 copy-only 导入闭环：复制文件、记录 OperationLog、生成 post-copy refresh preview、预览 index patch、确认写入准备、备份后写入 library-index.json、写入后刷新 UI。本轮不新增危险文件操作，只把这条链路收口为可交给 Codex 做最小实机验收的完整阶段。',
    baseline: '0.139.0-mvp101',
    cards: [
      { id: 'closed-chain', title: '闭环完成', detail: 'MVP95-MVP101 被归档为 copy-only import closed chain。', tone: 'emerald' },
      { id: 'real-index-write', title: '真实 index 写入已具备', detail: `${patchWrite.resultPreview.patchWriteVersion} 已负责备份后 patch 写入。`, tone: 'sky' },
      { id: 'ui-refresh', title: 'UI 刷新已具备', detail: `${uiRefresh.resultPreview.refreshVersion} 复用现有 library loaded 事件刷新页面。`, tone: 'violet' },
      { id: 'codex-minimal', title: 'Codex 最小实测', detail: '只让 Codex 跑打包版/desktop:preview 的关键链路，不做长审查。', tone: 'amber' },
    ],
    closeoutResult: {
      schemaVersion: 1,
      closeoutVersion: 'mvp102-copy-only-import-closeout-v1',
      mode: 'copy-only-import-closeout',
      baseline: '0.139.0-mvp101',
      closedRange: 'MVP95-MVP101',
      importChainClosed: true,
      userFacingMvpComplete: true,
      codexSmokeTestRecommended: true,
      libraryIndexJsonWriteAlreadyImplemented: true,
      libraryIndexPatchWriteVersion: 'mvp100-library-index-patch-write-v1',
      uiRefreshVersion: 'mvp101-import-ui-refresh-after-patch-v1',
      copyOperationLogWritten: true,
      backupRequired: true,
      scannerRunTriggered: false,
      sqliteWritten: false,
      downloaderTouched: false,
      metadataProviderTouched: false,
      mpvTouched: false,
      moveDeleteRenameTouched: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      nextRecommendedMvp: 'MVP103 move-only strategy or importer daily UI cleanup',
    },
    completedStages: [
      { id: 'mvp95', mvp: 'MVP95', title: 'copy-only executor', status: 'complete', summary: copyExecutor.summary, output: 'real copy with COPYFILE_EXCL; no move/delete/rename' },
      { id: 'mvp96', mvp: 'MVP96', title: 'copy-only OperationLog', status: 'complete', summary: operationLog.summary, output: 'append-only operation log summary; sanitized renderer payload' },
      { id: 'mvp97', mvp: 'MVP97', title: 'post-copy refresh preview', status: 'complete', summary: postCopyRefresh.summary, output: postCopyRefresh.sampleRefreshPlan.refreshPlanVersion },
      { id: 'mvp98', mvp: 'MVP98', title: 'library-index patch preview', status: 'complete', summary: patchPreview.summary, output: patchPreview.samplePatchPreview.patchPreviewVersion },
      { id: 'mvp99', mvp: 'MVP99', title: 'write readiness gate', status: 'complete', summary: writeReadiness.summary, output: writeReadiness.readinessPreview.readinessVersion },
      { id: 'mvp100', mvp: 'MVP100', title: 'backup + patch write', status: 'complete', summary: patchWrite.summary, output: patchWrite.resultPreview.patchWriteVersion },
      { id: 'mvp101', mvp: 'MVP101', title: 'UI refresh after write', status: 'complete', summary: uiRefresh.summary, output: uiRefresh.resultPreview.refreshVersion },
      { id: 'codex-smoke', mvp: 'Codex', title: '最小实机验收', status: 'requires-codex-smoke-test', summary: '用户有 Codex 额度限制；只跑必要 Windows 实机链路，不做大范围代码重构。', output: 'manual smoke report' },
    ],
    acceptanceChecklist: [
      'copy-only 导入使用真实 copy，但仍不 move/delete/rename。',
      'OperationLog 记录 copy-only 执行摘要，Renderer 不接收 absolutePath/file://。',
      'post-copy refresh 只读检查 copy 后目标相对路径。',
      'index patch preview 明确 collections/tracks/covers/subtitles 将如何追加或关联。',
      '写入前必须二次确认、要求 backup，并保留原 index 可回退。',
      '写入后自动读取当前 index 并刷新首页、音声库、音乐库。',
      'SQLite、下载器、元数据 Provider、mpv、move-only 均不混入本闭环。',
    ],
    codexPrompt: [
      '你是 Codex，只做 Yang-Kura MVP102 copy-only 导入闭环最小实机验收，不做长代码审查，不重构。',
      '基线源码版本应为 0.140.0-mvp102。先确认 package.json version、Git 分支/HEAD、npm scripts 中存在 verify:mvp102-copy-only-import-closeout。',
      '使用仓库本地 npm cache：$env:NPM_CONFIG_CACHE = "$repoRoot\\.npm-cache"；npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$repoRoot\\.npm-cache"。',
      '运行：npm run lint；npm run build:electron；npm run verify:mvp99-library-index-patch-write-readiness；npm run verify:mvp100-library-index-patch-write；npm run verify:mvp101-import-ui-refresh-after-patch；npm run verify:mvp102-copy-only-import-closeout；npm run build。',
      '实机只测小样本：启动 desktop:preview 或打包版；选择一个已有 library-index.json 的测试库；执行 copy-only 导入；确认 backup 创建、library-index.json patch 写入、首页/音声库/音乐库刷新。',
      '重点检查：不暴露 absolutePath/file://；不接 SQLite；不触发全量扫描；不 move/delete/rename；失败时原 library-index.json 可保留。',
      '输出简短报告：版本、命令结果、实机步骤、PASS/FAIL、失败截图或日志位置、是否建议进入 MVP103。',
    ],
    guardedBoundaries: [
      'MVP102 不新增真实文件操作；它只收口 MVP95-MVP101 的既有链路。',
      'copy-only 已允许真实 copy；move/delete/rename 仍后置。',
      'MVP100 允许写 library-index.json，但必须 backup first；MVP102 不再次写。',
      'SQLite、下载器、元数据 Provider、mpv 不进入本阶段。',
      'Renderer 不返回 absolutePath 或 file://；用户界面只显示 token/displayName/相对路径和摘要。',
      '个人项目边界继续按“必要确认、备份、可回退、少浪费”执行。',
    ],
    nextOptions: [
      'MVP103：move-only strategy / 受控移动导入策略，仍先不执行 move。',
      'MVP104：导入器日常 UI 简化，把 MVP86-MVP102 工程区折叠到诊断/AI 维护区。',
      'MVP105：copy-only 导入批量体验增强，失败列表和导入结果摘要更好看。',
    ],
  };
}

export const copyOnlyImportCloseoutService = {
  getModel,
  getToneClassName,
};
