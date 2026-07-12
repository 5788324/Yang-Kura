import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export type BackupValidationStatus = 'valid' | 'invalid-json' | 'invalid-index' | 'unsafe-content' | 'unreadable';

export interface LibraryIndexBackupRecord {
  relativePath: string;
  fileName: string;
  createdAt: string;
  modifiedAt: string;
  sizeBytes: number;
  sha256?: string;
  validationStatus: BackupValidationStatus;
  valid: boolean;
  generation: 'mvp23' | 'mvp100' | 'mvp128' | 'mvp129-restore' | 'other';
  summary?: Record<string, number>;
  message: string;
}

export interface BackupRetentionPreview {
  previewVersion: 'mvp129-backup-retention-preview-v1';
  generatedAt: string;
  deletePerformed: false;
  maxAgeDays: number;
  keepNewest: number;
  totalBackupCount: number;
  candidateCount: number;
  candidateBytes: number;
  retainedCount: number;
  candidates: Array<Pick<LibraryIndexBackupRecord, 'relativePath' | 'fileName' | 'modifiedAt' | 'sizeBytes' | 'sha256' | 'validationStatus'>>;
  safetyNotes: string[];
}

export interface MaintenanceHistoryEntry {
  historyVersion: 'mvp129-index-maintenance-history-v1';
  id: string;
  rootFingerprint: string;
  displayName: string;
  libraryType: string;
  action: 'controlled-cleanup' | 'backup-restore';
  status: 'complete' | 'failed';
  occurredAt: string;
  sourceSha256?: string;
  resultSha256?: string;
  backupRelativePath?: string;
  restoredBackupRelativePath?: string;
  summary?: Record<string, number>;
  message: string;
  mediaFilesDeleted: false;
  absolutePathsStored: false;
}

export type IndexValidator = (value: unknown) => { ok: true; summary?: Record<string, number> } | { ok: false; message: string };

const backupPattern = /^library-index\.backup(?:\.[A-Za-z0-9-]+|-[A-Za-z0-9._-]+)*\.json$/;

export function isSafeLibraryIndexBackupRelativePath(value: string): boolean {
  return Boolean(value) && path.basename(value) === value && backupPattern.test(value) && !value.includes('..') && !value.includes('file://');
}

function backupGeneration(fileName: string): LibraryIndexBackupRecord['generation'] {
  if (fileName.includes('before-mvp129-restore')) return 'mvp129-restore';
  if (fileName.includes('before-mvp128')) return 'mvp128';
  if (fileName.includes('before-mvp100')) return 'mvp100';
  if (/^library-index\.backup-/.test(fileName)) return 'mvp23';
  return 'other';
}

export async function inspectLibraryIndexBackups(
  rootAbsolutePath: string,
  validateIndex: IndexValidator,
  maxEntries = 100,
): Promise<LibraryIndexBackupRecord[]> {
  const entries = await fs.readdir(rootAbsolutePath, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile() && isSafeLibraryIndexBackupRelativePath(entry.name))
    .map((entry) => entry.name)
    .sort();
  const records: LibraryIndexBackupRecord[] = [];
  for (const fileName of names.slice(-Math.max(1, Math.min(500, maxEntries)))) {
    const filePath = path.join(rootAbsolutePath, fileName);
    try {
      const stat = await fs.stat(filePath);
      const text = await fs.readFile(filePath, 'utf8');
      const base = {
        relativePath: fileName,
        fileName,
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
        sizeBytes: stat.size,
        sha256: crypto.createHash('sha256').update(text).digest('hex'),
        generation: backupGeneration(fileName),
      } as const;
      if (text.includes('file://')) {
        records.push({ ...base, validationStatus: 'unsafe-content', valid: false, message: '备份包含不安全的 file:// 内容。' });
        continue;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        records.push({ ...base, validationStatus: 'invalid-json', valid: false, message: '备份不是有效 JSON。' });
        continue;
      }
      const validation = validateIndex(parsed);
      if (validation.ok === false) {
        records.push({ ...base, validationStatus: 'invalid-index', valid: false, message: validation.message });
        continue;
      }
      records.push({ ...base, validationStatus: 'valid', valid: true, summary: validation.summary, message: '备份可用于手动恢复。' });
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? 'UNKNOWN') : 'UNKNOWN';
      records.push({
        relativePath: fileName,
        fileName,
        createdAt: '',
        modifiedAt: '',
        sizeBytes: 0,
        validationStatus: 'unreadable',
        valid: false,
        generation: backupGeneration(fileName),
        message: `备份无法读取：${code}`,
      });
    }
  }
  return records.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export function buildLibraryIndexBackupRetentionPreview(
  backups: LibraryIndexBackupRecord[],
  options: { maxAgeDays?: number; keepNewest?: number; nowMs?: number } = {},
): BackupRetentionPreview {
  const maxAgeDays = Math.max(1, Math.min(3650, Math.trunc(options.maxAgeDays ?? 90)));
  const keepNewest = Math.max(1, Math.min(100, Math.trunc(options.keepNewest ?? 5)));
  const nowMs = options.nowMs ?? Date.now();
  const sorted = [...backups].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  const keepSet = new Set(sorted.slice(0, keepNewest).map((item) => item.relativePath));
  const candidates = sorted.filter((item) => {
    if (keepSet.has(item.relativePath) || !item.modifiedAt) return false;
    const modifiedMs = Date.parse(item.modifiedAt);
    return Number.isFinite(modifiedMs) && nowMs - modifiedMs >= maxAgeDays * 86_400_000;
  });
  return {
    previewVersion: 'mvp129-backup-retention-preview-v1',
    generatedAt: new Date(nowMs).toISOString(),
    deletePerformed: false,
    maxAgeDays,
    keepNewest,
    totalBackupCount: sorted.length,
    candidateCount: candidates.length,
    candidateBytes: candidates.reduce((sum, item) => sum + item.sizeBytes, 0),
    retainedCount: sorted.length - candidates.length,
    candidates: candidates.map(({ relativePath, fileName, modifiedAt, sizeBytes, sha256, validationStatus }) => ({ relativePath, fileName, modifiedAt, sizeBytes, sha256, validationStatus })),
    safetyNotes: ['preview-only', 'backup files were not deleted', 'media files were not modified', 'absolutePath and file:// are not returned'],
  };
}

