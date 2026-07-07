export type PackagedRegressionTone = 'success' | 'info' | 'warning';

export interface PackagedRegressionCheck {
  id: string;
  title: string;
  description: string;
  owner: '自动验证' | '本机人工确认' | '保持后置';
  tone: PackagedRegressionTone;
}

export interface PackagedRegressionCommand {
  id: string;
  command: string;
  purpose: string;
}

export interface PackagedRegressionValidationModel {
  title: string;
  description: string;
  summary: string;
  commands: PackagedRegressionCommand[];
  checks: PackagedRegressionCheck[];
  safetyRules: string[];
  deferredItems: string[];
}

const commands: PackagedRegressionCommand[] = [
  {
    id: 'install',
    command: 'npm ci --ignore-scripts',
    purpose: '安装依赖并避免 postinstall 自动触发额外动作。',
  },
  {
    id: 'lint',
    command: 'npm run lint',
    purpose: '检查 TypeScript 与组件类型。',
  },
  {
    id: 'electron-build',
    command: 'npm run build:electron',
    purpose: '确认 Electron main/preload 可以编译。',
  },
  {
    id: 'verify-all',
    command: 'npm run verify:all',
    purpose: '运行 MVP-01 到当前阶段的安全与交接验证。',
  },
  {
    id: 'frontend-build',
    command: 'npm run build',
    purpose: '确认 Vite 前端生产构建可用。',
  },
  {
    id: 'audit',
    command: 'npm audit --audit-level=high',
    purpose: '检查 high 级依赖风险。',
  },
];

const checks: PackagedRegressionCheck[] = [
  {
    id: 'window-opens',
    title: '打包版启动',
    description: '窗口应正常打开，不出现黑屏；首页、设置页、诊断页都能进入。',
    owner: '本机人工确认',
    tone: 'success',
  },
  {
    id: 'library-session',
    title: '资源库恢复提示',
    description: '重启后应提示重新选择同一个资源库，再读取已有记录。',
    owner: '本机人工确认',
    tone: 'info',
  },
  {
    id: 'index-loop',
    title: '索引闭环',
    description: '选择目录、dry-run、写入或读取 library-index.json 后，音声库和音乐库应显示真实记录。',
    owner: '本机人工确认',
    tone: 'success',
  },
  {
    id: 'playback-loop',
    title: '播放闭环',
    description: '至少确认一个本地音频可播放、暂停、继续，并能记录最近播放。',
    owner: '本机人工确认',
    tone: 'success',
  },
  {
    id: 'subtitle-loop',
    title: '字幕读取',
    description: '有同名字幕时歌词页应能显示 LRC / SRT / VTT / ASS 文本。',
    owner: '本机人工确认',
    tone: 'info',
  },
  {
    id: 'external-open',
    title: '外部打开',
    description: '视频、图片和所在文件夹仍走系统外部打开，不进入内置视频播放器。',
    owner: '本机人工确认',
    tone: 'info',
  },
  {
    id: 'safety-surface',
    title: '安全边界',
    description: '主界面不展示原始绝对路径或 file 协议，也不提供删除、移动、重命名真实媒体文件入口。',
    owner: '自动验证',
    tone: 'warning',
  },
];

const safetyRules = [
  'Renderer 不接收 absolutePath。',
  'Renderer 不接收 file://。',
  '不删除、移动、重命名真实媒体文件。',
  '打包回归只验证现有链路，不新增下载器、SQLite、元数据抓取或 mpv。',
  '诊断页可显示技术检查，首页和资源库页继续保持中文媒体产品表层。',
];

const deferredItems = ['SQLite', '下载器', 'ASMR.one / DLsite 元数据抓取', 'mpv 后端', '高级文件整理 / 批量重命名'];

export const packagedRegressionValidationService = {
  getModel(): PackagedRegressionValidationModel {
    return {
      title: '打包版回归验收',
      description:
        '用于 MVP-47 阶段检查 Windows 打包版关键路径：启动、资源库恢复、索引读取、播放、字幕和外部打开。',
      summary: '本轮只做回归检查与小范围文案清理，不改变扫描、播放、索引写入或文件操作链路。',
      commands,
      checks,
      safetyRules,
      deferredItems,
    };
  },
};
