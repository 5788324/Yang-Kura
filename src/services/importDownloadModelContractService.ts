export type Mvp85ModelTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export type ImportSourceKind = 'manual' | 'asmr-one' | 'dlsite' | 'music' | 'direct-url' | 'unknown';
export type ImportDetectedType = 'rj-work' | 'music-album' | 'music-singles' | 'mixed' | 'unknown';
export type ImportOperationMode = 'copy' | 'move';
export type ImportTaskStatus = 'draft' | 'previewed' | 'confirmed' | 'running' | 'done' | 'failed' | 'cancelled';
export type ImportFileKind = 'audio' | 'video' | 'image' | 'subtitle' | 'text' | 'archive' | 'other';
export type ImportConflictSeverity = 'info' | 'warning' | 'blocker';
export type MetadataProviderKind = 'local-folder' | 'local-text' | 'dlsite' | 'asmr-one' | 'music-tags' | 'download-manifest' | 'user-override' | 'unknown';
export type DownloadProviderKind = 'manual-import' | 'direct-url' | 'asmr-one' | 'dlsite-metadata' | 'music-provider' | 'unknown';
export type DownloadTaskStatus = 'draft' | 'queued' | 'running' | 'paused' | 'done' | 'failed' | 'cancelled';

export interface ImportFileContract {
  id: string;
  relativePath: string;
  displayName: string;
  kind: ImportFileKind;
  sizeBytes?: number;
  mtimeMs?: number;
  checksum?: string;
  selected: boolean;
  warnings: string[];
}

export interface MetadataSourceContract {
  id: string;
  provider: MetadataProviderKind;
  confidence: number;
  fetchedAt?: string;
  title?: string;
  code?: string;
  circleOrArtist?: string;
  cvs?: string[];
  tags?: string[];
  coverRelativePath?: string;
  notes?: string;
  mergePriority: number;
}

export interface MetadataCandidateContract {
  sourceId: string;
  field: string;
  value: string | string[];
  confidence: number;
  selected: boolean;
}

export interface ImportTargetPlanContract {
  targetRootToken: string;
  targetCollectionType: ImportDetectedType;
  targetRelativeDirectory: string;
  operationMode: ImportOperationMode;
  plannedFiles: Array<{
    sourceRelativePath: string;
    targetRelativePath: string;
    action: 'copy' | 'move' | 'skip';
    overwrite: false;
  }>;
}

export interface ImportConflictItemContract {
  id: string;
  severity: ImportConflictSeverity;
  kind: 'duplicate-code' | 'duplicate-file' | 'target-exists' | 'mixed-content' | 'unsupported-protected-file' | 'unknown';
  message: string;
  sourceRelativePath?: string;
  targetRelativePath?: string;
  blocksExecution: boolean;
}

export interface ImportConflictReportContract {
  summary: string;
  blockers: number;
  warnings: number;
  items: ImportConflictItemContract[];
}

