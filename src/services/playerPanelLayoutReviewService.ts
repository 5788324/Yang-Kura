export type Mvp78PlayerLayoutTone = 'sky' | 'emerald' | 'amber' | 'violet' | 'zinc';

export interface Mvp78PlayerLayoutCheck {
  id: string;
  label: string;
  description: string;
  expected: string;
  tone: Mvp78PlayerLayoutTone;
}

export interface Mvp78PlayerLayoutMode {
  id: string;
  title: string;
  description: string;
  checks: Mvp78PlayerLayoutCheck[];
}

export interface Mvp78PlayerLayoutReviewModel {
  title: string;
  description: string;
  visibleMarker: string;
  modes: Mvp78PlayerLayoutMode[];
  guardrails: string[];
  hiddenMaintenanceNote: string;
}

const checks = {
  safeProgress: {
    id: 'safe-progress',
    label: '播放页进度安全',
    description: '全屏播放页使用 safe duration / clamp / finite guard，避免 NaN、负数或超过 100%。',
    expected: '进度条宽度、滑块位置、range value 都保持在 0～duration。',
    tone: 'emerald' as const,
  },
  smallWindow: {
    id: 'small-window',
    label: '小窗口换行',
    description: '底部控制区在窄屏下从三列改为纵向堆叠，控制按钮允许换行。',
    expected: '长标题、队列按钮、睡眠定时和音量不会互相挤压。',
    tone: 'sky' as const,
  },
  lyricsReading: {
    id: 'lyrics-reading',
    label: '歌词阅读宽度',
    description: '歌词模式限制正文最大宽度，增加横向安全 padding，避免长句贴边。',
    expected: '中日双语长句可阅读，歌词容器不会撑破页面。',
    tone: 'violet' as const,
  },
  vinylCover: {
    id: 'vinyl-cover',
    label: '黑胶尺寸安全',
    description: '黑胶模式使用 clamp 尺寸，避免低高度窗口下唱片和底栏互相遮挡。',
    expected: '大屏仍保持氛围，小窗口时唱片自动缩小。',
    tone: 'amber' as const,
  },
  headerWrap: {
    id: 'header-wrap',
    label: '顶部模式切换换行',
    description: '顶部返回、模式切换、播放状态区域允许换行，窄屏隐藏非必要装饰。',
    expected: '顶部区域不横向溢出。',
    tone: 'zinc' as const,
  },
};

export const playerPanelLayoutReviewService = {
  getToneClassName(tone: Mvp78PlayerLayoutTone): string {
    if (tone === 'emerald') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    if (tone === 'sky') return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    if (tone === 'amber') return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    if (tone === 'violet') return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    return 'border-zinc-500/20 bg-zinc-500/10 text-zinc-50';
  },

  getModel(): Mvp78PlayerLayoutReviewModel {
    return {
      title: 'MVP-78 播放器大页 / 歌词页布局审查',
      description: '检查经典、黑胶、歌词三种播放页在窄屏、长标题、长歌词、底部控制栏场景下的布局稳定性。',
      visibleMarker: 'mvp78-player-panel-layout-review',
      modes: [
        {
          id: 'classic-player-layout',
          title: '经典详情页',
          description: '封面 / 唱片、右侧歌词/队列栏和底部控制栏不互相遮挡。',
          checks: [checks.safeProgress, checks.smallWindow, checks.headerWrap],
        },
        {
          id: 'vinyl-player-layout',
          title: '黑胶沉浸页',
          description: '黑胶唱片使用响应式尺寸，小窗口优先保留播放控制和标题。',
          checks: [checks.vinylCover, checks.smallWindow],
        },
        {
          id: 'lyrics-player-layout',
          title: '歌词专注页',
          description: '歌词正文居中且受最大宽度约束，长句和双语字幕不会横向撑开。',
          checks: [checks.lyricsReading, checks.safeProgress],
        },
      ],
      guardrails: [
        '不改 HTMLAudio 播放内核',
        '不改真实扫描 / 写 index 链路',
        '不接 mpv',
        '不向 Renderer 暴露 absolutePath / file://',
        '不删除、移动、重命名真实媒体文件',
      ],
      hiddenMaintenanceNote: 'MVP-78 marker: 播放器大页只做布局与进度显示安全收口；播放、扫描、写 index、字幕读取真实链路不变。',
    };
  },
};

// MVP-78 verification note: full player panel / lyrics panel layout review only; no scanner/index/playback backend change.
