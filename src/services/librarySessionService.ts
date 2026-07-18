export interface LibrarySessionRootSnapshot {
  libraryType: YangKuraLibraryType;
  displayName: string;
  selectedAt: string;
}

export interface LibrarySessionIndexSnapshot {
  libraryType: YangKuraLibraryType;
  displayName: string;
  indexRelativePath: string;
  readAt?: string;
  writtenAt?: string;
  generatedAt?: string;
  rootCount: number;
  collectionCount: number;
  trackCount: number;
  warningCount: number;
  bytesRead?: number;
  bytesWritten?: number;
  sha256?: string;
}

export type LibrarySessionReadAttemptStatus = 'reading' | 'loaded' | 'failed' | 'timed-out' | 'interrupted';

export interface LibrarySessionReadAttemptSnapshot {
  status: LibrarySessionReadAttemptStatus;
  operationId?: string;
  attemptedAt: string;
  completedAt?: string;
  message: string;
  libraryType?: YangKuraLibraryType;
  displayName?: string;
  trackCount?: number;
}

export interface LibrarySessionSnapshot {
  version: 1;
  updatedAt: string;
  selectedRoots: Partial<Record<YangKuraLibraryType, LibrarySessionRootSnapshot>>;
  lastIndex?: LibrarySessionIndexSnapshot;
  lastWrite?: LibrarySessionIndexSnapshot;
  lastReadAttempt?: LibrarySessionReadAttemptSnapshot;
}

const STORAGE_KEY = 'yang_kura_library_session_v1';
const UPDATE_EVENT_NAME = 'yang-kura-library-session-updated';
const INDEX_READ_EVENT_NAME = 'yang-kura-library-index-loaded';
const CURRENT_WINDOW_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';
const PERSISTED_ROOT_SESSION_KEY = 'yang_kura_persisted_authorized_roots_v1';
const INTERRUPTED_AFTER_MS = 60_000;
let indexReadEventDispatchDepth = 0;

const emptySnapshot = (): LibrarySessionSnapshot => ({
  version: 1,
  updatedAt: new Date(0).toISOString(),
  selectedRoots: {},
});

const normalizeReadAttempt = (value: LibrarySessionReadAttemptSnapshot | undefined): LibrarySessionReadAttemptSnapshot | undefined => {
  if (!value || value.status !== 'reading') return value;
  const started = Date.parse(value.attemptedAt);
  if (!Number.isFinite(started) || Date.now() - started <= INTERRUPTED_AFTER_MS) return value;
  return {
    ...value,
    status: 'interrupted',
    completedAt: new Date().toISOString(),
    message: '上一次资源库读取未正常结束。可以重新点击“读取已有记录”。',
  };
};

const safeJsonParse = (value: string | null): LibrarySessionSnapshot => {
  if (!value) return emptySnapshot();
  try {
    const parsed = JSON.parse(value) as Partial<LibrarySessionSnapshot>;
    if (parsed.version !== 1 || typeof parsed !== 'object' || parsed === null) return emptySnapshot();
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
      selectedRoots: parsed.selectedRoots || {},
      lastIndex: parsed.lastIndex,
      lastWrite: parsed.lastWrite,
      lastReadAttempt: normalizeReadAttempt(parsed.lastReadAttempt),
    };
  } catch {
    return emptySnapshot();
  }
};

const storageHasAuthorization = (storage: Storage, key: string): boolean => {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? '{}') as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    return Object.values(parsed).some((value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const rootPathToken = (value as { rootPathToken?: unknown }).rootPathToken;
      return typeof rootPathToken === 'string' && rootPathToken.trim().length > 0;
    });
  } catch {
    return false;
  }
};

const hasCurrentWindowAuthorization = (): boolean => {
  if (typeof sessionStorage !== 'undefined' && storageHasAuthorization(sessionStorage, CURRENT_WINDOW_ROOT_SESSION_KEY)) return true;
  if (typeof localStorage !== 'undefined' && storageHasAuthorization(localStorage, PERSISTED_ROOT_SESSION_KEY)) return true;
  return false;
};

