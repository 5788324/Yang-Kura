#!/usr/bin/env node
import fs from 'node:fs';

const path = 'scripts/apply-u30-ui-fast-track.mjs';
let source = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const before = `function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(\`${'${label}'}: anchor not found\`);
  if (first !== source.lastIndexOf(before)) throw new Error(\`${'${label}'}: anchor not unique\`);
  return source.replace(before, after);
}`;
const after = `function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first >= 0) {
    if (first !== source.lastIndexOf(before)) throw new Error(\`${'${label}'}: anchor not unique\`);
    return source.replace(before, after);
  }
  const escape = (value) => [...value].map((char) => (char.charCodeAt(0) === 92 || '^$.*+?()[]{}|'.includes(char)) ? String.fromCharCode(92) + char : char).join('');
  const patternText = before.trim().split(/\\s+/).map(escape).join('\\\\s+');
  const pattern = new RegExp('[ \\t]*' + patternText);
  const matches = source.match(new RegExp(pattern.source, 'g')) ?? [];
  if (matches.length === 0) throw new Error(\`${'${label}'}: anchor not found\`);
  if (matches.length !== 1) throw new Error(\`${'${label}'}: anchor not unique\`);
  return source.replace(pattern, after.trimEnd());
}`;
if (!source.includes(before)) throw new Error('replaceOnce implementation anchor not found');
source = source.replace(before, after);
fs.writeFileSync(path, source, 'utf8');
console.log('U30 patch anchors relaxed.');
