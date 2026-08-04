import type {ImportTaskContract, ImportFileContract, MetadataSourceContract, ImportConflictItemContract} from './importDownloadModelContractService';

export type Mvp86ImporterTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface Mvp86ImporterSourceOption {
  id: string;
  label: string;
  description: string;
  accepted: string[];
  tone: Mvp86ImporterTone;
}

export interface Mvp86ImporterPreviewStep {
  id: string;
  title: string;
  description: string;
  status: 'enabled-mock' | 'future-readonly' | 'blocked-execution';
}

export interface Mvp86ImporterMockTask extends ImportTaskContract {
  previewLabel: string;
  sourceDisplayName: string;
  targetDisplayName: string;
}

export interface Mvp86ImporterUiShellModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  sourceOptions: Mvp86ImporterSourceOption[];
  previewSteps: Mvp86ImporterPreviewStep[];
  mockTask: Mvp86ImporterMockTask;
  taskSummaryCards: Array<{id: string; label: string; value: string; tone: Mvp86ImporterTone}>;
  previewPanels: Array<{id: string; title: string; items: string[]; tone: Mvp86ImporterTone}>;
  disabledActions: string[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

const sourceFiles: ImportFileContract[] = [
  {
    id: 'mvp86-src-audio-01',
    relativePath: 'RJ01234567_雨音耳かき/01_本編.flac',
    displayName: '01_本编.flac',
    kind: 'audio',
    sizeBytes: 734003200,
    selected: true,
    warnings: [],
  },
  {
    id: 'mvp86-src-audio-02',
    relativePath: 'RJ01234567_雨音耳かき/02_添い寝.wav',
    displayName: '02_添い寝.wav',
    kind: 'audio',
    sizeBytes: 1048576000,
    selected: true,
    warnings: ['大文件，后续真实导入前需要 copy 失败保护。'],
  },
  {
    id: 'mvp86-src-cover',
    relativePath: 'RJ01234567_雨音耳かき/cover.jpg',
    displayName: 'cover.jpg',
    kind: 'image',
    sizeBytes: 512000,
    selected: true,
    warnings: [],
  },
  {
    id: 'mvp86-src-lrc',
    relativePath: 'RJ01234567_雨音耳かき/01_本編.bilingual.lrc',
    displayName: '01_本编.bilingual.lrc',
    kind: 'subtitle',
    sizeBytes: 64000,
    selected: true,
    warnings: [],
  },
];

const metadataSources: MetadataSourceContract[] = [
  {
    id: 'mvp86-meta-local-folder',
    provider: 'local-folder',
    confidence: 0.82,
    title: '雨音耳かきと添い寝の夜',
    code: 'RJ01234567',
    circleOrArtist: '夜更かし工房',
    cvs: ['浅见ゆい'],
    tags: ['耳かき', '雨音', '添い寝'],
    coverRelativePath: 'RJ01234567_雨音耳かき/cover.jpg',
    notes: '来自文件夹名和本地封面。',
    mergePriority: 40,
  },
  {
    id: 'mvp86-meta-user-override',
    provider: 'user-override',
    confidence: 1,
    title: '雨音耳搔与陪睡之夜',
    code: 'RJ01234567',
    tags: ['睡前', '已翻译'],
    notes: '用户手动信息永远最高优先级。',
    mergePriority: 100,
  },
];

const conflictItems: ImportConflictItemContract[] = [
  {
    id: 'mvp86-conflict-info',
    severity: 'info',
    kind: 'duplicate-code',
    message: '示例：目标库未发现同 RJ，真实检测将在 MVP89 后接入。',
    blocksExecution: false,
  },
  {
    id: 'mvp86-conflict-warning',
    severity: 'warning',
    kind: 'target-exists',
    message: '示例：目标目录名可能需要清洗特殊字符；本轮只展示，不写文件。',
    targetRelativePath: 'ASMR/RJ01234567 - 雨音耳搔与陪睡之夜/',
    blocksExecution: false,
  },
];

function getModel(): Mvp86ImporterUiShellModel {
  const mockTask: Mvp86ImporterMockTask = {
    id: 'import-task-mvp86-preview-rj',
    previewLabel: 'RJ 专辑导入预览（mock）',
    sourceKind: 'manual',
    sourceRootToken: 'source-root-token:mvp86-demo-staging',
    sourceDisplayName: '下载完成目录 / RJ01234567_雨音耳かき',
    detectedType: 'rj-work',
    detectedCode: 'RJ01234567',
    detectedTitle: '雨音耳搔与陪睡之夜',
    detectedArtistOrCircle: '夜更かし工房',
    sourceFiles,
    metadataSources,
    metadataCandidates: [
      {sourceId: 'mvp86-meta-user-override', field: 'title', value: '雨音耳搔与陪睡之夜', confidence: 1, selected: true},
      {sourceId: 'mvp86-meta-local-folder', field: 'circle', value: '夜更かし工房', confidence: 0.82, selected: true},
      {sourceId: 'mvp86-meta-local-folder', field: 'tags', value: ['耳かき', '雨音', '添い寝'], confidence: 0.82, selected: true},
    ],
    targetPlan: {
      targetRootToken: 'target-root-token:mvp86-demo-library',
      targetCollectionType: 'rj-work',
      targetRelativeDirectory: 'ASMR/RJ01234567 - 雨音耳搔与陪睡之夜/',
      operationMode: 'copy',
      plannedFiles: [
        {sourceRelativePath: 'RJ01234567_雨音耳かき/01_本編.flac', targetRelativePath: 'ASMR/RJ01234567 - 雨音耳搔与陪睡之夜/01_本编.flac', action: 'copy', overwrite: false},
        {sourceRelativePath: 'RJ01234567_雨音耳かき/02_添い寝.wav', targetRelativePath: 'ASMR/RJ01234567 - 雨音耳搔与陪睡之夜/02_添い寝.wav', action: 'copy', overwrite: false},
        {sourceRelativePath: 'RJ01234567_雨音耳かき/cover.jpg', targetRelativePath: 'ASMR/RJ01234567 - 雨音耳搔与陪睡之夜/cover.jpg', action: 'copy', overwrite: false},
      ],
    },
    targetDisplayName: '正式仓库 / ASMR / RJ01234567 - 雨音耳搔与陪睡之夜',
    conflictReport: {
      summary: 'mock 预览：0 个阻断，1 个提醒。真实冲突检测后置到 MVP89。',
      blockers: 0,
      warnings: 1,
      items: conflictItems,
    },
    operationMode: 'copy',
    status: 'previewed',
    createdAt: '2026-07-07T00:00:00.000Z',
    updatedAt: '2026-07-07T00:00:00.000Z',
  };

  return {
    version: '0.124.0-mvp86',
    title: 'MVP-86 导入器 UI 壳 / 预览页',
    summary: '把 MVP85 的 ImportTask / MetadataSource / TargetPlan / ConflictReport 模型放进用户可见的导入器页面；本轮只展示 mock 预览，不读取真实导入源，不复制、不移动、不删除、不重命名文件。',
    baseline: '0.123.0-mvp85 / ImportTask、DownloadTask、DownloadManifest、MetadataSource 模型合同',
    sourceOptions: [
      {
        id: 'rj-work-import',
        label: 'RJ 专辑目录',
        description: '后续识别 RJ 号、封面、字幕、音轨和本地 metadata；本轮只显示示例任务。',
        accepted: ['RJ 文件夹', '本地字幕', '封面图片', 'txt / json 说明'],
        tone: 'emerald',
      },
      {
        id: 'music-album-import',
        label: '音乐专辑目录',
        description: '后续读取普通音乐专辑结构、标签、封面和曲号；本轮不读取 ID3 / FLAC tag。',
        accepted: ['mp3', 'flac', 'wav', 'm4a', 'folder cover'],
        tone: 'sky',
      },
      {
        id: 'music-singles-import',
        label: '单曲 / 混合目录',
        description: '后续进入更严格的混合目录识别和冲突报告；本轮只展示阻断策略。',
        accepted: ['单曲', '混合文件夹', '需要人工确认'],
        tone: 'amber',
      },
    ],
    previewSteps: [
      {id: 'draft', title: '选择导入来源', description: '未来由 Electron main 保存真实路径并返回 sourceRootToken；Renderer 不拿 absolutePath。', status: 'future-readonly'},
      {id: 'detect', title: '识别内容类型', description: '先判断 RJ 专辑、音乐专辑、单曲或混合目录。', status: 'enabled-mock'},
      {id: 'metadata', title: '整理元数据候选', description: 'localFolder、localText、musicTags、downloadManifest、userOverride 分来源保存。', status: 'enabled-mock'},
      {id: 'conflicts', title: '冲突与目标路径预览', description: '显示会复制到哪里、是否撞库、是否存在受保护文件。', status: 'enabled-mock'},
      {id: 'execute', title: '执行导入', description: '本轮禁止执行；copy only 和 move 都是后续阶段。', status: 'blocked-execution'},
    ],
    mockTask,
    taskSummaryCards: [
      {id: 'detected-type', label: '识别类型', value: 'RJ 专辑', tone: 'emerald'},
      {id: 'file-count', label: '文件数', value: `${sourceFiles.length} 个示例文件`, tone: 'sky'},
      {id: 'conflicts', label: '冲突', value: '0 阻断 / 1 提醒', tone: 'amber'},
      {id: 'operation', label: '操作模式', value: 'copy only 预览', tone: 'violet'},
    ],
    previewPanels: [
      {
        id: 'source-preview',
        title: '来源预览',
        items: ['sourceRootToken: source-root-token:mvp86-demo-staging', 'displayName: 下载完成目录 / RJ01234567_雨音耳かき', '不显示真实 absolutePath / 不显示 file://'],
        tone: 'emerald',
      },
      {
        id: 'target-preview',
        title: '目标路径计划',
        items: ['targetRootToken: target-root-token:mvp86-demo-library', 'ASMR/RJ01234567 - 雨音耳搔与陪睡之夜/', 'overwrite: false / action: copy'],
        tone: 'sky',
      },
      {
        id: 'metadata-preview',
        title: '元数据候选',
        items: ['userOverride 优先级最高', 'localFolder 作为本地识别参考', 'Provider / 网络元数据仍未接入'],
        tone: 'violet',
      },
      {
        id: 'conflict-preview',
        title: '冲突报告',
        items: conflictItems.map((item) => `${item.severity}: ${item.message}`),
        tone: 'amber',
      },
    ],
    disabledActions: ['打开真实目录选择器', '读取真实导入源', '复制文件', '移动文件', '删除文件', '重命名文件', '联网抓取元数据', '写 SQLite'],
    guardedBoundaries: [
      '本轮只做导入器 UI 壳和 mock preview。',
      '不调用 fs.copyFile / fs.rename / fs.rm / fs.unlink。',
      '不接真实 Electron import IPC。',
      'Renderer 不接收 absolutePath 或 file://。',
      '不写 library-index.json，不写 SQLite。',
      'copy only 仍后置到 MVP91，move 后置到 MVP92+。',
    ],
    nextSteps: ['MVP87：RJ 专辑导入只读识别', 'MVP88：音乐专辑 / 单曲只读识别', 'MVP89：冲突检测落地', 'MVP90：目标路径规划预览'],
  };
}

function getToneClassName(tone: Mvp86ImporterTone): string {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    case 'sky':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    case 'amber':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    case 'violet':
      return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    case 'rose':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-50';
    case 'zinc':
    default:
      return 'border-white/10 bg-white/5 text-text-muted';
  }
}

function formatFileSize(sizeBytes?: number): string {
  if (!Number.isFinite(sizeBytes) || !sizeBytes || sizeBytes <= 0) return '未统计';
  const mb = sizeBytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export const importerPreviewShellService = {
  getModel,
  getToneClassName,
  formatFileSize,
};
