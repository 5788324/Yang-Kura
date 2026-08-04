import type {
  ImportConflictItemContract,
  ImportDetectedType,
  ImportFileContract,
  ImportFileKind,
  ImportTaskContract,
  MetadataCandidateContract,
  MetadataSourceContract,
} from './importDownloadModelContractService';

export type Mvp88MusicImportTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'zinc';

export interface MusicImportReadonlyInput {
  sourceRootToken: string;
  sourceDisplayName: string;
  relativePaths: string[];
}

export interface MusicImportCategoryCount {
  kind: ImportFileKind;
  label: string;
  count: number;
  tone: Mvp88MusicImportTone;
}

export interface MusicImportReadonlyDetectionResult {
  task: ImportTaskContract;
  categoryCounts: MusicImportCategoryCount[];
  detectedFolderName: string;
  detectedType: ImportDetectedType;
  detectedArtist: string | undefined;
  detectedAlbum: string | undefined;
  confidence: number;
  warnings: string[];
  blockers: string[];
}

export interface Mvp88ReadonlyRuleCard {
  id: string;
  title: string;
  detail: string;
  tone: Mvp88MusicImportTone;
}

export interface Mvp88MusicImportReadonlyDetectionModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  sampleInput: MusicImportReadonlyInput;
  sampleResult: MusicImportReadonlyDetectionResult;
  ruleCards: Mvp88ReadonlyRuleCard[];
  guardedBoundaries: string[];
  nextSteps: string[];
}

const audioExt = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus']);
const videoExt = new Set(['mp4', 'mkv', 'webm', 'avi', 'mov', 'wmv']);
const imageExt = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']);
const subtitleExt = new Set(['lrc', 'srt', 'vtt', 'ass']);
const textExt = new Set(['txt', 'md', 'json', 'nfo', 'pdf', 'cue']);
const archiveExt = new Set(['zip', '7z', 'rar']);
const protectedExt = new Set(['ncm', 'qmc0', 'qmc3', 'qmcflac', 'mflac', 'mgg', 'kgm']);

function splitPath(relativePath: string): string[] {
  return relativePath.split(/[\\/]+/).filter(Boolean);
}

function getDisplayName(relativePath: string): string {
  const parts = splitPath(relativePath);
  return parts.at(-1) || relativePath;
}

function getExt(relativePath: string): string {
  const name = getDisplayName(relativePath);
  return name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';
}

function getTopFolders(relativePaths: string[]): string[] {
  return Array.from(new Set(relativePaths.map((relativePath) => splitPath(relativePath)[0]).filter(Boolean)));
}

function getPrimaryFolderName(relativePaths: string[]): string {
  const folders = getTopFolders(relativePaths);
  if (folders.length === 1) return folders[0];
  if (folders.length > 1) return '多目录导入源';
  return '单曲导入源';
}

export function classifyMusicImportRelativePath(relativePath: string): ImportFileKind {
  const ext = getExt(relativePath);
  if (audioExt.has(ext)) return 'audio';
  if (videoExt.has(ext)) return 'video';
  if (imageExt.has(ext)) return 'image';
  if (subtitleExt.has(ext)) return 'subtitle';
  if (textExt.has(ext)) return 'text';
  if (archiveExt.has(ext)) return 'archive';
  return 'other';
}

export function isProtectedMusicDownload(relativePath: string): boolean {
  return protectedExt.has(getExt(relativePath));
}

export function isLikelyMusicCover(relativePath: string): boolean {
  const name = getDisplayName(relativePath).toLowerCase();
  return ['cover', 'folder', 'front', 'album', 'jacket', '封面'].some((token) => name.includes(token)) && classifyMusicImportRelativePath(relativePath) === 'image';
}

