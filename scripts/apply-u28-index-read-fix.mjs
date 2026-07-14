import fs from 'node:fs';

const mainPath = 'electron/main.ts';
let source = fs.readFileSync(mainPath, 'utf8');

const importAnchor = "import { appendMaintenanceHistory, buildLibraryIndexBackupRetentionPreview, inspectLibraryIndexBackups, readMaintenanceHistory, restoreLibraryIndexFromBackup, type MaintenanceHistoryEntry } from './libraryIndexMaintenanceService.js';";
const readerImport = "import { describeLibraryIndexReadError, parseLibraryIndexJsonBuffer } from './libraryIndexJsonReader.js';";
if (!source.includes(readerImport)) {
  if (!source.includes(importAnchor)) throw new Error('U28 reader import anchor not found.');
  source = source.replace(importAnchor, `${importAnchor}\n${readerImport}`);
}

const readStart = source.indexOf('async function readLibraryIndex(');
const readEndToken = 'function resolveSafeIndexedEntryPath(';
const readEnd = source.indexOf(readEndToken, readStart);
if (readStart < 0 || readEnd < 0) throw new Error('readLibraryIndex function boundary not found.');

const readReplacement = `async function readLibraryIndex(rootRecord: TokenizedRootRecord, _request: ReadLibraryIndexRequest) {
  const readAt = new Date().toISOString();
  const indexRelativePath = 'library-index.json';
  const indexPath = path.join(rootRecord.absolutePath, indexRelativePath);

  if (!(await pathExists(indexPath))) {
    return {
      ok: false,
      status: 'mvp24-library-index-read-missing-file',
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexRelativePath,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: '未找到 library-index.json。请先完成 dry-run、生成预览并确认写入 index。',
      safetyNotes: buildSafetyNotes(),
    } as const;
  }

  try {
    const sourceBuffer = await fs.readFile(indexPath);
    const parsedSource = parseLibraryIndexJsonBuffer(sourceBuffer);
    const sha256 = crypto.createHash('sha256').update(sourceBuffer).digest('hex');
    const parsed = parsedSource.value;
    const validation = validateWrittenIndexShape(parsed);
    if (validation.ok === false) {
      return {
        ok: false,
        status: 'mvp24-library-index-read-verify-failed',
        rootPathToken: rootRecord.rootPathToken,
        displayName: rootRecord.displayName,
        libraryType: rootRecord.libraryType,
        indexRelativePath,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: \`library-index.json 读取成功，但结构校验失败：\${validation.message}\`,
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    const indexPayload = parsed as any;
    const serialized = JSON.stringify(indexPayload);
    if (serialized.includes('file://')) {
      return {
        ok: false,
        status: 'mvp24-library-index-read-unsafe-content',
        rootPathToken: rootRecord.rootPathToken,
        displayName: rootRecord.displayName,
        libraryType: rootRecord.libraryType,
        indexRelativePath,
        absolutePathsReturned: false,
        fileUrlReturned: false,
        message: 'library-index.json 中包含 file://，已拒绝返回给 Renderer。',
        safetyNotes: buildSafetyNotes(),
      } as const;
    }

    return {
      ok: true,
      status: 'mvp24-library-index-read-complete',
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexReadAllowed: true,
      indexReadPerformed: true,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      readAt,
      indexRelativePath,
      bytesRead: sourceBuffer.byteLength,
      sha256,
      summary: validation.summary,
      index: indexPayload,
      message: \`library-index.json 已读取并通过结构校验；文件编码：\${parsedSource.encoding}。Renderer 只收到 tokenized index，不包含 absolutePath / file://。\`,
      safetyNotes: buildSafetyNotes(),
    } as const;
  } catch (error) {
    const failure = describeLibraryIndexReadError(error);
    return {
      ok: false,
      status: failure.status,
      rootPathToken: rootRecord.rootPathToken,
      displayName: rootRecord.displayName,
      libraryType: rootRecord.libraryType,
      indexRelativePath,
      absolutePathsReturned: false,
      fileUrlReturned: false,
      message: failure.message,
      safetyNotes: buildSafetyNotes(),
    } as const;
  }
}`;
source = source.slice(0, readStart) + readReplacement + '\n\n\n' + source.slice(readEnd);

const healthStart = source.indexOf('async function readValidatedIndexForHealth(');
const healthEndToken = 'async function checkLibraryIndexHealth(';
const healthEnd = source.indexOf(healthEndToken, healthStart);
if (healthStart < 0 || healthEnd < 0) throw new Error('readValidatedIndexForHealth function boundary not found.');

const healthReplacement = `async function readValidatedIndexForHealth(rootRecord: TokenizedRootRecord) {
  const indexPath = path.join(rootRecord.absolutePath, 'library-index.json');
  if (!(await pathExists(indexPath))) return { ok: false as const, status: 'mvp127-index-health-missing-index' as const, message: '未找到 library-index.json。请先读取或重新扫描资源库。' };
  try {
    const sourceBuffer = await fs.readFile(indexPath);
    const parsedSource = parseLibraryIndexJsonBuffer(sourceBuffer);
    const parsed = parsedSource.value;
    const validation = validateWrittenIndexShape(parsed);
    if (validation.ok === false) return { ok: false as const, status: 'mvp127-index-health-invalid-index' as const, message: \`library-index.json 结构校验失败：\${validation.message}\` };
    if (parsedSource.text.includes('file://')) return { ok: false as const, status: 'mvp127-index-health-unsafe-index' as const, message: 'library-index.json 包含不安全的 file:// 内容。' };
    return {
      ok: true as const,
      index: parsed,
      indexSha256: crypto.createHash('sha256').update(sourceBuffer).digest('hex'),
      bytesRead: sourceBuffer.byteLength,
      encoding: parsedSource.encoding,
    };
  } catch (error) {
    const failure = describeLibraryIndexReadError(error);
    return { ok: false as const, status: 'mvp127-index-health-read-error' as const, message: failure.message };
  }
}`;
source = source.slice(0, healthStart) + healthReplacement + '\n\n' + source.slice(healthEnd);

fs.writeFileSync(mainPath, source, 'utf8');
console.log('U28 Windows index read fix applied.');
