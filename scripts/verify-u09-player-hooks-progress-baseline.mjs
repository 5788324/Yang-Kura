import fs from 'node:fs';

const lyrics = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
const dialogHook = fs.readFileSync('src/hooks/useFullPlayerDialog.ts', 'utf8');
const motionHook = fs.readFileSync('src/hooks/useVinylMotion.ts', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');
const failures = [];

for (const marker of [
  "import { useFullPlayerDialog } from '../hooks/useFullPlayerDialog';",
  "import { useVinylMotion } from '../hooks/useVinylMotion';",
  'const closeButtonRef = useFullPlayerDialog(onClose);',
  'useVinylMotion({',
  'duration: currentTrack?.duration,',
]) {
  if (!lyrics.includes(marker)) failures.push(`missing LyricsPanel extraction marker: ${marker}`);
}

for (const forbidden of [
  'const previousFocusRef = useRef<HTMLElement | null>(null);',
  "window.addEventListener('keydown', handleFullPlayerKeyDown)",
  "const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')",
  'const rotationAngleRef = useRef<number>(0);',
]) {
  if (lyrics.includes(forbidden)) failures.push(`inline player lifecycle remains: ${forbidden}`);
}

for (const marker of [
  'export function useFullPlayerDialog',
  "if (event.key !== 'Escape') return;",
  'previousFocus.focus({ preventScroll: true });',
  'window.removeEventListener',
]) {
  if (!dialogHook.includes(marker)) failures.push(`missing dialog hook behavior: ${marker}`);
}

for (const marker of [
  'export function useVinylMotion',
  'prefers-reduced-motion: reduce',
  'window.requestAnimationFrame(updatePhysics)',
  'window.cancelAnimationFrame',
  'motionQuery.removeEventListener',
]) {
  if (!motionHook.includes(marker)) failures.push(`missing motion hook behavior: ${marker}`);
}

const progressDocuments = `${projectState}\n${roadmap}`;
for (const marker of [
  '核心版本：0.167.0-mvp129',
  'U02～U08',
  'U09',
  'GitHub main',
  'MVP130',
]) {
  if (!progressDocuments.includes(marker)) failures.push(`missing stable progress fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U09 player hooks and progress baseline verifier PASS');
