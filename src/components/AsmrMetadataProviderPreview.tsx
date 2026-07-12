import React, { useState } from 'react';
import { ClipboardPaste, CloudDownload, Eye, FileJson, LoaderCircle, RefreshCw, RotateCcw, Trash2, WandSparkles } from 'lucide-react';
import type { RJWork } from '../types';
import {
  asmrMetadataProviderPreviewService,
  type AsmrMetadataProviderCandidateV1,
  type AsmrMetadataProviderField,
  type AsmrMetadataProviderId,
  type AsmrMetadataProviderPreviewResult,
} from '../services/asmrMetadataProviderPreviewService';

interface AsmrMetadataProviderPreviewProps {
  work: RJWork;
  onApplyToDraft: (candidate: AsmrMetadataProviderCandidateV1, selectedFields: AsmrMetadataProviderField[]) => void;
}

interface ProviderRuntimeState {
  source: 'memory-cache' | 'network';
  cachedAt: string;
  expiresAt: string;
  fetchedAt: string;
  cacheCleared: boolean;
}

const PROVIDER_LABELS: Record<AsmrMetadataProviderId, string> = {
  dlsite: 'DLsite 查询结果',
  'asmr-one': 'ASMR.one 查询结果',
  custom: '其他来源',
};

const formatDateTime = (value?: string): string => {
  if (!value) return '未知';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function AsmrMetadataProviderPreview({ work, onApplyToDraft }: AsmrMetadataProviderPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [provider, setProvider] = useState<AsmrMetadataProviderId>('dlsite');
  const [rawJson, setRawJson] = useState('');
  const [preview, setPreview] = useState<AsmrMetadataProviderPreviewResult | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [fetchMessage, setFetchMessage] = useState('');
  const [providerRuntime, setProviderRuntime] = useState<ProviderRuntimeState | null>(null);
  const [selectedFields, setSelectedFields] = useState<AsmrMetadataProviderField[]>([]);
  const normalizedRjId = asmrMetadataProviderPreviewService.normalizeRjId(work.id);

  const setPreviewWithSelection = (nextPreview: AsmrMetadataProviderPreviewResult) => {
    setPreview(nextPreview);
    setSelectedFields(nextPreview.ok ? nextPreview.diffs.filter((item) => item.changed).map((item) => item.field) : []);
  };

  const toggleSelectedField = (field: AsmrMetadataProviderField) => {
    setSelectedFields((current) => current.includes(field)
      ? current.filter((item) => item !== field)
      : [...current, field]);
  };

  const reset = () => {
    setRawJson('');
    setPreview(null);
    setFetchMessage('');
    setProviderRuntime(null);
    setSelectedFields([]);
  };

  const fetchFromDlsite = async (forceRefresh: boolean) => {
    if (!window.yangKura?.requestAsmrMetadataProvider) {
      setFetchMessage('真实查询只在 Electron 桌面版可用。仍可粘贴标准 JSON 进行手动预览。');
      return;
    }
    setIsFetching(true);
    setFetchMessage(forceRefresh ? '正在重新查询 DLsite 官方作品页…' : '正在读取 DLsite 候选信息…');
    try {
      const result = await window.yangKura.requestAsmrMetadataProvider({
        provider: 'dlsite',
        rjId: normalizedRjId,
        mode: 'single-rj-preview',
        timeoutMs: 12_000,
        cacheMode: forceRefresh ? 'force-refresh' : 'prefer-cache',
      });
      setFetchMessage(result.message);
      if (result.ok) {
        const json = JSON.stringify(result.candidate, null, 2);
        setRawJson(json);
        setProvider('dlsite');
        setPreviewWithSelection(asmrMetadataProviderPreviewService.preview(work, json));
        setProviderRuntime({
          source: result.cache.source,
          cachedAt: result.cache.cachedAt,
          expiresAt: result.cache.expiresAt,
          fetchedAt: result.fetchedAt,
          cacheCleared: false,
        });
      }
    } catch (error) {
      setFetchMessage(`DLsite 查询失败：${error instanceof Error ? error.message : String(error)}。仍可粘贴标准 JSON 进行手动预览。`);
    } finally {
      setIsFetching(false);
    }
  };

  const clearDlsiteCache = async () => {
    if (!window.yangKura?.clearAsmrMetadataProviderCache) {
      setFetchMessage('缓存管理只在 Electron 桌面版可用。');
      return;
    }
    setIsClearingCache(true);
    try {
      const result = await window.yangKura.clearAsmrMetadataProviderCache({
        provider: 'dlsite',
        rjId: normalizedRjId,
        mode: 'clear-single-rj-cache',
      });
      setFetchMessage(result.message);
      if (result.ok) {
        setProviderRuntime((current) => current ? { ...current, cacheCleared: true } : null);
      }
    } catch (error) {
      setFetchMessage(`清除缓存失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsClearingCache(false);
    }
  };

  const messageIsPositive = fetchMessage.includes('已从 DLsite')
    || fetchMessage.includes('已使用')
    || fetchMessage.includes('正在')
    || fetchMessage.includes('已清除')
    || fetchMessage.includes('没有可清除');

  return (
    <section className="border-t border-white/5 pt-3" data-testid="mvp117-single-rj-provider-preview" data-mvp119-provider-cache-throttle="true">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center justify-between rounded-xl border border-white/5 bg-zinc-950/60 px-3.5 py-3 text-left hover:border-indigo-500/30 transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <WandSparkles className="w-4 h-4 text-indigo-400" />
          <span>
            <span className="block text-xs font-semibold text-text-primary">预览外部作品信息</span>
            <span className="block mt-0.5 text-[10px] text-text-muted">单个 RJ 查询使用短期缓存，比较后再决定是否填入表单</span>
          </span>
        </span>
        <span className="text-[10px] text-text-muted">{expanded ? '收起' : '展开'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.035] p-3.5">
          <div className="rounded-lg bg-black/20 px-3 py-2 text-[10px] leading-5 text-text-muted">
            DLsite 查询结果在 Electron 进程内暂存 10 分钟；同一 RJ 的联网请求至少间隔 5 秒。查询结果只用于差异预览，失败时仍可粘贴标准 JSON，不会自动保存或修改媒体文件。
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value as AsmrMetadataProviderId)}
              className="min-w-0 rounded-lg border border-white/5 bg-zinc-950 px-3 py-2 text-xs text-text-primary outline-none focus:border-indigo-500/50"
              aria-label="元数据来源"
            >
              {Object.entries(PROVIDER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => {
                setRawJson(asmrMetadataProviderPreviewService.buildTemplate(work, provider));
                setPreview(null);
                setSelectedFields([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-text-secondary hover:text-text-primary"
            >
              <FileJson className="h-3.5 w-3.5" />
              JSON 模板
            </button>
          </div>

          <textarea
            value={rawJson}
            onChange={(event) => {
              setRawJson(event.target.value);
              setPreview(null);
              setSelectedFields([]);
            }}
            rows={8}
            spellCheck={false}
            placeholder={'粘贴标准化 JSON，例如：\n{"schemaVersion":1,"provider":"dlsite","rjId":"RJ01234567","title":"作品标题"}'}
            className="w-full resize-y rounded-xl border border-white/5 bg-zinc-950 px-3.5 py-3 font-mono text-[11px] leading-5 text-text-primary outline-none focus:border-indigo-500/50"
            aria-label="单个 RJ 元数据查询结果 JSON"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fetchFromDlsite(false)}
              disabled={provider !== 'dlsite' || isFetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-[11px] font-semibold text-indigo-200 hover:bg-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isFetching ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CloudDownload className="h-3.5 w-3.5" />}
              {isFetching ? '查询中…' : '查询（优先缓存）'}
            </button>
            <button
              type="button"
              onClick={() => fetchFromDlsite(true)}
              disabled={provider !== 'dlsite' || isFetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              重新查询
            </button>
            <button
              type="button"
              onClick={clearDlsiteCache}
              disabled={provider !== 'dlsite' || isClearingCache}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-text-secondary hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isClearingCache ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              清除缓存
            </button>
            <button
              type="button"
              onClick={() => setPreviewWithSelection(asmrMetadataProviderPreviewService.preview(work, rawJson))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-[11px] font-semibold text-white hover:bg-indigo-400"
            >
              <Eye className="h-3.5 w-3.5" />
              生成差异预览
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              清空当前内容
            </button>
          </div>

          {providerRuntime && (
            <div className="grid gap-1 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] text-text-muted sm:grid-cols-2">
              <span>最近查询：{formatDateTime(providerRuntime.fetchedAt)}</span>
              <span>结果来源：{providerRuntime.source === 'memory-cache' ? '短期缓存' : 'DLsite 网络'}</span>
              <span>缓存写入：{formatDateTime(providerRuntime.cachedAt)}</span>
              <span>{providerRuntime.cacheCleared ? '缓存已清除，当前预览仍保留' : `缓存有效至：${formatDateTime(providerRuntime.expiresAt)}`}</span>
            </div>
          )}

          {fetchMessage && (
            <div className={`rounded-lg border px-3 py-2 text-[10px] leading-5 ${messageIsPositive ? 'border-indigo-500/20 bg-indigo-500/[0.04] text-indigo-200' : 'border-amber-500/20 bg-amber-500/[0.04] text-amber-200'}`}>
              {fetchMessage}
              {!messageIsPositive && <div className="mt-1 text-text-muted">联网不可用时，可使用上方 JSON 模板粘贴单个 RJ 的标准化结果。</div>}
            </div>
          )}

          {preview && (
            <div className={`rounded-xl border p-3 ${preview.ok ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : 'border-rose-500/20 bg-rose-500/[0.04]'}`}>
              <div className={`text-[11px] font-semibold ${preview.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{preview.message}</div>
              {preview.ok && preview.candidate && (
                <>
                  {(preview.candidate.sourceLabel || preview.candidate.fetchedAt) && <div className="mt-2 text-[10px] text-text-muted">来源：{preview.candidate.sourceLabel ?? preview.candidate.provider}{preview.candidate.fetchedAt ? ` · ${formatDateTime(preview.candidate.fetchedAt)}` : ''}</div>}
                  <div className="mt-3 grid grid-cols-[28px_72px_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-2.5 text-[9px] font-semibold text-text-muted">
                    <span>选择</span><span>字段</span><span>本地当前值</span><span>外部候选值</span>
                  </div>
                  <div className="mt-1.5 space-y-1.5" data-testid="mvp121-provider-field-selection">
                    {preview.diffs.map((diff) => (
                      <div key={diff.field} className="grid grid-cols-[28px_72px_minmax(0,1fr)_minmax(0,1fr)] gap-2 rounded-lg bg-black/20 px-2.5 py-2 text-[10px]">
                        <label className="flex items-start pt-0.5">
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(diff.field)}
                            disabled={!diff.changed}
                            onChange={() => toggleSelectedField(diff.field)}
                            aria-label={`选择${diff.label}候选值`}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-950 accent-emerald-500 disabled:opacity-30"
                          />
                        </label>
                        <span className="font-semibold text-text-secondary">{diff.label}</span>
                        <div className="min-w-0 break-words text-text-muted">{diff.currentValue || '未填写'}</div>
                        <div className={`min-w-0 break-words ${diff.changed ? 'text-emerald-300' : 'text-text-secondary'}`}>{diff.candidateValue || '未填写'}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-mvp117-legacy-label="填入当前编辑表单（尚未保存）"
                      disabled={selectedFields.length === 0}
                      onClick={() => {
                        const selectedCandidate = asmrMetadataProviderPreviewService.selectCandidateFields(preview.candidate!, selectedFields);
                        onApplyToDraft(selectedCandidate, selectedFields);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ClipboardPaste className="h-3.5 w-3.5" />
                      填入已选 {selectedFields.length} 项（尚未保存）
                    </button>
                    <span className="text-[10px] text-text-muted">默认选择所有有差异的字段，可逐项取消。</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
