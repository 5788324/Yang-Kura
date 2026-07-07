import type { AudioTrack, PlayerState } from '../types';

export type BetaRegressionTone = 'brand' | 'emerald' | 'amber' | 'purple' | 'slate';

export interface BetaRegressionChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: BetaRegressionTone;
}

export interface BetaRegressionChecklistItem {
  id: string;
  title: string;
  description: string;
  surface: '首页' | '设置' | '播放器' | '资源库' | '诊断' | '打包版';
  doneLabel: string;
  tone: BetaRegressionTone;
}

export interface BetaRegressionSettingsModel {
  title: string;
  description: string;
  chips: BetaRegressionChip[];
  helper: string;
}

export interface BetaRegressionDashboardModel {
  title: string;
  description: string;
  chips: BetaRegressionChip[];
}

export interface BetaRegressionPlayerModel {
  compactLine: string;
  chips: BetaRegressionChip[];
}

export interface BetaRegressionDiagnosticsModel {
  title: string;
  description: string;
  checklist: BetaRegressionChecklistItem[];
  commands: string[];
  guardrails: string[];
  deferred: string[];
}

const hasSubtitle = (track: AudioTrack | null): boolean => Boolean(track?.lyrics?.length || track?.lyricsRelativePath || track?.subtitleRelativePaths?.length);
const isLocalTrack = (track: AudioTrack | null): boolean => Boolean(track?.mediaUrl || track?.sourceRelativePath || track?.rootPathToken);

const toneClassName: Record<BetaRegressionTone, string> = {
  brand: 'border-brand-color/25 bg-brand-color/10 text-brand-color',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  purple: 'border-purple-500/25 bg-purple-500/10 text-purple-200',
  slate: 'border-border-color/60 bg-card-bg/45 text-text-muted',
};

export const betaRegressionChecklistService = {
  getToneClassName(tone: BetaRegressionTone): string {
    return toneClassName[tone];
  },

  getSettingsModel(): BetaRegressionSettingsModel {
    return {
      title: 'Beta 回归路径',
      description: '打包版日常回归只检查常用链路：选择目录、读取记录、播放本地音频。高级扫描细节继续放在下方折叠区和诊断页。',
      helper: '不会删除、移动、重命名真实媒体文件；Renderer 仍只显示资源库令牌和中文状态。',
      chips: [
        { id: 'select', label: '第一步', value: '选择目录', helper: '生成资源库令牌', tone: 'brand' },
        { id: 'read', label: '第二步', value: '读取记录', helper: '读取已有 library-index.json', tone: 'emerald' },
        { id: 'listen', label: '第三步', value: '播放检查', helper: '确认音频 / 字幕 / 外部打开', tone: 'purple' },
      ],
    };
  },

  getDashboardModel(args: { hasRealLibrary: boolean; recentCount: number; hasCurrentTrack: boolean }): BetaRegressionDashboardModel {
    const { hasRealLibrary, recentCount, hasCurrentTrack } = args;
    return {
      title: 'Beta 0.1 日常检查',
      description: hasRealLibrary
        ? '资源库已进入可用状态，优先检查继续播放、最近播放和常用歌单。'
        : '还没有读取本地资源库时，先去设置页选择目录并读取已有记录。',
      chips: [
        { id: 'library', label: '资源库', value: hasRealLibrary ? '已读取' : '待读取', helper: hasRealLibrary ? '首页可直接继续听' : '前往设置页导入', tone: hasRealLibrary ? 'emerald' : 'amber' },
        { id: 'recent', label: '最近播放', value: `${recentCount}`, helper: recentCount > 0 ? '可继续回听' : '播放后自动出现', tone: recentCount > 0 ? 'brand' : 'slate' },
        { id: 'player', label: '播放器', value: hasCurrentTrack ? '有音频' : '待播放', helper: hasCurrentTrack ? '可检查进度和字幕' : '选择一首音频开始', tone: hasCurrentTrack ? 'purple' : 'slate' },
      ],
    };
  },

  getPlayerModel(playerState: PlayerState): BetaRegressionPlayerModel {
    const track = playerState.currentTrack;
    const sourceLabel = isLocalTrack(track) ? '本地音频' : '示例音频';
    const subtitleLabel = hasSubtitle(track) ? '有字幕' : '无字幕';
    const queueLabel = playerState.queue.length > 0 ? `${playerState.queue.length} 首队列` : '空队列';
    return {
      compactLine: track ? `${sourceLabel} · ${subtitleLabel} · ${queueLabel}` : '选择本地音频后显示播放状态、字幕状态和队列数量',
      chips: [
        { id: 'source', label: '来源', value: sourceLabel, helper: '不暴露真实路径', tone: isLocalTrack(track) ? 'emerald' : 'slate' },
        { id: 'subtitle', label: '字幕', value: subtitleLabel, helper: hasSubtitle(track) ? '可打开歌词页查看' : '无字幕也可播放', tone: hasSubtitle(track) ? 'amber' : 'slate' },
        { id: 'queue', label: '队列', value: queueLabel, helper: '仅保存播放队列记录', tone: playerState.queue.length > 0 ? 'brand' : 'slate' },
      ],
    };
  },

  getDiagnosticsModel(): BetaRegressionDiagnosticsModel {
    return {
      title: 'MVP-54 Beta 回归清单与小范围收口',
      description: '本轮把 Beta 0.1 之后的人工回归路径固定到诊断页，同时轻量同步设置页、首页和播放器状态文案。',
      checklist: [
        { id: 'startup', title: '打包版启动', description: '打开打包版后首页、设置页、诊断页应能进入，不出现黑屏。', surface: '打包版', doneLabel: '人工确认', tone: 'emerald' },
        { id: 'settings', title: '资源库恢复', description: '设置页先选择目录，再读取已有记录或执行一键扫描并应用。', surface: '设置', doneLabel: '人工确认', tone: 'brand' },
        { id: 'library', title: '资源库浏览', description: '音声库、音乐库和歌单页能显示本地记录，筛选为空时给出中文提示。', surface: '资源库', doneLabel: '人工确认', tone: 'purple' },
        { id: 'player', title: '播放与字幕', description: '至少确认一个本地音频可播放、暂停、继续，歌词页无字幕时不误报异常。', surface: '播放器', doneLabel: '人工确认', tone: 'amber' },
        { id: 'external', title: '外部打开', description: '视频、图片和文件夹仍走系统外部打开，不进入内置视频播放器。', surface: '打包版', doneLabel: '人工确认', tone: 'slate' },
      ],
      commands: [
        'npm ci --ignore-scripts',
        'npm run lint',
        'npm run build:electron',
        'npm run verify:all',
        'npm run build',
        'npm audit --audit-level=high',
      ],
      guardrails: [
        '不改扫描链路',
        '不改 library-index.json 写入 / 读取链路',
        '不改 HTMLAudio 播放内核',
        '不改字幕读取链路',
        '不接 SQLite / 下载器 / 元数据 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
      deferred: ['SQLite', '下载器', '元数据抓取', 'mpv 后端', '高级文件整理', '批量重命名'],
    };
  },
};
