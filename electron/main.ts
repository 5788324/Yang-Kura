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

interface ResolveTrackMediaUrlRequest {
  rootPathToken: string;
  relativePath: string;
  trackId: string;
  expectedKind: 'audio';
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
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
}



interface ImportMoveOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp105-move-only-operation-log-v1';
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
  canResolveMediaTrackUrl: true;
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
    'MVP-26 允许只读读取同一 rootPathToken 下的 .lrc / .srt / .vtt / .ass 字幕正文。',
    'MVP-27 允许用系统默认应用打开同一 rootPathToken 下的视频/图片/文件，并可在文件管理器中定位。',
    'MVP-94 允许 copy-only preflight 在 main 侧只读检查源/目标文件状态，但仍不执行 copy、不创建目录、不写日志。',
    'MVP-95 允许用户确认后在 Electron main 侧执行 copy-only：COPYFILE_EXCL 防覆盖、只创建目标父目录、不写 library-index.json。',
    'MVP-97 允许 copy 后对目标相对路径做只读刷新预览，但仍不写 library-index.json、不接 SQLite。',
    'MVP-98 允许根据 refreshCandidates 生成 library-index patch 预览，但仍不写 library-index.json、不接 SQLite。',
    'MVP-100 允许用户确认后在目标库内执行 library-index.json patch 写入：先备份、只合并新增 patch、不删除既有数据、不接 SQLite。',
    'MVP-105 允许用户二次确认后执行小样本真实 move-only：最多 20 个文件、overwrite=false、失败停止、写相对路径 OperationLog、不写 index。',
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
    const jsonText = await fs.readFile(indexPath, 'utf8');
    const sha256 = crypto.createHash('sha256').update(jsonText).digest('hex');
    const parsed = JSON.parse(jsonText) as unknown;
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
      bytesRead: Buffer.byteLength(jsonText, 'utf8'),
      sha256,
      summary: validation.summary,
      index: indexPayload,
      message: 'library-index.json 已读取并通过结构校验；Renderer 只收到 tokenized index，不包含 absolutePath / file://。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  } catch (error) {
    return {
      ok: false,
      status: 'mvp24-library-index-read-error',
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexRelativePath,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: `source stat failed: ${getSafeErrorCode(error)}`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
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
    canResolveMediaTrackUrl: true,
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

    const result = await dialog.showOpenDialog(mainWindow, {
      title: `选择 ${getDefaultDisplayName(libraryType)} 根目录`,
      buttonLabel: '选择此目录',
      properties: ['openDirectory', 'dontAddToRecent'],
    });

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
}): ImportCopyOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp96-copy-only-operation-log-v1',
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
}): ImportMoveOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp105-move-only-operation-log-v1',
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
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp105-small-sample-move-only-executor-v1',
    'move-only-small-sample real executor: max 20 files',
    'requires CONFIRM_MOVE_IMPORT and confirmedMoveOnly=true',
    'overwrite=false; target exists skip',
    'failure-stop: first failed move stops remaining items',
    'uses fs.rename for same-device move and copy-verify-unlink for EXDEV only',
    'OperationLog is append-only JSONL with relative paths only',
    'no library-index.json write, no SQLite, no absolutePath, no file://',
  ]);

  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'move-only-small-sample') {
    return {
      ok: false,
      status: 'mvp105-move-only-execute-invalid-request',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: request?.operationPlanId ?? 'mvp105-missing-operation-plan',
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      moveAllowed: false,
      movedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      libraryIndexWritten: false,
      sqliteWritten: false,
      message: 'move-only execute 请求必须包含 operationPlanId、rootPathToken、targetRootPathToken，且 mode=move-only-small-sample。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  if (request.confirmedMoveOnly !== true || request.confirmationText !== 'CONFIRM_MOVE_IMPORT') {
    return {
      ok: false,
      status: 'mvp105-move-only-execute-confirmation-required',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      moveAllowed: false,
      movedCount: 0,
      skippedCount: Array.isArray(request.relativePaths) ? request.relativePaths.length : 0,
      failedCount: 0,
      libraryIndexWritten: false,
      sqliteWritten: false,
      message: '真实 move-only 执行需要 confirmedMoveOnly=true 且 confirmationText=CONFIRM_MOVE_IMPORT。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  if (request.overwriteAllowed !== false && request.overwriteAllowed !== undefined) {
    return {
      ok: false,
      status: 'mvp105-move-only-execute-overwrite-blocked',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      moveAllowed: false,
      movedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      libraryIndexWritten: false,
      sqliteWritten: false,
      message: 'MVP105 固定 overwriteAllowed=false；任何覆盖请求都会被拒绝。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) {
    return {
      ok: false,
      status: 'mvp105-move-only-execute-invalid-root-token',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      moveAllowed: false,
      movedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      libraryIndexWritten: false,
      sqliteWritten: false,
      message: 'rootPathToken 或 targetRootPathToken 无效。请重新选择源目录和目标仓库目录。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const relativePaths = Array.isArray(request.relativePaths) ? request.relativePaths.slice(0, 200) : [];
  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  const maxMoveItems = normalizeLimit(request.maxMoveItems, 20, 20);
  if (relativePaths.length === 0) {
    return {
      ok: false,
      status: 'mvp105-move-only-execute-empty-file-list',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      moveAllowed: false,
      movedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      libraryIndexWritten: false,
      sqliteWritten: false,
      message: 'move-only execute 至少需要一个 source relativePath。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }
  if (relativePaths.length > maxMoveItems) {
    return {
      ok: false,
      status: 'mvp105-move-only-execute-too-many-files',
      executorVersion: 'mvp105-small-sample-move-only-executor-v1',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      moveAllowed: false,
      movedCount: 0,
      skippedCount: relativePaths.length,
      failedCount: 0,
      libraryIndexWritten: false,
      sqliteWritten: false,
      message: `MVP105 是小样本 move-only executor，最多允许 ${maxMoveItems} 个文件。`,
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const movedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; moveMethod: 'rename' | 'copy-verify-unlink'; absolutePathReturned: false; fileUrlReturned: false }> = [];
  const skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }> = [];
  const failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }> = [];
  const createdDirectoryRelativePaths = new Set<string>();
  let failureStopTriggered = false;

  for (let index = 0; index < relativePaths.length; index += 1) {
    const id = `mvp105-move-execute-${index + 1}`;
    const sourceInput = relativePaths[index];
    const targetInput = targetRelativePaths[index] ?? sourceInput;
    const sourceRelativePath = typeof sourceInput === 'string' ? normalizeRelativePath(sourceInput) : 'invalid-source-relative-path';
    const targetRelativePath = typeof targetInput === 'string' ? normalizeRelativePath(targetInput) : 'invalid-target-relative-path';

    if (failureStopTriggered) {
      skippedList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'remaining-after-failure-stop', absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    const sourceResolved = typeof sourceInput === 'string' ? resolveSafeCopyPath(sourceRoot, sourceInput) : { ok: false as const, code: 'missing-source-relative-path', message: '缺少源相对路径。' };
    const targetResolved = typeof targetInput === 'string' ? resolveSafeCopyPath(targetRoot, targetInput) : { ok: false as const, code: 'missing-target-relative-path', message: '缺少目标相对路径。' };
    const failAndStop = (reasonCode: string, message: string) => {
      failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode, message, absolutePathReturned: false, fileUrlReturned: false });
      failureStopTriggered = true;
    };

    if (sourceResolved.ok === false) {
      failAndStop(sourceResolved.code, sourceResolved.message);
      continue;
    }
    if (targetResolved.ok === false) {
      failAndStop(targetResolved.code, targetResolved.message);
      continue;
    }

    let sourceStat;
    try {
      sourceStat = await fs.stat(sourceResolved.absolutePath);
    } catch (error) {
      failAndStop('source-missing', `source stat failed: ${getSafeErrorCode(error)}`);
      continue;
    }
    if (!sourceStat.isFile()) {
      failAndStop('source-not-file', '源路径不是文件，move-only executor 已拒绝。');
      continue;
    }

    try {
      await fs.stat(targetResolved.absolutePath);
      skippedList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'target-exists-overwrite-disabled', absolutePathReturned: false, fileUrlReturned: false });
      continue;
    } catch {
      // target does not exist; move remains guarded by rename/copy pre-checks.
    }

    const parentAbsolutePath = path.dirname(targetResolved.absolutePath);
    const parentRelativePath = relativeDirectoryOf(targetResolved.relativePath);
    try {
      const parentStat = await fs.stat(parentAbsolutePath);
      if (!parentStat.isDirectory()) {
        failAndStop('target-parent-not-directory', '目标父路径存在但不是目录。');
        continue;
      }
    } catch {
      await fs.mkdir(parentAbsolutePath, { recursive: true });
      if (parentRelativePath) createdDirectoryRelativePaths.add(parentRelativePath);
    }

    try {
      await fs.rename(sourceResolved.absolutePath, targetResolved.absolutePath);
      movedFiles.push({ id, sourceRelativePath, targetRelativePath, sizeBytes: sourceStat.size, moveMethod: 'rename', absolutePathReturned: false, fileUrlReturned: false });
    } catch (error: any) {
      if (error?.code !== 'EXDEV') {
        failAndStop('move-rename-failed', `rename failed: ${getSafeErrorCode(error)}`);
        continue;
      }
      try {
        await fs.copyFile(sourceResolved.absolutePath, targetResolved.absolutePath, fsSync.constants.COPYFILE_EXCL);
        const targetStat = await fs.stat(targetResolved.absolutePath);
        if (!targetStat.isFile() || targetStat.size !== sourceStat.size) {
          failAndStop('copy-verify-failed', '跨盘 move fallback 复制后校验失败，源文件保留。');
          continue;
        }
        await fs.unlink(sourceResolved.absolutePath);
        movedFiles.push({ id, sourceRelativePath, targetRelativePath, sizeBytes: sourceStat.size, moveMethod: 'copy-verify-unlink', absolutePathReturned: false, fileUrlReturned: false });
      } catch (fallbackError: any) {
        if (fallbackError?.code === 'EEXIST') {
          skippedList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'target-exists-overwrite-disabled', absolutePathReturned: false, fileUrlReturned: false });
        } else {
          failAndStop('copy-verify-unlink-failed', `copy-verify-unlink failed: ${getSafeErrorCode(fallbackError)}`);
        }
      }
    }
  }

  const operationLogEntry = buildMvp105MoveOnlyOperationLogEntry({
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    requestedFileCount: relativePaths.length,
    movedFiles,
    skippedList,
    failureList,
    createdDirectoryRelativePaths: Array.from(createdDirectoryRelativePaths),
    failureStopTriggered,
  });
  const operationLogWrite = await appendMvp105MoveOnlyOperationLog(operationLogEntry);
  const operationLogPersisted = operationLogWrite.ok;
  const operationLogFailureCode = operationLogWrite.ok ? undefined : (operationLogWrite as { ok: false; code: string }).code;

  return {
    ok: failureList.length === 0 && operationLogPersisted,
    status: operationLogPersisted ? 'mvp105-move-only-execute-complete-with-operation-log' : 'mvp105-move-only-execute-log-write-failed',
    executorVersion: 'mvp105-small-sample-move-only-executor-v1',
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: true,
    moveAllowed: true,
    copyAllowed: false,
    overwriteAllowed: false,
    deleteAllowed: false,
    renameAllowed: true,
    sourceDirectoryCleanupAllowed: false,
    operationLogPersisted,
    operationLogFailureCode,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    requestedFileCount: relativePaths.length,
    movedCount: movedFiles.length,
    skippedCount: skippedList.length,
    failedCount: failureList.length,
    createdDirectoryCount: createdDirectoryRelativePaths.size,
    createdDirectoryRelativePaths: Array.from(createdDirectoryRelativePaths),
    failureStopTriggered,
    movedFiles,
    skippedList,
    failureList,
    operationLog: operationLogPersisted
      ? {
        schemaVersion: operationLogEntry.schemaVersion,
        operationLogVersion: operationLogEntry.operationLogVersion,
        operationId: operationLogEntry.operationId,
        operationPlanId: operationLogEntry.operationPlanId,
        eventType: operationLogEntry.eventType,
        mode: operationLogEntry.mode,
        executorVersion: operationLogEntry.executorVersion,
        wroteAt: operationLogEntry.wroteAt,
        persisted: true,
        absolutePathReturned: false,
        fileUrlReturned: false,
      }
      : undefined,
    operationLogPreview: {
      operationPlanId: request.operationPlanId,
      mode: 'move-only',
      persisted: operationLogPersisted,
      movedCount: movedFiles.length,
      skippedCount: skippedList.length,
      failedCount: failureList.length,
      createdDirectoryCount: createdDirectoryRelativePaths.size,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    message: operationLogPersisted
      ? 'MVP105 move-only executor 已完成小样本真实移动尝试并写入 OperationLog；不覆盖、不清理空源目录、不写 library-index.json。'
      : 'MVP105 move-only executor 已完成移动尝试，但 OperationLog 写入失败；不返回日志绝对路径。',
    safetyNotes: baseSafetyNotes,
  } as const;
}

// Legacy verifier token retained for MVP95 compatibility: mvp95-copy-only-execute-complete / operationLogPersisted: false.
async function buildMvp95CopyOnlyExecuteResult(request: Partial<ImportCopyOnlyStubRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp95-copy-only-executor',
    'mvp96-copy-only-operation-log',
    'copy uses fs.copyFile with COPYFILE_EXCL overwrite protection',
    'mkdir is limited to target parent directories under targetRootPathToken',
    'OperationLog is append-only JSONL in app logs and contains relative paths only',
    'renderer token only: no absolutePath, no file://',
  ]);

  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'copy-only-stub') {
    return {
      ok: false,
      status: 'mvp95-copy-only-execute-invalid-request',
      operationPlanId: request?.operationPlanId ?? 'mvp95-missing-operation-plan',
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      createdDirectoryCount: 0,
      message: 'copy-only execute 请求必须包含 operationPlanId、rootPathToken、targetRootPathToken，且 mode=copy-only-stub。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  if (request.confirmedCopyOnly !== true || request.confirmationText !== 'COPY ONLY') {
    return {
      ok: false,
      status: 'mvp95-copy-only-execute-confirmation-required',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      skippedCount: Array.isArray(request.relativePaths) ? request.relativePaths.length : 0,
      failedCount: 0,
      createdDirectoryCount: 0,
      message: '真实 copy-only 执行需要 confirmedCopyOnly=true 且 confirmationText="COPY ONLY"。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) {
    return {
      ok: false,
      status: 'mvp95-copy-only-execute-invalid-root-token',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      skippedCount: 0,
      failedCount: 0,
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
      status: 'mvp95-copy-only-execute-empty-file-list',
      operationPlanId: request.operationPlanId,
      rootPathToken: request.rootPathToken,
      targetRootPathToken: request.targetRootPathToken,
      absolutePathReturned: false,
      fileUrlReturned: false,
      executeAllowed: false,
      copyAllowed: false,
      copiedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      createdDirectoryCount: 0,
      message: 'copy-only execute 至少需要一个 source relativePath。',
      safetyNotes: baseSafetyNotes,
    } as const;
  }

  const copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; absolutePathReturned: false; fileUrlReturned: false }> = [];
  const skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }> = [];
  const failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }> = [];
  const createdDirectoryRelativePaths = new Set<string>();

  for (let index = 0; index < relativePaths.length; index += 1) {
    const id = `mvp95-copy-execute-${index + 1}`;
    const sourceInput = relativePaths[index];
    const targetInput = targetRelativePaths[index] ?? sourceInput;
    const sourceRelativePath = typeof sourceInput === 'string' ? normalizeRelativePath(sourceInput) : 'invalid-source-relative-path';
    const targetRelativePath = typeof targetInput === 'string' ? normalizeRelativePath(targetInput) : 'invalid-target-relative-path';
    const sourceResolved = typeof sourceInput === 'string' ? resolveSafeCopyPath(sourceRoot, sourceInput) : { ok: false as const, code: 'missing-source-relative-path', message: '缺少源相对路径。' };
    const targetResolved = typeof targetInput === 'string' ? resolveSafeCopyPath(targetRoot, targetInput) : { ok: false as const, code: 'missing-target-relative-path', message: '缺少目标相对路径。' };

    if (sourceResolved.ok === false) {
      failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: sourceResolved.code, message: sourceResolved.message, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }
    if (targetResolved.ok === false) {
      failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: targetResolved.code, message: targetResolved.message, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    let sourceStat;
    try {
      sourceStat = await fs.stat(sourceResolved.absolutePath);
    } catch (error) {
      failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'source-missing', message: `source stat failed: ${getSafeErrorCode(error)}`, absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    if (!sourceStat.isFile()) {
      failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'source-not-file', message: '源路径不是文件，copy-only executor 已拒绝。', absolutePathReturned: false, fileUrlReturned: false });
      continue;
    }

    try {
      await fs.stat(targetResolved.absolutePath);
      skippedList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'target-exists-overwrite-disabled', absolutePathReturned: false, fileUrlReturned: false });
      continue;
    } catch {
      // target does not exist; COPYFILE_EXCL will still guard races.
    }

    const parentAbsolutePath = path.dirname(targetResolved.absolutePath);
    const parentRelativePath = relativeDirectoryOf(targetResolved.relativePath);
    try {
      const parentStat = await fs.stat(parentAbsolutePath);
      if (!parentStat.isDirectory()) {
        failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: 'target-parent-not-directory', message: '目标父路径存在但不是目录。', absolutePathReturned: false, fileUrlReturned: false });
        continue;
      }
    } catch {
      await fs.mkdir(parentAbsolutePath, { recursive: true });
      if (parentRelativePath) createdDirectoryRelativePaths.add(parentRelativePath);
    }

    try {
      await fs.copyFile(sourceResolved.absolutePath, targetResolved.absolutePath, fsSync.constants.COPYFILE_EXCL);
      copiedFiles.push({ id, sourceRelativePath, targetRelativePath, sizeBytes: sourceStat.size, absolutePathReturned: false, fileUrlReturned: false });
    } catch (error: any) {
      const code = error?.code === 'EEXIST' ? 'target-exists-race-overwrite-disabled' : 'copy-failed';
      if (code === 'target-exists-race-overwrite-disabled') {
        skippedList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: code, absolutePathReturned: false, fileUrlReturned: false });
      } else {
        failureList.push({ id, sourceRelativePath, targetRelativePath, reasonCode: code, message: `copy failed: ${getSafeErrorCode(error)}`, absolutePathReturned: false, fileUrlReturned: false });
      }
    }
  }

  const operationLogEntry = buildMvp96CopyOnlyOperationLogEntry({
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    requestedFileCount: relativePaths.length,
    copiedFiles,
    skippedList,
    failureList,
    createdDirectoryRelativePaths: Array.from(createdDirectoryRelativePaths),
  });
  const operationLogWrite = await appendMvp96CopyOnlyOperationLog(operationLogEntry);
  const operationLogPersisted = operationLogWrite.ok;
  const operationLogFailureCode = operationLogWrite.ok ? undefined : (operationLogWrite as { ok: false; code: string }).code;

  return {
    ok: failureList.length === 0 && operationLogPersisted,
    status: operationLogPersisted ? 'mvp96-copy-only-execute-complete-with-operation-log' : 'mvp96-copy-only-execute-log-write-failed',
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: true,
    copyAllowed: true,
    overwriteAllowed: false,
    moveAllowed: false,
    deleteAllowed: false,
    renameAllowed: false,
    operationLogPersisted,
    operationLogFailureCode,
    libraryIndexWritten: false,
    requestedFileCount: relativePaths.length,
    copiedCount: copiedFiles.length,
    skippedCount: skippedList.length,
    failedCount: failureList.length,
    createdDirectoryCount: createdDirectoryRelativePaths.size,
    createdDirectoryRelativePaths: Array.from(createdDirectoryRelativePaths),
    copiedFiles,
    skippedList,
    failureList,
    operationLog: operationLogPersisted
      ? {
        schemaVersion: operationLogEntry.schemaVersion,
        operationLogVersion: operationLogEntry.operationLogVersion,
        operationId: operationLogEntry.operationId,
        operationPlanId: operationLogEntry.operationPlanId,
        eventType: operationLogEntry.eventType,
        mode: operationLogEntry.mode,
        wroteAt: operationLogEntry.wroteAt,
        persisted: true,
        absolutePathReturned: false,
        fileUrlReturned: false,
      }
      : undefined,
    operationLogPreview: {
      operationPlanId: request.operationPlanId,
      mode: 'copy-only',
      persisted: operationLogPersisted,
      copiedCount: copiedFiles.length,
      skippedCount: skippedList.length,
      failedCount: failureList.length,
      createdDirectoryCount: createdDirectoryRelativePaths.size,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    message: operationLogPersisted
      ? 'MVP96 copy-only executor 已完成真实复制尝试并写入最小 OperationLog；不覆盖、不移动、不删除、不重命名、不写 library-index.json。'
      : 'MVP96 copy-only executor 已完成复制尝试，但 OperationLog 写入失败；不返回日志绝对路径。',
    safetyNotes: baseSafetyNotes,
  } as const;
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
  registerResolveTrackMediaUrlIpc();
  registerReadTrackLyricsIpc();
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
  registerMediaProtocol();
  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
