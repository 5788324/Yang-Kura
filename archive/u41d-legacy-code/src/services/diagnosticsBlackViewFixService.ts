export interface DiagnosticsBlackViewFixItem {
  id: string;
  label: string;
  value: string;
  tone: 'safe' | 'warning' | 'info';
}

export interface DiagnosticsBlackViewFixModel {
  title: string;
  description: string;
  summary: DiagnosticsBlackViewFixItem[];
  nextRetest: string[];
  safetyBoundary: string[];
}

const toneClassNames: Record<DiagnosticsBlackViewFixItem['tone'], string> = {
  safe: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-200',
};

export const diagnosticsBlackViewFixService = {
  getModel(): DiagnosticsBlackViewFixModel {
    return {
      title: 'MVP-64 诊断页黑视图修复',
      description:
        '针对本机 GUI 回归中点击诊断工具后出现黑屏 / 黑视图的问题，MVP-64 在 App 层增加诊断页运行时保护壳，避免 DiagnosticsPage 局部异常拖垮整个 Electron 窗口。',
      summary: [
        {
          id: 'runtime-boundary',
          label: '运行时保护',
          value: 'DiagnosticsRuntimeBoundary 包裹 DiagnosticsPage',
          tone: 'safe',
        },
        {
          id: 'fallback-view',
          label: '降级视图',
          value: '出现异常时显示中文安全降级页，不再黑屏',
          tone: 'safe',
        },
        {
          id: 'gui-retest',
          label: '本机复测',
          value: '继续复测诊断页点击、返回主界面、再次进入诊断页',
          tone: 'warning',
        },
      ],
      nextRetest: [
        'npm run desktop:setup',
        'npm run desktop:smoke-check:strict',
        'npm run dev:electron',
        '点击左侧“诊断工具”，确认不再黑视图',
        '如诊断区块仍有运行时错误，应显示 mvp64-diagnostics-runtime-fallback，而不是整窗黑屏',
      ],
      safetyBoundary: [
        '不接 SQLite',
        '不接下载器',
        '不接 ASMR.one / DLsite / 网易云元数据抓取',
        '不接 mpv',
        '不删除 / 移动 / 重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
    };
  },
  getToneClassName(tone: DiagnosticsBlackViewFixItem['tone']) {
    return toneClassNames[tone];
  },
};

export type DiagnosticsBlackViewFixService = typeof diagnosticsBlackViewFixService;
