import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

/**
 * A custom hook that provides a stateful value synced to localStorage.
 * Automatically handles serialization/deserialization with robust error catching.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (value: T) => T,
): [T, Dispatch<SetStateAction<T>>] {
  // Get initial state from localStorage or use initialValue
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        const safeValue = sanitize ? sanitize(parsed) : parsed;
        if (sanitize && JSON.stringify(safeValue) !== JSON.stringify(parsed)) {
          window.localStorage.setItem(key, JSON.stringify(safeValue));
        }
        return safeValue;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return sanitize ? sanitize(initialValue) : initialValue;
  });

  const setSafeState = useCallback<Dispatch<SetStateAction<T>>>(
    (value) => {
      setState((previous) => {
        const next = typeof value === 'function'
          ? (value as (previousState: T) => T)(previous)
          : value;
        return sanitize ? sanitize(next) : next;
      });
    },
    [sanitize],
  );

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setSafeState];
}
