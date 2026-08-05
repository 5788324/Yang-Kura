import { libraryIndexPatchWriteService, type Mvp100PatchWriteResultPreview } from './libraryIndexPatchWriteService';

export type Mvp101RefreshTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp101RefreshCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp101RefreshTone;
}

export interface Mvp101RefreshRuntimeContract {
  channel: 'yang-kura:import:library-index-patch:refresh-after-write';
  mode: 'refresh-after-patch-write';
  source: 'mvp100-library-index-patch-write-complete';
  readsLibraryIndexJson: true;
  writesLibraryIndexJson: false;
  writesSQLite: false;
  fullScanTriggered: false;
  fileMutationPerformed: false;
  absolutePathAccepted: false;
  fileUrlAccepted: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
}

export interface Mvp101RefreshResultPreview {
  schemaVersion: 1;
  refreshVersion: 'mvp101-import-ui-refresh-after-patch-v1';
  sourcePatchWriteVersion: 'mvp100-library-index-patch-write-v1';
  mode: 'refresh-after-patch-write';
  operationPlanId: string;
  targetRootPathToken: string;
  readsLibraryIndexJson: true;
  storesRendererReadCache: true;
  dispatchesLibraryLoadedEvent: true;
  libraryUiRefreshExpected: true;
  scannerRunTriggered: false;
  sqliteWritten: false;
  fileMutationPerformed: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  indexRelativePath: 'library-index.json';
  expectedPatch: Mvp100PatchWriteResultPreview['expectedPatch'];
}

export interface Mvp101ImportUiRefreshModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cards: Mvp101RefreshCard[];
  runtimeContract: Mvp101RefreshRuntimeContract;
  resultPreview: Mvp101RefreshResultPreview;
  rendererStorage: {
    readCacheKey: 'yang_kura_last_read_library_index_result';
    patchWriteCacheKey: 'yang_kura_last_import_patch_write_result';
    refreshCacheKey: 'yang_kura_last_import_patch_refresh_result';
    eventName: 'yang-kura-library-index-loaded';
    sessionEventName: 'yang-kura-library-session-updated';
  };
  refreshSteps: string[];
  codexSmokeTest: string[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

function getToneClassName(tone: Mvp101RefreshTone): string {
  const classes: Record<Mvp101RefreshTone, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-50',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-50',
    zinc: 'border-white/10 bg-black/10 text-text-secondary',
  };
  return classes[tone];
}

