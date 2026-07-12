# U10 Lyrics Timeline Domain

## Purpose

`LyricsPanel.tsx` previously owned pure LRC parsing, bilingual-line splitting and active-line calculation in addition to rendering and player interaction. U10 moves those deterministic operations into a small domain module so they can be tested as behavior rather than source-string placement.

## New module

`src/player/lyricsTimeline.ts` provides:

- fractional LRC timestamp parsing;
- single-line and complete-timeline parsing;
- bilingual original/translation splitting;
- bilingual timeline construction;
- active lyric index calculation.

## Behavior preservation

U10 intentionally preserves the existing semantics:

- lines without timestamps are ignored by `parseLyrics`;
- one-, two- and three-digit fractions retain their decimal meaning;
- common `/`, `|`, `//` and `||` bilingual delimiters remain supported;
- translation text after the first delimiter is retained and rejoined;
- when the timeline is non-empty and playback is before the first timestamp, the first line remains selected;
- an empty timeline returns active index `-1`;
- non-finite playback progress falls back to the existing first-line behavior.

## Executable verification

`scripts/verify-u10-lyrics-timeline-domain.mjs` transpiles the TypeScript module in memory and executes assertions for timestamp parsing, filtering, bilingual splitting and active-line selection. It also checks that `LyricsPanel.tsx` delegates to the domain module and no longer owns duplicate parsing loops.

## Boundaries

No subtitle file loading, playback progress, Seek, queue, bookmarks, scrolling, Electron, importer, index, metadata, downloader, storage key or visual layout behavior is changed.
