import fs from 'node:fs';

const filePath = 'src/components/LyricsPanel.tsx';
let source = fs.readFileSync(filePath, 'utf8');

const replaceExactlyOnce = (pattern, replacement, label) => {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...source.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${matches.length}`);
  }
  source = source.replace(pattern, replacement);
};

replaceExactlyOnce(
  /  const recordRef = useRef<HTMLDivElement>\(null\);\n  const tonearmRef = useRef<HTMLDivElement>\(null\);\n  \n  const rotationAngleRef/,
  `  const recordRef = useRef<HTMLDivElement>(null);\n  const tonearmRef = useRef<HTMLDivElement>(null);\n  const closeButtonRef = useRef<HTMLButtonElement>(null);\n  const previousFocusRef = useRef<HTMLElement | null>(null);\n  const onCloseRef = useRef(onClose);\n\n  useEffect(() => {\n    onCloseRef.current = onClose;\n  }, [onClose]);\n\n  useEffect(() => {\n    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;\n    const focusFrame = window.requestAnimationFrame(() => {\n      closeButtonRef.current?.focus({ preventScroll: true });\n    });\n\n    const handleFullPlayerKeyDown = (event: KeyboardEvent) => {\n      if (event.key === 'Escape') {\n        event.preventDefault();\n        onCloseRef.current();\n      }\n    };\n\n    window.addEventListener('keydown', handleFullPlayerKeyDown);\n    return () => {\n      window.cancelAnimationFrame(focusFrame);\n      window.removeEventListener('keydown', handleFullPlayerKeyDown);\n      const previousFocus = previousFocusRef.current;\n      if (previousFocus && document.contains(previousFocus)) {\n        previousFocus.focus({ preventScroll: true });\n      }\n    };\n  }, []);\n  \n  const rotationAngleRef`,
  'full player keyboard refs and effects',
);

replaceExactlyOnce(
  /      id="full-lyrics-panel" \n      className=/,
  `      id="full-lyrics-panel" \n      role="dialog"\n      aria-modal="true"\n      aria-label="全屏播放与歌词"\n      tabIndex={-1}\n      className=`,
  'full player dialog semantics',
);

replaceExactlyOnce(
  /          <button \n            id="lyrics-close-btn"/,
  `          <button \n            ref={closeButtonRef}\n            id="lyrics-close-btn"`,
  'full player close button ref',
);

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U08 full player keyboard shell patch.');
