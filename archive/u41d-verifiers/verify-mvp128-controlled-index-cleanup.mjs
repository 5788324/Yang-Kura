import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp128-controlled-index-cleanup')) throw new Error('verify:stable missing MVP128');

const checks = [
  ['electron/libraryIndexHealthService.ts', ['applyLibraryIndexRemovalOperations', 'mvp128-controlled-index-cleanup-v1', 'deleteMediaFiles: false']],
  ['electron/main.ts', ['CONFIRM_REMOVE_MISSING_INDEX_RECORDS', 'mvp128-controlled-index-cleanup-complete', 'sourceIndexSha256', 'backup.before-mvp128', 'rollbackRestored', 'media files were not deleted']],
  ['electron/preload.ts', ['requestLibraryIndexRemovalWrite', 'IPC_CHANNELS.library.indexRemovalWrite', 'canWriteControlledIndexRemoval']],
  ['electron/ipc/contracts.ts', ["indexRemovalWrite: 'yang-kura:index:removal-write-confirmed-request'"]],
  ['src/types/electron-api.d.ts', ['YangKuraLibraryIndexRemovalWriteRequest', 'YangKuraLibraryIndexRemovalWriteResult', 'mediaFilesDeleted: false']],
  ['src/components/SettingsPage.tsx', ['mvp128-controlled-index-cleanup', 'CONFIRM_REMOVE_MISSING_INDEX_RECORDS', '创建备份并写入索引清理', 'requestLibraryIndexRemovalWrite']],
];
for (const [file, tokens] of checks) {
  const text = fs.readFileSync(file, 'utf8');
  for (const token of tokens) if (!text.includes(token)) throw new Error(`${file} missing ${token}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
if (!main.includes('currentHash !== request.sourceIndexSha256')) throw new Error('source SHA revalidation missing');
if (!main.includes("await fs.writeFile(backupPath, currentText, { encoding: 'utf8', flag: 'wx' })")) throw new Error('exclusive backup write missing');
if (/fs\.(rm|unlink)\(/.test(main.slice(main.indexOf('writeLibraryIndexRemovalWithBackup'), main.indexOf('async function revealNearestExistingParent')))) throw new Error('cleanup writer must not delete files');

const output = execFileSync(process.execPath, ['scripts/test-mvp128-index-cleanup-service.mjs'], { encoding: 'utf8' });
if (!output.includes('PASS')) throw new Error('MVP128 service test failed');
console.log('MVP128 controlled index cleanup verifier PASS');
