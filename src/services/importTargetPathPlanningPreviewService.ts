import type {
  ImportConflictItemContract,
  ImportConflictReportContract,
  ImportFileContract,
  ImportTaskContract,
} from './importDownloadModelContractService';
import { rjImportReadOnlyDetectionService } from './rjImportReadOnlyDetectionService';
import { musicImportReadOnlyDetectionService } from './musicImportReadOnlyDetectionService';

export type Mvp90TargetPathTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';
export type Mvp90TargetPathRuleKind = 'collection-directory' | 'sanitize-segment' | 'duplicate-target' | 'long-path' | 'overwrite-policy' | 'operation-mode';

export interface Mvp90TargetPathRuleCard {
  id: string;
  kind: Mvp90TargetPathRuleKind;
  title: string;
  detail: string;
  tone: Mvp90TargetPathTone;
}

export interface ImportTargetPathPreviewOptions {
  asmrRootDirectory: string;
  musicRootDirectory: string;
  singlesDirectory: string;
  mixedDirectory: string;
  maxRelativePathLength: number;
}

export interface ImportTargetPathPreviewFile {
  id: string;
  sourceRelativePath: string;
  originalName: string;
  sanitizedName: string;
  targetRelativePath: string;
  action: 'copy' | 'move' | 'skip';
  overwrite: false;
  warnings: string[];
}

export interface ImportTargetPathPlanningResult {
  taskId: string;
  detectedType: string;
  detectedTitle: string;
  baseDirectory: string;
  sanitizedDirectory: string;
  plannedFiles: ImportTargetPathPreviewFile[];
  duplicateTargetNameCount: number;
  invalidCharacterWarnings: number;
  longPathWarnings: number;
  skippedFileCount: number;
  conflictReport: ImportConflictReportContract;
}

export interface Mvp90ImportTargetPathPlanningModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  options: ImportTargetPathPreviewOptions;
  ruleCards: Mvp90TargetPathRuleCard[];
  sampleResults: ImportTargetPathPlanningResult[];
  sanitizingExamples: Array<{input: string; output: string; note: string}>;
  guardedBoundaries: string[];
  nextSteps: string[];
}

const DEFAULT_OPTIONS: ImportTargetPathPreviewOptions = {
  asmrRootDirectory: 'ASMR',
  musicRootDirectory: 'Music',
  singlesDirectory: 'Music/Singles',
  mixedDirectory: 'ImportInbox/Mixed',
  maxRelativePathLength: 180,
};

const WINDOWS_RESERVED_NAMES = new Set([
  'con', 'prn', 'aux', 'nul',
  'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
  'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
]);

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function sanitizePathSegment(input: string): string {
  const normalized = collapseWhitespace(input || '未命名');
  const sanitized = normalized
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '＿')
    .replace(/[.\s]+$/g, '')
    .replace(/^\.+/g, '')
    .trim();
  const safe = sanitized || '未命名';
  const reserved = WINDOWS_RESERVED_NAMES.has(safe.toLowerCase());
  return reserved ? `${safe}_` : safe;
}

function splitFileName(fileName: string): {stem: string; extension: string} {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === fileName.length - 1) return {stem: fileName, extension: ''};
  return {stem: fileName.slice(0, lastDot), extension: fileName.slice(lastDot)};
}

export function sanitizeFileName(input: string): string {
  const {stem, extension} = splitFileName(input);
  const safeStem = sanitizePathSegment(stem);
  const safeExt = extension.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '');
  return `${safeStem}${safeExt}`;
}

function getFileName(relativePath: string): string {
  return relativePath.split(/[\\/]+/).filter(Boolean).at(-1) || relativePath;
}

function joinPath(...segments: string[]): string {
  return segments
    .flatMap((segment) => segment.split(/[\\/]+/))
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/');
}

function buildCollectionDirectory(task: ImportTaskContract, options: ImportTargetPathPreviewOptions): string {
  const title = sanitizePathSegment(task.detectedTitle || '未命名导入任务');
  const code = task.detectedCode ? sanitizePathSegment(task.detectedCode) : '';
  const artist = task.detectedArtistOrCircle ? sanitizePathSegment(task.detectedArtistOrCircle) : '未知艺术家';

  if (task.detectedType === 'rj-work') {
    return joinPath(options.asmrRootDirectory, code ? `${code} - ${title}` : title);
  }

  if (task.detectedType === 'music-album') {
    return joinPath(options.musicRootDirectory, `${artist} - ${title}`);
  }

  if (task.detectedType === 'music-singles') {
    return joinPath(options.singlesDirectory, title);
  }

  if (task.detectedType === 'mixed') {
    return joinPath(options.mixedDirectory, title);
  }

  return joinPath('ImportInbox/Unknown', title);
}

