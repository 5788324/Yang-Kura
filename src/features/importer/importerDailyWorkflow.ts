export type ImportExecutionMode = 'copy' | 'move';

export const IMPORT_COPY_LIMIT = 200;
export const IMPORT_MOVE_LIMIT = 20;

const UNSAFE_SEGMENT = /(^|\/)\.\.(\/|$)/;
const WINDOWS_RESERVED = /[<>:"|?*\u0000-\u001f]/g;

export function normalizeImportRelativePath(value: string): string {
  const normalized = value.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  if (!normalized || /^[a-zA-Z]:\//.test(normalized) || UNSAFE_SEGMENT.test(normalized)) {
    throw new Error('导入路径不是安全的相对路径。');
  }
  return normalized;
}

export function sanitizeImportFolderName(value: string): string {
  const compact = value
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(WINDOWS_RESERVED, '_').replace(/[. ]+$/g, '').trim())
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .join('/');
  return compact.slice(0, 180);
}

export function buildImportTargetRelativePath(folderName: string, sourceRelativePath: string): string {
  const source = normalizeImportRelativePath(sourceRelativePath);
  const prefix = sanitizeImportFolderName(folderName);
  return prefix ? `${prefix}/${source}` : source;
}

export function isImportableScannerEntry(entry: YangKuraScannerDryRunDiscoveredEntry): boolean {
  if (entry.entryKind === 'directory' || entry.entryKind === 'unsupported') return false;
  return entry.plannedAction !== 'ignore';
}

export function getImportExecutionLimit(mode: ImportExecutionMode): number {
  return mode === 'move' ? IMPORT_MOVE_LIMIT : IMPORT_COPY_LIMIT;
}

export function createImportOperationPlanId(): string {
  const suffix = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `u41b-daily-import-${suffix}`;
}
