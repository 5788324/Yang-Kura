import type { ReactNode } from 'react';

export interface AppShellProps {
  topbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  player?: ReactNode;
  overlay?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AppShell({
  topbar,
  sidebar,
  children,
  player,
  overlay,
  className = '',
  contentClassName = '',
}: AppShellProps) {
  return (
    <div className={`yk-app-shell ${className}`.trim()}>
      <header className="yk-app-shell__topbar">{topbar}</header>
      <div className="yk-app-shell__body">
        <aside className="yk-app-shell__sidebar">{sidebar}</aside>
        <main className={`yk-app-shell__content ${contentClassName}`.trim()}>{children}</main>
      </div>
      {player ? <footer className="yk-app-shell__player">{player}</footer> : null}
      {overlay}
    </div>
  );
}
