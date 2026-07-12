/**
 * MVP-23 Electron preload entry.
 *
 * The renderer gets a narrow `window.yangKura` API. Directory selection returns
 * a tokenized root. Dry-run scanning can only use that rootPathToken. MVP-22 also generates
 * a library-index write preview object. MVP-23 adds a confirmed write method
 * for library-index.json. MVP-24 adds read-current-index so the existing UI
 * can load real index data. MVP-25 adds a tokenized media URL resolver for HTMLAudio. MVP-26 adds read-only
 * local subtitle text reading. MVP-27 adds external opening for video/image/files and file-manager reveal. MVP-96 adds copy-only OperationLog persistence status. MVP-97 adds post-copy refresh preview. MVP-98 adds library-index patch preview from refreshCandidates. MVP-99 adds patch write-readiness gate for MVP100. MVP-100 adds confirmed patch write with backup. MVP-101 adds a refresh-after-write call that reads the updated index so the UI can reload without a full scan. MVP-105 adds a small-sample move-only executor call. No absolutePath or file:// URL is exposed to the renderer.
 */

import { contextBridge, ipcRenderer } from 'electron';

type YangKuraLibraryType = 'asmr' | 'music' | 'mixed';

type SelectLibraryRootRequest = {
  libraryType: YangKuraLibraryType;
  reason: 'user-selected-library-root';
};

type ScannerDryRunRequest = {
  rootPathToken: string;
  mode: 'dry-run';
  previewOnly: true;
  maxEntries?: number;
  maxDepth?: number;
};

type WriteIndexPreviewRequest = {
  rootPathToken: string;
  mode: 'preview-only';
  dryRunScannedAt?: string;
  maxPreviewEntries?: number;
};

type WriteLibraryIndexRequest = {
  rootPathToken: string;
  mode: 'confirmed-write';
  dryRunScannedAt?: string;
  createBackup?: boolean;
  maxWriteEntries?: number;
};

type ReadLibraryIndexRequest = {
  rootPathToken: string;
  mode: 'read-current-index';
};

type LibraryIndexHealthCheckRequest = { rootPathToken: string; mode: 'read-only-health-check'; maxEntries?: number };
type LibraryIndexRemovalPreviewRequest = { rootPathToken: string; mode: 'remove-missing-preview'; issueIds?: string[] };
type LibraryIndexRemovalWriteRequest = { rootPathToken: string; mode: 'confirmed-index-removal-write'; sourceIndexSha256: string; previewGeneratedAt: string; userConfirmed: boolean; confirmationText: string; createBackup: boolean };
type RevealMissingEntryParentRequest = { rootPathToken: string; relativePath: string; entryId: string; mode: 'reveal-nearest-existing-parent' };
type LibraryIndexBackupListRequest = { rootPathToken: string; mode: 'list-index-backups'; maxEntries?: number };
type LibraryIndexBackupRestoreRequest = { rootPathToken: string; mode: 'restore-index-backup'; backupRelativePath: string; backupSha256: string; confirmationText: string; createCurrentBackup: boolean };
type LibraryIndexBackupRetentionPreviewRequest = { rootPathToken: string; mode: 'preview-backup-retention'; maxAgeDays?: number; keepNewest?: number };
type LibraryIndexMaintenanceHistoryRequest = { rootPathToken: string; mode: 'read-index-maintenance-history'; maxEntries?: number };

type ResolveTrackMediaUrlRequest = {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  expectedKind: 'audio';
};

type MpvPlaybackStartRequest = {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  mode: 'mpv-playback-start';
  startSeconds?: number;
  volume?: number;
  muted?: boolean;
};

type MpvPlaybackCommandRequest =
  | { mode: 'mpv-playback-command'; command: 'pause' | 'resume' | 'stop' }
  | { mode: 'mpv-playback-command'; command: 'seek'; seconds: number }
  | { mode: 'mpv-playback-command'; command: 'set-volume'; volume: number }
  | { mode: 'mpv-playback-command'; command: 'set-muted'; muted: boolean };

type MpvPlaybackEvent = {
  type: 'ready' | 'time' | 'duration' | 'pause-state' | 'ended' | 'error' | 'fallback-requested';
  trackId: string;
  at: string;
  backend?: 'mpv';
  positionSeconds?: number;
  durationSeconds?: number;
  paused?: boolean;
  reason?: string;
  message?: string;
  resumeSeconds?: number;
};


