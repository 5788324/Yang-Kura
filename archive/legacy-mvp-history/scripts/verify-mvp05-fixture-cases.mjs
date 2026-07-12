#!/usr/bin/env node
import {readFileSync, existsSync} from 'node:fs';
const failures=[]; const read=(f)=>readFileSync(f,'utf8'); const requireFile=(f)=>{if(!existsSync(f))failures.push(`missing file: ${f}`)};
for (const file of ['src/services/fixtureLibrarySample.ts','src/services/fixtureLibraryScanner.ts','src/services/fixtureScannerReportService.ts','src/services/virtualLibraryPathParser.ts','docs/FIXTURE_CASES_MVP05.md','scripts/verify-mvp05-fixture-cases.mjs']) requireFile(file);
const sample=read('src/services/fixtureLibrarySample.ts');
for (const token of ['RJ00000111_重复作品A','RJ00000111_重复作品B','RJ08888888_空目录','RJ09999999_只有封面','RJ06666666_视频ASMR','RJ05555555_CG差分合集','RJ04444444_多Disc特典','Duplicate Path','Missing Cover Album']) if(!sample.includes(token)) failures.push(`fixture sample missing token: ${token}`);
const scanner=read('src/services/fixtureLibraryScanner.ts');
for (const token of ['virtualLibraryPathParser.parse','isTrackCandidate','isCoverCandidate','isSubtitleCandidate','mediaKind as LibraryTrack']) if(!scanner.includes(token)) failures.push(`fixture scanner missing parser-driven token: ${token}`);
const parser=read('src/services/virtualLibraryPathParser.ts');
for (const token of ['IMAGE_EXTENSIONS','mediaKindFor','image','video','audio','specialRole','discNo']) if(!parser.includes(token)) failures.push(`virtual parser missing fixture case token: ${token}`);
const report=read('src/services/fixtureScannerReportService.ts');
for (const token of ['imageTrackCount','collectionImageOnlyCount','collectionMetadataOnlyCount']) if(!report.includes(token)) failures.push(`fixture report missing token: ${token}`);
const page=read('src/components/DiagnosticsPage.tsx');
for (const token of ['MVP-05 Fixture Case Report','imageTrackCount','collectionImageOnlyCount','collectionMetadataOnlyCount']) if(!page.includes(token)) failures.push(`DiagnosticsPage missing token: ${token}`);
if(!read('package.json').includes('verify:mvp05-fixture-cases')) failures.push('package.json missing verify:mvp05-fixture-cases');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('[Yang-Kura] MVP-05 parser-driven fixture cases static verification passed.');
