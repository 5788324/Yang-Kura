#!/usr/bin/env node
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fail = (message) => {
  console.error(`[Importer smoke] FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const safeRel = (rel) => {
  assert(typeof rel === 'string' && rel.length > 0, 'relative path must be non-empty');
  assert(!path.isAbsolute(rel), `relative path must not be absolute: ${rel}`);
  const normalized = path.normalize(rel);
  assert(!normalized.startsWith('..') && !normalized.includes(`${path.sep}..${path.sep}`), `relative path must not escape root: ${rel}`);
  return normalized;
};

const ensureParent = async (filePath) => fs.mkdir(path.dirname(filePath), { recursive: true });
const exists = async (filePath) => {
  try { await fs.stat(filePath); return true; } catch { return false; }
};
const sha1 = async (filePath) => crypto.createHash('sha1').update(await fs.readFile(filePath)).digest('hex');

async function copyOnlyItem(sourceRoot, targetRoot, sourceRel, targetRel) {
  const sourcePath = path.join(sourceRoot, safeRel(sourceRel));
  const targetPath = path.join(targetRoot, safeRel(targetRel));
  const sourceStat = await fs.stat(sourcePath);
  assert(sourceStat.isFile(), `source must be file: ${sourceRel}`);
  await ensureParent(targetPath);
  try {
    await fs.copyFile(sourcePath, targetPath, fsSync.constants.COPYFILE_EXCL);
    return { status: 'copied', sourceRel, targetRel, sizeBytes: sourceStat.size };
  } catch (error) {
    if (error?.code === 'EEXIST') return { status: 'skipped', reasonCode: 'target-exists-overwrite-disabled', sourceRel, targetRel };
    throw error;
  }
}

async function moveOnlyItem(sourceRoot, targetRoot, sourceRel, targetRel) {
  const sourcePath = path.join(sourceRoot, safeRel(sourceRel));
  const targetPath = path.join(targetRoot, safeRel(targetRel));
  const sourceStat = await fs.stat(sourcePath);
  assert(sourceStat.isFile(), `move source must be file: ${sourceRel}`);
  await ensureParent(targetPath);
  if (await exists(targetPath)) return { status: 'skipped', reasonCode: 'target-exists-overwrite-disabled', sourceRel, targetRel };
  try {
    await fs.rename(sourcePath, targetPath);
    return { status: 'moved', method: 'rename', sourceRel, targetRel, sizeBytes: sourceStat.size };
  } catch (error) {
    if (error?.code !== 'EXDEV') throw error;
    await fs.copyFile(sourcePath, targetPath, fsSync.constants.COPYFILE_EXCL);
    const targetStat = await fs.stat(targetPath);
    assert(targetStat.size === sourceStat.size, 'copy-verify-unlink size verification failed');
    await fs.unlink(sourcePath);
    return { status: 'moved', method: 'copy-verify-unlink', sourceRel, targetRel, sizeBytes: sourceStat.size };
  }
}

async function main() {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'yang-kura-importer-smoke-'));
  const sourceRoot = path.join(tempRoot, 'staging');
  const targetRoot = path.join(tempRoot, 'library');
  const logsRoot = path.join(tempRoot, 'logs');
  await fs.mkdir(sourceRoot, { recursive: true });
  await fs.mkdir(targetRoot, { recursive: true });
  await fs.mkdir(logsRoot, { recursive: true });

  const sourceFiles = {
    'RJ01588893/01_本編.mp3': 'fake mp3 bytes for smoke test\n',
    'RJ01588893/cover.jpg': 'fake cover bytes\n',
    'RJ01588893/01_本編.zh.lrc': '[00:00.00] smoke lyric\n',
    'MOVE_SAMPLE/02_移動.mp3': 'fake move bytes\n',
  };
  for (const [rel, content] of Object.entries(sourceFiles)) {
    const filePath = path.join(sourceRoot, safeRel(rel));
    await ensureParent(filePath);
    await fs.writeFile(filePath, content, 'utf8');
  }

  const indexPath = path.join(targetRoot, 'library-index.json');
  const initialIndex = {
    schemaVersion: 1,
    generatedBy: 'yang-kura-importer-smoke-test',
    collections: [],
    tracks: [],
    covers: [],
    subtitles: [],
  };
  await fs.writeFile(indexPath, JSON.stringify(initialIndex, null, 2), 'utf8');

  const copyPlan = [
    ['RJ01588893/01_本編.mp3', 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3'],
    ['RJ01588893/cover.jpg', 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg'],
    ['RJ01588893/01_本編.zh.lrc', 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc'],
  ];
  const copyResults = [];
  for (const [sourceRel, targetRel] of copyPlan) copyResults.push(await copyOnlyItem(sourceRoot, targetRoot, sourceRel, targetRel));
  assert(copyResults.every((item) => item.status === 'copied'), 'copy-only smoke should copy all initial files');
  assert(await exists(path.join(sourceRoot, 'RJ01588893/01_本編.mp3')), 'copy-only must keep source file');
  assert((await copyOnlyItem(sourceRoot, targetRoot, copyPlan[0][0], copyPlan[0][1])).status === 'skipped', 'copy-only duplicate must skip without overwrite');
  assert(await sha1(path.join(sourceRoot, copyPlan[0][0])) === await sha1(path.join(targetRoot, copyPlan[0][1])), 'copied file hash must match');

  const backupPath = path.join(targetRoot, `library-index.backup.before-smoke-${Date.now()}.json`);
  await fs.copyFile(indexPath, backupPath, fsSync.constants.COPYFILE_EXCL);
  const index = JSON.parse(await fs.readFile(indexPath, 'utf8'));
  index.collections.push({ id: 'collection-rj01588893', type: 'asmr', title: 'RJ01588893 - 雨音耳かき', trackIds: ['track-rj01588893-01'] });
  index.tracks.push({ id: 'track-rj01588893-01', collectionId: 'collection-rj01588893', title: '01_本編', relativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.mp3' });
  index.covers.push({ id: 'cover-rj01588893', collectionId: 'collection-rj01588893', relativePath: 'ASMR/RJ01588893 - 雨音耳かき/cover.jpg' });
  index.subtitles.push({ id: 'subtitle-rj01588893-zh', trackId: 'track-rj01588893-01', language: 'zh', relativePath: 'ASMR/RJ01588893 - 雨音耳かき/01_本編.zh.lrc' });
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
  const readBack = JSON.parse(await fs.readFile(indexPath, 'utf8'));
  assert(readBack.collections.length === 1 && readBack.tracks.length === 1 && readBack.covers.length === 1 && readBack.subtitles.length === 1, 'index patch write smoke must update all sections');
  assert(await exists(backupPath), 'index backup must exist before patch write');

  const moveResult = await moveOnlyItem(sourceRoot, targetRoot, 'MOVE_SAMPLE/02_移動.mp3', 'ASMR/RJ01588893 - 雨音耳かき/02_移動.mp3');
  assert(moveResult.status === 'moved', 'move-only smoke must move sample file');
  assert(!(await exists(path.join(sourceRoot, 'MOVE_SAMPLE/02_移動.mp3'))), 'move-only moved source must be gone');
  assert(await exists(path.join(targetRoot, 'ASMR/RJ01588893 - 雨音耳かき/02_移動.mp3')), 'move-only target must exist');
  const logPath = path.join(logsRoot, 'import-operation-log.jsonl');
  await fs.appendFile(logPath, JSON.stringify({ operationLogVersion: 'smoke-importer-operation-log-v1', copyResults, moveResult, absolutePathReturned: false, fileUrlReturned: false }) + '\n', 'utf8');
  const logText = await fs.readFile(logPath, 'utf8');
  assert(logText.includes('absolutePathReturned') && logText.includes('fileUrlReturned'), 'operation log smoke should include sanitized flags');

  await fs.rm(tempRoot, { recursive: true, force: true });
  console.log('[Importer smoke] PASS copy-only, index backup/patch, move-only, and operation log smoke test succeeded in temp directory only. No real media library was touched.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
