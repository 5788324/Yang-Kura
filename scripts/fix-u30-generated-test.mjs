#!/usr/bin/env node
import fs from 'node:fs';

const path = 'scripts/test-u30-ui-matrix.mjs';
let source = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const startMarker = 'async function click(cdp, selector) {';
const endMarker = 'async function pressEscape(cdp) {';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0 || end <= start) throw new Error('U30 click helper function boundary not found');
const replacement = `async function click(cdp, selector) {
  const encodedSelector = JSON.stringify(selector);
  await cdp.evaluate('(() => { const selector=' + encodedSelector + '; const element=document.querySelector(selector); if(!element) throw new Error("Missing selector: " + selector); element.click(); return true; })()');
  await delay(160);
}

`;
source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(path, source, 'utf8');
console.log('U30 generated test selector handling fixed.');
