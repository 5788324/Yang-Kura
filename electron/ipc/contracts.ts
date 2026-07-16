export const IPC_CHANNELS = {
  library: {
    selectRoot: 'yang-kura:dialog:select-library-root',
    scanDryRun: 'yang-kura:scanner:dry-run:request',
    indexWritePreview: 'yang-kura:index:write-preview-request',
    indexWriteConfirmed: 'yang-kura:index:write-confirmed-request',
    indexReadCurrent: 'yang-kura:index:read-current-request',
    indexHealthCheck: 'yang-kura:index:health-check-request',
    indexRemovalPreview: 'yang-kura:index:removal-preview-request',
    indexRemovalWrite: 'yang-kura:index:removal-write-confirmed-request',
    indexBackupList: 'yang-kura:index:backup-list-request',
    indexBackupRestore: 'yang-kura:index:backup-restore-request',
    indexBackupRetentionPreview: 'yang-kura:index:backup-retention-preview-request',
    indexMaintenanceHistory: 'yang-kura:index:maintenance-history-request',
    revealNearestParent: 'yang-kura:index:reveal-nearest-parent-request',
  },
  media: {
    resolveTrackUrl: 'yang-kura:media:resolve-track-url',
    readTrackLyrics: 'yang-kura:lyrics:read-track-lyrics',
    openExternalFile: 'yang-kura:external:open-file',
    openInFileManager: 'yang-kura:external:open-in-file-manager',
  },
  player: {
    mpvStart: 'yang-kura:player:mpv:start',
    mpvCommand: 'yang-kura:player:mpv:command',
    mpvStatus: 'yang-kura:player:mpv:status',
    mpvInstallationStatus: 'yang-kura:player:mpv:installation-status',
    mpvSelectExecutable: 'yang-kura:player:mpv:select-executable',
    mpvClearExecutable: 'yang-kura:player:mpv:clear-executable',
    mpvEvent: 'yang-kura:player:mpv:event',
  },
  metadata: {
    asmrSingleRjPreview: 'yang-kura:metadata:asmr:single-rj-preview',
    asmrSingleRjCacheClear: 'yang-kura:metadata:asmr:single-rj-cache-clear',
  },
  importer: {
    copyPreflight: 'yang-kura:import:copy-only:preflight',
    copyConfirm: 'yang-kura:import:copy-only:confirm',
    copyExecute: 'yang-kura:import:copy-only:execute',
    copyCancel: 'yang-kura:import:copy-only:cancel',
    postCopyRefreshPreview: 'yang-kura:import:post-copy:refresh-preview',
    indexPatchPreview: 'yang-kura:import:library-index-patch:preview',
    indexPatchWriteReadiness: 'yang-kura:import:library-index-patch:write-readiness',
    indexPatchWriteConfirmed: 'yang-kura:import:library-index-patch:write-confirmed',
    indexPatchRefreshAfterWrite: 'yang-kura:import:library-index-patch:refresh-after-write',
    moveExecute: 'yang-kura:import:move-only:execute',
  },
} as const;

type DeepStringValue<T> = T extends string
  ? T
  : T extends Readonly<Record<string, unknown>>
    ? DeepStringValue<T[keyof T]>
    : never;

export type IpcChannel = DeepStringValue<typeof IPC_CHANNELS>;
export type LibraryType = 'asmr' | 'music' | 'mixed';
export type RootPathToken = string & { readonly __rootPathToken: unique symbol };
export type RelativeMediaPath = string & { readonly __relativeMediaPath: unique symbol };

export type IpcErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_ROOT_TOKEN'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'CONFLICT'
  | 'TIMEOUT'
  | 'UNSUPPORTED_MEDIA'
  | 'BACKEND_UNAVAILABLE'
  | 'PRECONDITION_FAILED'
  | 'IO_FAILURE'
  | 'INTERNAL_ERROR';

export interface IpcError {
  code: IpcErrorCode;
  message: string;
  retryable: boolean;
  operation?: string;
  context?: Readonly<Record<string, string | number | boolean | null>>;
}

export type IpcResult<T> =
  | { ok: true; data: T; error?: never }
  | { ok: false; data?: never; error: IpcError };

export interface RootScopedRequest {
  rootPathToken: RootPathToken | string;
}

export interface RelativePathRequest extends RootScopedRequest {
  relativePath: RelativeMediaPath | string;
}

export interface TrackScopedRequest extends RootScopedRequest {
  trackId: string;
  relativePath: RelativeMediaPath | string;
}

export function ipcOk<T>(data: T): IpcResult<T> {
  return { ok: true, data };
}

export function ipcFail(error: IpcError): IpcResult<never> {
  return { ok: false, error };
}
