import type { RJWork } from '../types';

export type AsmrMetadataProviderId = 'dlsite' | 'asmr-one' | 'custom';
export type AsmrMetadataProviderField = 'title' | 'circle' | 'cvs' | 'releaseDate' | 'description' | 'tags';

export interface AsmrMetadataProviderCandidateV1 {
  schemaVersion: 1;
  provider: AsmrMetadataProviderId;
  rjId: string;
  sourceLabel?: string;
  sourceUrl?: string;
  fetchedAt?: string;
  title?: string;
  circle?: string;
  cvs?: string[];
  releaseDate?: string;
  description?: string;
  tags?: string[];
}

export interface AsmrMetadataProviderFieldDiff {
  field: AsmrMetadataProviderField;
  label: string;
  currentValue: string;
  candidateValue: string;
  changed: boolean;
}

export interface AsmrMetadataProviderPreviewResult {
  ok: boolean;
  message: string;
  candidate?: AsmrMetadataProviderCandidateV1;
  diffs: AsmrMetadataProviderFieldDiff[];
  changedFieldCount: number;
}

const PROVIDERS = new Set<AsmrMetadataProviderId>(['dlsite', 'asmr-one', 'custom']);

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  return cleaned || undefined;
};

const cleanStringList = (value: unknown): string[] | undefined => {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,，]/g)
      : [];
  const cleaned = [...new Set(source.map((item) => cleanText(item)).filter((item): item is string => Boolean(item)))];
  return cleaned.length > 0 ? cleaned : undefined;
};

const normalizeRjId = (value: unknown): string => {
  const text = cleanText(value)?.toUpperCase() ?? '';
  const digits = text.match(/(?:RJ)?0*(\d{5,10})/)?.[1];
  return digits ? `RJ${digits.padStart(8, '0')}` : text;
};

const formatList = (value: string[] | undefined): string => value?.join('、') ?? '';

const PROVIDER_FIELD_ORDER: AsmrMetadataProviderField[] = ['title', 'circle', 'cvs', 'releaseDate', 'description', 'tags'];

const selectCandidateFields = (
  candidate: AsmrMetadataProviderCandidateV1,
  fields: AsmrMetadataProviderField[],
): AsmrMetadataProviderCandidateV1 => {
  const selected = new Set(fields);
  return {
    schemaVersion: 1,
    provider: candidate.provider,
    rjId: candidate.rjId,
    ...(candidate.sourceLabel ? { sourceLabel: candidate.sourceLabel } : {}),
    ...(candidate.sourceUrl ? { sourceUrl: candidate.sourceUrl } : {}),
    ...(candidate.fetchedAt ? { fetchedAt: candidate.fetchedAt } : {}),
    ...(selected.has('title') && candidate.title !== undefined ? { title: candidate.title } : {}),
    ...(selected.has('circle') && candidate.circle !== undefined ? { circle: candidate.circle } : {}),
    ...(selected.has('cvs') && candidate.cvs !== undefined ? { cvs: candidate.cvs } : {}),
    ...(selected.has('releaseDate') && candidate.releaseDate !== undefined ? { releaseDate: candidate.releaseDate } : {}),
    ...(selected.has('description') && candidate.description !== undefined ? { description: candidate.description } : {}),
    ...(selected.has('tags') && candidate.tags !== undefined ? { tags: candidate.tags } : {}),
  };
};


