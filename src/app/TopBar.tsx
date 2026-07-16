import type { LibrarySessionSnapshot } from '../services/librarySessionService';

export interface TopBarProps {
  librarySessionSnapshot: LibrarySessionSnapshot;
}

export default function TopBar({ librarySessionSnapshot }: TopBarProps) {
  const selectedRootCount = Object.keys(librarySessionSnapshot.selectedRoots).length;
  const status = librarySessionSnapshot.lastIndex
    ? `已加载 ${librarySessionSnapshot.lastIndex.trackCount} 条音轨`
    : selectedRootCount > 0
      ? '资源库待重新连接'
      : '尚未选择资源库';
  const tone = librarySessionSnapshot.lastIndex
    ? 'text-emerald-500'
    : selectedRootCount > 0
      ? 'text-amber-500'
      : 'text-text-muted';
  const dot = librarySessionSnapshot.lastIndex
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
          className={`${tone} u30-runtime-label flex min-w-0 items-center space-x-1 font-semibold text-[10px]`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
          <span>{status}</span>
        </span>
      </div>
    </header>
  );
}
