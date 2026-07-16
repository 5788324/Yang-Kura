import type { ReactNode } from 'react';

export interface AppShellProps {
  topbar?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  player?: ReactNode;
  overlay?: ReactNode;
  className?: string;
  contentClassName?: string;
  bridge?: boolean;
}

export function AppShell({
  topbar,
  sidebar,
  children,
  player,
  overlay,
  className = '',
  contentClassName = '',
  bridge = false,
}: AppShellProps) {
  if (bridge) {
    return (
      <div
        data-yk-app-shell="beta2-production-bridge"
        className={`yk-app-shell yk-app-shell--bridge ${className}`.trim()}
      >
        {children}
        {overlay}
      </div>
    );
  }

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
