#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { performance } from 'node:perf_hooks';

const AUDIO = new Set(['.mp3','.flac','.wav','.m4a','.aac','.ogg','.opus','.wma','.ape','.alac','.m4b','.aiff','.aif','.dsf','.dff']);
const SUBTITLE = new Set(['.lrc','.srt','.vtt','.ass','.ssa','.ttml']);
const IMAGE = new Set(['.jpg','.jpeg','.png','.webp','.gif','.bmp','.avif','.heic','.heif']);
const VIDEO = new Set(['.mp4','.mkv','.webm','.avi','.mov','.m4v','.wmv']);
const TEXT = new Set(['.txt','.md','.html','.htm','.nfo','.json']);
const DOCUMENT = new Set(['.pdf','.epub','.cbz','.cbr']);
const ARCHIVE = new Set(['.zip','.7z','.rar','.tar','.gz','.bz2']);

function parseArgs(argv) {
  const result = { root: '', out: '', progress: 5000, maxErrors: 50, withSize: true };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--') && !result.root) result.root = value;
    else if (value === '--root') result.root = argv[++index] ?? '';
    else if (value === '--out') result.out = argv[++index] ?? '';
    else if (value === '--progress') result.progress = Math.max(0, Number(argv[++index] ?? 5000) || 0);
    else if (value === '--max-errors') result.maxErrors = Math.max(0, Number(argv[++index] ?? 50) || 0);
    else if (value === '--no-size') result.withSize = false;
    else if (value === '--help' || value === '-h') result.help = true;
  }
  return result;
}

function classify(extension) {
  if (AUDIO.has(extension)) return 'audio';
  if (SUBTITLE.has(extension)) return 'subtitle';
  if (IMAGE.has(extension)) return 'image';
  if (VIDEO.has(extension)) return 'video';
  if (TEXT.has(extension)) return 'text';
  if (DOCUMENT.has(extension)) return 'document';
  if (ARCHIVE.has(extension)) return 'archive';
  return 'other';
}

function pushLargest(list, item, limit = 20) {
  list.push(item);
  list.sort((left, right) => right.sizeBytes - left.sizeBytes);
  if (list.length > limit) list.length = limit;
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return 'n/a';
  const units = ['B','KiB','MiB','GiB','TiB','PiB'];
  let current = value;
  let unit = 0;
  while (current >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }
  return `${current.toFixed(unit >= 3 ? 2 : 1)} ${units[unit]}`;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.root) {
  console.log('Usage: npm run audit:k2-r1-library -- --root "E:\\arsm" [--out report.json] [--progress 5000] [--no-size]');
  process.exit(args.help ? 0 : 2);
}

const root = path.resolve(args.root);
const rootStat = await fs.stat(root);
if (!rootStat.isDirectory()) {
  throw new Error('Audit root must be a directory.');
}

const startedAt = new Date().toISOString();
const start = performance.now();
const stack = [{ absolutePath: root, relativePath: '', depth: 0 }];
const extensionCounts = new Map();
const categoryCounts = new Map();
const categoryBytes = new Map();
const largestFiles = [];
const errors = [];
let directoryCount = 0;
let fileCount = 0;
let symlinkCount = 0;
let totalBytes = 0;
let maxDepth = 0;
let maxDirectoryEntries = 0;
let maxDirectoryEntryPath = '';

function recordError(relativePath, error) {
  if (errors.length >= args.maxErrors) return;
  errors.push({
    relativePath: relativePath || '.',
    code: error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN',
    message: error instanceof Error ? error.message : String(error),
  });
}