function makeConflictItem(partial: Omit<ImportConflictItemContract, 'id'>, index: number): ImportConflictItemContract {
  return {
    id: `mvp90-target-conflict-${String(index + 1).padStart(2, '0')}`,
    ...partial,
  };
}

function dedupeFileName(fileName: string, seen: Map<string, number>): {name: string; wasDuplicate: boolean} {
  const key = fileName.toLowerCase();
  const previous = seen.get(key) || 0;
  seen.set(key, previous + 1);

  if (previous === 0) return {name: fileName, wasDuplicate: false};

  const {stem, extension} = splitFileName(fileName);
  return {name: `${stem} (${previous + 1})${extension}`, wasDuplicate: true};
}

function buildWarnings(file: ImportFileContract, originalName: string, sanitizedName: string, targetRelativePath: string, options: ImportTargetPathPreviewOptions, wasDuplicate: boolean): string[] {
  const warnings: string[] = [];
  if (originalName !== sanitizedName) warnings.push('文件名包含 Windows 非法字符或尾随点/空格，已在预览中清理。');
  if (wasDuplicate) warnings.push('目标目录内出现同名文件，预览中追加序号；真实导入前必须再次确认。');
  if (targetRelativePath.length > options.maxRelativePathLength) warnings.push(`目标相对路径超过 ${options.maxRelativePathLength} 字符，后续真实导入前必须缩短目录或文件名。`);
  if (file.kind === 'other') warnings.push('未知类型文件默认保留在预览中，但后续可选择跳过。');
  return warnings;
}

export function buildImportTargetPathPreview(task: ImportTaskContract, options: ImportTargetPathPreviewOptions = DEFAULT_OPTIONS): ImportTargetPathPlanningResult {
  const baseDirectory = buildCollectionDirectory(task, options);
  const sanitizedDirectory = joinPath(...baseDirectory.split('/').map(sanitizePathSegment));
  const selectedFiles = task.sourceFiles.filter((file) => file.selected);
  const seenNames = new Map<string, number>();
  const conflictItems: ImportConflictItemContract[] = [];

  let duplicateTargetNameCount = 0;
  let invalidCharacterWarnings = 0;
  let longPathWarnings = 0;
  let skippedFileCount = task.sourceFiles.length - selectedFiles.length;

  const plannedFiles = selectedFiles.map((file) => {
    const originalName = file.displayName || getFileName(file.relativePath);
    const sanitizedBaseName = sanitizeFileName(originalName);
    const deduped = dedupeFileName(sanitizedBaseName, seenNames);
    const targetRelativePath = joinPath(sanitizedDirectory, deduped.name);
    const warnings = buildWarnings(file, originalName, sanitizedBaseName, targetRelativePath, options, deduped.wasDuplicate);

    if (originalName !== sanitizedBaseName) invalidCharacterWarnings += 1;
    if (deduped.wasDuplicate) duplicateTargetNameCount += 1;
    if (targetRelativePath.length > options.maxRelativePathLength) longPathWarnings += 1;

    warnings.forEach((message) => {
      conflictItems.push(makeConflictItem({
        severity: message.includes('超过') || message.includes('同名') ? 'warning' : 'info',
        kind: message.includes('同名') ? 'duplicate-file' : 'unknown',
        message: `${originalName}：${message}`,
        sourceRelativePath: file.relativePath,
        targetRelativePath,
        blocksExecution: false,
      }, conflictItems.length));
    });

    return {
      id: `mvp90-target-file-${file.id}`,
      sourceRelativePath: file.relativePath,
      originalName,
      sanitizedName: deduped.name,
      targetRelativePath,
      action: 'copy' as const,
      overwrite: false as const,
      warnings,
    };
  });

  if (selectedFiles.length === 0) {
    conflictItems.push(makeConflictItem({
      severity: 'blocker',
      kind: 'unknown',
      message: '没有选中的导入文件，目标路径计划无法执行。',
      blocksExecution: true,
    }, conflictItems.length));
  }

  if (skippedFileCount > 0) {
    conflictItems.push(makeConflictItem({
      severity: 'info',
      kind: 'unknown',
      message: `${skippedFileCount} 个源文件未进入目标路径计划；真实导入前需要确认是否跳过。`,
      blocksExecution: false,
    }, conflictItems.length));
  }

  const blockers = conflictItems.filter((item) => item.blocksExecution || item.severity === 'blocker').length;
  const warnings = conflictItems.filter((item) => item.severity === 'warning').length;

  return {
    taskId: task.id,
    detectedType: task.detectedType,
    detectedTitle: task.detectedTitle || '未命名导入任务',
    baseDirectory,
    sanitizedDirectory,
    plannedFiles,
    duplicateTargetNameCount,
    invalidCharacterWarnings,
    longPathWarnings,
    skippedFileCount,
    conflictReport: {
      summary: `MVP90 目标路径规划预览：${plannedFiles.length} 个目标文件，${blockers} 个阻断，${warnings} 个警告；overwrite 固定 false，operationMode 仍为 copy preview。`,
      blockers,
      warnings,
      items: conflictItems.length > 0 ? conflictItems : [makeConflictItem({
        severity: 'info',
        kind: 'unknown',
        message: '示例目标路径计划未发现阻断项；真实 copy/move 前仍需 main 侧复查目标目录和文件状态。',
        blocksExecution: false,
      }, 0)],
    },
  };
}

