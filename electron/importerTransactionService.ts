import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

export const IMPORT_TRANSACTION_VERSION = 'u31-import-transaction-v1' as const;

export interface ImportTransactionItem {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
}

export interface ImportTransactionFailure {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: string;
  message: string;
}

export interface ImportTransactionSkip {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: string;
}

export interface ImportCopyCommittedFile {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  sizeBytes: number;
}

export interface ImportMoveCommittedFile extends ImportCopyCommittedFile {
  moveMethod: 'rename' | 'copy-verify-unlink';
}

export interface ImportRolledBackFile {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  rollbackMethod: 'unlink-copy-target' | 'rename-back' | 'copy-verify-unlink-back' | 'already-absent';
}

export interface ImportRollbackFailure {
  id: string;
  sourceRelativePath: string;
  targetRelativePath: string;
  reasonCode: string;
  message: string;
}

export interface CopyOnlyTransactionResult {
  transactionVersion: typeof IMPORT_TRANSACTION_VERSION;
  ok: boolean;
  committedFiles: ImportCopyCommittedFile[];
  attemptedFiles: ImportCopyCommittedFile[];
  skippedList: ImportTransactionSkip[];
  failureList: ImportTransactionFailure[];
  createdDirectoryRelativePaths: string[];
  removedDirectoryRelativePaths: string[];
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackFiles: ImportRolledBackFile[];
  rollbackFailureList: ImportRollbackFailure[];
}

export interface MoveOnlyTransactionResult {
  transactionVersion: typeof IMPORT_TRANSACTION_VERSION;
  ok: boolean;
  committedFiles: ImportMoveCommittedFile[];
  attemptedFiles: ImportMoveCommittedFile[];
  skippedList: ImportTransactionSkip[];
  failureList: ImportTransactionFailure[];
  createdDirectoryRelativePaths: string[];
  removedDirectoryRelativePaths: string[];
  failureStopTriggered: boolean;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackFiles: ImportRolledBackFile[];
  rollbackFailureList: ImportRollbackFailure[];
}

function safeErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as NodeJS.ErrnoException).code ?? 'UNKNOWN');
    return code.replace(/[^A-Z0-9_-]/gi, '').slice(0, 48) || 'UNKNOWN';
  }
  return 'UNKNOWN';
}

function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/{2,}/g, '/');
}

function resolveWithinRoot(rootAbsolutePath: string, relativePath: string): { ok: true; absolutePath: string; relativePath: string } | { ok: false; code: string; message: string } {
  if (typeof relativePath !== 'string' || relativePath.trim().length === 0 || relativePath.includes('\0')) {
    return { ok: false, code: 'invalid-relative-path', message: '相对路径为空或包含非法字符。' };
  }
  const normalized = normalizeRelativePath(relativePath.trim());
  if (path.isAbsolute(relativePath) || /^[a-zA-Z]:[\\/]/.test(relativePath) || normalized.split('/').some((segment) => segment === '..')) {
    return { ok: false, code: 'unsafe-relative-path', message: '相对路径试图越过授权根目录。' };
  }
  const root = path.resolve(rootAbsolutePath);
  const absolutePath = path.resolve(root, ...normalized.split('/').filter(Boolean));
  if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
    return { ok: false, code: 'path-escape-blocked', message: '相对路径解析结果越过授权根目录。' };
  }
  return { ok: true, absolutePath, relativePath: normalized };
}

async function statOrNull(absolutePath: string) {
  try {
    return await fs.stat(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw error;
  }
}

async function ensureTrackedParentDirectories(rootAbsolutePath: string, targetAbsolutePath: string): Promise<string[]> {
  const root = path.resolve(rootAbsolutePath);
  const parent = path.dirname(targetAbsolutePath);
  const relativeParent = path.relative(root, parent);
  if (!relativeParent || relativeParent === '.') return [];
  if (relativeParent.startsWith('..') || path.isAbsolute(relativeParent)) throw Object.assign(new Error('target parent escaped root'), { code: 'PATH_ESCAPE' });

  const created: string[] = [];
  let current = root;
  const segments = relativeParent.split(path.sep).filter(Boolean);
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    const currentRelative = segments.slice(0, index + 1).join('/');
    const currentStat = await statOrNull(current);
    if (currentStat) {
      if (!currentStat.isDirectory()) throw Object.assign(new Error('target parent is not directory'), { code: 'ENOTDIR' });
      continue;
    }
    try {
      await fs.mkdir(current);
      created.push(currentRelative);
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') throw error;
      const racedStat = await fs.stat(current);
      if (!racedStat.isDirectory()) throw Object.assign(new Error('target parent race is not directory'), { code: 'ENOTDIR' });
    }
  }
  return created;
}