const applyCurrentWindowAuthorizationBoundary = (snapshot: LibrarySessionSnapshot): LibrarySessionSnapshot => {
  if (hasCurrentWindowAuthorization()) return snapshot;
  return { ...snapshot, lastIndex: undefined, lastReadAttempt: undefined };
};

const emitUpdated = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(UPDATE_EVENT_NAME));
};

const emitIndexReadUpdated = () => {
  if (typeof window === 'undefined' || indexReadEventDispatchDepth > 0) return;
  indexReadEventDispatchDepth += 1;
  try {
    window.dispatchEvent(new Event(INDEX_READ_EVENT_NAME));
  } finally {
    indexReadEventDispatchDepth -= 1;
  }
};

const saveSnapshot = (snapshot: LibrarySessionSnapshot) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  emitUpdated();
};

const safeCount = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;

const toIndexSnapshotFromRead = (result: YangKuraReadLibraryIndexSuccessResult): LibrarySessionIndexSnapshot => ({
  libraryType: result.libraryType,
  displayName: result.displayName,
  indexRelativePath: result.indexRelativePath,
  readAt: result.readAt,
  generatedAt: result.index?.generatedAt,
  rootCount: safeCount(result.summary?.rootCount),
  collectionCount: safeCount(result.summary?.collectionCount),
  trackCount: safeCount(result.summary?.trackCount),
  warningCount: safeCount(result.summary?.warningCount),
  bytesRead: result.bytesRead,
  sha256: result.sha256,
});

const toIndexSnapshotFromWrite = (result: YangKuraWriteLibraryIndexSuccessResult): LibrarySessionIndexSnapshot => ({
  libraryType: result.libraryType,
  displayName: result.displayName,
  indexRelativePath: result.indexRelativePath,
  writtenAt: result.writtenAt,
  rootCount: safeCount(result.summary?.rootCount),
  collectionCount: safeCount(result.summary?.collectionCount),
  trackCount: safeCount(result.summary?.trackCount),
  warningCount: safeCount(result.summary?.warningCount),
  bytesWritten: result.bytesWritten,
  sha256: result.sha256,
});

