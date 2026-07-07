export type ComponentHealthTone = 'brand' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
export type ComponentHealthPriority = '保持观察' | '低风险抽离' | '暂不大拆';

export interface ComponentHealthItem {
  id: string;
  name: string;
  lineCount: number;
  surface: string;
  priority: ComponentHealthPriority;
  note: string;
  nextAction: string;
  tone: ComponentHealthTone;
}

export interface ComponentHealthChip {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: ComponentHealthTone;
}

export interface ComponentHealthSettingsModel {
  title: string;
  description: string;
  chips: ComponentHealthChip[];
  helper: string;
}

export interface ComponentHealthDiagnosticsModel {
  title: string;
  description: string;
  summary: ComponentHealthChip[];
  components: ComponentHealthItem[];
  cleanupPlan: ComponentHealthChip[];
  guardrails: string[];
  deferred: string[];
}

const componentInventory: ComponentHealthItem[] = [
  {
    id: 'diagnostics',
    name: 'DiagnosticsPage.tsx',
    lineCount: 5200,
    surface: '诊断页',
    priority: '暂不大拆',
    note: '承载历史 verifier 锚点和多轮诊断区块，体积最大但风险也最高。',
    nextAction: '后续只继续把新模型抽到 service；暂不拆 DOM 结构。',
    tone: 'rose',
  },
  {
    id: 'settings',
    name: 'SettingsPage.tsx',
    lineCount: 1900,
    surface: '设置页',
    priority: '低风险抽离',
    note: '日常流程、扫描高级工具和关于页混在一起，仍可通过 service 继续减轻页面逻辑。',
    nextAction: '优先抽离文案模型和状态卡，不动目录选择 / 写入预览链路。',
    tone: 'amber',
  },
  {
    id: 'lyrics',
    name: 'LyricsPanel.tsx',
    lineCount: 1735,
    surface: '播放器大页',
    priority: '暂不大拆',
    note: '播放器模式、歌词页、队列和片段标记耦合较多，贸然拆分容易影响播放体验。',
    nextAction: '只继续抽离展示文案和状态模型；暂不拆播放器区域。',
    tone: 'rose',
  },
  {
    id: 'downloader',
    name: 'DownloaderPage.tsx',
    lineCount: 1558,
    surface: '下载器页',
    priority: '保持观察',
    note: '下载器仍是 Demo / 后置入口，当前不应投入真实逻辑。',
    nextAction: '保持 Coming Soon 和安全提示，不接下载器。',
    tone: 'slate',
  },
  {
    id: 'asmr-library',
    name: 'AsmrLibrary.tsx',
    lineCount: 1189,
    surface: '音声库',
    priority: '低风险抽离',
    note: '浏览筛选和空状态已逐步抽 service，后续可以继续收轻 UI 文案。',
    nextAction: '只做卡片/列表表层统一，不改数据来源。',
    tone: 'amber',
  },
  {
    id: 'asmr-detail',
    name: 'AsmrDetail.tsx',
    lineCount: 1160,
    surface: '音声详情',
    priority: '低风险抽离',
    note: '详情导航、文件树和播放入口较多，适合后续做小 service，不适合一次性重构。',
    nextAction: '优先抽离详情摘要和空状态模型。',
    tone: 'amber',
  },
  {
    id: 'music-library',
    name: 'MusicLibrary.tsx',
    lineCount: 762,
    surface: '音乐库',
    priority: '保持观察',
    note: '体积相对可控，已完成浏览摘要和曲目副标题收口。',
    nextAction: '继续做视觉统一，不需要结构性调整。',
    tone: 'emerald',
  },
  {
    id: 'player-bar',
    name: 'PlayerBar.tsx',
    lineCount: 651,
    surface: '底部播放器',
    priority: '保持观察',
    note: '播放器状态条已连续抽 service，当前主要保持稳定。',
    nextAction: '只做小范围视觉 polish，不改播放内核。',
    tone: 'emerald',
  },
  {
    id: 'playlist',
    name: 'PlaylistPage.tsx',
    lineCount: 596,
    surface: '歌单页',
    priority: '保持观察',
    note: '歌单页体积可控，适合继续做中文媒体库表层。',
    nextAction: '保持歌单记录和真实文件安全边界。',
    tone: 'emerald',
  },
  {
    id: 'dashboard',
    name: 'Dashboard.tsx',
    lineCount: 588,
    surface: '首页',
    priority: '保持观察',
    note: '首页已抽出继续播放、最近播放和 Beta 状态模型，体积回到可控区间。',
    nextAction: '继续媒体感打磨，不加入工程面板。',
    tone: 'emerald',
  },
];

