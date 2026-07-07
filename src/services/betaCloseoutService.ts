export type BetaCloseoutTone = 'success' | 'info' | 'warning';

export interface BetaCloseoutCapability {
  id: string;
  title: string;
  description: string;
  status: '已完成' | '已验证链路' | '继续打磨';
  tone: BetaCloseoutTone;
}

export interface BetaCloseoutNextStep {
  id: string;
  title: string;
  description: string;
}

export interface BetaCloseoutModel {
  title: string;
  milestone: string;
  description: string;
  summary: string;
  capabilities: BetaCloseoutCapability[];
  regressionChecklist: string[];
  safetyRules: string[];
  deferredItems: string[];
  nextSteps: BetaCloseoutNextStep[];
}

const capabilities: BetaCloseoutCapability[] = [
  {
    id: 'local-index-loop',
    title: '本地资源库闭环',
    description: '选择目录、dry-run 扫描、写入 / 备份 library-index.json，再读取到音声库和音乐库。',
    status: '已验证链路',
    tone: 'success',
  },
  {
    id: 'listening-loop',
    title: '本地听音频闭环',
    description: 'HTMLAudio 播放本地音频，记录继续播放、最近播放、队列和播放完成策略。',
    status: '已完成',
    tone: 'success',
  },
  {
    id: 'lyrics-loop',
    title: '字幕 / 歌词读取',
    description: '读取同名 LRC / SRT / VTT / ASS，并在播放器歌词表层展示。',
    status: '已完成',
    tone: 'info',
  },
  {
    id: 'media-surface',
    title: '中文媒体库表层',
    description: '首页、音声库、音乐库、歌单、播放器页已经从工程面板逐步收成媒体产品界面。',
    status: '继续打磨',
    tone: 'info',
  },
  {
    id: 'packaged-app',
    title: 'Windows 打包链路',
    description: 'portable / installer 打包、打包版启动修复、资源库恢复提示和回归验收清单已建立。',
    status: '已验证链路',
    tone: 'success',
  },
  {
    id: 'safe-boundary',
    title: '本地文件安全边界',
    description: 'Renderer 只处理 tokenized 路径和媒体 URL，不接收原始绝对路径或 file 协议。',
    status: '已完成',
    tone: 'warning',
  },
];

const regressionChecklist = [
  '启动打包版，确认首页 / 设置 / 诊断页可打开。',
  '重新选择同一个资源库，读取已有 library-index.json。',
  '确认音声库 / 音乐库能显示真实记录和本地封面。',
  '播放至少一个本地音频，确认继续播放和最近播放可用。',
  '确认同名字幕可显示，视频 / 图片 / 文件夹仍走外部打开。',
  '确认主界面不显示原始 absolutePath 或 file://。',
];

const safetyRules = [
  'Renderer 不接收 absolutePath。',
  'Renderer 不接收 file://。',
  '不删除、移动、重命名真实媒体文件。',
  'Beta 0.1 只收口现有可用链路，不新增后端大功能。',
  '主界面保持中文媒体感，技术细节继续放在诊断页。',
];

const deferredItems = ['SQLite', '下载器', 'ASMR.one / DLsite 元数据抓取', 'mpv 后端', '高级文件整理 / 批量重命名', '转录 / 翻译 / LRC 生成任务队列'];

const nextSteps: BetaCloseoutNextStep[] = [
  {
    id: 'beta-ui-polish',
    title: '播放器与首页继续美化',
    description: '继续向网易云 / YesPlayMusic 的媒体感靠拢，减少工具面板感。',
  },
  {
    id: 'library-browse-polish',
    title: '资源库浏览增强',
    description: '继续优化搜索、筛选、排序、封面墙和空状态，不改真实文件。',
  },
  {
    id: 'packaged-regression',
    title: '打包版人工回归',
    description: '在 Windows 本机用真实小样本资源库完成一次 Beta 0.1 回归验收。',
  },
];

export const betaCloseoutService = {
  getModel(): BetaCloseoutModel {
    return {
      title: 'Beta 0.1 阶段收口',
      milestone: '个人可用 Beta 0.1',
      description: '汇总 MVP-01 到 MVP-48 的可用能力、回归重点、安全边界和后置功能，作为下一阶段继续打磨的稳定基线。',
      summary: '本轮只做阶段收口与交接整理，不改变扫描、索引写入、播放、字幕、打包或文件操作链路。',
      capabilities,
      regressionChecklist,
      safetyRules,
      deferredItems,
      nextSteps,
    };
  },
};