while (stack.length) {
  const current = stack.pop();
  if (!current) break;
  directoryCount += 1;
  maxDepth = Math.max(maxDepth, current.depth);

  let entries;
  try {
    entries = await fs.readdir(current.absolutePath, { withFileTypes: true });
  } catch (error) {
    recordError(current.relativePath, error);
    continue;
  }

  if (entries.length > maxDirectoryEntries) {
    maxDirectoryEntries = entries.length;
    maxDirectoryEntryPath = current.relativePath || '.';
  }

  const files = [];
  for (const entry of entries) {
    const relativePath = current.relativePath ? path.join(current.relativePath, entry.name) : entry.name;
    const absolutePath = path.join(current.absolutePath, entry.name);
    if (entry.isSymbolicLink()) {
      symlinkCount += 1;
      continue;
    }
    if (entry.isDirectory()) {
      stack.push({ absolutePath, relativePath, depth: current.depth + 1 });
      continue;
    }
    if (entry.isFile()) files.push({ absolutePath, relativePath, name: entry.name });
  }

  for (let offset = 0; offset < files.length; offset += 32) {
    const batch = files.slice(offset, offset + 32);
    const details = await Promise.all(batch.map(async (file) => {
      if (!args.withSize) return { ...file, sizeBytes: 0 };
      try {
        const stat = await fs.stat(file.absolutePath);
        return { ...file, sizeBytes: stat.size };
      } catch (error) {
        recordError(file.relativePath, error);
        return { ...file, sizeBytes: 0 };
      }
    }));

    for (const file of details) {
      fileCount += 1;
      const extension = path.extname(file.name).toLowerCase() || '<none>';
      const category = classify(extension);
      extensionCounts.set(extension, (extensionCounts.get(extension) ?? 0) + 1);
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      categoryBytes.set(category, (categoryBytes.get(category) ?? 0) + file.sizeBytes);
      totalBytes += file.sizeBytes;
      if (args.withSize && file.sizeBytes > 0) {
        pushLargest(largestFiles, { relativePath: file.relativePath, sizeBytes: file.sizeBytes });
      }
      if (args.progress > 0 && fileCount % args.progress === 0) {
        process.stderr.write(`[k2-r1-audit] files=${fileCount} dirs=${directoryCount} size=${formatBytes(totalBytes)} elapsed=${((performance.now()-start)/1000).toFixed(1)}s\n`);
      }
    }
  }
}

const durationMs = Math.round(performance.now() - start);
const byExtension = [...extensionCounts.entries()]
  .map(([extension, count]) => ({ extension, count }))
  .sort((left, right) => right.count - left.count || left.extension.localeCompare(right.extension));

const categories = [...categoryCounts.keys()]
  .map((category) => ({
    category,
    count: categoryCounts.get(category) ?? 0,
    bytes: args.withSize ? categoryBytes.get(category) ?? 0 : null,
  }))
  .sort((left, right) => right.count - left.count);

const report = {
  schemaVersion: 1,
  auditKind: 'k2-r1-readonly-library-inventory',
  readOnly: true,
  followedSymlinks: false,
  mediaMutationPerformed: false,
  startedAt,
  finishedAt: new Date().toISOString(),
  durationMs,
  root: {
    displayName: path.basename(root) || root,
    absolutePathIncluded: false,
  },
  options: {
    withSize: args.withSize,
    progressEveryFiles: args.progress,
    maxRecordedErrors: args.maxErrors,
  },
  summary: {
    directories: directoryCount,
    files: fileCount,
    symlinksSkipped: symlinkCount,
    totalBytes: args.withSize ? totalBytes : null,
    maxDepth,
    maxDirectoryEntries,
    maxDirectoryEntryPath,
    errorCount: errors.length,
  },
  categories,
  topExtensions: byExtension.slice(0, 100),
  largestFiles: args.withSize ? largestFiles : [],
  errors,
  safetyNotes: [
    'read-only filesystem traversal',
    'file contents are never opened',
    'symbolic links and junction-like symlinks are not followed',
    'no media file is created, deleted, moved, renamed, or overwritten',
    'absolute root path is not written into the report',
  ],
};

const output = JSON.stringify(report, null, 2) + '\n';
if (args.out) {
  const target = path.resolve(args.out);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, output, 'utf8');
  console.log(`[k2-r1-audit] report=${target}`);
}
console.log(output);
