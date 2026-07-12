import fs from 'node:fs';

const lyrics = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
const failures = [];

for (const marker of [
  'const closeButtonRef = useRef<HTMLButtonElement>(null);',
  'const previousFocusRef = useRef<HTMLElement | null>(null);',
  'const onCloseRef = useRef(onClose);',
  "if (event.key === 'Escape')",
  "window.addEventListener('keydown', handleFullPlayerKeyDown)",
  "window.removeEventListener('keydown', handleFullPlayerKeyDown)",
  'closeButtonRef.current?.focus({ preventScroll: true })',
  'previousFocus.focus({ preventScroll: true })',
  'role="dialog"',
  'aria-modal="true"',
  'aria-label="全屏播放与歌词"',
  'ref={closeButtonRef}',
]) {
  if (!lyrics.includes(marker)) failures.push(`missing U08 marker: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U08 full player keyboard shell verifier PASS');
