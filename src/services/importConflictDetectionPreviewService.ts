import type {
  ImportConflictItemContract,
  ImportConflictReportContract,
  ImportFileContract,
  ImportTaskContract,
} from './importDownloadModelContractService';
import { rjImportReadOnlyDetectionService } from './rjImportReadOnlyDetectionService';
import { musicImportReadOnlyDetectionService } from './musicImportReadOnlyDetectionService';

export type Mvp89ConflictTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';
export type Mvp89ConflictKind = 'duplicate-rj' | 'duplicate-album' | 'duplicate-file-name' | 'same-size-suspect' | 'hash-strategy' | 'target-plan';

export interface ImportConflictExistingCollectionPreview {
  id: string;
  type: 'rj-work' | 'music-album' | 'music-singles';
  code?: string;
  title: string;
  artistOrCircle?: string;
  targetRelativeDirectory: string;
  fileNames: string[];
  knownSizeBytes?: number;
  checksum?: string;
}

export interface ImportConflictDetectionInput {
  task: ImportTaskContract;
  existingCollections: ImportConflictExistingCollectionPreview[];
}

export interface Mvp89ConflictRuleCard {
  id: string;
  kind: Mvp89ConflictKind;
  title: string;
  detail: string;
  tone: Mvp89ConflictTone;
}

export interface Mvp89HashStrategyStep {
  id: string;
  title: string;
  detail: string;
  enabledInMvp89: boolean;
}

export interface Mvp89ImportConflictDetectionResult {
  taskId: string;
  detectedType: string;
  detectedTitle: string;
  comparedCollections: number;
  duplicateCodeCount: number;
  duplicateAlbumCount: number;
  duplicateFileNameCount: number;
  sameSizeSuspectCount: number;
  hashCandidateCount: number;
  report: ImportConflictReportContract;
}

