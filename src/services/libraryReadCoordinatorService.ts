import type { LocalJsonIndex } from '../types';
import { libraryIndexNormalizationService } from './libraryIndexNormalizationService';
import { librarySessionService } from './librarySessionService';

const INDEX_RESULT_KEY = 'yang_kura_last_read_library_index_result';
const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_PERSISTED_RESULT_BYTES = 2_000_000;
let latestRuntimeResult: YangKuraReadLibraryIndexResult | null = null;

export interface LibraryReadRequestContext {
  libraryType: YangKuraLibraryType;
  displayName: string;
  rootPathToken: string;
  timeoutMs?: number;
}

function operationId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `library-read-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeResult(result: YangKuraReadLibraryIndexResult): YangKuraReadLibraryIndexResult {
  if (!result.ok) return result;
  const normalizedIndex = libraryIndexNormalizationService.normalize(result.index as LocalJsonIndex);
  if (normalizedIndex === result.index) return result;
  return {
    ...result,
    index: normalizedIndex,
    summary: {
      ...result.summary,
      collectionCount: normalizedIndex.collections.length,
      trackCount: normalizedIndex.tracks.length,
      warningCount: normalizedIndex.warnings.length,
    },
    message: `资源库记录读取完成：已整理为 ${normalizedIndex.collections.length} 个作品或专辑、${normalizedIndex.tracks.length} 条音轨。`,
  };
}

function failureResult(context: LibraryReadRequestContext, status: string, message: string): YangKuraReadLibraryIndexResult {
  return {
    ok: false,
    status,
    rootPathToken: context.rootPathToken,
    displayName: context.displayName,
    libraryType: context.libraryType,
    indexRelativePath: 'library-index.json',
    indexReadAllowed: true,
    indexReadPerformed: false,
    absolutePathsReturned: false,
    fileUrlReturned: false,
    message,
    safetyNotes: ['读取未修改媒体文件', '可以安全重试'],
  } as YangKuraReadLibraryIndexResult;
}

function persistIfCurrent(result: YangKuraReadLibraryIndexResult, currentOperationId: string): boolean {
  const activeOperationId = librarySessionService.getSnapshot().lastReadAttempt?.operationId;
  if (activeOperationId !== currentOperationId) return false;
  latestRuntimeResult = result;
  try {
    const serialized = JSON.stringify(result);
    if (serialized.length <= MAX_PERSISTED_RESULT_BYTES) {
      localStorage.setItem(INDEX_RESULT_KEY, serialized);
    } else {
      localStorage.removeItem(INDEX_RESULT_KEY);
    }
  } catch {
    try { localStorage.removeItem(INDEX_RESULT_KEY); } catch { /* no-op */ }
  }
  librarySessionService.recordIndexRead(result, currentOperationId);
  return true;
}

function readPersistedResult(): YangKuraReadLibraryIndexResult | null {
  if (latestRuntimeResult) return latestRuntimeResult;
  try {
    const raw = localStorage.getItem(INDEX_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as YangKuraReadLibraryIndexResult;
    latestRuntimeResult = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export const libraryReadCoordinatorService = {
  resultStorageKey: INDEX_RESULT_KEY,
  timeoutMs: DEFAULT_TIMEOUT_MS,
  maxPersistedResultBytes: MAX_PERSISTED_RESULT_BYTES,

  getLatestResult(): YangKuraReadLibraryIndexResult | null {
    return readPersistedResult();
  },

  async read(context: LibraryReadRequestContext): Promise<YangKuraReadLibraryIndexResult> {
    const currentOperationId = operationId();
    librarySessionService.recordIndexReadStarted({
      operationId: currentOperationId,
      libraryType: context.libraryType,
      displayName: context.displayName,
    });

    if (!window.yangKura?.requestReadLibraryIndex) {
      const unavailable = failureResult(context, 'u40d-library-index-read-unavailable', '当前桌面连接不可用，请重新打开应用后重试。');
      persistIfCurrent(unavailable, currentOperationId);
      return unavailable;
    }

    let timeoutHandle = 0;
    let returnedTimeout = false;
    const actual = window.yangKura.requestReadLibraryIndex({
      rootPathToken: context.rootPathToken,
      mode: 'read-current-index',
    })
      .then(normalizeResult)
      .catch((error) => failureResult(
        context,
        'u40d-library-index-read-error',
        `资源库读取失败：${error instanceof Error ? error.message : String(error)}。可以重新尝试。`,
      ))
      .then((result) => {
        window.clearTimeout(timeoutHandle);
        persistIfCurrent(result, currentOperationId);
        return result;
      });

    const timeout = new Promise<YangKuraReadLibraryIndexResult>((resolve) => {
      timeoutHandle = window.setTimeout(() => {
        returnedTimeout = true;
        const message = `等待超过 ${Math.round((context.timeoutMs ?? DEFAULT_TIMEOUT_MS) / 1000)} 秒。读取仍会在后台完成；也可以立即重试。`;
        librarySessionService.recordIndexReadTimedOut({
          operationId: currentOperationId,
          libraryType: context.libraryType,
          displayName: context.displayName,
          message,
        });
        resolve(failureResult(context, 'u40d-library-index-read-timeout', message));
      }, context.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    });

    const callerResult = await Promise.race([actual, timeout]);
    if (returnedTimeout) void actual;
    return callerResult;
  },
};
