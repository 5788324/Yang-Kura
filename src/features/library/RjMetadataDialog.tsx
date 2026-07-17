import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Save, Tag, X } from 'lucide-react';
import AsmrMetadataProviderPreview from '../../components/AsmrMetadataProviderPreview';
import type {
  AsmrMetadataProviderCandidateV1,
  AsmrMetadataProviderField,
} from '../../services/asmrMetadataProviderPreviewService';
import { metadataOverrideService, type AsmrMetadataSaveContext } from '../../services/metadataOverrideService';
import { Button, Dialog } from '../../shared/ui';
import type { RJWork } from '../../types';

export interface RjMetadataDialogProps {
  open: boolean;
  work: RJWork;
  onClose: () => void;
  onSave: (updated: RJWork, source: AsmrMetadataSaveContext) => void;
  onClearOverride?: (workId: string) => void;
}

interface MetadataDraft {
  title: string;
  circle: string;
  cvs: string;
  releaseDate: string;
  description: string;
  tags: string[];
}

const makeDraft = (work: RJWork): MetadataDraft => ({
  title: work.title,
  circle: work.circle,
  cvs: work.cvs.join(', '),
  releaseDate: work.releaseDate,
  description: work.description ?? '',
  tags: [...work.tags],
});

const parseList = (value: string): string[] => {
  const items: string[] = value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter((item): item is string => item.length > 0);
  return Array.from(new Set<string>(items));
};