function getSampleTasks(): ImportTaskContract[] {
  return [
    rjImportReadOnlyDetectionService.getModel().sampleResult.task,
    musicImportReadOnlyDetectionService.getModel().sampleResult.task,
  ];
}

function getModel(): Mvp90ImportTargetPathPlanningModel {
  const sampleResults = getSampleTasks().map((task) => buildImportTargetPathPreview(task));
  return {
    version: '0.128.0-mvp90',
    title: 'MVP-90 目标路径规划预览',
    summary: '在 RJ / 音乐只读识别和冲突检测之后，统一 ASMR、音乐专辑、单曲、混合目录的目标路径规划规则；本轮只生成 preview，不执行 copy/move/delete/rename。',
    baseline: '0.127.0-mvp89 / 导入冲突检测与 hash 策略预览',
    options: DEFAULT_OPTIONS,
    ruleCards: [
      {id: 'collection-directory', kind: 'collection-directory', title: '集合目录规则', detail: 'ASMR 使用 ASMR/RJ号 - 标题；音乐专辑使用 Music/Artist - Album；单曲进入 Music/Singles。', tone: 'emerald'},
      {id: 'sanitize-segment', kind: 'sanitize-segment', title: '非法字符清理', detail: 'Windows 非法字符、控制字符、尾随点/空格在预览中清理；真实导入前仍需 main 侧复查。', tone: 'sky'},
      {id: 'duplicate-target', kind: 'duplicate-target', title: '同目标文件名', detail: '同名文件在 preview 中追加序号；后续真实导入前必须人工确认或跳过。', tone: 'amber'},
      {id: 'long-path', kind: 'long-path', title: '长路径提醒', detail: `超过 ${DEFAULT_OPTIONS.maxRelativePathLength} 字符的目标相对路径标记 warning，不自动截断。`, tone: 'violet'},
      {id: 'overwrite-policy', kind: 'overwrite-policy', title: '禁止覆盖', detail: 'overwrite 保持 false；真实 copy/move 不能覆盖已有文件。', tone: 'rose'},
      {id: 'operation-mode', kind: 'operation-mode', title: 'copy preview', detail: 'MVP90 只规划 copy；move 仍后置到 copy 验收之后。', tone: 'zinc'},
    ],
    sampleResults,
    sanitizingExamples: [
      {input: 'Aimer:Walpurgis?', output: sanitizePathSegment('Aimer:Walpurgis?'), note: '替换 Windows 非法字符。'},
      {input: 'RJ01588893 - 雨音耳かき. ', output: sanitizePathSegment('RJ01588893 - 雨音耳かき. '), note: '去除尾随点和空格。'},
      {input: 'CON', output: sanitizePathSegment('CON'), note: '保留 Windows 设备名安全后缀。'},
    ],
    guardedBoundaries: [
      'MVP90 不打开真实目录，不读取真实文件系统。',
      'MVP90 不执行 copy、move、delete、rename。',
      'MVP90 不写 library-index.json，不接 SQLite。',
      'MVP90 不计算真实 hash。',
      '目标路径计划只使用 tokenized ImportTask 与 relativePath。',
      'Renderer 不接收 absolutePath 或 file://。',
      'overwrite 继续固定 false。',
      'move 必须晚于 copy only 和操作日志验收。',
    ],
    nextSteps: [
      'MVP91：copy only 导入前的执行合同与二次确认设计。',
      'MVP92：copy only 最小真实导入，需要 Codex 本机验收。',
      'MVP93：move + 操作日志，必须晚于 copy only。',
    ],
  };
}

function getToneClassName(tone: Mvp90TargetPathTone): string {
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

export const importTargetPathPlanningPreviewService = {
  getModel,
  buildImportTargetPathPreview,
  sanitizePathSegment,
  sanitizeFileName,
  getToneClassName,
};
