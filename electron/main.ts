/**
 * MVP-23 Electron main process entry.
 *
 * MVP-19 added the first real directory dialog. MVP-20 added a read-only dry-run scanner. MVP-21/MVP-22 persist the
 * latest dry-run report for Diagnostics and generate a library-index write
 * preview. MVP-23 adds the first confirmed write of library-index.json inside
 * the user-selected root. MVP-24 adds a read-current-index flow so the renderer
 * can load the sanitized Local JSON Index and map it into the existing library UI.
 * MVP-25 adds a controlled media URL resolver and yang-kura-media:// protocol
 * so HTMLAudio can play tokenized local audio without exposing absolutePath or file://.
 * MVP-26 adds read-only LRC/SRT/VTT/ASS subtitle text reading and converts it
 * into LRC-compatible lines for the existing lyrics panel. MVP-27 adds external
 * opening for video/image/files and system file-manager reveal. MVP-28 adds desktop validation
 * scripts, Windows acceptance checklist, and packaging-readiness documentation. MVP-94 adds
 * copy-only preflight real-checks in main-side token space while still blocking copy execution. MVP-95 adds
 * the first confirmed copy-only executor: copy only, no move/delete/rename, overwrite=false, and no library-index mutation. MVP-96 persists a minimal
 * append-only copy OperationLog JSONL file with sanitized relative-path-only entries after copy execution. MVP-97 adds a
 * post-copy refresh preview gate: read-only target checks and index refresh plan, still no library-index mutation. MVP-98 adds
 * library-index patch preview from refreshCandidates: preview collections/tracks/covers/subtitles only, still no library-index mutation. MVP-99 adds
 * confirmed library-index patch write readiness: confirmation + backup gate for MVP100. MVP-100 adds the first confirmed
 * library-index.json patch write for copy-only additions: backup first, merge only, no delete, no SQLite. MVP-101 adds
 * post-patch UI refresh: read current library-index.json after a confirmed patch write so the renderer can refresh library views without a full scan.
 * MVP-105 adds the first small-sample move-only executor: CONFIRM_MOVE_IMPORT, overwrite=false, failure-stop, sanitized OperationLog, no index write.
 */

import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from 'electron';
// Legacy MVP-19 verifier import token: import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import crypto from 'node:crypto';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { clearDlsiteMetadataCache, fetchDlsiteMetadata, type DlsiteMetadataCacheClearRequest, type DlsiteMetadataRequest } from './dlsiteMetadataProvider.js';
import { MpvPlaybackBackend, type MpvPlaybackCommand } from './mpvPlaybackBackend.js';
import { MpvSettingsStore } from './mpvSettingsStore.js';
import { applyLibraryIndexRemovalOperations, buildLibraryIndexRemovalPreview, collectLibraryIndexHealthReferences, type LibraryIndexHealthReference, type LibraryIndexHealthStatus, type LibraryIndexRemovalPreviewOperation } from './libraryIndexHealthService.js';
import { appendMaintenanceHistory, buildLibraryIndexBackupRetentionPreview, inspectLibraryIndexBackups, readMaintenanceHistory, restoreLibraryIndexFromBackup, type MaintenanceHistoryEntry } from './libraryIndexMaintenanceService.js';
import { describeLibraryIndexReadError, parseLibraryIndexJsonBuffer } from './libraryIndexJsonReader.js';
import { IMPORT_TRANSACTION_VERSION, executeCopyOnlyTransaction, executeMoveOnlyTransaction } from './importerTransactionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');

const isDevShell = process.env.YANG_KURA_ELECTRON_DEV === '1';
const viteDevUrl = process.env.YANG_KURA_VITE_DEV_URL ?? 'http://127.0.0.1:3000';
const stableUserDataPath = path.join(app.getPath('appData'), 'Yang-Kura');
const stableSessionDataPath = path.join(stableUserDataPath, 'session');
const stableCachePath = path.join(stableUserDataPath, 'cache');
const stableLogsPath = path.join(stableUserDataPath, 'logs');
const stableCrashDumpsPath = path.join(stableUserDataPath, 'crashDumps');

function configureStableAppStorage(): void {
  [stableUserDataPath, stableSessionDataPath, stableCachePath, stableLogsPath, stableCrashDumpsPath].forEach((item) => {
    fsSync.mkdirSync(item, { recursive: true });
  });

  app.setPath('userData', stableUserDataPath);
  app.setPath('sessionData', stableSessionDataPath);
  app.setPath('logs', stableLogsPath);
  app.setPath('crashDumps', stableCrashDumpsPath);
  app.commandLine.appendSwitch('disk-cache-dir', stableCachePath);
}

configureStableAppStorage();

const mpvSettingsStore = new MpvSettingsStore(path.join(stableUserDataPath, 'mpv-settings.json'));

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'yang-kura-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: false,
    },
  },
]);

/* Legacy verifier token retained for MVP-26 compatibility: mvp26-shell-runtime-track-lyrics-read.
 * Legacy verifier token retained for MVP-20 compatibility: status: 'mvp20-shell-runtime-read-only-dry-run'. */
export type ElectronMainShellStatus = 'mvp28-shell-runtime-validation-ready';

type YangKuraLibraryType = 'asmr' | 'music' | 'mixed';
type DryRunEntryKind = 'audio' | 'video' | 'image' | 'cover' | 'subtitle' | 'text' | 'archive' | 'directory' | 'other' | 'unsupported';
type DryRunPlannedAction = 'include-track' | 'attach-cover' | 'attach-subtitle' | 'create-collection-candidate' | 'warn-only' | 'ignore';

interface SelectLibraryRootRequest {
  libraryType: YangKuraLibraryType;
  reason: 'user-selected-library-root';
}

interface ScannerDryRunRequest {
  rootPathToken: string;
  mode: 'dry-run';
  previewOnly: true;
  maxEntries?: number;
  maxDepth?: number;
}

interface WriteIndexPreviewRequest {
  rootPathToken: string;
  mode: 'preview-only';
  dryRunScannedAt?: string;
  maxPreviewEntries?: number;
}

interface WriteLibraryIndexRequest {
  rootPathToken: string;
  mode: 'confirmed-write';
  dryRunScannedAt?: string;
  createBackup?: boolean;
  maxWriteEntries?: number;
}

interface ReadLibraryIndexRequest {
  rootPathToken: string;
  mode: 'read-current-index';
}

interface LibraryIndexHealthCheckRequest {
  rootPathToken: string;
  mode: 'read-only-health-check';
  maxEntries?: number;
}

interface LibraryIndexRemovalPreviewRequest {
  rootPathToken: string;
  mode: 'remove-missing-preview';
  issueIds?: string[];
}

interface LibraryIndexRemovalWriteRequest {
  rootPathToken: string;
  mode: 'confirmed-index-removal-write';
  sourceIndexSha256: string;
  previewGeneratedAt: string;
  userConfirmed: boolean;
  confirmationText: string;
  createBackup: boolean;
}

interface RevealMissingEntryParentRequest {
  rootPathToken: string;
  relativePath: string;
  entryId: string;
  mode: 'reveal-nearest-existing-parent';
}

interface LibraryIndexBackupListRequest {
  rootPathToken: string;
  mode: 'list-index-backups';
  maxEntries?: number;
}

interface LibraryIndexBackupRestoreRequest {
  rootPathToken: string;
  mode: 'restore-index-backup';
  backupRelativePath: string;
  backupSha256: string;
  confirmationText: string;
  createCurrentBackup: boolean;
}

interface LibraryIndexBackupRetentionPreviewRequest {
  rootPathToken: string;
  mode: 'preview-backup-retention';
  maxAgeDays?: number;
  keepNewest?: number;
}

interface LibraryIndexMaintenanceHistoryRequest {
  rootPathToken: string;
  mode: 'read-index-maintenance-history';
  maxEntries?: number;
}

interface ResolveTrackMediaUrlRequest {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  expectedKind: 'audio';
}

interface MpvPlaybackStartRequest {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  mode: 'mpv-playback-start';
  startSeconds?: number;
  volume?: number;
  muted?: boolean;
}

interface MpvPlaybackCommandRequest {
  mode: 'mpv-playback-command';
  command: MpvPlaybackCommand['command'];
  seconds?: number;
  volume?: number;
  muted?: boolean;
}

interface ReadTrackLyricsRequest {
  rootPathToken: string;
  trackId: string;
  trackRelativePath: string;
  mode: 'read-track-lyrics';
  subtitleRelativePaths?: string[];
  maxBytes?: number;
}


interface OpenExternalFileRequest {
  rootPathToken: string;
  relativePath: string;
  entryId: string;
  mode: 'open-external-file';
  expectedKind: 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other';
}

interface OpenInFileManagerRequest {
  rootPathToken: string;
  relativePath?: string;
  entryId?: string;
  mode: 'open-in-file-manager';
}

interface AsmrMetadataProviderRequest extends DlsiteMetadataRequest {}
interface AsmrMetadataProviderCacheClearRequest extends DlsiteMetadataCacheClearRequest {}


interface ImportCopyOnlyStubRequest {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  mode: 'copy-only-stub';
  relativePaths?: string[];
  targetRelativePaths?: string[];
  confirmedCopyOnly?: boolean;
  confirmationText?: string;
}

interface ImportCopyOnlyConfirmStubRequest {
  operationPlanId: string;
  confirmationText: string;
  mode: 'copy-only-confirm-stub';
}

interface ImportCopyOnlyCancelStubRequest {
  operationPlanId: string;
  mode: 'copy-only-cancel-stub';
}

interface ImportPostCopyRefreshPreviewRequest {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'post-copy-refresh-preview';
  sourceOperationLogVersion?: 'mvp96-copy-only-operation-log-v1';
  targetRelativePaths?: string[];
}

interface ImportLibraryIndexPatchPreviewRequest {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'library-index-patch-preview';
  sourceRefreshPlanVersion?: 'mvp97-post-copy-refresh-plan-v1';
  refreshCandidates?: Array<{
    id?: string;
    targetRelativePath?: string;
    entryKind?: DryRunEntryKind;
    plannedAction?: DryRunPlannedAction;
    sizeBytes?: number;
    warningCodes?: string[];
  }>;
  maxPatchItems?: number;
}


interface ImportLibraryIndexPatchWriteReadinessRequest {
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
  confirmationText?: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH' | string;
}

interface ImportLibraryIndexPatchWriteRequest {
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
  confirmationText?: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH' | string;
}

interface ImportLibraryIndexPatchUiRefreshRequest {
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'refresh-after-patch-write';
  sourcePatchWriteVersion?: 'mvp100-library-index-patch-write-v1';
  patchWriteStatus?: 'mvp100-library-index-patch-write-complete' | string;
}


interface ImportMoveOnlyExecuteRequest {
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

interface ImportCopyOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp96-copy-only-operation-log-v1';
  transactionVersion: typeof IMPORT_TRANSACTION_VERSION;
  operationId: string;
  operationPlanId: string;
  eventType: 'copy-only-execute';
  mode: 'copy-only';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  createdDirectoryRelativePaths: string[];
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackCount: number;
  rollbackFailureCount: number;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
}



interface ImportMoveOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp105-move-only-operation-log-v1';
  transactionVersion: typeof IMPORT_TRANSACTION_VERSION;
  operationId: string;
  operationPlanId: string;
  eventType: 'move-only-execute';
  mode: 'move-only';
  executorVersion: 'mvp105-small-sample-move-only-executor-v1';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  movedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  failureStopTriggered: boolean;
  createdDirectoryRelativePaths: string[];
  movedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; moveMethod: 'rename' | 'copy-verify-unlink' }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackCount: number;
  rollbackFailureCount: number;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
  sqliteWritten: false;
}

interface TokenizedRootRecord {
  rootPathToken: string;
  absolutePath: string;
  displayName: string;
  libraryType: YangKuraLibraryType;
  selectedAt: string;
}

interface DryRunDiscoveredEntry {
  id: string;
  relativePath: string;
  entryKind: DryRunEntryKind;
  plannedAction: DryRunPlannedAction;
  parserStatus: 'parsed' | 'parsed-with-warning' | 'unsupported';
  collectionCandidate?: string;
  trackCandidate?: string;
  rjIdNorm?: string;
  extension?: string;
  sizeBytes?: number;
  mtimeMs?: number;
  warningCodes: string[];
}

interface DryRunWarning {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedRelativePath?: string;
}

interface DryRunBlockedReason {
  code: string;
  message: string;
}

interface DryRunSuccessPayload {
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
  summary: {
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
  };
  discoveredEntries: DryRunDiscoveredEntry[];
  warnings: DryRunWarning[];
  blockedReasons: DryRunBlockedReason[];
  message: string;
  safetyNotes: string[];
}

const rootTokenMap = new Map<string, TokenizedRootRecord>();
const lastDryRunResultMap = new Map<string, DryRunSuccessPayload>();
const lastLibraryIndexHealthCheckMap = new Map<string, { indexSha256: string; index: unknown; references: LibraryIndexHealthReference[]; problemIssueIds: string[] }>();
const lastLibraryIndexRemovalPreviewMap = new Map<string, { sourceIndexSha256: string; generatedAt: string; operations: LibraryIndexRemovalPreviewOperation[] }>();
const indexMaintenanceHistoryPath = path.join(stableUserDataPath, 'index-maintenance-history.jsonl');

function rootFingerprint(rootRecord: TokenizedRootRecord): string {
  return crypto.createHash('sha256').update(path.resolve(rootRecord.absolutePath)).digest('hex');
}

async function recordIndexMaintenance(rootRecord: TokenizedRootRecord, entry: Omit<MaintenanceHistoryEntry, 'historyVersion' | 'id' | 'rootFingerprint' | 'displayName' | 'libraryType' | 'mediaFilesDeleted' | 'absolutePathsStored'>): Promise<void> {
  try {
    await appendMaintenanceHistory(indexMaintenanceHistoryPath, {
      historyVersion: 'mvp129-index-maintenance-history-v1',
      id: crypto.randomUUID(),
      rootFingerprint: rootFingerprint(rootRecord),
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      mediaFilesDeleted: false,
      absolutePathsStored: false,
      ...entry,
    });
  } catch {
    // Maintenance history is non-critical and must never block index safety operations.
  }
}

export interface ElectronMainShellRuntimeStatus {
  status: ElectronMainShellStatus;
  createsBrowserWindow: true;
  loadsViteDevUrl: boolean;
  loadsBuiltDist: boolean;
  registersScannerIpcHandlers: true;
  opensDirectoryDialog: true;
  readsRealDirectory: true;
  readOnlyDryRunScansEnabled: true;
  /* Legacy verifier token retained for MVP-19/20: writesLibraryIndex: false. */
  writesLibraryIndex: true;
  canGenerateIndexWritePreview: true;
  canWriteLibraryIndex: true;
  canReadLibraryIndex: true;
  canCheckLibraryIndexHealth: true;
  canWriteControlledIndexRemoval: true;
  canListIndexBackups: true;
  canRestoreIndexBackup: true;
  canPreviewBackupRetention: true;
  canReadIndexMaintenanceHistory: true;
  canResolveMediaTrackUrl: true;
  canUseMpvPlayback: true;
  canReadTrackLyrics: true;
  canOpenExternalFile: true;
  canOpenInFileManager: true;
  registersMediaProtocol: true;
  exposesAbsolutePathsToRenderer: false;
}

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'ape']);
const HTML_AUDIO_PLAYABLE_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'avi', 'mov']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']);
const SUBTITLE_EXTENSIONS = new Set(['lrc', 'srt', 'vtt', 'ass', 'txt']);
const READABLE_SUBTITLE_EXTENSIONS = new Set(['lrc', 'srt', 'vtt', 'ass']);
const TEXT_EXTENSIONS = new Set(['md', 'nfo', 'cue', 'json', 'pdf']);
const ARCHIVE_EXTENSIONS = new Set(['zip', '7z', 'rar']);
const COVER_BASENAMES = new Set(['cover', 'folder', 'front', 'jacket', 'scan', 'package']);

function isValidLibraryType(value: unknown): value is YangKuraLibraryType {
  return value === 'asmr' || value === 'music' || value === 'mixed';
}

function getDefaultDisplayName(libraryType: YangKuraLibraryType): string {
  if (libraryType === 'music') return '本地音乐库';
  if (libraryType === 'mixed') return '混合媒体库';
  return '本地音声库';
}

function buildSafetyNotes(): string[] {
  return [
    '真实 absolutePath 只保存在 Electron main 侧 token map。',
    'Renderer 只接收 rootPathToken / displayName / libraryType。',
    'MVP-20 允许用户主动选择目录后的只读 dry-run 扫描。',
    'MVP-23 允许用户确认后写入 library-index.json，但仍不接 SQLite、不返回 absolutePath / file://。',
    'MVP-24 允许读取用户目录中的 library-index.json，并只把 tokenized index 数据返回 Renderer。',
    'MVP-25 允许把 rootPathToken + relativePath 解析成受控 yang-kura-media:// URL 供 HTMLAudio 播放。',
    'MVP-122 允许 Electron main 用同一 tokenized path 启动 mpv 子进程；启动失败时回退 HTMLAudio，Renderer 仍不接收真实路径。',
    'MVP-26 允许只读读取同一 rootPathToken 下的 .lrc / .srt / .vtt / .ass 字幕正文。',
    'MVP-27 允许用系统默认应用打开同一 rootPathToken 下的视频/图片/文件，并可在文件管理器中定位。',
    'MVP-94 允许 copy-only preflight 在 main 侧只读检查源/目标文件状态，但仍不执行 copy、不创建目录、不写日志。',
    'MVP-95 允许用户确认后在 Electron main 侧执行 copy-only：COPYFILE_EXCL 防覆盖、只创建目标父目录、不写 library-index.json。',
    'MVP-97 允许 copy 后对目标相对路径做只读刷新预览，但仍不写 library-index.json、不接 SQLite。',
    'MVP-98 允许根据 refreshCandidates 生成 library-index patch 预览，但仍不写 library-index.json、不接 SQLite。',
    'MVP-100 允许用户确认后在目标库内执行 library-index.json patch 写入：先备份、只合并新增 patch、不删除既有数据、不接 SQLite。',
    'MVP-105 允许用户二次确认后执行小样本真实 move-only：最多 20 个文件、overwrite=false、失败停止、写相对路径 OperationLog、不写 index。',
    'U31 将 copy/move 文件操作收口为本轮事务：部分失败时只回滚本轮新复制或已移动文件，并只清理本轮创建且为空的目标目录。',
    'Renderer 仍不会拿到 absolutePath 或 file://。',
  ];
}

function normalizeRelativePath(value: string): string {
  return value.split(path.sep).join('/').replace(/^\/+/, '');
}

function extensionOf(fileName: string): string {
  const match = fileName.match(/\.([^.\/]+)$/);
  return match?.[1]?.toLowerCase() ?? '';
}

function baseNameOf(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

function detectRjId(value: string): string | undefined {
  return value.match(/RJ\d{5,8}/i)?.[0]?.toUpperCase();
}

function detectTrackNo(baseName: string): number | undefined {
  const match = baseName.match(/^\s*(?:track\s*)?0*([0-9]{1,3})(?:[\s._-]|$)/i);
  return match ? Number(match[1]) : undefined;
}

function classifyEntry(relativePath: string, isDirectory: boolean): { entryKind: DryRunEntryKind; plannedAction: DryRunPlannedAction; warningCodes: string[] } {
  if (isDirectory) {
    return { entryKind: 'directory', plannedAction: 'create-collection-candidate', warningCodes: [] };
  }

  const fileName = relativePath.split('/').pop() ?? relativePath;
  const extension = extensionOf(fileName);
  const baseName = baseNameOf(fileName).toLowerCase();
  const warningCodes: string[] = [];

  if (AUDIO_EXTENSIONS.has(extension)) return { entryKind: 'audio', plannedAction: 'include-track', warningCodes };
  if (VIDEO_EXTENSIONS.has(extension)) return { entryKind: 'video', plannedAction: 'include-track', warningCodes };
  if (SUBTITLE_EXTENSIONS.has(extension)) return { entryKind: 'subtitle', plannedAction: 'attach-subtitle', warningCodes };
  if (IMAGE_EXTENSIONS.has(extension)) {
    const isCover = COVER_BASENAMES.has(baseName);
    return { entryKind: isCover ? 'cover' : 'image', plannedAction: isCover ? 'attach-cover' : 'include-track', warningCodes };
  }
  if (TEXT_EXTENSIONS.has(extension)) return { entryKind: 'text', plannedAction: 'warn-only', warningCodes };
  if (ARCHIVE_EXTENSIONS.has(extension)) return { entryKind: 'archive', plannedAction: 'warn-only', warningCodes };

  warningCodes.push('unsupported-extension');
  return { entryKind: 'other', plannedAction: 'warn-only', warningCodes };
}

function buildEntry(rootPath: string, absolutePath: string, relativePath: string, isDirectory: boolean, sizeBytes?: number, mtimeMs?: number): DryRunDiscoveredEntry {
  const normalized = normalizeRelativePath(relativePath);
  const fileName = normalized.split('/').pop() ?? normalized;
  const baseName = baseNameOf(fileName);
  const collectionCandidate = normalized.split('/')[0] || 'root';
  const classified = classifyEntry(normalized, isDirectory);
  const rjIdNorm = detectRjId(normalized);
  const warningCodes = [...classified.warningCodes];

  if (!rjIdNorm && normalized.includes('/') && classified.entryKind !== 'directory') {
    warningCodes.push('no-rj-code-detected');
  }

  return {
    id: `mvp20-${crypto.createHash('sha1').update(`${rootPath}:${absolutePath}`).digest('hex').slice(0, 16)}`,
    relativePath: normalized,
    entryKind: classified.entryKind,
    plannedAction: classified.plannedAction,
    parserStatus: warningCodes.length ? 'parsed-with-warning' : 'parsed',
    collectionCandidate,
    trackCandidate: isDirectory ? undefined : baseName,
    rjIdNorm,
    extension: isDirectory ? undefined : extensionOf(fileName),
    sizeBytes,
    mtimeMs,
    warningCodes,
  };
}

function normalizeLimit(value: unknown, fallback: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(Math.floor(value), max));
}

