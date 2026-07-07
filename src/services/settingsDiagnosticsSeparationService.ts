export type Mvp44SurfaceTone = 'daily' | 'advanced' | 'diagnostic' | 'safe';

export interface Mvp44SurfaceCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp44SurfaceTone;
  bullets: string[];
}

export interface Mvp44SettingsDiagnosticsSeparationModel {
  version: string;
  settingsTitle: string;
  settingsDescription: string;
  diagnosticTitle: string;
  diagnosticDescription: string;
  dailyFlowCards: Mvp44SurfaceCard[];
  separationCards: Mvp44SurfaceCard[];
  diagnosticCards: Mvp44SurfaceCard[];
  safetyRules: string[];
}

const dailyFlowCards: Mvp44SurfaceCard[] = [
  {
    id: 'choose-root',
    title: '选择资源库目录',
    description: '先选择音声库或音乐库目录，桌面端只把目录令牌交给界面。',
    tone: 'daily',
    bullets: ['适合首次导入', '不显示真实磁盘路径', '不会自动扫描'],
  },
  {
    id: 'read-existing-index',
    title: '读取现有记录',
    description: '目录中已经有 library-index.json 时，优先读取现有资源库记录。',
    tone: 'daily',
    bullets: ['重启后恢复资源库', '最快进入音声库 / 音乐库', '不重写媒体文件'],
  },
  {
    id: 'scan-and-apply',
    title: '一键扫描并应用',
    description: '资源有变化时再执行扫描、写入预览、写入记录与读取应用。',
    tone: 'advanced',
    bullets: ['仍然只更新索引记录', '自动备份旧记录', '不会删除/移动/重命名媒体文件'],
  },
];

const separationCards: Mvp44SurfaceCard[] = [
  {
    id: 'settings-daily',
    title: '设置页：日常入口',
    description: '保留主题、目录选择、读取现有记录、一键扫描并应用。',
    tone: 'daily',
    bullets: ['面向日常使用', '文案保持中文', '不暴露工程合同'],
  },
  {
    id: 'settings-advanced',
    title: '高级资源库工具',
    description: '扫描预览、写入预览、安全流程折叠到高级区。',
    tone: 'advanced',
    bullets: ['需要时再展开', '适合排查导入问题', '仍然不修改媒体文件'],
  },
  {
    id: 'diagnostics-tech',
    title: '诊断页：技术细节',
    description: 'Electron、IPC、扫描合同、打包验收等详细信息集中放到诊断页。',
    tone: 'diagnostic',
    bullets: ['服务开发与验收', '不干扰主界面', '允许保留 MVP/Contract 等词'],
  },
];

const diagnosticCards: Mvp44SurfaceCard[] = [
  {
    id: 'resource-diagnostics',
    title: '资源库诊断',
    description: '查看扫描预览、索引写入/读取记录、资源状态和异常摘要。',
    tone: 'diagnostic',
    bullets: ['用于定位导入问题', '详细信息不放首页', '可配合高级资源库工具使用'],
  },
  {
    id: 'desktop-diagnostics',
    title: '桌面端与打包诊断',
    description: '保留 Electron 桌面端、preload、打包与本地协议相关验收信息。',
    tone: 'diagnostic',
    bullets: ['便于回归打包版', '定位播放/字幕/外部打开', '不作为日常播放入口'],
  },
  {
    id: 'safety-diagnostics',
    title: '文件安全边界',
    description: '集中展示不会执行的危险动作，避免后续任务越界。',
    tone: 'safe',
    bullets: ['不删除文件', '不移动文件', '不重命名文件'],
  },
];

const safetyRules = [
  'Renderer 不接收 absolutePath 或 file://。',
  '主界面不展示 Scanner / Contract / Stub 等工程词。',
  '诊断页可以保留详细工程信息，但必须明确不做文件破坏性操作。',
  '设置页日常路径优先：选择目录 → 读取现有记录 → 一键扫描并应用。',
  '任何清理、移除、删除类交互只作用于应用列表或索引记录，不触碰真实媒体文件。',
];

export const settingsDiagnosticsSeparationService = {
  getModel(): Mvp44SettingsDiagnosticsSeparationModel {
    return {
      version: '0.82.0-mvp44',
      settingsTitle: '日常设置与高级工具分层',
      settingsDescription:
        'MVP-44 将普通用户每天要用的入口保留在设置页上层，把扫描合同、写入预览和调试信息继续收进高级工具与诊断页。',
      diagnosticTitle: '诊断工具中心',
      diagnosticDescription:
        '诊断页集中承载资源库、桌面端、打包验收和安全边界信息；首页、音声库、音乐库和播放器继续保持媒体产品体验。',
      dailyFlowCards,
      separationCards,
      diagnosticCards,
      safetyRules,
    };
  },
};
