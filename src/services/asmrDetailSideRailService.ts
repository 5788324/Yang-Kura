import type { AudioTrack, RJWork } from '../types';

export type AsmrDetailSideRailTone = 'brand' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';

export interface AsmrDetailSideRailChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: AsmrDetailSideRailTone;
}

export interface AsmrDetailSideRailModel {
  title: string;
  description: string;
  helper: string;
  chips: AsmrDetailSideRailChip[];
  notePlaceholder: string;
  noteHelper: string;
  ratingLabel: string;
  statusLabel: string;
  saveNoteLabel: string;
}

export interface AsmrDetailResourceRecordModel {
  title: string;
  description: string;
  rootLabel: string;
  audioLabel: string;
  subtitleLabel: string;
  infoLabel: string;
  coverLabel: string;
  hiddenCountLabel: string | null;
  subtitleState: string;
  subtitleHelper: string;
}

export interface AsmrDetailSubtitlePanelModel {
  title: string;
  description: string;
  rows: Array<{ id: string; label: string; value: string; tone: AsmrDetailSideRailTone }>;
  helper: string;
}

export interface AsmrDetailSideRailDiagnosticsModel {
  title: string;
  description: string;
  summary: AsmrDetailSideRailChip[];
  cleanupPlan: AsmrDetailSideRailChip[];
  guardrails: string[];
  deferred: string[];
}

export interface AsmrDetailSideRailInput {
  work: RJWork;
  rating: number;
  personalStatus: 'unheard' | 'listening' | 'completed' | 'abandoned';
  notes: string;
  trackSubtitles: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>;
}