export function inferArtistAlbumFromFolder(folderName: string): {artist?: string; album?: string} {
  const normalized = folderName.replace(/[［\[].*?[\]］]/g, '').trim();
  const dashMatch = normalized.split(/\s+-\s+|\s+–\s+|\s+—\s+/).map((part) => part.trim()).filter(Boolean);
  if (dashMatch.length >= 2) return {artist: dashMatch[0], album: dashMatch.slice(1).join(' - ')};
  const slashParts = normalized.split(/[\\/]+/).map((part) => part.trim()).filter(Boolean);
  if (slashParts.length >= 2) return {artist: slashParts.at(-2), album: slashParts.at(-1)};
  return {album: normalized || folderName};
}

function makeImportFiles(relativePaths: string[]): ImportFileContract[] {
  return relativePaths.map((relativePath, index) => {
    const kind = classifyMusicImportRelativePath(relativePath);
    const warnings: string[] = [];
    if (kind === 'other') warnings.push('暂不支持的扩展名，真实导入前需要人工确认。');
    if (relativePath.includes('..')) warnings.push('相对路径包含 ..，真实导入必须阻断。');
    if (isProtectedMusicDownload(relativePath)) warnings.push('疑似平台受保护 / 加密缓存文件，不作为可播放 Track 导入。');
    return {
      id: `mvp88-music-file-${String(index + 1).padStart(2, '0')}`,
      relativePath,
      displayName: getDisplayName(relativePath),
      kind,
      selected: kind !== 'other' && !isProtectedMusicDownload(relativePath),
      warnings,
    };
  });
}

function getCategoryCounts(files: ImportFileContract[]): MusicImportCategoryCount[] {
  const groups: Array<[ImportFileKind, string, Mvp88MusicImportTone]> = [
    ['audio', '音频', 'emerald'],
    ['image', '封面 / 图片', 'sky'],
    ['subtitle', '歌词 / 字幕', 'violet'],
    ['text', '说明 / CUE', 'zinc'],
    ['archive', '压缩包', 'amber'],
    ['video', '视频', 'amber'],
    ['other', '其他 / 受保护', 'rose'],
  ];
  return groups.map(([kind, label, tone]) => ({kind, label, tone, count: files.filter((file) => file.kind === kind).length}));
}

function inferDetectedType(relativePaths: string[], files: ImportFileContract[]): ImportDetectedType {
  const audioCount = files.filter((file) => file.kind === 'audio').length;
  if (audioCount === 0) return 'unknown';
  const topFolders = getTopFolders(relativePaths);
  const audioFolders = new Set(files.filter((file) => file.kind === 'audio').map((file) => splitPath(file.relativePath)[0] || 'root'));
  if (topFolders.length > 1 || audioFolders.size > 1) return 'mixed';
  const rootAudioCount = files.filter((file) => file.kind === 'audio' && splitPath(file.relativePath).length === 1).length;
  if (rootAudioCount > 1) return 'music-singles';
  return 'music-album';
}

