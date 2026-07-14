#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const css = fs.readFileSync('src/index.css', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const primary = fs.readFileSync('src/components/PlayerBarPrimarySections.tsx', 'utf8');
const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/branch-validation.yml', 'utf8');

for (const [label, ok] of [
  ['modern queue suppresses legacy resume toast', app.includes('if (playerQueuePersistenceService.load()) return;') && app.includes('id="legacy-resume-toast"')],
  ['queue supports Escape and focus return', app.includes('handleQueueEscape') && app.includes("getElementById('player-queue-toggle')")],
  ['queue toggle has stable id', primary.includes('id="player-queue-toggle"')],
  ['queue drawer is an accessible dialog', app.includes('role="dialog" aria-modal="true" aria-label="当前播放队列"')],
  ['minimum-window responsive classes exist', sidebar.includes('w-56 xl:w-64') && player.includes('u30-player-track') && primary.includes('u30-player-transport') && auxiliary.includes('u30-player-aux')],
  ['reduced motion contract exists', css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('animation-duration: 0.01ms !important')],
  ['compact player contract exists', css.includes('#app-player-bar .u30-player-time') && css.includes('#windows-app-bar .u30-runtime-label')],
  ['U30 UI matrix command exists', pkg.scripts?.['test:u30:ui-matrix'] === 'node scripts/test-u30-ui-matrix.mjs'],
  ['branch gate runs U30 UI matrix', workflow.includes('Run U30 UI and accessibility matrix') && workflow.includes('artifacts/u30-ui-matrix')],
]) {
  assert.equal(ok, true, label);
  console.log('PASS\t' + label);
}
console.log('U30 UI fast-track verifier PASS');
