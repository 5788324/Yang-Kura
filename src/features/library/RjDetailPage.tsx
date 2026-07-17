import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  FileWarning,
  FolderOpen,
  Heart,
  Info,
  ListPlus,
  Music2,
  Play,
  RotateCcw,
  ShieldCheck,
  Star,
  Subtitles,
  Tag,
  UserRound,
  UsersRound,
} from 'lucide-react';
import CoverArtwork from '../../components/CoverArtwork';
import { metadataOverrideService, type AsmrMetadataSaveContext } from '../../services/metadataOverrideService';
import { Button, Feedback, Surface, TrackRow } from '../../shared/ui';
import type { AudioTrack, RJStatus, RJWork } from '../../types';
import RjMetadataDialog from './RjMetadataDialog';

export interface RjDetailPageProps {
  rjWork: RJWork;
  onBack: () => void;
  onPlayTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  onAddToQueue: (track: AudioTrack) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  onExplore?: (query: string) => void;
  onUpdateRjWork?: (updated: RJWork, source?: AsmrMetadataSaveContext) => void;
  onClearRjWorkOverride?: (workId: string) => void;
}

type DetailTab = 'tracks' | 'details';
type PersonalStatus = NonNullable<RJWork['personalStatus']>;

const STATUS_LABELS: Record<RJStatus, string> = {
  identified: '资源正常',
  'missing-cover': '缺少封面',
  'missing-audio': '缺少音频',
  warning: '需要检查',
};

const PERSONAL_STATUS_LABELS: Record<PersonalStatus, string> = {
  unheard: '待听',
  listening: '收听中',
  completed: '已完成',
  abandoned: '已搁置',
};

const NON_AUDIO_KINDS = new Set(['video', 'image', 'text', 'archive', 'other']);

function formatDuration(seconds: number | undefined) {
  if (!Number.isFinite(seconds)) return '--:--';
  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
    : `${minutes}:${String(remaining).padStart(2, '0')}`;
}

function subtitleSummary(track: AudioTrack) {
  const paths = track.subtitleRelativePaths ?? [];
  if (paths.length === 0) return { label: '无字幕', tone: 'neutral' as const };
  const joined = paths.join(' ').toLocaleLowerCase();
  const hasZh = /(?:\.zh\.|chinese|中文|bilingual)/.test(joined);
  const hasJa = /(?:\.ja\.|japanese|日文|bilingual)/.test(joined);
  if (hasZh && hasJa) return { label: `双语 ${paths.length}`, tone: 'success' as const };
  if (hasZh) return { label: `中文 ${paths.length}`, tone: 'success' as const };
  if (hasJa) return { label: `日文 ${paths.length}`, tone: 'info' as const };
  return { label: `字幕 ${paths.length}`, tone: 'info' as const };
}

function mediaKindLabel(track: AudioTrack) {
  if (!track.mediaKind || track.mediaKind === 'audio') return '音频';
  if (track.mediaKind === 'video') return '视频';
  if (track.mediaKind === 'image') return '图片';
  if (track.mediaKind === 'text') return '文本';
  if (track.mediaKind === 'archive') return '压缩包';
  return '其他文件';
}

function canPlayInApp(track: AudioTrack) {
  return !NON_AUDIO_KINDS.has(track.mediaKind ?? 'audio');
}

function canUseExternalOpen(track: AudioTrack) {
  return Boolean(
    track.rootPathToken &&
    track.sourceRelativePath &&
    track.externalOpenSourceKind === 'tokenized-local-file',
  );
}

function externalKind(track: AudioTrack): YangKuraExternalOpenEntryKind {
  if (track.mediaKind === 'video' || track.mediaKind === 'image' || track.mediaKind === 'text' || track.mediaKind === 'archive' || track.mediaKind === 'other') {
    return track.mediaKind;
  }
  return 'audio';
}

