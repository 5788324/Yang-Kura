import type { AudioTrack, RJWork, TrackProgressInfo } from '../types';

export type AsmrDetailSurfaceTone = 'brand' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';

export interface AsmrDetailSurfaceChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: AsmrDetailSurfaceTone;
}

export interface AsmrDetailHeroModel {
  title: string;
  description: string;
  chips: AsmrDetailSurfaceChip[];
  primaryHint: string;
  secondaryHint: string;
}

export interface AsmrDetailTrackSummaryModel {
  title: string;
  description: string;
  chips: AsmrDetailSurfaceChip[];
  emptyTitle: string;
  emptyDescription: string;
}

export interface AsmrDetailRecordModel {
  folderRecord: string;
  helper: string;
  copyLabel: string;
  openLabel: string;
  relocateLabel: string;
}

export interface AsmrDetailDiagnosticsModel {
  title: string;
  description: string;
  summary: AsmrDetailSurfaceChip[];
  cleanupPlan: AsmrDetailSurfaceChip[];
  guardrails: string[];
  deferred: string[];
}

const toneClassName: Record<AsmrDetailSurfaceTone, string> = {
  brand: 'border-brand-color/25 bg-brand-color/10 text-brand-color',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  purple: 'border-purple-500/25 bg-purple-500/10 text-purple-100',
  rose: 'border-rose-500/25 bg-rose-500/10 text-rose-100',
  slate: 'border-border-color/60 bg-card-bg/45 text-text-muted',
};

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 分钟';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));
  if (hours <= 0) return `${minutes} 分钟`;
  return `${hours} 小时 ${minutes} 分钟`;
};

const isLocalTrack = (track: AudioTrack): boolean =>
  track.playbackSourceKind === 'tokenized-local-file' ||
  track.externalOpenSourceKind === 'tokenized-local-file' ||
  Boolean(track.rootPathToken && track.sourceRelativePath);

const hasSubtitle = (track: AudioTrack): boolean =>
  Boolean(
    track.lyricsRelativePath ||
      track.lyricsLoadStatus === 'loaded' ||
      (track.subtitleRelativePaths?.length ?? 0) > 0 ||
      (track.lyrics?.length ?? 0) > 0,
  );

const countManualSubtitles = (trackSubtitles: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>): number =>
  Object.values(trackSubtitles).filter((value) => value !== 'none').length;

const getSubtitleLabel = (value: 'none' | 'ja' | 'zh' | 'bilingual' | undefined): string => {
  if (value === 'bilingual') return '双语字幕';
  if (value === 'zh') return '中文字幕';
  if (value === 'ja') return '日文字幕';
  return '暂无字幕';
};

const buildSafeCollectionName = (work: RJWork): string => {
  const circle = work.circle?.trim() || '未命名社团';
  return `${work.id} · ${circle}`;
};

