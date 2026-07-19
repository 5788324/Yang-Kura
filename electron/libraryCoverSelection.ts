export interface LibraryCoverCandidate {
  relativePath: string;
  collectionCandidate?: string;
  rjIdNorm?: string;
  sizeBytes?: number;
}

const EXPLICIT_COVER_WORDS = new Set([
  'cover',
  'folder',
  'front',
  'jacket',
  'scan',
  'package',
  'poster',
  'artwork',
  'album',
  'main',
  'thumb',
  'thumbnail',
  '封面',
  '表紙',
  'ジャケット',
]);

function normalizedBaseName(relativePath: string): string {
  const fileName = relativePath.replace(/\\/g, '/').split('/').pop() ?? relativePath;
  return fileName.replace(/\.[^.]+$/, '').trim().toLowerCase();
}

function normalizedIdentity(value?: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s._\-\[\](){}【】「」『』]+/g, '');
}

function collectionKeyFor(candidate: LibraryCoverCandidate): string {
  const normalizedPath = candidate.relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalizedPath.includes('/')) return 'root';
  return candidate.collectionCandidate || normalizedPath.split('/')[0] || 'root';
}

export function isExplicitCoverFileName(relativePath: string): boolean {
  const baseName = normalizedBaseName(relativePath);
  if (EXPLICIT_COVER_WORDS.has(baseName)) return true;
  if (/^(?:cover|front|folder|jacket|poster|artwork|thumb|thumbnail|package|scan)[\s._-]*\d*$/i.test(baseName)) return true;
  if (/^(?:rj|vj|bj)\d{5,10}$/i.test(baseName)) return true;
  return /(?:封面|表紙|ジャケット|cover|front|folder|jacket|poster|artwork|thumbnail)/i.test(baseName);
}

export function scoreLibraryCoverCandidate(candidate: LibraryCoverCandidate): number {
  const normalizedPath = candidate.relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalizedPath.split('/').filter(Boolean);
  const baseName = normalizedBaseName(normalizedPath);
  const collectionKey = collectionKeyFor(candidate);
  const baseIdentity = normalizedIdentity(baseName);
  const collectionIdentity = normalizedIdentity(collectionKey);
  const rjIdentity = normalizedIdentity(candidate.rjIdNorm);
  const extension = (normalizedPath.match(/\.([^.\/]+)$/)?.[1] ?? '').toLowerCase();
  let score = 0;

  if (isExplicitCoverFileName(normalizedPath)) score += 1_000;
  if (collectionIdentity && baseIdentity === collectionIdentity) score += 850;
  if (rjIdentity && (baseIdentity === rjIdentity || baseIdentity.includes(rjIdentity))) score += 800;
  if (segments.length <= 2) score += 420;
  else if (segments.length === 3) score += 240;
  else score -= Math.min(240, (segments.length - 3) * 40);

  if (extension === 'jpg' || extension === 'jpeg') score += 90;
  else if (extension === 'png' || extension === 'webp') score += 70;
  else if (extension === 'bmp') score += 20;

  const sizeBytes = Number(candidate.sizeBytes) || 0;
  if (sizeBytes > 0 && sizeBytes < 12 * 1024) score -= 320;
  else if (sizeBytes >= 80 * 1024 && sizeBytes <= 20 * 1024 * 1024) score += 80;
  else if (sizeBytes > 20 * 1024 * 1024) score -= 40;

  if (/(?:icon|logo|banner|button|sprite|sample[_-]?\d+)/i.test(baseName)) score -= 260;
  return score;
}

export function selectPrimaryCoverPaths(candidates: readonly LibraryCoverCandidate[]): Map<string, string> {
  const selected = new Map<string, { relativePath: string; score: number }>();
  for (const candidate of candidates) {
    const relativePath = candidate.relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!relativePath) continue;
    const key = collectionKeyFor(candidate);
    const score = scoreLibraryCoverCandidate({ ...candidate, relativePath });
    const current = selected.get(key);
    if (!current || score > current.score || (score === current.score && relativePath.localeCompare(current.relativePath) < 0)) {
      selected.set(key, { relativePath, score });
    }
  }
  return new Map(Array.from(selected, ([key, value]) => [key, value.relativePath]));
}
