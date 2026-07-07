export interface PlayerUiBugfixItem {
  id: string;
  title: string;
  status: 'fixed' | 'guarded' | 'documented';
  detail: string;
}

export interface PlayerUiBugfixModel {
  title: string;
  version: string;
  summary: string;
  items: PlayerUiBugfixItem[];
  forbiddenScope: string[];
  hiddenMaintenanceNote: string;
  lyricsPanelNote: string;
}

const items: PlayerUiBugfixItem[] = [
  {
    id: 'tailwind-class-normalization',
    title: 'Tailwind 失效类名归一',
    status: 'fixed',
    detail: '替换非标准深色阶、蓝色阶、微小 padding 和非标准缩放 utility，避免细节样式静默失效。',
  },
  {
    id: 'bounce-subtle-animation',
    title: 'bounce-subtle 动画补定义',
    status: 'fixed',
    detail: '在 Tailwind theme 中补齐 animate-bounce-subtle，并使用 translate 属性避免覆盖已有 transform。',
  },
  {
    id: 'playerbar-click-scope',
    title: '播放栏点击范围收窄',
    status: 'fixed',
    detail: '移除播放栏根节点点击即打开歌词页的行为，仅保留封面 / 标题等明确入口。',
  },
  {
    id: 'more-button-feedback',
    title: 'More 死按钮反馈',
    status: 'fixed',
    detail: '更多按钮改为明确提示“后续开放”，避免用户点击无响应。',
  },
  {
    id: 'lrc-fractional-seconds',
    title: 'LRC 小数秒解析统一',
    status: 'guarded',
    detail: 'PlayerBar 与 LyricsPanel 均使用 parseInt / Math.pow 解析毫秒位，避免非严谨 parseFloat 写法。',
  },
  {
    id: 'sleep-clock-refresh',
    title: '睡前暗屏时钟刷新',
    status: 'fixed',
    detail: '暗屏模式进入后每秒刷新时间文本，退出时清理 interval。',
  },
];

// Diagnostics consumer alias token: mvp79PlayerUiBugfix
export const playerUiBugfixService = {
  getModel(): PlayerUiBugfixModel {
    return {
      title: 'MVP-79 播放器 UI bugfix',
      version: '0.117.0-mvp79',
      summary: '修复 DeepSeek 指出的播放器相关 UI 细节问题：失效 Tailwind 类、死按钮、播放栏误触发、LRC 解析与暗屏时钟。',
      items,
      forbiddenScope: [
        '不改真实扫描链路',
        '不改写 library-index.json 链路',
        '不改 HTMLAudio / Electron 媒体协议核心链路',
        '不接 SQLite / 下载器 / 元数据抓取 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
      hiddenMaintenanceNote: 'MVP-79 仅修播放器 UI 样式与交互细节，不改变扫描、写 index、播放内核或文件安全边界。',
      lyricsPanelNote: 'MVP-79 修复 LyricsPanel 非标准 scale 类、LRC 小数秒解析、睡前暗屏时钟刷新和 coverUrl 背景图保护。',
    };
  },
};
