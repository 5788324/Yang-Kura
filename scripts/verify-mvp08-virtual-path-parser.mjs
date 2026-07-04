#!/usr/bin/env node
import {readFileSync, existsSync} from 'node:fs';
const failures=[]; const read=(f)=>readFileSync(f,'utf8'); const requireFile=(f)=>{if(!existsSync(f))failures.push(`missing file: ${f}`)};
for (const file of ['src/services/virtualLibraryPathParser.ts','src/services/virtualPathParserCases.ts','docs/VIRTUAL_PATH_PARSER_MVP08.md','scripts/verify-mvp08-virtual-path-parser.mjs']) requireFile(file);
const parser=read('src/services/virtualLibraryPathParser.ts');
for (const token of ['ParsedVirtualLibraryPath','virtualLibraryPathParser','normalizedPath','discNo','trackNo','subtitleTargetStem','subtitleLanguage','isTrackCandidate','isCoverCandidate','RJ']) if(!parser.includes(token)) failures.push(`virtual parser missing token: ${token}`);
const cases=read('src/services/virtualPathParserCases.ts');
for (const token of ['virtualPathParserCaseRunner','multi-disc-bonus-track','windows-slash-normalization','cg-image-track','asmr-zh-lrc','video-asmr']) if(!cases.includes(token)) failures.push(`virtual parser cases missing token: ${token}`);
const docs=read('docs/VIRTUAL_PATH_PARSER_MVP08.md');
if(!docs.includes('MVP-08 Virtual Path Parser')) failures.push('virtual parser docs missing title');
for (const [file,tokens] of [['src/services/virtualLibraryPathParser.ts',['node:fs','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],['src/services/virtualPathParserCases.ts',['node:fs','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']]]) { const text=read(file); for(const token of tokens) if(text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`); }
if(!read('package.json').includes('verify:mvp08-virtual-path-parser')) failures.push('package.json missing verify:mvp08-virtual-path-parser');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('[Yang-Kura] MVP-08 virtual path parser static verification passed.');
