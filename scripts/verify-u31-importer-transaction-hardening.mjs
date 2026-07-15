#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync('electron/main.ts', 'utf8');
const service = fs.readFileSync('electron/importerTransactionService.ts', 'utf8');
const types = fs.readFileSync('src/types/electron-api.d.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/branch-validation.yml', 'utf8');
const stable = fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8');
const test = fs.readFileSync('scripts/test-u31-importer-transactions.mjs', 'utf8');

const checks = [
  ['main imports U31 transaction service', main.includes("from './importerTransactionService.js'") && main.includes('executeCopyOnlyTransaction') && main.includes('executeMoveOnlyTransaction')],
  ['copy rollback statuses are wired', main.includes('u31-copy-only-execute-rolled-back') && main.includes('u31-copy-only-execute-rollback-incomplete')],
  ['move rollback statuses are wired', main.includes('u31-move-only-execute-rolled-back') && main.includes('u31-move-only-execute-rollback-incomplete')],
  ['operation logs record transaction result', main.includes('transactionVersion: typeof IMPORT_TRANSACTION_VERSION') && main.includes('rollbackAttempted: boolean') && main.includes('rolledBackCount: number') && main.includes('rollbackFailureCount: number')],
  ['copy service uses exclusive copy and rollback', service.includes('COPYFILE_EXCL') && service.includes('executeCopyOnlyTransaction') && service.includes("rollbackMethod: 'unlink-copy-target'")],
  ['move service supports reverse rollback', service.includes('executeMoveOnlyTransaction') && service.includes("rollbackMethod: 'rename-back'") && service.includes("'copy-verify-unlink-back'")],
  ['service removes only tracked empty directories', service.includes('ensureTrackedParentDirectories') && service.includes('removeTrackedEmptyDirectories') && service.includes('createdDirectoryRelativePaths')],
  ['public types expose rollback state', types.includes('YangKuraImportRolledBackFile') && types.includes('rollbackAttempted: boolean') && types.includes('rollbackSucceeded: boolean') && types.includes('rollbackFailureList')],
  ['U31 package scripts exist', pkg.scripts?.['test:u31:importer-transactions'] === 'node scripts/test-u31-importer-transactions.mjs' && pkg.scripts?.['verify:u31-importer-transaction-hardening'] === 'node scripts/verify-u31-importer-transaction-hardening.mjs'],
  ['permanent workflow runs U31 transaction tests', workflow.includes('Run U31 importer transaction matrix') && workflow.includes('npm run test:u31:importer-transactions')],
  ['stable regression includes U31 transaction tests', stable.includes("'test:u31:importer-transactions'" )],
  ['test uses compiled product service', test.includes("../dist-electron/importerTransactionService.js") && test.includes('failed copy batch must remove copied target') && test.includes('failed move batch must restore source')],
  ['privacy contract remains tokenized', service.includes('sourceRootAbsolutePath') && service.includes('targetRootAbsolutePath') && !service.includes('fileUrlReturned: true')],
];

for (const [label, passed] of checks) {
  assert.equal(passed, true, label);
  console.log(`PASS\t${label}`);
}

console.log('U31 importer transaction hardening verifier PASS');
