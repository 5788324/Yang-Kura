import type { LibraryType } from '../ipc/contracts.js';

export type SelectLibraryRootRequest = {
  libraryType: LibraryType;
  reason: 'user-selected-library-root';
};

export type ScannerDryRunRequest = {
  rootPathToken: string;
  mode: 'dry-run';
  previewOnly: true;
  maxEntries?: number;
  maxDepth?: number;
};

export type WriteIndexPreviewRequest = {
  rootPathToken: string;
  mode: 'preview-only';
  dryRunScannedAt?: string;
  maxPreviewEntries?: number;
};

export type WriteLibraryIndexRequest = {
  rootPathToken: string;
  mode: 'confirmed-write';
  dryRunScannedAt?: string;
  createBackup?: boolean;
  maxWriteEntries?: number;
};

export type ReadLibraryIndexRequest = {
  rootPathToken: string;
  mode: 'read-current-index';
};

export type LibraryIndexHealthCheckRequest = {
  rootPathToken: string;
  mode: 'read-only-health-check';
  maxEntries?: number;
};

export type LibraryIndexRemovalPreviewRequest = {
  rootPathToken: string;
  mode: 'remove-missing-preview';
  issueIds?: string[];
};

export type LibraryIndexRemovalWriteRequest = {
  rootPathToken: string;
  mode: 'confirmed-index-removal-write';
  sourceIndexSha256: string;
  previewGeneratedAt: string;
  userConfirmed: boolean;
  confirmationText: string;
  createBackup: boolean;
};

export type RevealMissingEntryParentRequest = {
  rootPathToken: string;
  relativePath: string;
  entryId: string;
  mode: 'reveal-nearest-existing-parent';
};

export type LibraryIndexBackupListRequest = {
  rootPathToken: string;
  mode: 'list-index-backups';
  maxEntries?: number;
};

export type LibraryIndexBackupRestoreRequest = {
  rootPathToken: string;
  mode: 'restore-index-backup';
  backupRelativePath: string;
  backupSha256: string;
  confirmationText: string;
  createCurrentBackup: boolean;
};

export type LibraryIndexBackupRetentionPreviewRequest = {
  rootPathToken: string;
  mode: 'preview-backup-retention';
  maxAgeDays?: number;
  keepNewest?: number;
};

export type LibraryIndexMaintenanceHistoryRequest = {
  rootPathToken: string;
  mode: 'read-index-maintenance-history';
  maxEntries?: number;
};

export type ResolveTrackMediaUrlRequest = {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  expectedKind: 'audio';
};

export type MpvPlaybackStartRequest = {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  mode: 'mpv-playback-start';
  startSeconds?: number;
  volume?: number;
  muted?: boolean;
};

export type MpvPlaybackCommandRequest =
  | { mode: 'mpv-playback-command'; command: 'pause' | 'resume' | 'stop' }
  | { mode: 'mpv-playback-command'; command: 'seek'; seconds: number }
  | { mode: 'mpv-playback-command'; command: 'set-volume'; volume: number }
  | { mode: 'mpv-playback-command'; command: 'set-muted'; muted: boolean };

export type MpvPlaybackEvent = {
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

export type MpvInstallationStatus = {
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

export type MpvExecutableActionResult = MpvInstallationStatus & {
  ok: boolean;
  actionStatus:
    | 'mvp123-mpv-selection-cancelled'
    | 'mvp123-mpv-executable-selected'
    | 'mvp123-mpv-executable-invalid'
    | 'mvp123-mpv-executable-cleared';
};

export type ReadTrackLyricsRequest = {
  rootPathToken: string;
  trackId: string;
  trackRelativePath: string;
  mode: 'read-track-lyrics';
  subtitleRelativePaths?: string[];
  maxBytes?: number;
};

export type OpenExternalFileRequest = {
  rootPathToken: string;
  relativePath: string;
  entryId: string;
  mode: 'open-external-file';
  expectedKind: 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';
};

export type OpenInFileManagerRequest = {
  rootPathToken: string;
  relativePath?: string;
  entryId?: string;
  mode: 'open-in-file-manager';
};

export type AsmrMetadataProviderRequest = {
  provider: 'dlsite';
  rjId: string;
  mode: 'single-rj-preview';
  timeoutMs?: number;
  cacheMode?: 'prefer-cache' | 'force-refresh';
};

export type AsmrMetadataProviderCacheClearRequest = {
  provider: 'dlsite';
  rjId: string;
  mode: 'clear-single-rj-cache';
};

export type ImportCopyOnlyStubRequest = {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'copy-only-stub';
  relativePaths?: string[];
  targetRelativePaths?: string[];
  confirmedCopyOnly?: boolean;
  confirmationText?: string;
};

export type ImportCopyOnlyConfirmStubRequest = {
  operationPlanId: string;
  confirmationText: string;
  mode: 'copy-only-confirm-stub';
};

export type ImportCopyOnlyCancelStubRequest = {
  operationPlanId: string;
  mode: 'copy-only-cancel-stub';
};

export type ImportPostCopyRefreshPreviewRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'post-copy-refresh-preview';
  sourceOperationLogVersion?: 'mvp96-copy-only-operation-log-v1';
  targetRelativePaths?: string[];
};

export type ImportLibraryIndexPatchPreviewRequest = {
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

export type ImportLibraryIndexPatchWriteReadinessRequest = {
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

export type ImportLibraryIndexPatchWriteRequest = {
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

export type ImportLibraryIndexPatchUiRefreshRequest = {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'refresh-after-patch-write';
  sourcePatchWriteVersion?: 'mvp100-library-index-patch-write-v1';
  patchWriteStatus?: string;
};

export type ImportMoveOnlyExecuteRequest = {
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