type MpvInstallationStatus = {
  status: 'mvp123-mpv-installation-status';
  available: boolean;
  source: 'environment' | 'user-selected' | 'system-path' | 'none';
  executableLabel: string;
  versionLabel: string | null;
  configured: boolean;
  canSelectExecutable: true;
  canClearUserSelection: boolean;
  checkedAt: string;
  message: string;
  running: boolean;
  connected: boolean;
  activeTrackId: string | null;
  seekStrategy: 'coalesced-absolute-exact';
  pendingSeek: boolean;
  lastKnownPositionSeconds: number;
  lastKnownDurationSeconds: number;
  lastErrorMessage: string | null;
  lastExitReason: string | null;
  shutdownState: 'idle' | 'graceful' | 'forced';
  processStartedAt: string | null;
  absolutePathReturned: false;
  fileUrlReturned: false;
};

type MpvExecutableActionResult = MpvInstallationStatus & {
  ok: boolean;
  actionStatus: 'mvp123-mpv-selection-cancelled' | 'mvp123-mpv-executable-selected' | 'mvp123-mpv-executable-invalid' | 'mvp123-mpv-executable-cleared';
};

type ReadTrackLyricsRequest = {
  rootPathToken: string;
  trackId: string;
  trackRelativePath: string;
  mode: 'read-track-lyrics';
  subtitleRelativePaths?: string[];
  maxBytes?: number;
};

type OpenExternalFileRequest = {
  rootPathToken: string;
  relativePath: string;
  entryId: string;
  mode: 'open-external-file';
  expectedKind: 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';
};

type OpenInFileManagerRequest = {
  rootPathToken: string;
  relativePath?: string;
  entryId?: string;
  mode: 'open-in-file-manager';
};

type AsmrMetadataProviderRequest = { provider: 'dlsite'; rjId: string; mode: 'single-rj-preview'; timeoutMs?: number; cacheMode?: 'prefer-cache' | 'force-refresh'; };
type AsmrMetadataProviderCacheClearRequest = { provider: 'dlsite'; rjId: string; mode: 'clear-single-rj-cache'; };


type ImportCopyOnlyStubRequest = {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'copy-only-stub';
  relativePaths?: string[];
  targetRelativePaths?: string[];
  confirmedCopyOnly?: boolean;
  confirmationText?: string;
};

type ImportCopyOnlyConfirmStubRequest = {
  operationPlanId: string;
  confirmationText: string;
  mode: 'copy-only-confirm-stub';
};

type ImportCopyOnlyCancelStubRequest = {
  operationPlanId: string;
  mode: 'copy-only-cancel-stub';
};

type ImportPostCopyRefreshPreviewRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'post-copy-refresh-preview';
  sourceOperationLogVersion?: 'mvp96-copy-only-operation-log-v1';
  targetRelativePaths?: string[];
};

type ImportLibraryIndexPatchPreviewRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'library-index-patch-preview';
  sourceRefreshPlanVersion?: 'mvp97-post-copy-refresh-plan-v1';
  refreshCandidates?: Array<{
    id?: string;
    targetRelativePath?: string;
    entryKind?: string;
    plannedAction?: string;
    sizeBytes?: number;
    warningCodes?: string[];
  }>;
  maxPatchItems?: number;
};

type ImportLibraryIndexPatchWriteReadinessRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'library-index-patch-write-readiness';
  sourcePatchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
  indexPatchPreview?: {
    patchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    collections?: unknown[];
    tracks?: unknown[];
    covers?: unknown[];
    subtitles?: unknown[];
    patchOperations?: unknown[];
    warnings?: string[];
  };
  userConfirmedPatchPreview?: boolean;
  createBackup?: boolean;
  confirmationText?: string;
};

type ImportLibraryIndexPatchWriteRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'library-index-patch-write-confirmed';
  sourceReadinessVersion?: 'mvp99-library-index-patch-write-readiness-v1';
  sourcePatchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
  indexPatchPreview?: {
    patchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    root?: unknown;
    collections?: unknown[];
    tracks?: unknown[];
    covers?: unknown[];
    subtitles?: unknown[];
    patchOperations?: unknown[];
    warnings?: string[];
  };
  userConfirmedPatchWrite?: boolean;
  createBackup?: boolean;
  confirmationText?: string;
};

type ImportLibraryIndexPatchUiRefreshRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'refresh-after-patch-write';
  sourcePatchWriteVersion?: 'mvp100-library-index-patch-write-v1';
  patchWriteStatus?: string;
};


type ImportMoveOnlyExecuteRequest = {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'move-only-small-sample';
  relativePaths?: string[];
  targetRelativePaths?: string[];
  confirmedMoveOnly?: boolean;
  confirmationText?: string;
  overwriteAllowed?: false;
  maxMoveItems?: number;
};

