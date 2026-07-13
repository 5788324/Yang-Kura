# U23 Player Bar Presentation Model

## Purpose

After U22, `PlayerBar.tsx` no longer owned transient actions or lyric derivation, but it still called seven historical presentation services and manually mapped their fields into four component prop groups. U23 closes that remaining assembly responsibility without changing any service output or player behavior.

## Changes

- add `playerBarPresentationModel.ts` as a pure aggregation layer;
- collect only the fields used by the bottom player from the existing MVP49, MVP50, MVP54, MVP59, MVP74, MVP79, and player-experience services;
- build explicit `trackSummary`, `emptyState`, `transport`, `auxiliary`, and `compatibility` models;
- keep Hover time formatting in the progress interaction path because it is an immediate pointer value;
- let `PlayerBar` spread the grouped models into existing presentation components while retaining all callbacks and Hook ordering;
- add executable aggregation tests with controlled service stubs.

## Preserved behavior

- the seven historical services remain unchanged and continue producing the same labels, badges, hints, and compatibility markers;
- volume visibility still uses U15 `getPlayerVolumeMetrics`;
- current time and duration labels still use U15 `formatPlayerTime`;
- playback, Seek, queue, completion mode, favorites, playlists, lyrics, Toast, and volume callbacks remain in their existing paths;
- the public `PlayerBarProps` contract remains unchanged.

## Structure closeout

U23 is the planned closeout for `PlayerBar` structural refactoring. Further splitting is not justified unless Windows GUI validation or a concrete defect identifies a specific responsibility problem.

## Boundaries

No play, pause, previous, next, Seek, queue, loop, completion behavior, volume, mute, favorites storage, playlist storage, lyrics parsing, audio backend, Electron, importer, index, metadata, downloader, theme, layout, colors, animation, or visible wording is changed.
