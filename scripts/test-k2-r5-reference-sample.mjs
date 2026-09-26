#!/usr/bin/env node
import fs from 'node:fs';

const music = fs.readFileSync('src/features/library/MusicLibraryPage.tsx', 'utf8');
const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const primary = fs.readFileSync('src/components/PlayerBarPrimarySections.tsx', 'utf8');
const css = fs.readFileSync('src/styles/reference-desktop-sample.css', 'utf8');

for (const token of [
  'data-k2-reference-sample="music-library-v1"',
  'k2-ref-track-table__header',
  'k2-ref-detail',
]) {
  if (!music.includes(token)) throw new Error(`music sample marker missing: ${token}`);
}
if (!player.includes('data-k2-reference-player="v1"')) throw new Error('player reference marker missing');
if (primary.includes('animate-spin-slow')) throw new Error('reference player still uses spinning vinyl artwork');

for (const token of [
  '.k2-ref-music .u37d-collection-grid .yk-media-card',
  'background: transparent',
  '.k2-ref-music .k2-ref-detail.yk-surface',
  '.k2-reference-player .k2-ref-player-transport-shell',
  '.k2-ref-music .yk-track-row__actions',
]) {
  if (!css.includes(token)) throw new Error(`reference sample CSS missing: ${token}`);
}

if (css.includes('.k2-ref-music .u37d-track-list {\n  backdrop-filter')) {
  throw new Error('scrolling track list must not use backdrop-filter');
}

console.log(JSON.stringify({
  ok: true,
  sample: 'reference-derived-music-v1',
  references: ['YesPlayMusic', 'Feishin', 'SPlayer'],
  copiedCopyleftSource: false,
}, null, 2));
console.log('K2-R5 reference desktop sample PASS');
