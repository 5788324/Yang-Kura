#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures=[]; const read=(f)=>readFileSync(f,'utf8'); const requireFile=(f)=>{if(!existsSync(f))failures.push(`missing file: ${f}`)};
for (const file of ['src/services/fixtureScannerReportService.ts','docs/FIXTURE_SCANNER_REPORT.md','scripts/verify-mvp03-fixture-report.mjs']) requireFile(file);
const service=read('src/services/fixtureScannerReportService.ts');
for (const token of ['fixtureScannerReportService','FixtureScannerReport','duplicateRjGroups','duplicateTrackPathGroups','collectionMissingCoverCount','audioTrackMissingSubtitleCount','collectionNoAudioCount','reportVersion']) if(!service.includes(token)) failures.push(`report service missing token: ${token}`);
const docs=read('docs/FIXTURE_SCANNER_REPORT.md');
for (const token of ['Fixture Scanner Report','duplicate','missing cover','No real filesystem']) if(!docs.toLowerCase().includes(token.toLowerCase())) failures.push(`report docs missing token: ${token}`);
for (const token of ['node:fs','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename']) if(service.includes(token)) failures.push(`report service contains forbidden token: ${token}`);
if(!read('package.json').includes('verify:mvp03-fixture-report')) failures.push('package.json missing verify:mvp03-fixture-report');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('[Yang-Kura] MVP-03 fixture report static verification passed.');
