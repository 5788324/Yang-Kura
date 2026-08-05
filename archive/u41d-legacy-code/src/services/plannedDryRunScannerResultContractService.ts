import type {IndexSourceKind, LibraryRootType} from '../types';

export type ScannerDryRunMode = 'dry-run';
export type ScannerScanProfile = 'asmr-rj' | 'music-folder' | 'mixed-folder';
export type ScannerEntryKind = 'audio' | 'video' | 'image' | 'cover' | 'subtitle' | 'directory-marker' | 'unsupported';
export type ScannerEntryAction = 'include-track' | 'attach-cover' | 'attach-subtitle' | 'create-collection-candidate' | 'warn-only' | 'ignore';
export type ScannerWarningSeverity = 'info' | 'warning' | 'error';

export interface ScannerSafetyLimitsContract {
  maxEntries: number;
  maxDepth: number;
  includeHidden: false;
  followSymlinks: false;
  allowNetwork: false;
  allowFileMutation: false;
  allowIndexWrite: false;
}

export interface ScannerDryRunRequestContract {
  requestVersion: 1;
  rootId: string;
  rootLabel: string;
  /** UI-selected token. This is not a real path in MVP-10. */
  rootPathToken: '<user-selected-root>';
  libraryType: LibraryRootType;
  scanProfile: ScannerScanProfile;
  mode: ScannerDryRunMode;
  previewOnly: true;
  limits: ScannerSafetyLimitsContract;
}

export interface ScannerDryRunDiscoveredEntryContract {
  id: string;
  relativePath: string;
  entryKind: ScannerEntryKind;
  parserStatus: 'parsed' | 'parsed-with-warning' | 'unsupported';
  plannedAction: ScannerEntryAction;
  collectionCandidate?: string;
  trackCandidate?: string;
  rjIdNorm?: string;
  warningCodes: string[];
}

export interface ScannerDryRunWarningContract {
  code: string;
  severity: ScannerWarningSeverity;
  message: string;
  hint: string;
  affectedRelativePath?: string;
}

export interface ScannerDryRunBlockedReasonContract {
  code: string;
  message: string;
  blockedUntil: string;
}

export interface ScannerDryRunPreviewSummaryContract {
  sourceKind: IndexSourceKind;
  previewOnly: true;
  discoveredEntryCount: number;
  collectionCandidateCount: number;
  trackCandidateCount: number;
  coverCandidateCount: number;
  subtitleCandidateCount: number;
  warningCount: number;
  blockedReasonCount: number;
  canWriteIndex: false;
}

export interface ScannerDryRunOutputShapeContract {
  localJsonIndexDraft: 'LocalJsonIndex | undefined';
  scannerReport: 'FixtureScannerReport-compatible summary | undefined';
  discoveredEntries: 'ScannerDryRunDiscoveredEntry[]';
  warnings: 'ScannerDryRunWarning[]';
  blockedReasons: 'ScannerDryRunBlockedReason[]';
  writeTarget: 'never during dry-run';
}

export interface PlannedDryRunScannerResultContract {
  contractVersion: 1;
  title: 'MVP-10 Planned Dry-Run Scanner Result Contract';
  status: 'planned-only';
  stageGate: string;
  request: ScannerDryRunRequestContract;
  summary: ScannerDryRunPreviewSummaryContract;
  outputShape: ScannerDryRunOutputShapeContract;
  discoveredEntries: ScannerDryRunDiscoveredEntryContract[];
  warnings: ScannerDryRunWarningContract[];
  blockedReasons: ScannerDryRunBlockedReasonContract[];
  safetyChecklist: string[];
  nextActions: string[];
}

const defaultLimits = (): ScannerSafetyLimitsContract => ({
  maxEntries: 5000,
  maxDepth: 8,
  includeHidden: false,
  followSymlinks: false,
  allowNetwork: false,
  allowFileMutation: false,
  allowIndexWrite: false,
});

