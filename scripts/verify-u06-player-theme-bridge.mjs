import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const css = fs.readFileSync('src/playerThemeBridge.css', 'utf8');
const failures = [];

if (!main.includes("import './playerThemeBridge.css';")) {
  failures.push('main.tsx does not import the player theme bridge');
}

for (const marker of [
  '#app-player-bar',
  'background-color: var(--player-bg)',
  'border-color: var(--border-color)',
  'color: var(--text-primary)',
  'background-color: var(--input-bg)',
  'background-color: var(--hover-bg)',
  'color: var(--text-secondary)',
  'color: var(--text-muted)',
  'accent-color: var(--brand-color)',
]) {
  if (!css.includes(marker)) failures.push(`missing player theme marker: ${marker}`);
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
