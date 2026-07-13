export interface TimeoutScheduler {
  set(callback: () => void, delayMs: number): unknown;
  clear(handle: unknown): void;
}

const defaultTimeoutScheduler: TimeoutScheduler = {
  set(callback, delayMs) {
    return globalThis.setTimeout(callback, delayMs);
  },
  clear(handle) {
    globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>);
  },
};

export interface ResettableTimeout {
  schedule(): void;
  cancel(): void;
  isPending(): boolean;
}

function normalizeDelay(delayMs: number): number {
  return Number.isFinite(delayMs) && delayMs > 0 ? delayMs : 0;
}

export function createResettableTimeout(
  callback: () => void,
  delayMs: number,
  scheduler: TimeoutScheduler = defaultTimeoutScheduler,
): ResettableTimeout {
  let handle: unknown | null = null;
  const safeDelay = normalizeDelay(delayMs);

  const cancel = () => {
    if (handle === null) return;
    scheduler.clear(handle);
    handle = null;
  };

  const schedule = () => {
    cancel();
    handle = scheduler.set(() => {
      handle = null;
      callback();
    }, safeDelay);
  };

  return {
    schedule,
    cancel,
    isPending: () => handle !== null,
  };
}
