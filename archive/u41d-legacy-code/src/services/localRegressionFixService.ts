export type LocalRegressionFixTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface LocalRegressionFixChip {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: LocalRegressionFixTone;
}

export interface LocalRegressionFixStep {
  id: string;
  title: string;
  command: string;
  description: string;
  tone: LocalRegressionFixTone;
}

export interface LocalRegressionFixSettingsModel {
  title: string;
  description: string;
  chips: LocalRegressionFixChip[];
  localFlow: LocalRegressionFixStep[];
  notes: string[];
}

export interface LocalRegressionFixDiagnosticsModel {
  title: string;
  description: string;
  summary: LocalRegressionFixChip[];
  blockersFixed: LocalRegressionFixStep[];
  safetyReview: string[];
  deferred: string[];
}

const toneClassNames: Record<LocalRegressionFixTone, string> = {
  neutral: 'border-border-color/50 bg-card-bg/40 text-text-secondary',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  danger: 'border-red-500/20 bg-red-500/10 text-red-100',
};

export const localRegressionFixService = {
  getToneClassName(tone: LocalRegressionFixTone): string {
    return toneClassNames[tone];
  },

  getSettingsModel(): LocalRegressionFixSettingsModel {
    return {
      title: '本机回归启动修复',
      description: 'MVP-61 根据 Codex 本机报告收口桌面启动路径：统一 dev:electron 入口，补 desktop:setup，并把 Electron CLI 完整性检查放进严格 smoke check。',
      chips: [
        {
          id: 'node-gate',
          label: '环境门禁',
          value: 'Node 22 / npm 10',
          helper: 'verify:env 不为 Node 24 放宽。',
          tone: 'warning',
        },
        {
          id: 'desktop-alias',
          label: '桌面入口',
          value: 'dev:electron',
          helper: '等价于 desktop:dev，方便本机回归。',
          tone: 'success',
        },
        {
          id: 'electron-check',
          label: 'Electron 检查',
          value: 'strict smoke',
          helper: '可发现 binary 未安装完整。',
          tone: 'success',
        },
      ],
      localFlow: [
        {
          id: 'use-node22',
          title: '切到项目要求环境',
          command: 'nvm use 22',
          description: '本机完整回归使用 Node 22 LTS / npm 10.x；Node 24 只能做临时 smoke，不用于最终 verify:all。',
          tone: 'warning',
        },
        {
          id: 'source-check',
          title: '源码验证',
          command: 'npm ci --ignore-scripts && npm run verify:all',
          description: '源码验证仍不依赖 GUI，不强制下载 Electron binary。',
          tone: 'neutral',
        },
        {
          id: 'desktop-setup',
          title: '桌面回归准备',
          command: 'npm run desktop:setup',
          description: 'GUI 回归前修复 Electron binary；随后跑 desktop:smoke-check:strict。',
          tone: 'success',
        },
        {
          id: 'desktop-launch',
          title: '打开桌面窗口',
          command: 'npm run dev:electron',
          description: 'dev:electron 是 desktop:dev 的兼容入口；如 3000 端口占用，换空闲端口再启动。',
          tone: 'success',
        },
      ],
      notes: [
        'desktop:smoke-check 默认仍为 advisory，避免普通源码验证被 GUI 环境阻塞。',
        'desktop:smoke-check:strict 用于本机 GUI 回归，会检查 Electron CLI 是否能执行 --version。',
        'collection.folderPath 在渲染映射中只允许相对/集合记录，拒绝盘符绝对路径和 file://。',
      ],
    };
  },

  getDiagnosticsModel(): LocalRegressionFixDiagnosticsModel {
    return {
      title: 'MVP-61 本机回归阻塞修复',
      description: '针对 MVP-60 本机 Codex 报告的 PARTIAL PASS 原因做收口：脚本命名、Electron 安装检查、Node/npm 门禁、folderPath 安全复核。',
      summary: [
        {
          id: 'candidate',
          label: '候选状态',
          value: '继续 Beta 0.1',
          helper: 'MVP-60 不是功能失败，而是本机 GUI 回归被环境阻塞。',
          tone: 'neutral',
        },
        {
          id: 'script',
          label: '启动脚本',
          value: '已补 dev:electron',
          helper: '保留 desktop:dev，不破坏旧入口。',
          tone: 'success',
        },
        {
          id: 'smoke',
          label: '桌面检查',
          value: 'strict 可选',
          helper: '严格模式会发现 Electron binary 不完整。',
          tone: 'success',
        },
        {
          id: 'path',
          label: '路径边界',
          value: 'folderPath 复核',
          helper: '渲染层不展示盘符绝对路径或 file://。',
          tone: 'success',
        },
      ],
      blockersFixed: [
        {
          id: 'dev-electron',
          title: '脚本命名不一致',
          command: 'npm run dev:electron',
          description: '新增别名，避免 Codex / 用户按提示运行时找不到脚本。',
          tone: 'success',
        },
        {
          id: 'desktop-setup',
          title: 'Electron binary 修复入口',
          command: 'npm run desktop:setup',
          description: '明确 GUI 回归前需要安装或修复 Electron binary。',
          tone: 'success',
        },
        {
          id: 'strict-smoke',
          title: '严格桌面 smoke check',
          command: 'npm run desktop:smoke-check:strict',
          description: '不仅检查 wrapper 是否存在，还会执行 Electron --version。',
          tone: 'success',
        },
        {
          id: 'node22',
          title: 'Node/npm 环境门禁',
          command: 'npm run verify:env',
          description: '继续要求 Node 22 / npm 10，不为 Node 24 放宽正式验证。',
          tone: 'warning',
        },
      ],
      safetyReview: [
        '不接 SQLite、下载器、元数据抓取或 mpv。',
        '不删除、移动、重命名真实媒体文件。',
        'Renderer 仍不接收 absolutePath 或 file://。',
        'libraryIndexAdapter 会过滤 collection.folderPath，避免盘符绝对路径进入详情描述。',
      ],
      deferred: [
        '真实 GUI 点击仍需用户本机执行',
        'Electron moderate audit 继续观察',
        'Vite chunk size warning 后置处理',
        '大组件拆分继续后置',
      ],
    };
  },
};