async function runReadOnlyDryRun(rootRecord: TokenizedRootRecord, request: ScannerDryRunRequest) {
  const maxEntries = normalizeLimit(request.maxEntries, 10000, 50000);
  const maxDepth = normalizeLimit(request.maxDepth, 12, 24);
  const discoveredEntries: DryRunDiscoveredEntry[] = [];
  const warnings: DryRunWarning[] = [];
  const blockedReasons: { code: string; message: string }[] = [];
  let reachedEntryLimit = false;

  const scanDirectory = async (absoluteDir: string, relativeDir: string, depth: number): Promise<void> => {
    if (discoveredEntries.length >= maxEntries) {
      reachedEntryLimit = true;
      return;
    }
    if (depth > maxDepth) {
      warnings.push({
        code: 'max-depth-reached',
        severity: 'warning',
        message: `已达到 dry-run 最大扫描深度 ${maxDepth}，更深层目录被跳过。`,
        affectedRelativePath: normalizeRelativePath(relativeDir),
      });
      return;
    }

    let dirents;
    try {
      dirents = await fs.readdir(absoluteDir, { withFileTypes: true });
    } catch (error) {
      warnings.push({
        code: 'directory-read-failed',
        severity: 'error',
        message: `source stat failed: ${getSafeErrorCode(error)}`,
        affectedRelativePath: normalizeRelativePath(relativeDir),
      });
      return;
    }

    for (const dirent of dirents) {
      if (discoveredEntries.length >= maxEntries) {
        reachedEntryLimit = true;
        return;
      }

      const childRelative = relativeDir ? path.join(relativeDir, dirent.name) : dirent.name;
      const normalizedRelative = normalizeRelativePath(childRelative);
      const childAbsolute = path.join(absoluteDir, dirent.name);

      if (dirent.isSymbolicLink()) {
        warnings.push({
          code: 'symlink-skipped',
          severity: 'info',
          message: 'dry-run 不跟随符号链接，已跳过该条目。',
          affectedRelativePath: normalizedRelative,
        });
        continue;
      }

      if (dirent.name.startsWith('.')) {
        warnings.push({
          code: 'hidden-entry-skipped',
          severity: 'info',
          message: '隐藏条目默认跳过。',
          affectedRelativePath: normalizedRelative,
        });
        continue;
      }

      if (dirent.isDirectory()) {
        discoveredEntries.push(buildEntry(rootRecord.absolutePath, childAbsolute, childRelative, true));
        await scanDirectory(childAbsolute, childRelative, depth + 1);
        continue;
      }

      if (!dirent.isFile()) {
        warnings.push({
          code: 'non-file-entry-skipped',
          severity: 'info',
          message: '非普通文件条目已跳过。',
          affectedRelativePath: normalizedRelative,
        });
        continue;
      }

      let stat;
      try {
        stat = await fs.stat(childAbsolute);
      } catch (error) {
        warnings.push({
          code: 'file-stat-failed',
          severity: 'warning',
          message: `source stat failed: ${getSafeErrorCode(error)}`,
          affectedRelativePath: normalizedRelative,
        });
      }

      discoveredEntries.push(buildEntry(rootRecord.absolutePath, childAbsolute, childRelative, false, stat?.size, stat?.mtimeMs));
    }
  };

  const rootStat = await fs.stat(rootRecord.absolutePath);
  if (!rootStat.isDirectory()) {
    blockedReasons.push({ code: 'root-is-not-directory', message: 'rootPathToken 对应的路径不是目录。' });
  } else {
    await scanDirectory(rootRecord.absolutePath, '', 1);
  }

  if (reachedEntryLimit) {
    warnings.push({
      code: 'max-entry-limit-reached',
      severity: 'warning',
      message: `已达到 dry-run 最大条目数 ${maxEntries}，结果已截断。`,
    });
  }

  const collectionCandidateCount = new Set(discoveredEntries.map((entry) => entry.collectionCandidate).filter(Boolean)).size;
  const trackCandidateCount = discoveredEntries.filter((entry) => entry.plannedAction === 'include-track').length;
  const coverCandidateCount = discoveredEntries.filter((entry) => entry.entryKind === 'cover').length;
  const subtitleCandidateCount = discoveredEntries.filter((entry) => entry.entryKind === 'subtitle').length;
  const fileCount = discoveredEntries.filter((entry) => entry.entryKind !== 'directory').length;
  const directoryCount = discoveredEntries.filter((entry) => entry.entryKind === 'directory').length;

  return {
    ok: true,
    status: 'mvp20-read-only-dry-run-complete',
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    previewOnly: true,
    indexWriteAllowed: false,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    scannedAt: new Date().toISOString(),
    summary: {
      sourceKind: 'electron-scan',
      previewOnly: true,
      maxEntries,
      maxDepth,
      discoveredEntryCount: discoveredEntries.length,
      directoryCount,
      fileCount,
      collectionCandidateCount,
      trackCandidateCount,
      coverCandidateCount,
      subtitleCandidateCount,
      warningCount: warnings.length,
      blockedReasonCount: blockedReasons.length,
      canWriteIndex: false,
      reachedEntryLimit,
    },
    discoveredEntries: discoveredEntries.slice(0, maxEntries),
    warnings,
    blockedReasons,
    message: '只读 dry-run 扫描完成；结果只包含相对路径和统计，不包含 absolutePath / file://，也未写入 index。',
    safetyNotes: buildSafetyNotes(),
  } as const;
}


function mapEntryKindToTrackKind(entryKind: DryRunEntryKind): 'audio' | 'video' | 'image' | 'text' | 'archive' | 'other' {
  if (entryKind === 'audio') return 'audio';
  if (entryKind === 'video') return 'video';
  if (entryKind === 'image' || entryKind === 'cover') return 'image';
  if (entryKind === 'subtitle' || entryKind === 'text') return 'text';
  if (entryKind === 'archive') return 'archive';
  return 'other';
}

function stablePreviewId(prefix: string, value: string): string {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 16)}`;
}

function getCollectionType(libraryType: YangKuraLibraryType, entry: DryRunDiscoveredEntry): 'rj_work' | 'music_album' | 'music_folder' {
  if (libraryType === 'asmr' || entry.rjIdNorm) return 'rj_work';
  if (libraryType === 'music') return 'music_album';
  return 'music_folder';
}

function buildIndexWritePreview(rootRecord: TokenizedRootRecord, dryRun: DryRunSuccessPayload, request: WriteIndexPreviewRequest) {
  const generatedAt = new Date().toISOString();
  const maxPreviewEntries = normalizeLimit(request.maxPreviewEntries, 5000, 20000);
  const usableEntries = dryRun.discoveredEntries.slice(0, maxPreviewEntries);
  const rootId = stablePreviewId('root', rootRecord.rootPathToken);
  const collectionMap = new Map<string, any>();
  const covers: any[] = [];
  const subtitles: any[] = [];
  const tracks: any[] = [];
  const warnings = new Set<string>();

  for (const warning of dryRun.warnings) {
    warnings.add(`${warning.code}: ${warning.message}${warning.affectedRelativePath ? ` (${warning.affectedRelativePath})` : ''}`);
  }
  for (const blocked of dryRun.blockedReasons) {
    warnings.add(`${blocked.code}: ${blocked.message}`);
  }

  const ensureCollection = (entry: DryRunDiscoveredEntry) => {
    const collectionKey = entry.collectionCandidate || 'root';
    const collectionId = stablePreviewId('collection', `${rootId}:${collectionKey}`);
    let collection = collectionMap.get(collectionId);
    if (!collection) {
      collection = {
        id: collectionId,
        rootId,
        collectionType: getCollectionType(rootRecord.libraryType, entry),
        title: entry.rjIdNorm || collectionKey,
        sortTitle: collectionKey,
        codeRaw: entry.rjIdNorm,
        codeNorm: entry.rjIdNorm,
        artist: undefined,
        circle: undefined,
        cvs: [],
        album: rootRecord.libraryType === 'music' ? collectionKey : undefined,
        folderPath: collectionKey,
        tags: [],
        status: entry.warningCodes.length ? 'warning' : 'identified',
        trackIds: [],
        addedAt: generatedAt,
        updatedAt: generatedAt,
      };
      collectionMap.set(collectionId, collection);
    }
    if (entry.warningCodes.length && collection.status !== 'warning') {
      collection.status = 'warning';
    }
    return collection;
  };

  for (const entry of usableEntries) {
    if (entry.entryKind === 'directory') {
      ensureCollection(entry);
      continue;
    }

    const isRootLevel = !entry.relativePath.includes('/');
    const entryForCollection = isRootLevel
      ? { ...entry, collectionCandidate: 'root' }
      : entry;

    const collection = ensureCollection(entryForCollection);

    if (entry.entryKind === 'cover') {
      const coverId = stablePreviewId('cover', `${collection.id}:${entry.relativePath}`);
      const cover = {
        id: coverId,
        collectionId: collection.id,
        sourceKind: 'local-file',
        relativePath: entry.relativePath,
        isPrimary: !collection.cover,
      };
      covers.push(cover);
      if (!collection.cover) collection.cover = cover;
      continue;
    }

    const isTrackLike = entry.plannedAction === 'include-track';
    if (isTrackLike) {
      const trackId = stablePreviewId('track', `${collection.id}:${entry.relativePath}`);
      const track = {
        id: trackId,
        rootId,
        collectionId: collection.id,
        kind: mapEntryKindToTrackKind(entry.entryKind),
        title: entry.trackCandidate || entry.relativePath.split('/').pop() || entry.relativePath,
        displayArtist: collection.artist,
        displayAlbum: collection.title,
        rjId: entry.rjIdNorm,
        trackNo: detectTrackNo(entry.trackCandidate || entry.relativePath),
        source: {
          id: stablePreviewId('source', `${trackId}:${entry.relativePath}`),
          trackId,
          sourceKind: 'local-file',
          relativePath: entry.relativePath,
          extension: entry.extension,
          sizeBytes: entry.sizeBytes,
          mtimeMs: entry.mtimeMs,
        },
        subtitles: [],
        tags: [],
        addedAt: generatedAt,
      };
      tracks.push(track);
      collection.trackIds.push(trackId);
      continue;
    }

    if (entry.entryKind === 'subtitle') {
      subtitles.push({
        id: stablePreviewId('subtitle', `${collection.id}:${entry.relativePath}`),
        trackId: stablePreviewId('unmatched-track', `${collection.id}:${entry.relativePath}`),
        sourceKind: 'local-file',
        language: entry.relativePath.includes('.ja.') ? 'ja' : entry.relativePath.includes('.zh.') ? 'zh' : entry.relativePath.includes('.bilingual.') ? 'bilingual' : 'unknown',
        format: entry.extension,
        relativePath: entry.relativePath,
      });
    }
  }

  const collections = Array.from(collectionMap.values()).map((collection) => ({
    ...collection,
    status: collection.trackIds.length === 0 && collection.status !== 'warning' ? 'missing-audio' : collection.status,
  }));

  return {
    ok: true,
    status: 'mvp22-write-index-preview-ready',
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    previewOnly: true,
    indexWriteAllowed: false,
    indexWritePerformed: false,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    generatedAt,
    proposedIndexFileName: 'library-index.preview.json',
    summary: {
      sourceDryRunScannedAt: dryRun.scannedAt,
      dryRunEntryCount: dryRun.discoveredEntries.length,
      previewEntryCount: usableEntries.length,
      previewTruncated: dryRun.discoveredEntries.length > usableEntries.length,
      rootCount: 1,
      collectionCount: collections.length,
      trackCount: tracks.length,
      coverCount: covers.length,
      subtitleCount: subtitles.length,
      warningCount: warnings.size,
      canWriteIndexNext: true,
    },
    previewIndex: {
      schemaVersion: 1,
      generatedAt,
      sourceKind: 'electron-scan',
      roots: [{
        id: rootId,
        name: rootRecord.displayName,
        rootPath: `rootPathToken:${rootRecord.rootPathToken}`,
        libraryType: rootRecord.libraryType,
        scanProfile: rootRecord.libraryType === 'asmr' ? 'asmr-rj' : rootRecord.libraryType === 'music' ? 'music-folder' : 'mixed-folder',
        sourceKind: 'electron-scan',
        createdAt: rootRecord.selectedAt,
        updatedAt: generatedAt,
      }],
      collections,
      tracks,
      covers,
      subtitles,
      warnings: Array.from(warnings),
    },
    message: '已生成 library-index.json 写入预览；本轮未真正写入文件。下一轮可在用户确认后执行真实写入。',
    safetyNotes: buildSafetyNotes(),
  } as const;
}


function toSafeTimestamp(value: string): string {
  return value.replace(/[^0-9A-Za-z-]/g, '-').replace(/-+/g, '-').slice(0, 32);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function validateWrittenIndexShape(value: unknown): {ok: true; summary: {schemaVersion: number; rootCount: number; collectionCount: number; trackCount: number; coverCount: number; subtitleCount: number; warningCount: number}} | {ok: false; message: string} {
  if (!value || typeof value !== 'object') return {ok: false, message: 'library-index.json 不是对象。'};
  const index = value as any;
  if (index.schemaVersion !== 1) return {ok: false, message: 'schemaVersion 不是 1。'};
  if (!Array.isArray(index.roots)) return {ok: false, message: 'roots 不是数组。'};
  if (!Array.isArray(index.collections)) return {ok: false, message: 'collections 不是数组。'};
  if (!Array.isArray(index.tracks)) return {ok: false, message: 'tracks 不是数组。'};
  if (JSON.stringify(index).includes('file://')) return {ok: false, message: '写入内容中不允许出现 file://。'};
  return {
    ok: true,
    summary: {
      schemaVersion: index.schemaVersion,
      rootCount: index.roots.length,
      collectionCount: index.collections.length,
      trackCount: index.tracks.length,
      coverCount: Array.isArray(index.covers) ? index.covers.length : 0,
      subtitleCount: Array.isArray(index.subtitles) ? index.subtitles.length : 0,
      warningCount: Array.isArray(index.warnings) ? index.warnings.length : 0,
    },
  };
}


function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stripUndefinedFields<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function upsertByIdPreservingExisting(existingValue: unknown, patchValue: unknown, timestamp: string): { items: unknown[]; added: number; updated: number; skipped: number } {
  const existingItems = Array.isArray(existingValue) ? existingValue.filter(isPlainObject) : [];
  const patchItems = Array.isArray(patchValue) ? patchValue.filter(isPlainObject) : [];
  const byId = new Map<string, Record<string, unknown>>();
  const order: string[] = [];
  let anonymousIndex = 0;

  for (const item of existingItems) {
    const id = typeof item.id === 'string' && item.id.trim() ? item.id : `mvp100-existing-anonymous-${anonymousIndex += 1}`;
    byId.set(id, item);
    order.push(id);
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const rawPatchItem of patchItems) {
    const id = typeof rawPatchItem.id === 'string' && rawPatchItem.id.trim() ? rawPatchItem.id : undefined;
    if (!id) {
      skipped += 1;
      continue;
    }
    const patchItem = stripUndefinedFields(rawPatchItem);
    const existing = byId.get(id);
    if (existing) {
      byId.set(id, { ...existing, ...patchItem, updatedAt: timestamp });
      updated += 1;
    } else {
      byId.set(id, { ...patchItem, addedAt: rawPatchItem.addedAt ?? timestamp, updatedAt: rawPatchItem.updatedAt ?? timestamp });
      order.push(id);
      added += 1;
    }
  }

  return {
    items: order.map((id) => byId.get(id)).filter(Boolean),
    added,
    updated,
    skipped,
  };
}

function buildPatchWriteSafetyNotes(): string[] {
  return buildSafetyNotes().concat([
    'mvp100-library-index-patch-write',
    'confirmed patch write: backup first, merge only, no delete',
    'Local JSON Index only: no SQLite',
    'renderer token only: no absolutePath, no file://',
  ]);
}

function validatePatchPreviewForWrite(patchPreview: ImportLibraryIndexPatchWriteRequest['indexPatchPreview']): { ok: true } | { ok: false; message: string } {
  if (!patchPreview || patchPreview.patchPreviewVersion !== 'mvp98-library-index-patch-preview-v1') {
    return { ok: false, message: '缺少有效的 mvp98-library-index-patch-preview-v1。' };
  }
  const raw = JSON.stringify(patchPreview);
  if (raw.includes('file://')) return { ok: false, message: 'patchPreview 中包含 file://，拒绝写入。' };
  if (/"absolutePath"\s*:/.test(raw)) return { ok: false, message: 'patchPreview 中包含 absolutePath，拒绝写入。' };
  if (/"fileUrl"\s*:/.test(raw)) return { ok: false, message: 'patchPreview 中包含 fileUrl，拒绝写入。' };
  return { ok: true };
}

async function writeLibraryIndexPatchWithBackup(rootRecord: TokenizedRootRecord, request: ImportLibraryIndexPatchWriteRequest) {
  const safetyNotes = buildPatchWriteSafetyNotes();
  const writtenAt = new Date().toISOString();
  const indexRelativePath = 'library-index.json';
  const indexPath = path.join(rootRecord.absolutePath, indexRelativePath);

  const patchValidation = validatePatchPreviewForWrite(request.indexPatchPreview);
  if (patchValidation.ok === false) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-missing-patch-preview',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: patchValidation.message,
      safetyNotes,
    } as const;
  }

  const confirmationAccepted = request.userConfirmedPatchWrite === true && request.confirmationText === 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
  if (!confirmationAccepted) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-confirmation-required',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      message: 'MVP100 写入必须显式确认 CONFIRM_WRITE_LIBRARY_INDEX_PATCH。',
      safetyNotes,
    } as const;
  }

  if (request.createBackup !== true) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-backup-required',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: 'MVP100 写入必须 createBackup=true；不允许无备份 patch index。',
      safetyNotes,
    } as const;
  }

  if (!await pathExists(indexPath)) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-missing-index',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: '目标资源库缺少 library-index.json；请先完成基础扫描写入，再执行 copy-only patch。',
      safetyNotes,
    } as const;
  }

  let currentIndex: any;
  let currentText = '';
  try {
    currentText = await fs.readFile(indexPath, 'utf8');
    currentIndex = JSON.parse(currentText) as unknown;
  } catch (error) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-read-index-failed',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: `读取或解析现有 library-index.json 失败：${getSafeErrorCode(error)}；已停止写入。`,
      safetyNotes,
    } as const;
  }

  const currentValidation = validateWrittenIndexShape(currentIndex);
  if (currentValidation.ok === false) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-invalid-current-index',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: `现有 library-index.json 结构无效：${currentValidation.message}；已停止写入。`,
      safetyNotes,
    } as const;
  }

  const patchPreview = request.indexPatchPreview;
  const collections = upsertByIdPreservingExisting(currentIndex.collections, patchPreview?.collections, writtenAt);
  const tracks = upsertByIdPreservingExisting(currentIndex.tracks, patchPreview?.tracks, writtenAt);
  const covers = upsertByIdPreservingExisting(currentIndex.covers, patchPreview?.covers, writtenAt);
  const subtitles = upsertByIdPreservingExisting(currentIndex.subtitles, patchPreview?.subtitles, writtenAt);
  const warnings = Array.from(new Set([...(Array.isArray(currentIndex.warnings) ? currentIndex.warnings : []), ...(Array.isArray(patchPreview?.warnings) ? patchPreview.warnings : [])]));

  const patchedIndex = {
    ...currentIndex,
    collections: collections.items,
    tracks: tracks.items,
    covers: covers.items,
    subtitles: subtitles.items,
    warnings,
    updatedAt: writtenAt,
    lastPatch: {
      patchVersion: 'mvp100-library-index-patch-write-v1',
      sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
      sourceReadinessVersion: request.sourceReadinessVersion ?? 'mvp99-library-index-patch-write-readiness-v1',
      operationPlanId: request.operationPlanId,
      patchedAt: writtenAt,
      collectionPatchCount: Array.isArray(patchPreview?.collections) ? patchPreview.collections.length : 0,
      trackPatchCount: Array.isArray(patchPreview?.tracks) ? patchPreview.tracks.length : 0,
      coverPatchCount: Array.isArray(patchPreview?.covers) ? patchPreview.covers.length : 0,
      subtitlePatchCount: Array.isArray(patchPreview?.subtitles) ? patchPreview.subtitles.length : 0,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
  };

  const serialized = JSON.stringify(patchedIndex, null, 2);
  if (serialized.includes('file://') || /"absolutePath"\s*:/.test(serialized) || /"fileUrl"\s*:/.test(serialized)) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-unsafe-content',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: '合并后的 index 含 unsafe path 字段或 file://，已停止写入。',
      safetyNotes,
    } as const;
  }

  const backupRelativePath = `library-index.backup.before-mvp100-${toSafeTimestamp(writtenAt)}.json`;
  const backupPath = path.join(rootRecord.absolutePath, backupRelativePath);

  try {
    await fs.writeFile(backupPath, currentText, { encoding: 'utf8', flag: 'wx' });
    await fs.writeFile(indexPath, `${serialized}\n`, 'utf8');
  } catch (error) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-error',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: await pathExists(backupPath),
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      backupRelativePath: await pathExists(backupPath) ? backupRelativePath : undefined,
      message: `写入 library-index.json patch 失败：${getSafeErrorCode(error)}。如已生成 backup，原 index 内容仍可从备份恢复。`,
      safetyNotes,
    } as const;
  }

  const readBackText = await fs.readFile(indexPath, 'utf8');
  const parsed = JSON.parse(readBackText) as unknown;
  const validation = validateWrittenIndexShape(parsed);
  if (validation.ok === false) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-verify-failed',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: true,
      libraryIndexWritten: true,
      backupCreated: true,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      indexRelativePath,
      backupRelativePath,
      message: `library-index.json patch 已写入，但读回校验失败：${validation.message}`,
      safetyNotes,
    } as const;
  }

  const sha256 = crypto.createHash('sha256').update(readBackText).digest('hex');
  return {
    ok: true,
    status: 'mvp100-library-index-patch-write-complete',
    schemaVersion: 1,
    patchWriteVersion: 'mvp100-library-index-patch-write-v1',
    operationPlanId: request.operationPlanId,
    targetRootPathToken: request.targetRootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    mode: 'library-index-patch-write-confirmed',
    sourceReadinessVersion: request.sourceReadinessVersion ?? 'mvp99-library-index-patch-write-readiness-v1',
    sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
    indexPatchWritten: true,
    libraryIndexWritten: true,
    backupCreated: true,
    scannerRunTriggered: false,
    sqliteWritten: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    writtenAt,
    indexRelativePath,
    backupRelativePath,
    bytesWritten: Buffer.byteLength(readBackText, 'utf8'),
    sha256,
    summary: {
      before: currentValidation.summary,
      after: validation.summary,
      collectionsAdded: collections.added,
      collectionsUpdated: collections.updated,
      tracksAdded: tracks.added,
      tracksUpdated: tracks.updated,
      coversAdded: covers.added,
      coversUpdated: covers.updated,
      subtitlesAdded: subtitles.added,
      subtitlesUpdated: subtitles.updated,
      skippedPatchItems: collections.skipped + tracks.skipped + covers.skipped + subtitles.skipped,
    },
    message: 'MVP100 已在备份后写入 library-index.json patch；只合并 copy-only 新增项，不删除旧数据，不接 SQLite，不返回 absolutePath/file://。',
    safetyNotes,
  } as const;
}

async function writeLibraryIndex(rootRecord: TokenizedRootRecord, dryRun: DryRunSuccessPayload, request: WriteLibraryIndexRequest) {
  const preview = buildIndexWritePreview(rootRecord, dryRun, {
    rootPathToken: request.rootPathToken,
    mode: 'preview-only',
    dryRunScannedAt: request.dryRunScannedAt,
    maxPreviewEntries: request.maxWriteEntries ?? 20000,
  });

  if (!preview.ok) {
    return {
      ok: false,
      status: 'mvp23-library-index-write-preview-build-failed',
      indexWriteAllowed: false,
      indexWritePerformed: false,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: '生成写入内容失败，未写入 library-index.json。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  const writtenAt = new Date().toISOString();
  const indexRelativePath = 'library-index.json';
  const indexPath = path.join(rootRecord.absolutePath, indexRelativePath);
  let backupRelativePath: string | undefined;

  if (request.createBackup !== false && await pathExists(indexPath)) {
    backupRelativePath = `library-index.backup-${toSafeTimestamp(writtenAt)}.json`;
    const backupPath = path.join(rootRecord.absolutePath, backupRelativePath);
    const existing = await fs.readFile(indexPath);
    await fs.writeFile(backupPath, existing);
  }

  const indexPayload = {
    ...preview.previewIndex,
    generatedAt: writtenAt,
    updatedAt: writtenAt,
    sourceKind: 'electron-scan',
    writeStage: 'mvp23-confirmed-write',
  };
  const jsonText = `${JSON.stringify(indexPayload, null, 2)}\n`;
  await fs.writeFile(indexPath, jsonText, 'utf8');

  const readBackText = await fs.readFile(indexPath, 'utf8');
  const sha256 = crypto.createHash('sha256').update(readBackText).digest('hex');
  const parsed = JSON.parse(readBackText) as unknown;
  const validation = validateWrittenIndexShape(parsed);
  if (validation.ok === false) {
    return {
      ok: false,
      status: 'mvp23-library-index-write-verify-failed',
      indexWriteAllowed: true,
      indexWritePerformed: true,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexRelativePath,
      backupRelativePath,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: `library-index.json 已写入，但读回校验失败：${validation.message}`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  return {
    ok: true,
    status: 'mvp23-library-index-write-complete',
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    indexWriteAllowed: true,
    indexWritePerformed: true,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    writtenAt,
    indexRelativePath,
    backupRelativePath,
    bytesWritten: Buffer.byteLength(jsonText, 'utf8'),
    sha256,
    summary: {
      ...validation.summary,
      backupCreated: Boolean(backupRelativePath),
      previewCollectionCount: preview.summary.collectionCount,
      previewTrackCount: preview.summary.trackCount,
    },
    message: 'library-index.json 已写入用户选择的目录，并已完成读回校验；Renderer 仍未收到 absolutePath / file://。',
    safetyNotes: buildSafetyNotes(),
  } as const;
}

async function readLibraryIndex(rootRecord: TokenizedRootRecord, _request: ReadLibraryIndexRequest) {
  const readAt = new Date().toISOString();
  const indexRelativePath = 'library-index.json';
  const indexPath = path.join(rootRecord.absolutePath, indexRelativePath);

  if (!(await pathExists(indexPath))) {
    return {
      ok: false,
      status: 'mvp24-library-index-read-missing-file',
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexRelativePath,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: '未找到 library-index.json。请先完成 dry-run、生成预览并确认写入 index。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  try {
    const sourceBuffer = await fs.readFile(indexPath);
    const parsedSource = parseLibraryIndexJsonBuffer(sourceBuffer);
    const sha256 = crypto.createHash('sha256').update(sourceBuffer).digest('hex');
    const parsed = parsedSource.value;
    const validation = validateWrittenIndexShape(parsed);
    if (validation.ok === false) {
      return {
        ok: false,
        status: 'mvp24-library-index-read-verify-failed',
        rootPathToken: rootRecord.rootPathToken,
        displayName: rootRecord.displayName,
        libraryType: rootRecord.libraryType,
        indexRelativePath,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: `library-index.json 读取成功，但结构校验失败：${validation.message}`,
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const indexPayload = parsed as any;
    const serialized = JSON.stringify(indexPayload);
    if (serialized.includes('file://')) {
      return {
        ok: false,
        status: 'mvp24-library-index-read-unsafe-content',
        rootPathToken: rootRecord.rootPathToken,
        displayName: rootRecord.displayName,
        libraryType: rootRecord.libraryType,
        indexRelativePath,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'library-index.json 中包含 file://，已拒绝返回给 Renderer。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return {
      ok: true,
      status: 'mvp24-library-index-read-complete',
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexReadAllowed: true,
      indexReadPerformed: true,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      readAt,
      indexRelativePath,
      bytesRead: sourceBuffer.byteLength,
      sha256,
      summary: validation.summary,
      index: indexPayload,
      message: `library-index.json 已读取并通过结构校验；文件编码：${parsedSource.encoding}。Renderer 只收到 tokenized index，不包含 absolutePath / file://。`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  } catch (error) {
    const failure = describeLibraryIndexReadError(error);
    return {
      ok: false,
      status: failure.status,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexRelativePath,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: failure.message,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
}


