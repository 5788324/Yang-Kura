import type {LibraryCollectionType, LibraryTrackKind, SubtitleSource} from '../types';

export type FixtureLibraryKind = 'asmr' | 'music';
export type VirtualPathMediaKind = LibraryTrackKind | 'subtitle' | 'directory-marker';
export type VirtualPathSpecialRole = 'main' | 'bonus' | 'disc' | 'cg' | 'cover' | 'lyrics' | 'unknown';

export interface VirtualLibraryPathParseInput {
  relativePath: string;
  libraryType: FixtureLibraryKind;
}

export interface ParsedVirtualLibraryPath {
  originalPath: string;
  normalizedPath: string;
  segments: string[];
  collectionFolder: string;
  parentPath: string;
  fileName: string;
  baseName: string;
  extension: string;
  libraryType: FixtureLibraryKind;
  collectionType: LibraryCollectionType;
  mediaKind: VirtualPathMediaKind;
  isTrackCandidate: boolean;
  isCoverCandidate: boolean;
  isSubtitleCandidate: boolean;
  isDirectoryMarker: boolean;
  rjIdRaw?: string;
  rjIdNorm?: string;
  discNo?: number;
  trackNo?: number;
  specialRole: VirtualPathSpecialRole;
  subtitleLanguage?: SubtitleSource['language'];
  subtitleFormat?: SubtitleSource['format'];
  subtitleTargetStem?: string;
  warnings: string[];
}

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'ape']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'avi', 'mov']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']);
const SUBTITLE_EXTENSIONS = new Set(['lrc', 'srt', 'vtt', 'ass', 'txt']);
const TEXT_EXTENSIONS = new Set(['md', 'nfo', 'cue', 'json']);
const ARCHIVE_EXTENSIONS = new Set(['zip', '7z', 'rar']);
const COVER_BASENAMES = new Set(['cover', 'folder', 'front', 'jacket', 'scan', 'package']);
const DISC_PATTERN = /(?:^|[\s_-])(?:disc|disk|cd|vol|volume|ディスク)\s*0*([0-9]{1,2})(?:$|[\s_-])/i;

const normalizeVirtualPath = (value: string): string => value.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/').trim();
const partsOf = (relativePath: string): string[] => normalizeVirtualPath(relativePath).split('/').filter(Boolean);
const fileNameOf = (segments: string[], fallback: string): string => segments[segments.length - 1] || fallback;
const extensionOf = (fileName: string): string => {
  const match = fileName.match(/\.([^.\/]+)$/);
  return match?.[1]?.toLowerCase() || '';
};
const baseNameOf = (fileName: string): string => fileName.replace(/\.[^.]+$/, '');
const detectRjId = (value: string): string | undefined => value.match(/RJ\d{5,8}/i)?.[0];
const normalizeRjId = (value: string): string => value.toUpperCase();
const detectTrackNo = (baseName: string): number | undefined => {
  const match = baseName.match(/^\s*(?:track\s*)?0*([0-9]{1,3})(?:[\s._-]|$)/i);
  return match ? Number(match[1]) : undefined;
};
const detectDiscNo = (segments: string[]): number | undefined => {
  for (const segment of segments.slice(1, -1)) {
    const normalized = ` ${segment} `;
    const match = normalized.match(DISC_PATTERN);
    if (match) return Number(match[1]);
  }
  return undefined;
};
const detectSpecialRole = (segments: string[], baseName: string, isCoverCandidate: boolean, isSubtitleCandidate: boolean): VirtualPathSpecialRole => {
  const joined = segments.join('/').toLowerCase();
  if (isCoverCandidate) return 'cover';
  if (isSubtitleCandidate) return 'lyrics';
  if (joined.includes('特典') || joined.includes('bonus') || joined.includes('extra')) return 'bonus';
  if (joined.includes('/cg/') || joined.includes('cg差分') || joined.includes('gallery')) return 'cg';
  if (detectDiscNo(segments)) return 'disc';
  if (/本編|main/i.test(baseName)) return 'main';
  return 'unknown';
};
const subtitleLanguageOf = (baseName: string): SubtitleSource['language'] => {
  const lower = baseName.toLowerCase();
  if (/(^|[._-])(bilingual|bi|dual|双语)($|[._-])/.test(lower)) return 'bilingual';
  if (/(^|[._-])(zh|chs|cht|cn|中文|汉化)($|[._-])/.test(lower)) return 'zh';
  if (/(^|[._-])(ja|jp|jpn|日文)($|[._-])/.test(lower)) return 'ja';
  return 'unknown';
};
const stripSubtitleLanguageSuffix = (baseName: string): string => baseName.replace(/([._-])(bilingual|bi|dual|zh|chs|cht|cn|ja|jp|jpn)$/i, '');
const collectionTypeFor = (libraryType: FixtureLibraryKind, collectionFolder: string): LibraryCollectionType => {
  if (libraryType === 'asmr') return detectRjId(collectionFolder) ? 'rj_work' : 'music_folder';
  return collectionFolder.includes(' - ') ? 'music_album' : 'music_folder';
};
const mediaKindFor = (extension: string, isCoverCandidate: boolean, isDirectoryMarker: boolean): VirtualPathMediaKind => {
  if (isDirectoryMarker) return 'directory-marker';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (SUBTITLE_EXTENSIONS.has(extension)) return 'subtitle';
  if (IMAGE_EXTENSIONS.has(extension)) return isCoverCandidate ? 'image' : 'image';
  if (TEXT_EXTENSIONS.has(extension)) return 'text';
  if (ARCHIVE_EXTENSIONS.has(extension)) return 'archive';
  return 'other';
};