export function buildMusicImportReadonlyPreview(input: MusicImportReadonlyInput): MusicImportReadonlyDetectionResult {
  const files = makeImportFiles(input.relativePaths);
  const folderName = getPrimaryFolderName(input.relativePaths);
  const detectedType = inferDetectedType(input.relativePaths, files);
  const {artist, album} = inferArtistAlbumFromFolder(folderName);
  const audioCount = files.filter((file) => file.kind === 'audio').length;
  const imageCount = files.filter((file) => file.kind === 'image').length;
  const subtitleCount = files.filter((file) => file.kind === 'subtitle').length;
  const protectedFiles = files.filter((file) => isProtectedMusicDownload(file.relativePath));
  const otherWarnings = files.flatMap((file) => file.warnings);
  const warnings: string[] = [...otherWarnings];
  const blockers: string[] = [];

  if (audioCount === 0) blockers.push('未检测到可导入音频文件，不能生成音乐导入任务。');
  if (!artist && detectedType === 'music-album') warnings.push('未能从文件夹名稳定推断艺术家。');
  if (imageCount === 0) warnings.push('未检测到专辑封面候选。');
  if (subtitleCount === 0) warnings.push('未检测到歌词 / 字幕文件。');
  if (detectedType === 'mixed') warnings.push('检测到多个目录或多组音频，后续应进入混合目录预览，不自动归入单张专辑。');
  if (protectedFiles.length > 0) blockers.push('检测到疑似网易云 / QQ 等平台受保护文件；Yang-Kura 不做 DRM/加密绕过。');

  const cover = files.find((file) => isLikelyMusicCover(file.relativePath)) || files.find((file) => file.kind === 'image');
  const title = detectedType === 'music-singles' ? '单曲集合' : (album || folderName);
  const artistLabel = artist || '未知艺术家';
  const metadataSources: MetadataSourceContract[] = [
    {
      id: 'mvp88-meta-local-folder',
      provider: 'local-folder',
      confidence: artist ? 0.72 : 0.48,
      title,
      circleOrArtist: artist,
      coverRelativePath: cover?.relativePath,
      notes: 'MVP88 不读取 ID3 / FLAC tag，只根据 tokenized relativePaths 与文件夹名做只读音乐识别。',
      mergePriority: 35,
    },
    {
      id: 'mvp88-meta-music-tags-placeholder',
      provider: 'music-tags',
      confidence: 0,
      notes: 'music-tags Provider 仅作为后续合同占位；MVP88 不读取真实标签。',
      mergePriority: 55,
    },
  ];
  const metadataCandidates: MetadataCandidateContract[] = [
    {sourceId: 'mvp88-meta-local-folder', field: 'title', value: title, confidence: album ? 0.7 : 0.42, selected: Boolean(title)},
    {sourceId: 'mvp88-meta-local-folder', field: 'artist', value: artistLabel, confidence: artist ? 0.72 : 0.2, selected: Boolean(artist)},
  ];
  if (cover) metadataCandidates.push({sourceId: 'mvp88-meta-local-folder', field: 'coverRelativePath', value: cover.relativePath, confidence: 0.74, selected: true});

  const conflictItems: ImportConflictItemContract[] = [
    ...warnings.map((message, index) => ({
      id: `mvp88-warning-${index + 1}`,
      severity: 'warning' as const,
      kind: message.includes('受保护') || message.includes('加密') ? 'unsupported-protected-file' as const : 'mixed-content' as const,
      message,
      blocksExecution: false,
    })),
    ...blockers.map((message, index) => ({
      id: `mvp88-blocker-${index + 1}`,
      severity: 'blocker' as const,
      kind: message.includes('DRM') || message.includes('受保护') ? 'unsupported-protected-file' as const : 'mixed-content' as const,
      message,
      blocksExecution: true,
    })),
  ];

  const collectionDir = detectedType === 'music-singles'
    ? `Music/Singles/${folderName}/`
    : detectedType === 'mixed'
      ? `Music/待整理混合目录/${folderName}/`
      : `Music/${artistLabel} - ${title}/`;

  const task: ImportTaskContract = {
    id: 'import-task-mvp88-readonly-music-preview',
    sourceKind: 'music',
    sourceRootToken: input.sourceRootToken,
    detectedType,
    detectedTitle: title,
    detectedArtistOrCircle: artist,
    sourceFiles: files,
    metadataSources,
    metadataCandidates,
    targetPlan: {
      targetRootToken: 'target-root-token:mvp88-demo-library',
      targetCollectionType: detectedType,
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
      summary: `音乐只读识别：${blockers.length} 个阻断，${warnings.length} 个提醒。`,
      blockers: blockers.length,
      warnings: warnings.length,
      items: conflictItems,
    },
    operationMode: 'copy',
    status: 'previewed',
    createdAt: '2026-07-07T00:00:00.000Z',
    updatedAt: '2026-07-07T00:00:00.000Z',
  };

  const confidence = Math.min(1, (audioCount > 0 ? 0.3 : 0) + (artist ? 0.22 : 0) + (album ? 0.2 : 0) + (cover ? 0.12 : 0) + (subtitleCount > 0 ? 0.08 : 0) - (blockers.length > 0 ? 0.25 : 0));
  return {
    task,
    categoryCounts: getCategoryCounts(files),
    detectedFolderName: folderName,
    detectedType,
    detectedArtist: artist,
    detectedAlbum: album,
    confidence: Math.max(0, confidence),
    warnings,
    blockers,
  };
}