const toneClassName: Record<ComponentHealthTone, string> = {
  brand: 'border-brand-color/25 bg-brand-color/10 text-brand-color',
  emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  rose: 'border-rose-500/25 bg-rose-500/10 text-rose-100',
  purple: 'border-purple-500/25 bg-purple-500/10 text-purple-100',
  slate: 'border-border-color/60 bg-card-bg/45 text-text-muted',
};

const largeComponentCount = componentInventory.filter((item) => item.lineCount >= 1000).length;
const safeWatchCount = componentInventory.filter((item) => item.tone === 'emerald').length;

export const componentHealthReviewService = {
  getToneClassName(tone: ComponentHealthTone): string {
    return toneClassName[tone];
  },

  getSettingsModel(): ComponentHealthSettingsModel {
    return {
      title: '组件体检与低风险维护',
      description: '当前不做大重构，只把大组件风险、可抽离区域和继续后置项记录清楚，方便后续稳步清理。',
      helper: '本轮只做只读体检模型和表层提示；不改扫描、索引写入、播放内核和真实媒体文件。',
      chips: [
        { id: 'large', label: '大组件', value: `${largeComponentCount} 个`, helper: '超过 1000 行，暂不一次性拆', tone: 'amber' },
        { id: 'safe', label: '稳定区域', value: `${safeWatchCount} 个`, helper: '继续保持观察和小修', tone: 'emerald' },
        { id: 'strategy', label: '清理策略', value: '先抽 service', helper: '不做破坏性大重构', tone: 'purple' },
      ],
    };
  },

  getDiagnosticsModel(): ComponentHealthDiagnosticsModel {
    return {
      title: 'MVP-55 组件体检与低风险结构清理计划',
      description: '本轮把当前主要页面组件按体积、风险和后续动作做一次收口，明确哪些可以继续抽 service，哪些暂不大拆。',
      summary: [
        { id: 'components', label: '检查组件', value: `${componentInventory.length} 个`, helper: '覆盖首页、播放器、资源库、设置、诊断', tone: 'brand' },
        { id: 'large', label: '大组件', value: `${largeComponentCount} 个`, helper: '优先避免继续膨胀', tone: 'amber' },
        { id: 'safe', label: '稳定区域', value: `${safeWatchCount} 个`, helper: '保持小步 polish', tone: 'emerald' },
        { id: 'risk', label: '大重构', value: '不执行', helper: 'Beta 0.1 稳定优先', tone: 'rose' },
      ],
      components: componentInventory,
      cleanupPlan: [
        { id: 'service', label: '第一优先级', value: '继续抽 service', helper: '文案、状态 chip、摘要模型优先外置', tone: 'purple' },
        { id: 'diagnostics', label: '诊断页', value: '只收新模型', helper: '保留历史锚点，不拆旧区块', tone: 'amber' },
        { id: 'player', label: '播放器', value: '表层精修', helper: '不改 HTMLAudio / 字幕读取 / 队列', tone: 'emerald' },
        { id: 'library', label: '资源库', value: '浏览统一', helper: '不改 Local JSON Index 数据链路', tone: 'brand' },
      ],
      guardrails: [
        '不做大组件一次性拆分',
        '不改扫描链路',
        '不改 library-index.json 写入 / 读取链路',
        '不改 HTMLAudio 播放内核',
        '不改字幕读取链路',
        '不接 SQLite / 下载器 / 元数据 / mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath 或 file://',
      ],
      deferred: ['DiagnosticsPage 大拆分', 'LyricsPanel 大拆分', 'DownloaderPage 真实下载器', 'SQLite', 'mpv 后端', '高级文件整理'],
    };
  },
};
