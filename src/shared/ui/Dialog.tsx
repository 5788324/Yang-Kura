import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Dialog({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  className = '',
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusTarget = dialogRef.current?.querySelector<HTMLElement>(
      '[autofocus], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    window.requestAnimationFrame(() => (focusTarget ?? dialogRef.current)?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.requestAnimationFrame(() => previousFocusRef.current?.focus({ preventScroll: true }));
    };
  }, [onClose, open]);

  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="yk-dialog-backdrop" onMouseDown={handleBackdropClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`yk-dialog ${className}`.trim()}
      >
        <header className="yk-dialog__header">
          <h2 id={titleId} className="yk-dialog__title">{title}</h2>
          {description ? (
            <p id={descriptionId} className="yk-dialog__description">{description}</p>
          ) : null}
        </header>
        <div className="yk-dialog__body">{children}</div>
        {footer ? <footer className="yk-dialog__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
