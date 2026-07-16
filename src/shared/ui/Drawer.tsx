import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
  onClose: () => void;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Drawer({
  open,
  title,
  description,
  children,
  footer,
  side = 'right',
  onClose,
  closeOnBackdrop = true,
  className = '',
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusTarget = drawerRef.current?.querySelector<HTMLElement>(
      '[autofocus], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    window.requestAnimationFrame(() => (focusTarget ?? drawerRef.current)?.focus());

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
    <div className="yk-drawer-backdrop" onMouseDown={handleBackdropClick}>
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        data-side={side}
        className={`yk-drawer ${className}`.trim()}
      >
        <header className="yk-drawer__header">
          <h2 id={titleId} className="yk-drawer__title">{title}</h2>
          {description ? (
            <p id={descriptionId} className="yk-drawer__description">{description}</p>
          ) : null}
        </header>
        <div className="yk-drawer__body">{children}</div>
        {footer ? <footer className="yk-drawer__footer">{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  );
}
