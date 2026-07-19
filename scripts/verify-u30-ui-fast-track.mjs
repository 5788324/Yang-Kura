#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const topBar = fs.readFileSync('src/app/TopBar.tsx', 'utf8');
const queueDrawer = fs.readFileSync('src/app/QueueDrawer.tsx', 'utf8');
const overlayHost = fs.readFileSync('src/app/PlayerOverlayHost.tsx', 'utf8');
const css = fs.readFileSync('src/index.css', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const primary = fs.readFileSync('src/components/PlayerBarPrimarySections.tsx', 'utf8');
const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/branch-validation.yml', 'utf8');

for (const [label, ok] of [
  ['modern queue suppresses legacy resume toast', app.includes('if (playerQueuePersistenceService.load()) return;') && overlayHost.includes('id="legacy-resume-toast"')],
  ['queue supports Escape and focus return', queueDrawer.includes('handleEscape') && queueDrawer.includes("getElementById('player-queue-toggle')")],
  ['queue toggle has stable id', primary.includes('id="player-queue-toggle"')],
  ['queue drawer is an accessible dialog', queueDrawer.includes('role="dialog"') && queueDrawer.includes('aria-modal="true"') && queueDrawer.includes('aria-label="当前播放队列"')],
  ['minimum-window responsive classes exist', sidebar.includes('w-52 xl:w-56') && player.includes('u30-player-track') && primary.includes('u30-player-transport') && auxiliary.includes('u30-player-aux')],
  ['release sidebar hides engineering routes', sidebar.includes('<div hidden aria-hidden="true">') && sidebar.includes('id="nav-diagnostics"') && sidebar.includes('id="nav-downloader"')],
  ['reduced motion contract exists', css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('animation-duration: 0.01ms !important')],
  ['compact player contract exists', css.includes('#app-player-bar .u30-player-time') && css.includes('#windows-app-bar .u30-runtime-label') && topBar.includes('id="windows-app-bar"')],
  ['App composes extracted shell UI', app.includes('<TopBar') && app.includes('<QueueDrawer') && app.includes('<PlayerOverlayHost')],
  ['U30 UI matrix command exists', pkg.scripts?.['test:u30:ui-matrix'] === 'node scripts/test-u30-ui-matrix.mjs'],
  ['branch gate runs U30 UI matrix', workflow.includes('npm run test:u30:ui-matrix')],
]) {
  assert.equal(ok, true, label);
  console.log('PASS\t' + label);
}
console.log('U30 UI fast-track verifier PASS');
