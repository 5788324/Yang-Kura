#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures=[]; const read=(f)=>readFileSync(f,'utf8'); const requireFile=(f)=>{if(!existsSync(f))failures.push(`missing file: ${f}`)};
for (const file of ['src/components/DiagnosticsPage.tsx','docs/FIXTURE_REPORT_UI.md','scripts/verify-mvp04-fixture-report-ui.mjs']) requireFile(file);
const page=read('src/components/DiagnosticsPage.tsx');
for (const token of ['fixtureLibraryScanner','fixtureLibrarySampleEntries','fixtureScannerReportService','MVP-05 Fixture Case Report','summary','diagnostics','duplicate','nextActions']) if(!page.includes(token)) failures.push(`DiagnosticsPage missing token: ${token}`);
for (const token of ['node:fs','from \'electron\'','require(\'electron\')','sqlite3','child_process','new Audio','writeFile','unlink']) if(page.includes(token)) failures.push(`DiagnosticsPage contains forbidden token: ${token}`);
const docs=read('docs/FIXTURE_REPORT_UI.md');
if(!docs.includes('Fixture Report UI')) failures.push('FIXTURE_REPORT_UI docs missing title');
if(!read('package.json').includes('verify:mvp04-fixture-report-ui')) failures.push('package.json missing verify:mvp04-fixture-report-ui');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('[Yang-Kura] MVP-04 fixture report UI static verification passed.');
