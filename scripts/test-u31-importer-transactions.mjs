#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  IMPORT_TRANSACTION_VERSION,
  executeCopyOnlyTransaction,
  executeMoveOnlyTransaction,
} from '../dist-electron/importerTransactionService.js';

const exists = (filePath) => fsSync.existsSync(filePath);
const sha256 = async (filePath) => crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');

async function writeFile(root, relativePath, content) {
  const absolutePath = path.join(root, ...relativePath.split('/'));
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf8');
  return absolutePath;
}

async function main() {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'yang-kura-u31-importer-'));
  const sourceRoot = path.join(tempRoot, 'source');
  const targetRoot = path.join(tempRoot, 'target');
  await fs.mkdir(sourceRoot, { recursive: true });
  await fs.mkdir(targetRoot, { recursive: true });

  try {
    const copySource = await writeFile(sourceRoot, 'copy/success.mp3', 'copy-success');
    const copySuccess = await executeCopyOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [{ id: 'copy-success', sourceRelativePath: 'copy/success.mp3', targetRelativePath: 'library/copy/success.mp3' }],
    });
    assert.equal(copySuccess.transactionVersion, IMPORT_TRANSACTION_VERSION);
    assert.equal(copySuccess.ok, true);
    assert.equal(copySuccess.committedFiles.length, 1);
    assert.equal(copySuccess.rollbackAttempted, false);
    assert.equal(exists(copySource), true, 'copy-only must keep source');
    const copyTarget = path.join(targetRoot, 'library', 'copy', 'success.mp3');
    assert.equal(exists(copyTarget), true);
    assert.equal(await sha256(copySource), await sha256(copyTarget));

    const conflictSource = await writeFile(sourceRoot, 'copy/conflict.mp3', 'new-content');
    const conflictTarget = await writeFile(targetRoot, 'library/copy/conflict.mp3', 'existing-content');
    const conflictHash = await sha256(conflictTarget);
    const copyConflict = await executeCopyOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [{ id: 'copy-conflict', sourceRelativePath: 'copy/conflict.mp3', targetRelativePath: 'library/copy/conflict.mp3' }],
    });
    assert.equal(copyConflict.ok, true);
    assert.equal(copyConflict.committedFiles.length, 0);
    assert.equal(copyConflict.skippedList[0]?.reasonCode, 'target-exists-overwrite-disabled');
    assert.equal(await sha256(conflictTarget), conflictHash, 'conflict target must not be overwritten');
    assert.equal(exists(conflictSource), true);

    await writeFile(sourceRoot, 'copy/rollback-first.mp3', 'rollback-me');
    const copyRollback = await executeCopyOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [
        { id: 'copy-rollback-first', sourceRelativePath: 'copy/rollback-first.mp3', targetRelativePath: 'rollback/copy/first.mp3' },
        { id: 'copy-rollback-missing', sourceRelativePath: 'copy/missing.mp3', targetRelativePath: 'rollback/copy/missing.mp3' },
      ],
    });
    assert.equal(copyRollback.ok, false);
    assert.equal(copyRollback.rollbackAttempted, true);
    assert.equal(copyRollback.rollbackSucceeded, true);
    assert.equal(copyRollback.committedFiles.length, 0);
    assert.equal(copyRollback.rolledBackFiles.length, 1);
    assert.equal(exists(path.join(targetRoot, 'rollback', 'copy', 'first.mp3')), false, 'failed copy batch must remove copied target');
    assert.equal(exists(path.join(targetRoot, 'rollback', 'copy')), false, 'failed copy batch must remove newly created empty directories');
    assert.equal(exists(path.join(sourceRoot, 'copy', 'rollback-first.mp3')), true, 'copy rollback must not remove source');

    const escapeResult = await executeCopyOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [{ id: 'escape', sourceRelativePath: 'copy/success.mp3', targetRelativePath: '../outside.txt' }],
    });
    assert.equal(escapeResult.ok, false);
    assert.equal(escapeResult.failureList[0]?.reasonCode, 'unsafe-relative-path');
    assert.equal(exists(path.join(tempRoot, 'outside.txt')), false);

    await writeFile(sourceRoot, 'move/success.mp3', 'move-success');
    const moveSuccess = await executeMoveOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [{ id: 'move-success', sourceRelativePath: 'move/success.mp3', targetRelativePath: 'library/move/success.mp3' }],
    });
    assert.equal(moveSuccess.ok, true);
    assert.equal(moveSuccess.committedFiles.length, 1);
    assert.equal(moveSuccess.rollbackAttempted, false);
    assert.equal(exists(path.join(sourceRoot, 'move', 'success.mp3')), false);
    assert.equal(exists(path.join(targetRoot, 'library', 'move', 'success.mp3')), true);

    const moveConflictSource = await writeFile(sourceRoot, 'move/conflict.mp3', 'move-new-content');
    const moveConflictTarget = await writeFile(targetRoot, 'library/move/conflict.mp3', 'move-existing-content');
    const moveConflictHash = await sha256(moveConflictTarget);
    const moveConflict = await executeMoveOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [{ id: 'move-conflict', sourceRelativePath: 'move/conflict.mp3', targetRelativePath: 'library/move/conflict.mp3' }],
    });
    assert.equal(moveConflict.ok, true);
    assert.equal(moveConflict.committedFiles.length, 0);
    assert.equal(moveConflict.skippedList[0]?.reasonCode, 'target-exists-overwrite-disabled');
    assert.equal(exists(moveConflictSource), true, 'move conflict must keep source');
    assert.equal(await sha256(moveConflictTarget), moveConflictHash, 'move conflict must not overwrite target');

    await writeFile(sourceRoot, 'move/rollback-first.mp3', 'restore-me');
    const moveRollback = await executeMoveOnlyTransaction({
      sourceRootAbsolutePath: sourceRoot,
      targetRootAbsolutePath: targetRoot,
      items: [
        { id: 'move-rollback-first', sourceRelativePath: 'move/rollback-first.mp3', targetRelativePath: 'rollback/move/first.mp3' },
        { id: 'move-rollback-missing', sourceRelativePath: 'move/missing.mp3', targetRelativePath: 'rollback/move/missing.mp3' },
        { id: 'move-after-failure', sourceRelativePath: 'move/conflict.mp3', targetRelativePath: 'rollback/move/after.mp3' },
      ],
    });
    assert.equal(moveRollback.ok, false);
    assert.equal(moveRollback.failureStopTriggered, true);
    assert.equal(moveRollback.rollbackAttempted, true);
    assert.equal(moveRollback.rollbackSucceeded, true);
    assert.equal(moveRollback.committedFiles.length, 0);
    assert.equal(moveRollback.rolledBackFiles.length, 1);
    assert.equal(moveRollback.skippedList.some((item) => item.reasonCode === 'remaining-after-failure-stop'), true);
    assert.equal(exists(path.join(sourceRoot, 'move', 'rollback-first.mp3')), true, 'failed move batch must restore source');
    assert.equal(exists(path.join(targetRoot, 'rollback', 'move', 'first.mp3')), false, 'failed move batch must remove target');
    assert.equal(exists(path.join(targetRoot, 'rollback', 'move')), false, 'failed move batch must remove newly created empty directories');

    const serialized = JSON.stringify({ copySuccess, copyConflict, copyRollback, escapeResult, moveSuccess, moveConflict, moveRollback });
    assert.equal(/[A-Z]:\\|file:\/\//i.test(serialized), false, 'transaction results must not expose absolute Windows paths or file URLs');

    console.log('U31 importer transaction test PASS');
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
