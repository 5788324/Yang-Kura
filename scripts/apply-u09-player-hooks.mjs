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
  /import CoverArtwork from '\.\/CoverArtwork';/,
  `import CoverArtwork from './CoverArtwork';\nimport { useFullPlayerDialog } from '../hooks/useFullPlayerDialog';\nimport { useVinylMotion } from '../hooks/useVinylMotion';`,
  'player hook imports',
);

replaceExactlyOnce(
  /  const closeButtonRef = useRef<HTMLButtonElement>\(null\);[\s\S]*?  \}, \[\]\);\n  \n  const rotationAngleRef/,
  `  const closeButtonRef = useFullPlayerDialog(onClose);\n\n  useVinylMotion({\n    recordRef,\n    tonearmRef,\n    isPlaying,\n    progress,\n    duration: currentTrack?.duration,\n  });\n  \n  const rotationAngleRef`,
  'dialog lifecycle block',
);

replaceExactlyOnce(
  /  const rotationAngleRef = useRef<number>\(0\);[\s\S]*?  \}, \[\]\);\n  \n  \/\/ --- Sleep Timer/,
  `  // --- Sleep Timer`,
  'vinyl animation block',
);

for (const forbidden of [
  'const previousFocusRef = useRef<HTMLElement | null>(null);',
  "window.addEventListener('keydown', handleFullPlayerKeyDown)",
  "const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')",
  'const rotationAngleRef = useRef<number>(0);',
]) {
  if (source.includes(forbidden)) throw new Error(`legacy inline player lifecycle remains: ${forbidden}`);
}

for (const required of [
  "import { useFullPlayerDialog } from '../hooks/useFullPlayerDialog';",
  "import { useVinylMotion } from '../hooks/useVinylMotion';",
  'const closeButtonRef = useFullPlayerDialog(onClose);',
  'useVinylMotion({',
  'duration: currentTrack?.duration,',
]) {
  if (!source.includes(required)) throw new Error(`missing U09 player hook marker: ${required}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U09 player hook extraction.');
