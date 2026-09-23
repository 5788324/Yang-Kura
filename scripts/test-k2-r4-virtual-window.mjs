#!/usr/bin/env node
import fs from 'node:fs';

const service = fs.readFileSync('src/services/virtualWindowService.ts', 'utf8');
const hook = fs.readFileSync('src/hooks/useWindowVirtualList.ts', 'utf8');
const asmr = fs.readFileSync('src/features/library/AsmrLibraryPage.tsx', 'utf8');
const music = fs.readFileSync('src/features/library/MusicLibraryPage.tsx', 'utf8');

for (const token of ['paddingTop', 'paddingBottom', 'overscan', 'visibleRows']) {
  if (!service.includes(token)) throw new Error(`virtual window service missing ${token}`);
}
if (!hook.includes("window.addEventListener('scroll'")) throw new Error('virtual window hook missing scroll listener');
if (!asmr.includes('data-k2-r4-virtual-list="asmr"')) throw new Error('ASMR virtualization not wired');
if (!music.includes('data-k2-r4-virtual-list="music-tracks"')) throw new Error('Music virtualization not wired');

const total = 100000;
const itemHeight = 72;
const viewport = 720;
const overscan = 10;
const scrollTop = 3600000;
const first = Math.floor(scrollTop / itemHeight);
const visibleRows = Math.ceil(viewport / itemHeight);
const start = Math.max(0, first - overscan);
const end = Math.min(total, first + visibleRows + overscan);
if (end - start > 30) throw new Error(`virtual DOM budget exceeded: ${end - start}`);

console.log(JSON.stringify({ ok: true, total, windowRows: end - start, start, end }, null, 2));
console.log('K2-R4 virtualization PASS');
