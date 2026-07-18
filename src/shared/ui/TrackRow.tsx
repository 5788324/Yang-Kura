import type { Key, KeyboardEvent, MouseEvent, ReactNode } from 'react';

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

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!onActivate) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('.yk-track-row__main, .u37c-track-play')) return;
    event.preventDefault();
    event.stopPropagation();
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
      data-track-row-activation={onActivate ? 'captured' : 'none'}
      className={`yk-track-row ${className}`.trim()}
      onClickCapture={handleClickCapture}
    >
      {onActivate ? (
        <button type="button" className="yk-track-row__main">
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
