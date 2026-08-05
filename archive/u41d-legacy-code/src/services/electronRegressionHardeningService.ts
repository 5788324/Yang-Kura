export type ElectronRegressionHardeningTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface ElectronRegressionHardeningChip {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: ElectronRegressionHardeningTone;
}

export interface ElectronRegressionHardeningStep {
  id: string;
  title: string;
  command: string;
  description: string;
  tone: ElectronRegressionHardeningTone;
}

export interface ElectronRegressionHardeningSettingsModel {
  title: string;
  description: string;
  chips: ElectronRegressionHardeningChip[];
  guiFlow: ElectronRegressionHardeningStep[];
  notes: string[];
}

export interface ElectronRegressionHardeningDiagnosticsModel {
  title: string;
  description: string;
  summary: ElectronRegressionHardeningChip[];
  fixes: ElectronRegressionHardeningStep[];
  safetyBoundary: string[];
  nextTestFocus: string[];
}

const toneClassNames: Record<ElectronRegressionHardeningTone, string> = {
  neutral: 'border-border-color/50 bg-card-bg/40 text-text-secondary',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  danger: 'border-red-500/20 bg-red-500/10 text-red-100',
};

export const electronRegressionHardeningService = {
  getToneClassName(tone: ElectronRegressionHardeningTone): string {
    return toneClassNames[tone];
  },

  getSettingsModel(): ElectronRegressionHardeningSettingsModel {
    return {
      title: 'Electron GUI 回归加固',
      description: 'MVP-62 针对 MVP-61 本机报告的 NEEDS_FIX：修复 Windows strict smoke 的 .cmd 启动方式，并把 desktop:setup 升级为 install + rebuild + electron --version 验证。',
      chips: [
        {
          id: 'cmd-wrapper',
          label: 'Windows 启动',
          value: 'cmd.exe /d /c',
          helper: '.cmd wrapper 不再直接 spawn，避免 EINVAL。',
          tone: 'success',
        },
        {
          id: 'setup-flow',
          label: '桌面准备',
          value: 'install + rebuild',
          helper: 'desktop:setup 会补 npm rebuild electron。',
          tone: 'success',
        },
        {
          id: 'node-lts',
          label: '推荐环境',
          value: 'Node 22.12+',
          helper: '正式门禁仍是 Node 22 / npm 10。',
          tone: 'warning',
        },
      ],
      guiFlow: [
        {
          id: 'node22',
          title: '切换到 Node 22 LTS',
          command: 'nvm use 22',
          description: '建议使用 Node 22.12+ / npm 10.x；22.11 可过项目门禁，但后续本机回归优先用 22.12+。',
          tone: 'warning',
        },
        {
          id: 'setup',
          title: '修复 Electron binary',
          command: 'npm run desktop:setup',
          description: '现在会执行 npm install electron@^39.8.10 --save-dev、npm rebuild electron，并验证 electron --version。',
          tone: 'success',
        },
        {
          id: 'strict',
          title: '严格桌面 smoke',
          command: 'npm run desktop:smoke-check:strict',
          description: '检查 wrapper、path.txt、resolved binary 和 electron --version；Windows 通过 cmd.exe /d /c 启动 .cmd。',
          tone: 'success',
        },
        {
          id: 'launch',
          title: '启动 GUI 回归',
          command: 'npm run dev:electron',
          description: '3000 端口占用时设置 YANG_KURA_VITE_DEV_URL 到 3001 或其他空闲端口。',
          tone: 'neutral',
        },
      ],
      notes: [
        'desktop:setup 不再只是 electron:install；它会 rebuild electron，修复 path.txt / dist/electron.exe 缺失问题。',
        'desktop:smoke-check:strict 不再直接 spawn electron.cmd；Windows 下统一走 cmd.exe /d /c。',
        '普通 desktop:smoke-check 仍是 advisory，不阻塞源码验证；严格模式只用于本机 GUI 回归。',
      ],
    };
  },

  getDiagnosticsModel(): ElectronRegressionHardeningDiagnosticsModel {
    return {
      title: 'MVP-62 Electron 回归加固',
      description: 'MVP-62 只修本机 GUI 回归阻塞：strict smoke 的 Windows .cmd EINVAL、desktop:setup 未 rebuild electron、Node 22.12+ 建议说明。',
      summary: [
        {
          id: 'result',
          label: '目标状态',
          value: '重新测 GUI',
          helper: '修复后请 Codex 在本机重跑 MVP-62 回归。',
          tone: 'neutral',
        },
        {
          id: 'cmd',
          label: '.cmd 启动',
          value: '已加固',
          helper: 'strict smoke / preview 均使用 cmd.exe /d /c。',
          tone: 'success',
        },
        {
          id: 'setup',
          label: 'Electron setup',
          value: 'rebuild included',
          helper: '补全 path.txt 与 dist/electron.exe。',
          tone: 'success',
        },
        {
          id: 'scope',
          label: '功能范围',
          value: '不加功能',
          helper: '只修回归阻塞，不改真实链路。',
          tone: 'warning',
        },
      ],
      fixes: [
        {
          id: 'setup-script',
          title: 'desktop:setup 升级',
          command: 'npm run desktop:setup',
          description: '新增 setup-electron-desktop.mjs，串行执行 install、rebuild、electron --version。',
          tone: 'success',
        },
        {
          id: 'strict-cmd',
          title: 'strict smoke 修复 .cmd EINVAL',
          command: 'npm run desktop:smoke-check:strict',
          description: 'Windows 下不再直接 spawn electron.cmd，而是 cmd.exe /d /c electron.cmd --version。',
          tone: 'success',
        },
        {
          id: 'binary-checks',
          title: 'Electron binary 完整性检查',
          command: 'path.txt + resolved binary + electron --version',
          description: '严格检查 path.txt 和解析出的 Electron 可执行文件，而不是只看 wrapper 是否存在。',
          tone: 'success',
        },
        {
          id: 'node-note',
          title: 'Node 22.12+ 建议',
          command: 'node -v && npm -v',
          description: '项目门禁仍为 Node 22 / npm 10；本机 GUI 回归建议使用 Node 22.12+ LTS 小版本。',
          tone: 'warning',
        },
      ],
      safetyBoundary: [
        '不接 SQLite、下载器、元数据抓取或 mpv。',
        '不删除、移动、重命名真实媒体文件。',
        'Renderer 仍不接收 absolutePath 或 file://。',
        '本轮只改脚本、文档、诊断说明和验证器，不改扫描、写 index、播放内核。',
      ],
      nextTestFocus: [
        'Node 22.12+ / npm 10 环境下 verify:all PASS',
        'desktop:setup 后 path.txt / dist/electron.exe 存在',
        'desktop:smoke-check:strict 在 Windows 不再 EINVAL',
        'dev:electron 可打开 Yang-Kura Audio Library 窗口',
      ],
    };
  },
};