function resolveSafeIndexedEntryPath(rootRecord: TokenizedRootRecord, relativePath: string): { ok: true; absolutePath: string; relativePath: string } | { ok: false; message: string } {
  if (isUnsafeRelativePath(relativePath)) return { ok: false, message: '索引中的相对路径不合法。' };
  const normalized = normalizeRelativePath(relativePath);
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...normalized.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, message: '索引路径越过资源库根目录。' };
  }
  return { ok: true, absolutePath, relativePath: normalized };
}

async function readValidatedIndexForHealth(rootRecord: TokenizedRootRecord) {
  const indexPath = path.join(rootRecord.absolutePath, 'library-index.json');
  if (!(await pathExists(indexPath))) return { ok: false as const, status: 'mvp127-index-health-missing-index' as const, message: '未找到 library-index.json。请先读取或重新扫描资源库。' };
  try {
    const sourceBuffer = await fs.readFile(indexPath);
    const parsedSource = parseLibraryIndexJsonBuffer(sourceBuffer);
    const parsed = parsedSource.value;
    const validation = validateWrittenIndexShape(parsed);
    if (validation.ok === false) return { ok: false as const, status: 'mvp127-index-health-invalid-index' as const, message: `library-index.json 结构校验失败：${validation.message}` };
    if (parsedSource.text.includes('file://')) return { ok: false as const, status: 'mvp127-index-health-unsafe-index' as const, message: 'library-index.json 包含不安全的 file:// 内容。' };
    return {
      ok: true as const,
      index: parsed,
      indexSha256: crypto.createHash('sha256').update(sourceBuffer).digest('hex'),
      bytesRead: sourceBuffer.byteLength,
      encoding: parsedSource.encoding,
    };
  } catch (error) {
    const failure = describeLibraryIndexReadError(error);
    return { ok: false as const, status: 'mvp127-index-health-read-error' as const, message: failure.message };
  }
}

async function checkLibraryIndexHealth(rootRecord: TokenizedRootRecord, request: LibraryIndexHealthCheckRequest) {
  const source = await readValidatedIndexForHealth(rootRecord);
  if (!source.ok) {
    return {
      ok: false,
      status: source.status,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: source.message,
      safetyNotes: buildSafetyNotes().concat(['read-only health check', 'no index write', 'no media mutation']),
    } as const;
  }

  const allReferences = collectLibraryIndexHealthReferences(source.index);
  const maxEntries = Math.max(1, Math.min(50_000, Math.trunc(request.maxEntries ?? 20_000)));
  const references = allReferences.slice(0, maxEntries);
  const issues: Array<LibraryIndexHealthReference & { status: LibraryIndexHealthStatus; message: string; canRevealParent: boolean }> = [];
  let healthyCount = 0;
  const checkReference = async (reference: LibraryIndexHealthReference) => {
    if (reference.kind === 'collection-reference') {
      return { ...reference, status: 'invalid-reference' as const, message: '集合仍引用一个不存在的曲目记录。', canRevealParent: false };
    }
    if (!reference.relativePath) {
      return { ...reference, status: 'invalid-path' as const, message: '索引记录缺少安全的相对路径。', canRevealParent: false };
    }
    const resolved = resolveSafeIndexedEntryPath(rootRecord, reference.relativePath);
    if (resolved.ok === false) {
      return { ...reference, status: 'invalid-path' as const, message: resolved.message, canRevealParent: false };
    }
    try {
      const stat = await fs.stat(resolved.absolutePath);
      if (!stat.isFile()) {
        return { ...reference, relativePath: resolved.relativePath, status: 'wrong-type' as const, message: '索引指向的目标不是文件。', canRevealParent: true };
      }
      return null;
    } catch (error) {
      const code = getSafeErrorCode(error);
      const status: LibraryIndexHealthStatus = code === 'ENOENT' ? 'missing' : 'unreadable';
      return {
        ...reference,
        relativePath: resolved.relativePath,
        status,
        message: status === 'missing' ? '索引记录存在，但本地文件已找不到。' : `文件状态无法读取：${code}`,
        canRevealParent: true,
      };
    }
  };

  const concurrency = 64;
  for (let offset = 0; offset < references.length; offset += concurrency) {
    const batch = await Promise.all(references.slice(offset, offset + concurrency).map(checkReference));
    batch.forEach((issue) => {
      if (issue) issues.push(issue);
      else healthyCount += 1;
    });
  }

  const countStatus = (status: LibraryIndexHealthStatus) => issues.filter((item) => item.status === status).length;
  const checkedAt = new Date().toISOString();
  lastLibraryIndexHealthCheckMap.set(rootRecord.rootPathToken, {
    indexSha256: source.indexSha256,
    index: source.index,
    references,
    problemIssueIds: issues.map((item) => item.id),
  });

  return {
    ok: true,
    status: 'mvp127-library-index-health-check-complete',
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    checkedAt,
    indexSha256: source.indexSha256,
    bytesRead: source.bytesRead,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    summary: {
      indexedReferenceCount: allReferences.length,
      checkedReferenceCount: references.length,
      healthyCount,
      problemCount: issues.length,
      missingCount: countStatus('missing'),
      unreadableCount: countStatus('unreadable'),
      wrongTypeCount: countStatus('wrong-type'),
      invalidPathCount: countStatus('invalid-path'),
      invalidReferenceCount: countStatus('invalid-reference'),
      trackProblemCount: issues.filter((item) => item.kind === 'track').length,
      coverProblemCount: issues.filter((item) => item.kind === 'cover').length,
      subtitleProblemCount: issues.filter((item) => item.kind === 'subtitle').length,
      truncated: allReferences.length > references.length,
      canGenerateRemovalPreview: issues.some((item) => item.canRemoveFromIndex),
    },
    issues,
    message: issues.length
      ? `检查完成：发现 ${issues.length} 条失效或异常索引记录。检查过程没有修改 index 或媒体文件。`
      : '检查完成：当前索引引用的本地文件均可读取。',
    safetyNotes: buildSafetyNotes().concat(['read-only health check', 'no index write', 'no media mutation']),
  } as const;
}

async function buildRemovalPreviewForHealth(rootRecord: TokenizedRootRecord, request: LibraryIndexRemovalPreviewRequest) {
  const cached = lastLibraryIndexHealthCheckMap.get(rootRecord.rootPathToken);
  if (!cached) {
    return {
      ok: false,
      status: 'mvp127-removal-preview-missing-health-check',
      absolutePathsReturned: false,
      fileUrlReturned: false,
      writePerformed: false,
      message: '请先执行一次失效索引检查，再生成移除预览。',
      safetyNotes: buildSafetyNotes().concat(['preview-only']),
    } as const;
  }
  const requestedIds = Array.isArray(request.issueIds) && request.issueIds.length ? request.issueIds : cached.problemIssueIds;
  const preview = buildLibraryIndexRemovalPreview(cached.index, requestedIds, cached.references);
  lastLibraryIndexRemovalPreviewMap.set(rootRecord.rootPathToken, {
    sourceIndexSha256: cached.indexSha256,
    generatedAt: preview.generatedAt,
    operations: preview.operations,
  });
  return {
    ok: true,
    status: 'mvp127-library-index-removal-preview-ready',
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    sourceIndexSha256: cached.indexSha256,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    writePerformed: false,
    preview,
    message: preview.selectedIssueCount
      ? `已生成 ${preview.selectedIssueCount} 条索引清理预览；尚未写入 library-index.json，也不会删除媒体文件。`
      : '没有可加入移除预览的失效记录。',
    safetyNotes: buildSafetyNotes().concat(preview.safetyNotes),
  } as const;
}


