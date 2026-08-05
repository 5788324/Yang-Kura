import type {LocalJsonIndex} from '../types';
import type {FixtureScannerReport} from './fixtureScannerReportService';

export type FixtureHarnessStatus = 'pass' | 'fail';
export type FixtureHarnessSeverity = 'required' | 'recommended';

export interface FixtureScannerTestCase {
  id: string;
  title: string;
  severity: FixtureHarnessSeverity;
  expected: string;
  actual: string;
  status: FixtureHarnessStatus;
  nextAction: string;
}

export interface FixtureScannerTestHarnessSummary {
  total: number;
  passed: number;
  failed: number;
  requiredFailed: number;
  recommendedFailed: number;
  status: 'pass' | 'blocked' | 'needs-review';
}

export interface FixtureScannerTestHarnessReport {
  harnessVersion: 1;
  sourceKind: 'fixture';
  title: string;
  summary: FixtureScannerTestHarnessSummary;
  cases: FixtureScannerTestCase[];
  matrixGroups: Array<{title: string; caseIds: string[]}>;
  gateRules: string[];
}

const pass = (
  id: string,
  title: string,
  severity: FixtureHarnessSeverity,
  expected: string,
  actual: string,
  ok: boolean,
  nextAction: string,
): FixtureScannerTestCase => ({
  id,
  title,
  severity,
  expected,
  actual,
  status: ok ? 'pass' : 'fail',
  nextAction,
});

const hasTrackKind = (index: LocalJsonIndex, kind: string): boolean => index.tracks.some((track) => track.kind === kind);
const hasCollectionType = (index: LocalJsonIndex, collectionType: string): boolean => index.collections.some((collection) => collection.collectionType === collectionType);
const allFixtureSafePaths = (index: LocalJsonIndex): boolean => index.tracks.every((track) => (
  Boolean(track.source.relativePath)
  && !track.source.absolutePath
  && !track.source.fileUrl
  && !track.source.relativePath?.match(/^[a-z]:/i)
));

