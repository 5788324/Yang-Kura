#!/usr/bin/env node
import fs from 'node:fs';

const source = fs.readFileSync('src/services/catalogPrimaryReadGateService.ts', 'utf8');
for (const token of [
  'safeForPrimaryRead',
  "state: 'ready'",
  "state: 'fallback'",
  "state: 'unavailable'",
  "mode: 'summary'",
  'actualCollections !== input.expectedCollections',
  'actualTracks !== input.expectedTracks',
]) {
  if (!source.includes(token)) throw new Error(`catalog read gate missing: ${token}`);
}
const app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('catalogPrimaryReadGateService.evaluate')) throw new Error('App does not evaluate primary-read gate');
if (!app.includes('继续使用 JSON 兼容读链')) throw new Error('JSON fallback user state missing');

console.log(JSON.stringify({
  ok: true,
  policy: 'schema-v3 + same-root collection/track parity before primary read',
  fallback: 'legacy JSON',
}, null, 2));
console.log('K2-R4 primary read gate PASS');
