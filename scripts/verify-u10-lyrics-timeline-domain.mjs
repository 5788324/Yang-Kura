import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const domainPath = 'src/player/lyricsTimeline.ts';
const lyricsPath = 'src/components/LyricsPanel.tsx';
const domainSource = fs.readFileSync(domainPath, 'utf8');
const lyricsSource = fs.readFileSync(lyricsPath, 'utf8');

const compiled = ts.transpileModule(domainSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: domainPath,
});

const runtimeModule = { exports: {} };
const context = vm.createContext({
  module: runtimeModule,
  exports: runtimeModule.exports,
  console,
});
new vm.Script(compiled.outputText, { filename: domainPath }).runInContext(context);

const {
  parseLrcFractionalSeconds,
  parseLrcLine,
  parseLyrics,
  splitBilingualText,
  createBilingualTimeline,
  findActiveLyricIndex,
} = runtimeModule.exports;

assert.equal(parseLrcFractionalSeconds('5'), 0.5);
assert.equal(parseLrcFractionalSeconds('05'), 0.05);
assert.equal(parseLrcFractionalSeconds(undefined), 0);

assert.deepEqual(
  { ...parseLrcLine('[01:02.50] 低语开始') },
  { time: 62.5, text: '低语开始' },
);
assert.deepEqual(
  { ...parseLrcLine('没有时间戳') },
  { time: -1, text: '没有时间戳' },
);

const parsed = parseLyrics([
  '[00:01]第一句',
  '忽略这一行',
  '[00:03.250]第二句 / Second line',
]);
assert.equal(parsed.length, 2);
assert.equal(parsed[1].time, 3.25);

assert.deepEqual(
  { ...splitBilingualText('原文 / 翻译 / 补充') },
  { original: '原文', translation: '翻译 / 补充' },
);
assert.deepEqual(
  { ...splitBilingualText('只有原文') },
  { original: '只有原文', translation: '' },
);

const bilingual = createBilingualTimeline(parsed);
assert.equal(bilingual[1].original, '第二句');
assert.equal(bilingual[1].translation, 'Second line');

assert.equal(findActiveLyricIndex([], 10), -1);
assert.equal(findActiveLyricIndex(parsed, 0), 0);
assert.equal(findActiveLyricIndex(parsed, 2), 0);
assert.equal(findActiveLyricIndex(parsed, 4), 1);
assert.equal(findActiveLyricIndex(parsed, Number.NaN), 0);

for (const marker of [
  "from '../player/lyricsTimeline'",
  'parseLyrics(currentTrack?.lyrics)',
  'createBilingualTimeline(parsedLyrics)',
  'findActiveLyricIndex(parsedLyrics, progress)',
]) {
  assert.ok(lyricsSource.includes(marker), `LyricsPanel missing U10 integration marker: ${marker}`);
}

for (const forbidden of [
  'const parseLrcFractionalSeconds =',
  'const parseLrcLine =',
  "const delimiters = [' // '",
  'let activeIdx = 0;',
]) {
  assert.ok(!lyricsSource.includes(forbidden), `LyricsPanel still owns lyrics domain logic: ${forbidden}`);
}

console.log('U10 lyrics timeline domain behavior verifier PASS');