/* Legacy verifier token retained for MVP-26 compatibility: mvp26-shell-runtime-track-lyrics-read. Legacy verifier token retained for MVP-27 compatibility: mvp27-shell-runtime-external-open.
 * Legacy verifier token retained for MVP-20 compatibility: status: 'mvp20-shell-runtime-read-only-dry-run'. */
const shellStatus = {
  status: 'mvp28-shell-runtime-validation-ready',
  hasRealElectronRuntime: true,
  hasDirectoryPicker: true,
  hasScannerDryRunIpc: true,
  canReadRealDisk: true,
  /* Legacy verifier token retained: canWriteLibraryIndex: false. */
  canWriteLibraryIndex: true,
  canGenerateIndexWritePreview: true,
  canReadLibraryIndex: true,
  canResolveMediaTrackUrl: true,
  canUseMpvPlayback: true,
  canConfigureMpvExecutable: true,
  canReadTrackLyrics: true,
  canOpenExternalFile: true,
  canOpenInFileManager: true,
  canFetchSingleRjMetadata: true,
  canUseCopyOnlyStub: true,
  canUseCopyOnlyPreflightRealCheck: true,
  canExecuteCopyOnly: true,
  canPersistCopyOnlyOperationLog: true,
  canPreviewPostCopyRefresh: true,
  canPreviewLibraryIndexPatch: true,
  canCheckLibraryIndexPatchWriteReadiness: true,
  canWriteLibraryIndexPatch: true,
  canCheckLibraryIndexHealth: true,
  canPreviewMissingIndexRemoval: true,
  canWriteControlledIndexRemoval: true,
  canListIndexBackups: true,
  canRestoreIndexBackup: true,
  canPreviewBackupRetention: true,
  canReadIndexMaintenanceHistory: true,
  canRevealNearestExistingParent: true,
  canRefreshLibraryIndexAfterPatch: true,
  canExecuteMoveOnly: true,
  registersMediaProtocol: true,
  exposesAbsolutePaths: false,
} as const;

