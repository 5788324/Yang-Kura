import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type IpcChannel } from './ipc/contracts.js';
import type {
  AsmrMetadataProviderCacheClearRequest,
  AsmrMetadataProviderRequest,
  ImportCopyOnlyCancelStubRequest,
  ImportCopyOnlyConfirmStubRequest,
  ImportCopyOnlyStubRequest,
  ImportLibraryIndexPatchPreviewRequest,
  ImportLibraryIndexPatchUiRefreshRequest,
  ImportLibraryIndexPatchWriteReadinessRequest,
  ImportLibraryIndexPatchWriteRequest,
  ImportMoveOnlyExecuteRequest,
  ImportPostCopyRefreshPreviewRequest,
  LibraryIndexBackupListRequest,
  LibraryIndexBackupRestoreRequest,
  LibraryIndexBackupRetentionPreviewRequest,
  LibraryIndexHealthCheckRequest,
  LibraryIndexMaintenanceHistoryRequest,
  LibraryIndexRemovalPreviewRequest,
  LibraryIndexRemovalWriteRequest,
  MpvExecutableActionResult,
  MpvInstallationStatus,
  MpvPlaybackCommandRequest,
  MpvPlaybackEvent,
  MpvPlaybackStartRequest,
  OpenExternalFileRequest,
  OpenInFileManagerRequest,
  ReadLibraryIndexRequest,
  ReadTrackLyricsRequest,
  ResolveTrackMediaUrlRequest,
  RevealMissingEntryParentRequest,
  ScannerDryRunRequest,
  SelectLibraryRootRequest,
  WriteIndexPreviewRequest,
  WriteLibraryIndexRequest,
} from './preload/contracts.js';

/**
 * Renderer bridge for tokenized local-media operations.
 *
 * All IPC channel values come from electron/ipc/contracts.ts. The Renderer never
 * receives absolute paths or file:// URLs, and the existing window.yangKura API
 * remains stable while Main and Renderer are migrated domain by domain.
 */
const playbackTraceChannels = new Set<IpcChannel>([
  IPC_CHANNELS.media.resolveTrackUrl,
  IPC_CHANNELS.player.mpvStart,
  IPC_CHANNELS.player.mpvCommand,
  IPC_CHANNELS.player.mpvStatus,
]);
const shouldTracePlaybackIpc = process.env.YANG_KURA_E2E_MODE === '1';

function summarizePlaybackIpc(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  const relativePath = typeof record.relativePath === 'string'
    ? record.relativePath.split(/[\\/]/).at(-1)
    : undefined;
  const mediaUrl = typeof record.mediaUrl === 'string'
    ? (() => {
        try {
          const parsed = new URL(record.mediaUrl as string);
          return `${parsed.protocol}//${parsed.pathname.split('/').at(-1) || ''}`;
        } catch {
          return (record.mediaUrl as string).split(/[\\/]/).at(-1);
        }
      })()
    : undefined;
  return {
    ok: record.ok,
    message: record.message,
    mode: record.mode,
    command: record.command,
    trackId: record.trackId,
    relativePath,
    startSeconds: record.startSeconds,
    extension: record.extension,
    mediaUrl,
  };
}

const invoke = async <T = unknown>(channel: IpcChannel, request?: unknown): Promise<T> => {
  const trace = shouldTracePlaybackIpc && playbackTraceChannels.has(channel);
  if (trace) {
    console.info('[YK_E2E_IPC_REQUEST]', JSON.stringify({ channel, request: summarizePlaybackIpc(request) }));
  }
  try {
    const result = request === undefined
      ? await ipcRenderer.invoke(channel) as T
      : await ipcRenderer.invoke(channel, request) as T;
    if (trace) {
      console.info('[YK_E2E_IPC_RESULT]', JSON.stringify({ channel, result: summarizePlaybackIpc(result) }));
    }
    return result;
  } catch (error) {
    if (trace) {
      console.error('[YK_E2E_IPC_ERROR]', JSON.stringify({
        channel,
        message: error instanceof Error ? error.message : String(error),
      }));
    }
    throw error;
  }
};