export const plannedDryRunScannerResultContractService = {
  getContract(): PlannedDryRunScannerResultContract {
    const discoveredEntries: ScannerDryRunDiscoveredEntryContract[] = [
      {
        id: 'planned_entry_asmr_audio_01',
        relativePath: 'RJ01234567_雨音耳かき/01_本編.mp3',
        entryKind: 'audio',
        parserStatus: 'parsed',
        plannedAction: 'include-track',
        collectionCandidate: 'RJ01234567_雨音耳かき',
        trackCandidate: '01_本編',
        rjIdNorm: 'RJ01234567',
        warningCodes: [],
      },
      {
        id: 'planned_entry_cover_01',
        relativePath: 'RJ01234567_雨音耳かき/cover.jpg',
        entryKind: 'cover',
        parserStatus: 'parsed',
        plannedAction: 'attach-cover',
        collectionCandidate: 'RJ01234567_雨音耳かき',
        rjIdNorm: 'RJ01234567',
        warningCodes: [],
      },
      {
        id: 'planned_entry_subtitle_01',
        relativePath: 'RJ01234567_雨音耳かき/01_本編.zh.lrc',
        entryKind: 'subtitle',
        parserStatus: 'parsed',
        plannedAction: 'attach-subtitle',
        collectionCandidate: 'RJ01234567_雨音耳かき',
        trackCandidate: '01_本編',
        rjIdNorm: 'RJ01234567',
        warningCodes: [],
      },
      {
        id: 'planned_entry_unsupported_01',
        relativePath: 'RJ01234567_雨音耳かき/readme.url',
        entryKind: 'unsupported',
        parserStatus: 'unsupported',
        plannedAction: 'warn-only',
        collectionCandidate: 'RJ01234567_雨音耳かき',
        rjIdNorm: 'RJ01234567',
        warningCodes: ['unsupported-extension'],
      },
    ];

    const warnings: ScannerDryRunWarningContract[] = [
      {
        code: 'unsupported-extension',
        severity: 'info',
        message: '发现不进入媒体库的扩展名；dry-run 只记录，不阻塞。',
        hint: '真实 scanner 只把音频、视频、图片、封面、字幕纳入候选结果。',
        affectedRelativePath: 'RJ01234567_雨音耳かき/readme.url',
      },
      {
        code: 'preview-only',
        severity: 'warning',
        message: '当前结果只是 dry-run 预览；不会写 library-index.json。',
        hint: 'write-index 必须是后续独立任务，并需要 UI 二次确认。',
      },
    ];

    const blockedReasons: ScannerDryRunBlockedReasonContract[] = [
      {
        code: 'electron-ipc-not-implemented',
        message: '当前 React/Vite 原型还没有 Electron main/preload IPC，不能读取真实目录。',
        blockedUntil: 'Electron shell + safe scanner IPC contract is implemented.',
      },
      {
        code: 'write-index-disabled',
        message: 'dry-run 阶段禁止写 library-index.json。',
        blockedUntil: 'Dry-run report is visible and user confirms write-index in a separate flow.',
      },
    ];

    return {
      contractVersion: 1,
      title: 'MVP-10 Planned Dry-Run Scanner Result Contract',
      status: 'planned-only',
      stageGate: 'MVP-10 只定义未来真实扫描 dry-run 的结果结构；不读取真实目录、不写 library-index.json、不接 Electron。',
      request: {
        requestVersion: 1,
        rootId: 'planned_user_selected_root',
        rootLabel: '用户手动选择的资源库根目录',
        rootPathToken: '<user-selected-root>',
        libraryType: 'mixed',
        scanProfile: 'mixed-folder',
        mode: 'dry-run',
        previewOnly: true,
        limits: defaultLimits(),
      },
      summary: {
        sourceKind: 'electron-scan',
        previewOnly: true,
        discoveredEntryCount: discoveredEntries.length,
        collectionCandidateCount: 1,
        trackCandidateCount: 1,
        coverCandidateCount: 1,
        subtitleCandidateCount: 1,
        warningCount: warnings.length,
        blockedReasonCount: blockedReasons.length,
        canWriteIndex: false,
      },
      outputShape: {
        localJsonIndexDraft: 'LocalJsonIndex | undefined',
        scannerReport: 'FixtureScannerReport-compatible summary | undefined',
        discoveredEntries: 'ScannerDryRunDiscoveredEntry[]',
        warnings: 'ScannerDryRunWarning[]',
        blockedReasons: 'ScannerDryRunBlockedReason[]',
        writeTarget: 'never during dry-run',
      },
      discoveredEntries,
      warnings,
      blockedReasons,
      safetyChecklist: [
        'request.mode 必须是 dry-run。',
        'request.previewOnly 必须是 true。',
        'summary.canWriteIndex 必须是 false。',
        'limits.followSymlinks 必须是 false。',
        'limits.allowFileMutation 必须是 false。',
        'discoveredEntries 只能使用 relativePath，不允许 absolutePath/fileUrl 出现在 UI 原型层。',
      ],
      nextActions: [
        'MVP-11：把 dry-run contract 接入 Settings/Diagnostics 展示，不实现真实文件访问。',
        'MVP-12：设计 Electron IPC stub；先返回 fixture-like dry-run result。',
        'MVP-13：用户选择小样本目录后做 read-only dry-run，不写 index。',
      ],
    };
  },
};
