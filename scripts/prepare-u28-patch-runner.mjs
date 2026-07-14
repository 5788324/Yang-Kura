import fs from 'node:fs';

const path = 'scripts/apply-u28-library-reconciliation.mjs';
let source = fs.readFileSync(path, 'utf8');
const broken = "for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}\\t${name}`);";
const fixed = "for (const [name, ok] of checks) console.log((ok ? 'PASS' : 'FAIL') + '\\\\t' + name);";
if (!source.includes(broken)) {
  throw new Error('Expected nested verifier template line was not found.');
}
source = source.replace(broken, fixed);
fs.writeFileSync(path, source, 'utf8');
console.log('U28 patch runner quoting repaired.');
