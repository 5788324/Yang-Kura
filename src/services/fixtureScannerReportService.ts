import type {LibraryCollection, LibraryTrack, LocalJsonIndex} from '../types';

// MVP-03 report layer: No real filesystem scanning; fixture LocalJsonIndex analysis only.

export type FixtureDiagnosticSeverity = 'info' | 'warning' | 'error';
export type FixtureReportStatus = 'pass' | 'needs-review' | 'blocked';

export interface FixtureScannerDiagnostic {
  id: string;
  severity: FixtureDiagnosticSeverity;
  scope: 'index' | 'root' | 'collection' | 'track';
  message: string;
  targetId?: string;
  hint: string;
}

export interface FixtureDuplicateGroup {
  key: string;
  ids: string[];
  titles: string[];
}

export interface FixtureCollectionReport {
  collectionId: string;
  title: string;
  collectionType: LibraryCollection['collectionType'];
  codeNorm?: string;
  trackCount: number;
  audioTrackCount: number;
  videoTrackCount: number;
  imageTrackCount: number;
  subtitleCount: number;
  hasCover: boolean;
  qualityScore: number;
  diagnostics: FixtureScannerDiagnostic[];
}

export interface FixtureTrackReport {
  trackId: string;
  collectionId: string;
  title: string;
  kind: LibraryTrack['kind'];
  extension?: string;
  relativePath?: string;
  subtitleCount: number;
  hasCover: boolean;
  diagnostics: FixtureScannerDiagnostic[];
}

export interface FixtureScannerReportSummary {
  rootCount: number;
  collectionCount: number;
  trackCount: number;
  audioTrackCount: number;
  videoTrackCount: number;
  imageTrackCount: number;
  coverCount: number;
  subtitleCount: number;
  collectionMissingCoverCount: number;
  collectionNoAudioCount: number;
  collectionImageOnlyCount: number;
  collectionMetadataOnlyCount: number;
  audioTrackMissingSubtitleCount: number;
  duplicateRjGroupCount: number;
  duplicateTrackPathGroupCount: number;
  overallQualityScore: number;
}

export interface FixtureScannerReport {
  reportVersion: 1;
  generatedAt: string;
  sourceKind: LocalJsonIndex['sourceKind'];
  status: FixtureReportStatus;
  summary: FixtureScannerReportSummary;
  diagnostics: FixtureScannerDiagnostic[];
  collections: FixtureCollectionReport[];
  tracks: FixtureTrackReport[];
  duplicateRjGroups: FixtureDuplicateGroup[];
  duplicateTrackPathGroups: FixtureDuplicateGroup[];
  nextActions: string[];
}

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));
const percent = (value: number, total: number): number => total <= 0 ? 0 : Math.round((value / total) * 100);

const groupBy = <T,>(items: T[], getKey: (item: T) => string | undefined): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item)?.trim();
    if (!key) continue;
    map.set(key, [...(map.get(key) || []), item]);
  }
  return map;
};

const duplicateGroups = <T extends {id: string; title?: string}>(items: T[], getKey: (item: T) => string | undefined): FixtureDuplicateGroup[] => {
  return [...groupBy(items, getKey).entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      key,
      ids: group.map((item) => item.id),
      titles: group.map((item) => item.title || item.id),
    }));
};

const makeDiagnostic = (
  id: string,
  severity: FixtureDiagnosticSeverity,
  scope: FixtureScannerDiagnostic['scope'],
  message: string,
  hint: string,
  targetId?: string,
): FixtureScannerDiagnostic => ({id, severity, scope, message, hint, targetId});

const collectionScore = (collection: LibraryCollection, tracks: LibraryTrack[]): number => {
  const audioTracks = tracks.filter((track) => track.kind === 'audio');
  const videoTracks = tracks.filter((track) => track.kind === 'video');
  const imageTracks = tracks.filter((track) => track.kind === 'image');
  const hasCover = Boolean(collection.cover);
  const hasPlayable = audioTracks.length + videoTracks.length > 0;
  const subtitleCoverage = audioTracks.length === 0 ? 0 : percent(audioTracks.filter((track) => track.subtitles.length > 0).length, audioTracks.length);
  return clampScore((hasPlayable ? 45 : imageTracks.length > 0 ? 20 : 0) + (hasCover ? 25 : 0) + (subtitleCoverage * 0.3));
};

