import type { Key, KeyboardEvent, ReactNode } from 'react';

export interface TrackRowProps {
  key?: Key;
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  duration?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  active?: boolean;
  onActivate?: () => void;
  className?: string;
}

export function TrackRow({
  title,
  subtitle,
  leading,
  duration,
  badges,
  actions,
  active = false,
  onActivate,
  className = '',
}: TrackRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onActivate || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onActivate();
  };


  const mainContent = (
    <>
      {leading ? <span className="yk-track-row__leading">{leading}</span> : null}
      <span className="yk-track-row__copy">
        <span className="yk-track-row__title" title={title}>{title}</span>
        {subtitle ? <span className="yk-track-row__subtitle" title={subtitle}>{subtitle}</span> : null}
      </span>
    </>
  );

  return (
    <div
      data-active={active ? 'true' : 'false'}
      data-track-row-activation={onActivate ? 'direct' : 'none'}
      className={`yk-track-row ${className}`.trim()}
    >
      {onActivate ? (
        <button type="button" className="yk-track-row__main" onClick={onActivate}>
          {mainContent}
        </button>
      ) : (
        <div className="yk-track-row__main" onKeyDown={handleKeyDown}>
          {mainContent}
        </div>
      )}
      <div className="yk-track-row__aside">
        {badges ? <div className="yk-track-row__badges">{badges}</div> : null}
        {duration ? <span>{duration}</span> : null}
        {actions ? <div className="yk-track-row__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
