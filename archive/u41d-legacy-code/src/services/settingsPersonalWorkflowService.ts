export type SettingsPersonalWorkflowTone = 'brand' | 'emerald' | 'amber' | 'purple' | 'slate';

export interface SettingsPersonalWorkflowChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: SettingsPersonalWorkflowTone;
}

export interface SettingsPersonalWorkflowStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  tone: SettingsPersonalWorkflowTone;
}

export interface SettingsPersonalPrivacyItem {
  id: string;
  title: string;
  description: string;
  tone: SettingsPersonalWorkflowTone;
}

export interface SettingsPersonalWorkflowModel {
  title: string;
  description: string;
  chips: SettingsPersonalWorkflowChip[];
  steps: SettingsPersonalWorkflowStep[];
  helper: string;
}

export interface SettingsPersonalAboutModel {
  title: string;
  description: string;
  privacyItems: SettingsPersonalPrivacyItem[];
  personalUseNotes: string[];
  deferred: string[];
}

export interface SettingsPersonalDiagnosticsModel {
  title: string;
  description: string;
  summary: SettingsPersonalWorkflowChip[];
  cleanupPlan: SettingsPersonalWorkflowStep[];
  guardrails: string[];
  deferred: string[];
}

const toneClassName: Record<SettingsPersonalWorkflowTone, string> = {
  brand: 'border-brand-color/25 bg-brand-color/10 text-brand-color',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  purple: 'border-purple-500/25 bg-purple-500/10 text-purple-100',
  slate: 'border-border-color/60 bg-card-bg/45 text-text-muted',
};

const personalWorkflowSteps: SettingsPersonalWorkflowStep[] = [
  {
    id: 'choose-root',
    title: '选择资源库',
    description: '选择音声库或音乐库目录，只在主进程侧保存真实路径，界面只显示目录名称和资源库令牌。',
    actionLabel: '设置页日常入口',
    tone: 'brand',
  },
  {
    id: 'read-index',
    title: '读取本地记录',
    description: '优先读取已有 library-index.json；需要更新时再走一键扫描并应用，不进入复杂诊断流程。',
    actionLabel: '本地记录优先',
    tone: 'emerald',
  },
  {
    id: 'listen',
    title: '回到播放器',
    description: '读取记录后回到首页、音声库或音乐库继续播放，设置页不承担日常听音频入口。',
    actionLabel: '主界面媒体感优先',
    tone: 'purple',
  },
];

const deferredFeatures = ['SQLite', '下载器', '元数据抓取', 'mpv 后端', '高级文件整理', '批量重命名'];

export const settingsPersonalWorkflowService = {
  getToneClassName(tone: SettingsPersonalWorkflowTone): string {
    return toneClassName[tone];
  },

  getWorkflowModel(): SettingsPersonalWorkflowModel {
    return {
      title: '个人使用流程',
      description: '设置页只保留日常需要的三步：选择目录、读取记录、回到播放器。高级扫描和诊断继续折叠，避免把个人播放器做成工具平台。',
      helper: '面向个人本地使用：不会上传音频，不接下载器，不删除、移动、重命名真实媒体文件。',
      chips: [
        { id: 'local', label: '数据范围', value: '本机本地', helper: '目录选择和 index 都在本机', tone: 'emerald' },
        { id: 'privacy', label: '隐私策略', value: '不上传', helper: '不发送音频和播放记录', tone: 'brand' },
        { id: 'tools', label: '高级工具', value: '折叠', helper: '扫描细节放诊断页', tone: 'amber' },
      ],
      steps: personalWorkflowSteps,
    };
  },

  getAboutModel(): SettingsPersonalAboutModel {
    return {
      title: '个人本地媒体库说明',
      description: 'Yang-Kura 当前定位是个人本地音频媒体库，服务于 ASMR/RJ 和普通音乐的本机浏览、播放、字幕和歌单记录。项目不按商业产品、云同步平台或下载器套件设计。',
      privacyItems: [
        { id: 'no-upload', title: '不上传真实媒体', description: '本地音频、字幕、封面和播放记录默认只在本机使用，不做云端上传。', tone: 'emerald' },
        { id: 'tokenized-root', title: '界面不显示真实路径', description: 'Renderer 只使用资源库令牌和相对记录，不接收 absolutePath 或 file://。', tone: 'brand' },
        { id: 'no-mutation', title: '不整理真实文件', description: '当前阶段不删除、移动、重命名真实媒体文件，资源库只做读取、播放和记录。', tone: 'amber' },
      ],
      personalUseNotes: [
        '个人使用优先，主界面保持中文媒体播放器体验。',
        '资源不会对外分享，诊断和高级工具默认后置。',
        '资源库规模不按企业级大库设计，Local JSON Index 继续优先。',
      ],
      deferred: deferredFeatures,
    };
  },

  getDiagnosticsModel(): SettingsPersonalDiagnosticsModel {
    return {
      title: 'MVP-58 设置页个人使用流程收口',
      description: '本轮把设置页和关于页继续收成个人本地播放器语境：日常入口更清楚，隐私说明更用户向，高级工具继续折叠。',
      summary: [
        { id: 'settings-flow', label: '设置页', value: '三步流程', helper: '选择目录 / 读取记录 / 回到播放器', tone: 'brand' },
        { id: 'about-copy', label: '关于页', value: '个人本地', helper: '不再像云服务或商业产品说明', tone: 'emerald' },
        { id: 'privacy', label: '隐私边界', value: '更清楚', helper: '不上传、不暴露路径、不整理文件', tone: 'purple' },
        { id: 'advanced', label: '高级工具', value: '继续折叠', helper: '诊断细节不抢日常流程', tone: 'amber' },
      ],
      cleanupPlan: personalWorkflowSteps,
      guardrails: [
        '不改扫描链路',
        '不改 library-index.json 写入 / 读取链路',
        '不改 HTMLAudio 播放内核',
        '不改字幕读取链路',
        '不接 SQLite / 下载器 / 元数据 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
      deferred: deferredFeatures,
    };
  },
};
