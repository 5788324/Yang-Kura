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
  /import \{ useVinylMotion \} from '\.\.\/hooks\/useVinylMotion';/,
  `import { useVinylMotion } from '../hooks/useVinylMotion';\nimport { createBilingualTimeline, findActiveLyricIndex, parseLyrics } from '../player/lyricsTimeline';`,
  'lyrics timeline import',
);

replaceExactlyOnce(
  /  const parseLrcFractionalSeconds = \(fraction: string \| undefined\): number => \{[\s\S]*?  const activeLyricIndex = useMemo\(\(\) => \{[\s\S]*?  \}, \[parsedLyrics, progress\]\);/,
  `  const parsedLyrics = useMemo(() => parseLyrics(currentTrack?.lyrics), [currentTrack?.lyrics]);\n\n  const bilingualData = useMemo(() => createBilingualTimeline(parsedLyrics), [parsedLyrics]);\n\n  const activeLyricIndex = useMemo(\n    () => findActiveLyricIndex(parsedLyrics, progress),\n    [parsedLyrics, progress],\n  );`,
  'inline lyrics timeline domain',
);

for (const forbidden of [
  'const parseLrcFractionalSeconds =',
  'const parseLrcLine =',
  "const delimiters = [' // '",
  'let activeIdx = 0;',
]) {
  if (source.includes(forbidden)) throw new Error(`inline lyrics domain remains: ${forbidden}`);
}

for (const required of [
  "from '../player/lyricsTimeline'",
  'parseLyrics(currentTrack?.lyrics)',
  'createBilingualTimeline(parsedLyrics)',
  'findActiveLyricIndex(parsedLyrics, progress)',
]) {
  if (!source.includes(required)) throw new Error(`missing U10 integration marker: ${required}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U10 lyrics timeline extraction.');
