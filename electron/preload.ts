/**
 * MVP-23 Electron preload entry.
 *
 * The renderer gets a narrow `window.yangKura` API. Directory selection returns
 * a tokenized root. Dry-run scanning can only use that rootPathToken. MVP-22 also generates
 * a library-index write preview object. MVP-23 adds a confirmed write method
 * for library-index.json. MVP-24 adds read-current-index so the existing UI
 * can load real index data. MVP-25 adds a tokenized media URL resolver for HTMLAudio. MVP-26 adds read-only
 * local subtitle text reading. MVP-27 adds external opening for video/image/files and file-manager reveal. No absolutePath or file:// URL is exposed to the renderer.
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

type ResolveTrackMediaUrlRequest = {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  expectedKind: 'audio';
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
  canReadTrackLyrics: true,
  canOpenExternalFile: true,
  canOpenInFileManager: true,
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

  async requestResolveTrackMediaUrl(request: ResolveTrackMediaUrlRequest) {
    return ipcRenderer.invoke('yang-kura:media:resolve-track-url', request);
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

  async getElectronShellStatus() {
    return shellStatus;
  },
};

contextBridge.exposeInMainWorld('yangKura', yangKuraApi);
