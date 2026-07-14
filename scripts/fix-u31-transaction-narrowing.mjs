#!/usr/bin/env node
import fs from 'node:fs';

const file = 'electron/importerTransactionService.ts';
let source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const replacements = [
  ['if (!source.ok || !target.ok) {', 'if (source.ok === false || target.ok === false) {'],
  ['reasonCode: !source.ok ? source.code : (target as { ok: false; code: string }).code', 'reasonCode: source.ok === false ? source.code : (target as { ok: false; code: string }).code'],
  ['message: !source.ok ? source.message : (target as { ok: false; message: string }).message', 'message: source.ok === false ? source.message : (target as { ok: false; message: string }).message'],
  ['if (!source.ok) {', 'if (source.ok === false) {'],
  ['if (!target.ok) {', 'if (target.ok === false) {'],
];
for (const [before, after] of replacements) source = source.split(before).join(after);
fs.writeFileSync(file, source, 'utf8');
console.log('U31 discriminated union checks normalized.');
