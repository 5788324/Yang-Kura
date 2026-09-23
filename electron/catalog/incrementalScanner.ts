import crypto from 'node:crypto';
import path from 'node:path';
import { promises as fs, type Dirent } from 'node:fs';
import { KuraCatalogDatabase } from './catalogDatabase.js';
import type {
  CatalogLibraryType,
  CatalogScanBatchResult,
  CatalogScanEntry,
  CatalogScanEntryKind,
  CatalogScanRunRecord,
} from './catalogTypes.js';

const AUDIO_EXTENSIONS = new Set(['.aac', '.aiff', '.ape', '.flac', '.m4a', '.mp3', '.ogg', '.opus', '.wav', '.wma']);
const VIDEO_EXTENSIONS = new Set(['.avi', '.m2ts', '.m4v', '.mkv', '.mov', '.mp4', '.mpeg', '.mpg', '.webm', '.wmv']);
const SUBTITLE_EXTENSIONS = new Set(['.ass', '.lrc', '.srt', '.ssa', '.ttml', '.vtt']);
const ARTWORK_EXTENSIONS = new Set(['.avif', '.bmp', '.gif', '.heic', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']);
const TEXT_EXTENSIONS = new Set(['.cue', '.json', '.md', '.nfo', '.txt', '.xml']);
const ARCHIVE_EXTENSIONS = new Set(['.7z', '.gz', '.rar', '.tar', '.zip']);

export interface IncrementalScannerIssue {
  code: string;
  relativePath: string | null;
}

export interface IncrementalScannerBatchProgress {
  runId: string;
  processedEntries: number;
  changedEntries: number;
  unchangedEntries: number;
  maxBatchObserved: number;
  checkpointRelativePath: string | null;
}

export interface IncrementalScannerOptions {
  catalog: KuraCatalogDatabase;
  absoluteRootPath: string;
  rootPathToken: string;
  displayName: string;
  libraryType: CatalogLibraryType;
  scanProfile: string;
  batchSize?: number;
  statConcurrency?: number;
  resumeRunId?: string;
  signal?: AbortSignal;
  onBatch?: (
    progress: IncrementalScannerBatchProgress,
    changedEntries: CatalogScanEntry[],
  ) => void | Promise<void>;
  onIssue?: (issue: IncrementalScannerIssue) => void;
}

export interface IncrementalScannerResult {
  ok: boolean;
  status: 'completed' | 'cancelled' | 'failed';
  rootId: string;
  runId: string;
  startedAt: string;
  completedAt: string | null;
  filesSeen: number;
  directoriesSeen: number;
  changedEntries: number;
  missingEntries: number;
  errorCount: number;
  resumeCount: number;
  checkpointRelativePath: string | null;
  maxBatchObserved: number;
  errorCode?: string;
}

export function catalogRootIdFromToken(rootPathToken: string): string {
  return `root-${crypto.createHash('sha1').update(rootPathToken).digest('hex').slice(0, 16)}`;
}

function normalizeRelativePath(value: string): string {
  return value.split(path.sep).join('/').replace(/^\.\//, '').replace(/^\/+/, '');
}

function compareRelativePath(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function classifyFile(name: string): CatalogScanEntryKind {
  const lower = name.toLowerCase();
  const extension = path.extname(lower);
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (SUBTITLE_EXTENSIONS.has(extension)) return 'subtitle';
  if (ARTWORK_EXTENSIONS.has(extension)) return 'artwork';
  if (TEXT_EXTENSIONS.has(extension)) return 'text';
  if (ARCHIVE_EXTENSIONS.has(extension)) return 'archive';
  return 'other';
}

function safeErrorCode(error: unknown): string {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  if (typeof code === 'string' && code) return code;
  return error instanceof Error && error.name ? error.name : 'UNKNOWN';
}

function shouldTraverseDirectory(relativePath: string, checkpoint: string | null): boolean {
  if (!checkpoint) return true;
  if (checkpoint === relativePath || checkpoint.startsWith(`${relativePath}/`)) return true;
  return compareRelativePath(relativePath, checkpoint) > 0;
}

function isPastCheckpoint(relativePath: string, checkpoint: string | null): boolean {
  return !checkpoint || compareRelativePath(relativePath, checkpoint) > 0;
}

async function readSortedDirectory(
  absolutePath: string,
  relativePath: string,
  onIssue: (issue: IncrementalScannerIssue) => void,
): Promise<Dirent[]> {
  try {
    const directory = await fs.opendir(absolutePath);
    const entries: Dirent[] = [];
    for await (const entry of directory) entries.push(entry);
    entries.sort((left, right) => left.name === right.name ? 0 : left.name < right.name ? -1 : 1);
    return entries;
  } catch (error) {
    onIssue({ code: `READ_DIR_${safeErrorCode(error)}`, relativePath: relativePath || null });
    return [];
  }
}

async function* walkIncremental(
  absoluteRootPath: string,
  checkpoint: string | null,
  statConcurrency: number,
  onIssue: (issue: IncrementalScannerIssue) => void,
  relativeDirectory = '',
): AsyncGenerator<CatalogScanEntry> {
  const absoluteDirectory = relativeDirectory
    ? path.join(absoluteRootPath, ...relativeDirectory.split('/'))
    : absoluteRootPath;
  const dirents = await readSortedDirectory(absoluteDirectory, relativeDirectory, onIssue);

  for (let offset = 0; offset < dirents.length; offset += statConcurrency) {
    const chunk = dirents.slice(offset, offset + statConcurrency);
    const prepared = await Promise.all(chunk.map(async (dirent) => {
      const relativePath = normalizeRelativePath(relativeDirectory
        ? path.join(relativeDirectory, dirent.name)
        : dirent.name);
      const absolutePath = path.join(absoluteDirectory, dirent.name);

      if (dirent.isSymbolicLink()) {
        return {
          dirent,
          entry: isPastCheckpoint(relativePath, checkpoint)
            ? {
                relativePath,
                entryKind: 'symlink' as const,
                sizeBytes: null,
                mtimeMs: null,
                fingerprint: null,
              }
            : null,
          relativePath,
        };
      }

      if (dirent.isDirectory()) {
        return {
          dirent,
          entry: isPastCheckpoint(relativePath, checkpoint)
            ? {
                relativePath,
                entryKind: 'directory' as const,
                sizeBytes: null,
                mtimeMs: null,
                fingerprint: null,
              }
            : null,
          relativePath,
        };
      }

      if (!dirent.isFile()) {
        return {
          dirent,
          entry: isPastCheckpoint(relativePath, checkpoint)
            ? {
                relativePath,
                entryKind: 'other' as const,
                sizeBytes: null,
                mtimeMs: null,
                fingerprint: null,
              }
            : null,
          relativePath,
        };
      }

      if (!isPastCheckpoint(relativePath, checkpoint)) {
        return { dirent, entry: null, relativePath };
      }

      try {
        const stat = await fs.stat(absolutePath);
        return {
          dirent,
          relativePath,
          entry: {
            relativePath,
            entryKind: classifyFile(dirent.name),
            sizeBytes: stat.size,
            mtimeMs: stat.mtimeMs,
            fingerprint: null,
          } satisfies CatalogScanEntry,
        };
      } catch (error) {
        onIssue({ code: `STAT_${safeErrorCode(error)}`, relativePath });
        return { dirent, entry: null, relativePath };
      }
    }));

    for (const item of prepared) {
      if (item.entry) yield item.entry;
      if (item.dirent.isDirectory() && shouldTraverseDirectory(item.relativePath, checkpoint)) {
        yield* walkIncremental(
          absoluteRootPath,
          checkpoint,
          statConcurrency,
          onIssue,
          item.relativePath,
        );
      }
    }
  }
}

function resultFromRun(
  run: CatalogScanRunRecord,
  missingEntries: number,
  maxBatchObserved: number,
  errorCode?: string,
): IncrementalScannerResult {
  return {
    ok: run.status === 'completed' || run.status === 'cancelled',
    status: run.status === 'completed' ? 'completed' : run.status === 'cancelled' ? 'cancelled' : 'failed',
    rootId: run.rootId,
    runId: run.id,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    filesSeen: run.filesSeen,
    directoriesSeen: run.directoriesSeen,
    changedEntries: run.changedEntries,
    missingEntries,
    errorCount: run.errorCount,
    resumeCount: run.resumeCount,
    checkpointRelativePath: run.checkpointRelativePath,
    maxBatchObserved,
    ...(errorCode ? { errorCode } : {}),
  };
}

export async function scanRootIncremental(options: IncrementalScannerOptions): Promise<IncrementalScannerResult> {
  const batchSize = Math.max(32, Math.min(Math.trunc(options.batchSize ?? 512), 2000));
  const statConcurrency = Math.max(1, Math.min(Math.trunc(options.statConcurrency ?? 64), 256));
  const rootId = catalogRootIdFromToken(options.rootPathToken);

  options.catalog.ensureScannerRoot({
    id: rootId,
    rootPathToken: options.rootPathToken,
    name: options.displayName,
    libraryType: options.libraryType,
    scanProfile: options.scanProfile,
  });

  const rootStat = await fs.stat(options.absoluteRootPath);
  if (!rootStat.isDirectory()) throw new Error('Incremental scanner root is not a directory.');

  let run = options.resumeRunId
    ? options.catalog.resumeScanRun(options.resumeRunId)
    : options.catalog.beginScanRun(rootId, crypto.randomUUID());
  if (run.rootId !== rootId) throw new Error('Resume scan root does not match current root token.');

  const checkpoint = run.checkpointRelativePath;
  let pending: CatalogScanEntry[] = [];
  let totalProcessed = run.filesSeen + run.directoriesSeen;
  let totalChanged = run.changedEntries;
  let totalUnchanged = 0;
  let pendingErrors = 0;
  let maxBatchObserved = 0;
  let missingEntries = 0;

  const onIssue = (issue: IncrementalScannerIssue) => {
    pendingErrors += 1;
    options.onIssue?.(issue);
  };

  const flush = async (): Promise<CatalogScanBatchResult | null> => {
    if (!pending.length) return null;
    const batch = pending;
    pending = [];
    maxBatchObserved = Math.max(maxBatchObserved, batch.length);
    const batchResult = options.catalog.applyScanBatch(rootId, run.id, batch);
    totalProcessed += batchResult.processed;
    totalChanged += batchResult.changed;
    totalUnchanged += batchResult.unchanged;
    if (pendingErrors) {
      options.catalog.addScanErrors(run.id, pendingErrors);
      pendingErrors = 0;
    }

    const changedSet = new Set(batchResult.changedRelativePaths);
    const changedEntries = batch.filter((entry) => changedSet.has(entry.relativePath));
    await options.onBatch?.({
      runId: run.id,
      processedEntries: totalProcessed,
      changedEntries: totalChanged,
      unchangedEntries: totalUnchanged,
      maxBatchObserved,
      checkpointRelativePath: batchResult.checkpointRelativePath,
    }, changedEntries);
    return batchResult;
  };

  try {
    for await (const entry of walkIncremental(
      options.absoluteRootPath,
      checkpoint,
      statConcurrency,
      onIssue,
    )) {
      if (options.signal?.aborted) {
        await flush();
        if (pendingErrors) options.catalog.addScanErrors(run.id, pendingErrors);
        run = options.catalog.cancelScanRun(run.id);
        return resultFromRun(run, 0, maxBatchObserved);
      }

      pending.push(entry);
      if (pending.length >= batchSize) await flush();
    }

    await flush();
    if (pendingErrors) options.catalog.addScanErrors(run.id, pendingErrors);
    const completed = options.catalog.completeScanRun(run.id);
    missingEntries = completed.missingEntries;
    run = completed;
    return resultFromRun(run, missingEntries, maxBatchObserved);
  } catch (error) {
    if (pendingErrors) options.catalog.addScanErrors(run.id, pendingErrors);
    run = options.catalog.failScanRun(run.id, safeErrorCode(error));
    return resultFromRun(run, 0, maxBatchObserved, safeErrorCode(error));
  }
}