async function removeTrackedEmptyDirectories(rootAbsolutePath: string, createdDirectoryRelativePaths: string[]): Promise<string[]> {
  const removed: string[] = [];
  const ordered = Array.from(new Set(createdDirectoryRelativePaths))
    .sort((left, right) => right.split('/').length - left.split('/').length || right.length - left.length);
  for (const relativePath of ordered) {
    const resolved = resolveWithinRoot(rootAbsolutePath, relativePath);
    if (!resolved.ok) continue;
    try {
      await fs.rmdir(resolved.absolutePath);
      removed.push(resolved.relativePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT' || code === 'ENOTEMPTY' || code === 'EEXIST') continue;
    }
  }
  return removed;
}

function finalCommittedFiles<T extends { targetRelativePath: string }>(attempted: T[], rolledBack: ImportRolledBackFile[]): T[] {
  const rolledBackTargets = new Set(rolledBack.map((item) => item.targetRelativePath));
  return attempted.filter((item) => !rolledBackTargets.has(item.targetRelativePath));
}

export async function executeCopyOnlyTransaction(input: {
  sourceRootAbsolutePath: string;
  targetRootAbsolutePath: string;
  items: ImportTransactionItem[];
}): Promise<CopyOnlyTransactionResult> {
  const attemptedFiles: ImportCopyCommittedFile[] = [];
  const skippedList: ImportTransactionSkip[] = [];
  const failureList: ImportTransactionFailure[] = [];
  const createdDirectories = new Set<string>();

  for (const item of input.items) {
    const source = resolveWithinRoot(input.sourceRootAbsolutePath, item.sourceRelativePath);
    const target = resolveWithinRoot(input.targetRootAbsolutePath, item.targetRelativePath);
    if (source.ok === false) {
      failureList.push({ ...item, reasonCode: source.code, message: source.message });
      continue;
    }
    if (target.ok === false) {
      failureList.push({ ...item, reasonCode: target.code, message: target.message });
      continue;
    }

    let sourceStat;
    try {
      sourceStat = await fs.stat(source.absolutePath);
    } catch (error) {
      failureList.push({ ...item, reasonCode: 'source-missing', message: `source stat failed: ${safeErrorCode(error)}` });
      continue;
    }
    if (!sourceStat.isFile()) {
      failureList.push({ ...item, reasonCode: 'source-not-file', message: '源路径不是普通文件。' });
      continue;
    }

    try {
      const targetStat = await statOrNull(target.absolutePath);
      if (targetStat) {
        skippedList.push({ ...item, reasonCode: 'target-exists-overwrite-disabled' });
        continue;
      }
      const created = await ensureTrackedParentDirectories(input.targetRootAbsolutePath, target.absolutePath);
      created.forEach((relativePath) => createdDirectories.add(relativePath));
      await fs.copyFile(source.absolutePath, target.absolutePath, fsSync.constants.COPYFILE_EXCL);
      attemptedFiles.push({ ...item, sizeBytes: sourceStat.size });
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'EEXIST') skippedList.push({ ...item, reasonCode: 'target-exists-race-overwrite-disabled' });
      else failureList.push({ ...item, reasonCode: 'copy-failed', message: `copy failed: ${safeErrorCode(error)}` });
    }
  }

  const rollbackAttempted = failureList.length > 0 && attemptedFiles.length > 0;
  const rolledBackFiles: ImportRolledBackFile[] = [];
  const rollbackFailureList: ImportRollbackFailure[] = [];
  if (rollbackAttempted) {
    for (const file of [...attemptedFiles].reverse()) {
      const target = resolveWithinRoot(input.targetRootAbsolutePath, file.targetRelativePath);
      if (target.ok === false) {
        rollbackFailureList.push({ ...file, reasonCode: target.code, message: target.message });
        continue;
      }
      try {
        await fs.unlink(target.absolutePath);
        rolledBackFiles.push({ ...file, rollbackMethod: 'unlink-copy-target' });
      } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') rolledBackFiles.push({ ...file, rollbackMethod: 'already-absent' });
        else rollbackFailureList.push({ ...file, reasonCode: 'copy-rollback-unlink-failed', message: `rollback unlink failed: ${safeErrorCode(error)}` });
      }
    }
  }
  const removedDirectoryRelativePaths = rollbackAttempted
    ? await removeTrackedEmptyDirectories(input.targetRootAbsolutePath, Array.from(createdDirectories))
    : [];
  const committedFiles = finalCommittedFiles(attemptedFiles, rolledBackFiles);
  const rollbackSucceeded = !rollbackAttempted || (rollbackFailureList.length === 0 && committedFiles.length === 0);

  return {
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    ok: failureList.length === 0,
    committedFiles,
    attemptedFiles,
    skippedList,
    failureList,
    createdDirectoryRelativePaths: Array.from(createdDirectories).filter((item) => !removedDirectoryRelativePaths.includes(item)),
    removedDirectoryRelativePaths,
    rollbackAttempted,
    rollbackSucceeded,
    rolledBackFiles,
    rollbackFailureList,
  };
}

