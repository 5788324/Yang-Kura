export {};

declare global {
  type YangKuraLibraryType = 'asmr' | 'music' | 'mixed';

  interface YangKuraSelectLibraryRootRequest {
    libraryType: YangKuraLibraryType;
    reason: 'user-selected-library-root';
    selectionRole?: 'library-root' | 'import-source' | 'import-target';
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


  type YangKuraLibraryIndexHealthItemKind = 'track' | 'cover' | 'subtitle' | 'collection-reference';
  type YangKuraLibraryIndexHealthStatus = 'missing' | 'unreadable' | 'wrong-type' | 'invalid-path' | 'invalid-reference';

  interface YangKuraLibraryIndexHealthCheckRequest {
    rootPathToken: string;
    mode: 'read-only-health-check';
    maxEntries?: number;
  }

  interface YangKuraLibraryIndexHealthIssue {
    id: string;
    kind: YangKuraLibraryIndexHealthItemKind;
    entityId: string;
    ownerId?: string;
    collectionId?: string;
    relativePath?: string;
    expectedKind: 'file' | 'track-reference';
    canRemoveFromIndex: boolean;
    canRevealParent: boolean;
    status: YangKuraLibraryIndexHealthStatus;
    message: string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexHealthCheckSuccessResult {
    ok: true;
    status: 'mvp127-library-index-health-check-complete';
    rootPathToken: string;
    displayName: string;
    libraryType: YangKuraLibraryType;
    checkedAt: string;
    indexSha256: string;
    bytesRead: number;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    summary: {
      indexedReferenceCount: number;
      checkedReferenceCount: number;
      healthyCount: number;
      problemCount: number;
      missingCount: number;
      unreadableCount: number;
      wrongTypeCount: number;
      invalidPathCount: number;
      invalidReferenceCount: number;
      trackProblemCount: number;
      coverProblemCount: number;
      subtitleProblemCount: number;
      truncated: boolean;
      canGenerateRemovalPreview: boolean;
    };
    issues: YangKuraLibraryIndexHealthIssue[];
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexHealthCheckErrorResult {
    ok: false;
    status: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  type YangKuraLibraryIndexHealthCheckResult = YangKuraLibraryIndexHealthCheckSuccessResult | YangKuraLibraryIndexHealthCheckErrorResult;

  interface YangKuraLibraryIndexRemovalPreviewRequest {
    rootPathToken: string;
    mode: 'remove-missing-preview';
    issueIds?: string[];
  }

  interface YangKuraLibraryIndexRemovalPreviewResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    sourceIndexSha256?: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    writePerformed: false;
    preview?: {
      previewVersion: 'mvp127-library-index-removal-preview-v1';
      generatedAt: string;
      writePerformed: false;
      deleteMediaFiles: false;
      selectedIssueCount: number;
      operations: Array<{
        operation: 'remove-track' | 'detach-cover' | 'detach-subtitle' | 'remove-stale-track-reference';
        entityId: string;
        ownerId?: string;
        collectionId?: string;
        relativePath?: string;
      }>;
      summary: {
        trackRemovalCount: number;
        coverDetachCount: number;
        subtitleDetachCount: number;
        staleReferenceRemovalCount: number;
        affectedCollectionCount: number;
        emptyCollectionCount: number;
      };
      safetyNotes: string[];
    };
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexRemovalWriteRequest {
    rootPathToken: string;
    mode: 'confirmed-index-removal-write';
    sourceIndexSha256: string;
    previewGeneratedAt: string;
    userConfirmed: boolean;
    confirmationText: string;
    createBackup: boolean;
  }

  interface YangKuraLibraryIndexRemovalWriteResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    writePerformed: boolean;
    backupCreated: boolean;
    backupRelativePath?: string;
    sourceIndexSha256?: string;
    writtenIndexSha256?: string;
    writtenAt?: string;
    mediaFilesDeleted: false;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    requiredConfirmationText?: 'CONFIRM_REMOVE_MISSING_INDEX_RECORDS';
    rollbackRestored?: boolean;
    summary?: {
      removedTrackCount: number;
      detachedCoverCount: number;
      detachedSubtitleCount: number;
      removedStaleReferenceCount: number;
      cascadedCoverCount: number;
      cascadedSubtitleCount: number;
      affectedCollectionCount: number;
      emptyCollectionCount: number;
    };
    indexSummary?: {
      schemaVersion: number;
      rootCount: number;
      collectionCount: number;
      trackCount: number;
      coverCount: number;
      subtitleCount: number;
      warningCount: number;
    };
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexBackupRecord {
    relativePath: string;
    fileName: string;
    createdAt: string;
    modifiedAt: string;
    sizeBytes: number;
    sha256?: string;
    validationStatus: 'valid' | 'invalid-json' | 'invalid-index' | 'unsafe-content' | 'unreadable';
    valid: boolean;
    generation: 'mvp23' | 'mvp100' | 'mvp128' | 'mvp129-restore' | 'other';
    summary?: Record<string, number>;
    message: string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexBackupListRequest {
    rootPathToken: string;
    mode: 'list-index-backups';
    maxEntries?: number;
  }

  interface YangKuraLibraryIndexBackupListResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    listedAt?: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    backups?: YangKuraLibraryIndexBackupRecord[];
    summary?: { totalCount: number; validCount: number; invalidCount: number; totalBytes: number };
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexBackupRestoreRequest {
    rootPathToken: string;
    mode: 'restore-index-backup';
    backupRelativePath: string;
    backupSha256: string;
    confirmationText: string;
    createCurrentBackup: boolean;
  }

  interface YangKuraLibraryIndexBackupRestoreResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    writePerformed: boolean;
    currentBackupCreated: boolean;
    currentBackupRelativePath?: string;
    restoredBackupRelativePath?: string;
    sourceIndexSha256?: string;
    restoredIndexSha256?: string;
    restoredAt?: string;
    bytesWritten?: number;
    rollbackRestored?: boolean;
    requiredConfirmationText?: 'CONFIRM_RESTORE_LIBRARY_INDEX_BACKUP';
    mediaFilesDeleted: false;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    indexSummary?: Record<string, number>;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexBackupRetentionPreviewRequest {
    rootPathToken: string;
    mode: 'preview-backup-retention';
    maxAgeDays?: number;
    keepNewest?: number;
  }

  interface YangKuraLibraryIndexBackupRetentionPreviewResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    deletePerformed: false;
    preview?: {
      previewVersion: 'mvp129-backup-retention-preview-v1';
      generatedAt: string;
      deletePerformed: false;
      maxAgeDays: number;
      keepNewest: number;
      totalBackupCount: number;
      candidateCount: number;
      candidateBytes: number;
      retainedCount: number;
      candidates: Array<Pick<YangKuraLibraryIndexBackupRecord, 'relativePath' | 'fileName' | 'modifiedAt' | 'sizeBytes' | 'sha256' | 'validationStatus'>>;
      safetyNotes: string[];
    };
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexMaintenanceHistoryRequest {
    rootPathToken: string;
    mode: 'read-index-maintenance-history';
    maxEntries?: number;
  }

  interface YangKuraLibraryIndexMaintenanceHistoryEntry {
    historyVersion: 'mvp129-index-maintenance-history-v1';
    id: string;
    displayName: string;
    libraryType: string;
    action: 'controlled-cleanup' | 'backup-restore';
    status: 'complete' | 'failed';
    occurredAt: string;
    sourceSha256?: string;
    resultSha256?: string;
    backupRelativePath?: string;
    restoredBackupRelativePath?: string;
    summary?: Record<string, number>;
    message: string;
    mediaFilesDeleted: false;
    absolutePathsStored: false;
  }

  interface YangKuraLibraryIndexMaintenanceHistoryResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    readAt?: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    entries?: YangKuraLibraryIndexMaintenanceHistoryEntry[];
    summary?: { totalCount: number; cleanupCount: number; restoreCount: number; successCount: number; failedCount: number };
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraRevealMissingEntryParentRequest {
    rootPathToken: string;
    relativePath: string;
    entryId: string;
    mode: 'reveal-nearest-existing-parent';
  }

  interface YangKuraRevealMissingEntryParentResult {
    ok: boolean;
    status: string;
    rootPathToken?: string;
    entryId?: string;
    requestedRelativePath?: string;
    nearestExistingRelativePath?: string;
    absolutePathsReturned: false;
    fileUrlReturned: false;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }


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

  interface YangKuraImportRolledBackFile {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    rollbackMethod: 'unlink-copy-target' | 'rename-back' | 'copy-verify-unlink-back' | 'already-absent';
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportRollbackFailure {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    reasonCode: string;
    message: string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyOperationLogPersistedSummary {
    schemaVersion: 1;
    operationLogVersion: 'mvp96-copy-only-operation-log-v1';
    transactionVersion?: 'u31-import-transaction-v1';
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
    status: 'mvp95-copy-only-execute-complete' | 'mvp96-copy-only-execute-complete-with-operation-log' | 'mvp96-copy-only-execute-log-write-failed' | 'u31-copy-only-execute-rolled-back' | 'u31-copy-only-execute-rollback-incomplete';
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
    removedDirectoryRelativePaths?: string[];
    transactionVersion?: 'u31-import-transaction-v1';
    rollbackAttempted: boolean;
    rollbackSucceeded: boolean;
    rolledBackCount: number;
    rollbackFailureCount: number;
    rolledBackFiles: YangKuraImportRolledBackFile[];
    rollbackFailureList: YangKuraImportRollbackFailure[];
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


  interface YangKuraImportPostCopyRefreshPreviewRequest {
    operationPlanId: string;
    targetRootPathToken: string;
    mode: 'post-copy-refresh-preview';
    sourceOperationLogVersion?: 'mvp96-copy-only-operation-log-v1';
    targetRelativePaths?: string[];
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraPostCopyRefreshCandidate {
    id: string;
    targetRelativePath: string;
    entryKind: YangKuraScannerDryRunEntryKind;
    plannedAction: YangKuraScannerDryRunPlannedAction;
    sizeBytes: number;
    warningCodes: string[];
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraPostCopyRefreshBlockedTarget {
    id: string;
    targetRelativePath: string;
    reasonCode: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraPostCopyRefreshPreviewResult {
    ok: boolean;
    status:
      | 'mvp97-post-copy-refresh-preview-ready'
      | 'mvp97-post-copy-refresh-preview-invalid-request'
      | 'mvp97-post-copy-refresh-preview-invalid-root-token'
      | 'mvp97-post-copy-refresh-preview-empty-target-list';
    schemaVersion?: 1;
    refreshPlanVersion?: 'mvp97-post-copy-refresh-plan-v1';
    operationPlanId: string;
    sourceOperationLogVersion?: 'mvp96-copy-only-operation-log-v1';
    mode?: 'post-copy-refresh-preview';
    previewOnly: true;
    targetRootPathToken: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    indexWriteAllowed: false;
    libraryIndexWritten: false;
    scannerRunTriggered: false;
    sqliteWritten: false;
    requestedTargetCount?: number;
    candidateCount: number;
    blockedTargetCount?: number;
    audioCount?: number;
    coverCount?: number;
    subtitleCount?: number;
    warningCount?: number;
    collectionCandidateRelativePaths?: string[];
    refreshCandidates?: YangKuraPostCopyRefreshCandidate[];
    blockedTargets?: YangKuraPostCopyRefreshBlockedTarget[];
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }


  interface YangKuraImportLibraryIndexPatchPreviewRequest {
    operationPlanId: string;
    targetRootPathToken: string;
    mode: 'library-index-patch-preview';
    sourceRefreshPlanVersion?: 'mvp97-post-copy-refresh-plan-v1';
    refreshCandidates?: YangKuraPostCopyRefreshCandidate[];
    maxPatchItems?: number;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexPatchOperationPreview {
    operation: 'upsert-collection' | 'upsert-track' | 'attach-cover' | 'attach-subtitle' | 'warn-only';
    collectionId?: string;
    trackId?: string;
    coverId?: string;
    subtitleId?: string;
    targetRelativePath: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexPatchPreviewPayload {
    schemaVersion: 1;
    generatedAt: string;
    patchPreviewVersion: 'mvp98-library-index-patch-preview-v1';
    sourceKind: 'post-copy-refresh-preview';
    root: {
      id: string;
      rootPathToken: string;
      displayName: string;
      libraryType: YangKuraLibraryType;
      absolutePathReturned: false;
      fileUrlReturned: false;
      absolutePath?: never;
      fileUrl?: never;
    };
    collections: unknown[];
    tracks: unknown[];
    covers: unknown[];
    subtitles: unknown[];
    patchOperations: YangKuraLibraryIndexPatchOperationPreview[];
    warnings: string[];
  }

  interface YangKuraLibraryIndexPatchPreviewResult {
    ok: boolean;
    status:
      | 'mvp98-library-index-patch-preview-ready'
      | 'mvp98-library-index-patch-preview-invalid-request'
      | 'mvp98-library-index-patch-preview-invalid-root-token'
      | 'mvp98-library-index-patch-preview-empty-refresh-candidates';
    schemaVersion?: 1;
    patchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    operationPlanId: string;
    sourceRefreshPlanVersion?: 'mvp97-post-copy-refresh-plan-v1';
    mode?: 'library-index-patch-preview';
    previewOnly: true;
    targetRootPathToken: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    absolutePathReturned: false;
    fileUrlReturned: false;
    indexPatchWriteAllowed: false;
    libraryIndexWritten: false;
    scannerRunTriggered: false;
    sqliteWritten: false;
    requestedCandidateCount?: number;
    consumedCandidateCount?: number;
    patchItemCount: number;
    collectionPatchCount?: number;
    trackPatchCount?: number;
    coverPatchCount?: number;
    subtitlePatchCount?: number;
    warningCount?: number;
    indexPatchPreview?: YangKuraLibraryIndexPatchPreviewPayload;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }


  interface YangKuraImportLibraryIndexPatchWriteReadinessRequest {
    operationPlanId: string;
    targetRootPathToken: string;
    mode: 'library-index-patch-write-readiness';
    sourcePatchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    indexPatchPreview?: YangKuraLibraryIndexPatchPreviewPayload;
    userConfirmedPatchPreview?: boolean;
    createBackup?: boolean;
    confirmationText?: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH' | string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexPatchWriteReadinessResult {
    ok: boolean;
    status:
      | 'mvp99-library-index-patch-write-readiness-ready'
      | 'mvp99-library-index-patch-write-readiness-invalid-request'
      | 'mvp99-library-index-patch-write-readiness-invalid-root-token'
      | 'mvp99-library-index-patch-write-readiness-missing-patch-preview'
      | 'mvp99-library-index-patch-write-readiness-confirmation-required'
      | 'mvp99-library-index-patch-write-readiness-backup-required';
    schemaVersion?: 1;
    readinessVersion?: 'mvp99-library-index-patch-write-readiness-v1';
    operationPlanId: string;
    targetRootPathToken: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    mode?: 'library-index-patch-write-readiness';
    sourcePatchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    previewOnly: true;
    readyForMvp100Write: boolean;
    writeExecutionAllowedInMvp99: false;
    libraryIndexWritten: false;
    scannerRunTriggered: false;
    sqliteWritten: false;
    absolutePathReturned: false;
    fileUrlReturned: false;
    requiredConfirmationText?: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
    confirmationAccepted: boolean;
    backupRequired: true;
    backupPlanPreview?: {
      backupFileNamePattern: 'library-index.backup.before-mvp100-*.json';
      backupLocation: 'same-directory-as-library-index';
      overwriteBackup: false;
      absolutePathReturned: false;
      fileUrlReturned: false;
      absolutePath?: never;
      fileUrl?: never;
    };
    patchOperationCount?: number;
    collectionPatchCount?: number;
    trackPatchCount?: number;
    coverPatchCount?: number;
    subtitlePatchCount?: number;
    warningCount?: number;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }


  interface YangKuraImportLibraryIndexPatchWriteRequest {
    operationPlanId: string;
    targetRootPathToken: string;
    mode: 'library-index-patch-write-confirmed';
    sourceReadinessVersion?: 'mvp99-library-index-patch-write-readiness-v1';
    sourcePatchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    indexPatchPreview?: YangKuraLibraryIndexPatchPreviewPayload;
    userConfirmedPatchWrite?: boolean;
    createBackup?: boolean;
    confirmationText?: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH' | string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraLibraryIndexPatchWriteResult {
    ok: boolean;
    status:
      | 'mvp100-library-index-patch-write-complete'
      | 'mvp100-library-index-patch-write-invalid-request'
      | 'mvp100-library-index-patch-write-invalid-root-token'
      | 'mvp100-library-index-patch-write-missing-patch-preview'
      | 'mvp100-library-index-patch-write-confirmation-required'
      | 'mvp100-library-index-patch-write-backup-required'
      | 'mvp100-library-index-patch-write-missing-index'
      | 'mvp100-library-index-patch-write-read-index-failed'
      | 'mvp100-library-index-patch-write-invalid-current-index'
      | 'mvp100-library-index-patch-write-unsafe-content'
      | 'mvp100-library-index-patch-write-error'
      | 'mvp100-library-index-patch-write-verify-failed';
    schemaVersion?: 1;
    patchWriteVersion?: 'mvp100-library-index-patch-write-v1';
    operationPlanId: string;
    targetRootPathToken: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    mode?: 'library-index-patch-write-confirmed';
    sourceReadinessVersion?: 'mvp99-library-index-patch-write-readiness-v1';
    sourcePatchPreviewVersion?: 'mvp98-library-index-patch-preview-v1';
    indexPatchWritten: boolean;
    libraryIndexWritten: boolean;
    backupCreated: boolean;
    scannerRunTriggered: false;
    sqliteWritten: false;
    absolutePathReturned: false;
    fileUrlReturned: false;
    writtenAt?: string;
    indexRelativePath?: 'library-index.json' | string;
    backupRelativePath?: string;
    bytesWritten?: number;
    sha256?: string;
    requiredConfirmationText?: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
    summary?: {
      before?: unknown;
      after?: unknown;
      collectionsAdded?: number;
      collectionsUpdated?: number;
      tracksAdded?: number;
      tracksUpdated?: number;
      coversAdded?: number;
      coversUpdated?: number;
      subtitlesAdded?: number;
      subtitlesUpdated?: number;
      skippedPatchItems?: number;
    };
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }


  interface YangKuraImportLibraryIndexPatchUiRefreshRequest {
    operationPlanId: string;
    targetRootPathToken: string;
    mode: 'refresh-after-patch-write';
    sourcePatchWriteVersion?: 'mvp100-library-index-patch-write-v1';
    patchWriteStatus?: 'mvp100-library-index-patch-write-complete' | string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportLibraryIndexPatchUiRefreshResult {
    ok: boolean;
    status:
      | 'mvp101-import-ui-refresh-after-patch-complete'
      | 'mvp101-import-ui-refresh-after-patch-invalid-request'
      | 'mvp101-import-ui-refresh-after-patch-invalid-source-write'
      | 'mvp101-import-ui-refresh-after-patch-write-not-complete'
      | 'mvp101-import-ui-refresh-after-patch-invalid-root-token'
      | 'mvp101-import-ui-refresh-after-patch-read-failed';
    schemaVersion?: 1;
    refreshVersion?: 'mvp101-import-ui-refresh-after-patch-v1';
    sourcePatchWriteVersion?: 'mvp100-library-index-patch-write-v1';
    operationPlanId: string;
    targetRootPathToken: string;
    displayName?: string;
    libraryType?: YangKuraLibraryType;
    mode?: 'refresh-after-patch-write';
    indexReadPerformed: boolean;
    rendererRefreshExpected: boolean;
    libraryIndexWritten: false;
    scannerRunTriggered: false;
    sqliteWritten: false;
    fileMutationPerformed: false;
    absolutePathReturned: false;
    fileUrlReturned: false;
    eventName?: 'yang-kura-library-index-loaded';
    cacheKey?: 'yang_kura_last_read_library_index_result';
    readResult?: YangKuraReadLibraryIndexResult;
    summary?: YangKuraReadLibraryIndexSummary;
    message: string;
    safetyNotes: string[];
    absolutePath?: never;
    fileUrl?: never;
  }


interface YangKuraImportMoveOnlyExecuteRequest {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'move-only-small-sample';
  relativePaths?: string[];
  targetRelativePaths?: string[];
  confirmedMoveOnly?: boolean;
  confirmationText?: 'CONFIRM_MOVE_IMPORT' | string;
  overwriteAllowed?: false;
  maxMoveItems?: number;
}

interface YangKuraImportMoveOnlyMovedFile {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  sizeBytes: number;
  moveMethod: 'rename' | 'copy-verify-unlink';
  absolutePathReturned: false;
  fileUrlReturned: false;
  absolutePath?: never;
  fileUrl?: never;
}

interface YangKuraImportMoveOnlyExecuteResult {
  ok: boolean;
  status:
    | 'mvp105-move-only-execute-complete-with-operation-log'
    | 'mvp105-move-only-execute-log-write-failed'
    | 'mvp105-move-only-execute-invalid-request'
    | 'mvp105-move-only-execute-confirmation-required'
    | 'mvp105-move-only-execute-overwrite-blocked'
    | 'mvp105-move-only-execute-invalid-root-token'
    | 'mvp105-move-only-execute-empty-file-list'
    | 'mvp105-move-only-execute-too-many-files'
    | 'u31-move-only-execute-rolled-back'
    | 'u31-move-only-execute-rollback-incomplete';
  executorVersion: 'mvp105-small-sample-move-only-executor-v1';
  operationPlanId: string;
  rootPathToken?: string;
  targetRootPathToken?: string;
  executeAllowed: boolean;
  moveAllowed: boolean;
  copyAllowed?: false;
  overwriteAllowed?: false;
  deleteAllowed?: false;
  renameAllowed?: true;
  sourceDirectoryCleanupAllowed?: false;
  operationLogPersisted?: boolean;
  libraryIndexWritten: false;
  scannerRunTriggered?: false;
  sqliteWritten: false;
  movedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount?: number;
  failureStopTriggered?: boolean;
  transactionVersion?: 'u31-import-transaction-v1';
  createdDirectoryRelativePaths?: string[];
  removedDirectoryRelativePaths?: string[];
  rollbackAttempted?: boolean;
  rollbackSucceeded?: boolean;
  rolledBackCount?: number;
  rollbackFailureCount?: number;
  rolledBackFiles?: YangKuraImportRolledBackFile[];
  rollbackFailureList?: YangKuraImportRollbackFailure[];
  movedFiles?: YangKuraImportMoveOnlyMovedFile[];
  skippedList?: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false; absolutePath?: never; fileUrl?: never }>;
  failureList?: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false; absolutePath?: never; fileUrl?: never }>;
  message: string;
  safetyNotes: string[];
  absolutePathReturned: false;
  fileUrlReturned: false;
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
  interface YangKuraAsmrMetadataProviderRequest { provider: 'dlsite'; rjId: string; mode: 'single-rj-preview'; timeoutMs?: number; cacheMode?: 'prefer-cache' | 'force-refresh'; }
  interface YangKuraAsmrMetadataProviderCacheClearRequest { provider: 'dlsite'; rjId: string; mode: 'clear-single-rj-cache'; }
  interface YangKuraAsmrMetadataProviderCandidate { schemaVersion: 1; provider: 'dlsite'; rjId: string; sourceLabel: string; sourceUrl: string; fetchedAt: string; title?: string; circle?: string; cvs?: string[]; releaseDate?: string; description?: string; tags?: string[]; }
  interface YangKuraAsmrMetadataProviderCacheInfo { source: 'memory-cache' | 'network'; cacheHit: boolean; cachedAt: string; expiresAt: string; ttlMs: number; nextNetworkAllowedAt?: string; }
  interface YangKuraAsmrMetadataProviderSuccessResult { ok: true; status: 'mvp119-dlsite-single-rj-metadata-ready'; provider: 'dlsite'; requestedRjId: string; fetchedAt: string; candidate: YangKuraAsmrMetadataProviderCandidate; cache: YangKuraAsmrMetadataProviderCacheInfo; networkRequestPerformed: boolean; metadataWritePerformed: false; mediaFileMutationPerformed: false; absolutePathReturned: false; fileUrlReturned: false; message: string; safetyNotes: string[]; absolutePath?: never; fileUrl?: never; }
  interface YangKuraAsmrMetadataProviderErrorResult { ok: false; status: 'mvp119-dlsite-invalid-request' | 'mvp119-dlsite-throttled' | 'mvp119-dlsite-timeout' | 'mvp119-dlsite-not-found' | 'mvp119-dlsite-http-error' | 'mvp119-dlsite-network-error' | 'mvp119-dlsite-parse-error'; provider: 'dlsite'; requestedRjId: string; networkRequestPerformed: boolean; retryAfterMs?: number; nextNetworkAllowedAt?: string; cachedCandidateAvailable?: boolean; metadataWritePerformed: false; mediaFileMutationPerformed: false; absolutePathReturned: false; fileUrlReturned: false; message: string; safetyNotes: string[]; absolutePath?: never; fileUrl?: never; }
  interface YangKuraAsmrMetadataProviderCacheClearResult { ok: boolean; status: 'mvp119-dlsite-cache-cleared' | 'mvp119-dlsite-cache-clear-invalid-request'; provider: 'dlsite'; requestedRjId: string; cleared: boolean; metadataWritePerformed: false; mediaFileMutationPerformed: false; absolutePathReturned: false; fileUrlReturned: false; message: string; safetyNotes: string[]; absolutePath?: never; fileUrl?: never; }
  type YangKuraAsmrMetadataProviderResult = YangKuraAsmrMetadataProviderSuccessResult | YangKuraAsmrMetadataProviderErrorResult;

  interface YangKuraMpvPlaybackStartRequest { rootPathToken: string; relativePath: string; trackId: string; mode: 'mpv-playback-start'; startSeconds?: number; volume?: number; muted?: boolean; }
  type YangKuraMpvPlaybackCommandRequest =
    | { mode: 'mpv-playback-command'; command: 'pause' | 'resume' | 'stop' }
    | { mode: 'mpv-playback-command'; command: 'seek'; seconds: number }
    | { mode: 'mpv-playback-command'; command: 'set-volume'; volume: number }
    | { mode: 'mpv-playback-command'; command: 'set-muted'; muted: boolean };
  interface YangKuraMpvPlaybackStartResult { ok: boolean; status: 'mvp122-mpv-started' | 'mvp122-mpv-unavailable' | 'mvp122-mpv-start-failed'; backend: 'mpv' | 'html-audio-fallback'; trackId: string; message: string; executableLabel: string; absolutePathReturned: false; fileUrlReturned: false; absolutePath?: never; fileUrl?: never; }
  interface YangKuraMpvPlaybackCommandResult { ok: boolean; status: 'mvp122-mpv-command-accepted' | 'mvp122-mpv-not-running' | 'mvp122-mpv-command-failed'; command: string; message: string; absolutePathReturned: false; fileUrlReturned: false; absolutePath?: never; fileUrl?: never; }
  interface YangKuraMpvRuntimeStatus { status: 'mvp122-mpv-runtime-status'; configuredExecutable: string; running: boolean; connected: boolean; activeTrackId: string | null; fallbackAvailable: true; seekStrategy: 'coalesced-absolute-exact'; pendingSeek: boolean; lastKnownPositionSeconds: number; lastKnownDurationSeconds: number; lastErrorMessage: string | null; lastExitReason: string | null; shutdownState: 'idle' | 'graceful' | 'forced'; processStartedAt: string | null; absolutePathReturned: false; fileUrlReturned: false; absolutePath?: never; fileUrl?: never; }
  interface YangKuraMpvInstallationStatus { status: 'mvp123-mpv-installation-status'; available: boolean; source: 'environment' | 'user-selected' | 'system-path' | 'none'; executableLabel: string; versionLabel: string | null; configured: boolean; canSelectExecutable: true; canClearUserSelection: boolean; checkedAt: string; message: string; running: boolean; connected: boolean; activeTrackId: string | null; seekStrategy: 'coalesced-absolute-exact'; pendingSeek: boolean; lastKnownPositionSeconds: number; lastKnownDurationSeconds: number; lastErrorMessage: string | null; lastExitReason: string | null; shutdownState: 'idle' | 'graceful' | 'forced'; processStartedAt: string | null; absolutePathReturned: false; fileUrlReturned: false; absolutePath?: never; fileUrl?: never; }
  interface YangKuraMpvExecutableActionResult extends YangKuraMpvInstallationStatus { ok: boolean; actionStatus: 'mvp123-mpv-selection-cancelled' | 'mvp123-mpv-executable-selected' | 'mvp123-mpv-executable-invalid' | 'mvp123-mpv-executable-cleared'; }
  type YangKuraMpvPlaybackEvent =
    | { type: 'ready'; trackId: string; backend: 'mpv'; at: string }
    | { type: 'time'; trackId: string; positionSeconds: number; at: string }
    | { type: 'duration'; trackId: string; durationSeconds: number; at: string }
    | { type: 'pause-state'; trackId: string; paused: boolean; at: string }
    | { type: 'ended'; trackId: string; reason: string; at: string }
    | { type: 'error'; trackId: string; message: string; at: string }
    | { type: 'fallback-requested'; trackId: string; resumeSeconds: number; reason: string; message: string; at: string };

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
    canUseMpvPlayback: true;
    canConfigureMpvExecutable: true;
    canReadTrackLyrics: true;
    canOpenExternalFile: true;
    canOpenInFileManager: true;
    canFetchSingleRjMetadata: true;
    canUseCopyOnlyStub: true;
    canUseCopyOnlyPreflightRealCheck: true;
    canExecuteCopyOnly: true;
    canPersistCopyOnlyOperationLog: true;
    canPreviewPostCopyRefresh: true;
    canPreviewLibraryIndexPatch: true;
    canCheckLibraryIndexPatchWriteReadiness: true;
    canWriteLibraryIndexPatch: true;
    canCheckLibraryIndexHealth: true;
    canPreviewMissingIndexRemoval: true;
    canWriteControlledIndexRemoval: true;
    canListIndexBackups: true;
    canRestoreIndexBackup: true;
    canPreviewBackupRetention: true;
    canReadIndexMaintenanceHistory: true;
    canRevealNearestExistingParent: true;
    canRefreshLibraryIndexAfterPatch: true;
    canExecuteMoveOnly: true;
    registersMediaProtocol: true;
    exposesAbsolutePaths: false;
  }

  interface YangKuraRendererApi {
    selectLibraryRoot(request: YangKuraSelectLibraryRootRequest): Promise<YangKuraSelectLibraryRootResult>;
    requestScannerDryRun(request: YangKuraScannerDryRunRequest): Promise<YangKuraScannerDryRunResult>;
    requestWriteIndexPreview(request: YangKuraWriteIndexPreviewRequest): Promise<YangKuraWriteIndexPreviewResult>;
    requestWriteLibraryIndex(request: YangKuraWriteLibraryIndexRequest): Promise<YangKuraWriteLibraryIndexResult>;
    requestReadLibraryIndex(request: YangKuraReadLibraryIndexRequest): Promise<YangKuraReadLibraryIndexResult>;
    requestLibraryIndexHealthCheck(request: YangKuraLibraryIndexHealthCheckRequest): Promise<YangKuraLibraryIndexHealthCheckResult>;
    requestLibraryIndexRemovalPreview(request: YangKuraLibraryIndexRemovalPreviewRequest): Promise<YangKuraLibraryIndexRemovalPreviewResult>;
    requestLibraryIndexRemovalWrite(request: YangKuraLibraryIndexRemovalWriteRequest): Promise<YangKuraLibraryIndexRemovalWriteResult>;
    requestLibraryIndexBackupList(request: YangKuraLibraryIndexBackupListRequest): Promise<YangKuraLibraryIndexBackupListResult>;
    requestLibraryIndexBackupRestore(request: YangKuraLibraryIndexBackupRestoreRequest): Promise<YangKuraLibraryIndexBackupRestoreResult>;
    requestLibraryIndexBackupRetentionPreview(request: YangKuraLibraryIndexBackupRetentionPreviewRequest): Promise<YangKuraLibraryIndexBackupRetentionPreviewResult>;
    requestLibraryIndexMaintenanceHistory(request: YangKuraLibraryIndexMaintenanceHistoryRequest): Promise<YangKuraLibraryIndexMaintenanceHistoryResult>;
    requestRevealMissingEntryParent(request: YangKuraRevealMissingEntryParentRequest): Promise<YangKuraRevealMissingEntryParentResult>;
    requestResolveTrackMediaUrl(request: YangKuraResolveTrackMediaUrlRequest): Promise<YangKuraResolveTrackMediaUrlResult>;
    requestMpvPlaybackStart(request: YangKuraMpvPlaybackStartRequest): Promise<YangKuraMpvPlaybackStartResult>;
    requestMpvPlaybackCommand(request: YangKuraMpvPlaybackCommandRequest): Promise<YangKuraMpvPlaybackCommandResult>;
    getMpvPlaybackStatus(): Promise<YangKuraMpvRuntimeStatus>;
    getMpvInstallationStatus(): Promise<YangKuraMpvInstallationStatus>;
    selectMpvExecutable(): Promise<YangKuraMpvExecutableActionResult>;
    clearMpvExecutable(): Promise<YangKuraMpvExecutableActionResult>;
    onMpvPlaybackEvent(listener: (event: YangKuraMpvPlaybackEvent) => void): () => void;
    requestReadTrackLyrics(request: YangKuraReadTrackLyricsRequest): Promise<YangKuraReadTrackLyricsResult>;
    requestOpenExternalFile(request: YangKuraOpenExternalFileRequest): Promise<YangKuraOpenExternalFileResult>;
    requestOpenInFileManager(request: YangKuraOpenInFileManagerRequest): Promise<YangKuraOpenInFileManagerResult>;
    requestAsmrMetadataProvider(request: YangKuraAsmrMetadataProviderRequest): Promise<YangKuraAsmrMetadataProviderResult>;
    clearAsmrMetadataProviderCache(request: YangKuraAsmrMetadataProviderCacheClearRequest): Promise<YangKuraAsmrMetadataProviderCacheClearResult>;
    requestImportCopyOnlyPreflight(request: YangKuraImportCopyOnlyStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    requestImportCopyOnlyConfirm(request: YangKuraImportCopyOnlyConfirmStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    requestImportCopyOnlyExecute(request: YangKuraImportCopyOnlyStubRequest): Promise<YangKuraImportCopyOnlyStubResult>;
    requestImportPostCopyRefreshPreview(request: YangKuraImportPostCopyRefreshPreviewRequest): Promise<YangKuraPostCopyRefreshPreviewResult>;
    requestImportLibraryIndexPatchPreview(request: YangKuraImportLibraryIndexPatchPreviewRequest): Promise<YangKuraLibraryIndexPatchPreviewResult>;
    requestImportLibraryIndexPatchWriteReadiness(request: YangKuraImportLibraryIndexPatchWriteReadinessRequest): Promise<YangKuraLibraryIndexPatchWriteReadinessResult>;
    requestImportLibraryIndexPatchWrite(request: YangKuraImportLibraryIndexPatchWriteRequest): Promise<YangKuraLibraryIndexPatchWriteResult>;
    requestImportLibraryIndexPatchRefreshAfterWrite(request: YangKuraImportLibraryIndexPatchUiRefreshRequest): Promise<YangKuraImportLibraryIndexPatchUiRefreshResult>;
    requestImportMoveOnlyExecute(request: YangKuraImportMoveOnlyExecuteRequest): Promise<YangKuraImportMoveOnlyExecuteResult>;
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
