import assert from 'node:assert/strict';
import fs from 'node:fs';

const player = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const progressTrack = fs.readFileSync('src/components/PlayerProgressTrack.tsx', 'utf8');
const transientPresenters = fs.readFileSync('src/components/PlayerTransientPresenters.tsx', 'utf8');
const primarySections = fs.readFileSync('src/components/PlayerBarPrimarySections.tsx', 'utf8');
const auxiliaryControls = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
const playerPresentation = `${player}\n${progressTrack}\n${transientPresenters}\n${primarySections}\n${auxiliaryControls}`;
const bridge = fs.readFileSync('src/playerThemeBridge.css', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');

for (const marker of [
  '#app-player-bar {',
  '--player-token-surface: var(--player-bg);',
  '--player-token-panel: var(--input-bg);',
  '--player-token-hover: var(--hover-bg);',
  '--player-token-border: var(--border-color);',
  '--player-token-border-hover: var(--border-color-hover);',
  '--player-token-text: var(--text-primary);',
  '--player-token-text-secondary: var(--text-secondary);',
  '--player-token-text-muted: var(--text-muted);',
]) {
  assert.ok(bridge.includes(marker), `player token contract missing: ${marker}`);
}

const remainingNeutralUtilities = [
  'bg-zinc-950/90',
  'bg-zinc-950/95',
  'bg-white/5',
  'bg-white/10',
  'border-white/10',
  'border-zinc-800/40',
  'hover:bg-zinc-900/60',
  'hover:bg-white/10',
  'hover:border-zinc-800/80',
  'group-hover/heart:text-zinc-300',
  'disabled:hover:border-zinc-800',
  'disabled:hover:text-zinc-300',
  'text-zinc-800',
];

for (const utility of remainingNeutralUtilities) {
  assert.ok(
    playerPresentation.includes(utility),
    `player presentation no longer contains expected neutral utility: ${utility}`,
  );
  assert.ok(
    bridge.includes(`[class~="${utility}"]`),
    `player theme bridge does not cover neutral utility: ${utility}`,
  );
}

for (const forbiddenGlobalOverride of [
  '[class~="text-white"]',
  '[class~="bg-sky-500"]',
  '[class~="text-rose-300"]',
  '[class~="text-amber-300"]',
  '[class~="text-indigo-400"]',
  '[class~="text-emerald-400"]',
]) {
  assert.ok(
    !bridge.includes(forbiddenGlobalOverride),
    `functional player accent must not be globally overridden: ${forbiddenGlobalOverride}`,
  );
}

assert.ok(bridge.includes('#app-player-bar input[type="range"]'));
assert.ok(bridge.includes('accent-color: var(--brand-color);'));

const progressDocuments = `${projectState}\n${roadmap}`;
for (const marker of ['U13', 'U14', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U14 fact: ${marker}`);
}

console.log('U14 player neutral token bridge verifier PASS');
