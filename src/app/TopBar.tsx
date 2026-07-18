import type { LibrarySessionSnapshot } from '../services/librarySessionService';

export interface TopBarProps {
  librarySessionSnapshot: LibrarySessionSnapshot;
}

export default function TopBar({ librarySessionSnapshot }: TopBarProps) {
  const selectedRootCount = Object.keys(librarySessionSnapshot.selectedRoots).length;
  const attempt = librarySessionSnapshot.lastReadAttempt;
  const status = attempt?.status === 'reading'
    ? '正在读取资源库…'
    : attempt?.status === 'timed-out'
      ? '读取等待超时，可重试'
      : attempt?.status === 'interrupted'
        ? '读取未完成，可重试'
        : attempt?.status === 'failed'
          ? '资源库读取失败'
          : librarySessionSnapshot.lastIndex
            ? `已加载 ${librarySessionSnapshot.lastIndex.trackCount} 条音轨`
            : selectedRootCount > 0
              ? '资源库待读取'
              : '尚未选择资源库';
  const tone = attempt?.status === 'reading'
    ? 'text-sky-500'
    : attempt && ['timed-out', 'interrupted', 'failed'].includes(attempt.status)
      ? 'text-amber-500'
      : librarySessionSnapshot.lastIndex
        ? 'text-emerald-500'
        : selectedRootCount > 0
          ? 'text-amber-500'
          : 'text-text-muted';
  const dot = attempt?.status === 'reading'
    ? 'bg-sky-500'
    : attempt && ['timed-out', 'interrupted', 'failed'].includes(attempt.status)
      ? 'bg-amber-500'
      : librarySessionSnapshot.lastIndex
        ? 'bg-emerald-500'
        : selectedRootCount > 0
          ? 'bg-amber-500'
          : 'bg-zinc-500';

  return (
    <header
      id="windows-app-bar"
      className="h-9 min-w-0 flex items-center justify-between gap-3 px-3 sm:px-4 bg-sidebar-bg/60 border-b border-border-color/60 text-xs text-text-secondary select-none z-50"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-color" />
        <span className="truncate font-semibold text-[11px] text-text-primary">Yang-Kura</span>
      </div>
      <div className="flex min-w-0 items-center gap-2 font-sans">
        <span
          data-u30-runtime-status
          data-u40d-library-status={attempt?.status ?? (librarySessionSnapshot.lastIndex ? 'loaded' : 'idle')}
          className={`${tone} u30-runtime-label flex min-w-0 items-center space-x-1 font-semibold text-[10px]`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
          <span>{status}</span>
        </span>
      </div>
    </header>
  );
}
