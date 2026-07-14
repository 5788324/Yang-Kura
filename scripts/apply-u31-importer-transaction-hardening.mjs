#!/usr/bin/env node
import fs from 'node:fs';

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function write(file, value) {
  fs.writeFileSync(file, value.replace(/\r\n/g, '\n'), 'utf8');
}

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: anchor not found`);
  if (first !== source.lastIndexOf(before)) throw new Error(`${label}: anchor not unique`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function replaceBetween(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) throw new Error(`${label}: start anchor not found`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (endIndex < 0) throw new Error(`${label}: end anchor not found`);
  return source.slice(0, startIndex) + replacement + source.slice(endIndex);
}

let main = read('electron/main.ts');
main = replaceOnce(
  main,
  "import { describeLibraryIndexReadError, parseLibraryIndexJsonBuffer } from './libraryIndexJsonReader.js';",
  "import { describeLibraryIndexReadError, parseLibraryIndexJsonBuffer } from './libraryIndexJsonReader.js';\nimport { IMPORT_TRANSACTION_VERSION, executeCopyOnlyTransaction, executeMoveOnlyTransaction } from './importerTransactionService.js';",
  'main transaction import',
);

const copyLogInterface = `interface ImportCopyOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp96-copy-only-operation-log-v1';
  operationId: string;
  operationPlanId: string;
  eventType: 'copy-only-execute';
  mode: 'copy-only';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  createdDirectoryRelativePaths: string[];
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
}`;
const copyLogInterfaceU31 = `interface ImportCopyOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp96-copy-only-operation-log-v1';
  transactionVersion: typeof IMPORT_TRANSACTION_VERSION;
  operationId: string;
  operationPlanId: string;
  eventType: 'copy-only-execute';
  mode: 'copy-only';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  createdDirectoryRelativePaths: string[];
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackCount: number;
  rollbackFailureCount: number;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
}`;
main = replaceOnce(main, copyLogInterface, copyLogInterfaceU31, 'copy log interface');

const moveLogInterface = `interface ImportMoveOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp105-move-only-operation-log-v1';
  operationId: string;
  operationPlanId: string;
  eventType: 'move-only-execute';
  mode: 'move-only';
  executorVersion: 'mvp105-small-sample-move-only-executor-v1';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  movedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  failureStopTriggered: boolean;
  createdDirectoryRelativePaths: string[];
  movedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; moveMethod: 'rename' | 'copy-verify-unlink' }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
  sqliteWritten: false;
}`;
const moveLogInterfaceU31 = `interface ImportMoveOnlyOperationLogEntry {
  schemaVersion: 1;
  operationLogVersion: 'mvp105-move-only-operation-log-v1';
  transactionVersion: typeof IMPORT_TRANSACTION_VERSION;
  operationId: string;
  operationPlanId: string;
  eventType: 'move-only-execute';
  mode: 'move-only';
  executorVersion: 'mvp105-small-sample-move-only-executor-v1';
  wroteAt: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  movedCount: number;
  skippedCount: number;
  failedCount: number;
  createdDirectoryCount: number;
  failureStopTriggered: boolean;
  createdDirectoryRelativePaths: string[];
  movedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; moveMethod: 'rename' | 'copy-verify-unlink' }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackCount: number;
  rollbackFailureCount: number;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
  absolutePathReturned: false;
  fileUrlReturned: false;
  libraryIndexWritten: false;
  sqliteWritten: false;
}`;
main = replaceOnce(main, moveLogInterface, moveLogInterfaceU31, 'move log interface');

const copyLogBuilder = `function buildMvp96CopyOnlyOperationLogEntry(input: {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; absolutePathReturned: false; fileUrlReturned: false }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }>;
  createdDirectoryRelativePaths: string[];
}): ImportCopyOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp96-copy-only-operation-log-v1',
    operationId: \`mvp96-copy-only-\${crypto.randomUUID()}\`,
    operationPlanId: input.operationPlanId,
    eventType: 'copy-only-execute',
    mode: 'copy-only',
    wroteAt: new Date().toISOString(),
    rootPathToken: input.rootPathToken,
    targetRootPathToken: input.targetRootPathToken,
    requestedFileCount: input.requestedFileCount,
    copiedCount: input.copiedFiles.length,
    skippedCount: input.skippedList.length,
    failedCount: input.failureList.length,
    createdDirectoryCount: input.createdDirectoryRelativePaths.length,
    createdDirectoryRelativePaths: input.createdDirectoryRelativePaths,
    copiedFiles: input.copiedFiles.map(({ id, sourceRelativePath, targetRelativePath, sizeBytes }) => ({ id, sourceRelativePath, targetRelativePath, sizeBytes })),
    skippedList: input.skippedList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode })),
    failureList: input.failureList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode, message }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode, message })),
    absolutePathReturned: false,
    fileUrlReturned: false,
    libraryIndexWritten: false,
  };
}`;
const copyLogBuilderU31 = `function buildMvp96CopyOnlyOperationLogEntry(input: {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  copiedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; absolutePathReturned: false; fileUrlReturned: false }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }>;
  createdDirectoryRelativePaths: string[];
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
}): ImportCopyOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp96-copy-only-operation-log-v1',
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    operationId: \`mvp96-copy-only-\${crypto.randomUUID()}\`,
    operationPlanId: input.operationPlanId,
    eventType: 'copy-only-execute',
    mode: 'copy-only',
    wroteAt: new Date().toISOString(),
    rootPathToken: input.rootPathToken,
    targetRootPathToken: input.targetRootPathToken,
    requestedFileCount: input.requestedFileCount,
    copiedCount: input.copiedFiles.length,
    skippedCount: input.skippedList.length,
    failedCount: input.failureList.length,
    createdDirectoryCount: input.createdDirectoryRelativePaths.length,
    createdDirectoryRelativePaths: input.createdDirectoryRelativePaths,
    copiedFiles: input.copiedFiles.map(({ id, sourceRelativePath, targetRelativePath, sizeBytes }) => ({ id, sourceRelativePath, targetRelativePath, sizeBytes })),
    skippedList: input.skippedList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode })),
    failureList: input.failureList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode, message }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode, message })),
    rollbackAttempted: input.rollbackAttempted,
    rollbackSucceeded: input.rollbackSucceeded,
    rolledBackCount: input.rolledBackFiles.length,
    rollbackFailureCount: input.rollbackFailureList.length,
    rolledBackFiles: input.rolledBackFiles,
    rollbackFailureList: input.rollbackFailureList,
    absolutePathReturned: false,
    fileUrlReturned: false,
    libraryIndexWritten: false,
  };
}`;
main = replaceOnce(main, copyLogBuilder, copyLogBuilderU31, 'copy log builder');