export default function RjDetailPage({
  rjWork,
  onBack,
  onPlayTrack,
  onAddToQueue,
  favorites,
  toggleFavorite,
  onExplore,
  onUpdateRjWork,
  onClearRjWorkOverride,
}: RjDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('tracks');
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [notes, setNotes] = useState(rjWork.personalNotes ?? '');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setNotes(rjWork.personalNotes ?? '');
  }, [rjWork.id, rjWork.personalNotes]);

  const playableTracks = useMemo(() => rjWork.tracks.filter(canPlayInApp), [rjWork.tracks]);
  const externalEntries = useMemo(() => rjWork.tracks.filter((track) => !canPlayInApp(track)), [rjWork.tracks]);
  const subtitleTrackCount = useMemo(
    () => rjWork.tracks.filter((track) => (track.subtitleRelativePaths?.length ?? 0) > 0).length,
    [rjWork.tracks],
  );
  const tokenizedTrackCount = useMemo(
    () => rjWork.tracks.filter((track) => track.rootPathToken && track.sourceRelativePath).length,
    [rjWork.tracks],
  );
  const overrideCount = metadataOverrideService.getAsmrOverrideFieldCount(rjWork.id);
  const overrideSource = metadataOverrideService.getAsmrOverrideSourceLabel(rjWork.id);
  const personalStatus = rjWork.personalStatus ?? 'unheard';
  const rating = rjWork.rating ?? 0;

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const updateWork = (patch: Partial<RJWork>, source: AsmrMetadataSaveContext = { kind: 'manual' }) => {
    if (!onUpdateRjWork) return;
    onUpdateRjWork({ ...rjWork, ...patch }, source);
  };

  const playAll = () => {
    if (playableTracks.length === 0) return;
    onPlayTrack(playableTracks[0], playableTracks);
  };

  const queueAll = () => {
    playableTracks.forEach(onAddToQueue);
    showFeedback(`已将 ${playableTracks.length} 条可播放音轨加入队列。`);
  };

  const playOrOpen = (track: AudioTrack) => {
    if (canPlayInApp(track)) {
      onPlayTrack(track, playableTracks.length > 0 ? playableTracks : rjWork.tracks);
      return;
    }
    void openExternal(track);
  };

  const openExternal = async (track: AudioTrack) => {
    if (!canUseExternalOpen(track) || !track.rootPathToken || !track.sourceRelativePath) {
      showFeedback('当前条目没有可安全打开的本地文件令牌。');
      return;
    }
    if (!window.yangKura?.requestOpenExternalFile) {
      showFeedback('系统外部打开仅在 Electron 桌面版可用。');
      return;
    }
    try {
      const result = await window.yangKura.requestOpenExternalFile({
        rootPathToken: track.rootPathToken,
        relativePath: track.sourceRelativePath,
        entryId: track.id,
        mode: 'open-external-file',
        expectedKind: externalKind(track),
      });
      showFeedback(result.message);
    } catch (error) {
      showFeedback(`无法打开文件：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const revealTrack = async (track: AudioTrack) => {
    if (!canUseExternalOpen(track) || !track.rootPathToken || !track.sourceRelativePath) {
      showFeedback('当前条目没有可定位的本地文件令牌。');
      return;
    }
    if (!window.yangKura?.requestOpenInFileManager) {
      showFeedback('文件管理器定位仅在 Electron 桌面版可用。');
      return;
    }
    try {
      const result = await window.yangKura.requestOpenInFileManager({
        rootPathToken: track.rootPathToken,
        relativePath: track.sourceRelativePath,
        entryId: track.id,
        mode: 'open-in-file-manager',
      });
      showFeedback(result.message);
    } catch (error) {
      showFeedback(`无法定位文件：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const copyRelativeRecord = async (track: AudioTrack) => {
    const value = track.sourceRelativePath ?? track.fileTreePath;
    if (!value) {
      showFeedback('该条目没有可复制的资源库相对记录。');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      showFeedback('已复制资源库相对记录。');
    } catch {
      showFeedback('浏览器未授予剪贴板权限。');
    }
  };

  const saveNotes = () => {
    updateWork({ personalNotes: notes });
    showFeedback('个人笔记已保存到本地覆盖层。');
  };

  const updateStatus = (status: PersonalStatus) => {
    updateWork({ personalStatus: status });
    showFeedback(`听音状态已更新为“${PERSONAL_STATUS_LABELS[status]}”。`);
  };

  const updateRating = (value: number) => {
    updateWork({ rating: value });
    showFeedback(value > 0 ? `评分已更新为 ${value} 星。` : '评分已清除。');
  };

  const clearOverride = () => {
    if (!onClearRjWorkOverride || overrideCount === 0) return;
    onClearRjWorkOverride(rjWork.id);
    showFeedback('已还原为资源库原始记录。');
  };

  return (
    <div className="u37c-rj-detail" data-u37c-rj-detail="ready">
      <nav className="u37c-rj-breadcrumb" aria-label="当前位置">
        <Button variant="ghost" size="sm" leadingIcon={<ArrowLeft aria-hidden="true" />} onClick={onBack}>
          返回音声库
        </Button>
        <span>音声库</span><span aria-hidden="true">/</span><span>{rjWork.circle}</span><span aria-hidden="true">/</span><strong>{rjWork.id}</strong>
      </nav>

      <section className="u37c-rj-hero" data-health={rjWork.status}>
        <div className="u37c-rj-hero__visual">
          <CoverArtwork
            src={rjWork.coverUrl}
            title={rjWork.title}
            subtitle={rjWork.id}
            kind="asmr"
            className="h-full w-full object-cover"
          />
          <span>{rjWork.id}</span>
        </div>

        <div className="u37c-rj-hero__content">
          <div className="u37c-rj-hero__badges">
            <span className="u37b-badge" data-tone={rjWork.status === 'identified' ? 'success' : 'warning'}>{STATUS_LABELS[rjWork.status]}</span>
            <span className="u37b-badge" data-tone={subtitleTrackCount > 0 ? 'info' : 'neutral'}>{subtitleTrackCount > 0 ? `${subtitleTrackCount} 轨有字幕` : '暂无字幕'}</span>
            {overrideCount > 0 ? <span className="u37b-badge" data-tone="info">本地修改 {overrideCount} 项</span> : null}
          </div>
          <p className="u37b-page-heading__eyebrow">RJ 作品详情</p>
          <h2>{rjWork.title}</h2>
          <div className="u37c-rj-hero__meta">
            <button type="button" onClick={() => onExplore?.(rjWork.circle)} disabled={!onExplore}><UsersRound aria-hidden="true" />{rjWork.circle}</button>
            <span><UserRound aria-hidden="true" />{rjWork.cvs.join(' / ') || '未标注声优'}</span>
            <span><CalendarDays aria-hidden="true" />{rjWork.releaseDate || '未标注日期'}</span>
            <span><Clock3 aria-hidden="true" />{formatDuration(rjWork.totalDuration)}</span>
          </div>
          <div className="u37c-rj-hero__tags">
            {rjWork.tags.length > 0 ? rjWork.tags.slice(0, 8).map((tag) => (
              <button key={tag} type="button" onClick={() => onExplore?.(tag)} disabled={!onExplore}>#{tag}</button>
            )) : <span>暂无标签</span>}
          </div>
          <div className="u37c-rj-hero__actions">
            <Button id="play-all-asmr" variant="primary" leadingIcon={<Play aria-hidden="true" />} onClick={playAll} disabled={playableTracks.length === 0}>播放全部音声</Button>
            <Button variant="secondary" leadingIcon={<ListPlus aria-hidden="true" />} onClick={queueAll} disabled={playableTracks.length === 0}>加入队列</Button>
            {onUpdateRjWork ? <Button variant="ghost" leadingIcon={<Edit3 aria-hidden="true" />} onClick={() => setMetadataOpen(true)}>编辑作品信息</Button> : null}
            {overrideCount > 0 && onClearRjWorkOverride ? <Button variant="ghost" leadingIcon={<RotateCcw aria-hidden="true" />} onClick={clearOverride}>还原本地修改</Button> : null}
          </div>
        </div>
      </section>

      <section className="u37c-rj-overview" aria-label="作品资源概况">
        <Surface padding="md" tone="subtle">
          <Music2 aria-hidden="true" />
          <span><strong>{playableTracks.length}</strong><small>可播放音轨</small></span>
        </Surface>
        <Surface padding="md" tone="subtle">
          <Subtitles aria-hidden="true" />
          <span><strong>{subtitleTrackCount}</strong><small>有字幕音轨</small></span>
        </Surface>
        <Surface padding="md" tone="subtle">
          <FolderOpen aria-hidden="true" />
          <span><strong>{tokenizedTrackCount}</strong><small>可定位文件</small></span>
        </Surface>
        <Surface padding="md" tone="subtle">
          <ExternalLink aria-hidden="true" />
          <span><strong>{externalEntries.length}</strong><small>外部打开条目</small></span>
        </Surface>
      </section>

      <div className="u37c-rj-tabs" role="tablist" aria-label="RJ 详情内容">
        <button type="button" role="tab" aria-selected={activeTab === 'tracks'} data-active={activeTab === 'tracks'} onClick={() => setActiveTab('tracks')}>
          音轨与文件 <span>{rjWork.tracks.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'details'} data-active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
          作品信息与个人记录
        </button>
      </div>

      {activeTab === 'tracks' ? (
        <section className="u37c-rj-tracks" aria-labelledby="u37c-rj-tracks-title">
          <div className="u37b-section__heading">
            <div>
              <h3 id="u37c-rj-tracks-title">音轨与资源文件</h3>
              <p>音频在应用内播放；视频、图片、文本和压缩包交给系统默认应用。</p>
            </div>
            <span className="u37c-rj-tracks__summary">{playableTracks.length} 可播放 · {externalEntries.length} 外部条目</span>
          </div>

          {rjWork.tracks.length === 0 ? (
            <Surface padding="lg" tone="subtle" className="u37c-rj-empty">
              <Feedback
                tone="warning"
                title="该作品没有可显示的音轨"
                description="资源库记录可能为空，或重新扫描后该作品的文件关联已失效。不会自动修改磁盘文件。"
                action={<Button variant="primary" onClick={onBack}>返回音声库</Button>}
              />
            </Surface>
          ) : (
            <Surface padding="sm" className="u37b-track-list u37c-rj-track-list">
              {rjWork.tracks.map((track, index) => {
                const subtitle = subtitleSummary(track);
                const favorite = favorites.includes(track.id);
                const record = track.sourceRelativePath ?? track.fileTreePath ?? '未提供相对记录';
                return (
                  <TrackRow
                    key={track.id}
                    title={track.title}
                    subtitle={`${track.artist || rjWork.cvs[0] || rjWork.circle} · ${record}`}
                    duration={formatDuration(track.duration)}
                    onActivate={() => playOrOpen(track)}
                    leading={<span className="u37c-track-index">{String(index + 1).padStart(2, '0')}</span>}
                    badges={(
                      <>
                        <span className="u37b-badge">{mediaKindLabel(track)}</span>
                        <span className="u37b-badge" data-tone={subtitle.tone}>{subtitle.label}</span>
                        {favorite ? <span className="u37b-badge" data-tone="danger">已收藏</span> : null}
                      </>
                    )}
                    actions={(
                      <>
                        <button type="button" className="u37b-icon-button" onClick={() => onAddToQueue(track)} title="加入播放队列" aria-label={`将 ${track.title} 加入播放队列`} disabled={!canPlayInApp(track)}><ListPlus aria-hidden="true" /></button>
                        <button type="button" className="u37b-icon-button" data-active={favorite ? 'true' : 'false'} onClick={() => toggleFavorite(track.id)} title={favorite ? '取消收藏' : '收藏音轨'} aria-label={favorite ? `取消收藏 ${track.title}` : `收藏 ${track.title}`}><Heart aria-hidden="true" /></button>
                        <button type="button" className="u37b-icon-button" onClick={() => copyRelativeRecord(track)} title="复制相对记录" aria-label={`复制 ${track.title} 的相对记录`}><Copy aria-hidden="true" /></button>
                        <button type="button" className="u37b-icon-button" onClick={() => void revealTrack(track)} title="在文件管理器中定位" aria-label={`在文件管理器中定位 ${track.title}`} disabled={!canUseExternalOpen(track)}><FolderOpen aria-hidden="true" /></button>
                        <button type="button" className="u37b-icon-button" onClick={() => void openExternal(track)} title="用系统默认应用打开" aria-label={`用系统默认应用打开 ${track.title}`} disabled={!canUseExternalOpen(track)}><ExternalLink aria-hidden="true" /></button>
                        <button type="button" className="u37b-icon-button u37c-track-play" onClick={() => playOrOpen(track)} title={canPlayInApp(track) ? '播放' : '打开'} aria-label={canPlayInApp(track) ? `播放 ${track.title}` : `打开 ${track.title}`}><Play aria-hidden="true" /></button>
                      </>
                    )}
                  />
                );
              })}
            </Surface>
          )}
        </section>
      ) : (
        <section className="u37c-rj-details" aria-label="作品信息与个人记录">
          <div className="u37c-rj-details__main">
            <Surface padding="lg" className="u37c-info-section">
              <div className="u37c-info-section__heading"><Info aria-hidden="true" /><div><h3>作品简介</h3><p>来自资源库记录或本地元数据覆盖层。</p></div></div>
              <p className="u37c-description">{rjWork.description || '当前没有作品简介。可通过“编辑作品信息”手动补充，或查询 DLsite 候选信息后选择性应用。'}</p>
              <div className="u37c-detail-tags"><Tag aria-hidden="true" />{rjWork.tags.length > 0 ? rjWork.tags.map((tag) => <button key={tag} type="button" onClick={() => onExplore?.(tag)} disabled={!onExplore}>#{tag}</button>) : <span>暂无标签</span>}</div>
            </Surface>

            <Surface padding="lg" className="u37c-info-section">
              <div className="u37c-info-section__heading"><ShieldCheck aria-hidden="true" /><div><h3>资源健康与字幕</h3><p>这里只展示 Index 提供的安全相对记录，不显示绝对路径或 file://。</p></div></div>
              <div className="u37c-health-grid">
                <div><span>作品状态</span><strong>{STATUS_LABELS[rjWork.status]}</strong></div>
                <div><span>Index 文件计数</span><strong>{rjWork.fileCount}</strong></div>
                <div><span>当前条目计数</span><strong>{rjWork.tracks.length}</strong></div>
                <div><span>可定位文件</span><strong>{tokenizedTrackCount}/{rjWork.tracks.length || 0}</strong></div>
                <div><span>字幕覆盖</span><strong>{subtitleTrackCount}/{playableTracks.length || 0}</strong></div>
                <div><span>本地覆盖来源</span><strong>{overrideSource ?? '资源库原始记录'}</strong></div>
              </div>
              {rjWork.status !== 'identified' ? (
                <div className="u37c-inline-warning"><FileWarning aria-hidden="true" /><span>该作品存在资源警告。请通过设置或 AI 维护区重新读取、扫描或检查资源库；详情页不会自动修复磁盘文件。</span></div>
              ) : subtitleTrackCount === 0 ? (
                <div className="u37c-inline-info"><Subtitles aria-hidden="true" /><span>当前未发现外部字幕。播放仍可继续，后续重新扫描时会重新匹配同名 LRC、SRT、VTT 或 ASS。</span></div>
              ) : (
                <div className="u37c-inline-success"><Check aria-hidden="true" /><span>已发现 {subtitleTrackCount} 条带字幕的音轨，播放器会按当前轨道读取可用字幕。</span></div>
              )}
            </Surface>
          </div>

          <aside className="u37c-personal-panel">
            <Surface padding="lg">
              <div className="u37c-info-section__heading"><Star aria-hidden="true" /><div><h3>个人听音记录</h3><p>评分、状态和笔记保存在本地覆盖层。</p></div></div>

              <div className="u37c-rating" aria-label="个人评分">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" data-active={value <= rating} onClick={() => updateRating(value === rating ? 0 : value)} aria-label={`${value} 星`}><Star aria-hidden="true" /></button>
                ))}
                <span>{rating > 0 ? `${rating}.0` : '未评分'}</span>
              </div>

              <div className="u37c-status-grid" aria-label="个人听音状态">
                {(Object.keys(PERSONAL_STATUS_LABELS) as PersonalStatus[]).map((status) => (
                  <button key={status} type="button" data-active={personalStatus === status} onClick={() => updateStatus(status)}>{PERSONAL_STATUS_LABELS[status]}</button>
                ))}
              </div>

              <label className="u37c-notes">
                <span>个人笔记</span>
                <textarea rows={7} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="记录喜欢的音轨、睡眠感受或后续整理事项…" />
              </label>
              <Button variant="primary" fullWidth onClick={saveNotes}>保存个人笔记</Button>
            </Surface>
          </aside>
        </section>
      )}

      {feedback ? <div className="u37b-toast" role="status"><Check aria-hidden="true" />{feedback}</div> : null}

      {onUpdateRjWork ? (
        <RjMetadataDialog
          open={metadataOpen}
          work={rjWork}
          onClose={() => setMetadataOpen(false)}
          onSave={(updated, source) => {
            onUpdateRjWork(updated, source);
            showFeedback(source.kind === 'provider' ? '已保存所选外部候选字段。' : '本地元数据修改已保存。');
          }}
          onClearOverride={onClearRjWorkOverride}
        />
      ) : null}
    </div>
  );
}
