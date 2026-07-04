#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures = [];
const read = (file) => readFileSync(file, 'utf8');
const requireFile = (file) => { if (!existsSync(file)) failures.push(`missing file: ${file}`); };
for (const file of [
  'src/services/fixtureLibraryScanner.ts',
  'src/services/fixtureLibrarySample.ts',
  'tests/fixtures/library_sample/README.md',
  'docs/FIXTURE_SCANNER_PLAN.md',
  'scripts/verify-mvp02-fixture-scanner.mjs',
]) requireFile(file);
const scanner = read('src/services/fixtureLibraryScanner.ts');
for (const token of ['fixtureLibraryScanner','scanVirtualEntries','AUDIO_EXTENSIONS','SUBTITLE_EXTENSIONS','detectRjId','sourceKind: \'fixture\'']) {
  if (!scanner.includes(token)) failures.push(`fixtureLibraryScanner missing token: ${token}`);
}
const sample = read('src/services/fixtureLibrarySample.ts');
for (const token of ['fixtureLibrarySampleEntries','RJ01234567_雨音耳かき','Aimer - Walpurgis','Singles 中文 空格','RJ06666666_视频ASMR']) {
  if (!sample.includes(token)) failures.push(`fixtureLibrarySample missing token: ${token}`);
}
const docs = read('docs/FIXTURE_SCANNER_PLAN.md');
for (const token of ['sourceKind: "fixture"','No `fs` / `node:fs`','No real `E:']) {
  if (!docs.includes(token)) failures.push(`FIXTURE_SCANNER_PLAN missing token: ${token}`);
}
for (const [file, tokens] of [
  ['src/services/fixtureLibraryScanner.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio(','writeFile','unlink','rename']],
  ['src/services/fixtureLibrarySample.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio(']],
]) {
  const text = read(file);
  for (const token of tokens) if (text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`);
}
const pkg = read('package.json');
if (!pkg.includes('verify:mvp02-fixture-scanner')) failures.push('package.json missing verify:mvp02-fixture-scanner');
if (pkg.includes('tsx ')) failures.push('package.json should not invoke tsx');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('[Yang-Kura] MVP-02 fixture scanner static verification passed.');
