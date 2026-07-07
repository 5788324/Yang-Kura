export type ElectronBinaryPathFixTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface ElectronBinaryPathFixChip {
  id: string;
  label: string;
  value: string;
  helper?: string;
  tone: ElectronBinaryPathFixTone;
}

export interface ElectronBinaryPathFixStep {
  id: string;
  title: string;
  command: string;
  description: string;
  tone: ElectronBinaryPathFixTone;
}

export interface ElectronBinaryPathFixSettingsModel {
  title: string;
  description: string;
  chips: ElectronBinaryPathFixChip[];
  testFlow: ElectronBinaryPathFixStep[];
  notes: string[];
}

export interface ElectronBinaryPathFixDiagnosticsModel {
  title: string;
  description: string;
  summary: ElectronBinaryPathFixChip[];
  fixes: ElectronBinaryPathFixStep[];
  retestFocus: string[];
  safetyBoundary: string[];
}

const toneClassNames: Record<ElectronBinaryPathFixTone, string> = {
  neutral: 'border-border-color/50 bg-card-bg/40 text-text-secondary',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  danger: 'border-red-500/20 bg-red-500/10 text-red-100',
};

export const electronBinaryPathFixService = {
  getToneClassName(tone: ElectronBinaryPathFixTone): string {
    return toneClassNames[tone];
  },

  getSettingsModel(): ElectronBinaryPathFixSettingsModel {
    return {
      title: 'Electron binary 路径修复',
      description: 'MVP-63 针对 MVP-62 本机 NEEDS_FIX：path.txt 为 electron.exe 时，脚本现在优先检查 node_modules/electron/dist/electron.exe，避免 desktop:setup 与 strict smoke false negative。',
      chips: [
        {
          id: 'path-txt',
          label: 'path.txt',
          value: 'electron.exe',
          helper: '支持 basename-only metadata。',
          tone: 'success',
        },
        {
          id: 'dist-binary',
          label: 'resolved binary',
          value: 'dist/electron.exe',
          helper: '优先检查 dist/<binary>，再回退包根目录。',
          tone: 'success',
        },
        {
          id: 'strict',
          label: 'strict smoke',
          value: 'false negative fixed',
          helper: '不再因为 node_modules/electron/electron.exe 误判失败。',
          tone: 'success',
        },
      ],
      testFlow: [
        {
          id: 'setup',
          title: '桌面准备',
          command: 'npm run desktop:setup',
          description: '执行 install + rebuild 后，解析 path.txt；当内容是 electron.exe 时检查 dist/electron.exe。',
          tone: 'success',
        },
        {
          id: 'strict',
          title: '严格 smoke',
          command: 'npm run desktop:smoke-check:strict',
          description: '验证 wrapper、path.txt、dist/electron.exe 和 electron --version。',
          tone: 'success',
        },
        {
          id: 'gui',
          title: 'GUI 复测',
          command: 'npm run dev:electron',
          description: '重新复核窗口、设置页、诊断页，尤其是上轮诊断页黑视图。',
          tone: 'warning',
        },
      ],
      notes: [
        'MVP-62 已解决 .cmd EINVAL；MVP-63 只修 resolved binary 路径判断。',
        'setup / strict smoke 会展示 candidate paths，便于 Codex 继续定位 Electron binary 问题。',
        '本轮不新增业务功能，不改扫描、写 index、播放内核或真实文件操作。',
      ],
    };
  },

  getDiagnosticsModel(): ElectronBinaryPathFixDiagnosticsModel {
    return {
      title: 'MVP-63 Electron binary 路径修复',
      description: 'MVP-63 只修 MVP-62 本机报告确认的 false negative：path.txt 内容为 electron.exe 时，resolved binary 应优先指向 node_modules/electron/dist/electron.exe。',
      summary: [
        { id: 'mvp62-result', label: '上轮结论', value: 'NEEDS_FIX', helper: 'setup / strict smoke false negative。', tone: 'warning' },
        { id: 'path', label: '路径解析', value: 'dist fallback', helper: 'basename-only path.txt 优先 dist/<binary>。', tone: 'success' },
        { id: 'cmd', label: '.cmd 启动', value: '保持 cmd.exe /d /c', helper: 'MVP-62 修复保留。', tone: 'success' },
        { id: 'scope', label: '功能范围', value: '不加功能', helper: '只改脚本 / 文档 / verifier。', tone: 'neutral' },
      ],
      fixes: [
        {
          id: 'setup-resolver',
          title: 'setup 解析 dist/electron.exe',
          command: 'scripts/setup-electron-desktop.mjs',
          description: '新增 getElectronResolvedBinaryCandidatePaths，basename-only path.txt 先查 dist/<binary>。',
          tone: 'success',
        },
        {
          id: 'smoke-resolver',
          title: 'strict smoke 解析 dist/electron.exe',
          command: 'scripts/desktop-smoke-check.mjs',
          description: 'strict smoke 不再把 node_modules/electron/electron.exe 当唯一路径。',
          tone: 'success',
        },
        {
          id: 'diagnostics-retest',
          title: '诊断页黑视图复测',
          command: 'npm run dev:electron',
          description: 'MVP-63 包不声称已修 GUI 黑视图；修完 strict smoke 后请本机复测诊断页。',
          tone: 'warning',
        },
      ],
      retestFocus: [
        'desktop:setup 后 path.txt 为 electron.exe 时仍能找到 dist/electron.exe',
        'desktop:smoke-check:strict 不再 false negative',
        'dev:electron 打开窗口后设置页与诊断页都能稳定进入',
        '主界面继续不显示真实盘符路径或 file://',
      ],
      safetyBoundary: [
        '不接 SQLite、下载器、元数据抓取或 mpv。',
        '不删除、移动、重命名真实媒体文件。',
        'Renderer 仍不接收 absolutePath 或 file://。',
        '不改真实扫描、写 index、字幕读取或播放内核。',
      ],
    };
  },
};
