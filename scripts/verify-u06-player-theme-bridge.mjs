import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const css = fs.readFileSync('src/playerThemeBridge.css', 'utf8');
const failures = [];

if (!main.includes("import './playerThemeBridge.css';")) {
  failures.push('main.tsx does not import the player theme bridge');
}

for (const marker of [
  '#app-player-bar',
  '--player-token-surface: var(--player-bg)',
  '--player-token-panel: var(--input-bg)',
  '--player-token-hover: var(--hover-bg)',
  '--player-token-border: var(--border-color)',
  '--player-token-text: var(--text-primary)',
  '--player-token-text-secondary: var(--text-secondary)',
  '--player-token-text-muted: var(--text-muted)',
  'background-color: var(--player-token-surface)',
  'border-color: var(--player-token-border)',
  'color: var(--player-token-text)',
  'accent-color: var(--brand-color)',
]) {
  if (!css.includes(marker)) failures.push(`missing stable player theme contract: ${marker}`);
}

for (const forbidden of [
  'useAudioPlayer',
  'onSeek(',
  'togglePlay(',
  'localStorage',
  'window.yangKura',
]) {
  if (css.includes(forbidden)) failures.push(`player theme bridge crossed behavior boundary: ${forbidden}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U06 player theme bridge verifier PASS');