export const fixtureScannerTestHarness = {
  run(index: LocalJsonIndex, report: FixtureScannerReport): FixtureScannerTestHarnessReport {
    const cases: FixtureScannerTestCase[] = [
      pass(
        'source-kind-fixture-only',
        'sourceKind 必须保持 fixture',
        'required',
        'LocalJsonIndex.sourceKind === "fixture"',
        `sourceKind=${index.sourceKind}`,
        index.sourceKind === 'fixture',
        '如果不是 fixture，停止；MVP-06 不允许真实扫描结果进入 harness。',
      ),
      pass(
        'two-library-roots',
        '必须存在 ASMR 与音乐两个 fixture root',
        'required',
        'roots >= 2，并包含 asmr/music',
        `roots=${index.roots.map((root) => root.libraryType).join(',')}`,
        index.roots.some((root) => root.libraryType === 'asmr') && index.roots.some((root) => root.libraryType === 'music'),
        '如果缺 root，先修 fixtureLibrarySample，而不是接真实路径。',
      ),
      pass(
        'rj-work-detected',
        '能识别 RJ collection',
        'required',
        '至少 1 个 collectionType=rj_work，且存在 RJ01234567',
        `rj=${index.collections.filter((item) => item.collectionType === 'rj_work').map((item) => item.codeNorm || 'missing').join(',')}`,
        hasCollectionType(index, 'rj_work') && index.collections.some((item) => item.codeNorm === 'RJ01234567'),
        '如果失败，先修 RJ 正则和 ASMR 分组规则。',
      ),
      pass(
        'music-album-detected',
        '能识别普通音乐 album / folder',
        'required',
        '至少存在 music_album 或 music_folder',
        `types=${Array.from(new Set(index.collections.map((item) => item.collectionType))).join(',')}`,
        hasCollectionType(index, 'music_album') || hasCollectionType(index, 'music_folder'),
        '如果失败，先修 music folder 的 collectionType 规则。',
      ),
      pass(
        'audio-video-image-covered',
        'A/V/I track 类型都能覆盖',
        'required',
        '存在 audio、video、image track',
        `audio=${report.summary.audioTrackCount}, video=${report.summary.videoTrackCount}, image=${report.summary.imageTrackCount}`,
        hasTrackKind(index, 'audio') && hasTrackKind(index, 'video') && hasTrackKind(index, 'image'),
        '如果失败，先补 fixture entries 或扩展名白名单。',
      ),
      pass(
        'subtitle-matching',
        '同名字幕匹配可用',
        'required',
        '至少 1 个 subtitle，并有 audio track 关联字幕',
        `subtitles=${index.subtitles.length}, audioMissingSubtitle=${report.summary.audioTrackMissingSubtitleCount}`,
        index.subtitles.length > 0 && index.tracks.some((track) => track.kind === 'audio' && track.subtitles.length > 0),
        '如果失败，先修同名字幕匹配，不读真实 LRC。',
      ),
      pass(
        'duplicate-rj-diagnostic',
        '重复 RJ 诊断可用',
        'recommended',
        'duplicateRjGroupCount >= 1',
        `duplicateRjGroupCount=${report.summary.duplicateRjGroupCount}`,
        report.summary.duplicateRjGroupCount >= 1,
        '如果失败，补重复 RJ fixture；真实扫描阶段必须只报告不合并。',
      ),
      pass(
        'duplicate-path-diagnostic',
        '重复 track relativePath 诊断可用',
        'recommended',
        'duplicateTrackPathGroupCount >= 1',
        `duplicateTrackPathGroupCount=${report.summary.duplicateTrackPathGroupCount}`,
        report.summary.duplicateTrackPathGroupCount >= 1,
        '如果失败，补重复 relativePath fixture；真实扫描用 rootId + relativePath 判重。',
      ),
      pass(
        'metadata-only-diagnostic',
        '空目录 / 只有封面诊断可用',
        'recommended',
        'collectionMetadataOnlyCount >= 1',
        `metadataOnly=${report.summary.collectionMetadataOnlyCount}`,
        report.summary.collectionMetadataOnlyCount >= 1,
        '如果失败，补空目录或只有封面 fixture。',
      ),
      pass(
        'image-only-diagnostic',
        '图片/CG-only collection 诊断可用',
        'recommended',
        'collectionImageOnlyCount >= 1',
        `imageOnly=${report.summary.collectionImageOnlyCount}`,
        report.summary.collectionImageOnlyCount >= 1,
        '如果失败，补 CG 图片目录 fixture；MVP 不内置图库阅读器。',
      ),
      pass(
        'safe-relative-path-only',
        'fixture scanner 只能生成相对路径',
        'required',
        '所有 track.source 只有 relativePath，没有 absolutePath/fileUrl/盘符路径',
        `unsafe=${index.tracks.filter((track) => !track.source.relativePath || track.source.absolutePath || track.source.fileUrl || track.source.relativePath?.match(/^[a-z]:/i)).length}`,
        allFixtureSafePaths(index),
        '如果失败，停止；fixture 层不允许出现真实路径或 file://。',
      ),
    ];

    const failed = cases.filter((item) => item.status === 'fail');
    const requiredFailed = failed.filter((item) => item.severity === 'required').length;
    const recommendedFailed = failed.filter((item) => item.severity === 'recommended').length;

    return {
      harnessVersion: 1,
      sourceKind: 'fixture',
      title: 'MVP-06 Fixture Scanner Test Matrix',
      summary: {
        total: cases.length,
        passed: cases.length - failed.length,
        failed: failed.length,
        requiredFailed,
        recommendedFailed,
        status: requiredFailed > 0 ? 'blocked' : recommendedFailed > 0 ? 'needs-review' : 'pass',
      },
      cases,
      matrixGroups: [
        {title: 'source / safety gates', caseIds: ['source-kind-fixture-only', 'safe-relative-path-only']},
        {title: 'library shape', caseIds: ['two-library-roots', 'rj-work-detected', 'music-album-detected']},
        {title: 'media recognition', caseIds: ['audio-video-image-covered', 'subtitle-matching']},
        {title: 'diagnostic edge cases', caseIds: ['duplicate-rj-diagnostic', 'duplicate-path-diagnostic', 'metadata-only-diagnostic', 'image-only-diagnostic']},
      ],
      gateRules: [
        'required case 失败时，不进入真实 scanner 设计实现。',
        'fixture harness 只接收 sourceKind="fixture" 的 LocalJsonIndex。',
        'fixture 层禁止 absolutePath、fileUrl、盘符路径和任何真实文件系统访问。',
        'duplicate RJ / duplicate path 只报告，不自动合并、不删除、不重命名。',
      ],
    };
  },
};
