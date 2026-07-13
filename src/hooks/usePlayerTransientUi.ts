import { useCallback, useEffect, useMemo, useState } from 'react';
import { createResettableTimeout } from '../player/transientUiTimers';

export const PLAYER_VOLUME_HIDE_DELAY_MS = 800;
export const PLAYER_TOAST_DURATION_MS = 2500;

export function useDelayedVisibility(delayMs = PLAYER_VOLUME_HIDE_DELAY_MS) {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimer = useMemo(
    () => createResettableTimeout(() => setIsVisible(false), delayMs),
    [delayMs],
  );

  useEffect(() => () => hideTimer.cancel(), [hideTimer]);

  const show = useCallback(() => {
    hideTimer.cancel();
    setIsVisible(true);
  }, [hideTimer]);

  const scheduleHide = useCallback(() => {
    hideTimer.schedule();
  }, [hideTimer]);

  const hideImmediately = useCallback(() => {
    hideTimer.cancel();
    setIsVisible(false);
  }, [hideTimer]);

  return {
    isVisible,
    show,
    scheduleHide,
    hideImmediately,
  };
}

export function useAutoDismissMessage(delayMs = PLAYER_TOAST_DURATION_MS) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return undefined;

    const dismissTimer = createResettableTimeout(() => setMessage(null), delayMs);
    dismissTimer.schedule();
    return () => dismissTimer.cancel();
  }, [message, delayMs]);

  const showMessage = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    showMessage,
    clearMessage,
  };
}
