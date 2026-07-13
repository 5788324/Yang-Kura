export interface ParsedLyricLine {
  time: number;
  text: string;
}

export interface BilingualLyricLine extends ParsedLyricLine {
  original: string;
  translation: string;
}

const LRC_TIME_PATTERN = /\[(\d+):(\d+)(?:\.(\d+))?\]/;

const BILINGUAL_DELIMITERS = [' // ', ' || ', ' / ', ' | ', ' /', '/ ', ' |', '| '] as const;

export function parseLrcFractionalSeconds(fraction: string | undefined): number {
  if (!fraction) return 0;
  const parsed = Number.parseInt(fraction, 10);
  if (!Number.isFinite(parsed)) return 0;
  return parsed / Math.pow(10, fraction.length);
}

export function parseLrcLine(line: string): ParsedLyricLine {
  const match = line.match(LRC_TIME_PATTERN);
  if (!match) return { time: -1, text: line };

  const minutes = Number.parseInt(match[1], 10);
  const seconds = Number.parseInt(match[2], 10);
  const fraction = parseLrcFractionalSeconds(match[3]);

  return {
    time: minutes * 60 + seconds + fraction,
    text: line.replace(LRC_TIME_PATTERN, '').trim(),
  };
}

export function parseLyrics(lines: readonly string[] | null | undefined): ParsedLyricLine[] {
  if (!lines?.length) return [];
  return lines.map(parseLrcLine).filter((line) => line.time >= 0);
}

export function splitBilingualText(text: string): { original: string; translation: string } {
  for (const delimiter of BILINGUAL_DELIMITERS) {
    if (!text.includes(delimiter)) continue;

    const parts = text.split(delimiter);
    if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) continue;

    return {
      original: parts[0].trim(),
      translation: parts.slice(1).join(' / ').trim(),
    };
  }

  return { original: text, translation: '' };
}

export function createBilingualTimeline(lines: readonly ParsedLyricLine[]): BilingualLyricLine[] {
  return lines.map((line) => ({
    ...line,
    ...splitBilingualText(line.text),
  }));
}

export function findActiveLyricIndex(lines: readonly ParsedLyricLine[], progress: number): number {
  if (lines.length === 0) return -1;

  const safeProgress = Number.isFinite(progress) ? progress : 0;
  let activeIndex = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (safeProgress >= lines[index].time) activeIndex = index;
    else break;
  }

  return activeIndex;
}

export function getActiveLyricText(
  lines: readonly ParsedLyricLine[],
  progress: number,
  fallback: string,
): string {
  const activeIndex = findActiveLyricIndex(lines, progress);
  return activeIndex >= 0 ? lines[activeIndex].text : fallback;
}