const sanitizeCandidate = (value: unknown): AsmrMetadataProviderCandidateV1 => {
  if (!value || typeof value !== 'object') throw new Error('查询结果必须是 JSON 对象。');
  const source = value as Record<string, unknown>;
  if (source.schemaVersion !== 1) throw new Error('查询结果需要 schemaVersion=1。');
  const provider = cleanText(source.provider) as AsmrMetadataProviderId | undefined;
  if (!provider || !PROVIDERS.has(provider)) throw new Error('provider 只支持 dlsite、asmr-one 或 custom。');
  const rjId = normalizeRjId(source.rjId);
  if (!rjId) throw new Error('查询结果缺少 rjId。');

  return {
    schemaVersion: 1,
    provider,
    rjId,
    ...(cleanText(source.sourceLabel) ? { sourceLabel: cleanText(source.sourceLabel) } : {}),
    ...(cleanText(source.sourceUrl) ? { sourceUrl: cleanText(source.sourceUrl) } : {}),
    ...(cleanText(source.fetchedAt) ? { fetchedAt: cleanText(source.fetchedAt) } : {}),
    ...(cleanText(source.title) ? { title: cleanText(source.title) } : {}),
    ...(cleanText(source.circle) ? { circle: cleanText(source.circle) } : {}),
    ...(cleanStringList(source.cvs) ? { cvs: cleanStringList(source.cvs) } : {}),
    ...(cleanText(source.releaseDate) ? { releaseDate: cleanText(source.releaseDate) } : {}),
    ...(cleanText(source.description) ? { description: cleanText(source.description) } : {}),
    ...(cleanStringList(source.tags) ? { tags: cleanStringList(source.tags) } : {}),
  };
};

const buildDiffs = (work: RJWork, candidate: AsmrMetadataProviderCandidateV1): AsmrMetadataProviderFieldDiff[] => {
  const rows: Array<[AsmrMetadataProviderField, string, string, string | undefined]> = [
    ['title', '作品标题', work.title, candidate.title],
    ['circle', '制作社团', work.circle, candidate.circle],
    ['cvs', '声优', formatList(work.cvs), candidate.cvs ? formatList(candidate.cvs) : undefined],
    ['releaseDate', '发售日期', work.releaseDate, candidate.releaseDate],
    ['description', '作品简介', work.description ?? '', candidate.description],
    ['tags', '标签', formatList(work.tags), candidate.tags ? formatList(candidate.tags) : undefined],
  ];
  return rows
    .filter(([, , , incoming]) => incoming !== undefined)
    .map(([field, label, currentValue, candidateValue]) => ({
      field,
      label,
      currentValue,
      candidateValue: candidateValue ?? '',
      changed: currentValue.trim() !== (candidateValue ?? '').trim(),
    }));
};

export const asmrMetadataProviderPreviewService = {
  normalizeRjId,
  providerFields: PROVIDER_FIELD_ORDER,
  selectCandidateFields,

  buildTemplate(work: RJWork, provider: AsmrMetadataProviderId = 'custom'): string {
    return JSON.stringify({
      schemaVersion: 1,
      provider,
      rjId: normalizeRjId(work.id),
      title: '',
      circle: '',
      cvs: [],
      releaseDate: '',
      description: '',
      tags: [],
    }, null, 2);
  },

  preview(work: RJWork, raw: string): AsmrMetadataProviderPreviewResult {
    if (!raw.trim()) return { ok: false, message: '请先粘贴单个 RJ 的查询结果。', diffs: [], changedFieldCount: 0 };
    try {
      const candidate = sanitizeCandidate(JSON.parse(raw) as unknown);
      if (normalizeRjId(candidate.rjId) !== normalizeRjId(work.id)) {
        return {
          ok: false,
          message: `RJ 号不一致：当前为 ${normalizeRjId(work.id)}，查询结果为 ${normalizeRjId(candidate.rjId)}。`,
          diffs: [],
          changedFieldCount: 0,
        };
      }
      const diffs = buildDiffs(work, candidate);
      if (diffs.length === 0) {
        return { ok: false, message: '查询结果没有可预览的元数据字段。', candidate, diffs: [], changedFieldCount: 0 };
      }
      const changedFieldCount = diffs.filter((item) => item.changed).length;
      return {
        ok: true,
        message: changedFieldCount > 0 ? `已识别 ${diffs.length} 个字段，其中 ${changedFieldCount} 项与当前记录不同。` : '查询结果与当前记录一致。',
        candidate,
        diffs,
        changedFieldCount,
      };
    } catch (error) {
      return {
        ok: false,
        message: `无法生成预览：${error instanceof Error ? error.message : String(error)}`,
        diffs: [],
        changedFieldCount: 0,
      };
    }
  },
};
