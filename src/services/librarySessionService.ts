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

export interface LibrarySessionSnapshot {
  version: 1;
  updatedAt: string;
  selectedRoots: Partial<Record<YangKuraLibraryType, LibrarySessionRootSnapshot>>;
  lastIndex?: LibrarySessionIndexSnapshot;
  lastWrite?: LibrarySessionIndexSnapshot;
}

const STORAGE_KEY = 'yang_kura_library_session_v1';
const UPDATE_EVENT_NAME = 'yang-kura-library-session-updated';

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
    };
  } catch {
    return emptySnapshot();
  }
};

const emitUpdated = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(UPDATE_EVENT_NAME));
};

const saveSnapshot = (snapshot: LibrarySessionSnapshot) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  emitUpdated();
};

const toIndexSnapshotFromRead = (
  result: YangKuraReadLibraryIndexSuccessResult,
): LibrarySessionIndexSnapshot => ({
  libraryType: result.libraryType,
  displayName: result.displayName,
  indexRelativePath: result.indexRelativePath,
  readAt: result.readAt,
  generatedAt: result.index.generatedAt,
  rootCount: result.summary.rootCount,
  collectionCount: result.summary.collectionCount,
  trackCount: result.summary.trackCount,
  warningCount: result.summary.warningCount,
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
  rootCount: result.summary.rootCount,
  collectionCount: result.summary.collectionCount,
  trackCount: result.summary.trackCount,
  warningCount: result.summary.warningCount,
  bytesWritten: result.bytesWritten,
  sha256: result.sha256,
});

export const librarySessionService = {
  storageKey: STORAGE_KEY,
  updateEventName: UPDATE_EVENT_NAME,

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
    if (!result.ok) return;
    const previous = this.getSnapshot();
    const now = new Date().toISOString();
    saveSnapshot({
      ...previous,
      version: 1,
      updatedAt: now,
      lastIndex: toIndexSnapshotFromRead(result),
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
