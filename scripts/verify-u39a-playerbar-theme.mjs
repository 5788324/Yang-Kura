#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = {
  bar: fs.readFileSync('src/components/PlayerBar.tsx', 'utf8'),
  primary: fs.readFileSync('src/components/PlayerBarPrimarySections.tsx', 'utf8'),
  auxiliary: fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8'),
  progress: fs.readFileSync('src/components/PlayerProgressTrack.tsx', 'utf8'),
  transient: fs.readFileSync('src/components/PlayerTransientPresenters.tsx', 'utf8'),
};

assert.match(files.bar, /bg-player-bg\/95/);
assert.match(files.bar, /border-border-color\/80/);
assert.match(files.bar, /text-text-primary/);
assert.match(files.bar, /role="region"/);
assert.match(files.bar, /aria-label="全局播放器"/);
assert.match(files.bar, /data-u39-player-theme-surface="semantic"/);

for (const [name, source] of Object.entries(files)) {
  assert.doesNotMatch(source, /bg-zinc-950|bg-zinc-900|text-zinc-[1-9]00|border-zinc-800/, `${name} 仍含固定深色播放器表面`);
  assert.match(source, /(?:bg|text|border)-(?:player-bg|card-bg|hover-bg|text-primary|text-secondary|text-muted|border-color|brand-color)/, `${name} 未使用语义主题 Token`);
}

assert.match(files.primary, /focus-visible:outline-brand-color/);
assert.match(files.auxiliary, /bg-brand-color\/15/);
assert.match(files.progress, /from-brand-color to-brand-color-hover/);
assert.match(files.transient, /bg-player-bg\/95/);
assert.match(files.transient, /text-text-primary/);

console.log('U39-A PlayerBar semantic theme verifier PASS');
