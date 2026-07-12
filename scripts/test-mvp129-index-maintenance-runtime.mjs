import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  appendMaintenanceHistory,
  buildLibraryIndexBackupRetentionPreview,
  inspectLibraryIndexBackups,
  readMaintenanceHistory,
  restoreLibraryIndexFromBackup,
} from '../dist-electron/libraryIndexMaintenanceService.js';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yang-kura-mvp129-'));
const historyPath = path.join(root, 'history.jsonl');
const mediaPath = path.join(root, 'keep.mp3');
const validator = (value) => {
  if (!value || typeof value !== 'object' || value.schemaVersion !== 1 || !Array.isArray(value.collections) || !Array.isArray(value.tracks)) {
    return { ok: false, message: 'invalid fixture index' };
  }
  return { ok: true, summary: { collectionCount: value.collections.length, trackCount: value.tracks.length } };
};

try {
  await fs.writeFile(mediaPath, 'media-must-remain', 'utf8');
  const current = { schemaVersion: 1, collections: [{ id: 'current' }], tracks: [{ id: 'current-track' }], covers: [], subtitles: [] };
  const oldBackup = { schemaVersion: 1, collections: [{ id: 'old' }], tracks: [{ id: 'old-track' }], covers: [], subtitles: [] };
  const recentBackup = { schemaVersion: 1, collections: [{ id: 'recent' }], tracks: [{ id: 'recent-track' }], covers: [], subtitles: [] };
  const currentText = `${JSON.stringify(current, null, 2)}\n`;
  const oldText = `${JSON.stringify(oldBackup, null, 2)}\n`;
  const recentText = `${JSON.stringify(recentBackup, null, 2)}\n`;
  const oldName = 'library-index.backup.before-mvp128-2026-01-01T00-00-00-000Z.json';
  const recentName = 'library-index.backup.before-mvp128-2026-07-11T00-00-00-000Z.json';
  await fs.writeFile(path.join(root, 'library-index.json'), currentText, 'utf8');
  await fs.writeFile(path.join(root, oldName), oldText, 'utf8');
  await fs.writeFile(path.join(root, recentName), recentText, 'utf8');
  await fs.utimes(path.join(root, oldName), new Date('2026-01-01T00:00:00Z'), new Date('2026-01-01T00:00:00Z'));
  await fs.utimes(path.join(root, recentName), new Date('2026-07-11T00:00:00Z'), new Date('2026-07-11T00:00:00Z'));

  const backups = await inspectLibraryIndexBackups(root, validator, 100);
  if (backups.length !== 2 || backups.some((item) => !item.valid)) throw new Error('backup inspection failed');
  const preview = buildLibraryIndexBackupRetentionPreview(backups, { maxAgeDays: 90, keepNewest: 1, nowMs: Date.parse('2026-07-12T00:00:00Z') });
  if (preview.deletePerformed !== false || preview.candidateCount !== 1 || preview.candidates[0]?.fileName !== oldName) throw new Error('retention preview failed');

  const oldSha = crypto.createHash('sha256').update(oldText).digest('hex');
  const restored = await restoreLibraryIndexFromBackup({
    rootAbsolutePath: root,
    backupRelativePath: oldName,
    expectedBackupSha256: oldSha,
    validateIndex: validator,
    restoredAt: '2026-07-12T01:02:03.000Z',
  });
  const restoredIndex = JSON.parse(await fs.readFile(path.join(root, 'library-index.json'), 'utf8'));
  if (restoredIndex.collections[0]?.id !== 'old') throw new Error('backup restore did not replace index');
  if (!restored.currentBackupRelativePath?.startsWith('library-index.backup.before-mvp129-restore-')) throw new Error('current index backup missing');
  if ((await fs.readFile(mediaPath, 'utf8')) !== 'media-must-remain') throw new Error('media file was modified');

  await appendMaintenanceHistory(historyPath, {
    historyVersion: 'mvp129-index-maintenance-history-v1',
    id: 'entry-1',
    rootFingerprint: 'fixture-root',
    displayName: '临时资源库',
    libraryType: 'asmr',
    action: 'backup-restore',
    status: 'complete',
    occurredAt: restored.restoredAt,
    resultSha256: restored.resultSha256,
    restoredBackupRelativePath: oldName,
    message: 'fixture restore complete',
    mediaFilesDeleted: false,
    absolutePathsStored: false,
  });
  const history = await readMaintenanceHistory(historyPath, 'fixture-root', 10);
  if (history.length !== 1 || history[0].absolutePathsStored !== false || 'rootFingerprint' in history[0]) throw new Error('maintenance history sanitization failed');

  console.log('MVP129 temporary library maintenance acceptance PASS');
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
