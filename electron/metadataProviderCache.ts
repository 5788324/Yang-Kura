export interface MetadataProviderCacheHit<T> {
  hit: true;
  value: T;
  cachedAt: string;
  expiresAt: string;
  ageMs: number;
}

export interface MetadataProviderCacheMiss {
  hit: false;
}

export type MetadataProviderCacheRead<T> = MetadataProviderCacheHit<T> | MetadataProviderCacheMiss;

interface CacheEntry<T> {
  value: T;
  cachedAtMs: number;
  expiresAtMs: number;
}

export interface MetadataProviderThrottleState {
  allowed: boolean;
  retryAfterMs: number;
  lastRequestAt?: string;
  nextAllowedAt?: string;
}

export class MetadataProviderCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly lastNetworkRequests = new Map<string, number>();

  constructor(
    readonly ttlMs: number,
    readonly throttleMs: number,
  ) {
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new Error('cache ttl must be positive');
    if (!Number.isFinite(throttleMs) || throttleMs < 0) throw new Error('cache throttle must not be negative');
  }

  read(key: string, nowMs = Date.now()): MetadataProviderCacheRead<T> {
    const entry = this.entries.get(key);
    if (!entry) return { hit: false };
    if (entry.expiresAtMs <= nowMs) {
      this.entries.delete(key);
      return { hit: false };
    }
    return {
      hit: true,
      value: entry.value,
      cachedAt: new Date(entry.cachedAtMs).toISOString(),
      expiresAt: new Date(entry.expiresAtMs).toISOString(),
      ageMs: Math.max(0, nowMs - entry.cachedAtMs),
    };
  }

  write(key: string, value: T, nowMs = Date.now()): MetadataProviderCacheHit<T> {
    const entry: CacheEntry<T> = {
      value,
      cachedAtMs: nowMs,
      expiresAtMs: nowMs + this.ttlMs,
    };
    this.entries.set(key, entry);
    return {
      hit: true,
      value,
      cachedAt: new Date(entry.cachedAtMs).toISOString(),
      expiresAt: new Date(entry.expiresAtMs).toISOString(),
      ageMs: 0,
    };
  }

  getThrottleState(key: string, nowMs = Date.now()): MetadataProviderThrottleState {
    const lastRequestMs = this.lastNetworkRequests.get(key);
    if (lastRequestMs === undefined || this.throttleMs === 0) {
      return { allowed: true, retryAfterMs: 0 };
    }
    const nextAllowedMs = lastRequestMs + this.throttleMs;
    const retryAfterMs = Math.max(0, nextAllowedMs - nowMs);
    return {
      allowed: retryAfterMs === 0,
      retryAfterMs,
      lastRequestAt: new Date(lastRequestMs).toISOString(),
      nextAllowedAt: new Date(nextAllowedMs).toISOString(),
    };
  }

  recordNetworkRequest(key: string, nowMs = Date.now()): MetadataProviderThrottleState {
    this.lastNetworkRequests.set(key, nowMs);
    return this.getThrottleState(key, nowMs);
  }

  clear(key: string): boolean {
    return this.entries.delete(key);
  }

  clearAll(): number {
    const count = this.entries.size;
    this.entries.clear();
    return count;
  }
}
