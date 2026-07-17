#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('src/styles/empty-state-truthfulness.css', 'utf8');
const main = fs.readFileSync('src/main.tsx', 'utf8');
const u32 = fs.readFileSync('scripts/test-u32-ui-audit.mjs', 'utf8');

assert.match(main, /empty-state-truthfulness\.css/);
assert.match(css, /data-library-page="music"/);
assert.match(css, /data-u37a-library-page\$="delegated"/);
assert.match(css, /\.u37d-metadata-tools\s*\{[\s\S]*display:\s*none/);
assert.match(css, /#mvp86-import-source-options::before/);
assert.match(css, /尚未选择导入来源/);
assert.match(css, /当前没有扫描结果/);
assert.match(css, /article \.min-w-0 > p\.mt-1\s*\{[\s\S]*display:\s*none/);
assert.match(css, /RJ \/ ASMR 音轨/);
assert.match(css, /同一专辑或艺术家/);
assert.match(css, /零散音频或需要人工确认/);
assert.match(u32, /capturePage\(cdp, 'music-lib'/);
assert.match(u32, /capturePage\(cdp, 'importer'/);
assert.match(u32, /mvp112-importer-primary-flow/);

console.log('U39-E empty-state truthfulness verifier PASS');
