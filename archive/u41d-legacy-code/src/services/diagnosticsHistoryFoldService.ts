export type Mvp75DiagnosticsHistoryTone = 'emerald' | 'sky' | 'violet' | 'amber' | 'zinc';

export interface Mvp75DiagnosticsHistoryGroup {
  id: string;
  title: string;
  range: string;
  summary: string;
  items: string[];
  tone: Mvp75DiagnosticsHistoryTone;
}

export interface Mvp75DiagnosticsHistoryFoldModel {
  title: string;
  subtitle: string;
  dailySummary: string[];
  groups: Mvp75DiagnosticsHistoryGroup[];
  hiddenMaintenanceNote: string;
}

export const diagnosticsHistoryFoldService = {
  getToneClassName(tone: Mvp75DiagnosticsHistoryTone): string {
    if (tone === 'emerald') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    if (tone === 'sky') return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    if (tone === 'violet') return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    if (tone === 'amber') return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    return 'border-white/10 bg-white/5 text-text-secondary';
  },

  getModel(): Mvp75DiagnosticsHistoryFoldModel {
    return {
      title: '诊断页历史默认折叠',
      subtitle: '普通使用只显示资源库状态、安全边界和必要提示；MVP、Verifier、Contract、IPC 历史全部进入分组详情。',
      dailySummary: [
        '日常只看：资源库状态、播放/字幕状态、文件安全边界。',
        'AI 维护需要时再展开阶段历史，不再一屏堆满工程区块。',
        '历史 verifier marker 保留，不删除、不改真实扫描/播放/写 index 链路。',
      ],
      groups: [
        {
          id: 'scanner-index',
          title: '资源库扫描 / 索引',
          range: 'MVP-01～MVP-33',
          summary: '从 Demo 降级、fixture scanner、dry-run、写入/读取 Local JSON Index 到资源库浏览筛选。',
          items: ['Fixture', 'Dry-run', '写 index', '读 index', '浏览筛选'],
          tone: 'emerald',
        },
        {
          id: 'electron-ipc',
          title: 'Electron / IPC / 打包',
          range: 'MVP-13～MVP-32',
          summary: 'Electron 文件访问边界、preload、目录选择、外部打开、Windows 打包和启动恢复。',
          items: ['preload', 'tokenized root', '外部打开', '打包验收', '启动恢复'],
          tone: 'sky',
        },
        {
          id: 'playback-lyrics',
          title: '播放 / 字幕 / 队列',
          range: 'MVP-25～MVP-42',
          summary: 'HTMLAudio 本地播放、LRC/SRT/VTT/ASS 字幕、播放历史、队列和日常听音表层。',
          items: ['本地音频', '字幕读取', '播放历史', '队列持久化', '结束策略'],
          tone: 'violet',
        },
        {
          id: 'ui-surface',
          title: '日常 UI 收口',
          range: 'MVP-38～MVP-74',
          summary: '首页、音声库、音乐库、歌单、播放器大页和底栏逐步减少工程感。',
          items: ['首页', '资源库卡片', '播放器大页', '底栏', '空状态'],
          tone: 'amber',
        },
        {
          id: 'beta-handoff',
          title: 'Beta / 交接 / 历史验证',
          range: 'MVP-60～MVP-75',
          summary: 'Beta 0.1 RC、最终交接包、AI 维护区、历史验证与本轮诊断分组折叠。',
          items: ['RC', '用户指南', '最终交接', 'AI 维护', '历史分组'],
          tone: 'zinc',
        },
      ],
      hiddenMaintenanceNote: 'MVP-75 marker: 诊断页按阶段分组折叠，历史 verifier marker 保留；播放器进度条增加 clamp / finite guard / ref-backed seek fix。',
    };
  },
};

// MVP-75 verification note: 诊断页 MVP 历史默认折叠，并修复播放器底栏进度条潜在 NaN/越界/拖拽旧值问题。
// Safety note: 不接 SQLite；不删除、移动、重命名真实媒体文件；不向 Renderer 暴露 absolutePath；不向 Renderer 暴露 file://；不改扫描、写 index、播放内核链路。