export interface Mvp89ImportConflictDetectionModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  sampleInputs: ImportConflictDetectionInput[];
  sampleResults: Mvp89ImportConflictDetectionResult[];
  ruleCards: Mvp89ConflictRuleCard[];
  hashStrategy: Mvp89HashStrategyStep[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

function normalizeText(value: string | undefined): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getFileName(relativePath: string): string {
  return relativePath.split(/[\\/]+/).filter(Boolean).at(-1) || relativePath;
}

function getComparableFileName(file: ImportFileContract): string {
  return normalizeText(file.displayName || getFileName(file.relativePath));
}

function makeItem(partial: Omit<ImportConflictItemContract, 'id'>, index: number): ImportConflictItemContract {
  return {
    id: `mvp89-conflict-${String(index + 1).padStart(2, '0')}`,
    ...partial,
  };
}

export function buildImportConflictPreview(input: ImportConflictDetectionInput): Mvp89ImportConflictDetectionResult {
  const task = input.task;
  const items: ImportConflictItemContract[] = [];
  const detectedCode = normalizeText(task.detectedCode);
  const detectedTitle = normalizeText(task.detectedTitle);
  const detectedArtist = normalizeText(task.detectedArtistOrCircle);
  const targetDir = normalizeText(task.targetPlan.targetRelativeDirectory);
  const selectedFiles = task.sourceFiles.filter((file) => file.selected);
  const selectedNames = new Set(selectedFiles.map(getComparableFileName));

  let duplicateCodeCount = 0;
  let duplicateAlbumCount = 0;
  let duplicateFileNameCount = 0;
  let sameSizeSuspectCount = 0;
  let hashCandidateCount = 0;

  input.existingCollections.forEach((collection) => {
    const collectionCode = normalizeText(collection.code);
    const collectionTitle = normalizeText(collection.title);
    const collectionArtist = normalizeText(collection.artistOrCircle);
    const collectionTarget = normalizeText(collection.targetRelativeDirectory);
    const existingNames = new Set(collection.fileNames.map(normalizeText));

    if (detectedCode && collectionCode && detectedCode === collectionCode) {
      duplicateCodeCount += 1;
      items.push(makeItem({
        severity: 'blocker',
        kind: 'duplicate-code',
        message: `检测到同 RJ / 同编号已存在：${collection.code} · ${collection.title}`,
        targetRelativePath: collection.targetRelativeDirectory,
        blocksExecution: true,
      }, items.length));
    }

    if (task.detectedType.startsWith('music') && detectedTitle && collectionTitle === detectedTitle && (!detectedArtist || detectedArtist === collectionArtist)) {
      duplicateAlbumCount += 1;
      items.push(makeItem({
        severity: 'warning',
        kind: 'duplicate-file',
        message: `检测到可能重复的音乐专辑 / 单曲集合：${collection.artistOrCircle || '未知艺术家'} - ${collection.title}`,
        targetRelativePath: collection.targetRelativeDirectory,
        blocksExecution: false,
      }, items.length));
    }

    if (targetDir && collectionTarget === targetDir) {
      items.push(makeItem({
        severity: 'blocker',
        kind: 'target-exists',
        message: `目标目录已经存在，后续 copy/move 前必须改名、跳过或手动确认：${collection.targetRelativeDirectory}`,
        targetRelativePath: collection.targetRelativeDirectory,
        blocksExecution: true,
      }, items.length));
    }

    selectedFiles.forEach((file) => {
      const fileName = getComparableFileName(file);
      if (fileName && existingNames.has(fileName)) {
        duplicateFileNameCount += 1;
        items.push(makeItem({
          severity: 'warning',
          kind: 'duplicate-file',
          message: `检测到同名文件候选：${file.displayName} 已存在于 ${collection.title}`,
          sourceRelativePath: file.relativePath,
          targetRelativePath: collection.targetRelativeDirectory,
          blocksExecution: false,
        }, items.length));
      }

      if (file.sizeBytes && collection.knownSizeBytes && file.sizeBytes === collection.knownSizeBytes) {
        sameSizeSuspectCount += 1;
        items.push(makeItem({
          severity: 'info',
          kind: 'duplicate-file',
          message: `检测到同大小疑似重复候选：${file.displayName} · ${file.sizeBytes} bytes。MVP89 不计算真实 hash，仅标记后续待确认。`,
          sourceRelativePath: file.relativePath,
          targetRelativePath: collection.targetRelativeDirectory,
          blocksExecution: false,
        }, items.length));
      }

      if (file.checksum && collection.checksum && file.checksum === collection.checksum) {
        hashCandidateCount += 1;
        items.push(makeItem({
          severity: 'blocker',
          kind: 'duplicate-file',
          message: `检测到 checksum 合同字段相同：${file.displayName}。MVP89 只消费已有 checksum 字段，不读取真实文件计算 hash。`,
          sourceRelativePath: file.relativePath,
          targetRelativePath: collection.targetRelativeDirectory,
          blocksExecution: true,
        }, items.length));
      }
    });
  });

  if (selectedNames.size !== selectedFiles.length) {
    items.push(makeItem({
      severity: 'warning',
      kind: 'duplicate-file',
      message: '导入源内部存在同名文件，后续目标路径规划必须追加序号或进入人工确认。',
      blocksExecution: false,
    }, items.length));
  }

  if (items.length === 0) {
    items.push(makeItem({
      severity: 'info',
      kind: 'unknown',
      message: '示例任务未发现阻断级冲突；真实导入前仍需在 main 侧复查目标目录和文件状态。',
      blocksExecution: false,
    }, items.length));
  }

  const blockers = items.filter((item) => item.blocksExecution || item.severity === 'blocker').length;
  const warnings = items.filter((item) => item.severity === 'warning').length;

  return {
    taskId: task.id,
    detectedType: task.detectedType,
    detectedTitle: task.detectedTitle || '未命名导入任务',
    comparedCollections: input.existingCollections.length,
    duplicateCodeCount,
    duplicateAlbumCount,
    duplicateFileNameCount,
    sameSizeSuspectCount,
    hashCandidateCount,
    report: {
      summary: `MVP89 只读冲突预览：${blockers} 个阻断，${warnings} 个警告，已比较 ${input.existingCollections.length} 个本地集合快照。`,
      blockers,
      warnings,
      items,
    },
  };
}

const rjPreview = rjImportReadOnlyDetectionService.getModel().sampleResult.task;
const musicPreview = musicImportReadOnlyDetectionService.getModel().sampleResult.task;

const sampleExistingCollections: ImportConflictExistingCollectionPreview[] = [
  {
    id: 'existing-rj-rj01588893',
    type: 'rj-work',
    code: 'RJ01588893',
    title: '雨音耳かき 既有版本',
    artistOrCircle: 'Example Circle',
    targetRelativeDirectory: 'ASMR/RJ01588893 - 雨音耳かき 既有版本/',
    fileNames: ['01_本編.wav', 'cover.jpg', 'readme.txt'],
    knownSizeBytes: 734003200,
  },
  {
    id: 'existing-music-aimer-walpurgis',
    type: 'music-album',
    title: 'Walpurgis',
    artistOrCircle: 'Aimer',
    targetRelativeDirectory: 'Music/Aimer - Walpurgis/',
    fileNames: ['01 Walpurgis.flac', '02 STAND-ALONE.flac', 'cover.jpg'],
    knownSizeBytes: 42000000,
  },
  {
    id: 'existing-music-singles',
    type: 'music-singles',
    title: '单曲集合',
    artistOrCircle: '未知艺术家',
    targetRelativeDirectory: 'Music/Singles/单曲导入源/',
    fileNames: ['lofi sleep.mp3', 'cover.png'],
  },
];

function makeSampleInputs(): ImportConflictDetectionInput[] {
  return [
    {task: rjPreview, existingCollections: sampleExistingCollections},
    {task: musicPreview, existingCollections: sampleExistingCollections},
  ];
}

function getModel(): Mvp89ImportConflictDetectionModel {
  const sampleInputs = makeSampleInputs();
  return {
    version: '0.127.0-mvp89',
    title: 'MVP-89 导入冲突检测 / hash 策略预览',
    summary: '在 RJ 与音乐只读识别之后，增加统一冲突检测预览：比较同 RJ、同音乐专辑、目标目录、同文件名、同大小疑似重复，并冻结 hash 策略；本轮不读取真实文件、不计算真实 hash、不执行 copy/move。',
    baseline: '0.126.0-mvp88 / 音乐专辑与单曲只读识别',
    sampleInputs,
    sampleResults: sampleInputs.map(buildImportConflictPreview),
    ruleCards: [
      {id: 'duplicate-rj', kind: 'duplicate-rj', title: '同 RJ / 同编号', detail: 'detectedCode 与已有集合 code 相同时直接标记 blocker，后续必须选择跳过、合并或创建差分版本。', tone: 'rose'},
      {id: 'duplicate-album', kind: 'duplicate-album', title: '同音乐专辑', detail: '音乐导入按 artist + title 做弱匹配；MVP89 只提示，不自动合并。', tone: 'amber'},
      {id: 'duplicate-file-name', kind: 'duplicate-file-name', title: '同文件名', detail: '同名文件先作为 warning，后续目标路径规划必须决定跳过、改名或人工确认。', tone: 'sky'},
      {id: 'same-size-suspect', kind: 'same-size-suspect', title: '同大小疑似重复', detail: '只有 sizeBytes 合同字段时标记 suspect，不等价于 hash 命中。', tone: 'violet'},
      {id: 'target-plan', kind: 'target-plan', title: '目标目录已存在', detail: 'targetRelativeDirectory 命中已有目录时阻断执行；overwrite 仍固定 false。', tone: 'rose'},
    ],
    hashStrategy: [
      {id: 'hash-contract-only', title: '合同字段优先', detail: 'MVP89 只消费 ImportFileContract.checksum 字段；不会读取真实文件计算 hash。', enabledInMvp89: true},
      {id: 'hash-after-size', title: '先 size 后 hash', detail: '后续真实导入前，只有同大小候选才进入 hash 队列，避免全量高成本计算。', enabledInMvp89: false},
      {id: 'main-process-only', title: 'main 侧计算', detail: '真实 hash 必须在 Electron main / 受控 worker 中执行，Renderer 不接触 absolutePath。', enabledInMvp89: false},
      {id: 'no-auto-delete', title: 'hash 命中也不自动删除', detail: '即使未来 hash 命中，也只能阻断或提示，不能自动删除源文件或目标文件。', enabledInMvp89: true},
    ],
    guardedBoundaries: [
      'MVP89 不打开真实目录，不读取真实文件系统。',
      'MVP89 不计算真实 hash，只定义 hash 策略并消费已有 checksum 合同字段。',
      '输入仍只允许 tokenized ImportTask 与本地集合快照。',
      '不复制、不移动、不删除、不重命名真实媒体文件。',
      '不写 library-index.json，不接 SQLite。',
      '不接下载 Provider，不接 mpv。',
      'Renderer 不接收 absolutePath 或 file://。',
      'overwrite 继续固定 false。',
    ],
    nextSteps: ['MVP90：目标路径规划预览', 'MVP91：copy only 导入，需要二次确认与 Codex 本机验收', 'MVP92：move + 操作日志，必须晚于 copy only'],
  };
}

function getToneClassName(tone: Mvp89ConflictTone): string {
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

export const importConflictDetectionPreviewService = {
  getModel,
  buildImportConflictPreview,
  getToneClassName,
};