export const virtualLibraryPathParser = {
  parse(input: VirtualLibraryPathParseInput): ParsedVirtualLibraryPath {
    const normalizedPath = normalizeVirtualPath(input.relativePath);
    const segments = partsOf(normalizedPath);
    const warnings: string[] = [];
    const collectionFolder = segments[0] || 'root';
    const fileName = fileNameOf(segments, normalizedPath);
    const parentPath = segments.slice(0, -1).join('/');
    const extension = extensionOf(fileName);
    const baseName = baseNameOf(fileName);
    const isDirectoryMarker = fileName === '.keep' || extension === '';
    const coverBase = baseName.toLowerCase();
    const isCoverCandidate = IMAGE_EXTENSIONS.has(extension) && COVER_BASENAMES.has(coverBase);
    const isSubtitleCandidate = SUBTITLE_EXTENSIONS.has(extension);
    const mediaKind = mediaKindFor(extension, isCoverCandidate, isDirectoryMarker);
    const rjIdRaw = detectRjId(collectionFolder) || detectRjId(normalizedPath);
    const rjIdNorm = rjIdRaw ? normalizeRjId(rjIdRaw) : undefined;
    const subtitleLanguage = isSubtitleCandidate ? subtitleLanguageOf(baseName) : undefined;
    const subtitleFormat = isSubtitleCandidate ? extension as SubtitleSource['format'] : undefined;
    const subtitleTargetStem = isSubtitleCandidate ? `${parentPath}/${stripSubtitleLanguageSuffix(baseName)}`.replace(/^\//, '').toLowerCase() : undefined;
    const isTrackCandidate = mediaKind === 'audio' || mediaKind === 'video' || (mediaKind === 'image' && !isCoverCandidate);

    if (input.libraryType === 'asmr' && !rjIdNorm) warnings.push('ASMR fixture path has no RJ code.');
    if (segments.length < 2 && !isDirectoryMarker) warnings.push('Path is not grouped under a collection folder.');
    if (isDirectoryMarker) warnings.push('Directory marker is not a playable track.');

    return {
      originalPath: input.relativePath,
      normalizedPath,
      segments,
      collectionFolder,
      parentPath,
      fileName,
      baseName,
      extension,
      libraryType: input.libraryType,
      collectionType: collectionTypeFor(input.libraryType, collectionFolder),
      mediaKind,
      isTrackCandidate,
      isCoverCandidate,
      isSubtitleCandidate,
      isDirectoryMarker,
      rjIdRaw,
      rjIdNorm,
      discNo: detectDiscNo(segments),
      trackNo: detectTrackNo(baseName),
      specialRole: detectSpecialRole(segments, baseName, isCoverCandidate, isSubtitleCandidate),
      subtitleLanguage,
      subtitleFormat,
      subtitleTargetStem,
      warnings,
    };
  },
};
