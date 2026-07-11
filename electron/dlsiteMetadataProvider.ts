import { net } from 'electron';
import { parseDlsiteProductPage, type DlsiteMetadataCandidate } from './dlsiteMetadataParser.js';
import { MetadataProviderCache } from './metadataProviderCache.js';
import { createProviderRequestDeadline, getProviderRequestRemainingMs } from './providerRequestDeadline.js';

export type DlsiteMetadataCacheMode = 'prefer-cache' | 'force-refresh';

export interface DlsiteMetadataRequest {
  provider: 'dlsite';
  rjId: string;
  mode: 'single-rj-preview';
  timeoutMs?: number;
  cacheMode?: DlsiteMetadataCacheMode;
}

export interface DlsiteMetadataCacheClearRequest {
  provider: 'dlsite';
  rjId: string;
  mode: 'clear-single-rj-cache';
}

export interface DlsiteMetadataCacheInfo {
  source: 'memory-cache' | 'network';
  cacheHit: boolean;
  cachedAt: string;
  expiresAt: string;
  ttlMs: number;
  nextNetworkAllowedAt?: string;
}

export type DlsiteMetadataResult =
  | {
      ok: true;
      status: 'mvp119-dlsite-single-rj-metadata-ready';
      provider: 'dlsite';
      requestedRjId: string;
      fetchedAt: string;
      candidate: DlsiteMetadataCandidate;
      cache: DlsiteMetadataCacheInfo;
      networkRequestPerformed: boolean;
      metadataWritePerformed: false;
      mediaFileMutationPerformed: false;
      absolutePathReturned: false;
      fileUrlReturned: false;
      message: string;
      safetyNotes: string[];
    }
  | {
      ok: false;
      status:
        | 'mvp119-dlsite-invalid-request'
        | 'mvp119-dlsite-throttled'
        | 'mvp119-dlsite-timeout'
        | 'mvp119-dlsite-not-found'
        | 'mvp119-dlsite-http-error'
        | 'mvp119-dlsite-network-error'
        | 'mvp119-dlsite-parse-error';
      provider: 'dlsite';
      requestedRjId: string;
      networkRequestPerformed: boolean;
      retryAfterMs?: number;
      nextNetworkAllowedAt?: string;
      cachedCandidateAvailable?: boolean;
      metadataWritePerformed: false;
      mediaFileMutationPerformed: false;
      absolutePathReturned: false;
      fileUrlReturned: false;
      message: string;
      safetyNotes: string[];
    };

export type DlsiteMetadataCacheClearResult =
  | {
      ok: true;
      status: 'mvp119-dlsite-cache-cleared';
      provider: 'dlsite';
      requestedRjId: string;
      cleared: boolean;
      metadataWritePerformed: false;
      mediaFileMutationPerformed: false;
      absolutePathReturned: false;
      fileUrlReturned: false;
      message: string;
      safetyNotes: string[];
    }
  | {
      ok: false;
      status: 'mvp119-dlsite-cache-clear-invalid-request';
      provider: 'dlsite';
      requestedRjId: string;
      cleared: false;
      metadataWritePerformed: false;
      mediaFileMutationPerformed: false;
      absolutePathReturned: false;
      fileUrlReturned: false;
      message: string;
      safetyNotes: string[];
    };

const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 12_000;
const MIN_TIMEOUT_MS = 3_000;
const MAX_TIMEOUT_MS = 25_000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const SAME_RJ_THROTTLE_MS = 5_000;
const ALLOWED_HOSTS = new Set(['www.dlsite.com', 'dlsite.com']);
const safetyNotes = [
  'single-rj-only',
  'official-dlsite-domain-only',
  'preview-only-no-auto-save',
  'short-lived-memory-cache',
  'same-rj-request-throttle',
  'single-query-total-deadline',
  'no-media-file-mutation',
  'no-absolute-path-or-file-url',
];
const dlsiteCache = new MetadataProviderCache<DlsiteMetadataCandidate>(CACHE_TTL_MS, SAME_RJ_THROTTLE_MS);

const normalizeRjId = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const match = value.toUpperCase().match(/RJ\s*0*(\d{5,10})/);
  return match ? `RJ${match[1].padStart(8, '0')}` : '';
};

const buildProductIds = (normalizedRjId: string): string[] => {
  const digits = normalizedRjId.slice(2);
  const compact = `RJ${digits.replace(/^0+(?=\d{5,})/, '')}`;
  return [...new Set([normalizedRjId, compact])];
};

const buildUrls = (normalizedRjId: string): string[] => {
  const sections = ['maniax', 'girls', 'home'];
  return buildProductIds(normalizedRjId).flatMap((productId) => sections.map((section) => `https://www.dlsite.com/${section}/work/=/product_id/${productId}.html/?locale=ja_JP`));
};