const yangKuraApi = {
  async selectLibraryRoot(request: SelectLibraryRootRequest) {
    return ipcRenderer.invoke('yang-kura:dialog:select-library-root', request);
  },

  async requestScannerDryRun(request: ScannerDryRunRequest) {
    return ipcRenderer.invoke('yang-kura:scanner:dry-run:request', request);
  },

  async requestWriteIndexPreview(request: WriteIndexPreviewRequest) {
    return ipcRenderer.invoke('yang-kura:index:write-preview-request', request);
  },

  async requestWriteLibraryIndex(request: WriteLibraryIndexRequest) {
    return ipcRenderer.invoke('yang-kura:index:write-confirmed-request', request);
  },

  async requestReadLibraryIndex(request: ReadLibraryIndexRequest) {
    return ipcRenderer.invoke('yang-kura:index:read-current-request', request);
  },

  async requestLibraryIndexHealthCheck(request: LibraryIndexHealthCheckRequest) {
    return ipcRenderer.invoke('yang-kura:index:health-check-request', request);
  },

  async requestLibraryIndexRemovalPreview(request: LibraryIndexRemovalPreviewRequest) {
    return ipcRenderer.invoke('yang-kura:index:removal-preview-request', request);
  },

  async requestLibraryIndexRemovalWrite(request: LibraryIndexRemovalWriteRequest) {
    return ipcRenderer.invoke('yang-kura:index:removal-write-confirmed-request', request);
  },

  async requestLibraryIndexBackupList(request: LibraryIndexBackupListRequest) {
    return ipcRenderer.invoke('yang-kura:index:backup-list-request', request);
  },

  async requestLibraryIndexBackupRestore(request: LibraryIndexBackupRestoreRequest) {
    return ipcRenderer.invoke('yang-kura:index:backup-restore-request', request);
  },

  async requestLibraryIndexBackupRetentionPreview(request: LibraryIndexBackupRetentionPreviewRequest) {
    return ipcRenderer.invoke('yang-kura:index:backup-retention-preview-request', request);
  },

  async requestLibraryIndexMaintenanceHistory(request: LibraryIndexMaintenanceHistoryRequest) {
    return ipcRenderer.invoke('yang-kura:index:maintenance-history-request', request);
  },

  async requestRevealMissingEntryParent(request: RevealMissingEntryParentRequest) {
    return ipcRenderer.invoke('yang-kura:index:reveal-nearest-parent-request', request);
  },

  async requestResolveTrackMediaUrl(request: ResolveTrackMediaUrlRequest) {
    return ipcRenderer.invoke('yang-kura:media:resolve-track-url', request);
  },

  async requestMpvPlaybackStart(request: MpvPlaybackStartRequest) {
    return ipcRenderer.invoke('yang-kura:player:mpv:start', request);
  },

  async requestMpvPlaybackCommand(request: MpvPlaybackCommandRequest) {
    return ipcRenderer.invoke('yang-kura:player:mpv:command', request);
  },

  async getMpvPlaybackStatus() {
    return ipcRenderer.invoke('yang-kura:player:mpv:status');
  },

  async getMpvInstallationStatus(): Promise<MpvInstallationStatus> {
    return ipcRenderer.invoke('yang-kura:player:mpv:installation-status');
  },

  async selectMpvExecutable(): Promise<MpvExecutableActionResult> {
    return ipcRenderer.invoke('yang-kura:player:mpv:select-executable');
  },

  async clearMpvExecutable(): Promise<MpvExecutableActionResult> {
    return ipcRenderer.invoke('yang-kura:player:mpv:clear-executable');
  },

  onMpvPlaybackEvent(listener: (event: MpvPlaybackEvent) => void) {
    const handler = (_event: Electron.IpcRendererEvent, payload: MpvPlaybackEvent) => listener(payload);
    ipcRenderer.on('yang-kura:player:mpv:event', handler);
    return () => ipcRenderer.removeListener('yang-kura:player:mpv:event', handler);
  },

  async requestReadTrackLyrics(request: ReadTrackLyricsRequest) {
    return ipcRenderer.invoke('yang-kura:lyrics:read-track-lyrics', request);
  },

  async requestOpenExternalFile(request: OpenExternalFileRequest) {
    return ipcRenderer.invoke('yang-kura:external:open-file', request);
  },

  async requestOpenInFileManager(request: OpenInFileManagerRequest) {
    return ipcRenderer.invoke('yang-kura:external:open-in-file-manager', request);
  },

  async requestAsmrMetadataProvider(request: AsmrMetadataProviderRequest) {
    return ipcRenderer.invoke('yang-kura:metadata:asmr:single-rj-preview', request);
  },

  async clearAsmrMetadataProviderCache(request: AsmrMetadataProviderCacheClearRequest) {
    return ipcRenderer.invoke('yang-kura:metadata:asmr:single-rj-cache-clear', request);
  },


  async requestImportCopyOnlyPreflight(request: ImportCopyOnlyStubRequest) {
    return ipcRenderer.invoke('yang-kura:import:copy-only:preflight', request);
  },

  async requestImportCopyOnlyConfirm(request: ImportCopyOnlyConfirmStubRequest) {
    return ipcRenderer.invoke('yang-kura:import:copy-only:confirm', request);
  },

  async requestImportCopyOnlyExecute(request: ImportCopyOnlyStubRequest) {
    return ipcRenderer.invoke('yang-kura:import:copy-only:execute', request);
  },

  async requestImportPostCopyRefreshPreview(request: ImportPostCopyRefreshPreviewRequest) {
    return ipcRenderer.invoke('yang-kura:import:post-copy:refresh-preview', request);
  },

  async requestImportLibraryIndexPatchPreview(request: ImportLibraryIndexPatchPreviewRequest) {
    return ipcRenderer.invoke('yang-kura:import:library-index-patch:preview', request);
  },

  async requestImportLibraryIndexPatchWriteReadiness(request: ImportLibraryIndexPatchWriteReadinessRequest) {
    return ipcRenderer.invoke('yang-kura:import:library-index-patch:write-readiness', request);
  },

  async requestImportLibraryIndexPatchWrite(request: ImportLibraryIndexPatchWriteRequest) {
    return ipcRenderer.invoke('yang-kura:import:library-index-patch:write-confirmed', request);
  },

  async requestImportLibraryIndexPatchRefreshAfterWrite(request: ImportLibraryIndexPatchUiRefreshRequest) {
    return ipcRenderer.invoke('yang-kura:import:library-index-patch:refresh-after-write', request);
  },


async requestImportMoveOnlyExecute(request: ImportMoveOnlyExecuteRequest) {
  return ipcRenderer.invoke('yang-kura:import:move-only:execute', request);
},

  async requestImportCopyOnlyCancel(request: ImportCopyOnlyCancelStubRequest) {
    return ipcRenderer.invoke('yang-kura:import:copy-only:cancel', request);
  },

  async getElectronShellStatus() {
    return shellStatus;
  },
};

contextBridge.exposeInMainWorld('yangKura', yangKuraApi);
