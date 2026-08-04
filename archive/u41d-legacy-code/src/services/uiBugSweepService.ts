export type Mvp82UiBugSweepTone = 'emerald' | 'sky' | 'amber' | 'violet';

export interface Mvp82UiBugSweepItem {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: Mvp82UiBugSweepTone;
}

export interface Mvp82UiBugSweepModel {
  title: string;
  summary: string;
  source: string;
  fixes: Mvp82UiBugSweepItem[];
  reviewNotes: string[];
  guardrails: string[];
}

function getModel(): Mvp82UiBugSweepModel {
  return {
    title: 'MVP-82 UI bug sweep',
    summary: '根据 DeepSeek 三次静态/运行时审查，补齐仍残留的非标准 Tailwind 类、动画定义和时长显示容错；保持真实扫描、写 index、播放内核和文件安全边界不变。',
    source: 'DeepSeek review: LyricsPanel / Dashboard / AsmrLibrary / MusicLibrary',
    fixes: [
      {
        id: 'tailwind-scale-cleanup',
        label: '封面 hover 动效',
        status: '已修复',
        detail: 'Dashboard / AsmrLibrary / MusicLibrary 中残留的非标准封面 hover scale 已统一改为有效 scale-105。',
        tone: 'emerald',
      },
      {
        id: 'white-opacity-cleanup',
        label: '播放器大页弱背景',
        status: '已修复',
        detail: 'LyricsPanel 中过低透明度白色背景已改为 bg-white/5，避免 Tailwind 工具类静默失效。',
        tone: 'sky',
      },
      {
        id: 'modal-animation',
        label: '弹窗动画',
        status: '已补齐',
        detail: 'index.css 增加 animate-scale-up 的 theme token 与 keyframes，匹配 AsmrLibrary / AsmrDetail 编辑弹窗。',
        tone: 'violet',
      },
      {
        id: 'duration-fallback',
        label: '时长容错',
        status: '已补强',
        detail: 'Dashboard / AsmrLibrary / MusicLibrary / PlaylistPage / AsmrDetail / LyricsPanel 的 formatDuration 加入 finite guard，避免 NaN:NaN。',
        tone: 'amber',
      },
    ],
    reviewNotes: [
      'DeepSeek 对 MVP81 的建议项中，LyricsPanel progress clamp 已在 MVP78/MVP81 代码中存在，本轮仅复核并保持。',
      'animate-bounce-subtle 已在 MVP79 补齐，本轮新增 animate-scale-up，避免弹窗动画无效。',
      '本轮只清理 UI class / 动画 / 显示容错，不新增任何真实媒体、下载、扫描或文件修改能力。',
    ],
    guardrails: [
      '不接 SQLite',
      '不接下载器',
      '不接 ASMR.one / DLsite / 网易云元数据抓取',
      '不接 mpv',
      '不删除 / 移动 / 重命名真实媒体文件',
      '不向 Renderer 暴露 absolutePath / file://',
      '不改真实扫描 / 写 index / 播放内核链路',
    ],
  };
}

function getToneClassName(tone: Mvp82UiBugSweepTone): string {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
    case 'sky':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-100';
    case 'amber':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-100';
    case 'violet':
    default:
      return 'border-violet-500/20 bg-violet-500/10 text-violet-100';
  }
}

export const uiBugSweepService = {
  getModel,
  getToneClassName,
};
