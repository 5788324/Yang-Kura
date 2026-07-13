import fs from 'node:fs';

const filePath = 'src/components/PlayerBar.tsx';
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
  /import \{ PlayerState, AudioTrack, Playlist \} from '\.\.\/types';/,
  "import type { PlayerState, AudioTrack, Playlist } from '../types';",
  'convert player types to type-only import',
);

replaceExactlyOnce(
  /import \{\n  PlayerEmptyState,\n  PlayerFloatingLyrics,\n  PlayerPlaylistMenu,\n  PlayerSeekPreview,\n  PlayerToast,\n  PlayerVolumePopover,\n\} from '\.\/PlayerTransientPresenters';/,
  `import {\n  PlayerEmptyState,\n  PlayerFloatingLyrics,\n  PlayerSeekPreview,\n  PlayerToast,\n} from './PlayerTransientPresenters';`,
  'remove moved transient presenter imports',
);

replaceExactlyOnce(
  /  isQueueOpen,\n  toggleQueue,\n  isLyricsOpen,\n  toggleLyrics,/,
  `  isQueueOpen,\n  toggleQueue,\n  toggleLyrics,`,
  'stop destructuring unused lyrics-open prop',
);

for (const forbidden of ['PlayerPlaylistMenu,', 'PlayerVolumePopover,', '  isLyricsOpen,']) {
  if (source.includes(forbidden)) throw new Error(`PlayerBar cleanup incomplete: ${forbidden}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U20 PlayerBar import cleanup.');
