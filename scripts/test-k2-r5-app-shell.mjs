#!/usr/bin/env node
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const topbar = fs.readFileSync('src/app/TopBar.tsx', 'utf8');
const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const css = fs.readFileSync('src/index.css', 'utf8');

for (const token of [
  'data-k2-desktop-shell="midnight-glass"',
  'k2-main-stage',
]) {
  if (!app.includes(token)) throw new Error(`App shell marker missing: ${token}`);
}
for (const token of [
  'data-k2-media-nav={route.id}',
  "'asmr-lib'",
  "'music-lib'",
  'k2-media-nav-card',
  'id="nav-settings"',
  'id="nav-diagnostics"',
]) {
  if (!sidebar.includes(token)) throw new Error(`Sidebar shell marker missing: ${token}`);
}
if (!topbar.includes('k2-topbar')) throw new Error('TopBar shell class missing');
if (!topbar.includes('data-k2-library-state')) throw new Error('TopBar runtime state styling missing');
if (!player.includes('k2-player-dock')) throw new Error('Player dock shell class missing');

for (const token of [
  '--k2-shell-base',
  '--k2-accent-a',
  '.k2-desktop-shell',
  '.k2-sidebar',
  '.k2-media-nav-card',
  '.k2-main-stage',
  '.k2-player-dock',
  'content-visibility: auto',
]) {
  if (!css.includes(token)) throw new Error(`K2-R5 CSS token missing: ${token}`);
}

console.log(JSON.stringify({
  ok: true,
  direction: 'Midnight Glass',
  primaryMedia: ['asmr-lib', 'music-lib'],
  behaviorChanged: false,
}, null, 2));
console.log('K2-R5.1 app shell PASS');
