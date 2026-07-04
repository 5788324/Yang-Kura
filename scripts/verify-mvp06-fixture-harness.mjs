#!/usr/bin/env node
import {readFileSync, existsSync} from 'node:fs';
const failures=[]; const read=(f)=>readFileSync(f,'utf8'); const requireFile=(f)=>{if(!existsSync(f))failures.push(`missing file: ${f}`)};
for (const file of ['src/services/fixtureScannerTestHarness.ts','src/services/plannedScannerContractService.ts','src/components/DiagnosticsPage.tsx','docs/FIXTURE_SCANNER_TEST_MATRIX_MVP06.md','scripts/verify-mvp06-fixture-harness.mjs']) requireFile(file);
const harness=read('src/services/fixtureScannerTestHarness.ts');
for (const token of ['fixtureScannerTestHarness','safe-relative-path-only','duplicate-rj-diagnostic','metadata-only-diagnostic','image-only-diagnostic','required']) if(!harness.includes(token)) failures.push(`harness missing token: ${token}`);
const contract=read('src/services/plannedScannerContractService.ts');
for (const token of ['plannedScannerContractService','planned-only','ScannerRequest','ScannerResult','hardcode E:\\\\arsm','不删除']) if(!contract.includes(token)) failures.push(`planned scanner contract missing token: ${token}`);
const page=read('src/components/DiagnosticsPage.tsx');
for (const token of ['MVP-06 Fixture Scanner Test Matrix / Planned Scanner Contract','planned scanner contract','forbidden actions']) if(!page.includes(token)) failures.push(`DiagnosticsPage missing token: ${token}`);
for (const [file,tokens] of [['src/services/fixtureScannerTestHarness.ts',['node:fs','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename']],['src/services/plannedScannerContractService.ts',['node:fs','sqlite3','child_process','localStorage','new Audio','writeFile(','unlink(','rename(']]]) { const text=read(file); for(const token of tokens) if(text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`); }
if(!read('package.json').includes('verify:mvp06-fixture-harness')) failures.push('package.json missing verify:mvp06-fixture-harness');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('[Yang-Kura] MVP-06 fixture harness static verification passed.');