const moveLogBuilderStart = 'function buildMvp105MoveOnlyOperationLogEntry(input: {';
const moveLogBuilderEnd = 'async function appendMvp105MoveOnlyOperationLog';
const moveLogBuilderU31 = `function buildMvp105MoveOnlyOperationLogEntry(input: {
  operationPlanId: string;
  rootPathToken: string;
  targetRootPathToken: string;
  requestedFileCount: number;
  movedFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; sizeBytes: number; moveMethod: 'rename' | 'copy-verify-unlink'; absolutePathReturned: false; fileUrlReturned: false }>;
  skippedList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; absolutePathReturned: false; fileUrlReturned: false }>;
  failureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string; absolutePathReturned: false; fileUrlReturned: false }>;
  createdDirectoryRelativePaths: string[];
  failureStopTriggered: boolean;
  rollbackAttempted: boolean;
  rollbackSucceeded: boolean;
  rolledBackFiles: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; rollbackMethod: string }>;
  rollbackFailureList: Array<{ id: string; sourceRelativePath: string; targetRelativePath: string; reasonCode: string; message: string }>;
}): ImportMoveOnlyOperationLogEntry {
  return {
    schemaVersion: 1,
    operationLogVersion: 'mvp105-move-only-operation-log-v1',
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    operationId: \`mvp105-move-only-\${crypto.randomUUID()}\`,
    operationPlanId: input.operationPlanId,
    eventType: 'move-only-execute',
    mode: 'move-only',
    executorVersion: 'mvp105-small-sample-move-only-executor-v1',
    wroteAt: new Date().toISOString(),
    rootPathToken: input.rootPathToken,
    targetRootPathToken: input.targetRootPathToken,
    requestedFileCount: input.requestedFileCount,
    movedCount: input.movedFiles.length,
    skippedCount: input.skippedList.length,
    failedCount: input.failureList.length,
    createdDirectoryCount: input.createdDirectoryRelativePaths.length,
    failureStopTriggered: input.failureStopTriggered,
    createdDirectoryRelativePaths: input.createdDirectoryRelativePaths,
    movedFiles: input.movedFiles.map(({ id, sourceRelativePath, targetRelativePath, sizeBytes, moveMethod }) => ({ id, sourceRelativePath, targetRelativePath, sizeBytes, moveMethod })),
    skippedList: input.skippedList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode })),
    failureList: input.failureList.map(({ id, sourceRelativePath, targetRelativePath, reasonCode, message }) => ({ id, sourceRelativePath, targetRelativePath, reasonCode, message })),
    rollbackAttempted: input.rollbackAttempted,
    rollbackSucceeded: input.rollbackSucceeded,
    rolledBackCount: input.rolledBackFiles.length,
    rollbackFailureCount: input.rollbackFailureList.length,
    rolledBackFiles: input.rolledBackFiles,
    rollbackFailureList: input.rollbackFailureList,
    absolutePathReturned: false,
    fileUrlReturned: false,
    libraryIndexWritten: false,
    sqliteWritten: false,
  };
}

`;
main = replaceBetween(main, moveLogBuilderStart, moveLogBuilderEnd, moveLogBuilderU31, 'move log builder');

