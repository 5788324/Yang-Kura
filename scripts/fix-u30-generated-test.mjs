#!/usr/bin/env node
import fs from 'node:fs';

const path = 'scripts/test-u30-ui-matrix.mjs';
let source = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const before = `async function click(cdp, selector) {
  await cdp.evaluate('(() => { const element=document.querySelector(' + JSON.stringify(selector) + '); if(!element) throw new Error("Missing selector: ' + selector.replace(/"/g, '\\\\"') + '"); element.click(); return true; })()');
  await delay(160);
}`;
const after = `async function click(cdp, selector) {
  const encodedSelector = JSON.stringify(selector);
  await cdp.evaluate('(() => { const selector=' + encodedSelector + '; const element=document.querySelector(selector); if(!element) throw new Error("Missing selector: " + selector); element.click(); return true; })()');
  await delay(160);
}`;
if (!source.includes(before)) throw new Error('U30 click helper anchor not found');
source = source.replace(before, after);
fs.writeFileSync(path, source, 'utf8');
console.log('U30 generated test selector handling fixed.');
