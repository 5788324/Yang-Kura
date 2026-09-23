import crypto from 'node:crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { KuraCatalogDatabase } from '../catalog/catalogDatabase.js';
import type { ArtworkCacheRecord } from '../catalog/catalogTypes.js';

export interface ArtworkThumbnailSource {
  rootId: string;
  sourceRelativePath: string;
  sourceAbsolutePath: string;
  sizeBytes: number | null;
  mtimeMs: number | null;
}

export interface ArtworkThumbnailGenerationRequest {
  sourceAbsolutePath: string;
  outputAbsolutePath: string;
  maxDimension: number;
}

export interface ArtworkThumbnailGenerationResult {
  width: number;
  height: number;
  byteSize: number;
}

export type ArtworkThumbnailGenerator = (
  request: ArtworkThumbnailGenerationRequest,
) => Promise<ArtworkThumbnailGenerationResult>;

export interface ArtworkCacheResult extends ArtworkCacheRecord {
  cacheHit: boolean;
  cacheAbsolutePath: string;
}

interface QueueItem {
  source: ArtworkThumbnailSource;
  resolve: (result: ArtworkCacheResult) => void;
  reject: (error: unknown) => void;
}

function safeRelativePath(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\//, '');
  if (
    !normalized
    || path.isAbsolute(normalized)
    || /^[a-zA-Z]:\//.test(normalized)
    || normalized.startsWith('../')
    || normalized.includes('/../')
  ) {
    throw new Error('Unsafe artwork relative path.');
  }
  return normalized;
}

function errorCode(error: unknown): string {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return typeof code === 'string' && code ? code : error instanceof Error ? error.name : 'UNKNOWN';
}

export class ArtworkCacheService {
  private readonly queue: QueueItem[] = [];
  private readonly inFlight = new Map<string, Promise<ArtworkCacheResult>>();
  private active = 0;

  constructor(
    private readonly catalog: KuraCatalogDatabase,
    private readonly cacheRoot: string,
    private readonly generator: ArtworkThumbnailGenerator,
    private readonly concurrency = 2,
    private readonly maxDimension = 640,
  ) {}

  enqueue(source: ArtworkThumbnailSource): Promise<ArtworkCacheResult> {
    const relativePath = safeRelativePath(source.sourceRelativePath);
    const sourceKey = `${source.rootId}\0${relativePath}\0${source.sizeBytes ?? ''}\0${source.mtimeMs ?? ''}\0${this.maxDimension}`;
    const existing = this.inFlight.get(sourceKey);
    if (existing) return existing;

    let resolvePromise!: (result: ArtworkCacheResult) => void;
    let rejectPromise!: (error: unknown) => void;
    const promise = new Promise<ArtworkCacheResult>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    this.inFlight.set(sourceKey, promise);
    this.queue.push({
      source: { ...source, sourceRelativePath: relativePath },
      resolve: resolvePromise,
      reject: rejectPromise,
    });
    this.pump();
    promise.finally(() => this.inFlight.delete(sourceKey)).catch(() => undefined);
    return promise;
  }

  private pump(): void {
    const safeConcurrency = Math.max(1, Math.min(Math.trunc(this.concurrency), 8));
    while (this.active < safeConcurrency && this.queue.length) {
      const item = this.queue.shift()!;
      this.active += 1;
      this.build(item.source)
        .then(item.resolve, item.reject)
        .finally(() => {
          this.active -= 1;
          this.pump();
        });
    }
  }

  private async build(source: ArtworkThumbnailSource): Promise<ArtworkCacheResult> {
    const relativePath = safeRelativePath(source.sourceRelativePath);
    const cacheKey = crypto.createHash('sha256').update(
      `${source.rootId}\0${relativePath}\0${source.sizeBytes ?? ''}\0${source.mtimeMs ?? ''}\0${this.maxDimension}`,
    ).digest('hex');
    const cacheRelativePath = `v1/${cacheKey.slice(0, 2)}/${cacheKey}.png`;
    const cacheAbsolutePath = path.join(this.cacheRoot, ...cacheRelativePath.split('/'));
    const existing = this.catalog.getArtworkCacheRecord(source.rootId, relativePath);

    if (
      existing?.state === 'ready'
      && existing.cacheKey === cacheKey
      && existing.cacheRelativePath === cacheRelativePath
    ) {
      try {
        await fs.access(cacheAbsolutePath);
        return { ...existing, cacheHit: true, cacheAbsolutePath };
      } catch {
        // Cache metadata survived but the disposable file did not. Rebuild below.
      }
    }

    const updatedAt = new Date().toISOString();
    this.catalog.upsertArtworkCacheRecord({
      rootId: source.rootId,
      sourceRelativePath: relativePath,
      sourceSizeBytes: source.sizeBytes,
      sourceMtimeMs: source.mtimeMs,
      cacheKey,
      cacheRelativePath,
      width: null,
      height: null,
      byteSize: null,
      state: 'building',
      errorCode: null,
      updatedAt,
    });

    await fs.mkdir(path.dirname(cacheAbsolutePath), { recursive: true });
    const tempPath = `${cacheAbsolutePath}.${crypto.randomUUID()}.tmp`;
    try {
      const generated = await this.generator({
        sourceAbsolutePath: source.sourceAbsolutePath,
        outputAbsolutePath: tempPath,
        maxDimension: this.maxDimension,
      });
      await fs.rm(cacheAbsolutePath, { force: true });
      await fs.rename(tempPath, cacheAbsolutePath);

      const ready: ArtworkCacheRecord = {
        rootId: source.rootId,
        sourceRelativePath: relativePath,
        sourceSizeBytes: source.sizeBytes,
        sourceMtimeMs: source.mtimeMs,
        cacheKey,
        cacheRelativePath,
        width: generated.width,
        height: generated.height,
        byteSize: generated.byteSize,
        state: 'ready',
        errorCode: null,
        updatedAt: new Date().toISOString(),
      };
      this.catalog.upsertArtworkCacheRecord(ready);
      return { ...ready, cacheHit: false, cacheAbsolutePath };
    } catch (error) {
      await fs.rm(tempPath, { force: true }).catch(() => undefined);
      this.catalog.upsertArtworkCacheRecord({
        rootId: source.rootId,
        sourceRelativePath: relativePath,
        sourceSizeBytes: source.sizeBytes,
        sourceMtimeMs: source.mtimeMs,
        cacheKey,
        cacheRelativePath: null,
        width: null,
        height: null,
        byteSize: null,
        state: 'failed',
        errorCode: errorCode(error),
        updatedAt: new Date().toISOString(),
      });
      throw error;
    }
  }
}
