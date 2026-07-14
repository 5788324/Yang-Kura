import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const readerSource = fs.readFileSync('electron/libraryIndexJsonReader.ts', 'utf8');
const mainSource = fs.readFileSync('electron/main.ts', 'utf8');
const compiled = ts.transpileModule(readerSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const runtimeModule = { exports: {} };
vm.runInNewContext(compiled, {
  module: runtimeModule,
  exports: runtimeModule.exports,
  Buffer,
  Uint8Array,
  SyntaxError,
  Object,
  String,
});

const {
  parseLibraryIndexJsonBuffer,
  describeLibraryIndexReadError,
} = runtimeModule.exports;

const emptyIndex = {
  schemaVersion: 1,
  generatedAt: '2026-07-14T00:00:00.000Z',
  roots: [],
  collections: [],
  tracks: [],
  covers: [],
  subtitles: [],
  warnings: [],
};
const jsonText = JSON.stringify(emptyIndex);

const utf8 = parseLibraryIndexJsonBuffer(Buffer.from(jsonText, 'utf8'));
if (utf8.encoding !== 'utf8' || utf8.value.tracks.length !== 0) {
  throw new Error('普通 UTF-8 合法空 Index 读取失败。');
}

const utf8Bom = parseLibraryIndexJsonBuffer(Buffer.concat([
  Buffer.from([0xef, 0xbb, 0xbf]),
  Buffer.from(jsonText, 'utf8'),
]));
if (utf8Bom.encoding !== 'utf8-bom' || utf8Bom.value.collections.length !== 0) {
  throw new Error('UTF-8 BOM 合法空 Index 读取失败。');
}

const utf16Le = parseLibraryIndexJsonBuffer(Buffer.concat([
  Buffer.from([0xff, 0xfe]),
  Buffer.from(jsonText, 'utf16le'),
]));
if (utf16Le.encoding !== 'utf16le-bom' || utf16Le.value.roots.length !== 0) {
  throw new Error('UTF-16 LE BOM 合法空 Index 读取失败。');
}

const utf16LeBody = Buffer.from(jsonText, 'utf16le');
const utf16BeBody = Buffer.allocUnsafe(utf16LeBody.length);
for (let index = 0; index < utf16LeBody.length; index += 2) {
  utf16BeBody[index] = utf16LeBody[index + 1] ?? 0;
  utf16BeBody[index + 1] = utf16LeBody[index] ?? 0;
}
const utf16Be = parseLibraryIndexJsonBuffer(Buffer.concat([
  Buffer.from([0xfe, 0xff]),
  utf16BeBody,
]));
if (utf16Be.encoding !== 'utf16be-bom' || utf16Be.value.tracks.length !== 0) {
  throw new Error('UTF-16 BE BOM 合法空 Index 读取失败。');
}

let parseFailure;
try {
  parseLibraryIndexJsonBuffer(Buffer.from('{ broken json', 'utf8'));
} catch (error) {
  parseFailure = describeLibraryIndexReadError(error);
}
if (!parseFailure || parseFailure.status !== 'mvp24-library-index-read-parse-failed') {
  throw new Error('JSON 解析失败未被正确分类。');
}
if (parseFailure.message.includes('source stat failed') || parseFailure.code !== 'INVALID_JSON') {
  throw new Error('JSON 解析失败仍被错误描述为 source stat failed。');
}

const readFailure = describeLibraryIndexReadError(Object.assign(new Error('denied'), { code: 'EACCES' }));
if (readFailure.status !== 'mvp24-library-index-read-error' || readFailure.code !== 'EACCES') {
  throw new Error('文件读取错误码未被正确保留。');
}

const readStart = mainSource.indexOf('async function readLibraryIndex(');
const readEnd = mainSource.indexOf('function resolveSafeIndexedEntryPath(', readStart);
const readBlock = readStart >= 0 && readEnd > readStart ? mainSource.slice(readStart, readEnd) : '';
const healthStart = mainSource.indexOf('async function readValidatedIndexForHealth(');
const healthEnd = mainSource.indexOf('async function checkLibraryIndexHealth(', healthStart);
const healthBlock = healthStart >= 0 && healthEnd > healthStart ? mainSource.slice(healthStart, healthEnd) : '';

const sourceChecks = [
  mainSource.includes("from './libraryIndexJsonReader.js'"),
  readBlock.includes('parseLibraryIndexJsonBuffer(sourceBuffer)'),
  readBlock.includes('sourceBuffer.byteLength'),
  !readBlock.includes('source stat failed'),
  healthBlock.includes('parseLibraryIndexJsonBuffer(sourceBuffer)'),
];
if (sourceChecks.some((value) => !value)) {
  throw new Error('electron/main.ts 尚未完整接入 Windows-safe Index reader。');
}

console.log('PASS\tUTF-8 empty Index');
console.log('PASS\tUTF-8 BOM empty Index');
console.log('PASS\tUTF-16 LE BOM empty Index');
console.log('PASS\tUTF-16 BE BOM empty Index');
console.log('PASS\tparse failure classification');
console.log('PASS\tfilesystem failure classification');
console.log('U28 Windows index read runtime verifier passed.');