export async function restoreLibraryIndexFromBackup(options: {
  rootAbsolutePath: string;
  backupRelativePath: string;
  expectedBackupSha256: string;
  validateIndex: IndexValidator;
  restoredAt?: string;
}): Promise<{
  restoredAt: string;
  currentBackupRelativePath?: string;
  restoredBackupRelativePath: string;
  sourceSha256?: string;
  resultSha256: string;
  bytesWritten: number;
  summary?: Record<string, number>;
  rollbackRestored: boolean;
}> {
  const { rootAbsolutePath, backupRelativePath, expectedBackupSha256, validateIndex } = options;
  if (!isSafeLibraryIndexBackupRelativePath(backupRelativePath)) throw new Error('INVALID_BACKUP_NAME');
  const restoredAt = options.restoredAt ?? new Date().toISOString();
  const backupPath = path.join(rootAbsolutePath, backupRelativePath);
  const backupText = await fs.readFile(backupPath, 'utf8');
  const backupSha = crypto.createHash('sha256').update(backupText).digest('hex');
  if (!expectedBackupSha256 || backupSha !== expectedBackupSha256) throw new Error('BACKUP_SHA_MISMATCH');
  if (backupText.includes('file://')) throw new Error('UNSAFE_BACKUP_CONTENT');
  const parsed = JSON.parse(backupText) as unknown;
  const validation = validateIndex(parsed);
  if (validation.ok === false) throw new Error(`INVALID_BACKUP_INDEX:${validation.message}`);

  const indexPath = path.join(rootAbsolutePath, 'library-index.json');
  let currentText: string | undefined;
  let currentBackupRelativePath: string | undefined;
  try {
    currentText = await fs.readFile(indexPath, 'utf8');
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
    if (code !== 'ENOENT') throw error;
  }
  if (currentText !== undefined) {
    const safeTimestamp = restoredAt.replace(/[:.]/g, '-');
    currentBackupRelativePath = `library-index.backup.before-mvp129-restore-${safeTimestamp}.json`;
    await fs.writeFile(path.join(rootAbsolutePath, currentBackupRelativePath), currentText, { encoding: 'utf8', flag: 'wx' });
  }

  let rollbackRestored = false;
  try {
    await fs.writeFile(indexPath, backupText, 'utf8');
    const readBack = await fs.readFile(indexPath, 'utf8');
    const resultSha256 = crypto.createHash('sha256').update(readBack).digest('hex');
    if (resultSha256 !== backupSha) throw new Error('RESTORE_READBACK_SHA_MISMATCH');
    const readBackParsed = JSON.parse(readBack) as unknown;
    const readBackValidation = validateIndex(readBackParsed);
    if (readBackValidation.ok === false || readBack.includes('file://')) throw new Error('RESTORE_READBACK_INVALID');
    return {
      restoredAt,
      currentBackupRelativePath,
      restoredBackupRelativePath: backupRelativePath,
      sourceSha256: currentText ? crypto.createHash('sha256').update(currentText).digest('hex') : undefined,
      resultSha256,
      bytesWritten: Buffer.byteLength(readBack, 'utf8'),
      summary: readBackValidation.summary,
      rollbackRestored,
    };
  } catch (error) {
    if (currentText !== undefined) {
      try {
        await fs.writeFile(indexPath, currentText, 'utf8');
        rollbackRestored = true;
      } catch {
        rollbackRestored = false;
      }
    }
    const wrapped = new Error(error instanceof Error ? error.message : String(error)) as Error & { rollbackRestored?: boolean; currentBackupRelativePath?: string };
    wrapped.rollbackRestored = rollbackRestored;
    wrapped.currentBackupRelativePath = currentBackupRelativePath;
    throw wrapped;
  }
}

export async function appendMaintenanceHistory(historyFilePath: string, entry: MaintenanceHistoryEntry): Promise<void> {
  const line = `${JSON.stringify(entry)}\n`;
  await fs.mkdir(path.dirname(historyFilePath), { recursive: true });
  await fs.appendFile(historyFilePath, line, 'utf8');
}

export async function readMaintenanceHistory(
  historyFilePath: string,
  rootFingerprint: string,
  maxEntries = 30,
): Promise<Omit<MaintenanceHistoryEntry, 'rootFingerprint'>[]> {
  let text = '';
  try {
    text = await fs.readFile(historyFilePath, 'utf8');
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
    if (code === 'ENOENT') return [];
    throw error;
  }
  const entries: MaintenanceHistoryEntry[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const value = JSON.parse(line) as MaintenanceHistoryEntry;
      if (value?.historyVersion === 'mvp129-index-maintenance-history-v1' && value.rootFingerprint === rootFingerprint) entries.push(value);
    } catch {
      // Ignore an isolated damaged history line. The index and backup files are independent of this log.
    }
  }
  return entries
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, Math.max(1, Math.min(200, maxEntries)))
    .map(({ rootFingerprint: _hidden, ...entry }) => entry);
}