const safeStatusMessage = (status: number): string => {
  if (status === 403) return 'DLsite 拒绝了本次访问，可能需要年龄确认、地区验证或稍后重试。';
  if (status === 429) return 'DLsite 请求过于频繁，请稍后再试。';
  return `DLsite 返回 HTTP ${status}。`;
};

const readResponseText = async (response: Response): Promise<string> => {
  const contentLength = Number(response.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) throw new Error('response-too-large');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) throw new Error('response-too-large');
  return new TextDecoder('utf-8').decode(bytes);
};

const buildSuccessFromCache = (
  requestedRjId: string,
  cacheRead: Extract<ReturnType<typeof dlsiteCache.read>, { hit: true }>,
): DlsiteMetadataResult => {
  const throttle = dlsiteCache.getThrottleState(requestedRjId);
  return {
    ok: true,
    status: 'mvp119-dlsite-single-rj-metadata-ready',
    provider: 'dlsite',
    requestedRjId,
    fetchedAt: cacheRead.value.fetchedAt,
    candidate: cacheRead.value,
    cache: {
      source: 'memory-cache',
      cacheHit: true,
      cachedAt: cacheRead.cachedAt,
      expiresAt: cacheRead.expiresAt,
      ttlMs: CACHE_TTL_MS,
      nextNetworkAllowedAt: throttle.nextAllowedAt,
    },
    networkRequestPerformed: false,
    metadataWritePerformed: false,
    mediaFileMutationPerformed: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: '已使用这个 RJ 的短期缓存结果。需要重新访问 DLsite 时可点击“重新查询”。',
    safetyNotes,
  };
};

