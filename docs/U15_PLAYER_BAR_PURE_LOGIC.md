# U15 Player Bar Pure Logic

## Purpose

`PlayerBar.tsx` still owned reusable calculations for duration safety, time formatting, Seek coordinates, progress/volume normalization, and a second copy of LRC parsing. U15 moves those calculations into pure modules without changing player behavior.

## Changes

- add `src/player/playerBarMath.ts` for numeric player calculations;
- reuse `src/player/lyricsTimeline.ts` for the desktop floating-lyrics timeline;
- add `getActiveLyricText` as a small shared helper over the existing active-index contract;
- keep `PlayerBar.tsx` responsible for React state, event wiring, and JSX only;
- execute real boundary-value assertions for duration, time, pointer Seek, progress, volume, and active lyrics.

## Preserved behavior

- invalid or non-positive track duration remains `0`;
- displayed time remains `m:ss` and invalid values remain `0:00`;
- pointer Seek remains clamped to the progress bar bounds;
- drag preview and volume percentages remain clamped;
- floating lyrics still show the first timed line before its timestamp and use the same no-lyrics fallback;
- play, pause, queue, loop, completion mode, favorites, playlists, volume, Seek commits, and lyrics-window behavior are unchanged.

## Boundaries

No audio backend, `useAudioPlayer`, Electron, importer, index, metadata, downloader, theme, or storage behavior is changed.