async function writeLibraryIndexRemovalWithBackup(rootRecord: TokenizedRootRecord, request: LibraryIndexRemovalWriteRequest) {
  const safetyNotes = buildSafetyNotes().concat([
    'mvp128-controlled-index-cleanup',
    'index records only',
    'backup before write',
    'source SHA-256 revalidated',
    'media files were not deleted, moved, renamed, or overwritten',
  ]);
  const requiredConfirmationText = 'CONFIRM_REMOVE_MISSING_INDEX_RECORDS';
  const fail = (status: string, message: string, extra: Record<string, unknown> = {}) => ({
    ok: false as const,
    status,
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    writePerformed: false as const,
    backupCreated: false,
    mediaFilesDeleted: false as const,
    absolutePathsReturned: false as const,
    fileUrlReturned: false as const,
    message,
    safetyNotes,
    ...extra,
  });

  if (!request.userConfirmed || request.confirmationText !== requiredConfirmationText) {
    return fail('mvp128-index-cleanup-confirmation-required', `必须输入固定确认文本 ${requiredConfirmationText}。`, { requiredConfirmationText });
  }
  if (!request.createBackup) return fail('mvp128-index-cleanup-backup-required', '索引清理写入必须先创建备份。');
  const cached = lastLibraryIndexRemovalPreviewMap.get(rootRecord.rootPathToken);
  if (!cached || cached.generatedAt !== request.previewGeneratedAt || cached.sourceIndexSha256 !== request.sourceIndexSha256) {
    return fail('mvp128-index-cleanup-preview-expired', '清理预览不存在、已变化或已过期。请重新检查并生成预览。');
  }
  if (!cached.operations.length) return fail('mvp128-index-cleanup-empty-preview', '当前预览没有可执行的索引清理操作。');

  const indexPath = path.join(rootRecord.absolutePath, 'library-index.json');
  let currentText = '';
  let currentIndex: unknown;
  try {
    currentText = await fs.readFile(indexPath, 'utf8');
    currentIndex = JSON.parse(currentText) as unknown;
  } catch (error) {
    return fail('mvp128-index-cleanup-read-failed', `读取当前 library-index.json 失败：${getSafeErrorCode(error)}`);
  }
  const currentHash = crypto.createHash('sha256').update(currentText).digest('hex');
  if (currentHash !== request.sourceIndexSha256 || currentHash !== cached.sourceIndexSha256) {
    return fail('mvp128-index-cleanup-source-changed', 'library-index.json 已在预览后发生变化。为避免覆盖新内容，已停止写入。', { currentIndexSha256: currentHash });
  }
  const currentValidation = validateWrittenIndexShape(currentIndex);
  if (currentValidation.ok === false) return fail('mvp128-index-cleanup-invalid-index', `当前 index 结构无效：${currentValidation.message}`);

  const writtenAt = new Date().toISOString();
  const applied = applyLibraryIndexRemovalOperations(currentIndex, cached.operations, writtenAt);
  const nextValidation = validateWrittenIndexShape(applied.index);
  if (nextValidation.ok === false) return fail('mvp128-index-cleanup-result-invalid', `清理后的 index 结构无效：${nextValidation.message}`);
  const nextText = `${JSON.stringify(applied.index, null, 2)}\n`;
  if (nextText.includes('file://') || /"absolutePath"\s*:/.test(nextText)) {
    return fail('mvp128-index-cleanup-unsafe-result', '清理后的 index 包含不安全路径内容，已拒绝写入。');
  }

  const backupRelativePath = `library-index.backup.before-mvp128-${toSafeTimestamp(writtenAt)}.json`;
  const backupPath = path.join(rootRecord.absolutePath, backupRelativePath);
  try {
    await fs.writeFile(backupPath, currentText, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    return fail('mvp128-index-cleanup-backup-failed', `创建 index 备份失败：${getSafeErrorCode(error)}`);
  }

  try {
    await fs.writeFile(indexPath, nextText, 'utf8');
    const verifyText = await fs.readFile(indexPath, 'utf8');
    const verifyIndex = JSON.parse(verifyText) as unknown;
    const verifyValidation = validateWrittenIndexShape(verifyIndex);
    const writtenSha256 = crypto.createHash('sha256').update(verifyText).digest('hex');
    if (!verifyValidation.ok || writtenSha256 !== crypto.createHash('sha256').update(nextText).digest('hex')) {
      throw new Error('READBACK_VERIFY_FAILED');
    }
    lastLibraryIndexHealthCheckMap.delete(rootRecord.rootPathToken);
    lastLibraryIndexRemovalPreviewMap.delete(rootRecord.rootPathToken);
    await recordIndexMaintenance(rootRecord, {
      action: 'controlled-cleanup',
      status: 'complete',
      occurredAt: writtenAt,
      sourceSha256: currentHash,
      resultSha256: writtenSha256,
      backupRelativePath,
      summary: applied.summary,
      message: `索引清理完成，共处理 ${cached.operations.length} 条失效索引记录。`,
    });
    return {
      ok: true as const,
      status: 'mvp128-controlled-index-cleanup-complete' as const,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      writePerformed: true as const,
      backupCreated: true as const,
      backupRelativePath,
      sourceIndexSha256: currentHash,
      writtenIndexSha256: writtenSha256,
      writtenAt,
      mediaFilesDeleted: false as const,
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      summary: applied.summary,
      indexSummary: verifyValidation.summary,
      message: `索引清理已写入并读回校验；共移除或解除 ${cached.operations.length} 条失效索引记录，真实媒体文件未被删除。`,
      safetyNotes,
    };
  } catch (error) {
    let rollbackRestored = false;
    try {
      await fs.writeFile(indexPath, currentText, 'utf8');
      rollbackRestored = true;
    } catch {
      rollbackRestored = false;
    }
    return fail('mvp128-index-cleanup-write-verify-failed', `索引写入或读回校验失败：${getSafeErrorCode(error)}。${rollbackRestored ? '已恢复原 index。' : '自动恢复失败，请使用同目录备份。'}`, {
      backupCreated: true,
      backupRelativePath,
      rollbackRestored,
    });
  }
}


function validateIndexForMaintenance(value: unknown) {
  const validation = validateWrittenIndexShape(value);
  if (validation.ok === false) return { ok: false as const, message: validation.message };
  return { ok: true as const, summary: validation.summary as unknown as Record<string, number> };
}

async function listLibraryIndexBackupsForRoot(rootRecord: TokenizedRootRecord, request: LibraryIndexBackupListRequest) {
  try {
    const backups = await inspectLibraryIndexBackups(rootRecord.absolutePath, validateIndexForMaintenance, request.maxEntries ?? 100);
    return {
      ok: true as const,
      status: 'mvp129-index-backup-list-ready' as const,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      listedAt: new Date().toISOString(),
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      backups,
      summary: {
        totalCount: backups.length,
        validCount: backups.filter((item) => item.valid).length,
        invalidCount: backups.filter((item) => !item.valid).length,
        totalBytes: backups.reduce((sum, item) => sum + item.sizeBytes, 0),
      },
      message: backups.length ? `找到 ${backups.length} 个 index 备份，其中 ${backups.filter((item) => item.valid).length} 个可恢复。` : '当前资源库目录中没有 index 备份。',
      safetyNotes: buildSafetyNotes().concat(['read-only backup listing', 'backup contents are not returned']),
    };
  } catch (error) {
    return {
      ok: false as const,
      status: 'mvp129-index-backup-list-failed' as const,
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      message: `读取 index 备份列表失败：${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes(),
    };
  }
}

async function previewLibraryIndexBackupRetention(rootRecord: TokenizedRootRecord, request: LibraryIndexBackupRetentionPreviewRequest) {
  try {
    const backups = await inspectLibraryIndexBackups(rootRecord.absolutePath, validateIndexForMaintenance, 500);
    const preview = buildLibraryIndexBackupRetentionPreview(backups, {
      maxAgeDays: request.maxAgeDays,
      keepNewest: request.keepNewest,
    });
    return {
      ok: true as const,
      status: 'mvp129-index-backup-retention-preview-ready' as const,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      deletePerformed: false as const,
      preview,
      message: preview.candidateCount
        ? `预览发现 ${preview.candidateCount} 个过期备份候选；本轮不会删除任何备份。`
        : '当前没有符合条件的过期备份候选。',
      safetyNotes: buildSafetyNotes().concat(preview.safetyNotes),
    };
  } catch (error) {
    return {
      ok: false as const,
      status: 'mvp129-index-backup-retention-preview-failed' as const,
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      deletePerformed: false as const,
      message: `备份保留预览失败：${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes().concat(['preview-only']),
    };
  }
}

async function restoreLibraryIndexBackupForRoot(rootRecord: TokenizedRootRecord, request: LibraryIndexBackupRestoreRequest) {
  const requiredConfirmationText = 'CONFIRM_RESTORE_LIBRARY_INDEX_BACKUP';
  const base = {
    rootPathToken: rootRecord.rootPathToken,
    displayName: rootRecord.displayName,
    libraryType: rootRecord.libraryType,
    writePerformed: false as boolean,
    currentBackupCreated: false as boolean,
    mediaFilesDeleted: false as const,
    absolutePathsReturned: false as const,
    fileUrlReturned: false as const,
    safetyNotes: buildSafetyNotes().concat(['index backup restore only', 'media files were not modified']),
  };
  if (request.confirmationText !== requiredConfirmationText || !request.createCurrentBackup) {
    return {
      ...base,
      ok: false as const,
      status: 'mvp129-index-backup-restore-confirmation-required' as const,
      requiredConfirmationText,
      message: `必须输入固定确认文本 ${requiredConfirmationText}，并允许先备份当前 index。`,
    };
  }
  try {
    const result = await restoreLibraryIndexFromBackup({
      rootAbsolutePath: rootRecord.absolutePath,
      backupRelativePath: request.backupRelativePath,
      expectedBackupSha256: request.backupSha256,
      validateIndex: validateIndexForMaintenance,
    });
    lastLibraryIndexHealthCheckMap.delete(rootRecord.rootPathToken);
    lastLibraryIndexRemovalPreviewMap.delete(rootRecord.rootPathToken);
    await recordIndexMaintenance(rootRecord, {
      action: 'backup-restore',
      status: 'complete',
      occurredAt: result.restoredAt,
      sourceSha256: result.sourceSha256,
      resultSha256: result.resultSha256,
      backupRelativePath: result.currentBackupRelativePath,
      restoredBackupRelativePath: result.restoredBackupRelativePath,
      summary: result.summary,
      message: `已从 ${result.restoredBackupRelativePath} 恢复 library-index.json。`,
    });
    return {
      ...base,
      ok: true as const,
      status: 'mvp129-index-backup-restore-complete' as const,
      writePerformed: true as const,
      currentBackupCreated: Boolean(result.currentBackupRelativePath),
      currentBackupRelativePath: result.currentBackupRelativePath,
      restoredBackupRelativePath: result.restoredBackupRelativePath,
      sourceIndexSha256: result.sourceSha256,
      restoredIndexSha256: result.resultSha256,
      restoredAt: result.restoredAt,
      bytesWritten: result.bytesWritten,
      indexSummary: result.summary,
      rollbackRestored: result.rollbackRestored,
      message: '备份已恢复并完成读回校验；恢复前的当前 index 已另存备份，媒体文件未被修改。',
    };
  } catch (error) {
    const detail = error as Error & { rollbackRestored?: boolean; currentBackupRelativePath?: string };
    await recordIndexMaintenance(rootRecord, {
      action: 'backup-restore',
      status: 'failed',
      occurredAt: new Date().toISOString(),
      backupRelativePath: detail.currentBackupRelativePath,
      restoredBackupRelativePath: request.backupRelativePath,
      message: `备份恢复失败：${getSafeErrorCode(error)}`,
    });
    return {
      ...base,
      ok: false as const,
      status: 'mvp129-index-backup-restore-failed' as const,
      currentBackupCreated: Boolean(detail.currentBackupRelativePath),
      currentBackupRelativePath: detail.currentBackupRelativePath,
      rollbackRestored: detail.rollbackRestored === true,
      message: `备份恢复失败：${getSafeErrorCode(error)}。${detail.rollbackRestored ? '已恢复操作前的当前 index。' : '请检查资源库目录中的备份文件。'}`,
    };
  }
}

async function readLibraryIndexMaintenanceHistoryForRoot(rootRecord: TokenizedRootRecord, request: LibraryIndexMaintenanceHistoryRequest) {
  try {
    const entries = await readMaintenanceHistory(indexMaintenanceHistoryPath, rootFingerprint(rootRecord), request.maxEntries ?? 30);
    return {
      ok: true as const,
      status: 'mvp129-index-maintenance-history-ready' as const,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      readAt: new Date().toISOString(),
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      entries,
      summary: {
        totalCount: entries.length,
        cleanupCount: entries.filter((item) => item.action === 'controlled-cleanup').length,
        restoreCount: entries.filter((item) => item.action === 'backup-restore').length,
        successCount: entries.filter((item) => item.status === 'complete').length,
        failedCount: entries.filter((item) => item.status === 'failed').length,
      },
      message: entries.length ? `已读取最近 ${entries.length} 条索引维护记录。` : '当前资源库还没有索引维护历史。',
      safetyNotes: buildSafetyNotes().concat(['history contains no absolute paths']),
    };
  } catch (error) {
    return {
      ok: false as const,
      status: 'mvp129-index-maintenance-history-failed' as const,
      absolutePathsReturned: false as const,
      fileUrlReturned: false as const,
      message: `读取索引维护历史失败：${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes(),
    };
  }
}

async function revealNearestExistingParent(rootRecord: TokenizedRootRecord, request: RevealMissingEntryParentRequest) {
  const resolved = resolveSafeIndexedEntryPath(rootRecord, request.relativePath);
  if (resolved.ok === false) {
    return {
      ok: false,
      status: 'mvp127-reveal-parent-unsafe-path',
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: resolved.message,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  let candidate = path.dirname(resolved.absolutePath);
  while (candidate !== rootAbsolute && candidate.startsWith(`${rootAbsolute}${path.sep}`)) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) break;
    } catch {
      // Continue toward the authorized root until an existing directory is found.
    }
    candidate = path.dirname(candidate);
  }
  if (candidate !== rootAbsolute && !candidate.startsWith(`${rootAbsolute}${path.sep}`)) candidate = rootAbsolute;
  const openError = await shell.openPath(candidate);
  if (openError) {
    return {
      ok: false,
      status: 'mvp127-reveal-parent-open-error',
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: `无法打开最近存在的目录：${openError}`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
  const nearestExistingRelativePath = path.relative(rootAbsolute, candidate).replace(/\\/g, '/') || '.';
  return {
    ok: true,
    status: 'mvp127-nearest-existing-parent-opened',
    rootPathToken: rootRecord.rootPathToken,
    entryId: request.entryId,
    requestedRelativePath: normalizeRelativePath(request.relativePath),
    nearestExistingRelativePath,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    message: '已打开该失效记录最近仍存在的目录，可手动检查文件是否被移动或改名。',
    safetyNotes: buildSafetyNotes().concat(['no file mutation']),
  } as const;
}


function isUnsafeRelativePath(relativePath: string): boolean {
  if (!relativePath || typeof relativePath !== 'string') return true;
  if (relativePath.includes('\0')) return true;
  if (relativePath.includes('file://')) return true;
  if (/^[A-Za-z]:[\\/]/.test(relativePath)) return true;
  if (relativePath.startsWith('/') || relativePath.startsWith('\\')) return true;
  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  return parts.length === 0 || parts.some((part) => part === '..' || part === '.');
}

function isUnsafeRelativeMediaPath(relativePath: string): boolean {
  return isUnsafeRelativePath(relativePath);
}

function resolveSafeMediaPath(rootRecord: TokenizedRootRecord, relativePath: string): { ok: true; absolutePath: string; extension: string } | { ok: false; message: string } {
  if (isUnsafeRelativeMediaPath(relativePath)) {
    return { ok: false, message: '媒体相对路径不合法，已拒绝解析。' };
  }
  const extension = extensionOf(relativePath);
  if (!HTML_AUDIO_PLAYABLE_EXTENSIONS.has(extension)) {
    return { ok: false, message: `当前 HTMLAudio MVP 不支持 .${extension || 'unknown'} 音频格式。` };
  }
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...relativePath.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, message: '媒体路径越过了用户选择的 rootPathToken 根目录，已拒绝。' };
  }
  return { ok: true, absolutePath, extension };
}

function resolveSafeMpvAudioPath(rootRecord: TokenizedRootRecord, relativePath: string): { ok: true; absolutePath: string; extension: string } | { ok: false; message: string } {
  if (isUnsafeRelativeMediaPath(relativePath)) {
    return { ok: false, message: 'mpv 音频相对路径不合法，已拒绝解析。' };
  }
  const extension = extensionOf(relativePath);
  if (!AUDIO_EXTENSIONS.has(extension)) {
    return { ok: false, message: `mpv 后端只接受已识别音频格式，当前为 .${extension || 'unknown'}。` };
  }
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...relativePath.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, message: 'mpv 音频路径越过 rootPathToken 根目录，已拒绝。' };
  }
  return { ok: true, absolutePath, extension };
}


function resolveSafeCoverPath(rootRecord: TokenizedRootRecord, relativePath: string): { ok: true; absolutePath: string; extension: string } | { ok: false; message: string } {
  if (isUnsafeRelativePath(relativePath)) {
    return { ok: false, message: '封面相对路径不合法，已拒绝解析。' };
  }
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  const extension = extensionOf(normalizedRelativePath);
  if (!IMAGE_EXTENSIONS.has(extension)) {
    return { ok: false, message: `当前 MVP-37 不读取 .${extension || 'unknown'} 作为封面。` };
  }
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...normalizedRelativePath.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, message: '封面路径越过了用户选择的 rootPathToken 根目录，已拒绝。' };
  }
  return { ok: true, absolutePath, extension };
}


function resolveSafeSubtitlePath(rootRecord: TokenizedRootRecord, relativePath: string): { ok: true; absolutePath: string; extension: string; relativePath: string } | { ok: false; message: string } {
  if (isUnsafeRelativePath(relativePath)) {
    return { ok: false, message: '字幕相对路径不合法，已拒绝读取。' };
  }
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  const extension = extensionOf(normalizedRelativePath);
  if (!READABLE_SUBTITLE_EXTENSIONS.has(extension)) {
    return { ok: false, message: `当前 MVP-26 不读取 .${extension || 'unknown'} 字幕格式。` };
  }
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...normalizedRelativePath.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, message: '字幕路径越过了用户选择的 rootPathToken 根目录，已拒绝。' };
  }
  return { ok: true, absolutePath, extension, relativePath: normalizedRelativePath };
}

function subtitleCandidatePaths(trackRelativePath: string, explicitRelativePaths: string[] = []): string[] {
  const candidates = new Set<string>();
  explicitRelativePaths.forEach((item) => {
    if (typeof item === 'string' && item.trim()) candidates.add(normalizeRelativePath(item.trim()));
  });

  if (!isUnsafeRelativePath(trackRelativePath)) {
    const normalizedTrack = normalizeRelativePath(trackRelativePath);
    const dir = normalizedTrack.includes('/') ? normalizedTrack.split('/').slice(0, -1).join('/') : '';
    const fileName = normalizedTrack.split('/').pop() || normalizedTrack;
    const base = fileName.replace(/\.[^.]+$/, '');
    const prefix = dir ? `${dir}/${base}` : base;
    const suffixes = [
      '.bilingual.lrc', '.zh.lrc', '.ja.lrc', '.lrc',
      '.bilingual.srt', '.zh.srt', '.ja.srt', '.srt',
      '.bilingual.vtt', '.zh.vtt', '.ja.vtt', '.vtt',
      '.bilingual.ass', '.zh.ass', '.ja.ass', '.ass',
    ];
    suffixes.forEach((suffix) => candidates.add(`${prefix}${suffix}`));
  }

  return Array.from(candidates).filter((candidate) => !isUnsafeRelativePath(candidate));
}

function formatLrcTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  const centiseconds = Math.floor((safe - Math.floor(safe)) * 100);
  return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}]`;
}

function parseTimestampToSeconds(value: string): number | undefined {
  const normalized = value.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);
    if (Number.isFinite(hours) && Number.isFinite(minutes) && Number.isFinite(seconds)) return hours * 3600 + minutes * 60 + seconds;
  }
  return undefined;
}

function sanitizeLyricText(value: string): string {
  return value
    .replace(/\{\\[^}]+\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\N/g, ' / ')
    .replace(/\\n/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLrcText(rawText: string): string[] {
  const output: string[] = [];
  for (const line of rawText.split(/\r?\n/)) {
    const matches = Array.from(line.matchAll(/\[(\d{1,3}:\d{2}(?:[.,]\d{1,3})?)\]/g));
    if (!matches.length) continue;
    const text = sanitizeLyricText(line.replace(/\[[^\]]+\]/g, ''));
    if (!text) continue;
    for (const match of matches) {
      const seconds = parseTimestampToSeconds(match[1]);
      if (seconds !== undefined) output.push(`${formatLrcTime(seconds)} ${text}`);
    }
  }
  return output.sort();
}

function parseSrtOrVttText(rawText: string): string[] {
  const output: string[] = [];
  const blocks = rawText.replace(/^\uFEFF/, '').split(/\r?\n\s*\r?\n/);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex < 0) continue;
    const timing = lines[timingIndex].split('-->')[0]?.trim();
    const seconds = timing ? parseTimestampToSeconds(timing) : undefined;
    if (seconds === undefined) continue;
    const text = sanitizeLyricText(lines.slice(timingIndex + 1).join(' / '));
    if (text) output.push(`${formatLrcTime(seconds)} ${text}`);
  }
  return output.sort();
}

function parseAssText(rawText: string): string[] {
  const output: string[] = [];
  for (const line of rawText.split(/\r?\n/)) {
    if (!line.startsWith('Dialogue:')) continue;
    const payload = line.slice('Dialogue:'.length).trim();
    const fields = payload.split(',');
    if (fields.length < 10) continue;
    const start = fields[1]?.trim();
    const seconds = start ? parseTimestampToSeconds(start) : undefined;
    if (seconds === undefined) continue;
    const text = sanitizeLyricText(fields.slice(9).join(','));
    if (text) output.push(`${formatLrcTime(seconds)} ${text}`);
  }
  return output.sort();
}

function parseSubtitleText(rawText: string, extension: string): string[] {
  if (extension === 'lrc') return parseLrcText(rawText);
  if (extension === 'srt' || extension === 'vtt') return parseSrtOrVttText(rawText);
  if (extension === 'ass') return parseAssText(rawText);
  return [];
}

async function readTrackLyrics(rootRecord: TokenizedRootRecord, request: ReadTrackLyricsRequest) {
  const maxBytes = Math.max(1024, Math.min(request.maxBytes ?? 2 * 1024 * 1024, 4 * 1024 * 1024));
  const candidates = subtitleCandidatePaths(request.trackRelativePath, request.subtitleRelativePaths ?? []);

  for (const candidate of candidates) {
    const resolved = resolveSafeSubtitlePath(rootRecord, candidate);
    if (resolved.ok === false) continue;
    try {
      const stat = await fs.stat(resolved.absolutePath);
      if (!stat.isFile()) continue;
      if (stat.size > maxBytes) {
        return {
          ok: false,
          status: 'mvp26-track-lyrics-too-large',
          rootPathToken: rootRecord.rootPathToken,
          trackId: request.trackId,
          trackRelativePath: request.trackRelativePath,
          subtitleRelativePath: resolved.relativePath,
          absolutePathReturned: false,
          fileUrlReturned: false,
          message: `字幕文件超过读取限制 ${(maxBytes / 1024 / 1024).toFixed(1)} MB，已拒绝。`,
          safetyNotes: buildSafetyNotes(),
        } as const;
      }
      const rawText = await fs.readFile(resolved.absolutePath, 'utf8');
      if (rawText.includes('file://')) {
        return {
          ok: false,
          status: 'mvp26-track-lyrics-unsafe-content',
          rootPathToken: rootRecord.rootPathToken,
          trackId: request.trackId,
          trackRelativePath: request.trackRelativePath,
          subtitleRelativePath: resolved.relativePath,
          absolutePathReturned: false,
          fileUrlReturned: false,
          message: '字幕正文包含 file://，已拒绝返回给 Renderer。',
          safetyNotes: buildSafetyNotes(),
        } as const;
      }
      const normalizedLines = parseSubtitleText(rawText, resolved.extension).slice(0, 5000);
      return {
        ok: true,
        status: 'mvp26-track-lyrics-read-complete',
        rootPathToken: rootRecord.rootPathToken,
        trackId: request.trackId,
        trackRelativePath: request.trackRelativePath,
        subtitleRelativePath: resolved.relativePath,
        format: resolved.extension,
        lineCount: rawText.split(/\r?\n/).length,
        parsedLineCount: normalizedLines.length,
        normalizedLrcLines: normalizedLines,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: normalizedLines.length > 0 ? '已读取本地字幕正文，并转换为 LRC 兼容时间轴。' : '已读取字幕文件，但未解析到可同步的时间轴行。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    } catch {
      continue;
    }
  }

  return {
    ok: false,
    status: 'mvp26-track-lyrics-missing-file',
    rootPathToken: rootRecord.rootPathToken,
    trackId: request.trackId,
    trackRelativePath: request.trackRelativePath,
    checkedRelativePaths: candidates.slice(0, 24),
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: '未找到与当前音轨匹配的 .lrc / .srt / .vtt / .ass 字幕文件。',
    safetyNotes: buildSafetyNotes(),
  } as const;
}


const BLOCKED_EXTERNAL_OPEN_EXTENSIONS = new Set(['exe', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'js', 'msi', 'dll', 'sys', 'lnk']);
const EXTERNAL_OPENABLE_EXTENSIONS = new Set([
  ...AUDIO_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  ...IMAGE_EXTENSIONS,
  ...READABLE_SUBTITLE_EXTENSIONS,
  ...TEXT_EXTENSIONS,
  ...ARCHIVE_EXTENSIONS,
]);

type ExternalEntryKind = OpenExternalFileRequest['expectedKind'];

function resolveSafeExternalPath(
  rootRecord: TokenizedRootRecord,
  relativePath: string,
  expectedKind?: ExternalEntryKind,
): { ok: true; absolutePath: string; extension: string; relativePath: string } | { ok: false; message: string } {
  if (isUnsafeRelativePath(relativePath)) {
    return { ok: false, message: '外部打开请求的相对路径不合法，已拒绝。' };
  }
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  const extension = extensionOf(normalizedRelativePath);
  if (BLOCKED_EXTERNAL_OPEN_EXTENSIONS.has(extension)) {
    return { ok: false, message: `为避免执行程序或脚本，MVP-27 不允许外部打开 .${extension} 文件。` };
  }
  if (expectedKind && expectedKind !== 'other' && !EXTERNAL_OPENABLE_EXTENSIONS.has(extension)) {
    return { ok: false, message: `当前外部打开策略未把 .${extension || 'unknown'} 识别为 ${expectedKind} 文件。` };
  }
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...normalizedRelativePath.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, message: '外部打开路径越过了用户选择的 rootPathToken 根目录，已拒绝。' };
  }
  return { ok: true, absolutePath, extension, relativePath: normalizedRelativePath };
}

