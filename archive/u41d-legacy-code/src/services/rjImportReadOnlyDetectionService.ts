import type {
  ImportFileContract,
  ImportTaskContract,
  MetadataCandidateContract,
  MetadataSourceContract,
  ImportConflictItemContract,
  ImportConflictReportContract,
  ImportDetectedType,
  ImportFileKind,
} from './importDownloadModelContractService';

export type Mvp87RjImportTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface RjImportReadonlyInput {
  sourceRootToken: string;
  sourceDisplayName: string;
  relativePaths: string[];
}

export interface RjImportCategoryCount {
  kind: ImportFileKind;
  label: string;
  count: number;
  tone: Mvp87RjImportTone;
}

export interface RjImportReadonlyDetectionResult {
  task: ImportTaskContract;
  categoryCounts: RjImportCategoryCount[];
  detectedFolderName: string;
  detectedCode: string | undefined;
  confidence: number;
  warnings: string[];
  blockers: string[];
}

export interface Mvp87ReadonlyRuleCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp87RjImportTone;
}

export interface Mvp87RjImportReadonlyDetectionModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  sampleInput: RjImportReadonlyInput;
  sampleResult: RjImportReadonlyDetectionResult;
  ruleCards: Mvp87ReadonlyRuleCard[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

type Mvp87ConflictReportAnchor = ImportConflictReportContract;

const audioExt = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus']);
const videoExt = new Set(['mp4', 'mkv', 'webm', 'avi', 'mov', 'wmv']);
const imageExt = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']);
const subtitleExt = new Set(['lrc', 'srt', 'vtt', 'ass']);
const textExt = new Set(['txt', 'md', 'json', 'nfo', 'pdf']);
const archiveExt = new Set(['zip', '7z', 'rar']);

function splitPath(relativePath: string): string[] {
  return relativePath.split(/[\\/]+/).filter(Boolean);
}

function getDisplayName(relativePath: string): string {
  const parts = splitPath(relativePath);
  return parts.at(-1) || relativePath;
}

function getFolderName(relativePaths: string[]): string {
  const first = relativePaths.find(Boolean);
  if (!first) return '未识别目录';
  const parts = splitPath(first);
  return parts.length > 1 ? parts[0] : '单层导入源';
}

export function normalizeRjCode(input: string): string | undefined {
  const match = input.match(/RJ\s*0*(\d{3,8})/i);
  if (!match) return undefined;
  const numeric = match[1].padStart(8, '0');
  return `RJ${numeric}`;
}

export function classifyImportRelativePath(relativePath: string): ImportFileKind {
  const displayName = getDisplayName(relativePath);
  const ext = displayName.includes('.') ? displayName.split('.').pop()?.toLowerCase() || '' : '';
  if (audioExt.has(ext)) return 'audio';
  if (videoExt.has(ext)) return 'video';
  if (imageExt.has(ext)) return 'image';
  if (subtitleExt.has(ext)) return 'subtitle';
  if (textExt.has(ext)) return 'text';
  if (archiveExt.has(ext)) return 'archive';
  return 'other';
}

export function isLikelyCover(relativePath: string): boolean {
  const name = getDisplayName(relativePath).toLowerCase();
  return ['cover', 'folder', 'main', 'jacket', 'ジャケット', '封面'].some((token) => name.includes(token)) && classifyImportRelativePath(relativePath) === 'image';
}

function makeImportFiles(relativePaths: string[]): ImportFileContract[] {
  return relativePaths.map((relativePath, index) => {
    const kind = classifyImportRelativePath(relativePath);
    const warnings: string[] = [];
    if (kind === 'other') warnings.push('暂不支持的扩展名，真实导入前需要人工确认。');
    if (relativePath.includes('..')) warnings.push('相对路径包含 ..，真实导入必须阻断。');
    return {
      id: `mvp87-rj-file-${String(index + 1).padStart(2, '0')}`,
      relativePath,
      displayName: getDisplayName(relativePath),
      kind,
      selected: kind !== 'other',
      warnings,
    };
  });
}

function getCategoryCounts(files: ImportFileContract[]): RjImportCategoryCount[] {
  const groups: Array<[ImportFileKind, string, Mvp87RjImportTone]> = [
    ['audio', '音频', 'emerald'],
    ['image', '封面 / 图片', 'sky'],
    ['subtitle', '字幕', 'violet'],
    ['text', '说明文本', 'zinc'],
    ['archive', '压缩包', 'amber'],
    ['video', '视频', 'amber'],
    ['other', '其他', 'rose'],
  ];
  return groups.map(([kind, label, tone]) => ({kind, label, tone, count: files.filter((file) => file.kind === kind).length}));
}

export function buildRjImportReadonlyPreview(input: RjImportReadonlyInput): RjImportReadonlyDetectionResult {
  const files = makeImportFiles(input.relativePaths);
  const folderName = getFolderName(input.relativePaths);
  const detectedCode = normalizeRjCode(`${folderName}/${input.relativePaths.join('/')}`);
  const audioCount = files.filter((file) => file.kind === 'audio').length;
  const imageCount = files.filter((file) => file.kind === 'image').length;
  const subtitleCount = files.filter((file) => file.kind === 'subtitle').length;
  const otherWarnings = files.flatMap((file) => file.warnings);
  const warnings: string[] = [...otherWarnings];
  const blockers: string[] = [];
  if (!detectedCode) warnings.push('未从文件夹或文件名识别到标准 RJ 号。');
  if (audioCount === 0) blockers.push('未检测到音频文件，不能作为 RJ 专辑导入。');
  if (imageCount === 0) warnings.push('未检测到封面候选。');
  if (subtitleCount === 0) warnings.push('未检测到字幕文件。');

  const titleFromFolder = detectedCode ? folderName.replace(new RegExp(detectedCode.replace('RJ', 'RJ0*'), 'i'), '').replace(/^[-_\s　]+/, '') : folderName;
  const cover = files.find((file) => isLikelyCover(file.relativePath)) || files.find((file) => file.kind === 'image');
  const metadataSources: MetadataSourceContract[] = [
    {
      id: 'mvp87-meta-local-folder',
      provider: 'local-folder',
      confidence: detectedCode ? 0.86 : 0.52,
      title: titleFromFolder || folderName,
      code: detectedCode,
      coverRelativePath: cover?.relativePath,
      notes: 'MVP87 只根据 tokenized relativePaths 与文件夹名做只读识别。',
      mergePriority: 40,
    },
  ];
  const metadataCandidates: MetadataCandidateContract[] = [
    {sourceId: 'mvp87-meta-local-folder', field: 'code', value: detectedCode || '未识别', confidence: detectedCode ? 0.86 : 0.1, selected: Boolean(detectedCode)},
    {sourceId: 'mvp87-meta-local-folder', field: 'title', value: titleFromFolder || folderName, confidence: 0.62, selected: true},
  ];
  if (cover) metadataCandidates.push({sourceId: 'mvp87-meta-local-folder', field: 'coverRelativePath', value: cover.relativePath, confidence: 0.76, selected: true});

  const conflictItems: ImportConflictItemContract[] = [
    ...warnings.map((message, index) => ({
      id: `mvp87-warning-${index + 1}`,
      severity: 'warning' as const,
      kind: message.includes('RJ') ? 'unknown' as const : 'mixed-content' as const,
      message,
      blocksExecution: false,
    })),
    ...blockers.map((message, index) => ({
      id: `mvp87-blocker-${index + 1}`,
      severity: 'blocker' as const,
      kind: 'mixed-content' as const,
      message,
      blocksExecution: true,
    })),
  ];

  const collectionDir = detectedCode ? `ASMR/${detectedCode} - ${titleFromFolder || '未命名作品'}/` : `ASMR/未识别RJ/${folderName}/`;
  const task: ImportTaskContract = {
    id: 'import-task-mvp87-readonly-rj-preview',
    sourceKind: 'manual',
    sourceRootToken: input.sourceRootToken,
    detectedType: audioCount > 0 ? 'rj-work' as ImportDetectedType : 'unknown',
    detectedCode,
    detectedTitle: titleFromFolder || folderName,
    detectedArtistOrCircle: undefined,
    sourceFiles: files,
    metadataSources,
    metadataCandidates,
    targetPlan: {
      targetRootToken: 'target-root-token:mvp87-demo-library',
      targetCollectionType: audioCount > 0 ? 'rj-work' : 'unknown',
      targetRelativeDirectory: collectionDir,
      operationMode: 'copy',
      plannedFiles: files
        .filter((file) => file.selected)
        .map((file) => ({
          sourceRelativePath: file.relativePath,
          targetRelativePath: `${collectionDir}${file.displayName}`,
          action: 'copy' as const,
          overwrite: false,
        })),
    },
    conflictReport: {
      summary: `只读识别：${blockers.length} 个阻断，${warnings.length} 个提醒。`,
      blockers: blockers.length,
      warnings: warnings.length,
      items: conflictItems,
    },
    operationMode: 'copy',
    status: 'previewed',
    createdAt: '2026-07-07T00:00:00.000Z',
    updatedAt: '2026-07-07T00:00:00.000Z',
  };

  const confidence = Math.min(1, (detectedCode ? 0.45 : 0) + (audioCount > 0 ? 0.25 : 0) + (cover ? 0.15 : 0) + (subtitleCount > 0 ? 0.1 : 0));
  return {
    task,
    categoryCounts: getCategoryCounts(files),
    detectedFolderName: folderName,
    detectedCode,
    confidence,
    warnings,
    blockers,
  };
}

const sampleInput: RjImportReadonlyInput = {
  sourceRootToken: 'source-root-token:mvp87-readonly-staging',
  sourceDisplayName: '导入暂存区 / RJ01588893_雨音と耳かき',
  relativePaths: [
    'RJ01588893_雨音と耳かき/cover.jpg',
    'RJ01588893_雨音と耳かき/01_本編.flac',
    'RJ01588893_雨音と耳かき/02_添い寝.wav',
    'RJ01588893_雨音と耳かき/01_本編.ja.lrc',
    'RJ01588893_雨音と耳かき/01_本編.zh.lrc',
    'RJ01588893_雨音と耳かき/readme.txt',
  ],
};

function getModel(): Mvp87RjImportReadonlyDetectionModel {
  const sampleResult = buildRjImportReadonlyPreview(sampleInput);
  return {
    version: '0.125.0-mvp87',
    title: 'MVP-87 RJ 专辑导入只读识别',
    summary: '在 MVP86 导入器 UI 壳上加入第一版 RJ 专辑只读识别：只处理 tokenized relativePaths，提取 RJ 号，分类音频 / 封面 / 字幕 / 文本 / 压缩包 / 其他，并生成 ImportTask preview；不读取真实目录，不执行 copy/move/delete/rename。',
    baseline: '0.124.0-mvp86 / 导入器 UI 壳与 mock preview',
    sampleInput,
    sampleResult,
    ruleCards: [
      {id: 'rj-code', title: 'RJ 号提取', detail: '支持 RJ01588893、RJ1588893、带空格或文件夹前后缀的 RJ 文本，并标准化为 RJ + 8 位数字。', tone: 'emerald'},
      {id: 'file-kind', title: '文件分类', detail: '按扩展名只读分类 audio / video / image / subtitle / text / archive / other。', tone: 'sky'},
      {id: 'metadata', title: '本地元数据候选', detail: '只从文件夹名、封面候选和相对路径生成 local-folder MetadataSource。', tone: 'violet'},
      {id: 'conflict', title: '预警与阻断', detail: '无音频为 blocker；无 RJ、无封面、无字幕为 warning；overwrite 固定 false。', tone: 'amber'},
    ],
    guardedBoundaries: [
      'MVP87 不打开真实目录选择器，不读取真实文件系统。',
      '输入只允许 sourceRootToken、sourceDisplayName、relativePaths。',
      'Renderer 不接收 absolutePath 或 file://。',
      '不调用 fs.copyFile / fs.rename / fs.rm / fs.unlink。',
      '不写 library-index.json，不写 SQLite。',
      'copy only 仍后置到 MVP91，move 后置到 MVP92+。',
    ],
    nextSteps: ['MVP88：音乐专辑 / 单曲只读识别', 'MVP89：冲突检测：同 RJ、同文件、同专辑、hash 策略', 'MVP90：目标路径规划', 'MVP91：copy only 导入'],
  };
}

function getToneClassName(tone: Mvp87RjImportTone): string {
  switch (tone) {
    case 'emerald': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    case 'sky': return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    case 'amber': return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    case 'violet': return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    case 'rose': return 'border-rose-500/20 bg-rose-500/10 text-rose-50';
    case 'zinc':
    default: return 'border-white/10 bg-white/5 text-text-muted';
  }
}

export const rjImportReadOnlyDetectionService = {
  getModel,
  normalizeRjCode,
  classifyImportRelativePath,
  buildRjImportReadonlyPreview,
  getToneClassName,
};