function formatMinutes(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 分钟';
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} 分钟`;
}

function getPersonalStatusLabel(status: AsmrDetailSideRailInput['personalStatus']): string {
  const labels: Record<AsmrDetailSideRailInput['personalStatus'], string> = {
    unheard: '未开始',
    listening: '追音中',
    completed: '已听完',
    abandoned: '已搁置',
  };
  return labels[status];
}

function countSubtitleTracks(tracks: AudioTrack[], trackSubtitles: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>): number {
  return tracks.filter((track) => {
    const manualState = trackSubtitles[track.id];
    return Boolean(
      manualState && manualState !== 'none'
        || track.lyrics?.length
        || track.lyricsRelativePath
        || track.subtitleRelativePaths?.length,
    );
  }).length;
}

function getToneClassName(tone: AsmrDetailSideRailTone): string {
  const map: Record<AsmrDetailSideRailTone, string> = {
    brand: 'border-brand-color/20 bg-brand-color/10 text-brand-color',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-100',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-100',
    slate: 'border-border-color/60 bg-card-bg/45 text-text-secondary',
  };
  return map[tone];
}

export const asmrDetailSideRailService = {
  getToneClassName,

  getPersonalStatusLabel,

  getSideRailModel(input: AsmrDetailSideRailInput): AsmrDetailSideRailModel {
    const subtitleCount = countSubtitleTracks(input.work.tracks, input.trackSubtitles);
    const hasNotes = input.notes.trim().length > 0;
    return {
      title: '个人听音侧栏',
      description: '集中记录评分、听后状态和个人笔记；这些信息只用于本地使用体验，不改变真实媒体文件。',
      helper: '此区块用于日常听音，不是文件管理工具。资源扫描和异常细节继续放在设置高级区 / 诊断页。',
      ratingLabel: input.rating > 0 ? `${input.rating}.0 星` : '未评分',
      statusLabel: getPersonalStatusLabel(input.personalStatus),
      saveNoteLabel: hasNotes ? '保存个人笔记' : '保存空白笔记',
      notePlaceholder: '写下声线、助眠片段、喜欢的音轨、字幕质量或下次继续听的提醒。这里是个人备注，不会修改真实文件。',
      noteHelper: hasNotes ? '已有个人笔记，保存后仅更新本地记录。' : '还没有笔记；可记录喜欢的段落、声优表现或睡前听音感受。',
      chips: [
        { id: 'rating', label: '评分', value: input.rating > 0 ? `${input.rating}.0 星` : '未评分', helper: '主观喜好', tone: input.rating > 0 ? 'amber' : 'slate' },
        { id: 'status', label: '状态', value: getPersonalStatusLabel(input.personalStatus), helper: '听后归档', tone: input.personalStatus === 'completed' ? 'emerald' : input.personalStatus === 'listening' ? 'brand' : input.personalStatus === 'abandoned' ? 'rose' : 'slate' },
        { id: 'notes', label: '笔记', value: hasNotes ? '已记录' : '未记录', helper: '个人备忘', tone: hasNotes ? 'purple' : 'slate' },
        { id: 'subtitles', label: '字幕', value: `${subtitleCount}/${input.work.tracks.length}`, helper: '音轨匹配', tone: subtitleCount > 0 ? 'emerald' : 'amber' },
      ],
    };
  },

  getResourceRecordModel(work: RJWork, trackSubtitles: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>): AsmrDetailResourceRecordModel {
    const subtitleCount = countSubtitleTracks(work.tracks, trackSubtitles);
    return {
      title: '资源库记录概览',
      description: '只显示资源库内的相对记录和状态，不展示真实绝对路径。',
      rootLabel: `${work.id} · ${work.circle.split(' ')[0] || '本地作品'}`,
      audioLabel: `音频记录 · ${work.tracks.length} 个音轨 · ${formatMinutes(work.totalDuration)}`,
      subtitleLabel: subtitleCount > 0 ? `字幕记录 · ${subtitleCount} 个音轨已匹配` : '字幕记录 · 暂无匹配字幕',
      infoLabel: '作品信息记录',
      coverLabel: work.coverSourceKind === 'local-file' ? '本地封面记录' : '封面占位记录',
      hiddenCountLabel: work.tracks.length > 3 ? `以及其余 ${work.tracks.length - 3} 个音轨记录` : null,
      subtitleState: subtitleCount > 0 ? '已匹配字幕' : '未匹配字幕',
      subtitleHelper: subtitleCount > 0
        ? '播放音轨后，可在播放器歌词页查看已读取的本地字幕。'
        : '没有字幕时仍可正常播放；后续可通过同名 LRC / 字幕补齐。',
    };
  },

  getSubtitlePanelModel(work: RJWork, trackSubtitles: Record<string, 'none' | 'ja' | 'zh' | 'bilingual'>): AsmrDetailSubtitlePanelModel {
    const subtitleCount = countSubtitleTracks(work.tracks, trackSubtitles);
    return {
      title: '字幕 / LRC 匹配状态',
      description: '按音轨记录显示字幕匹配情况；没有字幕不影响本地播放。',
      rows: [
        { id: 'matched', label: '已匹配音轨', value: `${subtitleCount} / ${work.tracks.length}`, tone: subtitleCount > 0 ? 'emerald' : 'amber' },
        { id: 'source', label: '字幕来源', value: subtitleCount > 0 ? '本地字幕记录' : '暂无字幕记录', tone: subtitleCount > 0 ? 'brand' : 'slate' },
        { id: 'player', label: '播放器显示', value: subtitleCount > 0 ? '可在歌词页显示' : '播放正常，歌词为空', tone: subtitleCount > 0 ? 'purple' : 'slate' },
      ],
      helper: subtitleCount > 0
        ? '已匹配字幕会进入播放器歌词页；仍保持 tokenized 本地资源边界。'
        : '当前作品未匹配字幕；可继续播放音频，也可后续补充 LRC / SRT / VTT / ASS。',
    };
  },

  getDiagnosticsModel(): AsmrDetailSideRailDiagnosticsModel {
    return {
      title: 'MVP-57 音声详情右侧栏精修',
      description: '本轮继续小步收口 AsmrDetail.tsx：把右侧栏的评分、听后状态、个人笔记、资源记录和字幕状态集中成 service 模型，不拆大组件，不改真实链路。',
      summary: [
        { id: 'service', label: '新增服务', value: '1 个', helper: 'asmrDetailSideRailService', tone: 'brand' },
        { id: 'side-rail', label: '右侧栏', value: '已精修', helper: '评分 / 状态 / 笔记 / 字幕 / 记录', tone: 'emerald' },
        { id: 'wording', label: '文案', value: '已收口', helper: '减少路径管理和工具面板感', tone: 'amber' },
        { id: 'risk', label: '大拆分', value: '不执行', helper: '保持 Beta 0.1 稳定', tone: 'rose' },
      ],
      cleanupPlan: [
        { id: 'personal', label: '个人听音', value: '已模型化', helper: '评分、状态、笔记集中处理', tone: 'purple' },
        { id: 'record', label: '资源记录', value: '已弱化', helper: '只显示资源库记录，不展示绝对路径', tone: 'amber' },
        { id: 'subtitle', label: '字幕状态', value: '已集中', helper: '已匹配 / 未匹配 / 仍可播放', tone: 'emerald' },
        { id: 'future', label: '下一步', value: '继续小步', helper: '可转向设置页或播放页细节', tone: 'slate' },
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
      deferred: ['右侧栏组件拆分', '音轨行组件拆分', '真实下载器', 'SQLite', 'mpv 后端', '高级文件整理'],
    };
  },
};