const buildNextActions = (summary: FixtureScannerReportSummary): string[] => {
  const actions: string[] = [];
  if (summary.collectionMetadataOnlyCount > 0) actions.push('先处理空目录/只有封面的 collection：确认未来真实扫描不会把元数据目录误当可播放专辑。');
  if (summary.collectionImageOnlyCount > 0) actions.push('图片/CG-only collection 只做资产诊断；MVP 不内置漫画/图库阅读器，后续走外部打开。');
  if (summary.collectionNoAudioCount > 0) actions.push('确认无音频 collection 是否为视频/图片/空目录场景，不要自动删除或合并。');
  if (summary.collectionMissingCoverCount > 0) actions.push('补 cover/folder/front/jacket 封面样本，确认封面识别规则。');
  if (summary.audioTrackMissingSubtitleCount > 0) actions.push('补同名 .lrc/.srt/.vtt/.ass 字幕样本，确认字幕匹配规则。');
  if (summary.duplicateRjGroupCount > 0) actions.push('保留重复 RJ 诊断，不自动合并；后续真实扫描必须让用户手动确认。');
  if (summary.duplicateTrackPathGroupCount > 0) actions.push('检查虚拟 entries 是否重复；真实扫描阶段必须用 rootId + relativePath 去重。');
  if (actions.length === 0) actions.push('fixture report 基线通过；下一轮可以做 fixture scanner UI/diagnostics 接入或 fixture 扫描用例扩展。');
  return actions;
};