const sampleInput: MusicImportReadonlyInput = {
  sourceRootToken: 'source-root-token:mvp88-readonly-music-staging',
  sourceDisplayName: '导入暂存区 / Aimer - Walpurgis',
  relativePaths: [
    'Aimer - Walpurgis/cover.jpg',
    'Aimer - Walpurgis/01 Walpurgis.flac',
    'Aimer - Walpurgis/02 STAND-ALONE.flac',
    'Aimer - Walpurgis/03 cold rain.m4a',
    'Aimer - Walpurgis/01 Walpurgis.lrc',
    'Aimer - Walpurgis/booklet.pdf',
  ],
};

function getModel(): Mvp88MusicImportReadonlyDetectionModel {
  const sampleResult = buildMusicImportReadonlyPreview(sampleInput);
  return {
    version: '0.126.0-mvp88',
    title: 'MVP-88 音乐专辑 / 单曲只读识别',
    summary: '在 MVP87 RJ 只读识别后，加入普通音乐导入预览：只处理 tokenized relativePaths，推断 music-album / music-singles / mixed，按音频 / 封面 / 歌词 / 文本分类，并生成 ImportTask preview；不读取 ID3 / FLAC tag，不读取真实目录，不执行文件操作。',
    baseline: '0.125.0-mvp87 / RJ 专辑导入只读识别',
    sampleInput,
    sampleResult,
    ruleCards: [
      {id: 'music-shape', title: '音乐结构推断', detail: '单一顶层目录倾向 music-album；根级多个音频倾向 music-singles；多目录或多组音频先标 mixed。', tone: 'emerald'},
      {id: 'folder-metadata', title: '文件夹元数据', detail: '支持 Artist - Album / Artist – Album / Artist — Album 形式；不读真实 ID3 / FLAC tag。', tone: 'sky'},
      {id: 'protected-files', title: '受保护文件识别', detail: 'ncm / qmc / mflac / kgm 等疑似平台受保护文件只做提示和阻断，不转换、不解密。', tone: 'rose'},
      {id: 'target-plan', title: '目标路径预览', detail: '只生成 Music/Artist - Album 或 Music/Singles 的 TargetPlan；overwrite 固定 false。', tone: 'amber'},
    ],
    guardedBoundaries: [
      'MVP88 不打开真实目录选择器，不读取真实文件系统。',
      '输入只允许 sourceRootToken、sourceDisplayName、relativePaths。',
      'Renderer 不接收 absolutePath 或 file://。',
      '不读取 ID3 / FLAC / embedded cover 标签。',
      '不转换、不解密网易云 / QQ 等受保护格式。',
      '不调用 fs.copyFile / fs.rename / fs.rm / fs.unlink。',
      '不写 library-index.json，不写 SQLite。',
      'copy only 仍后置到 MVP91，move 后置到 MVP92+。',
    ],
    nextSteps: ['MVP89：冲突检测：同 RJ、同文件、同专辑、hash 策略', 'MVP90：目标路径规划', 'MVP91：copy only 导入', 'MVP92：move + 操作日志'],
  };
}

function getToneClassName(tone: Mvp88MusicImportTone): string {
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

export const musicImportReadOnlyDetectionService = {
  getModel,
  inferArtistAlbumFromFolder,
  classifyMusicImportRelativePath,
  isProtectedMusicDownload,
  buildMusicImportReadonlyPreview,
  getToneClassName,
};