export interface ImportTaskContract {
  id: string;
  sourceKind: ImportSourceKind;
  sourceRootToken: string;
  detectedType: ImportDetectedType;
  detectedCode?: string;
  detectedTitle?: string;
  detectedArtistOrCircle?: string;
  sourceFiles: ImportFileContract[];
  metadataSources: MetadataSourceContract[];
  metadataCandidates: MetadataCandidateContract[];
  targetPlan: ImportTargetPlanContract;
  conflictReport: ImportConflictReportContract;
  operationMode: ImportOperationMode;
  status: ImportTaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadManifestContract {
  id: string;
  provider: DownloadProviderKind;
  sourceUrlToken?: string;
  sourceCode?: string;
  title?: string;
  files: Array<{
    relativePath: string;
    kind: ImportFileKind;
    sizeBytes?: number;
    checksum?: string;
    status: 'planned' | 'downloaded' | 'failed' | 'skipped';
  }>;
  metadataSources: MetadataSourceContract[];
  errorLog: string[];
  createdAt: string;
}

export interface DownloadTaskContract {
  id: string;
  provider: DownloadProviderKind;
  status: DownloadTaskStatus;
  title: string;
  stagingRootToken: string;
  manifest?: DownloadManifestContract;
  progressPercent: number;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mvp85ModelCard {
  id: string;
  title: string;
  status: string;
  detail: string;
  tone: Mvp85ModelTone;
}

export interface Mvp85ImportDownloadModelContractModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  modelCards: Mvp85ModelCard[];
  importTaskFields: string[];
  downloadTaskFields: string[];
  metadataMergeRules: string[];
  manifestRules: string[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

function getModel(): Mvp85ImportDownloadModelContractModel {
  return {
    version: '0.123.0-mvp85',
    title: 'MVP-85 导入 / 下载 / 元数据模型合同',
    summary: '在 MVP84 规划基础上冻结 ImportTask、DownloadTask、DownloadManifest、MetadataSource、ImportTargetPlan、ImportConflictReport 的第一版数据合同；本轮只写类型、文档、诊断展示和 verifier，不接真实导入或下载。',
    baseline: '0.122.0-mvp84 / 导入器优先与下载生态策略并入',
    modelCards: [
      {
        id: 'import-task-contract',
        title: 'ImportTask',
        status: '模型合同',
        detail: '描述一次导入任务的来源、识别类型、文件列表、元数据候选、目标路径计划、冲突报告和状态。',
        tone: 'emerald',
      },
      {
        id: 'download-task-contract',
        title: 'DownloadTask',
        status: '后置下载器地基',
        detail: '描述后续自研下载生态的任务壳；本轮不联网、不请求 Provider、不写下载文件。',
        tone: 'sky',
      },
      {
        id: 'download-manifest-contract',
        title: 'DownloadManifest',
        status: '结果清单',
        detail: '记录下载结果、文件列表、metadataSources 与错误日志，供后续导入器只读消费。',
        tone: 'amber',
      },
      {
        id: 'metadata-source-contract',
        title: 'MetadataSource',
        status: '分来源保存',
        detail: 'localFolder、localText、DLsite、ASMR.one、musicTags、downloadManifest、userOverride 不混成一份。',
        tone: 'violet',
      },
      {
        id: 'conflict-target-plan',
        title: 'TargetPlan / ConflictReport',
        status: '安全阀',
        detail: '任何 copy/move 前必须先生成目标路径计划和冲突报告；overwrite 永远默认为 false。',
        tone: 'rose',
      },
    ],
    importTaskFields: [
      'id / sourceKind / sourceRootToken',
      'detectedType / detectedCode / detectedTitle / detectedArtistOrCircle',
      'sourceFiles: ImportFileContract[]',
      'metadataSources / metadataCandidates',
      'targetPlan: ImportTargetPlanContract',
      'conflictReport: ImportConflictReportContract',
      'operationMode: copy | move',
      'status: draft / previewed / confirmed / running / done / failed / cancelled',
    ],
    downloadTaskFields: [
      'id / provider / status / title',
      'stagingRootToken，不暴露真实下载目录给 Renderer',
      'manifest?: DownloadManifestContract',
      'progressPercent / retryCount / createdAt / updatedAt',
      'Provider 只作为模型枚举，不在本轮实现网络访问',
    ],
    metadataMergeRules: [
      'userOverride 优先级最高。',
      'localFolder / localText 保存本地信息，不被 Provider 覆盖。',
      'DLsite 适合官方标题、社团、发售日。',
      'ASMR.one 适合作为标签和下载结构参考。',
      'music-tags 适合普通音乐专辑、艺术家、曲号。',
      'download-manifest 只记录下载结果，不代表最终展示值。',
    ],
    manifestRules: [
      'DownloadManifest 是下载 Worker 与导入器之间的磁盘/任务清单合同。',
      'Manifest 里的路径必须是 staging 相对路径或 token，不是 absolutePath。',
      '错误记录写 errorLog，不能静默吞掉。',
      '受保护 / 加密文件只标记 unsupported-protected-file，不做解密器。',
    ],
    guardedBoundaries: [
      '本轮不接真实导入器 UI。',
      '本轮不复制、不移动、不删除、不重命名真实媒体文件。',
      '本轮不接下载 Provider，不联网。',
      '本轮不接 SQLite。',
      '本轮不接 mpv。',
      'Renderer 仍不接收 absolutePath 或 file://。',
      '未来 move 必须晚于 copy only，并带操作日志和失败记录。',
    ],
    nextSteps: [
      'MVP86：导入器 UI 壳，只展示任务预览，不执行文件操作。',
      'MVP87：RJ 专辑导入识别，只读。',
      'MVP88：流行音乐导入识别，只读。',
      'MVP89：冲突检测模型落 UI。',
      'MVP90：目标路径规划预览。',
      'MVP91：copy only 导入，需用户确认。',
    ],
  };
}

function getToneClassName(tone: Mvp85ModelTone): string {
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

export const importDownloadModelContractService = {
  getModel,
  getToneClassName,
};
