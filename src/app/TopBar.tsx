import type { LibrarySessionSnapshot } from '../services/librarySessionService';

export interface TopBarProps {
  librarySessionSnapshot: LibrarySessionSnapshot;
}

export default function TopBar({ librarySessionSnapshot }: TopBarProps) {
  const selectedRootCount = Object.keys(librarySessionSnapshot.selectedRoots).length;
  const attempt = librarySessionSnapshot.lastReadAttempt;
  const status = attempt?.status === 'reading'
    ? '正在读取资源库'
    : attempt?.status === 'timed-out'
      ? '读取超时，可重试'
      : attempt?.status === 'interrupted'
        ? '读取未完成'
        : attempt?.status === 'failed'
          ? '资源库读取失败'
          : librarySessionSnapshot.lastIndex
            ? `${librarySessionSnapshot.lastIndex.trackCount} 条音轨已就绪`
            : selectedRootCount > 0
              ? '资源库待读取'
              : '等待连接资源库';
  const state = attempt?.status === 'reading'
    ? 'reading'
    : attempt && ['timed-out', 'interrupted', 'failed'].includes(attempt.status)
      ? 'warning'
      : librarySessionSnapshot.lastIndex
        ? 'ready'
        : selectedRootCount > 0
          ? 'pending'
          : 'idle';

  return (
    <header
      id="windows-app-bar"
      className="k2-topbar h-10 min-w-0 flex items-center justify-between gap-3 px-3 sm:px-4 text-xs text-text-secondary select-none z-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="k2-topbar__signal" aria-hidden="true" />
        <span className="truncate font-semibold text-[10px] uppercase tracking-[0.16em] text-text-secondary">
          Kura Desktop
        </span>
        <span className="hidden sm:inline text-[10px] text-text-muted">Local Media Studio</span>
      </div>
      <div className="flex min-w-0 items-center gap-2 font-sans">
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-u30-runtime-status
          data-u40d-library-status={attempt?.status ?? (librarySessionSnapshot.lastIndex ? 'loaded' : 'idle')}
          data-k2-library-state={state}
          className="k2-topbar__status u30-runtime-label flex min-w-0 items-center gap-2"
        >
          <span className="k2-topbar__status-dot" aria-hidden="true" />
          <span className="truncate">{status}</span>
        </span>
      </div>
    </header>
  );
}
