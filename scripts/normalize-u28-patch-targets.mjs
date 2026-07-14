#!/usr/bin/env node
import fs from 'node:fs';

const targets = [
  'src/components/Dashboard.tsx',
  'electron/main.ts',
  'scripts/verify-u28-library-reconciliation.mjs',
  '.github/workflows/branch-validation.yml',
];

for (const target of targets) {
  const source = fs.readFileSync(target, 'utf8');
  fs.writeFileSync(target, source.replace(/\r\n/g, '\n'), 'utf8');
}

console.log('Normalized U28 patch target line endings to LF.');