const moveFunctionStart = 'async function buildMvp105MoveOnlyExecuteResult(request: Partial<ImportMoveOnlyExecuteRequest> | undefined) {';
const moveFunctionEnd = '// Legacy verifier token retained for MVP95 compatibility';
const moveFunctionU31 = `async function buildMvp105MoveOnlyExecuteResult(request: Partial<ImportMoveOnlyExecuteRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp105-small-sample-move-only-executor-v1',
    'u31-import-transaction-v1',
    'move-only-small-sample real executor: max 20 files',
    'requires CONFIRM_MOVE_IMPORT and confirmedMoveOnly=true',
    'overwrite=false; target exists skip',
    'failure-stop with reverse rollback of this operation',
    'OperationLog is append-only JSONL with relative paths only',
    'no library-index.json write, no SQLite, no absolutePath, no file://',
  ]);
  const blocked = (status: string, message: string, skippedCount = 0) => ({
    ok: false,
    status,
    executorVersion: 'mvp105-small-sample-move-only-executor-v1',
    operationPlanId: request?.operationPlanId ?? 'mvp105-missing-operation-plan',
    rootPathToken: request?.rootPathToken,
    targetRootPathToken: request?.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: false,
    moveAllowed: false,
    movedCount: 0,
    skippedCount,
    failedCount: 0,
    libraryIndexWritten: false,
    sqliteWritten: false,
    message,
    safetyNotes: baseSafetyNotes,
  } as const);

  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'move-only-small-sample') {
    return blocked('mvp105-move-only-execute-invalid-request', 'move-only execute 请求必须包含 operationPlanId、rootPathToken、targetRootPathToken，且 mode=move-only-small-sample。');
  }
  if (request.confirmedMoveOnly !== true || request.confirmationText !== 'CONFIRM_MOVE_IMPORT') {
    return blocked('mvp105-move-only-execute-confirmation-required', '真实 move-only 执行需要 confirmedMoveOnly=true 且 confirmationText=CONFIRM_MOVE_IMPORT。', Array.isArray(request.relativePaths) ? request.relativePaths.length : 0);
  }
  if (request.overwriteAllowed !== false && request.overwriteAllowed !== undefined) {
    return blocked('mvp105-move-only-execute-overwrite-blocked', 'MVP105/U31 固定 overwriteAllowed=false；任何覆盖请求都会被拒绝。');
  }
  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) return blocked('mvp105-move-only-execute-invalid-root-token', 'rootPathToken 或 targetRootPathToken 无效。请重新选择源目录和目标仓库目录。');

  const relativePaths = Array.isArray(request.relativePaths) ? request.relativePaths.slice(0, 200) : [];
  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  const maxMoveItems = normalizeLimit(request.maxMoveItems, 20, 20);
  if (relativePaths.length === 0) return blocked('mvp105-move-only-execute-empty-file-list', 'move-only execute 至少需要一个 source relativePath。');
  if (relativePaths.length > maxMoveItems) return blocked('mvp105-move-only-execute-too-many-files', \`MVP105/U31 是小样本 move-only executor，最多允许 \${maxMoveItems} 个文件。\`, relativePaths.length);

  const transaction = await executeMoveOnlyTransaction({
    sourceRootAbsolutePath: sourceRoot.absolutePath,
    targetRootAbsolutePath: targetRoot.absolutePath,
    items: relativePaths.map((sourceInput, index) => ({
      id: \`mvp105-move-execute-\${index + 1}\`,
      sourceRelativePath: typeof sourceInput === 'string' ? normalizeRelativePath(sourceInput) : 'invalid-source-relative-path',
      targetRelativePath: typeof (targetRelativePaths[index] ?? sourceInput) === 'string' ? normalizeRelativePath(targetRelativePaths[index] ?? sourceInput) : 'invalid-target-relative-path',
    })),
  });
  const withFlags = <T extends object>(item: T) => ({ ...item, absolutePathReturned: false as const, fileUrlReturned: false as const });
  const movedFiles = transaction.committedFiles.map(withFlags);
  const skippedList = transaction.skippedList.map(withFlags);
  const failureList = transaction.failureList.map(withFlags);
  const rolledBackFiles = transaction.rolledBackFiles;
  const rollbackFailureList = transaction.rollbackFailureList;

  const operationLogEntry = buildMvp105MoveOnlyOperationLogEntry({
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    requestedFileCount: relativePaths.length,
    movedFiles,
    skippedList,
    failureList,
    createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths,
    failureStopTriggered: transaction.failureStopTriggered,
    rollbackAttempted: transaction.rollbackAttempted,
    rollbackSucceeded: transaction.rollbackSucceeded,
    rolledBackFiles,
    rollbackFailureList,
  });
  const operationLogWrite = await appendMvp105MoveOnlyOperationLog(operationLogEntry);
  const operationLogPersisted = operationLogWrite.ok;
  const operationLogFailureCode = operationLogWrite.ok ? undefined : (operationLogWrite as { ok: false; code: string }).code;
  const status = transaction.rollbackAttempted
    ? (transaction.rollbackSucceeded ? 'u31-move-only-execute-rolled-back' : 'u31-move-only-execute-rollback-incomplete')
    : (operationLogPersisted ? 'mvp105-move-only-execute-complete-with-operation-log' : 'mvp105-move-only-execute-log-write-failed');

  return {
    ok: transaction.failureList.length === 0 && operationLogPersisted,
    status,
    executorVersion: 'mvp105-small-sample-move-only-executor-v1',
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: true,
    moveAllowed: true,
    copyAllowed: false,
    overwriteAllowed: false,
    deleteAllowed: false,
    renameAllowed: true,
    sourceDirectoryCleanupAllowed: false,
    operationLogPersisted,
    operationLogFailureCode,
    libraryIndexWritten: false,
    scannerRunTriggered: false,
    sqliteWritten: false,
    requestedFileCount: relativePaths.length,
    movedCount: movedFiles.length,
    skippedCount: skippedList.length,
    failedCount: failureList.length,
    createdDirectoryCount: transaction.createdDirectoryRelativePaths.length,
    createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths,
    removedDirectoryRelativePaths: transaction.removedDirectoryRelativePaths,
    failureStopTriggered: transaction.failureStopTriggered,
    rollbackAttempted: transaction.rollbackAttempted,
    rollbackSucceeded: transaction.rollbackSucceeded,
    rolledBackCount: rolledBackFiles.length,
    rollbackFailureCount: rollbackFailureList.length,
    rolledBackFiles,
    rollbackFailureList,
    movedFiles,
    skippedList,
    failureList,
    operationLog: operationLogPersisted ? {
      schemaVersion: operationLogEntry.schemaVersion,
      operationLogVersion: operationLogEntry.operationLogVersion,
      transactionVersion: operationLogEntry.transactionVersion,
      operationId: operationLogEntry.operationId,
      operationPlanId: operationLogEntry.operationPlanId,
      eventType: operationLogEntry.eventType,
      mode: operationLogEntry.mode,
      executorVersion: operationLogEntry.executorVersion,
      wroteAt: operationLogEntry.wroteAt,
      persisted: true,
      absolutePathReturned: false,
      fileUrlReturned: false,
    } : undefined,
    operationLogPreview: {
      operationPlanId: request.operationPlanId,
      mode: 'move-only',
      persisted: operationLogPersisted,
      movedCount: movedFiles.length,
      skippedCount: skippedList.length,
      failedCount: failureList.length,
      createdDirectoryCount: transaction.createdDirectoryRelativePaths.length,
      rollbackAttempted: transaction.rollbackAttempted,
      rollbackSucceeded: transaction.rollbackSucceeded,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    message: transaction.rollbackAttempted
      ? (transaction.rollbackSucceeded ? 'U31 move-only 批次失败后已恢复本轮已移动文件。' : 'U31 move-only 批次失败且回滚未完整完成，请查看相对路径失败列表。')
      : (operationLogPersisted ? 'move-only 执行完成并写入 OperationLog。' : 'move-only 执行完成，但 OperationLog 写入失败。'),
    safetyNotes: baseSafetyNotes,
  } as const;
}

`;
main = replaceBetween(main, moveFunctionStart, moveFunctionEnd, moveFunctionU31, 'move execute function');

