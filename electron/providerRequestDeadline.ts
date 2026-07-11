export interface ProviderRequestDeadline {
  startedAtMs: number;
  deadlineAtMs: number;
  totalTimeoutMs: number;
}

export const createProviderRequestDeadline = (totalTimeoutMs: number, nowMs = Date.now()): ProviderRequestDeadline => {
  const normalizedTimeoutMs = Math.max(1, Math.trunc(totalTimeoutMs));
  return {
    startedAtMs: nowMs,
    deadlineAtMs: nowMs + normalizedTimeoutMs,
    totalTimeoutMs: normalizedTimeoutMs,
  };
};

export const getProviderRequestRemainingMs = (deadline: ProviderRequestDeadline, nowMs = Date.now()): number =>
  Math.max(0, deadline.deadlineAtMs - nowMs);