export const fixtureScannerReportService = {
  analyze(index: LocalJsonIndex): FixtureScannerReport {
    const diagnostics: FixtureScannerDiagnostic[] = [];
    const tracksByCollection = groupBy(index.tracks, (track) => track.collectionId);

    if (index.sourceKind !== 'fixture') {
      diagnostics.push(makeDiagnostic(
        'index-source-not-fixture',
        'error',
        'index',
        `Report service expected fixture sourceKind, got ${index.sourceKind}.`,
        'MVP-03 只能分析 fixture scanner 的内存结果；不要接真实扫描结果。',
      ));
    }

    const duplicateRjGroups = duplicateGroups(
      index.collections.filter((collection) => collection.collectionType === 'rj_work'),
      (collection) => collection.codeNorm,
    );
    duplicateRjGroups.forEach((group) => diagnostics.push(makeDiagnostic(
      `duplicate-rj-${group.key}`,
      'warning',
      'collection',
      `Duplicate RJ id in fixture collections: ${group.key}.`,
      '只报告，不自动合并、不删除、不改名；真实扫描阶段必须保留人工确认。',
      group.ids[0],
    )));

    const duplicateTrackPathGroups = duplicateGroups(index.tracks, (track) => track.source.relativePath?.toLowerCase());
    duplicateTrackPathGroups.forEach((group) => diagnostics.push(makeDiagnostic(
      `duplicate-track-path-${group.key}`,
      'warning',
      'track',
      `Duplicate fixture track relativePath: ${group.key}.`,
      'fixture 层只报告重复路径；后续真实扫描使用 rootId + relativePath 判重。',
      group.ids[0],
    )));

    const collectionReports: FixtureCollectionReport[] = index.collections.map((collection) => {
      const collectionTracks = tracksByCollection.get(collection.id) || [];
      const audioTracks = collectionTracks.filter((track) => track.kind === 'audio');
      const videoTracks = collectionTracks.filter((track) => track.kind === 'video');
      const imageTracks = collectionTracks.filter((track) => track.kind === 'image');
      const subtitleCount = collectionTracks.reduce((total, track) => total + track.subtitles.length, 0);
      const collectionDiagnostics: FixtureScannerDiagnostic[] = [];

      if (audioTracks.length === 0 && videoTracks.length === 0 && imageTracks.length === 0) {
        collectionDiagnostics.push(makeDiagnostic(
          `collection-no-audio-${collection.id}`,
          'error',
          'collection',
          `Collection has no playable audio/video/image tracks: ${collection.title}.`,
          '检查 fixture entries 的扩展名和 collection 分组规则；空目录/只有封面应被显式报告。',
          collection.id,
        ));
      } else if (audioTracks.length === 0 && videoTracks.length === 0 && imageTracks.length > 0) {
        collectionDiagnostics.push(makeDiagnostic(
          `collection-image-only-${collection.id}`,
          'warning',
          'collection',
          `Collection is image/CG-only: ${collection.title}.`,
          '图片/CG 目录可以进入资源库资产诊断，但 MVP 不内置图库阅读器，后续优先外部打开。',
          collection.id,
        ));
      }
      if (!collection.cover) {
        collectionDiagnostics.push(makeDiagnostic(
          `collection-missing-cover-${collection.id}`,
          'warning',
          'collection',
          `Collection has no cover: ${collection.title}.`,
          '支持 cover/folder/front/jacket + jpg/png/webp；fixture 可以补一个封面样本。',
          collection.id,
        ));
      }
      if (collection.collectionType === 'rj_work' && !collection.codeNorm) {
        collectionDiagnostics.push(makeDiagnostic(
          `collection-rj-missing-code-${collection.id}`,
          'warning',
          'collection',
          `RJ collection missing normalized RJ code: ${collection.title}.`,
          '确认文件夹名是否包含 RJ123456 / RJ01234567。',
          collection.id,
        ));
      }

      diagnostics.push(...collectionDiagnostics);
      return {
        collectionId: collection.id,
        title: collection.title,
        collectionType: collection.collectionType,
        codeNorm: collection.codeNorm,
        trackCount: collectionTracks.length,
        audioTrackCount: audioTracks.length,
        videoTrackCount: videoTracks.length,
        imageTrackCount: imageTracks.length,
        subtitleCount,
        hasCover: Boolean(collection.cover),
        qualityScore: collectionScore(collection, collectionTracks),
        diagnostics: collectionDiagnostics,
      };
    });

    const trackReports: FixtureTrackReport[] = index.tracks.map((track) => {
      const trackDiagnostics: FixtureScannerDiagnostic[] = [];
      if (!track.source.relativePath) {
        trackDiagnostics.push(makeDiagnostic(
          `track-missing-relative-path-${track.id}`,
          'error',
          'track',
          `Track missing relativePath: ${track.title}.`,
          'fixture scanner 不允许 absolutePath/fileUrl，必须保留相对路径作为安全样本。',
          track.id,
        ));
      }
      if (track.kind === 'audio' && track.subtitles.length === 0) {
        trackDiagnostics.push(makeDiagnostic(
          `track-missing-subtitle-${track.id}`,
          'info',
          'track',
          `Audio track has no matched subtitle: ${track.title}.`,
          '不是所有音乐都必须有字幕；ASMR/RJ 后续可提高字幕匹配优先级。',
          track.id,
        ));
      }
      diagnostics.push(...trackDiagnostics);
      return {
        trackId: track.id,
        collectionId: track.collectionId,
        title: track.title,
        kind: track.kind,
        extension: track.source.extension,
        relativePath: track.source.relativePath,
        subtitleCount: track.subtitles.length,
        hasCover: Boolean(track.cover),
        diagnostics: trackDiagnostics,
      };
    });

    const audioTrackCount = index.tracks.filter((track) => track.kind === 'audio').length;
    const videoTrackCount = index.tracks.filter((track) => track.kind === 'video').length;
    const imageTrackCount = index.tracks.filter((track) => track.kind === 'image').length;
    const collectionMissingCoverCount = collectionReports.filter((item) => !item.hasCover).length;
    const collectionNoAudioCount = collectionReports.filter((item) => item.audioTrackCount + item.videoTrackCount === 0).length;
    const collectionImageOnlyCount = collectionReports.filter((item) => item.audioTrackCount + item.videoTrackCount === 0 && item.imageTrackCount > 0).length;
    const collectionMetadataOnlyCount = collectionReports.filter((item) => item.audioTrackCount + item.videoTrackCount + item.imageTrackCount === 0).length;
    const audioTrackMissingSubtitleCount = trackReports.filter((item) => item.kind === 'audio' && item.subtitleCount === 0).length;
    const blockingCount = diagnostics.filter((item) => item.severity === 'error').length;
    const warningCount = diagnostics.filter((item) => item.severity === 'warning').length;
    const coverageScore = clampScore(
      100
      - (collectionMetadataOnlyCount * 30)
      - (collectionImageOnlyCount * 8)
      - (collectionMissingCoverCount * 10)
      - (audioTrackMissingSubtitleCount * 4)
      - (duplicateRjGroups.length * 15)
      - (duplicateTrackPathGroups.length * 15),
    );
    const summary: FixtureScannerReportSummary = {
      rootCount: index.roots.length,
      collectionCount: index.collections.length,
      trackCount: index.tracks.length,
      audioTrackCount,
      videoTrackCount,
      imageTrackCount,
      coverCount: index.covers.length,
      subtitleCount: index.subtitles.length,
      collectionMissingCoverCount,
      collectionNoAudioCount,
      collectionImageOnlyCount,
      collectionMetadataOnlyCount,
      audioTrackMissingSubtitleCount,
      duplicateRjGroupCount: duplicateRjGroups.length,
      duplicateTrackPathGroupCount: duplicateTrackPathGroups.length,
      overallQualityScore: coverageScore,
    };

    return {
      reportVersion: 1,
      generatedAt: index.generatedAt,
      sourceKind: index.sourceKind,
      status: blockingCount > 0 ? 'blocked' : warningCount > 0 ? 'needs-review' : 'pass',
      summary,
      diagnostics,
      collections: collectionReports,
      tracks: trackReports,
      duplicateRjGroups,
      duplicateTrackPathGroups,
      nextActions: buildNextActions(summary),
    };
  },
};
