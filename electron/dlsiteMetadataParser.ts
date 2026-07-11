export interface DlsiteMetadataCandidate {
  schemaVersion: 1;
  provider: 'dlsite';
  rjId: string;
  sourceLabel: string;
  sourceUrl: string;
  fetchedAt: string;
  title?: string;
  circle?: string;
  cvs?: string[];
  releaseDate?: string;
  description?: string;
  tags?: string[];
}

const decodeHtmlEntities = (value: string): string => value
  .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const cleanText = (value: unknown, maxLength = 5000): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const cleaned = decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\t\r ]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
    .trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
};

const uniqueList = (values: unknown[], maxItems = 50): string[] | undefined => {
  const cleaned = values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .flatMap((value) => typeof value === 'string' ? value.split(/[、,，|/\n]+/g) : [])
    .map((value) => cleanText(value, 120))
    .filter((value): value is string => Boolean(value))
    .filter((value) => !/^(なし|未設定|-|―)$/.test(value));
  const result = [...new Set(cleaned)].slice(0, maxItems);
  return result.length > 0 ? result : undefined;
};

const normalizeRjId = (value: string): string => {
  const match = value.toUpperCase().match(/RJ\s*0*(\d{5,10})/);
  return match ? `RJ${match[1].padStart(8, '0')}` : '';
};

const parseAttributes = (tag: string): Record<string, string> => {
  const attributes: Record<string, string> = {};
  const regex = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtmlEntities(match[2] ?? match[3] ?? '');
  }
  return attributes;
};

const extractMeta = (html: string, names: string[]): string | undefined => {
  const expected = new Set(names.map((name) => name.toLowerCase()));
  const regex = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    const attributes = parseAttributes(match[0]);
    const key = (attributes.property ?? attributes.name ?? '').toLowerCase();
    if (expected.has(key)) return cleanText(attributes.content);
  }
  return undefined;
};

const findLdProduct = (value: unknown): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findLdProduct(item);
      if (found) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const type = record['@type'];
  if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) return record;
  const graph = record['@graph'];
  return graph ? findLdProduct(graph) : undefined;
};

const extractJsonLdProduct = (html: string): Record<string, unknown> | undefined => {
  const regex = /<script\b[^>]*type\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    try {
      const product = findLdProduct(JSON.parse(match[1].trim()) as unknown);
      if (product) return product;
    } catch {
      // Ignore malformed structured data and fall back to page labels.
    }
  }
  return undefined;
};

const extractName = (value: unknown): string | undefined => {
  if (typeof value === 'string') return cleanText(value, 300);
  if (Array.isArray(value)) return value.map(extractName).filter(Boolean).join('、') || undefined;
  if (value && typeof value === 'object') return cleanText((value as Record<string, unknown>).name, 300);
  return undefined;
};

const extractLabeledSection = (html: string, labels: string[]): string | undefined => {
  const labelPattern = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const patterns = [
    new RegExp(`<th\\b[^>]*>[\\s\\S]*?(?:${labelPattern})[\\s\\S]*?<\\/th>\\s*<td\\b[^>]*>([\\s\\S]*?)<\\/td>`, 'i'),
    new RegExp(`<dt\\b[^>]*>[\\s\\S]*?(?:${labelPattern})[\\s\\S]*?<\\/dt>\\s*<dd\\b[^>]*>([\\s\\S]*?)<\\/dd>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return cleanText(match[1]);
  }
  return undefined;
};

const normalizeDate = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const match = value.match(/(19\d{2}|20\d{2})\D{0,3}(\d{1,2})\D{0,3}(\d{1,2})/);
  if (!match) return cleanText(value, 50);
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
};

const cleanTitle = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value
    .replace(/\s*[|｜-]\s*DLsite.*$/i, '')
    .replace(/\s*\[DLsite.*?\]\s*$/i, '')
    .trim() || undefined;
};

export function parseDlsiteProductPage(input: {
  html: string;
  requestedRjId: string;
  sourceUrl: string;
  fetchedAt?: string;
}): DlsiteMetadataCandidate {
  const rjId = normalizeRjId(input.requestedRjId);
  if (!rjId) throw new Error('RJ 号格式不正确。');
  if (!input.html || input.html.length < 200) throw new Error('DLsite 返回内容为空或过短。');

  const product = extractJsonLdProduct(input.html);
  const title = cleanTitle(extractName(product?.name) ?? extractMeta(input.html, ['og:title', 'twitter:title']) ?? extractLabeledSection(input.html, ['作品名', 'タイトル']));
  const circle = extractName(product?.brand) ?? extractName(product?.manufacturer) ?? extractName(product?.author) ?? extractLabeledSection(input.html, ['サークル名', 'ブランド', '作者']);
  const cvs = uniqueList([extractLabeledSection(input.html, ['声優', 'ボイス', 'CV']), product?.actor]);
  const releaseDate = normalizeDate(cleanText(product?.releaseDate, 80) ?? cleanText(product?.datePublished, 80) ?? extractLabeledSection(input.html, ['販売日', '配信開始日', '発売日']));
  const description = cleanText(product?.description, 5000) ?? extractMeta(input.html, ['og:description', 'description']);
  const tags = uniqueList([product?.keywords, product?.category, extractLabeledSection(input.html, ['ジャンル', '作品形式', 'カテゴリ'])]);

  if (!title && !circle && !cvs && !releaseDate && !description && !tags) {
    throw new Error('未能从 DLsite 页面识别作品字段，页面可能要求登录、年龄确认或结构已变化。');
  }

  return {
    schemaVersion: 1,
    provider: 'dlsite',
    rjId,
    sourceLabel: 'DLsite 官方作品页',
    sourceUrl: input.sourceUrl,
    fetchedAt: input.fetchedAt ?? new Date().toISOString(),
    ...(title ? { title } : {}),
    ...(circle ? { circle } : {}),
    ...(cvs ? { cvs } : {}),
    ...(releaseDate ? { releaseDate } : {}),
    ...(description ? { description } : {}),
    ...(tags ? { tags } : {}),
  };
}
