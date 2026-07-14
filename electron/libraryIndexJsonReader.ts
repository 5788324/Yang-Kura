export type LibraryIndexJsonEncoding = 'utf8' | 'utf8-bom' | 'utf16le-bom' | 'utf16be-bom';

export interface ParsedLibraryIndexJson {
  value: unknown;
  text: string;
  encoding: LibraryIndexJsonEncoding;
}

export interface LibraryIndexReadFailureDescriptor {
  status: 'mvp24-library-index-read-parse-failed' | 'mvp24-library-index-read-error';
  message: string;
  code: string;
}

function decodeUtf16Be(source: Buffer): string {
  const body = source.subarray(2);
  const swapped = Buffer.allocUnsafe(body.length);
  for (let index = 0; index < body.length; index += 2) {
    swapped[index] = body[index + 1] ?? 0;
    swapped[index + 1] = body[index] ?? 0;
  }
  return swapped.toString('utf16le');
}

export function decodeLibraryIndexJsonBuffer(source: Uint8Array): {
  text: string;
  encoding: LibraryIndexJsonEncoding;
} {
  const buffer = Buffer.from(source);

  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return { text: buffer.subarray(3).toString('utf8'), encoding: 'utf8-bom' };
  }

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return { text: buffer.subarray(2).toString('utf16le'), encoding: 'utf16le-bom' };
  }

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    return { text: decodeUtf16Be(buffer), encoding: 'utf16be-bom' };
  }

  return { text: buffer.toString('utf8'), encoding: 'utf8' };
}

export function parseLibraryIndexJsonBuffer(source: Uint8Array): ParsedLibraryIndexJson {
  const decoded = decodeLibraryIndexJsonBuffer(source);
  return {
    value: JSON.parse(decoded.text) as unknown,
    text: decoded.text,
    encoding: decoded.encoding,
  };
}

function getSafeErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return 'UNKNOWN';
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.trim() ? code : 'UNKNOWN';
}

export function describeLibraryIndexReadError(error: unknown): LibraryIndexReadFailureDescriptor {
  if (error instanceof SyntaxError) {
    return {
      status: 'mvp24-library-index-read-parse-failed',
      code: 'INVALID_JSON',
      message: 'library-index.json 已找到，但 JSON 解析失败。请确认文件内容完整，并使用 UTF-8、UTF-8 BOM 或带 BOM 的 UTF-16 编码。',
    };
  }

  const code = getSafeErrorCode(error);
  return {
    status: 'mvp24-library-index-read-error',
    code,
    message: `library-index.json 读取失败：${code}`,
  };
}
