#!/usr/bin/env node
import {readFileSync, existsSync} from 'node:fs';
const failures=[]; const read=(f)=>readFileSync(f,'utf8'); const requireFile=(f)=>{if(!existsSync(f))failures.push(`missing file: ${f}`)};
for (const file of ['src/services/scannerContractUiFlowService.ts','src/components/SettingsPage.tsx','docs/SCANNER_CONTRACT_UI_FLOW_MVP07.md','scripts/verify-mvp07-scanner-ui-flow.mjs']) requireFile(file);
const service=read('src/services/scannerContractUiFlowService.ts');
for (const token of ['scannerContractUiFlowService','demo-only','dry-run-preview','write-index-confirm','maxEntries','maxDepth','followSymlinks','includeHidden']) if(!service.includes(token)) failures.push(`scanner UI flow service missing token: ${token}`);
const page=read('src/components/SettingsPage.tsx');
for (const token of ['MVP-07 Scanner Contract UI Flow','扫描前安全流程','Dry-run 安全限制','扫描前安全确认 Checklist','scannerContractUiFlowService.getFlow','Scanner UI Gate']) if(!page.includes(token)) failures.push(`SettingsPage missing token: ${token}`);
const docs=read('docs/SCANNER_CONTRACT_UI_FLOW_MVP07.md');
for (const token of ['MVP-07 Scanner Contract UI Flow','阶段 1：保存 Demo 路径','阶段 2：未来 dry-run scan preview','阶段 3：未来 write-index 二次确认','扫描前安全 Checklist']) if(!docs.includes(token)) failures.push(`docs missing token: ${token}`);
for (const [file,tokens] of [['src/services/scannerContractUiFlowService.ts',['node:fs','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],['src/components/SettingsPage.tsx',['node:fs','sqlite3','child_process','new Audio','writeFile','unlink','rename','readdir','statSync']]]) { const text=read(file); for(const token of tokens) if(text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`); }
if(!read('package.json').includes('verify:mvp07-scanner-ui-flow')) failures.push('package.json missing verify:mvp07-scanner-ui-flow');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('[Yang-Kura] MVP-07 scanner UI flow static verification passed.');
