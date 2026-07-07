#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures = [];
const read = (file) => readFileSync(file, 'utf8');
const requireFile = (file) => { if (!existsSync(file)) failures.push(`missing file: ${file}`); };

for (const file of [
  'src/services/fixtureLibraryScanner.ts',
  'src/services/virtualLibraryPathParser.ts',
  'docs/PARSER_DRIVEN_FIXTURE_SCANNER_MVP09.md',
  'scripts/verify-mvp09-parser-driven-scanner.mjs',
]) requireFile(file);

const scanner = read('src/services/fixtureLibraryScanner.ts');
const parser = read('src/services/virtualLibraryPathParser.ts');
const pkg = read('package.json');

for (const token of [
  'virtualLibraryPathParser.parse',
  'ParsedFixtureEntry',
  'parsed.isTrackCandidate',
  'parsed.isCoverCandidate',
  'parsed.isSubtitleCandidate',
  'parsed.subtitleTargetStem',
  'collectionType: firstParsed?.collectionType',
  'parsed.discNo',
  'parsed.trackNo',
  'parsed.specialRole',
  'MVP-09 fixture scanner',
]) {
  if (!scanner.includes(token)) failures.push(`fixture scanner missing MVP-09 token: ${token}`);
}

for (const removedToken of [
  'const AUDIO_EXTENSIONS',
  'const VIDEO_EXTENSIONS',
  'const IMAGE_EXTENSIONS',
  'const SUBTITLE_EXTENSIONS',
  'const COVER_BASENAMES',
  'const detectRjId',
  'const trackKindFromExtension',
  'const collectionTypeFor',
  'const subtitleLanguage',
  'const subtitleKeyCandidates',
]) {
  if (scanner.includes(removedToken)) failures.push(`fixture scanner still owns parser logic: ${removedToken}`);
}

for (const parserToken of [
  'const AUDIO_EXTENSIONS',
  'const VIDEO_EXTENSIONS',
  'const IMAGE_EXTENSIONS',
  'const SUBTITLE_EXTENSIONS',
  'const COVER_BASENAMES',
  'const detectRjId',
  'collectionTypeFor',
  'mediaKindFor',
  'subtitleLanguageOf',
]) {
  if (!parser.includes(parserToken)) failures.push(`virtual parser missing centralized logic: ${parserToken}`);
}

for (const token of ['verify:mvp09-parser-driven-scanner']) {
  if (!pkg.includes(token)) failures.push(`package.json missing token: ${token}`);
}


if (!pkg.includes('0.64.0-mvp26') && !pkg.includes('0.48.0-mvp09') && !pkg.includes('0.49.0-mvp10') && !pkg.includes('0.50.0-mvp11') && !pkg.includes('0.51.0-mvp12') && !pkg.includes('0.52.0-mvp13') && !pkg.includes('0.53.0-mvp14') && !pkg.includes('0.54.0-mvp15') && !pkg.includes('0.55.0-mvp16') && !pkg.includes('0.56.0-mvp17') && !pkg.includes('0.57.0-mvp18') && !pkg.includes('0.58.0-mvp19') && !pkg.includes('0.60.0-mvp22') && !pkg.includes('0.61.0-mvp23') && !packageJson.includes('0.67.0-mvp29') && !packageJson.includes('0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31')) failures.push('package.json missing supported MVP-09+ version token');

const docs = read('docs/PARSER_DRIVEN_FIXTURE_SCANNER_MVP09.md');
for (const token of ['MVP-09 Parser-Driven Fixture Scanner','fixtureLibraryScanner','virtualLibraryPathParser','No real filesystem','No `library-index.json` writes']) {
  if (!docs.includes(token)) failures.push(`MVP-09 docs missing token: ${token}`);
}

for (const [file, tokens] of [
  ['src/services/fixtureLibraryScanner.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],
  ['src/services/virtualLibraryPathParser.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],
]) {
  const text = read(file);
  for (const token of tokens) if (text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`);
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('[Yang-Kura] MVP-09 parser-driven fixture scanner static verification passed.');