const copyFunctionStart = 'async function buildMvp95CopyOnlyExecuteResult(request: Partial<ImportCopyOnlyStubRequest> | undefined) {';
const copyFunctionEnd = 'async function buildMvp97PostCopyRefreshPreviewResult';
const copyFunctionU31 = `async function buildMvp95CopyOnlyExecuteResult(request: Partial<ImportCopyOnlyStubRequest> | undefined) {
  const baseSafetyNotes = buildSafetyNotes().concat([
    'mvp95-copy-only-executor',
    'mvp96-copy-only-operation-log',
    'u31-import-transaction-v1',
    'copy uses COPYFILE_EXCL overwrite protection',
    'partial failure rolls back targets created by this operation',
    'OperationLog contains relative paths and rollback outcome only',
    'renderer token only: no absolutePath, no file://',
  ]);
  const blocked = (status: string, message: string, skippedCount = 0) => ({
    ok: false,
    status,
    operationPlanId: request?.operationPlanId ?? 'mvp95-missing-operation-plan',
    rootPathToken: request?.rootPathToken,
    targetRootPathToken: request?.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: false,
    copyAllowed: false,
    copiedCount: 0,
    skippedCount,
    failedCount: 0,
    createdDirectoryCount: 0,
    message,
    safetyNotes: baseSafetyNotes,
  } as const);

  if (!request?.operationPlanId || !request.rootPathToken || !request.targetRootPathToken || request.mode !== 'copy-only-stub') {
    return blocked('mvp95-copy-only-execute-invalid-request', 'copy-only execute 请求必须包含 operationPlanId、rootPathToken、targetRootPathToken，且 mode=copy-only-stub。');
  }
  if (request.confirmedCopyOnly !== true || request.confirmationText !== 'COPY ONLY') {
    return blocked('mvp95-copy-only-execute-confirmation-required', '真实 copy-only 执行需要 confirmedCopyOnly=true 且 confirmationText="COPY ONLY"。', Array.isArray(request.relativePaths) ? request.relativePaths.length : 0);
  }
  const sourceRoot = rootTokenMap.get(request.rootPathToken);
  const targetRoot = rootTokenMap.get(request.targetRootPathToken);
  if (!sourceRoot || !targetRoot) return blocked('mvp95-copy-only-execute-invalid-root-token', 'rootPathToken 或 targetRootPathToken 无效。请重新选择源目录和目标仓库目录。');

  const relativePaths = Array.isArray(request.relativePaths) ? request.relativePaths.slice(0, 200) : [];
  const targetRelativePaths = Array.isArray(request.targetRelativePaths) ? request.targetRelativePaths.slice(0, 200) : [];
  if (relativePaths.length === 0) return blocked('mvp95-copy-only-execute-empty-file-list', 'copy-only execute 至少需要一个 source relativePath。');

  const transaction = await executeCopyOnlyTransaction({
    sourceRootAbsolutePath: sourceRoot.absolutePath,
    targetRootAbsolutePath: targetRoot.absolutePath,
    items: relativePaths.map((sourceInput, index) => ({
      id: \`mvp95-copy-execute-\${index + 1}\`,
      sourceRelativePath: typeof sourceInput === 'string' ? normalizeRelativePath(sourceInput) : 'invalid-source-relative-path',
      targetRelativePath: typeof (targetRelativePaths[index] ?? sourceInput) === 'string' ? normalizeRelativePath(targetRelativePaths[index] ?? sourceInput) : 'invalid-target-relative-path',
    })),
  });
  const withFlags = <T extends object>(item: T) => ({ ...item, absolutePathReturned: false as const, fileUrlReturned: false as const });
  const copiedFiles = transaction.committedFiles.map(withFlags);
  const skippedList = transaction.skippedList.map(withFlags);
  const failureList = transaction.failureList.map(withFlags);
  const rolledBackFiles = transaction.rolledBackFiles;
  const rollbackFailureList = transaction.rollbackFailureList;

  const operationLogEntry = buildMvp96CopyOnlyOperationLogEntry({
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    requestedFileCount: relativePaths.length,
    copiedFiles,
    skippedList,
    failureList,
    createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths,
    rollbackAttempted: transaction.rollbackAttempted,
    rollbackSucceeded: transaction.rollbackSucceeded,
    rolledBackFiles,
    rollbackFailureList,
  });
  const operationLogWrite = await appendMvp96CopyOnlyOperationLog(operationLogEntry);
  const operationLogPersisted = operationLogWrite.ok;
  const operationLogFailureCode = operationLogWrite.ok ? undefined : (operationLogWrite as { ok: false; code: string }).code;
  const status = transaction.rollbackAttempted
    ? (transaction.rollbackSucceeded ? 'u31-copy-only-execute-rolled-back' : 'u31-copy-only-execute-rollback-incomplete')
    : (operationLogPersisted ? 'mvp96-copy-only-execute-complete-with-operation-log' : 'mvp96-copy-only-execute-log-write-failed');

  return {
    ok: transaction.failureList.length === 0 && operationLogPersisted,
    status,
    transactionVersion: IMPORT_TRANSACTION_VERSION,
    operationPlanId: request.operationPlanId,
    rootPathToken: request.rootPathToken,
    targetRootPathToken: request.targetRootPathToken,
    absolutePathReturned: false,
    fileUrlReturned: false,
    executeAllowed: true,
    copyAllowed: true,
    overwriteAllowed: false,
    moveAllowed: false,
    deleteAllowed: false,
    renameAllowed: false,
    operationLogPersisted,
    operationLogFailureCode,
    libraryIndexWritten: false,
    requestedFileCount: relativePaths.length,
    copiedCount: copiedFiles.length,
    skippedCount: skippedList.length,
    failedCount: failureList.length,
    createdDirectoryCount: transaction.createdDirectoryRelativePaths.length,
    createdDirectoryRelativePaths: transaction.createdDirectoryRelativePaths,
    removedDirectoryRelativePaths: transaction.removedDirectoryRelativePaths,
    rollbackAttempted: transaction.rollbackAttempted,
    rollbackSucceeded: transaction.rollbackSucceeded,
    rolledBackCount: rolledBackFiles.length,
    rollbackFailureCount: rollbackFailureList.length,
    rolledBackFiles,
    rollbackFailureList,
    copiedFiles,
    skippedList,
    failureList,
    operationLog: operationLogPersisted ? {
      schemaVersion: operationLogEntry.schemaVersion,
      operationLogVersion: operationLogEntry.operationLogVersion,
      transactionVersion: operationLogEntry.transactionVersion,
      operationId: operationLogEntry.operationId,
      operationPlanId: operationLogEntry.operationPlanId,
      eventType: operationLogEntry.eventType,
      mode: operationLogEntry.mode,
      wroteAt: operationLogEntry.wroteAt,
      persisted: true,
      absolutePathReturned: false,
      fileUrlReturned: false,
    } : undefined,
    operationLogPreview: {
      operationPlanId: request.operationPlanId,
      mode: 'copy-only',
      persisted: operationLogPersisted,
      copiedCount: copiedFiles.length,
      skippedCount: skippedList.length,
      failedCount: failureList.length,
      createdDirectoryCount: transaction.createdDirectoryRelativePaths.length,
      rollbackAttempted: transaction.rollbackAttempted,
      rollbackSucceeded: transaction.rollbackSucceeded,
      absolutePathReturned: false,
      fileUrlReturned: false,
    },
    message: transaction.rollbackAttempted
      ? (transaction.rollbackSucceeded ? 'U31 copy-only 批次失败后已删除本轮新复制文件。' : 'U31 copy-only 批次失败且回滚未完整完成，请查看相对路径失败列表。')
      : (operationLogPersisted ? 'copy-only 执行完成并写入 OperationLog。' : 'copy-only 执行完成，但 OperationLog 写入失败。'),
    safetyNotes: baseSafetyNotes,
  } as const;
}

`;
main = replaceBetween(main, copyFunctionStart, copyFunctionEnd, copyFunctionU31, 'copy execute function');

