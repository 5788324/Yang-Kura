export interface ParsedByteRange {
  start: number;
  end: number;
}

export type ByteRangeParseResult =
  | { kind: 'none' }
  | { kind: 'invalid' }
  | { kind: 'range'; range: ParsedByteRange };

const MIME_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  bmp: 'image/bmp',
  gif: 'image/gif',
};

export function mediaMimeType(extension: string): string {
  return MIME_BY_EXTENSION[String(extension || '').replace(/^\./, '').toLowerCase()] || 'application/octet-stream';
}

export function parseSingleByteRange(rangeHeader: string | null | undefined, sizeBytes: number): ByteRangeParseResult {
  if (!rangeHeader) return { kind: 'none' };
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) return { kind: 'invalid' };
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return { kind: 'invalid' };
  const [, startText, endText] = match;
  if (!startText && !endText) return { kind: 'invalid' };

  let start: number;
  let end: number;
  if (!startText) {
    const suffixLength = Number(endText);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return { kind: 'invalid' };
    start = Math.max(0, sizeBytes - suffixLength);
    end = sizeBytes - 1;
  } else {
    start = Number(startText);
    end = endText ? Number(endText) : sizeBytes - 1;
  }

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= sizeBytes || end < start) {
    return { kind: 'invalid' };
  }
  return {
    kind: 'range',
    range: {
      start,
      end: Math.min(end, sizeBytes - 1),
    },
  };
}
