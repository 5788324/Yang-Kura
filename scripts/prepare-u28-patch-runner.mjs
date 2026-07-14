import fs from 'node:fs';

const path = 'scripts/apply-u28-library-reconciliation.mjs';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
const logLineIndex = lines.findIndex((line) => line.includes('for (const [name, ok] of checks) console.log('));
if (logLineIndex < 0) {
  throw new Error('Generated verifier log line was not found.');
}
lines[logLineIndex] = "for (const [name, ok] of checks) console.log((ok ? 'PASS' : 'FAIL') + '\\t' + name);";
const readLineIndex = lines.findIndex((line) => line.includes("const read = (path) => fs.readFileSync(path, 'utf8')"));
if (readLineIndex < 0) {
  throw new Error('Patch runner read helper was not found.');
}
lines[readLineIndex] = "const read = (path) => fs.readFileSync(path, 'utf8').replace(/\\r\\n/g, '\\n');";
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('U28 patch runner quoting and Windows line endings repaired.');
