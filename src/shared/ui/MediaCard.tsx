import type { HTMLAttributes, Key, ReactNode } from 'react';

export interface MediaCardProps extends HTMLAttributes<HTMLElement> {
  key?: Key;
  title: string;
  subtitle?: string;
  visual?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  interactive?: boolean;
  className?: string;
}

export function MediaCard({
  title,
  subtitle,
  visual,
  meta,
  badges,
  actions,
  interactive = false,
  className = '',
  ...articleProps
}: MediaCardProps) {
  return (
    <article
      {...articleProps}
      data-interactive={interactive ? 'true' : 'false'}
      className={`yk-media-card ${className}`.trim()}
    >
      {visual ? <div className="yk-media-card__visual">{visual}</div> : null}
      <div className="yk-media-card__body">
        <h3 className="yk-media-card__title" title={title}>{title}</h3>
        {subtitle ? <p className="yk-media-card__subtitle" title={subtitle}>{subtitle}</p> : null}
        {meta ? <div className="yk-media-card__meta">{meta}</div> : null}
        {badges || actions ? (
          <div className="yk-media-card__footer">
            <div className="yk-media-card__badges">{badges}</div>
            <div className="yk-media-card__actions">{actions}</div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