export const asmrDetailSurfaceService = {
  getToneClassName(tone: AsmrDetailSurfaceTone): string {
    return toneClassName[tone];
  },

  getInitialFolderRecord(work: RJWork): string {
    return `<资源库记录>/${buildSafeCollectionName(work)}`;
  },

  getTrackRecordLabel(work: RJWork, track: AudioTrack, manualRecord?: string): string {
    if (manualRecord?.trim()) return manualRecord.trim();
    if (track.sourceRelativePath?.trim()) return `<资源库记录>/${track.sourceRelativePath.trim()}`;
    if (track.fileTreePath?.trim()) return `<资源库记录>/${work.id}/${track.fileTreePath.trim()}`;
    return `<资源库记录>/${work.id}/${track.title}`;
  },

  getHeroModel(work: RJWork): AsmrDetailHeroModel {
    const tracks = work.tracks ?? [];
    const localCount = tracks.filter(isLocalTrack).length;
    const subtitleCount = tracks.filter(hasSubtitle).length;
    return {
      title: '作品听音摘要',
      description: '优先展示播放、字幕、收藏与作品信息；真实路径、扫描细节和技术状态继续放在设置高级区与诊断页。',
      primaryHint: tracks.length > 0 ? '可以直接播放全部音声，或从下方音轨列表选择单轨继续听。' : '当前作品没有可播放音轨，建议返回音声库或重新读取资源库记录。',
      secondaryHint: '此页只维护本地记录和播放体验，不删除、移动、重命名真实媒体文件。',
      chips: [
        { id: 'tracks', label: '音轨', value: `${tracks.length}`, helper: '当前作品下的可听条目', tone: tracks.length > 0 ? 'brand' : 'slate' },
        { id: 'duration', label: '时长', value: formatDuration(work.totalDuration), helper: '来自资源库记录或示例数据', tone: 'purple' },
        { id: 'local', label: '本地', value: localCount > 0 ? `${localCount} 个` : '待读取', helper: localCount > 0 ? '包含 tokenized 本地资源' : '当前更多是示例或未读取资源', tone: localCount > 0 ? 'emerald' : 'slate' },
        { id: 'subtitle', label: '字幕', value: subtitleCount > 0 ? `${subtitleCount} 个` : '暂无', helper: 'LRC / SRT / VTT / ASS 状态', tone: subtitleCount > 0 ? 'amber' : 'slate' },
      ],
    };
  },

  getTrackSummaryModel(input: {
    work: RJWork;
    trackProgress: Record<string, TrackProgressInfo>;
    trackSubtitles: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>;
  }): AsmrDetailTrackSummaryModel {
    const tracks = input.work.tracks ?? [];
    const completedCount = tracks.filter((track) => input.trackProgress[track.id]?.completed).length;
    const partialCount = tracks.filter((track) => {
      const progress = input.trackProgress[track.id];
      return Boolean(progress && progress.percent > 0 && !progress.completed);
    }).length;
    const manualSubtitleCount = countManualSubtitles(input.trackSubtitles);
    const localCount = tracks.filter(isLocalTrack).length;
    return {
      title: '音轨列表状态',
      description: tracks.length > 0
        ? '列表只显示播放、进度、字幕和本地记录；真实路径和扫描细节不在主界面展开。'
        : '当前作品还没有音轨，先返回音声库或到设置页重新读取资源库记录。',
      emptyTitle: '这个作品暂无可听音轨',
      emptyDescription: '资源库记录可能尚未读取，或该目录只包含图片、文本、压缩包等外部文件。',
      chips: [
        { id: 'completed', label: '已听完', value: `${completedCount}`, helper: '手动或历史进度标记', tone: completedCount > 0 ? 'emerald' : 'slate' },
        { id: 'partial', label: '未听完', value: `${partialCount}`, helper: '有进度但未完成', tone: partialCount > 0 ? 'amber' : 'slate' },
        { id: 'subtitle', label: '字幕关联', value: `${manualSubtitleCount}`, helper: tracks.length > 0 ? '手动关联或本地字幕记录' : '暂无音轨', tone: manualSubtitleCount > 0 ? 'purple' : 'slate' },
        { id: 'local', label: '本地资源', value: localCount > 0 ? `${localCount}` : '待读取', helper: 'tokenized 本地资源数量', tone: localCount > 0 ? 'brand' : 'slate' },
      ],
    };
  },

  getRecordModel(work: RJWork, folderRecord: string): AsmrDetailRecordModel {
    return {
      folderRecord: folderRecord?.trim() || this.getInitialFolderRecord(work),
      helper: '这里显示资源库内的本地记录，不展示 Electron main 侧真实绝对路径。',
      openLabel: '打开目录',
      copyLabel: '复制记录',
      relocateLabel: '更新记录',
    };
  },

  getSubtitleLabel,

  getDiagnosticsModel(): AsmrDetailDiagnosticsModel {
    return {
      title: 'MVP-56 音声详情摘要模型抽离',
      description: '本轮对 AsmrDetail.tsx 做低风险收口：抽出详情摘要、音轨状态、记录文案与诊断说明，不拆大组件，不改真实链路。',
      summary: [
        { id: 'service', label: '新增服务', value: '1 个', helper: 'asmrDetailSurfaceService', tone: 'brand' },
        { id: 'surface', label: '详情页', value: '已收口', helper: '作品摘要 / 音轨状态 / 本地记录', tone: 'emerald' },
        { id: 'path', label: '路径表达', value: '已弱化', helper: 'F 盘示例改为资源库记录', tone: 'amber' },
        { id: 'risk', label: '大拆分', value: '不执行', helper: '保持 Beta 0.1 稳定', tone: 'rose' },
      ],
      cleanupPlan: [
        { id: 'detail-summary', label: '摘要模型', value: '已抽离', helper: '减少详情页文案和统计堆积', tone: 'brand' },
        { id: 'track-state', label: '音轨状态', value: '已抽离', helper: '统一已听完、未听完、字幕、本地资源提示', tone: 'purple' },
        { id: 'record-wording', label: '记录文案', value: '已收口', helper: '减少路径管理味道', tone: 'amber' },
        { id: 'future', label: '下一步', value: '小步拆分', helper: '后续再考虑音轨行组件拆分', tone: 'slate' },
      ],
      guardrails: [
        '不做 AsmrDetail.tsx 一次性大拆分',
        '不改扫描链路',
        '不改 library-index.json 写入 / 读取链路',
        '不改 HTMLAudio 播放内核',
        '不改字幕读取链路',
        '不接 SQLite / 下载器 / 元数据 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
      deferred: ['音轨行组件拆分', '作品信息表拆分', '真实下载器', 'SQLite', 'mpv 后端', '高级文件整理'],
    };
  },
};