function getModel(): Mvp101ImportUiRefreshModel {
  const patchWrite = libraryIndexPatchWriteService.getModel();
  const resultPreview = patchWrite.resultPreview;

  return {
    version: '0.139.0-mvp101',
    title: 'MVP-101 导入后刷新资源库 UI',
    summary: 'MVP100 已经能真实写入 library-index.json patch；MVP101 收口写入后的用户体验：读取当前 index，写入 renderer 缓存，触发已有 yang-kura-library-index-loaded 事件，让首页、音声库、音乐库、最近播放和资源库状态同步刷新。',
    baseline: '0.138.0-mvp100',
    cards: [
      { id: 'read-after-write', title: '写后读取', detail: 'copy-only patch 写入成功后，立即读取当前 library-index.json。', tone: 'emerald' },
      { id: 'reuse-existing-event', title: '复用现有刷新事件', detail: '继续使用 yang-kura-library-index-loaded，不引入第二套状态总线。', tone: 'sky' },
      { id: 'visible-result', title: '用户可见结果', detail: '展示新增/更新的 collection、track、cover、subtitle 数量。', tone: 'violet' },
      { id: 'codex-minimal', title: 'Codex 最小实测', detail: '只验证打包版导入后刷新，不消耗额度做全量代码审查。', tone: 'amber' },
    ],
    runtimeContract: {
      channel: 'yang-kura:import:library-index-patch:refresh-after-write',
      mode: 'refresh-after-patch-write',
      source: 'mvp100-library-index-patch-write-complete',
      readsLibraryIndexJson: true,
      writesLibraryIndexJson: false,
      writesSQLite: false,
      fullScanTriggered: false,
      fileMutationPerformed: false,
      absolutePathAccepted: false,
      fileUrlAccepted: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    resultPreview: {
      schemaVersion: 1,
      refreshVersion: 'mvp101-import-ui-refresh-after-patch-v1',
      sourcePatchWriteVersion: 'mvp100-library-index-patch-write-v1',
      mode: 'refresh-after-patch-write',
      operationPlanId: resultPreview.operationPlanId,
      targetRootPathToken: resultPreview.targetRootPathToken,
      readsLibraryIndexJson: true,
      storesRendererReadCache: true,
      dispatchesLibraryLoadedEvent: true,
      libraryUiRefreshExpected: true,
      scannerRunTriggered: false,
      sqliteWritten: false,
      fileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      indexRelativePath: 'library-index.json',
      expectedPatch: resultPreview.expectedPatch,
    },
    rendererStorage: {
      readCacheKey: 'yang_kura_last_read_library_index_result',
      patchWriteCacheKey: 'yang_kura_last_import_patch_write_result',
      refreshCacheKey: 'yang_kura_last_import_patch_refresh_result',
      eventName: 'yang-kura-library-index-loaded',
      sessionEventName: 'yang-kura-library-session-updated',
    },
    refreshSteps: [
      'MVP100 返回 mvp100-library-index-patch-write-complete 后，保存 sanitized patch write summary。',
      '调用 MVP101 refresh-after-write IPC；main 侧只读取当前 library-index.json，不扫描目录。',
      'Renderer 将 read result 写入 yang_kura_last_read_library_index_result。',
      'Renderer dispatch yang-kura-library-index-loaded；App 复用既有映射逻辑刷新音声库 / 音乐库 / 首页状态。',
      '导入页显示新增/更新数量与 backup 相对路径，用户无需再去设置页手动读取。',
    ],
    codexSmokeTest: [
      '启动打包版或 desktop:preview。',
      '选择一个小样本目标库，确认已有 library-index.json。',
      '执行 copy-only 导入 → MVP100 patch 写入。',
      '确认 MVP101 自动读取 index，首页资源库状态、音声库/音乐库数量随即更新。',
      '确认没有 absolutePath / file:// 暴露，没有 SQLite，没有全量扫描，没有 move/delete/rename。',
    ],
    guardedBoundaries: [
      'MVP101 只读取 library-index.json，不再次写 index。',
      'MVP101 不执行 copy/move/delete/rename，不触发全量扫描。',
      'MVP101 不接 SQLite、不接下载器、不接元数据 Provider、不接 mpv。',
      'Renderer 仍只接收 tokenized index，不接收 absolutePath 或 file://。',
      '个人项目边界继续按“可回退、少浪费、必要确认”执行，不堆企业级审批。',
    ],
    nextSteps: ['MVP102 copy-only import closeout', 'MVP103 move-only strategy', 'MVP104 importer daily UI cleanup'],
  };
}


async function refreshAfterPatchWrite(
  api: NonNullable<Window['yangKura']>,
  patchWriteResult: YangKuraLibraryIndexPatchWriteResult,
): Promise<YangKuraImportLibraryIndexPatchUiRefreshResult> {
  if (!patchWriteResult.ok || patchWriteResult.status !== 'mvp100-library-index-patch-write-complete') {
    return {
      ok: false,
      status: 'mvp101-import-ui-refresh-after-patch-write-not-complete',
      operationPlanId: patchWriteResult.operationPlanId,
      targetRootPathToken: patchWriteResult.targetRootPathToken,
      indexReadPerformed: false,
      rendererRefreshExpected: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      fileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: 'MVP100 patch 写入未成功完成；Renderer 不触发资源库刷新。',
      safetyNotes: ['mvp101-import-ui-refresh-after-patch', 'patch write not complete'],
    };
  }

  try {
    localStorage.setItem('yang_kura_last_import_patch_write_result', JSON.stringify(patchWriteResult));
  } catch {
    // localStorage may be unavailable; the refresh IPC result still returns to the caller.
  }

  const refreshResult = await api.requestImportLibraryIndexPatchRefreshAfterWrite({
    operationPlanId: patchWriteResult.operationPlanId,
    targetRootPathToken: patchWriteResult.targetRootPathToken,
    mode: 'refresh-after-patch-write',
    sourcePatchWriteVersion: 'mvp100-library-index-patch-write-v1',
    patchWriteStatus: patchWriteResult.status,
  });

  try {
    localStorage.setItem('yang_kura_last_import_patch_refresh_result', JSON.stringify(refreshResult));
    if (refreshResult.ok && refreshResult.readResult?.ok) {
      localStorage.setItem('yang_kura_last_read_library_index_result', JSON.stringify(refreshResult.readResult));
      window.dispatchEvent(new Event('yang-kura-library-index-loaded'));
    }
  } catch {
    // localStorage may be unavailable; UI caller can still inspect refreshResult.
  }

  return refreshResult;
}

export const importPatchUiRefreshService = {
  getModel,
  getToneClassName,
  refreshAfterPatchWrite,
};
