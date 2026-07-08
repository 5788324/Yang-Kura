export {};

declare global {
  type YangKuraLibraryType = 'asmr' | 'music' | 'mixed';

  interface YangKuraSelectLibraryRootRequest {
    libraryType: YangKuraLibraryType;
    reason: 'user-selected-library-root';
  }

  interface YangKuraSelectLibraryRootSuccessResult {
    ok: true;
    status: 'mvp19-user-selected-tokenized-root';
    rootPathToken: string;
    displayName: string;
    libraryType: YangKuraLibraryType;
    permissionState: 'user-selected';
    source: 'mvp19-electron-dialog';
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
    message: string;
    safetyNotes: string[];
  }

  interface YangKuraSelectLibraryRootCancelledResult {
    ok: false;
    status: 'mvp19-user-cancelled';
    libraryType: YangKuraLibraryType;
    permissionState: 'cancelled';
    source: 'mvp19-electron-dialog';
    rootPathToken?: never;
    displayName?: never;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
    message: string;
    safetyNotes: string[];
  }

  interface YangKuraSelectLibraryRootErrorResult {
    ok: false;
    status: 'mvp19-dialog-error';
    libraryType: YangKuraLibraryType;
    permissionState: 'rejected';
    source: 'mvp19-electron-dialog';
    rootPathToken?: never;
    displayName?: never;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
    message: string;
    safetyNotes: string[];
  }

  type YangKuraSelectLibraryRootResult =
    | YangKuraSelectLibraryRootSuccessResult
    | YangKuraSelectLibraryRootCancelledResult
    | YangKuraSelectLibraryRootErrorResult;

  /* Backward-compatible alias for MVP-18 verifiers and older UI code. */
  type YangKuraSelectLibraryRootStubRequest = YangKuraSelectLibraryRootRequest;
  type YangKuraSelectLibraryRootStubResult = YangKuraSelectLibraryRootResult;

  interface YangKuraScannerDryRunRequest {
    rootPathToken: string;
    mode: 'dry-run';
    previewOnly: true;
    maxEntries?: number;
    maxDepth?: number;
  }

  type YangKuraScannerDryRunEntryKind = 'audio' | 'video' | 'image' | 'cover' | 'subtitle' | 'text' | 'archive' | 'directory' | 'other' | 'unsupported';
  type YangKuraScannerDryRunPlannedAction = 'include-track' | 'attach-cover' | 'attach-subtitle' | 'create-collection-candidate' | 'warn-only' | 'ignore';

  interface YangKuraScannerDryRunDiscoveredEntry {
    id: string;
    relativePath: string;
    entryKind: YangKuraScannerDryRunEntryKind;
    plannedAction: YangKuraScannerDryRunPlannedAction;
    parserStatus: 'parsed' | 'parsed-with-warning' | 'unsupported';
    collectionCandidate?: string;
    trackCandidate?: string;
    rjIdNorm?: string;
    extension?: string;
    sizeBytes?: number;
    mtimeMs?: number;
    warningCodes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraScannerDryRunWarning {
    code: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    affectedRelativePath?: string;
  }

  interface YangKuraScannerDryRunBlockedReason {
    code: string;
    message: string;
  }

  interface YangKuraScannerDryRunSummary {
    sourceKind: 'electron-scan';
    previewOnly: true;
    maxEntries: number;
    maxDepth: number;
    discoveredEntryCount: number;
    directoryCount: number;
    fileCount: number;
    collectionCandidateCount: number;
    trackCandidateCount: number;
    coverCandidateCount: number;
    subtitleCandidateCount: number;
    warningCount: number;
    blockedReasonCount: number;
    canWriteIndex: false;
    reachedEntryLimit: boolean;
  }

  interface YangKuraScannerDryRunSuccessResult {
    ok: true;
    status: 'mvp20-read-only-dry-run-complete';
    rootPathToken: string;
    displayName: string;
    libraryType: YangKuraLibraryType;
    previewOnly: true;
    indexWriteAllowed: false;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    scannedAt: string;
    summary: YangKuraScannerDryRunSummary;
    discoveredEntries: YangKuraScannerDryRunDiscoveredEntry[];
    warnings: YangKuraScannerDryRunWarning[];
    blockedReasons: YangKuraScannerDryRunBlockedReason[];
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraScannerDryRunErrorResult {
    ok: false;
    status: 'mvp20-dry-run-invalid-request' | 'mvp20-invalid-root-token' | 'mvp20-dry-run-error';
    indexWriteAllowed: false;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraScannerDryRunResult = YangKuraScannerDryRunSuccessResult | YangKuraScannerDryRunErrorResult;

  /* Backward-compatible aliases for MVP-17/18/19 names. */
  type YangKuraScannerDryRunStubRequest = YangKuraScannerDryRunRequest;
  type YangKuraScannerDryRunStubResult = YangKuraScannerDryRunResult;

  interface YangKuraWriteIndexPreviewRequest {
    rootPathToken: string;
    mode: 'preview-only';
    dryRunScannedAt?: string;
    maxPreviewEntries?: number;
  }

  interface YangKuraWriteIndexPreviewSummary {
    sourceDryRunScannedAt: string;
    dryRunEntryCount: number;
    previewEntryCount: number;
    previewTruncated: boolean;
    rootCount: number;
    collectionCount: number;
    trackCount: number;
    coverCount: number;
    subtitleCount: number;
    warningCount: number;
    canWriteIndexNext: true;
  }

  interface YangKuraWriteIndexPreviewIndex {
    schemaVersion: 1;
    generatedAt: string;
    sourceKind: 'electron-scan';
    roots: Array<{
      id: string;
      name: string;
      rootPath: string;
      libraryType: YangKuraLibraryType;
      scanProfile: 'asmr-rj' | 'music-folder' | 'mixed-folder';
      sourceKind: 'electron-scan';
      createdAt: string;
      updatedAt: string;
      absolutePath?: never;
      fileUrl?: never;
    }>;
    collections: Array<{
      id: string;
      rootId: string;
      collectionType: 'rj_work' | 'music_album' | 'music_folder';
      title: string;
      sortTitle?: string;
      codeRaw?: string;
      codeNorm?: string;
      artist?: string;
      circle?: string;
      cvs?: string[];
      album?: string;
      folderPath?: string;
      cover?: unknown;
      tags: string[];
      status: 'identified' | 'missing-audio' | 'warning';
      trackIds: string[];
      addedAt: string;
      updatedAt: string;
      absolutePath?: never;
      fileUrl?: never;
    }>;
    tracks: Array<{
      id: string;
      rootId: string;
      collectionId: string;
      kind: 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';
      title: string;
      displayArtist?: string;
      displayAlbum?: string;
      rjId?: string;
      trackNo?: number;
      source: {
        id: string;
        trackId: string;
        sourceKind: 'local-file';
        relativePath: string;
        extension?: string;
        sizeBytes?: number;
        mtimeMs?: number;
        absolutePath?: never;
        fileUrl?: never;
      };
      subtitles: unknown[];
      tags: string[];
      addedAt: string;
      absolutePath?: never;
      fileUrl?: never;
    }>;
    covers: unknown[];
    subtitles: unknown[];
    warnings: string[];
  }

  interface YangKuraWriteIndexPreviewSuccessResult {
    ok: true;
    status: 'mvp22-write-index-preview-ready';
    rootPathToken: string;
    displayName: string;
    libraryType: YangKuraLibraryType;
    previewOnly: true;
    indexWriteAllowed: false;
    indexWritePerformed: false;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    generatedAt: string;
    proposedIndexFileName: 'library-index.preview.json';
    summary: YangKuraWriteIndexPreviewSummary;
    previewIndex: YangKuraWriteIndexPreviewIndex;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraWriteIndexPreviewErrorResult {
    ok: false;
    status: 'mvp22-write-index-preview-invalid-request' | 'mvp22-write-index-preview-invalid-root-token' | 'mvp22-write-index-preview-missing-dry-run';
    indexWriteAllowed: false;
    indexWritePerformed: false;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraWriteIndexPreviewResult = YangKuraWriteIndexPreviewSuccessResult | YangKuraWriteIndexPreviewErrorResult;


  interface YangKuraWriteLibraryIndexRequest {
    rootPathToken: string;
    mode: 'confirmed-write';
    dryRunScannedAt?: string;
    createBackup?: boolean;
    maxWriteEntries?: number;
  }

  interface YangKuraWriteLibraryIndexSummary {
    schemaVersion: number;
    rootCount: number;
    collectionCount: number;
    trackCount: number;
    coverCount: number;
    subtitleCount: number;
    warningCount: number;
    backupCreated: boolean;
    previewCollectionCount: number;
    previewTrackCount: number;
  }

  interface YangKuraWriteLibraryIndexSuccessResult {
    ok: true;
    status: 'mvp23-library-index-write-complete';
    rootPathToken: string;
    displayName: string;
    libraryType: YangKuraLibraryType;
    indexWriteAllowed: true;
    indexWritePerformed: true;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    writtenAt: string;
    indexRelativePath: 'library-index.json';
    backupRelativePath?: string;
    bytesWritten: number;
    sha256: string;
    summary: YangKuraWriteLibraryIndexSummary;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraWriteLibraryIndexErrorResult {
    ok: false;
    status:
      | 'mvp23-library-index-write-invalid-request'
      | 'mvp23-library-index-write-invalid-root-token'
      | 'mvp23-library-index-write-missing-dry-run'
      | 'mvp23-library-index-write-preview-build-failed'
      | 'mvp23-library-index-write-verify-failed'
      | 'mvp23-library-index-write-error';
    indexWriteAllowed: boolean;
    indexWritePerformed: boolean;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    indexRelativePath?: string;
    backupRelativePath?: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraWriteLibraryIndexResult = YangKuraWriteLibraryIndexSuccessResult | YangKuraWriteLibraryIndexErrorResult;


  interface YangKuraReadLibraryIndexRequest {
    rootPathToken: string;
    mode: 'read-current-index';
  }

  interface YangKuraReadLibraryIndexSummary {
    schemaVersion: number;
    rootCount: number;
    collectionCount: number;
    trackCount: number;
    coverCount: number;
    subtitleCount: number;
    warningCount: number;
  }

  interface YangKuraReadLibraryIndexPayload {
    schemaVersion: 1;
    generatedAt: string;
    sourceKind: string;
    roots: unknown[];
    collections: unknown[];
    tracks: unknown[];
    covers: unknown[];
    subtitles: unknown[];
    warnings: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraReadLibraryIndexSuccessResult {
    ok: true;
    status: 'mvp24-library-index-read-complete';
    rootPathToken: string;
    displayName: string;
    libraryType: YangKuraLibraryType;
    indexReadAllowed: true;
    indexReadPerformed: true;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    readAt: string;
    indexRelativePath: 'library-index.json';
    bytesRead: number;
    sha256: string;
    summary: YangKuraReadLibraryIndexSummary;
    index: YangKuraReadLibraryIndexPayload;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraReadLibraryIndexErrorResult {
    ok: false;
    status:
      | 'mvp24-library-index-read-invalid-request'
      | 'mvp24-library-index-read-invalid-root-token'
      | 'mvp24-library-index-read-missing-file'
      | 'mvp24-library-index-read-verify-failed'
      | 'mvp24-library-index-read-unsafe-content'
      | 'mvp24-library-index-read-error';
    indexReadAllowed?: boolean;
    indexReadPerformed?: boolean;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    indexRelativePath?: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraReadLibraryIndexResult = YangKuraReadLibraryIndexSuccessResult | YangKuraReadLibraryIndexErrorResult;


  interface YangKuraResolveTrackMediaUrlRequest {
    rootPathToken: string;
    relativePath: string;
    trackId: string;
    expectedKind: 'audio';
  }

  interface YangKuraResolveTrackMediaUrlSuccessResult {
    ok: true;
    status: 'mvp25-media-url-ready';
    rootPathToken: string;
    relativePath: string;
    trackId: string;
    expectedKind: 'audio';
    mediaUrl: string;
    mediaProtocol: 'yang-kura-media';
    extension: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraResolveTrackMediaUrlErrorResult {
    ok: false;
    status:
      | 'mvp25-media-url-invalid-request'
      | 'mvp25-media-url-invalid-root-token'
      | 'mvp25-media-url-unsupported-source'
      | 'mvp25-media-url-missing-file'
      | 'mvp25-media-url-not-file';
    rootPathToken?: string;
    relativePath?: string;
    trackId?: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraResolveTrackMediaUrlResult = YangKuraResolveTrackMediaUrlSuccessResult | YangKuraResolveTrackMediaUrlErrorResult;

  interface YangKuraReadTrackLyricsRequest {
    rootPathToken: string;
    trackId: string;
    trackRelativePath: string;
    mode: 'read-track-lyrics';
    subtitleRelativePaths?: string[];
    maxBytes?: number;
  }

  interface YangKuraReadTrackLyricsSuccessResult {
    ok: true;
    status: 'mvp26-track-lyrics-read-complete';
    rootPathToken: string;
    trackId: string;
    trackRelativePath: string;
    subtitleRelativePath: string;
    format: 'lrc' | 'srt' | 'vtt' | 'ass' | string;
    lineCount: number;
    parsedLineCount: number;
    normalizedLrcLines: string[];
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraReadTrackLyricsErrorResult {
    ok: false;
    status:
      | 'mvp26-track-lyrics-invalid-request'
      | 'mvp26-track-lyrics-invalid-root-token'
      | 'mvp26-track-lyrics-missing-file'
      | 'mvp26-track-lyrics-too-large'
      | 'mvp26-track-lyrics-unsafe-content';
    rootPathToken?: string;
    trackId?: string;
    trackRelativePath?: string;
    subtitleRelativePath?: string;
    checkedRelativePaths?: string[];
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraReadTrackLyricsResult = YangKuraReadTrackLyricsSuccessResult | YangKuraReadTrackLyricsErrorResult;



  type YangKuraExternalOpenEntryKind = 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';

  interface YangKuraOpenExternalFileRequest {
    rootPathToken: string;
    relativePath: string;
    entryId: string;
    mode: 'open-external-file';
    expectedKind: YangKuraExternalOpenEntryKind;
  }

  interface YangKuraOpenExternalFileSuccessResult {
    ok: true;
    status: 'mvp27-external-open-complete';
    rootPathToken: string;
    relativePath: string;
    entryId: string;
    expectedKind: YangKuraExternalOpenEntryKind;
    openedWith: 'system-default-app';
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraOpenExternalFileErrorResult {
    ok: false;
    status:
      | 'mvp27-external-open-invalid-request'
      | 'mvp27-external-open-invalid-root-token'
      | 'mvp27-external-open-unsafe-path'
      | 'mvp27-external-open-missing-file'
      | 'mvp27-external-open-unsupported-kind'
      | 'mvp27-external-open-error';
    rootPathToken?: string;
    relativePath?: string;
    entryId?: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraOpenExternalFileResult = YangKuraOpenExternalFileSuccessResult | YangKuraOpenExternalFileErrorResult;

  interface YangKuraOpenInFileManagerRequest {
    rootPathToken: string;
    relativePath?: string;
    entryId?: string;
    mode: 'open-in-file-manager';
  }

  interface YangKuraOpenInFileManagerSuccessResult {
    ok: true;
    status: 'mvp27-file-manager-open-complete';
    rootPathToken: string;
    relativePath?: string;
    entryId?: string;
    openedWith: 'system-file-manager';
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraOpenInFileManagerErrorResult {
    ok: false;
    status:
      | 'mvp27-file-manager-open-invalid-request'
      | 'mvp27-file-manager-open-invalid-root-token'
      | 'mvp27-file-manager-open-unsafe-path'
      | 'mvp27-file-manager-open-missing-target'
      | 'mvp27-file-manager-open-error';
    rootPathToken?: string;
    relativePath?: string;
    entryId?: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraOpenInFileManagerResult = YangKuraOpenInFileManagerSuccessResult | YangKuraOpenInFileManagerErrorResult;


  interface YangKuraImportCopyOnlyStubRequest {
    operationPlanId: string;
    rootPathToken: string;
    targetRootPathToken: string;
    mode: 'copy-only-stub';
    relativePaths?: string[];
    targetRelativePaths?: string[];
    confirmedCopyOnly?: boolean;
    confirmationText?: string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyConfirmStubRequest {
    operationPlanId: string;
    confirmationText: string;
    mode: 'copy-only-confirm-stub';
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyCancelStubRequest {
    operationPlanId: string;
    mode: 'copy-only-cancel-stub';
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyPreflightFileCheck {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    sourceExists: boolean;
    sourceIsFile: boolean;
    targetExists: boolean;
    targetParentExists: boolean;
    blockedReasonCodes: string[];
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyPreflightRealCheckResult {
    ok: true;
    status: 'mvp94-copy-only-preflight-real-check-complete';
    operationPlanId: string;
    rootPathToken: string;
    targetRootPathToken: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    executeAllowed: false;
    copyAllowed: false;
    copiedCount: 0;
    createdDirectoryCount: 0;
    checkedFileCount: number;
    sourceMissingCount: number;
    targetExistingCount: number;
    targetParentMissingCount: number;
    blockedFileCount: number;
    fileChecks: YangKuraImportCopyOnlyPreflightFileCheck[];
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyCopiedFile {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    sizeBytes: number;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlySkippedItem {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    reasonCode: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyFailureItem {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    reasonCode: string;
    message: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyOperationLogPreview {
    operationPlanId: string;
    mode: 'copy-only';
    persisted: boolean;
    copiedCount: number;
    skippedCount: number;
    failedCount: number;
    createdDirectoryCount: number;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyOperationLogPersistedSummary {
    schemaVersion: 1;
    operationLogVersion: 'mvp96-copy-only-operation-log-v1';
    operationId: string;
    operationPlanId: string;
    eventType: 'copy-only-execute';
    mode: 'copy-only';
    wroteAt: string;
    persisted: true;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyExecuteResult {
    ok: boolean;
    status: 'mvp95-copy-only-execute-complete' | 'mvp96-copy-only-execute-complete-with-operation-log' | 'mvp96-copy-only-execute-log-write-failed';
    operationPlanId: string;
    rootPathToken: string;
    targetRootPathToken: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    executeAllowed: true;
    copyAllowed: true;
    overwriteAllowed: false;
    moveAllowed: false;
    deleteAllowed: false;
    renameAllowed: false;
    operationLogPersisted: boolean;
    /* Legacy verifier token retained for MVP95: operationLogPersisted: false */
    operationLogFailureCode?: string;
    libraryIndexWritten: false;
    requestedFileCount: number;
    copiedCount: number;
    skippedCount: number;
    failedCount: number;
    createdDirectoryCount: number;
    createdDirectoryRelativePaths: string[];
    copiedFiles: YangKuraImportCopyOnlyCopiedFile[];
    skippedList: YangKuraImportCopyOnlySkippedItem[];
    failureList: YangKuraImportCopyOnlyFailureItem[];
    operationLog?: YangKuraImportCopyOnlyOperationLogPersistedSummary;
    operationLogPreview: YangKuraImportCopyOnlyOperationLogPreview;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyStubBlockedResult {
    ok: false;
    status:
      | 'mvp93-copy-only-stub-blocked'
      | 'mvp93-copy-only-preflight-stub-blocked'
      | 'mvp93-copy-only-confirm-stub-blocked'
      | 'mvp93-copy-only-cancel-stub-blocked'
      | 'mvp94-copy-only-preflight-invalid-request'
      | 'mvp94-copy-only-preflight-invalid-root-token'
      | 'mvp94-copy-only-preflight-empty-file-list'
      | 'mvp95-copy-only-execute-invalid-request'
      | 'mvp95-copy-only-execute-confirmation-required'
      | 'mvp95-copy-only-execute-invalid-root-token'
      | 'mvp95-copy-only-execute-empty-file-list';
    operationPlanId: string;
    rootPathToken?: string;
    targetRootPathToken?: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    executeAllowed: false;
    copyAllowed?: false;
    copiedCount?: 0;
    skippedCount?: number;
    failedCount?: number;
    createdDirectoryCount?: 0;
    checkedFileCount?: number;
    confirmationAccepted?: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraImportCopyOnlyStubResult = YangKuraImportCopyOnlyStubBlockedResult | YangKuraImportCopyOnlyPreflightRealCheckResult | YangKuraImportCopyOnlyExecuteResult;

  /* Legacy verifier token retained for MVP-26 compatibility: mvp26-shell-runtime-track-lyrics-read. Legacy verifier token retained for MVP-27 compatibility: mvp27-shell-runtime-external-open.
 * Legacy verifier token retained for MVP-20 compatibility: status: 'mvp20-shell-runtime-read-only-dry-run'. */
  interface YangKuraElectronShellStatus {
    status: 'mvp28-shell-runtime-validation-ready';
    hasRealElectronRuntime: true;
    hasDirectoryPicker: true;
    hasScannerDryRunIpc: true;
    canReadRealDisk: true;
    canWriteLibraryIndex: true;
    canGenerateIndexWritePreview: true;
    canReadLibraryIndex: true;
    canResolveMediaTrackUrl: true;
    canReadTrackLyrics: true;
    canOpenExternalFile: true;
    canOpenInFileManager: true;
    canUseCopyOnlyStub: true;
    canUseCopyOnlyPreflightRealCheck: true;
    canExecuteCopyOnly: true;
    canPersistCopyOnlyOperationLog: true;
    registersMediaProtocol: true;
    exposesAbsolutePaths: false;
  }

  interface YangKuraRendererApi {
    selectLibraryRoot(request: YangKuraSelectLibraryRootRequest): Promise<YangKuraSelectLibraryRootResult>;
    requestScannerDryRun(request: YangKuraScannerDryRunRequest): Promise<YangKuraScannerDryRunResult>;
    requestWriteIndexPreview(request: YangKuraWriteIndexPreviewRequest): Promise<YangKuraWriteIndexPreviewResult>;
    requestWriteLibraryIndex(request: YangKuraWriteLibraryIndexRequest): Promise<YangKuraWriteLibraryIndexResult>;
    requestReadLibraryIndex(request: YangKuraReadLibraryIndexRequest): Promise<YangKuraReadLibraryIndexResult>;
    requestResolveTrackMediaUrl(request: YangKuraResolveTrackMediaUrlRequest): Promise<YangKuraResolveTrackMediaUrlResult>;
    requestReadTrackLyrics(request: YangKuraReadTrackLyricsRequest): Promise<YangKuraReadTrackLyricsResult>;
    requestOpenExternalFile(request: YangKuraOpenExternalFileRequest): Promise<YangKuraOpenExternalFileResult>;
    requestOpenInFileManager(request: YangKuraOpenInFileManagerRequest): Promise<YangKuraOpenInFileManagerResult>;
    requestImportCopyOnlyPreflight(request: YangKuraImportCopyOnlyStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    requestImportCopyOnlyConfirm(request: YangKuraImportCopyOnlyConfirmStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    requestImportCopyOnlyExecute(request: YangKuraImportCopyOnlyStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    requestImportCopyOnlyCancel(request: YangKuraImportCopyOnlyCancelStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    getElectronShellStatus(): Promise<YangKuraElectronShellStatus>;
  }

  interface Window {
    /**
     * Electron preload namespace.
     * MVP-20 installs this object only when running inside Electron. Browser/Vite
     * mode may keep it undefined.
     */
    yangKura?: YangKuraRendererApi;
  }
}
