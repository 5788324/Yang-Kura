import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.version !== '0.167.0-mvp129') throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp129-index-maintenance-closeout')) throw new Error('verify:stable missing MVP129');

const checks = [
  ['electron/libraryIndexMaintenanceService.ts', [
    'inspectLibraryIndexBackups',
    'restoreLibraryIndexFromBackup',
    'buildLibraryIndexBackupRetentionPreview',
    'mvp129-index-maintenance-history-v1',
    'deletePerformed: false',
    'mediaFilesDeleted: false',
  ]],
  ['electron/main.ts', [
    'CONFIRM_RESTORE_LIBRARY_INDEX_BACKUP',
    'mvp129-index-backup-restore-complete',
    'mvp129-index-backup-retention-preview-ready',
    'mvp129-index-maintenance-history-ready',
    'mvp129-index-backup-retention-preview-ready',
    'restoreLibraryIndexBackupForRoot',
  ]],
  ['electron/preload.ts', [
    'requestLibraryIndexBackupList',
    'requestLibraryIndexBackupRestore',
    'requestLibraryIndexBackupRetentionPreview',
    'requestLibraryIndexMaintenanceHistory',
    'canRestoreIndexBackup',
  ]],
  ['src/types/electron-api.d.ts', [
    'YangKuraLibraryIndexBackupRecord',
    'YangKuraLibraryIndexBackupRestoreResult',
    'YangKuraLibraryIndexMaintenanceHistoryResult',
    'deletePerformed: false',
    'mediaFilesDeleted: false',
  ]],
  ['src/components/SettingsPage.tsx', [
    'mvp129-index-maintenance-closeout',
    'mvp129-backup-retention-preview',
    'mvp129-index-maintenance-history',
    'CONFIRM_RESTORE_LIBRARY_INDEX_BACKUP',
    '备份当前 index 并恢复所选版本',
  ]],
];
for (const [file, tokens] of checks) {
  const text = fs.readFileSync(file, 'utf8');
  for (const token of tokens) if (!text.includes(token)) throw new Error(`${file} missing ${token}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
const maintenance = fs.readFileSync('electron/libraryIndexMaintenanceService.ts', 'utf8');
if (!maintenance.includes("expectedBackupSha256") || !maintenance.includes("BACKUP_SHA_MISMATCH")) throw new Error('backup SHA verification missing');
if (!maintenance.includes("flag: 'wx'")) throw new Error('exclusive current-index backup write missing');
if (/fs\.(rm|unlink)\(/.test(maintenance)) throw new Error('runtime maintenance service must not delete files');
if (!main.includes("'yang-kura:index:backup-retention-preview-request'")) throw new Error('retention preview IPC missing');
if (main.includes("yang-kura:index:backup-delete")) throw new Error('MVP129 must not expose backup delete IPC');

const output = execFileSync(process.execPath, ['scripts/test-mvp129-index-maintenance-runtime.mjs'], { encoding: 'utf8' });
if (!output.includes('PASS')) throw new Error('MVP129 temporary library acceptance failed');
console.log('MVP129 index maintenance closeout verifier PASS');