export async function executeMoveOnlyTransaction(input: {
  sourceRootAbsolutePath: string;
  targetRootAbsolutePath: string;
  items: ImportTransactionItem[];
}): Promise<MoveOnlyTransactionResult> {
  const attemptedFiles: ImportMoveCommittedFile[] = [];
  const skippedList: ImportTransactionSkip[] = [];
  const failureList: ImportTransactionFailure[] = [];
  const createdDirectories = new Set<string>();
  let failureStopTriggered = false;

  for (const item of input.items) {
    if (failureStopTriggered) {
      skippedList.push({ ...item, reasonCode: 'remaining-after-failure-stop' });
      continue;
    }
    const source = resolveWithinRoot(input.sourceRootAbsolutePath, item.sourceRelativePath);
    const target = resolveWithinRoot(input.targetRootAbsolutePath, item.targetRelativePath);
    const failAndStop = (reasonCode: string, message: string) => {
      failureList.push({ ...item, reasonCode, message });
      failureStopTriggered = true;
    };
    if (source.ok === false) {
      failAndStop(source.code, source.message);
      continue;
    }
    if (target.ok === false) {
      failAndStop(target.code, target.message);
      continue;
    }

    let sourceStat;
    try {
      sourceStat = await fs.stat(source.absolutePath);
    } catch (error) {
      failAndStop('source-missing', `source stat failed: ${safeErrorCode(error)}`);
      continue;
    }
    if (!sourceStat.isFile()) {
      failAndStop('source-not-file', '源路径不是普通文件。');
      continue;
    }

    try {
      const targetStat = await statOrNull(target.absolutePath);
      if (targetStat) {
        skippedList.push({ ...item, reasonCode: 'target-exists-overwrite-disabled' });
        continue;
      }
      const created = await ensureTrackedParentDirectories(input.targetRootAbsolutePath, target.absolutePath);
      created.forEach((relativePath) => createdDirectories.add(relativePath));
      try {
        await fs.rename(source.absolutePath, target.absolutePath);
        attemptedFiles.push({ ...item, sizeBytes: sourceStat.size, moveMethod: 'rename' });
      } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code !== 'EXDEV') throw error;
        let copiedTarget = false;
        try {
          await fs.copyFile(source.absolutePath, target.absolutePath, fsSync.constants.COPYFILE_EXCL);
          copiedTarget = true;
          const targetStatAfterCopy = await fs.stat(target.absolutePath);
          if (!targetStatAfterCopy.isFile() || targetStatAfterCopy.size !== sourceStat.size) {
            throw Object.assign(new Error('copy verification failed'), { code: 'VERIFY_FAILED' });
          }
          await fs.unlink(source.absolutePath);
          attemptedFiles.push({ ...item, sizeBytes: sourceStat.size, moveMethod: 'copy-verify-unlink' });
        } catch (fallbackError) {
          if (copiedTarget) {
            try { await fs.unlink(target.absolutePath); } catch {}
          }
          throw fallbackError;
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'EEXIST') skippedList.push({ ...item, reasonCode: 'target-exists-overwrite-disabled' });
      else failAndStop('move-failed', `move failed: ${safeErrorCode(error)}`);
    }
  }

  const rollbackAttempted = failureList.length > 0 && attemptedFiles.length > 0;
  const rolledBackFiles: ImportRolledBackFile[] = [];
  const rollbackFailureList: ImportRollbackFailure[] = [];
  if (rollbackAttempted) {
    for (const file of [...attemptedFiles].reverse()) {
      const source = resolveWithinRoot(input.sourceRootAbsolutePath, file.sourceRelativePath);
      const target = resolveWithinRoot(input.targetRootAbsolutePath, file.targetRelativePath);
      if (source.ok === false || target.ok === false) {
        rollbackFailureList.push({ ...file, reasonCode: source.ok === false ? source.code : (target as { ok: false; code: string }).code, message: source.ok === false ? source.message : (target as { ok: false; message: string }).message });
        continue;
      }
      try {
        if (await statOrNull(source.absolutePath)) {
          rollbackFailureList.push({ ...file, reasonCode: 'move-rollback-source-exists', message: '回滚源路径已存在，未覆盖。' });
          continue;
        }
        await ensureTrackedParentDirectories(input.sourceRootAbsolutePath, source.absolutePath);
        try {
          await fs.rename(target.absolutePath, source.absolutePath);
          rolledBackFiles.push({ ...file, rollbackMethod: 'rename-back' });
        } catch (error) {
          if ((error as NodeJS.ErrnoException)?.code !== 'EXDEV') throw error;
          await fs.copyFile(target.absolutePath, source.absolutePath, fsSync.constants.COPYFILE_EXCL);
          const sourceStatAfterCopy = await fs.stat(source.absolutePath);
          if (!sourceStatAfterCopy.isFile() || sourceStatAfterCopy.size !== file.sizeBytes) {
            try { await fs.unlink(source.absolutePath); } catch {}
            throw Object.assign(new Error('rollback verification failed'), { code: 'VERIFY_FAILED' });
          }
          await fs.unlink(target.absolutePath);
          rolledBackFiles.push({ ...file, rollbackMethod: 'copy-verify-unlink-back' });
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT' && !(await statOrNull(target.absolutePath))) {
          rollbackFailureList.push({ ...file, reasonCode: 'move-rollback-target-missing', message: '回滚目标文件缺失。' });
        } else {
          rollbackFailureList.push({ ...file, reasonCode: 'move-rollback-failed', message: `move rollback failed: ${safeErrorCode(error)}` });
        }
      }
    }
  }
  const removedDirectoryRelativePaths = rollbackAttempted
    ? await removeTrackedEmptyDirectories(input.targetRootAbsolutePath, Array.from(createdDirectories))
    : [];
  const committedFiles = finalCommittedFiles(attemptedFiles, rolledBackFiles);
  const rollbackSucceeded = !rollbackAttempted || (rollbackFailureList.length === 0 && committedFiles.length === 0);

  return {
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    ok: failureList.length === 0,
    committedFiles,
    attemptedFiles,
    skippedList,
    failureList,
    createdDirectoryRelativePaths: Array.from(createdDirectories).filter((item) => !removedDirectoryRelativePaths.includes(item)),
    removedDirectoryRelativePaths,
    failureStopTriggered,
    rollbackAttempted,
    rollbackSucceeded,
    rolledBackFiles,
    rollbackFailureList,
  };
}
