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

export type LibrarySessionReadAttemptStatus = 'loaded' | 'failed';

export interface LibrarySessionReadAttemptSnapshot {
  status: LibrarySessionReadAttemptStatus;
  attemptedAt: string;
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
let indexReadEventDispatchDepth = 0;

const emptySnapshot = (): LibrarySessionSnapshot => ({
  version: 1,
  updatedAt: new Date(0).toISOString(),
  selectedRoots: {},
});

const safeJsonParse = (value: string | null): LibrarySessionSnapshot => {
  if (!value) return emptySnapshot();
  try {
    const parsed = JSON.parse(value) as Partial<LibrarySessionSnapshot>;
    if (parsed.version !== 1 || typeof parsed !== 'object' || parsed === null) {
      return emptySnapshot();
    }
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
      selectedRoots: parsed.selectedRoots || {},
      lastIndex: parsed.lastIndex,
      lastWrite: parsed.lastWrite,
      lastReadAttempt: parsed.lastReadAttempt,
    };
  } catch {
    return emptySnapshot();
  }
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

const toIndexSnapshotFromRead = (
  result: YangKuraReadLibraryIndexSuccessResult,
): LibrarySessionIndexSnapshot => ({
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

const toIndexSnapshotFromWrite = (
  result: YangKuraWriteLibraryIndexSuccessResult,
): LibrarySessionIndexSnapshot => ({
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

  getSnapshot(): LibrarySessionSnapshot {
    if (typeof localStorage === 'undefined') return emptySnapshot();
    return safeJsonParse(localStorage.getItem(STORAGE_KEY));
  },

  recordRootSelected(result: YangKuraSelectLibraryRootResult): void {
    if (!result.ok) return;
    const previous = this.getSnapshot();
    const now = new Date().toISOString();
    saveSnapshot({
      ...previous,
      version: 1,
      updatedAt: now,
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

  recordIndexRead(result: YangKuraReadLibraryIndexResult): void {
    const previous = this.getSnapshot();
    const now = new Date().toISOString();

    if (!result.ok) {
      saveSnapshot({
        ...previous,
        version: 1,
        updatedAt: now,
        lastIndex: undefined,
        lastReadAttempt: {
          status: 'failed',
          attemptedAt: now,
          message: result.message,
        },
      });
      emitIndexReadUpdated();
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
        attemptedAt: result.readAt || now,
        message: result.message,
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
    if (snapshot.lastReadAttempt?.status === 'failed') {
      return `最近一次资源库记录读取失败：${snapshot.lastReadAttempt.message}`;
    }
    if (snapshot.lastIndex) {
      return `上次已读取「${snapshot.lastIndex.displayName}」：${snapshot.lastIndex.collectionCount} 个集合，${snapshot.lastIndex.trackCount} 条音轨。重启后请先重新选择该目录，再点“读取现有 index”。`;
    }
    const selectedRoots = Object.values(snapshot.selectedRoots).filter(Boolean) as LibrarySessionRootSnapshot[];
    if (selectedRoots.length > 0) {
      return `上次选择过「${selectedRoots.map((root) => root.displayName).join('、')}」。打包版重启后需要重新选择目录以恢复权限。`;
    }
    return '尚未导入本地资源库。请到设置页选择音声库或音乐库目录。';
  },
};
