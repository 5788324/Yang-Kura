import fs from 'node:fs';

const lyrics = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
const dialogHook = fs.readFileSync('src/hooks/useFullPlayerDialog.ts', 'utf8');
const failures = [];

for (const marker of [
  'const closeButtonRef = useRef<HTMLButtonElement>(null);',
  'const previousFocusRef = useRef<HTMLElement | null>(null);',
  'const onCloseRef = useRef(onClose);',
  "if (event.key !== 'Escape') return;",
  "window.addEventListener('keydown', handleKeyDown)",
  "window.removeEventListener('keydown', handleKeyDown)",
  'closeButtonRef.current?.focus({ preventScroll: true })',
  'previousFocus.focus({ preventScroll: true })',
]) {
  if (!dialogHook.includes(marker)) failures.push(`missing U08 dialog hook marker: ${marker}`);
}

for (const marker of [
  'const closeButtonRef = useFullPlayerDialog(onClose);',
  'role="dialog"',
  'aria-modal="true"',
  'aria-label="全屏播放与歌词"',
  'ref={closeButtonRef}',
]) {
  if (!lyrics.includes(marker)) failures.push(`missing U08 player surface marker: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U08 full player keyboard shell verifier PASS');