export async function fetchDlsiteMetadata(request: Partial<DlsiteMetadataRequest> | undefined): Promise<DlsiteMetadataResult> {
  const requestedRjId = normalizeRjId(request?.rjId);
  if (request?.provider !== 'dlsite' || request?.mode !== 'single-rj-preview' || !requestedRjId) {
    return { ok: false, status: 'mvp119-dlsite-invalid-request', provider: 'dlsite', requestedRjId, networkRequestPerformed: false, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: '请求必须指定 provider=dlsite、mode=single-rj-preview 和有效 RJ 号。', safetyNotes };
  }

  const cacheMode: DlsiteMetadataCacheMode = request.cacheMode === 'force-refresh' ? 'force-refresh' : 'prefer-cache';
  const cached = dlsiteCache.read(requestedRjId);
  if (cacheMode === 'prefer-cache' && cached.hit) return buildSuccessFromCache(requestedRjId, cached);

  const throttle = dlsiteCache.getThrottleState(requestedRjId);
  if (!throttle.allowed) {
    return {
      ok: false,
      status: 'mvp119-dlsite-throttled',
      provider: 'dlsite',
      requestedRjId,
      networkRequestPerformed: false,
      retryAfterMs: throttle.retryAfterMs,
      nextNetworkAllowedAt: throttle.nextAllowedAt,
      cachedCandidateAvailable: cached.hit,
      metadataWritePerformed: false,
      mediaFileMutationPerformed: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      message: `同一 RJ 查询过于频繁，请在 ${Math.max(1, Math.ceil(throttle.retryAfterMs / 1000))} 秒后重试。${cached.hit ? '当前预览仍可继续使用。' : ''}`,
      safetyNotes,
    };
  }

  dlsiteCache.recordNetworkRequest(requestedRjId);
  const timeoutMs = Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, Number(request?.timeoutMs) || DEFAULT_TIMEOUT_MS));
  const requestDeadline = createProviderRequestDeadline(timeoutMs);
  let lastHttpStatus = 0;
  let lastParseError = '';

  const buildTimeoutResult = (): DlsiteMetadataResult => ({
    ok: false,
    status: 'mvp119-dlsite-timeout',
    provider: 'dlsite',
    requestedRjId,
    networkRequestPerformed: true,
    cachedCandidateAvailable: cached.hit,
    metadataWritePerformed: false,
    mediaFileMutationPerformed: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: `DLsite 单次查询总耗时超过 ${Math.round(timeoutMs / 1000)} 秒，已停止。可粘贴标准 JSON 继续手动预览。`,
    safetyNotes,
  });

  for (const urlText of buildUrls(requestedRjId)) {
    const remainingMs = getProviderRequestRemainingMs(requestDeadline);
    if (remainingMs <= 0) return buildTimeoutResult();
    const url = new URL(urlText);
    if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) continue;
    try {
      const response = await net.fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(Math.max(1, remainingMs)),
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'ja-JP,ja;q=0.9,en;q=0.4',
          'user-agent': 'Yang-Kura/0.158 metadata preview (personal local library)',
        },
      });
      lastHttpStatus = response.status;
      if (response.status === 404) continue;
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          return { ok: false, status: 'mvp119-dlsite-http-error', provider: 'dlsite', requestedRjId, networkRequestPerformed: true, cachedCandidateAvailable: cached.hit, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: `${safeStatusMessage(response.status)} 可继续粘贴标准 JSON 进行手动预览。`, safetyNotes };
        }
        continue;
      }
      const finalUrl = new URL(response.url || url.toString());
      if (finalUrl.protocol !== 'https:' || !ALLOWED_HOSTS.has(finalUrl.hostname)) throw new Error('unexpected-redirect-host');
      const html = await readResponseText(response);
      try {
        const fetchedAt = new Date().toISOString();
        const candidate = parseDlsiteProductPage({ html, requestedRjId, sourceUrl: finalUrl.toString(), fetchedAt });
        const cacheWrite = dlsiteCache.write(requestedRjId, candidate);
        const nextThrottle = dlsiteCache.getThrottleState(requestedRjId);
        return {
          ok: true,
          status: 'mvp119-dlsite-single-rj-metadata-ready',
          provider: 'dlsite',
          requestedRjId,
          fetchedAt,
          candidate,
          cache: {
            source: 'network',
            cacheHit: false,
            cachedAt: cacheWrite.cachedAt,
            expiresAt: cacheWrite.expiresAt,
            ttlMs: CACHE_TTL_MS,
            nextNetworkAllowedAt: nextThrottle.nextAllowedAt,
          },
          networkRequestPerformed: true,
          metadataWritePerformed: false,
          mediaFileMutationPerformed: false,
          absolutePathReturned: false,
          fileUrlReturned: false,
          message: '已从 DLsite 官方作品页读取候选信息，并暂存 10 分钟。请先比较差异，再决定是否填入编辑表单。',
          safetyNotes,
        };
      } catch (error) {
        lastParseError = error instanceof Error ? error.message : String(error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/timeout|aborted|abort/i.test(message) || getProviderRequestRemainingMs(requestDeadline) <= 0) {
        return buildTimeoutResult();
      }
      if (message === 'response-too-large') {
        return { ok: false, status: 'mvp119-dlsite-http-error', provider: 'dlsite', requestedRjId, networkRequestPerformed: true, cachedCandidateAvailable: cached.hit, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: 'DLsite 返回内容超过 4 MB 安全上限。可粘贴标准 JSON 继续手动预览。', safetyNotes };
      }
      if (message === 'unexpected-redirect-host') {
        return { ok: false, status: 'mvp119-dlsite-network-error', provider: 'dlsite', requestedRjId, networkRequestPerformed: true, cachedCandidateAvailable: cached.hit, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: 'DLsite 请求跳转到了非白名单域名，已拒绝。可粘贴标准 JSON 继续手动预览。', safetyNotes };
      }
    }
  }

  if (lastParseError) {
    return { ok: false, status: 'mvp119-dlsite-parse-error', provider: 'dlsite', requestedRjId, networkRequestPerformed: true, cachedCandidateAvailable: cached.hit, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: `DLsite 页面已读取，但无法识别元数据：${lastParseError}。可粘贴标准 JSON 继续手动预览。`, safetyNotes };
  }
  return { ok: false, status: lastHttpStatus === 404 ? 'mvp119-dlsite-not-found' : 'mvp119-dlsite-network-error', provider: 'dlsite', requestedRjId, networkRequestPerformed: true, cachedCandidateAvailable: cached.hit, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: lastHttpStatus === 404 ? `DLsite 未找到 ${requestedRjId}。可粘贴标准 JSON 继续手动预览。` : '无法连接 DLsite 或所有作品页入口均未返回可用内容。可粘贴标准 JSON 继续手动预览。', safetyNotes };
}

export function clearDlsiteMetadataCache(request: Partial<DlsiteMetadataCacheClearRequest> | undefined): DlsiteMetadataCacheClearResult {
  const requestedRjId = normalizeRjId(request?.rjId);
  if (request?.provider !== 'dlsite' || request?.mode !== 'clear-single-rj-cache' || !requestedRjId) {
    return { ok: false, status: 'mvp119-dlsite-cache-clear-invalid-request', provider: 'dlsite', requestedRjId, cleared: false, metadataWritePerformed: false, mediaFileMutationPerformed: false, absolutePathReturned: false, fileUrlReturned: false, message: '清除缓存请求必须包含有效 RJ 号。', safetyNotes };
  }
  const cleared = dlsiteCache.clear(requestedRjId);
  return {
    ok: true,
    status: 'mvp119-dlsite-cache-cleared',
    provider: 'dlsite',
    requestedRjId,
    cleared,
    metadataWritePerformed: false,
    mediaFileMutationPerformed: false,
    absolutePathReturned: false,
    fileUrlReturned: false,
    message: cleared ? '已清除这个 RJ 的短期查询缓存。当前差异预览不会被删除。' : '这个 RJ 当前没有可清除的短期缓存。',
    safetyNotes,
  };
}
