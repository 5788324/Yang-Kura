# U22 Player Bar Actions and Floating Lyrics

## Purpose

After U21, `PlayerBar.tsx` still owned playlist mutation decisions, favorite feedback, Toast state, floating-lyrics visibility, and lyric-text derivation. U22 separates those responsibilities without changing any user-visible result.

## Changes

- add `playerBarActionModel.ts` for pure favorite, playlist, floating-lyrics, and More-message decisions;
- add `usePlayerBarActions` for playlist-menu state, floating-lyrics visibility, Toast lifecycle, favorite feedback, playlist selection, and More feedback;
- add `useFloatingLyricText` for the shared LRC timeline and current floating-lyric text;
- compute `hasTrack` and `canToggleCompletion` once in `PlayerBar` instead of repeating Boolean conversions;
- keep volume conversion, player service models, playback commands, Seek interaction, and JSX assembly in `PlayerBar`;
- keep the public `PlayerBarProps` contract unchanged.

## Preserved behavior

- favorite and unfavorite use the same storage callback and Toast wording;
- system playlists remain read-only;
- duplicate playlist entries are not added;
- successful playlist additions use the same callback and Toast wording;
- floating lyrics use the same fallback, open/close messages, and close behavior;
- More actions still show the same explicit placeholder message;
- Toast duration remains controlled by `useAutoDismissMessage`.

## Boundaries

No play, pause, previous, next, Seek, queue, loop, completion mode, volume, mute, favorites storage, playlist storage, lyrics parsing algorithm, audio backend, Electron, importer, index, metadata, downloader, theme, layout, colors, or animation behavior is changed.
