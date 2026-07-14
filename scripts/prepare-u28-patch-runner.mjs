import fs from 'node:fs';

const path = 'scripts/apply-u28-library-reconciliation.mjs';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
const lineIndex = lines.findIndex((line) => line.includes('for (const [name, ok] of checks) console.log('));
if (lineIndex < 0) {
  throw new Error('Generated verifier log line was not found.');
}
lines[lineIndex] = "for (const [name, ok] of checks) console.log((ok ? 'PASS' : 'FAIL') + '\\t' + name);";
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('U28 patch runner quoting repaired.');
