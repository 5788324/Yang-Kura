import {virtualLibraryPathParser, type ParsedVirtualLibraryPath, type VirtualLibraryPathParseInput} from './virtualLibraryPathParser';

export interface VirtualPathParserCase {
  id: string;
  input: VirtualLibraryPathParseInput;
  expected: Partial<Pick<ParsedVirtualLibraryPath, 'collectionType' | 'mediaKind' | 'isCoverCandidate' | 'isSubtitleCandidate' | 'rjIdNorm' | 'discNo' | 'trackNo' | 'specialRole' | 'subtitleLanguage'>>;
  description: string;
}

export interface VirtualPathParserCaseResult {
  id: string;
  status: 'pass' | 'fail';
  description: string;
  parsed: ParsedVirtualLibraryPath;
  failures: string[];
}

export const virtualPathParserCases: VirtualPathParserCase[] = [
  {
    id: 'asmr-rj-audio-track',
    input: {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/01_本編.mp3'},
    expected: {collectionType: 'rj_work', mediaKind: 'audio', rjIdNorm: 'RJ01234567', trackNo: 1, specialRole: 'main'},
    description: 'ASMR/RJ folder with numbered main audio track.',
  },
  {
    id: 'asmr-cover',
    input: {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/cover.jpg'},
    expected: {mediaKind: 'image', isCoverCandidate: true, specialRole: 'cover'},
    description: 'Cover image should not become a playable image track.',
  },
  {
    id: 'asmr-zh-lrc',
    input: {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/01_本編.zh.lrc'},
    expected: {mediaKind: 'subtitle', isSubtitleCandidate: true, subtitleLanguage: 'zh', specialRole: 'lyrics'},
    description: 'Chinese LRC subtitle with same audio stem.',
  },
  {
    id: 'asmr-bilingual-lrc',
    input: {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/02_耳かき.bilingual.lrc'},
    expected: {mediaKind: 'subtitle', isSubtitleCandidate: true, subtitleLanguage: 'bilingual'},
    description: 'Bilingual subtitle suffix detection.',
  },
  {
    id: 'multi-disc-bonus-track',
    input: {libraryType: 'asmr', relativePath: 'RJ04444444_多Disc特典/Disc 2/01_特典.wav'},
    expected: {collectionType: 'rj_work', mediaKind: 'audio', discNo: 2, trackNo: 1, specialRole: 'bonus'},
    description: 'Multi-disc bonus track detection.',
  },
  {
    id: 'video-asmr',
    input: {libraryType: 'asmr', relativePath: 'RJ06666666_视频ASMR/01_耳かき映像.mp4'},
    expected: {mediaKind: 'video', rjIdNorm: 'RJ06666666', trackNo: 1},
    description: 'Video ASMR should be track kind video, not audio.',
  },
  {
    id: 'cg-image-track',
    input: {libraryType: 'asmr', relativePath: 'RJ05555555_CG差分合集/cg/01.png'},
    expected: {mediaKind: 'image', isCoverCandidate: false, specialRole: 'cg', trackNo: 1},
    description: 'CG/gallery image should become an image track.',
  },
  {
    id: 'music-album-audio',
    input: {libraryType: 'music', relativePath: 'Aimer - Walpurgis/01 Walpurgis.flac'},
    expected: {collectionType: 'music_album', mediaKind: 'audio', trackNo: 1},
    description: 'Artist - Album folder should become music_album.',
  },
  {
    id: 'music-folder-single',
    input: {libraryType: 'music', relativePath: 'Singles 中文 空格/夜に駆ける.mp3'},
    expected: {collectionType: 'music_folder', mediaKind: 'audio'},
    description: 'Plain music folder without artist-album delimiter.',
  },
  {
    id: 'directory-marker',
    input: {libraryType: 'asmr', relativePath: 'RJ08888888_空目录/.keep'},
    expected: {mediaKind: 'directory-marker', specialRole: 'unknown'},
    description: 'Directory marker is metadata-only and not playable.',
  },
  {
    id: 'windows-slash-normalization',
    input: {libraryType: 'asmr', relativePath: 'RJ12345678_反斜杠\\Disc 1\\01_intro.ogg'},
    expected: {collectionType: 'rj_work', mediaKind: 'audio', rjIdNorm: 'RJ12345678', discNo: 1, trackNo: 1},
    description: 'Backslash input should normalize to virtual forward slash path.',
  },
];

export const virtualPathParserCaseRunner = {
  run(): VirtualPathParserCaseResult[] {
    return virtualPathParserCases.map((testCase) => {
      const parsed = virtualLibraryPathParser.parse(testCase.input);
      const failures = Object.entries(testCase.expected).flatMap(([key, expectedValue]) => {
        const actual = parsed[key as keyof ParsedVirtualLibraryPath];
        return actual === expectedValue ? [] : [`${key}: expected ${String(expectedValue)} but got ${String(actual)}`];
      });
      return {
        id: testCase.id,
        status: failures.length === 0 ? 'pass' : 'fail',
        description: testCase.description,
        parsed,
        failures,
      };
    });
  },
};