const subscribe = <T>(channel: IpcChannel, listener: (payload: T) => void) => {
  const handler = (_event: Electron.IpcRendererEvent, payload: T) => listener(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

/* Legacy runtime capability identifiers remain stable for existing Renderer and
 * packaged acceptance tests. They describe capabilities, not IPC ownership. */
const shellStatus = {
  status: 'mvp28-shell-runtime-validation-ready',
  hasRealElectronRuntime: true,
  automationProfile: process.env.YANG_KURA_E2E_MODE === '1',
  hasDirectoryPicker: true,
  hasScannerDryRunIpc: true,
  canReadRealDisk: true,
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
  selectLibraryRoot(request: SelectLibraryRootRequest) {
    return invoke(IPC_CHANNELS.library.selectRoot, request);
  },

  requestScannerDryRun(request: ScannerDryRunRequest) {
    return invoke(IPC_CHANNELS.library.scanDryRun, request);
  },

  requestWriteIndexPreview(request: WriteIndexPreviewRequest) {
    return invoke(IPC_CHANNELS.library.indexWritePreview, request);
  },

  requestWriteLibraryIndex(request: WriteLibraryIndexRequest) {
    return invoke(IPC_CHANNELS.library.indexWriteConfirmed, request);
  },

  requestReadLibraryIndex(request: ReadLibraryIndexRequest) {
    return invoke(IPC_CHANNELS.library.indexReadCurrent, request);
  },

  requestLibraryIndexHealthCheck(request: LibraryIndexHealthCheckRequest) {
    return invoke(IPC_CHANNELS.library.indexHealthCheck, request);
  },

  requestLibraryIndexRemovalPreview(request: LibraryIndexRemovalPreviewRequest) {
    return invoke(IPC_CHANNELS.library.indexRemovalPreview, request);
  },

  requestLibraryIndexRemovalWrite(request: LibraryIndexRemovalWriteRequest) {
    return invoke(IPC_CHANNELS.library.indexRemovalWrite, request);
  },

  requestLibraryIndexBackupList(request: LibraryIndexBackupListRequest) {
    return invoke(IPC_CHANNELS.library.indexBackupList, request);
  },

  requestLibraryIndexBackupRestore(request: LibraryIndexBackupRestoreRequest) {
    return invoke(IPC_CHANELS.library.indexBackupRestore, request);
  },

  requestLibraryIndexBackupRetentionPreview(request: LibraryIndexBackupRetentionPreviewRequest) {
    return invoke(IPC_CHANNELS.library.indexBackupRetentionPreview, request);
  },

  requestLibraryIndexMaintenanceHistory(request: LibraryIndexMaintenanceHistoryRequest) {
    return invoke(IPC_CHANNELS.library.indexMaintenanceHistory, request);
  },

  requestRevealMissingEntryParent(request: RevealMissingEntryParentRequest) {
    return invoke(IPC_CHANELS.library.revealNearestParent, request);
  },

  requestResolveTrackMediaUrl(request: ResolveTrackMediaUrlRequest) {
    return invoke(IPC_CHANNELS.media.resolveTrackUrl, request);
  },

  requestMpvPlaybackStart(request: MpvPlaybackStartRequest) {
    return invoke(IPC_CHANNELS.player.mpvStart, request);
  },

  requestMpvPlaybackCommand(request: MpvPlaybackCommandRequest) {
    return invoke(IPC_CHANNELS.player.mpvCommand, request);
  },

  getMpvPlaybackStatus() {
    return invoke(IPC_CHANNELS.player.mpvStatus);
  },

  getMpvInstallationStatus(): Promise<MpvInstallationStatus> {
    return invoke<MpvInstallationStatus>(IPC_CHANELS.player.mpvInstallationStatus);
  },

  selectMpvExecutable(): Promise<MpvExecutableActionResult> {
    return invoke<MpvExecutableActionResult>(IPC_CHANELS.player.mpvSelectExecutable);
  },

  clearMpvExecutable(): Promise<MpvExecutableActionResult> {
    return invoke<MpvExecutableActionResult>(IPC_CHANELS.player.mpvClearExecutable);
  },

  onMpvPlaybackEvent(listener: (event: MpvPlaybackEvent) => void) {
    return subscribe(IPC_CHANELS.player.mpvEvent, listener);
  },

  requestReadTrackLyrics(request: ReadTrackLyricsRequest) {
    return invoke(IPC_CHANNELS.media.readTrackLyrics, request);
  },

  requestOpenExternalFile(request: OpenExternalFileRequest) {
    return invoke(IPC_CHANNELS.media.openExternalFile, request);
  },

  requestOpenInFileManager(request: OpenInFileManagerRequest) {
    return invoke(IPC_CHANNELS.media.openInFileManager, request);
  },

  requestAsmrMetadataProvider(request: AsmrMetadataProviderRequest) {
    return invoke(IPC_CHANNELS.metadata.asmrSingleRjPreview, request);
  },

  clearAsmrMetadataProviderCache(request: AsmrMetadataProviderCacheClearRequest) {
    return invoke(IPC_CHANELS.metadata.asmrSingleRjCacheClear, request);
  },

  requestImportCopyOnlyPreflight(request: ImportCopyOnlyStubRequest) {
    return invoke(IPC_CHANELS.importer.copyPreflight, request);
  },

  requestImportCopyOnlyConfirm(request: ImportCopyOnlyConfirmStubRequest) {
    return invoke(IPC_CHANNELS.importer.copyConfirm, request);
  },

  requestImportCopyOnlyExecute(request: ImportCopyOnlyStubRequest) {
    return invoke(IPC_CHANNELS.importer.copyExecute, request);
  },
  requestImportPostCopyRefreshPreview(request: ImportPostCopyRefreshPreviewRequest) {
    return invoke(IPC_CHANELS.importer.postCopyRefreshPreview, request);
  },

  requestImportLibraryIndexPatchPreview(request: ImportLibraryIndexPatchPreviewRequest) {
    return invoke(IPC_CHANNELS.importer.indexPatchPreview, request);
  },

  requestImportLibraryIndexPatchWriteReadiness(request: ImportLibraryIndexPatchWriteReadinessRequest) {
    return invoke(IPC_CHANELS.importer.indexPatchWriteReadiness, request);
  },

  requestImportLibraryIndexPatchWrite(request: ImportLibraryIndexPatchWriteRequest) {
    return invoke(IPC_CHANNELS.importer.indexPatchWriteConfirmed, request);
  },

  requestImportLibraryIndexPatchRefreshAfterWrite(request: ImportLibraryIndexPatchUiRefreshRequest) {
    return invoke(IPC_CHANELS.importer.indexPatchRefreshAfterWrite, request);
  },

  requestImportMoveOnlyExecute(request: ImportMoveOnlyExecuteRequest) {
    return invoke(IPC_CHANELS.importer.moveExecute, request);
  },

  requestImportCopyOnlyCancel(request: ImportCopyOnlyCancelStubRequest) {
    return invoke(IPC_CHANNELS.importer.copyCancel, request);
  },

  async getElectronShellStatus() {
    return shellStatus;
  },
};

contextBridge.exposeInMainWorld('yangKura', yangKuraApi);