main = replaceOnce(
  main,
  "    'MVP-105 允许用户二次确认后执行小样本真实 move-only：最多 20 个文件、overwrite=false、失败停止、写相对路径 OperationLog、不写 index。',",
  "    'MVP-105 允许用户二次确认后执行小样本真实 move-only：最多 20 个文件、overwrite=false、失败停止、写相对路径 OperationLog、不写 index。',\n    'U31 将 copy/move 文件操作收口为本轮事务：部分失败时只回滚本轮新复制或已移动文件，并只清理本轮创建且为空的目标目录。',",
  'U31 safety note',
);
write('electron/main.ts', main);

let types = read('src/types/electron-api.d.ts');
types = replaceOnce(
  types,
  `  interface YangKuraImportCopyOnlyOperationLogPersistedSummary {`,
  `  interface YangKuraImportRolledBackFile {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    rollbackMethod: 'unlink-copy-target' | 'rename-back' | 'copy-verify-unlink-back' | 'already-absent';
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportRollbackFailure {
    id: string;
    sourceRelativePath: string;
    targetRelativePath: string;
    reasonCode: string;
    message: string;
    absolutePath?: never;
    fileUrl?: never;
  }

  interface YangKuraImportCopyOnlyOperationLogPersistedSummary {`,
  'rollback public types',
);
types = replaceOnce(
  types,
  `    operationLogVersion: 'mvp96-copy-only-operation-log-v1';
    operationId: string;`,
  `    operationLogVersion: 'mvp96-copy-only-operation-log-v1';
    transactionVersion?: 'u31-import-transaction-v1';
    operationId: string;`,
  'copy log summary transaction version',
);
types = replaceOnce(
  types,
  `    status: 'mvp95-copy-only-execute-complete' | 'mvp96-copy-only-execute-complete-with-operation-log' | 'mvp96-copy-only-execute-log-write-failed';`,
  `    status: 'mvp95-copy-only-execute-complete' | 'mvp96-copy-only-execute-complete-with-operation-log' | 'mvp96-copy-only-execute-log-write-failed' | 'u31-copy-only-execute-rolled-back' | 'u31-copy-only-execute-rollback-incomplete';`,
  'copy status union',
);
types = replaceOnce(
  types,
  `    createdDirectoryRelativePaths: string[];
    copiedFiles: YangKuraImportCopyOnlyCopiedFile[];`,
  `    createdDirectoryRelativePaths: string[];
    removedDirectoryRelativePaths?: string[];
    transactionVersion?: 'u31-import-transaction-v1';
    rollbackAttempted: boolean;
    rollbackSucceeded: boolean;
    rolledBackCount: number;
    rollbackFailureCount: number;
    rolledBackFiles: YangKuraImportRolledBackFile[];
    rollbackFailureList: YangKuraImportRollbackFailure[];
    copiedFiles: YangKuraImportCopyOnlyCopiedFile[];`,
  'copy rollback fields',
);
types = replaceOnce(
  types,
  `      | 'mvp105-move-only-execute-too-many-files';`,
  `      | 'mvp105-move-only-execute-too-many-files'
      | 'u31-move-only-execute-rolled-back'
      | 'u31-move-only-execute-rollback-incomplete';`,
  'move status union',
);
types = replaceOnce(
  types,
  `  failureStopTriggered?: boolean;
  movedFiles?: YangKuraImportMoveOnlyMovedFile[];`,
  `  failureStopTriggered?: boolean;
  transactionVersion?: 'u31-import-transaction-v1';
  createdDirectoryRelativePaths?: string[];
  removedDirectoryRelativePaths?: string[];
  rollbackAttempted?: boolean;
  rollbackSucceeded?: boolean;
  rolledBackCount?: number;
  rollbackFailureCount?: number;
  rolledBackFiles?: YangKuraImportRolledBackFile[];
  rollbackFailureList?: YangKuraImportRollbackFailure[];
  movedFiles?: YangKuraImportMoveOnlyMovedFile[];`,
  'move rollback fields',
);
write('src/types/electron-api.d.ts', types);

const pkg = JSON.parse(read('package.json'));
pkg.scripts['test:u31:importer-transactions'] = 'node scripts/test-u31-importer-transactions.mjs';
pkg.scripts['verify:u31-importer-transaction-hardening'] = 'node scripts/verify-u31-importer-transaction-hardening.mjs';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

let stable = read('scripts/run-stable-regression.mjs');
stable = replaceOnce(stable, "  'test:importer:smoke',", "  'test:importer:smoke',\n  'test:u31:importer-transactions',", 'stable U31 test');
write('scripts/run-stable-regression.mjs', stable);

console.log('U31 importer transaction integration patch applied.');
