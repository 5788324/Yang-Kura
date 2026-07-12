const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type ActiveDialog = {
  panel: HTMLElement;
  previousFocus: HTMLElement | null;
  keydownHandler: (event: KeyboardEvent) => void;
};

const activeDialogs = new Map<HTMLElement, ActiveDialog>();
let installed = false;
let generatedId = 0;

const nextId = (prefix: string) => `${prefix}-${++generatedId}`;

const isVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && !element.hasAttribute('hidden')
    && (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
};

const getFocusableElements = (panel: HTMLElement) => Array.from(
  panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
).filter(isVisible);

const getElementAndDescendants = <T extends Element>(root: ParentNode, selector: string) => {
  const matches: T[] = [];
  if (root instanceof Element && root.matches(selector)) matches.push(root as T);
  matches.push(...Array.from(root.querySelectorAll<T>(selector)));
  return matches;
};

const ensureIconButtonNames = (root: ParentNode) => {
  getElementAndDescendants<HTMLButtonElement>(root, 'button').forEach((button) => {
    if (button.getAttribute('aria-label') || button.getAttribute('aria-labelledby')) return;
    if ((button.textContent ?? '').trim()) return;

    const title = button.getAttribute('title')?.trim();
    if (title) {
      button.setAttribute('aria-label', title);
      return;
    }

    if (button.querySelector('svg.lucide-x')) {
      button.setAttribute('aria-label', '关闭对话框');
    }
  });
};

const ensureFormLabelAssociations = (root: ParentNode) => {
  getElementAndDescendants<HTMLLabelElement>(root, 'label').forEach((label) => {
    if (label.htmlFor || label.querySelector('input, textarea, select')) return;

    const control = label.parentElement?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select',
    );
    if (!control) return;

    if (!control.id) control.id = nextId('yang-kura-control');
    label.htmlFor = control.id;
  });
};

const getCloseButton = (panel: HTMLElement) => {
  const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
  return buttons.find((button) => button.querySelector('svg.lucide-x'))
    ?? buttons.find((button) => /^(取消|关闭)$/.test((button.textContent ?? '').trim()))
    ?? null;
};

const findDialogPanels = (root: ParentNode) => {
  const overlays = getElementAndDescendants<HTMLElement>(root, '.fixed.inset-0');
  return overlays
    .map((overlay) => Array.from(overlay.children).find((child): child is HTMLElement => child instanceof HTMLElement) ?? null)
    .filter((panel): panel is HTMLElement => Boolean(panel?.querySelector(FOCUSABLE_SELECTOR)));
};

const cleanupDetachedDialogs = () => {
  activeDialogs.forEach((dialog, panel) => {
    if (document.contains(panel)) return;
    panel.removeEventListener('keydown', dialog.keydownHandler);
    activeDialogs.delete(panel);
    if (dialog.previousFocus && document.contains(dialog.previousFocus)) {
      dialog.previousFocus.focus({ preventScroll: true });
    }
  });
};

const upgradeDialog = (panel: HTMLElement) => {
  if (activeDialogs.has(panel)) return;

  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  const heading = panel.querySelector<HTMLElement>('h1, h2, h3');
  if (heading) {
    if (!heading.id) heading.id = nextId('yang-kura-dialog-title');
    panel.setAttribute('aria-labelledby', heading.id);
  } else if (!panel.getAttribute('aria-label')) {
    panel.setAttribute('aria-label', '对话框');
  }

  const closeButton = getCloseButton(panel);
  if (closeButton && !closeButton.getAttribute('aria-label')) {
    closeButton.setAttribute('aria-label', '关闭对话框');
  }

  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const keydownHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeButton) {
      event.preventDefault();
      closeButton.click();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!panel.hasAttribute('tabindex')) panel.tabIndex = -1;
  panel.addEventListener('keydown', keydownHandler);
  activeDialogs.set(panel, { panel, previousFocus, keydownHandler });

  window.requestAnimationFrame(() => {
    if (!document.contains(panel)) return;
    const firstFocusable = getFocusableElements(panel)[0];
    (firstFocusable ?? panel).focus({ preventScroll: true });
  });
};

const scanAccessibility = (root: ParentNode) => {
  ensureIconButtonNames(root);
  ensureFormLabelAssociations(root);
  findDialogPanels(root).forEach(upgradeDialog);
};

export const installRuntimeAccessibility = () => {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  scanAccessibility(document);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) scanAccessibility(node);
      });
    });
    cleanupDetachedDialogs();
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