export const librarySessionService = {
  storageKey: STORAGE_KEY,
  updateEventName: UPDATE_EVENT_NAME,
  indexReadEventName: INDEX_READ_EVENT_NAME,
  currentWindowRootSessionKey: CURRENT_WINDOW_ROOT_SESSION_KEY,

  hasCurrentWindowAuthorization(): boolean {
    return hasCurrentWindowAuthorization();
  },

  getSnapshot(): LibrarySessionSnapshot {
    if (typeof localStorage === 'undefined') return emptySnapshot();
    return applyCurrentWindowAuthorizationBoundary(safeJsonParse(localStorage.getItem(STORAGE_KEY)));
  },

  recordRootSelected(result: YangKuraSelectLibraryRootResult): void {
    if (!result.ok) return;
    const previous = this.getSnapshot();
    const now = new Date().toISOString();
    saveSnapshot({
      ...previous,
      version: 1,
      updatedAt: now,
      lastReadAttempt: undefined,
      selectedRoots: {
        ...previous.selectedRoots,
        [result.libraryType]: {
          libraryType: result.libraryType,
          displayName: result.displayName,
          selectedAt: now,
        },
      },
    });
  },

  recordIndexReadStarted(input: { operationId: string; libraryType: YangKuraLibraryType; displayName: string }): void {
    const previous = this.getSnapshot();
    const now = new Date().toISOString();
    saveSnapshot({
      ...previous,
      version: 1,
      updatedAt: now,
      lastReadAttempt: {
        status: 'reading',
        operationId: input.operationId,
        attemptedAt: now,
        message: `正在读取「${input.displayName}」的资源库记录…`,
        libraryType: input.libraryType,
        displayName: input.displayName,
      },
    });
  },

  recordIndexReadTimedOut(input: { operationId: string; libraryType: YangKuraLibraryType; displayName: string; message: string }): void {
    const previous = this.getSnapshot();
    if (previous.lastReadAttempt?.operationId && previous.lastReadAttempt.operationId !== input.operationId) return;
    const now = new Date().toISOString();
    saveSnapshot({
      ...previous,
      updatedAt: now,
      lastReadAttempt: {
        status: 'timed-out',
        operationId: input.operationId,
        attemptedAt: previous.lastReadAttempt?.attemptedAt ?? now,
        completedAt: now,
        message: input.message,
        libraryType: input.libraryType,
        displayName: input.displayName,
      },
    });
  },

  recordIndexRead(result: YangKuraReadLibraryIndexResult, operationId?: string): void {
    const previous = this.getSnapshot();
    const activeOperationId = previous.lastReadAttempt?.operationId;
    if (operationId && activeOperationId && activeOperationId !== operationId) return;
    const now = new Date().toISOString();

    if (!result.ok) {
      saveSnapshot({
        ...previous,
        version: 1,
        updatedAt: now,
        lastReadAttempt: {
          status: 'failed',
          operationId,
          attemptedAt: previous.lastReadAttempt?.attemptedAt ?? now,
          completedAt: now,
          message: result.message,
          libraryType: previous.lastReadAttempt?.libraryType,
          displayName: previous.lastReadAttempt?.displayName,
        },
      });
      return;
    }

    const lastIndex = toIndexSnapshotFromRead(result);
    saveSnapshot({
      ...previous,
      version: 1,
      updatedAt: now,
      lastIndex,
      lastReadAttempt: {
        status: 'loaded',
        operationId,
        attemptedAt: previous.lastReadAttempt?.attemptedAt ?? (result.readAt || now),
        completedAt: now,
        message: `读取完成：${lastIndex.collectionCount} 个作品或专辑，${lastIndex.trackCount} 条音轨。`,
        libraryType: result.libraryType,
        displayName: result.displayName,
        trackCount: lastIndex.trackCount,
      },
      selectedRoots: {
        ...previous.selectedRoots,
        [result.libraryType]: {
          libraryType: result.libraryType,
          displayName: result.displayName,
          selectedAt: previous.selectedRoots[result.libraryType]?.selectedAt || now,
        },
      },
    });
    emitIndexReadUpdated();
  },

  recordIndexWrite(result: YangKuraWriteLibraryIndexResult): void {
    if (!result.ok) return;
    const previous = this.getSnapshot();
    const now = new Date().toISOString();
    saveSnapshot({
      ...previous,
      version: 1,
      updatedAt: now,
      lastWrite: toIndexSnapshotFromWrite(result),
      selectedRoots: {
        ...previous.selectedRoots,
        [result.libraryType]: {
          libraryType: result.libraryType,
          displayName: result.displayName,
          selectedAt: previous.selectedRoots[result.libraryType]?.selectedAt || now,
        },
      },
    });
  },

  getUserFacingStatus(snapshot: LibrarySessionSnapshot = this.getSnapshot()): string {
    const attempt = snapshot.lastReadAttempt;
    if (attempt?.status === 'reading') return attempt.message;
    if (attempt?.status === 'timed-out') return `读取等待超时：${attempt.message}`;
    if (attempt?.status === 'interrupted') return attempt.message;
    if (attempt?.status === 'failed') return `最近一次资源库读取失败：${attempt.message}`;
    if (snapshot.lastIndex) {
      return `已读取「${snapshot.lastIndex.displayName}」：${snapshot.lastIndex.collectionCount} 个作品或专辑，${snapshot.lastIndex.trackCount} 条音轨。重启应用后仍可继续读取和播放。`;
    }
    const selectedRoots = Object.values(snapshot.selectedRoots).filter(Boolean) as LibrarySessionRootSnapshot[];
    if (selectedRoots.length > 0) return `已选择「${selectedRoots.map((root) => root.displayName).join('、')}」，可以读取已有记录。`;
    return '尚未导入本地资源库。请到设置页选择音声库或音乐库目录。';
  },
};
