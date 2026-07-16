import type { ReactNode } from 'react';

export type FeedbackTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface FeedbackProps {
  title: string;
  description?: string;
  tone?: FeedbackTone;
  action?: ReactNode;
  className?: string;
}

export function Feedback({
  title,
  description,
  tone = 'neutral',
  action,
  className = '',
}: FeedbackProps) {
  return (
    <section
      role={tone === 'danger' ? 'alert' : 'status'}
      data-tone={tone}
      className={`yk-feedback ${className}`.trim()}
    >
      <div>
        <h3 className="yk-feedback__title">{title}</h3>
        {description ? <p className="yk-feedback__description">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