async function openExternalFile(rootRecord: TokenizedRootRecord, request: OpenExternalFileRequest) {
  const resolved = resolveSafeExternalPath(rootRecord, request.relativePath, request.expectedKind);
  if (resolved.ok === false) {
    return {
      ok: false,
      status: 'mvp27-external-open-unsafe-path',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: request.relativePath,
      entryId: request.entryId,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: resolved.message,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  try {
    const stat = await fs.stat(resolved.absolutePath);
    if (!stat.isFile()) {
      return {
        ok: false,
        status: 'mvp27-external-open-missing-file',
        rootPathToken: rootRecord.rootPathToken,
        relativePath: resolved.relativePath,
        entryId: request.entryId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '外部打开目标不是普通文件。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    const openError = await shell.openPath(resolved.absolutePath);
    if (openError) {
      return {
        ok: false,
        status: 'mvp27-external-open-error',
        rootPathToken: rootRecord.rootPathToken,
        relativePath: resolved.relativePath,
        entryId: request.entryId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: openError,
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    return {
      ok: true,
      status: 'mvp27-external-open-complete',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: resolved.relativePath,
      entryId: request.entryId,
      expectedKind: request.expectedKind,
      openedWith: 'system-default-app',
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: '已调用系统默认应用打开文件；Renderer 仍未收到 absolutePath / file://。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  } catch (error) {
    return {
      ok: false,
      status: 'mvp27-external-open-missing-file',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: resolved.relativePath,
      entryId: request.entryId,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: `source stat failed: ${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
}

async function openInFileManager(rootRecord: TokenizedRootRecord, request: OpenInFileManagerRequest) {
  try {
    const rootAbsolute = path.resolve(rootRecord.absolutePath);
    let targetAbsolute = rootAbsolute;
    let normalizedRelativePath: string | undefined;

    if (request.relativePath && request.relativePath.trim()) {
      const resolved = resolveSafeExternalPath(rootRecord, request.relativePath, undefined);
      if (resolved.ok === false) {
        return {
          ok: false,
          status: 'mvp27-file-manager-open-unsafe-path',
          rootPathToken: rootRecord.rootPathToken,
          relativePath: request.relativePath,
          entryId: request.entryId,
          absolutePathReturned: false,
          fileUrlReturned: false,
          message: resolved.message,
          safetyNotes: buildSafetyNotes(),
        } as const;
      }
      targetAbsolute = resolved.absolutePath;
      normalizedRelativePath = resolved.relativePath;
    }

    const stat = await fs.stat(targetAbsolute);
    if (stat.isFile()) {
      shell.showItemInFolder(targetAbsolute);
    } else if (stat.isDirectory()) {
      const openError = await shell.openPath(targetAbsolute);
      if (openError) throw new Error(openError);
    } else {
      return {
        ok: false,
        status: 'mvp27-file-manager-open-missing-target',
        rootPathToken: rootRecord.rootPathToken,
        relativePath: normalizedRelativePath,
        entryId: request.entryId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '文件管理器定位目标既不是文件也不是目录。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return {
      ok: true,
      status: 'mvp27-file-manager-open-complete',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: normalizedRelativePath,
      entryId: request.entryId,
      openedWith: 'system-file-manager',
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: normalizedRelativePath ? '已在系统文件管理器中定位条目。' : '已打开所选资源库根目录。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  } catch (error) {
    return {
      ok: false,
      status: 'mvp27-file-manager-open-missing-target',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: request.relativePath,
      entryId: request.entryId,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: `source stat failed: ${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
}

function buildTokenizedMediaUrl(rootPathToken: string, relativePath: string): string {
  return `yang-kura-media://track/${encodeURIComponent(rootPathToken)}/${encodeURIComponent(relativePath)}`;
}

function buildTokenizedCoverUrl(rootPathToken: string, relativePath: string): string {
  return `yang-kura-media://cover/${encodeURIComponent(rootPathToken)}/${encodeURIComponent(relativePath)}`;
}

async function resolveTrackMediaUrl(rootRecord: TokenizedRootRecord, request: ResolveTrackMediaUrlRequest) {
  const resolved = resolveSafeMediaPath(rootRecord, request.relativePath);
  if (resolved.ok === false) {
    return {
      ok: false,
      status: 'mvp25-media-url-unsupported-source',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: request.relativePath,
      trackId: request.trackId,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: resolved.message,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  try {
    const stat = await fs.stat(resolved.absolutePath);
    if (!stat.isFile()) {
      return {
        ok: false,
        status: 'mvp25-media-url-not-file',
        rootPathToken: rootRecord.rootPathToken,
        relativePath: request.relativePath,
        trackId: request.trackId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '媒体相对路径存在，但不是普通文件。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
  } catch (error) {
    return {
      ok: false,
      status: 'mvp25-media-url-missing-file',
      rootPathToken: rootRecord.rootPathToken,
      relativePath: request.relativePath,
      trackId: request.trackId,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: `source stat failed: ${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  return {
    ok: true,
    status: 'mvp25-media-url-ready',
    rootPathToken: rootRecord.rootPathToken,
    relativePath: request.relativePath,
    trackId: request.trackId,
    expectedKind: request.expectedKind,
    mediaUrl: buildTokenizedMediaUrl(rootRecord.rootPathToken, request.relativePath),
    mediaProtocol: 'yang-kura-media',
    extension: resolved.extension,
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: '已生成受控媒体 URL，可交给 HTMLAudio 播放；Renderer 仍未收到 absolutePath / file://。',
    safetyNotes: buildSafetyNotes(),
  } as const;
}


let mpvPlaybackBackend: MpvPlaybackBackend | null = null;

function registerMpvPlaybackIpc(mainWindow: BrowserWindow): void {
  mpvPlaybackBackend = new MpvPlaybackBackend((event) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('yang-kura:player:mpv:event', event);
    }
  }, () => mpvSettingsStore.getCandidate().executable);

  for (const channel of ['yang-kura:player:mpv:start', 'yang-kura:player:mpv:command', 'yang-kura:player:mpv:status']) {
    ipcMain.removeHandler(channel);
  }

  ipcMain.handle('yang-kura:player:mpv:start', async (_event, request: unknown) => {
    const payload = request as Partial<MpvPlaybackStartRequest> | undefined;
    if (!payload?.rootPathToken || !payload.relativePath || !payload.trackId || payload.mode !== 'mpv-playback-start') {
      return {
        ok: false,
        status: 'mvp122-mpv-start-failed',
        backend: 'html-audio-fallback',
        trackId: payload?.trackId ?? '',
        message: 'mpv 启动请求缺少 tokenized 音轨信息，已回退 HTMLAudio。',
        executableLabel: 'mpv',
        absolutePathReturned: false,
        fileUrlReturned: false,
      } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp122-mpv-start-failed',
        backend: 'html-audio-fallback',
        trackId: payload.trackId,
        message: 'rootPathToken 无效或已失效，无法启动 mpv。',
        executableLabel: 'mpv',
        absolutePathReturned: false,
        fileUrlReturned: false,
      } as const;
    }
    const resolved = resolveSafeMpvAudioPath(rootRecord, payload.relativePath);
    if (resolved.ok === false) {
      return {
        ok: false,
        status: 'mvp122-mpv-start-failed',
        backend: 'html-audio-fallback',
        trackId: payload.trackId,
        message: resolved.message,
        executableLabel: 'mpv',
        absolutePathReturned: false,
        fileUrlReturned: false,
      } as const;
    }
    try {
      const stat = await fs.stat(resolved.absolutePath);
      if (!stat.isFile()) throw new Error('音轨不是普通文件。');
    } catch (error) {
      return {
        ok: false,
        status: 'mvp122-mpv-start-failed',
        backend: 'html-audio-fallback',
        trackId: payload.trackId,
        message: `mpv 音轨读取失败：${getSafeErrorCode(error)}`,
        executableLabel: 'mpv',
        absolutePathReturned: false,
        fileUrlReturned: false,
      } as const;
    }
    return mpvPlaybackBackend!.start({
      trackId: payload.trackId,
      absolutePath: resolved.absolutePath,
      startSeconds: Math.max(0, Number(payload.startSeconds) || 0),
      volume: Math.max(0, Math.min(1, Number(payload.volume) || 0)),
      muted: Boolean(payload.muted),
    });
  });

  ipcMain.handle('yang-kura:player:mpv:command', async (_event, request: unknown) => {
    const payload = request as Partial<MpvPlaybackCommandRequest> | undefined;
    if (!payload || payload.mode !== 'mpv-playback-command' || !payload.command || !mpvPlaybackBackend) {
      return {
        ok: false,
        status: 'mvp122-mpv-not-running',
        command: payload?.command ?? 'stop',
        message: 'mpv 命令请求无效或后端未初始化。',
        absolutePathReturned: false,
        fileUrlReturned: false,
      } as const;
    }
    if (payload.command === 'seek') return mpvPlaybackBackend.command({ command: 'seek', seconds: Number(payload.seconds) || 0 });
    if (payload.command === 'set-volume') return mpvPlaybackBackend.command({ command: 'set-volume', volume: Number(payload.volume) || 0 });
    if (payload.command === 'set-muted') return mpvPlaybackBackend.command({ command: 'set-muted', muted: Boolean(payload.muted) });
    if (payload.command === 'pause' || payload.command === 'resume' || payload.command === 'stop') {
      return mpvPlaybackBackend.command({ command: payload.command });
    }
    return {
      ok: false,
      status: 'mvp122-mpv-command-failed',
      command: String(payload.command),
      message: '不支持的 mpv 命令。',
      absolutePathReturned: false,
      fileUrlReturned: false,
    } as const;
  });

  ipcMain.handle('yang-kura:player:mpv:status', async () => mpvPlaybackBackend!.getRuntimeStatus());
}


function getMpvRuntimeDetails() {
  const runtime = mpvPlaybackBackend?.getRuntimeStatus();
  return {
    running: runtime?.running ?? false,
    connected: runtime?.connected ?? false,
    activeTrackId: runtime?.activeTrackId ?? null,
    seekStrategy: runtime?.seekStrategy ?? 'coalesced-absolute-exact',
    pendingSeek: runtime?.pendingSeek ?? false,
    lastKnownPositionSeconds: runtime?.lastKnownPositionSeconds ?? 0,
    lastKnownDurationSeconds: runtime?.lastKnownDurationSeconds ?? 0,
    lastErrorMessage: runtime?.lastErrorMessage ?? null,
    lastExitReason: runtime?.lastExitReason ?? null,
    shutdownState: runtime?.shutdownState ?? 'idle',
    processStartedAt: runtime?.processStartedAt ?? null,
  } as const;
}

function registerMpvSettingsIpc(): void {
  for (const channel of [
    'yang-kura:player:mpv:installation-status',
    'yang-kura:player:mpv:select-executable',
    'yang-kura:player:mpv:clear-executable',
  ]) {
    ipcMain.removeHandler(channel);
  }

  ipcMain.handle('yang-kura:player:mpv:installation-status', async () => {
    const installation = await mpvSettingsStore.getInstallationStatus();
    return {
      ...installation,
      ...getMpvRuntimeDetails(),
    } as const;
  });

  ipcMain.handle('yang-kura:player:mpv:select-executable', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择 mpv 可执行文件',
      properties: ['openFile'],
      filters: process.platform === 'win32'
        ? [{ name: 'mpv 可执行文件', extensions: ['exe'] }]
        : [{ name: 'mpv 可执行文件', extensions: ['*'] }],
    });
    if (result.canceled || result.filePaths.length === 0) {
      const installation = await mpvSettingsStore.getInstallationStatus();
      return {
        ...installation,
        ok: false,
        actionStatus: 'mvp123-mpv-selection-cancelled',
        ...getMpvRuntimeDetails(),
        message: '未更改 mpv 设置。',
      } as const;
    }

    try {
      await mpvPlaybackBackend?.dispose();
      const installation = await mpvSettingsStore.setSelectedExecutable(result.filePaths[0]);
      return {
        ...installation,
        ok: true,
        actionStatus: 'mvp123-mpv-executable-selected',
        ...getMpvRuntimeDetails(),
      } as const;
    } catch (error) {
      const installation = await mpvSettingsStore.getInstallationStatus();
      return {
        ...installation,
        ok: false,
        actionStatus: 'mvp123-mpv-executable-invalid',
        ...getMpvRuntimeDetails(),
        message: error instanceof Error ? error.message : String(error),
      } as const;
    }
  });

  ipcMain.handle('yang-kura:player:mpv:clear-executable', async () => {
    await mpvPlaybackBackend?.dispose();
    const installation = await mpvSettingsStore.clearSelectedExecutable();
    return {
      ...installation,
      ok: true,
      actionStatus: 'mvp123-mpv-executable-cleared',
      ...getMpvRuntimeDetails(),
      message: installation.available
        ? `已清除手动路径，当前改用 ${installation.executableLabel}。`
        : '已清除手动路径；未检测到系统 mpv，将继续使用 HTMLAudio。',
    } as const;
  });
}

function registerMediaProtocol(): void {
  protocol.handle('yang-kura-media', async (request) => {
    try {
      const url = new URL(request.url);
      if (url.hostname !== 'track' && url.hostname !== 'cover') {
        return new Response('Invalid media URL host.', { status: 400 });
      }
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        return new Response('Invalid media URL path.', { status: 400 });
      }
      const rootPathToken = decodeURIComponent(pathParts[0]);
      const relativePath = decodeURIComponent(pathParts.slice(1).join('/'));
      const rootRecord = rootTokenMap.get(rootPathToken);
      if (!rootRecord) {
        return new Response('Invalid or expired rootPathToken.', { status: 404 });
      }
      const resolved = url.hostname === 'cover'
        ? resolveSafeCoverPath(rootRecord, relativePath)
        : resolveSafeMediaPath(rootRecord, relativePath);
      if (resolved.ok === false) {
        return new Response(resolved.message, { status: 403 });
      }
      const stat = await fs.stat(resolved.absolutePath);
      if (!stat.isFile()) {
        return new Response('Media source is not a regular file.', { status: 404 });
      }
      return net.fetch(pathToFileURL(resolved.absolutePath).toString());
    } catch (error) {
      return new Response(error instanceof Error ? error.message : String(error), { status: 500 });
    }
  });
}

export function getElectronMainShellRuntimeStatus(): ElectronMainShellRuntimeStatus {
  return {
    status: 'mvp28-shell-runtime-validation-ready',
    createsBrowserWindow: true,
    loadsViteDevUrl: isDevShell,
    loadsBuiltDist: !isDevShell,
    registersScannerIpcHandlers: true,
    opensDirectoryDialog: true,
    readsRealDirectory: true,
    readOnlyDryRunScansEnabled: true,
    writesLibraryIndex: true,
    canGenerateIndexWritePreview: true,
    canWriteLibraryIndex: true,
    canReadLibraryIndex: true,
    canCheckLibraryIndexHealth: true,
    canWriteControlledIndexRemoval: true,
    canListIndexBackups: true,
    canRestoreIndexBackup: true,
    canPreviewBackupRetention: true,
    canReadIndexMaintenanceHistory: true,
    canResolveMediaTrackUrl: true,
    canUseMpvPlayback: true,
    canReadTrackLyrics: true,
    canOpenExternalFile: true,
    canOpenInFileManager: true,
    registersMediaProtocol: true,
    exposesAbsolutePathsToRenderer: false,
  };
}

function registerDirectoryDialogIpc(mainWindow: BrowserWindow): void {
  ipcMain.handle('yang-kura:dialog:select-library-root', async (_event, request: unknown) => {
    const payload = request as Partial<SelectLibraryRootRequest> | undefined;
    const libraryType = isValidLibraryType(payload?.libraryType) ? payload.libraryType : 'mixed';

    if (payload?.reason !== 'user-selected-library-root') {
      return {
        ok: false,
        status: 'mvp19-dialog-error',
        libraryType,
        permissionState: 'rejected',
        source: 'mvp19-electron-dialog',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '目录选择请求缺少用户主动触发 reason，已拒绝。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const e2eRootPath = process.env.YANG_KURA_E2E_MODE === '1'
      ? process.env.YANG_KURA_E2E_LIBRARY_ROOT?.trim()
      : undefined;
    let result: { canceled: boolean; filePaths: string[] };
    if (e2eRootPath) {
      try {
        const resolvedE2eRoot = path.resolve(e2eRootPath);
        const e2eRootStat = await fs.stat(resolvedE2eRoot);
        if (!e2eRootStat.isDirectory()) throw Object.assign(new Error('not-directory'), { code: 'ENOTDIR' });
        result = { canceled: false, filePaths: [resolvedE2eRoot] };
      } catch (error) {
        return {
          ok: false,
          status: 'u28-e2e-root-invalid',
          libraryType,
          permissionState: 'rejected',
          source: 'u28-electron-e2e-fixture',
          absolutePathReturned: false,
          fileUrlReturned: false,
          message: `E2E 临时资源库不可用：${getSafeErrorCode(error)}`,
          safetyNotes: buildSafetyNotes(),
        } as const;
      }
    } else {
      result = await dialog.showOpenDialog(mainWindow, {
        title: `选择 ${getDefaultDisplayName(libraryType)} 根目录`,
        buttonLabel: '选择此目录',
        properties: ['openDirectory', 'dontAddToRecent'],
      });
    }

    if (result.canceled || result.filePaths.length === 0) {
      return {
        ok: false,
        status: 'mvp19-user-cancelled',
        libraryType,
        permissionState: 'cancelled',
        source: 'mvp19-electron-dialog',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '用户取消了目录选择；未生成 rootPathToken。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const absolutePath = result.filePaths[0];
    const displayName = path.basename(absolutePath) || getDefaultDisplayName(libraryType);
    const rootPathToken = `yk-root-${crypto.randomUUID()}`;

    rootTokenMap.set(rootPathToken, {
      rootPathToken,
      absolutePath,
      displayName,
      libraryType,
      selectedAt: new Date().toISOString(),
    });

    return {
      ok: true,
      status: 'mvp19-user-selected-tokenized-root',
      rootPathToken,
      displayName,
      libraryType,
      permissionState: 'user-selected',
      source: 'mvp19-electron-dialog',
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: '已选择目录，并生成 rootPathToken；真实路径未返回 Renderer。现在可执行只读 dry-run 扫描。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  });
}

function registerDryRunScannerIpc(): void {
  ipcMain.handle('yang-kura:scanner:dry-run:request', async (_event, request: unknown) => {
    const payload = request as Partial<ScannerDryRunRequest> | undefined;

    if (!payload?.rootPathToken || payload.mode !== 'dry-run' || payload.previewOnly !== true) {
      return {
        ok: false,
        status: 'mvp20-dry-run-invalid-request',
        indexWriteAllowed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'dry-run 请求必须包含 rootPathToken、mode=dry-run、previewOnly=true。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp20-invalid-root-token',
        indexWriteAllowed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    try {
      const result = await runReadOnlyDryRun(rootRecord, {
        rootPathToken: payload.rootPathToken,
        mode: 'dry-run',
        previewOnly: true,
        maxEntries: payload.maxEntries,
        maxDepth: payload.maxDepth,
      });
      lastDryRunResultMap.set(payload.rootPathToken, result);
      return result;
    } catch (error) {
      return {
        ok: false,
        status: 'mvp20-dry-run-error',
        indexWriteAllowed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: `source stat failed: ${getSafeErrorCode(error)}`,
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
  });
}


function registerWriteIndexPreviewIpc(): void {
  ipcMain.handle('yang-kura:index:write-preview-request', async (_event, request: unknown) => {
    const payload = request as Partial<WriteIndexPreviewRequest> | undefined;

    if (!payload?.rootPathToken || payload.mode !== 'preview-only') {
      return {
        ok: false,
        status: 'mvp22-write-index-preview-invalid-request',
        indexWriteAllowed: false,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'write-index preview 请求必须包含 rootPathToken 且 mode=preview-only。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp22-write-index-preview-invalid-root-token',
        indexWriteAllowed: false,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录并重新 dry-run。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const dryRun = lastDryRunResultMap.get(payload.rootPathToken);
    if (!dryRun) {
      return {
        ok: false,
        status: 'mvp22-write-index-preview-missing-dry-run',
        indexWriteAllowed: false,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: '当前 rootPathToken 还没有 dry-run 结果。请先运行只读 dry-run 扫描。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return buildIndexWritePreview(rootRecord, dryRun, {
      rootPathToken: payload.rootPathToken,
      mode: 'preview-only',
      dryRunScannedAt: payload.dryRunScannedAt,
      maxPreviewEntries: payload.maxPreviewEntries,
    });
  });
}

function registerWriteLibraryIndexIpc(): void {
  ipcMain.handle('yang-kura:index:write-confirmed-request', async (_event, request: unknown) => {
    const payload = request as Partial<WriteLibraryIndexRequest> | undefined;

    if (!payload?.rootPathToken || payload.mode !== 'confirmed-write') {
      return {
        ok: false,
        status: 'mvp23-library-index-write-invalid-request',
        indexWriteAllowed: false,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'library-index 写入请求必须包含 rootPathToken 且 mode=confirmed-write。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp23-library-index-write-invalid-root-token',
        indexWriteAllowed: false,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录、重新 dry-run，并重新生成写入预览。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const dryRun = lastDryRunResultMap.get(payload.rootPathToken);
    if (!dryRun) {
      return {
        ok: false,
        status: 'mvp23-library-index-write-missing-dry-run',
        indexWriteAllowed: false,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: '当前 rootPathToken 还没有 dry-run 结果。请先运行只读 dry-run 扫描。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    try {
      return await writeLibraryIndex(rootRecord, dryRun, {
        rootPathToken: payload.rootPathToken,
        mode: 'confirmed-write',
        dryRunScannedAt: payload.dryRunScannedAt,
        createBackup: payload.createBackup !== false,
        maxWriteEntries: payload.maxWriteEntries,
      });
    } catch (error) {
      return {
        ok: false,
        status: 'mvp23-library-index-write-error',
        indexWriteAllowed: true,
        indexWritePerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: `source stat failed: ${getSafeErrorCode(error)}`,
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
  });
}

function registerReadLibraryIndexIpc(): void {
  ipcMain.handle('yang-kura:index:read-current-request', async (_event, request: unknown) => {
    const payload = request as Partial<ReadLibraryIndexRequest> | undefined;

    if (!payload?.rootPathToken || payload.mode !== 'read-current-index') {
      return {
        ok: false,
        status: 'mvp24-library-index-read-invalid-request',
        indexReadAllowed: false,
        indexReadPerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'library-index 读取请求必须包含 rootPathToken 且 mode=read-current-index。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp24-library-index-read-invalid-root-token',
        indexReadAllowed: false,
        indexReadPerformed: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return readLibraryIndex(rootRecord, {
      rootPathToken: payload.rootPathToken,
      mode: 'read-current-index',
    });
  });
}


function registerLibraryIndexHealthIpc(): void {
  ipcMain.handle('yang-kura:index:health-check-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexHealthCheckRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'read-only-health-check') {
      return {
        ok: false,
        status: 'mvp127-index-health-invalid-request',
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: '失效索引检查必须包含 rootPathToken 且 mode=read-only-health-check。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp127-index-health-invalid-root-token',
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择资源库目录。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    return checkLibraryIndexHealth(rootRecord, {
      rootPathToken: payload.rootPathToken,
      mode: 'read-only-health-check',
      maxEntries: payload.maxEntries,
    });
  });

  ipcMain.handle('yang-kura:index:removal-preview-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexRemovalPreviewRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'remove-missing-preview') {
      return {
        ok: false,
        status: 'mvp127-removal-preview-invalid-request',
        absolutePathsReturned: false,
        fileUrlReturned: false,
        writePerformed: false,
        message: '移除预览必须包含 rootPathToken 且 mode=remove-missing-preview。',
        safetyNotes: buildSafetyNotes().concat(['preview-only']),
      } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp127-removal-preview-invalid-root-token',
        absolutePathsReturned: false,
        fileUrlReturned: false,
        writePerformed: false,
        message: 'rootPathToken 无效或已失效。请重新选择资源库目录。',
        safetyNotes: buildSafetyNotes().concat(['preview-only']),
      } as const;
    }
    return buildRemovalPreviewForHealth(rootRecord, {
      rootPathToken: payload.rootPathToken,
      mode: 'remove-missing-preview',
      issueIds: Array.isArray(payload.issueIds) ? payload.issueIds.filter((item): item is string => typeof item === 'string') : undefined,
    });
  });

  ipcMain.handle('yang-kura:index:removal-write-confirmed-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexRemovalWriteRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'confirmed-index-removal-write') {
      return {
        ok: false,
        status: 'mvp128-index-cleanup-invalid-request',
        writePerformed: false,
        backupCreated: false,
        mediaFilesDeleted: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: '索引清理写入请求无效。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp128-index-cleanup-invalid-root-token',
        writePerformed: false,
        backupCreated: false,
        mediaFilesDeleted: false,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择资源库目录。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    return writeLibraryIndexRemovalWithBackup(rootRecord, {
      rootPathToken: payload.rootPathToken,
      mode: 'confirmed-index-removal-write',
      sourceIndexSha256: typeof payload.sourceIndexSha256 === 'string' ? payload.sourceIndexSha256 : '',
      previewGeneratedAt: typeof payload.previewGeneratedAt === 'string' ? payload.previewGeneratedAt : '',
      userConfirmed: payload.userConfirmed === true,
      confirmationText: typeof payload.confirmationText === 'string' ? payload.confirmationText : '',
      createBackup: payload.createBackup === true,
    });
  });

  ipcMain.handle('yang-kura:index:backup-list-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexBackupListRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'list-index-backups') {
      return { ok: false, status: 'mvp129-index-backup-list-invalid-request', absolutePathsReturned: false, fileUrlReturned: false, message: '备份列表请求无效。', safetyNotes: buildSafetyNotes() } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) return { ok: false, status: 'mvp129-index-backup-list-invalid-root-token', absolutePathsReturned: false, fileUrlReturned: false, message: 'rootPathToken 无效或已失效。', safetyNotes: buildSafetyNotes() } as const;
    return listLibraryIndexBackupsForRoot(rootRecord, { rootPathToken: payload.rootPathToken, mode: 'list-index-backups', maxEntries: payload.maxEntries });
  });

  ipcMain.handle('yang-kura:index:backup-retention-preview-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexBackupRetentionPreviewRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'preview-backup-retention') {
      return { ok: false, status: 'mvp129-index-backup-retention-invalid-request', absolutePathsReturned: false, fileUrlReturned: false, deletePerformed: false, message: '备份保留预览请求无效。', safetyNotes: buildSafetyNotes() } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) return { ok: false, status: 'mvp129-index-backup-retention-invalid-root-token', absolutePathsReturned: false, fileUrlReturned: false, deletePerformed: false, message: 'rootPathToken 无效或已失效。', safetyNotes: buildSafetyNotes() } as const;
    return previewLibraryIndexBackupRetention(rootRecord, { rootPathToken: payload.rootPathToken, mode: 'preview-backup-retention', maxAgeDays: payload.maxAgeDays, keepNewest: payload.keepNewest });
  });

  ipcMain.handle('yang-kura:index:backup-restore-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexBackupRestoreRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'restore-index-backup' || !payload.backupRelativePath || !payload.backupSha256) {
      return { ok: false, status: 'mvp129-index-backup-restore-invalid-request', writePerformed: false, currentBackupCreated: false, mediaFilesDeleted: false, absolutePathsReturned: false, fileUrlReturned: false, message: '备份恢复请求无效。', safetyNotes: buildSafetyNotes() } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) return { ok: false, status: 'mvp129-index-backup-restore-invalid-root-token', writePerformed: false, currentBackupCreated: false, mediaFilesDeleted: false, absolutePathsReturned: false, fileUrlReturned: false, message: 'rootPathToken 无效或已失效。', safetyNotes: buildSafetyNotes() } as const;
    return restoreLibraryIndexBackupForRoot(rootRecord, {
      rootPathToken: payload.rootPathToken,
      mode: 'restore-index-backup',
      backupRelativePath: payload.backupRelativePath,
      backupSha256: payload.backupSha256,
      confirmationText: typeof payload.confirmationText === 'string' ? payload.confirmationText : '',
      createCurrentBackup: payload.createCurrentBackup === true,
    });
  });

  ipcMain.handle('yang-kura:index:maintenance-history-request', async (_event, request: unknown) => {
    const payload = request as Partial<LibraryIndexMaintenanceHistoryRequest> | undefined;
    if (!payload?.rootPathToken || payload.mode !== 'read-index-maintenance-history') {
      return { ok: false, status: 'mvp129-index-maintenance-history-invalid-request', absolutePathsReturned: false, fileUrlReturned: false, message: '维护历史请求无效。', safetyNotes: buildSafetyNotes() } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) return { ok: false, status: 'mvp129-index-maintenance-history-invalid-root-token', absolutePathsReturned: false, fileUrlReturned: false, message: 'rootPathToken 无效或已失效。', safetyNotes: buildSafetyNotes() } as const;
    return readLibraryIndexMaintenanceHistoryForRoot(rootRecord, { rootPathToken: payload.rootPathToken, mode: 'read-index-maintenance-history', maxEntries: payload.maxEntries });
  });

  ipcMain.handle('yang-kura:index:reveal-nearest-parent-request', async (_event, request: unknown) => {
    const payload = request as Partial<RevealMissingEntryParentRequest> | undefined;
    if (!payload?.rootPathToken || !payload.relativePath || !payload.entryId || payload.mode !== 'reveal-nearest-existing-parent') {
      return {
        ok: false,
        status: 'mvp127-reveal-parent-invalid-request',
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: '重新定位请求缺少 rootPathToken、relativePath 或 entryId。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp127-reveal-parent-invalid-root-token',
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择资源库目录。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }
    return revealNearestExistingParent(rootRecord, {
      rootPathToken: payload.rootPathToken,
      relativePath: payload.relativePath,
      entryId: payload.entryId,
      mode: 'reveal-nearest-existing-parent',
    });
  });
}


function registerResolveTrackMediaUrlIpc(): void {
  ipcMain.handle('yang-kura:media:resolve-track-url', async (_event, request: unknown) => {
    const payload = request as Partial<ResolveTrackMediaUrlRequest> | undefined;

    if (!payload?.rootPathToken || !payload.relativePath || !payload.trackId || payload.expectedKind !== 'audio') {
      return {
        ok: false,
        status: 'mvp25-media-url-invalid-request',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '媒体 URL 请求必须包含 rootPathToken、relativePath、trackId，且 expectedKind=audio。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp25-media-url-invalid-root-token',
        rootPathToken: payload.rootPathToken,
        relativePath: payload.relativePath,
        trackId: payload.trackId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录并读取 index。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return resolveTrackMediaUrl(rootRecord, {
      rootPathToken: payload.rootPathToken,
      relativePath: payload.relativePath,
      trackId: payload.trackId,
      expectedKind: 'audio',
    });
  });
}



function registerReadTrackLyricsIpc(): void {
  ipcMain.handle('yang-kura:lyrics:read-track-lyrics', async (_event, request: unknown) => {
    const payload = request as Partial<ReadTrackLyricsRequest> | undefined;

    if (!payload?.rootPathToken || !payload.trackId || !payload.trackRelativePath || payload.mode !== 'read-track-lyrics') {
      return {
        ok: false,
        status: 'mvp26-track-lyrics-invalid-request',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '字幕读取请求必须包含 rootPathToken、trackId、trackRelativePath，且 mode=read-track-lyrics。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp26-track-lyrics-invalid-root-token',
        rootPathToken: payload.rootPathToken,
        trackId: payload.trackId,
        trackRelativePath: payload.trackRelativePath,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录并读取 index。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return readTrackLyrics(rootRecord, {
      rootPathToken: payload.rootPathToken,
      trackId: payload.trackId,
      trackRelativePath: payload.trackRelativePath,
      mode: 'read-track-lyrics',
      subtitleRelativePaths: Array.isArray(payload.subtitleRelativePaths) ? payload.subtitleRelativePaths : [],
      maxBytes: payload.maxBytes,
    });
  });
}



function registerAsmrMetadataProviderIpc(): void {
  ipcMain.handle('yang-kura:metadata:asmr:single-rj-preview', async (_event, request: unknown) => {
    const payload = request as Partial<AsmrMetadataProviderRequest> | undefined;
    return fetchDlsiteMetadata(payload);
  });

  ipcMain.handle('yang-kura:metadata:asmr:single-rj-cache-clear', async (_event, request: unknown) => {
    const payload = request as Partial<AsmrMetadataProviderCacheClearRequest> | undefined;
    return clearDlsiteMetadataCache(payload);
  });
}


function registerExternalOpenIpc(): void {
  ipcMain.handle('yang-kura:external:open-file', async (_event, request: unknown) => {
    const payload = request as Partial<OpenExternalFileRequest> | undefined;
    const allowedKinds = new Set(['audio', 'video', 'image', 'text', 'archive', 'other']);

    if (!payload?.rootPathToken || !payload.relativePath || !payload.entryId || payload.mode !== 'open-external-file' || !allowedKinds.has(String(payload.expectedKind))) {
      return {
        ok: false,
        status: 'mvp27-external-open-invalid-request',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '外部打开请求必须包含 rootPathToken、relativePath、entryId、expectedKind，且 mode=open-external-file。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp27-external-open-invalid-root-token',
        rootPathToken: payload.rootPathToken,
        relativePath: payload.relativePath,
        entryId: payload.entryId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录并读取 index。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return openExternalFile(rootRecord, {
      rootPathToken: payload.rootPathToken,
      relativePath: payload.relativePath,
      entryId: payload.entryId,
      mode: 'open-external-file',
      expectedKind: payload.expectedKind as OpenExternalFileRequest['expectedKind'],
    });
  });

  ipcMain.handle('yang-kura:external:open-in-file-manager', async (_event, request: unknown) => {
    const payload = request as Partial<OpenInFileManagerRequest> | undefined;

    if (!payload?.rootPathToken || payload.mode !== 'open-in-file-manager') {
      return {
        ok: false,
        status: 'mvp27-file-manager-open-invalid-request',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: '文件管理器定位请求必须包含 rootPathToken，且 mode=open-in-file-manager。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const rootRecord = rootTokenMap.get(payload.rootPathToken);
    if (!rootRecord) {
      return {
        ok: false,
        status: 'mvp27-file-manager-open-invalid-root-token',
        rootPathToken: payload.rootPathToken,
        relativePath: payload.relativePath,
        entryId: payload.entryId,
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: 'rootPathToken 无效或已失效。请重新选择目录并读取 index。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return openInFileManager(rootRecord, {
      rootPathToken: payload.rootPathToken,
      relativePath: payload.relativePath,
      entryId: payload.entryId,
      mode: 'open-in-file-manager',
    });
  });
}


function resolveSafeCopyPath(rootRecord: TokenizedRootRecord, relativePath: string): { ok: true; absolutePath: string; relativePath: string } | { ok: false; message: string; code: string } {
  if (isUnsafeRelativePath(relativePath)) {
    return { ok: false, code: 'unsafe-relative-path', message: 'copy-only preflight 的相对路径不合法，已拒绝解析。' };
  }
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  const rootAbsolute = path.resolve(rootRecord.absolutePath);
  const absolutePath = path.resolve(rootAbsolute, ...normalizedRelativePath.split('/'));
  if (absolutePath !== rootAbsolute && !absolutePath.startsWith(`${rootAbsolute}${path.sep}`)) {
    return { ok: false, code: 'path-escape-blocked', message: 'copy-only preflight 路径越过了 rootPathToken 根目录，已拒绝。' };
  }
  return { ok: true, absolutePath, relativePath: normalizedRelativePath };
}

async function buildMvp94CopyOnlyPreflightResult(request: Partial<ImportCopyOnlyStubRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp94-copy-only-preflight-real-check',
    'preflight may stat source/target paths in main-side token space',
    'execute remains disabled: no fs.copyFile, no mkdir, no OperationLog write',
    'renderer token only: no absolutePath, no file://',
  ]);

  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'copy-only-stub') {
    return {
      ok: false,
      status: 'mvp94-copy-only-preflight-invalid-request',
      operationPlanId: request?.operationPlanId ?? 'mvp94-missing-operation-plan',
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      createdDirectoryCount: 0,
      message: 'copy-only preflight 请求必须包含 operationPlanId、rootPathToken、targetRootPathToken，且 mode=copy-only-stub。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) {
    return {
      ok: false,
      status: 'mvp94-copy-only-preflight-invalid-root-token',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      createdDirectoryCount: 0,
      message: 'rootPathToken 或 targetRootPathToken 无效。请重新选择源目录和目标仓库目录。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const relativePaths = Array.isArray(request.relativePaths) ? request.relativePaths.slice(0, 200) : [];
  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  if (relativePaths.length === 0) {
    return {
      ok: false,
      status: 'mvp94-copy-only-preflight-empty-file-list',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      createdDirectoryCount: 0,
      checkedFileCount: 0,
      message: 'copy-only preflight 至少需要一个 source relativePath。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const fileChecks = [];
  let sourceMissingCount = 0;
  let targetExistingCount = 0;
  let targetParentMissingCount = 0;
  let blockedFileCount = 0;

  for (let index = 0; index < relativePaths.length; index += 1) {
    const sourceRelativePath = relativePaths[index];
    const targetRelativePath = targetRelativePaths[index] ?? sourceRelativePath;
    const blockedReasonCodes: string[] = [];
    let sourceExists = false;
    let sourceIsFile = false;
    let targetExists = false;
    let targetParentExists = false;

    const sourceResolved = typeof sourceRelativePath === 'string' ? resolveSafeCopyPath(sourceRoot, sourceRelativePath) : { ok: false as const, code: 'missing-source-relative-path', message: '缺少源相对路径。' };
    const targetResolved = typeof targetRelativePath === 'string' ? resolveSafeCopyPath(targetRoot, targetRelativePath) : { ok: false as const, code: 'missing-target-relative-path', message: '缺少目标相对路径。' };

    if (sourceResolved.ok === false) blockedReasonCodes.push(sourceResolved.code);
    if (targetResolved.ok === false) blockedReasonCodes.push(targetResolved.code);

    if (sourceResolved.ok && targetResolved.ok) {
      try {
        const stat = await fs.stat(sourceResolved.absolutePath);
        sourceExists = true;
        sourceIsFile = stat.isFile();
        if (!sourceIsFile) blockedReasonCodes.push('source-not-file');
      } catch {
        sourceMissingCount += 1;
        blockedReasonCodes.push('source-missing');
      }

      try {
        const targetStat = await fs.stat(targetResolved.absolutePath);
        targetExists = true;
        if (!targetStat.isFile()) blockedReasonCodes.push('target-exists-not-file');
        targetExistingCount += 1;
        blockedReasonCodes.push('target-exists');
      } catch {
        targetExists = false;
      }

      try {
        const parentStat = await fs.stat(path.dirname(targetResolved.absolutePath));
        targetParentExists = parentStat.isDirectory();
        if (!targetParentExists) blockedReasonCodes.push('target-parent-not-directory');
      } catch {
        targetParentMissingCount += 1;
        blockedReasonCodes.push('target-parent-missing-preview-only');
      }
    }

    if (blockedReasonCodes.length > 0) blockedFileCount += 1;
    fileChecks.push({
      id: `mvp94-copy-preflight-${index + 1}`,
      sourceRelativePath: typeof sourceRelativePath === 'string' ? normalizeRelativePath(sourceRelativePath) : 'invalid-source-relative-path',
      targetRelativePath: typeof targetRelativePath === 'string' ? normalizeRelativePath(targetRelativePath) : 'invalid-target-relative-path',
      sourceExists,
      sourceIsFile,
      targetExists,
      targetParentExists,
      blockedReasonCodes,
      absolutePathReturned: false,
      fileUrlReturned: false,
    });
  }

  return {
    ok: true,
    status: 'mvp94-copy-only-preflight-real-check-complete',
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: false,
    copyAllowed: false,
    copiedCount: 0,
    createdDirectoryCount: 0,
    checkedFileCount: fileChecks.length,
    sourceMissingCount,
    targetExistingCount,
    targetParentMissingCount,
    blockedFileCount,
    fileChecks,
    message: 'MVP94 已完成 main-side copy-only 真实预检；执行仍被禁用，不复制、不创建目录、不写日志。',
    safetyNotes: baseSafetyNotes,
  } as const;
}

function buildMvp93CopyOnlyStubBlockedResult(request: Partial<ImportCopyOnlyStubRequest> | undefined) {
  return {
    ok: false,
    status: 'mvp93-copy-only-stub-blocked',
    operationPlanId: request?.operationPlanId ?? 'mvp93-missing-operation-plan',
    rootPathToken: request?.rootPathToken,
    targetRootPathToken: request?.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: false,
    copiedCount: 0,
    skippedCount: Array.isArray(request?.relativePaths) ? request.relativePaths.length : 0,
    failedCount: 0,
    message: 'MVP93 只注册 copy-only main-side stub；真实 copy 执行仍被阻断。',
    safetyNotes: buildSafetyNotes().concat([
      'mvp93-copy-only-main-side-stub',
      'copy-only execute remains disabled-preview-only',
      'renderer token only: no absolutePath, no file://',
    ]),
  } as const;
}

function relativeDirectoryOf(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  const slashIndex = normalized.lastIndexOf('/');
  return slashIndex >= 0 ? normalized.slice(0, slashIndex) : '';
}


function getSafeErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: unknown }).code ?? 'UNKNOWN');
    return code.replace(/[^A-Z0-9_-]/gi, '').slice(0, 48) || 'UNKNOWN';
  }
  return 'UNKNOWN';
}

function buildMvp96CopyOnlyOperationLogEntry(input: {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; absolutePathReturned: false; fileUrlReturned: false }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }>;
  createdDirectoryRelativePaths: string[];
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
}): ImportCopyOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp96-copy-only-operation-log-v1',
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    operationId: `mvp96-copy-only-${crypto.randomUUID()}`,
    operationPlanId: input.operationPlanId,
    eventType: 'copy-only-execute',
    mode: 'copy-only',
    wroteAt: new Date().toISOString(),
    rootPathToken: input.rootPathToken,
    targetRootPathToken: input.targetRootPathToken,
    requestedFileCount: input.requestedFileCount,
    copiedCount: input.copiedFiles.length,
    skippedCount: input.skippedList.length,
    failedCount: input.failureList.length,
    createdDirectoryCount: input.createdDirectoryRelativePaths.length,
    createdDirectoryRelativePaths: input.createdDirectoryRelativePaths,
    copiedFiles: input.copiedFiles.map(({ id, sourceRelativePath, targetRelativePath, sizeBytes }) => ({ id, sourceRelativePath, targetRelativePath, sizeBytes })),
    skippedList: input.skippedList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode })),
    failureList: input.failureList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode, message }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode, message })),
    rollbackAttempted: input.rollbackAttempted,
    rollbackSucceeded: input.rollbackSucceeded,
    rolledBackCount: input.rolledBackFiles.length,
    rollbackFailureCount: input.rollbackFailureList.length,
    rolledBackFiles: input.rolledBackFiles,
    rollbackFailureList: input.rollbackFailureList,
    absolutePathReturned: false,
    fileUrlReturned: false,
    libraryIndexWritten: false,
  };
}

async function appendMvp96CopyOnlyOperationLog(entry: ImportCopyOnlyOperationLogEntry): Promise<{ ok: true; entry: ImportCopyOnlyOperationLogEntry } | { ok: false; code: string }> {
  const logFilePath = path.join(stableLogsPath, 'import-operation-log.jsonl');
  await fs.mkdir(stableLogsPath, { recursive: true });
  const line = `${JSON.stringify(entry)}\n`;
  try {
    await fs.appendFile(logFilePath, line, 'utf8');
    return { ok: true, entry };
  } catch (error) {
    return { ok: false, code: getSafeErrorCode(error) };
  }
}



function buildMvp105MoveOnlyOperationLogEntry(input: {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  movedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; moveMethod: 'rename' | 'copy-verify-unlink'; absolutePathReturned: false; fileUrlReturned: false }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }>;
  createdDirectoryRelativePaths: string[];
  failureStopTriggered: boolean;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
}): ImportMoveOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp105-move-only-operation-log-v1',
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    operationId: `mvp105-move-only-${crypto.randomUUID()}`,
    operationPlanId: input.operationPlanId,
    eventType: 'move-only-execute',
    mode: 'move-only',
    executorVersion: 'mvp105-small-sample-move-only-executor-v1',
    wroteAt: new Date().toISOString(),
    rootPathToken: input.rootPathToken,
    targetRootPathToken: input.targetRootPathToken,
    requestedFileCount: input.requestedFileCount,
    movedCount: input.movedFiles.length,
    skippedCount: input.skippedList.length,
    failedCount: input.failureList.length,
    createdDirectoryCount: input.createdDirectoryRelativePaths.length,
    failureStopTriggered: input.failureStopTriggered,
    createdDirectoryRelativePaths: input.createdDirectoryRelativePaths,
    movedFiles: input.movedFiles.map(({ id, sourceRelativePath, targetRelativePath, sizeBytes, moveMethod }) => ({ id, sourceRelativePath, targetRelativePath, sizeBytes, moveMethod })),
    skippedList: input.skippedList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode })),
    failureList: input.failureList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode, message }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode, message })),
    rollbackAttempted: input.rollbackAttempted,
    rollbackSucceeded: input.rollbackSucceeded,
    rolledBackCount: input.rolledBackFiles.length,
    rollbackFailureCount: input.rollbackFailureList.length,
    rolledBackFiles: input.rolledBackFiles,
    rollbackFailureList: input.rollbackFailureList,
    absolutePathReturned: false,
    fileUrlReturned: false,
    libraryIndexWritten: false,
    sqliteWritten: false,
  };
}

async function appendMvp105MoveOnlyOperationLog(entry: ImportMoveOnlyOperationLogEntry): Promise<{ ok: true; entry: ImportMoveOnlyOperationLogEntry } | { ok: false; code: string }> {
  const logFilePath = path.join(stableLogsPath, 'import-operation-log.jsonl');
  await fs.mkdir(stableLogsPath, { recursive: true });
  try {
    await fs.appendFile(logFilePath, `${JSON.stringify(entry)}
`, 'utf8');
    return { ok: true, entry };
  } catch (error) {
    return { ok: false, code: getSafeErrorCode(error) };
  }
}

async function buildMvp105MoveOnlyExecuteResult(request: Partial<ImportMoveOnlyExecuteRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat(['mvp105-small-sample-move-only-executor-v1', 'u31-import-transaction-v1', 'move-only-small-sample real executor: max 20 files', 'requires CONFIRM_MOVE_IMPORT and confirmedMoveOnly=true', 'overwrite=false; target exists skip', 'failure-stop with reverse rollback of this operation', 'OperationLog is append-only JSONL with relative paths only', 'no library-index.json write, no SQLite, no absolutePath, no file://']);
  const blocked = (status: string, message: string, skippedCount = 0) => ({ ok: false, status, executorVersion: 'mvp105-small-sample-move-only-executor-v1', operationPlanId: request?.operationPlanId ?? 'mvp105-missing-operation-plan', rootPathToken: request?.rootPathToken, targetRootPathToken: request?.targetRootPathToken, absolutePathReturned: false, fileUrlReturned: false, executeAllowed: false, moveAllowed: false, movedCount: 0, skippedCount, failedCount: 0, libraryIndexWritten: false, sqliteWritten: false, message, safetyNotes: baseSafetyNotes } as const);
  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'move-only-small-sample') return blocked('mvp105-move-only-execute-invalid-request', 'move-only execute 请求无效。');
  if (request.confirmedMoveOnly !== true || request.confirmationText !== 'CONFIRM_MOVE_IMPORT') return blocked('mvp105-move-only-execute-confirmation-required', '真实 move-only 执行需要确认。', Array.isArray(request.relativePaths) ? request.relativePaths.length : 0);
  if (request.overwriteAllowed !== false && request.overwriteAllowed !== undefined) return blocked('mvp105-move-only-execute-overwrite-blocked', 'overwriteAllowed 固定为 false。');
  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) return blocked('mvp105-move-only-execute-invalid-root-token', '源或目标授权已失效。');
  const relativePaths = Array.isArray(request.relativePaths) ? request.relativePaths.slice(0, 200) : [];
  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  const maxMoveItems = normalizeLimit(request.maxMoveItems, 20, 20);
  if (relativePaths.length === 0) return blocked('mvp105-move-only-execute-empty-file-list', 'move-only execute 至少需要一个文件。');
  if (relativePaths.length > maxMoveItems) return blocked('mvp105-move-only-execute-too-many-files', `move-only 最多允许 ${maxMoveItems} 个文件。`, relativePaths.length);
  const transaction = await executeMoveOnlyTransaction({ sourceRootAbsolutePath: sourceRoot.absolutePath, targetRootAbsolutePath: targetRoot.absolutePath, items: relativePaths.map((sourceInput, index) => ({ id: `mvp105-move-execute-${index + 1}`, sourceRelativePath: typeof sourceInput === 'string' ? normalizeRelativePath(sourceInput) : 'invalid-source-relative-path', targetRelativePath: typeof (targetRelativePaths[index] ?? sourceInput) === 'string' ? normalizeRelativePath(targetRelativePaths[index] ?? sourceInput) : 'invalid-target-relative-path' })) });
  const withFlags = <T extends object>(item: T) => ({ ...item, absolutePathReturned: false as const, fileUrlReturned: false as const });
  const movedFiles = transaction.committedFiles.map(withFlags);
  const skippedList = transaction.skippedList.map(withFlags);
  const failureList = transaction.failureList.map(withFlags);
  const operationLogEntry = buildMvp105MoveOnlyOperationLogEntry({ operationPlanId: request.operationPlanId, rootPathToken: request.rootPathToken, targetRootPathToken: request.targetRootPathToken, requestedFileCount: relativePaths.length, movedFiles, skippedList, failureList, createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths, failureStopTriggered: transaction.failureStopTriggered, rollbackAttempted: transaction.rollbackAttempted, rollbackSucceeded: transaction.rollbackSucceeded, rolledBackFiles: transaction.rolledBackFiles, rollbackFailureList: transaction.rollbackFailureList });
  const operationLogWrite = await appendMvp105MoveOnlyOperationLog(operationLogEntry);
  const operationLogPersisted = operationLogWrite.ok;
  const operationLogFailureCode = operationLogWrite.ok ? undefined : (operationLogWrite as { ok: false; code: string }).code;
  const status = transaction.rollbackAttempted ? (transaction.rollbackSucceeded ? 'u31-move-only-execute-rolled-back' : 'u31-move-only-execute-rollback-incomplete') : (operationLogPersisted ? 'mvp105-move-only-execute-complete-with-operation-log' : 'mvp105-move-only-execute-log-write-failed');
  return { ok: transaction.failureList.length === 0 && operationLogPersisted, status, executorVersion: 'mvp105-small-sample-move-only-executor-v1', transactionVersion: IMPORT_TRANSACTION_VERSION, operationPlanId: request.operationPlanId, rootPathToken: request.rootPathToken, targetRootPathToken: request.targetRootPathToken, absolutePathReturned: false, fileUrlReturned: false, executeAllowed: true, moveAllowed: true, copyAllowed: false, overwriteAllowed: false, deleteAllowed: false, renameAllowed: true, sourceDirectoryCleanupAllowed: false, operationLogPersisted, operationLogFailureCode, libraryIndexWritten: false, scannerRunTriggered: false, sqliteWritten: false, requestedFileCount: relativePaths.length, movedCount: movedFiles.length, skippedCount: skippedList.length, failedCount: failureList.length, createdDirectoryCount: transaction.createdDirectoryRelativePaths.length, createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths, removedDirectoryRelativePaths: transaction.removedDirectoryRelativePaths, failureStopTriggered: transaction.failureStopTriggered, rollbackAttempted: transaction.rollbackAttempted, rollbackSucceeded: transaction.rollbackSucceeded, rolledBackCount: transaction.rolledBackFiles.length, rollbackFailureCount: transaction.rollbackFailureList.length, rolledBackFiles: transaction.rolledBackFiles, rollbackFailureList: transaction.rollbackFailureList, movedFiles, skippedList, failureList, operationLog: operationLogPersisted ? { schemaVersion: operationLogEntry.schemaVersion, operationLogVersion: operationLogEntry.operationLogVersion, transactionVersion: operationLogEntry.transactionVersion, operationId: operationLogEntry.operationId, operationPlanId: operationLogEntry.operationPlanId, eventType: operationLogEntry.eventType, mode: operationLogEntry.mode, executorVersion: operationLogEntry.executorVersion, wroteAt: operationLogEntry.wroteAt, persisted: true, absolutePathReturned: false, fileUrlReturned: false } : undefined, operationLogPreview: { operationPlanId: request.operationPlanId, mode: 'move-only', persisted: operationLogPersisted, movedCount: movedFiles.length, skippedCount: skippedList.length, failedCount: failureList.length, createdDirectoryCount: transaction.createdDirectoryRelativePaths.length, rollbackAttempted: transaction.rollbackAttempted, rollbackSucceeded: transaction.rollbackSucceeded, absolutePathReturned: false, fileUrlReturned: false }, message: transaction.rollbackAttempted ? (transaction.rollbackSucceeded ? 'U31 move-only 批次失败后已恢复本轮文件。' : 'U31 move-only 回滚未完整完成。') : (operationLogPersisted ? 'move-only 执行完成并写入 OperationLog。' : 'move-only 执行完成，但 OperationLog 写入失败。'), safetyNotes: baseSafetyNotes } as const;
}

// Legacy verifier token retained for MVP95 compatibility: mvp95-copy-only-execute-complete / operationLogPersisted: false.
async function buildMvp95CopyOnlyExecuteResult(request: Partial<ImportCopyOnlyStubRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat(['mvp95-copy-only-executor', 'mvp96-copy-only-operation-log', 'u31-import-transaction-v1', 'copy uses COPYFILE_EXCL overwrite protection', 'partial failure rolls back targets created by this operation', 'OperationLog contains relative paths and rollback outcome only', 'renderer token only: no absolutePath, no file://']);
  const blocked = (status: string, message: string, skippedCount = 0) => ({ ok: false, status, operationPlanId: request?.operationPlanId ?? 'mvp95-missing-operation-plan', rootPathToken: request?.rootPathToken, targetRootPathToken: request?.targetRootPathToken, absolutePathReturned: false, fileUrlReturned: false, executeAllowed: false, copyAllowed: false, copiedCount: 0, skippedCount, failedCount: 0, createdDirectoryCount: 0, message, safetyNotes: baseSafetyNotes } as const);
  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'copy-only-stub') return blocked('mvp95-copy-only-execute-invalid-request', 'copy-only execute 请求无效。');
  if (request.confirmedCopyOnly !== true || request.confirmationText !== 'COPY ONLY') return blocked('mvp95-copy-only-execute-confirmation-required', '真实 copy-only 执行需要确认。', Array.isArray(request.relativePaths) ? request.relativePaths.length : 0);
  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) return blocked('mvp95-copy-only-execute-invalid-root-token', '源或目标授权已失效。');
  const relativePaths = Array.isArray(request.relativePaths) ? request.relativePaths.slice(0, 200) : [];
  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  if (relativePaths.length === 0) return blocked('mvp95-copy-only-execute-empty-file-list', 'copy-only execute 至少需要一个文件。');
  const transaction = await executeCopyOnlyTransaction({ sourceRootAbsolutePath: sourceRoot.absolutePath, targetRootAbsolutePath: targetRoot.absolutePath, items: relativePaths.map((sourceInput, index) => ({ id: `mvp95-copy-execute-${index + 1}`, sourceRelativePath: typeof sourceInput === 'string' ? normalizeRelativePath(sourceInput) : 'invalid-source-relative-path', targetRelativePath: typeof (targetRelativePaths[index] ?? sourceInput) === 'string' ? normalizeRelativePath(targetRelativePaths[index] ?? sourceInput) : 'invalid-target-relative-path' })) });
  const withFlags = <T extends object>(item: T) => ({ ...item, absolutePathReturned: false as const, fileUrlReturned: false as const });
  const copiedFiles = transaction.committedFiles.map(withFlags);
  const skippedList = transaction.skippedList.map(withFlags);
  const failureList = transaction.failureList.map(withFlags);
  const operationLogEntry = buildMvp96CopyOnlyOperationLogEntry({ operationPlanId: request.operationPlanId, rootPathToken: request.rootPathToken, targetRootPathToken: request.targetRootPathToken, requestedFileCount: relativePaths.length, copiedFiles, skippedList, failureList, createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths, rollbackAttempted: transaction.rollbackAttempted, rollbackSucceeded: transaction.rollbackSucceeded, rolledBackFiles: transaction.rolledBackFiles, rollbackFailureList: transaction.rollbackFailureList });
  const operationLogWrite = await appendMvp96CopyOnlyOperationLog(operationLogEntry);
  const operationLogPersisted = operationLogWrite.ok;
  const operationLogFailureCode = operationLogWrite.ok ? undefined : (operationLogWrite as { ok: false; code: string }).code;
  const status = transaction.rollbackAttempted ? (transaction.rollbackSucceeded ? 'u31-copy-only-execute-rolled-back' : 'u31-copy-only-execute-rollback-incomplete') : (operationLogPersisted ? 'mvp96-copy-only-execute-complete-with-operation-log' : 'mvp96-copy-only-execute-log-write-failed');
  return { ok: transaction.failureList.length === 0 && operationLogPersisted, status, transactionVersion: IMPORT_TRANSACTION_VERSION, operationPlanId: request.operationPlanId, rootPathToken: request.rootPathToken, targetRootPathToken: request.targetRootPathToken, absolutePathReturned: false, fileUrlReturned: false, executeAllowed: true, copyAllowed: true, overwriteAllowed: false, moveAllowed: false, deleteAllowed: false, renameAllowed: false, operationLogPersisted, operationLogFailureCode, libraryIndexWritten: false, requestedFileCount: relativePaths.length, copiedCount: copiedFiles.length, skippedCount: skippedList.length, failedCount: failureList.length, createdDirectoryCount: transaction.createdDirectoryRelativePaths.length, createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths, removedDirectoryRelativePaths: transaction.removedDirectoryRelativePaths, rollbackAttempted: transaction.rollbackAttempted, rollbackSucceeded: transaction.rollbackSucceeded, rolledBackCount: transaction.rolledBackFiles.length, rollbackFailureCount: transaction.rollbackFailureList.length, rolledBackFiles: transaction.rolledBackFiles, rollbackFailureList: transaction.rollbackFailureList, copiedFiles, skippedList, failureList, operationLog: operationLogPersisted ? { schemaVersion: operationLogEntry.schemaVersion, operationLogVersion: operationLogEntry.operationLogVersion, transactionVersion: operationLogEntry.transactionVersion, operationId: operationLogEntry.operationId, operationPlanId: operationLogEntry.operationPlanId, eventType: operationLogEntry.eventType, mode: operationLogEntry.mode, wroteAt: operationLogEntry.wroteAt, persisted: true, absolutePathReturned: false, fileUrlReturned: false } : undefined, operationLogPreview: { operationPlanId: request.operationPlanId, mode: 'copy-only', persisted: operationLogPersisted, copiedCount: copiedFiles.length, skippedCount: skippedList.length, failedCount: failureList.length, createdDirectoryCount: transaction.createdDirectoryRelativePaths.length, rollbackAttempted: transaction.rollbackAttempted, rollbackSucceeded: transaction.rollbackSucceeded, absolutePathReturned: false, fileUrlReturned: false }, message: transaction.rollbackAttempted ? (transaction.rollbackSucceeded ? 'U31 copy-only 批次失败后已删除本轮新复制文件。' : 'U31 copy-only 回滚未完整完成。') : (operationLogPersisted ? 'copy-only 执行完成并写入 OperationLog。' : 'copy-only 执行完成，但 OperationLog 写入失败。'), safetyNotes: baseSafetyNotes } as const;
}

async function buildMvp97PostCopyRefreshPreviewResult(request: Partial<ImportPostCopyRefreshPreviewRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp97-post-copy-refresh-preview',
    'post-copy refresh preview is read-only: stat target files only',
    'library-index.json write remains blocked',
    'renderer token only: no absolutePath, no file://',
  ]);

  if (!request?.operationPlanId || !request.targetRootPathToken || request.mode !== 'post-copy-refresh-preview') {
    return {
      ok: false,
      status: 'mvp97-post-copy-refresh-preview-invalid-request',
      operationPlanId: request?.operationPlanId ?? 'mvp97-missing-operation-plan',
      targetRootPathToken: request?.targetRootPathToken ?? 'mvp97-missing-target-root-token',
      previewOnly: true,
      indexWriteAllowed: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      candidateCount: 0,
      message: 'post-copy refresh preview 请求必须包含 operationPlanId、targetRootPathToken，且 mode=post-copy-refresh-preview。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!targetRoot) {
    return {
      ok: false,
      status: 'mvp97-post-copy-refresh-preview-invalid-root-token',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      indexWriteAllowed: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      candidateCount: 0,
      message: 'targetRootPathToken 无效。请重新选择目标仓库目录。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  if (targetRelativePaths.length === 0) {
    return {
      ok: false,
      status: 'mvp97-post-copy-refresh-preview-empty-target-list',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      indexWriteAllowed: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      candidateCount: 0,
      message: 'post-copy refresh preview 至少需要一个 target relativePath。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const refreshCandidates: Array<{
    id: string;
    targetRelativePath: string;
    entryKind: DryRunEntryKind;
    plannedAction: DryRunPlannedAction;
    sizeBytes: number;
    warningCodes: string[];
    absolutePathReturned: false;
    fileUrlReturned: false;
  }> = [];
  const blockedTargets: Array<{
    id: string;
    targetRelativePath: string;
    reasonCode: string;
    absolutePathReturned: false;
    fileUrlReturned: false;
  }> = [];
  const collectionCandidateRelativePaths = new Set<string>();

  for (let index = 0; index < targetRelativePaths.length; index += 1) {
    const id = `mvp97-refresh-target-${index + 1}`;
    const targetInput = targetRelativePaths[index];
    const targetRelativePath = typeof targetInput === 'string' ? normalizeRelativePath(targetInput) : 'invalid-target-relative-path';
    const targetResolved = typeof targetInput === 'string' ? resolveSafeCopyPath(targetRoot, targetInput) : { ok: false as const, code: 'missing-target-relative-path', message: '缺少目标相对路径。' };

    if (targetResolved.ok === false) {
      blockedTargets.push({ id, targetRelativePath, reasonCode: targetResolved.code, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    try {
      const stat = await fs.stat(targetResolved.absolutePath);
      if (!stat.isFile()) {
        blockedTargets.push({ id, targetRelativePath, reasonCode: 'target-not-file', absolutePathReturned: false, fileUrlReturned: false });
        continue;
      }
      const entry = buildEntry(targetRoot.absolutePath, targetResolved.absolutePath, targetResolved.relativePath, false, stat.size, stat.mtimeMs);
      refreshCandidates.push({
        id,
        targetRelativePath: entry.relativePath,
        entryKind: entry.entryKind,
        plannedAction: entry.plannedAction,
        sizeBytes: entry.sizeBytes ?? 0,
        warningCodes: entry.warningCodes,
        absolutePathReturned: false,
        fileUrlReturned: false,
      });
      const collectionCandidate = relativeDirectoryOf(entry.relativePath) || entry.collectionCandidate || 'root';
      if (collectionCandidate) collectionCandidateRelativePaths.add(collectionCandidate);
    } catch (error) {
      blockedTargets.push({ id, targetRelativePath, reasonCode: `target-stat-failed-${getSafeErrorCode(error)}`, absolutePathReturned: false, fileUrlReturned: false });
    }
  }

  const audioCount = refreshCandidates.filter((item) => item.entryKind === 'audio').length;
  const coverCount = refreshCandidates.filter((item) => item.entryKind === 'cover').length;
  const subtitleCount = refreshCandidates.filter((item) => item.entryKind === 'subtitle').length;
  const warningCount = refreshCandidates.reduce((sum, item) => sum + item.warningCodes.length, 0) + blockedTargets.length;

  return {
    ok: blockedTargets.length === 0,
    status: 'mvp97-post-copy-refresh-preview-ready',
    schemaVersion: 1,
    refreshPlanVersion: 'mvp97-post-copy-refresh-plan-v1',
    operationPlanId: request.operationPlanId,
    sourceOperationLogVersion: request.sourceOperationLogVersion ?? 'mvp96-copy-only-operation-log-v1',
    mode: 'post-copy-refresh-preview',
    previewOnly: true,
    targetRootPathToken: request.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    indexWriteAllowed: false,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    requestedTargetCount: targetRelativePaths.length,
    candidateCount: refreshCandidates.length,
    blockedTargetCount: blockedTargets.length,
    audioCount,
    coverCount,
    subtitleCount,
    warningCount,
    collectionCandidateRelativePaths: Array.from(collectionCandidateRelativePaths),
    refreshCandidates,
    blockedTargets,
    message: 'MVP97 已生成 copy 后刷新预览；本轮不写 library-index.json、不接 SQLite、不触发全量扫描。',
    safetyNotes: baseSafetyNotes,
  } as const;
}

function languageFromSubtitlePath(relativePath: string): 'ja' | 'zh' | 'bilingual' | 'unknown' {
  const normalized = relativePath.toLowerCase();
  if (normalized.includes('.bilingual.')) return 'bilingual';
  if (normalized.includes('.zh.')) return 'zh';
  if (normalized.includes('.ja.')) return 'ja';
  return 'unknown';
}

function collectionTitleFromRelativePath(collectionRelativePath: string, fallback: string): string {
  const segment = collectionRelativePath.split('/').filter(Boolean).pop();
  if (!segment) return fallback;
  return segment;
}

function buildMvp98LibraryIndexPatchPreviewResult(request: Partial<ImportLibraryIndexPatchPreviewRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp98-library-index-patch-preview',
    'library-index patch preview only: no writeFile, no SQLite, no full scan',
    'preview collections/tracks/covers/subtitles only',
    'renderer token only: no absolutePath, no file://',
  ]);

  if (!request?.operationPlanId || !request.targetRootPathToken || request.mode !== 'library-index-patch-preview') {
    return {
      ok: false,
      status: 'mvp98-library-index-patch-preview-invalid-request',
      operationPlanId: request?.operationPlanId ?? 'mvp98-missing-operation-plan',
      targetRootPathToken: request?.targetRootPathToken ?? 'mvp98-missing-target-root-token',
      previewOnly: true,
      indexPatchWriteAllowed: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      patchItemCount: 0,
      message: 'library-index patch preview 请求必须包含 operationPlanId、targetRootPathToken，且 mode=library-index-patch-preview。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!targetRoot) {
    return {
      ok: false,
      status: 'mvp98-library-index-patch-preview-invalid-root-token',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      indexPatchWriteAllowed: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      patchItemCount: 0,
      message: 'targetRootPathToken 无效。请重新选择目标仓库目录。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const maxPatchItems = normalizeLimit(request.maxPatchItems, 500, 2000);
  const refreshCandidates = Array.isArray(request.refreshCandidates) ? request.refreshCandidates.slice(0, maxPatchItems) : [];
  if (refreshCandidates.length === 0) {
    return {
      ok: false,
      status: 'mvp98-library-index-patch-preview-empty-refresh-candidates',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      indexPatchWriteAllowed: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      patchItemCount: 0,
      message: 'library-index patch preview 至少需要一个 MVP97 refreshCandidate。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const generatedAt = new Date().toISOString();
  const rootId = stablePreviewId('root', request.targetRootPathToken);
  const collectionMap = new Map<string, any>();
  const tracks: any[] = [];
  const covers: any[] = [];
  const subtitles: any[] = [];
  const warnings = new Set<string>();
  const patchOperations: any[] = [];

  const ensureCollection = (targetRelativePath: string, entryKind: DryRunEntryKind, warningCodes: string[]) => {
    const collectionRelativePath = relativeDirectoryOf(targetRelativePath) || 'root';
    const rjIdNorm = detectRjId(targetRelativePath);
    const collectionId = stablePreviewId('collection', `${rootId}:${collectionRelativePath}`);
    let collection = collectionMap.get(collectionId);
    if (!collection) {
      const pseudoEntry: DryRunDiscoveredEntry = {
        id: stablePreviewId('mvp98-entry', `${collectionId}:${targetRelativePath}`),
        relativePath: targetRelativePath,
        entryKind,
        plannedAction: 'create-collection-candidate',
        parserStatus: warningCodes.length ? 'parsed-with-warning' : 'parsed',
        collectionCandidate: collectionRelativePath,
        rjIdNorm,
        warningCodes,
      };
      collection = {
        id: collectionId,
        rootId,
        collectionType: getCollectionType(targetRoot.libraryType, pseudoEntry),
        title: rjIdNorm || collectionTitleFromRelativePath(collectionRelativePath, targetRoot.displayName),
        sortTitle: collectionRelativePath,
        codeRaw: rjIdNorm,
        codeNorm: rjIdNorm,
        artist: undefined,
        circle: undefined,
        cvs: [],
        album: targetRoot.libraryType === 'music' ? collectionTitleFromRelativePath(collectionRelativePath, targetRoot.displayName) : undefined,
        folderPath: collectionRelativePath,
        cover: undefined,
        tags: [],
        status: warningCodes.length ? 'warning' : 'identified',
        trackIds: [],
        addedAt: generatedAt,
        updatedAt: generatedAt,
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
      collectionMap.set(collectionId, collection);
      patchOperations.push({ operation: 'upsert-collection', collectionId, targetRelativePath: collectionRelativePath, absolutePathReturned: false, fileUrlReturned: false });
    } else if (warningCodes.length && collection.status !== 'warning') {
      collection.status = 'warning';
    }
    return collection;
  };

  for (let index = 0; index < refreshCandidates.length; index += 1) {
    const candidate = refreshCandidates[index];
    const rawTargetRelativePath = typeof candidate?.targetRelativePath === 'string' ? candidate.targetRelativePath : '';
    if (isUnsafeRelativePath(rawTargetRelativePath)) {
      warnings.add(`mvp98-unsafe-relative-path: ${rawTargetRelativePath || `candidate-${index + 1}`}`);
      continue;
    }
    const targetRelativePath = normalizeRelativePath(rawTargetRelativePath);
    const entryKind = candidate.entryKind || 'other';
    const plannedAction = candidate.plannedAction || 'warn-only';
    const warningCodes = Array.isArray(candidate.warningCodes) ? candidate.warningCodes.filter((item): item is string => typeof item === 'string') : [];
    const extension = extensionOf(targetRelativePath);
    const collection = ensureCollection(targetRelativePath, entryKind, warningCodes);

    if (warningCodes.length) {
      warningCodes.forEach((code) => warnings.add(`${code}: ${targetRelativePath}`));
    }

    if (plannedAction === 'include-track') {
      const trackId = stablePreviewId('track', `${collection.id}:${targetRelativePath}`);
      const track = {
        id: trackId,
        rootId,
        collectionId: collection.id,
        kind: mapEntryKindToTrackKind(entryKind),
        title: baseNameOf(targetRelativePath.split('/').pop() || targetRelativePath),
        displayArtist: collection.artist,
        displayAlbum: collection.title,
        rjId: detectRjId(targetRelativePath),
        trackNo: detectTrackNo(targetRelativePath.split('/').pop() || targetRelativePath),
        source: {
          id: stablePreviewId('source', `${trackId}:${targetRelativePath}`),
          trackId,
          sourceKind: 'local-file',
          relativePath: targetRelativePath,
          extension,
          sizeBytes: typeof candidate.sizeBytes === 'number' ? candidate.sizeBytes : 0,
          absolutePathReturned: false,
          fileUrlReturned: false,
        },
        subtitles: [],
        tags: [],
        addedAt: generatedAt,
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
      tracks.push(track);
      collection.trackIds.push(trackId);
      patchOperations.push({ operation: 'upsert-track', trackId, collectionId: collection.id, targetRelativePath, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    if (plannedAction === 'attach-cover' || entryKind === 'cover') {
      const coverId = stablePreviewId('cover', `${collection.id}:${targetRelativePath}`);
      const cover = {
        id: coverId,
        collectionId: collection.id,
        sourceKind: 'local-file',
        relativePath: targetRelativePath,
        isPrimary: !collection.cover,
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
      covers.push(cover);
      if (!collection.cover) collection.cover = cover;
      patchOperations.push({ operation: 'attach-cover', coverId, collectionId: collection.id, targetRelativePath, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    if (plannedAction === 'attach-subtitle' || entryKind === 'subtitle') {
      const subtitleId = stablePreviewId('subtitle', `${collection.id}:${targetRelativePath}`);
      const subtitle = {
        id: subtitleId,
        collectionId: collection.id,
        trackMatchStrategy: 'same-basename-or-manual-review',
        sourceKind: 'local-file',
        language: languageFromSubtitlePath(targetRelativePath),
        format: extension,
        relativePath: targetRelativePath,
        absolutePathReturned: false,
        fileUrlReturned: false,
      };
      subtitles.push(subtitle);
      patchOperations.push({ operation: 'attach-subtitle', subtitleId, collectionId: collection.id, targetRelativePath, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    warnings.add(`mvp98-warn-only: ${targetRelativePath}`);
    patchOperations.push({ operation: 'warn-only', collectionId: collection.id, targetRelativePath, absolutePathReturned: false, fileUrlReturned: false });
  }

  const collections = Array.from(collectionMap.values()).map((collection) => ({
    ...collection,
    status: collection.trackIds.length === 0 && collection.status !== 'warning' ? 'missing-audio' : collection.status,
  }));

  return {
    ok: true,
    status: 'mvp98-library-index-patch-preview-ready',
    schemaVersion: 1,
    patchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
    operationPlanId: request.operationPlanId,
    sourceRefreshPlanVersion: request.sourceRefreshPlanVersion ?? 'mvp97-post-copy-refresh-plan-v1',
    mode: 'library-index-patch-preview',
    previewOnly: true,
    targetRootPathToken: request.targetRootPathToken,
    displayName: targetRoot.displayName,
    libraryType: targetRoot.libraryType,
    absolutePathReturned: false,
    fileUrlReturned: false,
    indexPatchWriteAllowed: false,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    requestedCandidateCount: Array.isArray(request.refreshCandidates) ? request.refreshCandidates.length : 0,
    consumedCandidateCount: refreshCandidates.length,
    patchItemCount: patchOperations.length,
    collectionPatchCount: collections.length,
    trackPatchCount: tracks.length,
    coverPatchCount: covers.length,
    subtitlePatchCount: subtitles.length,
    warningCount: warnings.size,
    indexPatchPreview: {
      schemaVersion: 1,
      generatedAt,
      patchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
      sourceKind: 'post-copy-refresh-preview',
      root: {
        id: rootId,
        rootPathToken: request.targetRootPathToken,
        displayName: targetRoot.displayName,
        libraryType: targetRoot.libraryType,
        absolutePathReturned: false,
        fileUrlReturned: false,
      },
      collections,
      tracks,
      covers,
      subtitles,
      patchOperations,
      warnings: Array.from(warnings),
    },
    message: 'MVP98 已生成 library-index patch 预览；本轮不写 library-index.json、不接 SQLite、不触发全量扫描。',
    safetyNotes: baseSafetyNotes,
  } as const;
}



function buildMvp99LibraryIndexPatchWriteReadinessResult(request: Partial<ImportLibraryIndexPatchWriteReadinessRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp99-library-index-patch-write-readiness',
    'MVP99 readiness only: no library-index.json write',
    'MVP100 must create backup before writing',
    'renderer token only: no absolutePath, no file://',
  ]);

  if (!request || request.mode !== 'library-index-patch-write-readiness' || !request.operationPlanId || !request.targetRootPathToken) {
    return {
      ok: false,
      status: 'mvp99-library-index-patch-write-readiness-invalid-request',
      operationPlanId: request?.operationPlanId ?? 'mvp99-missing-operation-plan',
      targetRootPathToken: request?.targetRootPathToken ?? 'mvp99-missing-target-root-token',
      previewOnly: true,
      readyForMvp100Write: false,
      writeExecutionAllowedInMvp99: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      confirmationAccepted: false,
      backupRequired: true,
      message: 'MVP99 需要 operationPlanId、targetRootPathToken 和 mode=library-index-patch-write-readiness。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!targetRoot) {
    return {
      ok: false,
      status: 'mvp99-library-index-patch-write-readiness-invalid-root-token',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      readyForMvp100Write: false,
      writeExecutionAllowedInMvp99: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      confirmationAccepted: false,
      backupRequired: true,
      message: '无法找到 targetRootPathToken；请重新选择目标资源库。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const patchPreview = request.indexPatchPreview;
  const hasValidPatchPreview = Boolean(patchPreview && patchPreview.patchPreviewVersion === 'mvp98-library-index-patch-preview-v1');
  if (!hasValidPatchPreview) {
    return {
      ok: false,
      status: 'mvp99-library-index-patch-write-readiness-missing-patch-preview',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      readyForMvp100Write: false,
      writeExecutionAllowedInMvp99: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      confirmationAccepted: false,
      backupRequired: true,
      message: 'MVP99 需要来自 MVP98 的 indexPatchPreview，且 patchPreviewVersion 必须是 mvp98-library-index-patch-preview-v1。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const confirmationAccepted = request.userConfirmedPatchPreview === true && request.confirmationText === 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH';
  const backupAccepted = request.createBackup === true;
  const patchOperations = Array.isArray(patchPreview?.patchOperations) ? patchPreview.patchOperations : [];

  if (!confirmationAccepted) {
    return {
      ok: false,
      status: 'mvp99-library-index-patch-write-readiness-confirmation-required',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      readyForMvp100Write: false,
      writeExecutionAllowedInMvp99: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      confirmationAccepted: false,
      backupRequired: true,
      message: '写入准备需要二次确认；MVP99 仍不会执行写入。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  if (!backupAccepted) {
    return {
      ok: false,
      status: 'mvp99-library-index-patch-write-readiness-backup-required',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      previewOnly: true,
      readyForMvp100Write: false,
      writeExecutionAllowedInMvp99: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      confirmationAccepted: true,
      backupRequired: true,
      message: 'MVP100 写入前必须创建 library-index.json 备份；请确认 createBackup=true。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  return {
    ok: true,
    status: 'mvp99-library-index-patch-write-readiness-ready',
    schemaVersion: 1,
    readinessVersion: 'mvp99-library-index-patch-write-readiness-v1',
    operationPlanId: request.operationPlanId,
    targetRootPathToken: request.targetRootPathToken,
    displayName: targetRoot.displayName,
    libraryType: targetRoot.libraryType,
    mode: 'library-index-patch-write-readiness',
    sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
    previewOnly: true,
    readyForMvp100Write: true,
    writeExecutionAllowedInMvp99: false,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    requiredConfirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
    confirmationAccepted: true,
    backupRequired: true,
    backupPlanPreview: {
      backupFileNamePattern: 'library-index.backup.before-mvp100-*.json',
      backupLocation: 'same-directory-as-library-index',
      overwriteBackup: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    patchOperationCount: patchOperations.length,
    collectionPatchCount: Array.isArray(patchPreview?.collections) ? patchPreview.collections.length : 0,
    trackPatchCount: Array.isArray(patchPreview?.tracks) ? patchPreview.tracks.length : 0,
    coverPatchCount: Array.isArray(patchPreview?.covers) ? patchPreview.covers.length : 0,
    subtitlePatchCount: Array.isArray(patchPreview?.subtitles) ? patchPreview.subtitles.length : 0,
    warningCount: Array.isArray(patchPreview?.warnings) ? patchPreview.warnings.length : 0,
    message: 'MVP99 写入准备已通过；下一轮 MVP100 可在备份后执行 library-index.json patch 写入。本轮未写入任何文件。',
    safetyNotes: baseSafetyNotes,
  } as const;
}


function buildMvp100LibraryIndexPatchWriteInvalidResult(request: Partial<ImportLibraryIndexPatchWriteRequest> | undefined) {
  return {
    ok: false,
    status: 'mvp100-library-index-patch-write-invalid-request',
    operationPlanId: request?.operationPlanId ?? 'mvp100-missing-operation-plan',
    targetRootPathToken: request?.targetRootPathToken ?? 'mvp100-missing-target-root-token',
    indexPatchWritten: false,
    libraryIndexWritten: false,
    backupCreated: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: 'MVP100 需要 operationPlanId、targetRootPathToken，且 mode=library-index-patch-write-confirmed。',
    safetyNotes: buildPatchWriteSafetyNotes(),
  } as const;
}

async function buildMvp100LibraryIndexPatchWriteResult(request: Partial<ImportLibraryIndexPatchWriteRequest> | undefined) {
  if (!request || request.mode !== 'library-index-patch-write-confirmed' || !request.operationPlanId || !request.targetRootPathToken) {
    return buildMvp100LibraryIndexPatchWriteInvalidResult(request);
  }

  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!targetRoot) {
    return {
      ok: false,
      status: 'mvp100-library-index-patch-write-invalid-root-token',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexPatchWritten: false,
      libraryIndexWritten: false,
      backupCreated: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: '无法找到 targetRootPathToken；请重新选择目标资源库。',
      safetyNotes: buildPatchWriteSafetyNotes(),
    } as const;
  }

  return writeLibraryIndexPatchWithBackup(targetRoot, {
    operationPlanId: request.operationPlanId,
    targetRootPathToken: request.targetRootPathToken,
    mode: 'library-index-patch-write-confirmed',
    sourceReadinessVersion: request.sourceReadinessVersion,
    sourcePatchPreviewVersion: request.sourcePatchPreviewVersion,
    indexPatchPreview: request.indexPatchPreview,
    userConfirmedPatchWrite: request.userConfirmedPatchWrite,
    createBackup: request.createBackup,
    confirmationText: request.confirmationText,
  });
}

function buildMvp101PatchUiRefreshSafetyNotes(): string[] {
  return buildSafetyNotes().concat([
    'mvp101-import-ui-refresh-after-patch',
    'read current library-index.json after confirmed patch write',
    'reuse renderer yang-kura-library-index-loaded refresh path',
    'no full scan, no SQLite, no copy/move/delete/rename',
    'renderer token only: no absolutePath, no file://',
  ]);
}

function buildMvp101PatchUiRefreshInvalidResult(request: Partial<ImportLibraryIndexPatchUiRefreshRequest> | undefined) {
  return {
    ok: false,
    status: 'mvp101-import-ui-refresh-after-patch-invalid-request',
    operationPlanId: request?.operationPlanId ?? 'mvp101-missing-operation-plan',
    targetRootPathToken: request?.targetRootPathToken ?? 'mvp101-missing-target-root-token',
    indexReadPerformed: false,
    rendererRefreshExpected: false,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    fileMutationPerformed: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: 'MVP101 refresh 请求必须包含 operationPlanId、targetRootPathToken，且 mode=refresh-after-patch-write。',
    safetyNotes: buildMvp101PatchUiRefreshSafetyNotes(),
  } as const;
}

async function buildMvp101PatchUiRefreshAfterWriteResult(request: Partial<ImportLibraryIndexPatchUiRefreshRequest> | undefined) {
  if (!request || request.mode !== 'refresh-after-patch-write' || !request.operationPlanId || !request.targetRootPathToken) {
    return buildMvp101PatchUiRefreshInvalidResult(request);
  }

  if (request.sourcePatchWriteVersion && request.sourcePatchWriteVersion !== 'mvp100-library-index-patch-write-v1') {
    return {
      ok: false,
      status: 'mvp101-import-ui-refresh-after-patch-invalid-source-write',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexReadPerformed: false,
      rendererRefreshExpected: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      fileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: 'MVP101 只接受 mvp100-library-index-patch-write-v1 后的刷新请求。',
      safetyNotes: buildMvp101PatchUiRefreshSafetyNotes(),
    } as const;
  }

  if (request.patchWriteStatus && request.patchWriteStatus !== 'mvp100-library-index-patch-write-complete') {
    return {
      ok: false,
      status: 'mvp101-import-ui-refresh-after-patch-write-not-complete',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexReadPerformed: false,
      rendererRefreshExpected: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      fileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: 'MVP100 patch 写入未成功完成；MVP101 不刷新 UI，避免把失败写入误认为成功。',
      safetyNotes: buildMvp101PatchUiRefreshSafetyNotes(),
    } as const;
  }

  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!targetRoot) {
    return {
      ok: false,
      status: 'mvp101-import-ui-refresh-after-patch-invalid-root-token',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexReadPerformed: false,
      rendererRefreshExpected: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      fileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: '无法找到 targetRootPathToken；请重新选择目标资源库后再刷新。',
      safetyNotes: buildMvp101PatchUiRefreshSafetyNotes(),
    } as const;
  }

  const readResult = await readLibraryIndex(targetRoot, {
    rootPathToken: request.targetRootPathToken,
    mode: 'read-current-index',
  });

  if (!readResult.ok) {
    return {
      ok: false,
      status: 'mvp101-import-ui-refresh-after-patch-read-failed',
      operationPlanId: request.operationPlanId,
      targetRootPathToken: request.targetRootPathToken,
      indexReadPerformed: Boolean(readResult.indexReadPerformed),
      rendererRefreshExpected: false,
      libraryIndexWritten: false,
      scannerRunTriggered: false,
      sqliteWritten: false,
      fileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      readResult,
      message: `patch 写入后读取 library-index.json 失败：${readResult.message}`,
      safetyNotes: buildMvp101PatchUiRefreshSafetyNotes(),
    } as const;
  }

  return {
    ok: true,
    status: 'mvp101-import-ui-refresh-after-patch-complete',
    schemaVersion: 1,
    refreshVersion: 'mvp101-import-ui-refresh-after-patch-v1',
    sourcePatchWriteVersion: 'mvp100-library-index-patch-write-v1',
    operationPlanId: request.operationPlanId,
    targetRootPathToken: request.targetRootPathToken,
    displayName: targetRoot.displayName,
    libraryType: targetRoot.libraryType,
    mode: 'refresh-after-patch-write',
    indexReadPerformed: true,
    rendererRefreshExpected: true,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    fileMutationPerformed: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    eventName: 'yang-kura-library-index-loaded',
    cacheKey: 'yang_kura_last_read_library_index_result',
    readResult,
    summary: readResult.summary,
    message: 'MVP101 已读取 patch 后的 library-index.json；Renderer 应保存 readResult 并 dispatch yang-kura-library-index-loaded 刷新首页、音声库和音乐库。',
    safetyNotes: buildMvp101PatchUiRefreshSafetyNotes(),
  } as const;
}

function registerCopyOnlyMainSideStubIpc(): void {
  ipcMain.handle('yang-kura:import:copy-only:preflight', async (_event, request: unknown) => {
    const payload = request as Partial<ImportCopyOnlyStubRequest> | undefined;
    return buildMvp94CopyOnlyPreflightResult(payload);
  });

  ipcMain.handle('yang-kura:import:copy-only:confirm', async (_event, request: unknown) => {
    const payload = request as Partial<ImportCopyOnlyConfirmStubRequest> | undefined;
    return {
      ok: false,
      status: 'mvp93-copy-only-confirm-stub-blocked',
      operationPlanId: payload?.operationPlanId ?? 'mvp93-missing-operation-plan',
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      confirmationAccepted: false,
      message: 'MVP93 confirm 只保存合同语义，不允许触发真实 copy。',
      safetyNotes: buildSafetyNotes().concat(['mvp93-copy-only-confirm-stub']),
    } as const;
  });

  ipcMain.handle('yang-kura:import:copy-only:execute', async (_event, request: unknown) => {
    const payload = request as Partial<ImportCopyOnlyStubRequest> | undefined;
    return buildMvp95CopyOnlyExecuteResult(payload);
  });

  ipcMain.handle('yang-kura:import:post-copy:refresh-preview', async (_event, request: unknown) => {
    const payload = request as Partial<ImportPostCopyRefreshPreviewRequest> | undefined;
    return buildMvp97PostCopyRefreshPreviewResult(payload);
  });

  ipcMain.handle('yang-kura:import:library-index-patch:preview', async (_event, request: unknown) => {
    const payload = request as Partial<ImportLibraryIndexPatchPreviewRequest> | undefined;
    return buildMvp98LibraryIndexPatchPreviewResult(payload);
  });

  ipcMain.handle('yang-kura:import:library-index-patch:write-readiness', async (_event, request: unknown) => {
    const payload = request as Partial<ImportLibraryIndexPatchWriteReadinessRequest> | undefined;
    return buildMvp99LibraryIndexPatchWriteReadinessResult(payload);
  });

  ipcMain.handle('yang-kura:import:library-index-patch:write-confirmed', async (_event, request: unknown) => {
    const payload = request as Partial<ImportLibraryIndexPatchWriteRequest> | undefined;
    return buildMvp100LibraryIndexPatchWriteResult(payload);
  });

  ipcMain.handle('yang-kura:import:library-index-patch:refresh-after-write', async (_event, request: unknown) => {
    const payload = request as Partial<ImportLibraryIndexPatchUiRefreshRequest> | undefined;
    return buildMvp101PatchUiRefreshAfterWriteResult(payload);
  });


ipcMain.handle('yang-kura:import:move-only:execute', async (_event, request: unknown) => {
  const payload = request as Partial<ImportMoveOnlyExecuteRequest> | undefined;
  return buildMvp105MoveOnlyExecuteResult(payload);
});

  ipcMain.handle('yang-kura:import:copy-only:cancel', async (_event, request: unknown) => {
    const payload = request as Partial<ImportCopyOnlyCancelStubRequest> | undefined;
    return {
      ok: false,
      status: 'mvp93-copy-only-cancel-stub-blocked',
      operationPlanId: payload?.operationPlanId ?? 'mvp93-missing-operation-plan',
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      message: 'MVP93 cancel 只返回 stub 状态；没有真实 copy 队列可取消。',
      safetyNotes: buildSafetyNotes().concat(['mvp93-copy-only-cancel-stub']),
    } as const;
  });
}

async function createMainWindow(): Promise<BrowserWindow> {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1040,
    minHeight: 680,
    title: 'Yang-Kura Audio Library',
    backgroundColor: '#050508',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  registerDirectoryDialogIpc(mainWindow);
  registerDryRunScannerIpc();
  registerWriteIndexPreviewIpc();
  registerWriteLibraryIndexIpc();
  registerReadLibraryIndexIpc();
  registerLibraryIndexHealthIpc();
  registerResolveTrackMediaUrlIpc();
  registerMpvPlaybackIpc(mainWindow);
  registerMpvSettingsIpc();
  registerReadTrackLyricsIpc();
  registerAsmrMetadataProviderIpc();
  registerExternalOpenIpc();
  registerCopyOnlyMainSideStubIpc();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDevShell) {
    await mainWindow.loadURL(viteDevUrl);
  } else {
    if (process.env.YANG_KURA_OPEN_DEVTOOLS === '1') {
      mainWindow.webContents.openDevTools();
    }
    await mainWindow.loadFile(path.join(appRoot, 'dist', 'index.html'));
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  await mpvSettingsStore.initialize();
  registerMediaProtocol();
  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

let allowQuitAfterMpvCleanup = false;
let mpvCleanupPromise: Promise<void> | null = null;

app.on('before-quit', (event) => {
  if (allowQuitAfterMpvCleanup || !mpvPlaybackBackend) return;
  event.preventDefault();
  if (!mpvCleanupPromise) {
    mpvCleanupPromise = mpvPlaybackBackend.dispose().finally(() => {
      allowQuitAfterMpvCleanup = true;
      app.quit();
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