export default function RjMetadataDialog({
  open,
  work,
  onClose,
  onSave,
  onClearOverride,
}: RjMetadataDialogProps) {
  const [draft, setDraft] = useState<MetadataDraft>(() => makeDraft(work));
  const [newTag, setNewTag] = useState('');
  const [pendingSource, setPendingSource] = useState<AsmrMetadataSaveContext>({ kind: 'manual' });

  useEffect(() => {
    if (!open) return;
    setDraft(makeDraft(work));
    setNewTag('');
    setPendingSource({ kind: 'manual' });
  }, [open, work]);

  const overrideCount = metadataOverrideService.getAsmrOverrideFieldCount(work.id);
  const sourceLabel = metadataOverrideService.getAsmrOverrideSourceLabel(work.id);
  const canSave = Boolean(draft.title.trim() && draft.circle.trim());
  const appliedSourceLabel = useMemo(() => {
    if (pendingSource.kind !== 'provider') return '手动编辑';
    return pendingSource.sourceLabel ?? pendingSource.provider ?? '外部候选信息';
  }, [pendingSource]);

  const addTag = () => {
    const value = newTag.trim();
    if (!value || draft.tags.includes(value)) return;
    setDraft((current) => ({ ...current, tags: [...current.tags, value] }));
    setNewTag('');
  };

  const applyProviderCandidate = (
    candidate: AsmrMetadataProviderCandidateV1,
    selectedFields: AsmrMetadataProviderField[],
  ) => {
    setDraft((current) => ({
      ...current,
      ...(candidate.title !== undefined ? { title: candidate.title } : {}),
      ...(candidate.circle !== undefined ? { circle: candidate.circle } : {}),
      ...(candidate.cvs !== undefined ? { cvs: candidate.cvs.join(', ') } : {}),
      ...(candidate.releaseDate !== undefined ? { releaseDate: candidate.releaseDate } : {}),
      ...(candidate.description !== undefined ? { description: candidate.description } : {}),
      ...(candidate.tags !== undefined ? { tags: candidate.tags } : {}),
    }));
    setPendingSource({
      kind: 'provider',
      provider: candidate.provider,
      ...(candidate.sourceLabel ? { sourceLabel: candidate.sourceLabel } : {}),
      ...(candidate.sourceUrl ? { sourceUrl: candidate.sourceUrl } : {}),
      ...(candidate.fetchedAt ? { fetchedAt: candidate.fetchedAt } : {}),
      appliedFields: selectedFields,
    });
  };

  const save = () => {
    if (!canSave) return;
    onSave({
      ...work,
      title: draft.title.trim(),
      circle: draft.circle.trim(),
      cvs: parseList(draft.cvs),
      releaseDate: draft.releaseDate.trim(),
      description: draft.description.trim(),
      tags: Array.from(new Set<string>(draft.tags.map((tag) => tag.trim()).filter((tag): tag is string => tag.length > 0))),
    }, pendingSource);
    onClose();
  };

  const clearOverride = () => {
    if (!onClearOverride || !metadataOverrideService.hasAsmrOverride(work.id)) return;
    onClearOverride(work.id);
    setDraft(makeDraft(work));
    setPendingSource({ kind: 'manual' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={`编辑 ${work.id}`}
      description="修改保存到独立的本地元数据覆盖层，不会重命名文件，也不会写入音频标签。"
      onClose={onClose}
      className="u37c-metadata-dialog"
      footer={(
        <div className="u37c-dialog-footer">
          <div>
            {overrideCount > 0 && onClearOverride ? (
              <Button
                variant="danger"
                size="sm"
                leadingIcon={<RotateCcw aria-hidden="true" />}
                onClick={clearOverride}
              >
                还原 {overrideCount} 项本地修改
              </Button>
            ) : null}
          </div>
          <div className="u37c-dialog-footer__actions">
            <Button variant="ghost" size="sm" leadingIcon={<X aria-hidden="true" />} onClick={onClose}>取消</Button>
            <Button variant="primary" size="sm" leadingIcon={<Save aria-hidden="true" />} onClick={save} disabled={!canSave}>保存修改</Button>
          </div>
        </div>
      )}
    >
      <div className="u37c-metadata-form" data-u37c-metadata-editor="ready">
        <div className="u37c-metadata-provenance">
          <span>当前覆盖：{overrideCount > 0 ? `${overrideCount} 项` : '无'}</span>
          <span>已保存来源：{sourceLabel ?? '资源库原始记录'}</span>
          <span>本次保存来源：{appliedSourceLabel}</span>
        </div>

        <label className="u37c-field u37c-field--wide">
          <span>作品标题</span>
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} autoFocus />
        </label>
        <label className="u37c-field">
          <span>制作社团</span>
          <input value={draft.circle} onChange={(event) => setDraft({ ...draft, circle: event.target.value })} />
        </label>
        <label className="u37c-field">
          <span>发售日期</span>
          <input value={draft.releaseDate} onChange={(event) => setDraft({ ...draft, releaseDate: event.target.value })} placeholder="YYYY-MM-DD" />
        </label>
        <label className="u37c-field u37c-field--wide">
          <span>声优 / CV（逗号分隔）</span>
          <input value={draft.cvs} onChange={(event) => setDraft({ ...draft, cvs: event.target.value })} />
        </label>
        <label className="u37c-field u37c-field--wide">
          <span>作品简介</span>
          <textarea rows={5} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </label>

        <section className="u37c-tag-editor u37c-field--wide" aria-labelledby="u37c-tag-editor-title">
          <div className="u37c-tag-editor__heading">
            <span id="u37c-tag-editor-title"><Tag aria-hidden="true" />本地标签</span>
            <small>{draft.tags.length} 个</small>
          </div>
          <div className="u37c-tag-editor__tags">
            {draft.tags.length > 0 ? draft.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))}
                title={`移除标签 ${tag}`}
              >
                #{tag}<X aria-hidden="true" />
              </button>
            )) : <span>暂无标签。</span>}
          </div>
          <div className="u37c-tag-editor__input">
            <input
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                addTag();
              }}
              placeholder="输入标签后按回车"
            />
            <Button variant="secondary" size="sm" onClick={addTag} disabled={!newTag.trim()}>添加</Button>
          </div>
        </section>

        <section className="u37c-provider-panel u37c-field--wide">
          <AsmrMetadataProviderPreview work={work} onApplyToDraft={applyProviderCandidate} />
        </section>
      </div>
    </Dialog>
  );
}
