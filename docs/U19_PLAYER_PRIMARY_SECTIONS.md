# U19 Player Primary Sections

## Purpose

After U17 and U18, `PlayerBar.tsx` still owned two large display-heavy regions:

- the current-track summary, status badges, hidden compatibility markers, and favorite control;
- the center transport cluster for loop mode, previous, play/pause, next, queue, and elapsed time.

U19 extracts both regions together so the container keeps data preparation and command orchestration without owning their entire JSX trees.

## Changes

- add `PlayerTrackSummary` for cover art, title, artist, playback notice/error, daily status badges, compatibility markers, and favorite control;
- add `PlayerTransportControls` for loop mode, previous, play/pause, next, queue, and timeline display;
- keep favorite mutation, Toast selection, loop transitions, playback commands, queue toggling, and all player state in `PlayerBar.tsx`;
- add keyboard access to the cover/title lyric entry;
- add accessible names and pressed state to favorite, play/pause, queue, playlist, mute, and other icon controls;
- keep the existing layout, visible wording, color utilities, animation classes, and callbacks.

## Preserved behavior

- cover and title continue to open the full lyrics/player surface;
- favorite still calls the existing mutation and shows the same Toast text;
- loop mode, previous, play/pause, next, queue count, and timeline use the same state and callbacks;
- disabled states remain tied to the presence of a current track;
- right-side playlist, lyrics, volume, completion mode, and More behavior remain in `PlayerBar.tsx`.

## Boundaries

No play, pause, previous, next, loop, Seek, queue mutation, completion mode, volume, mute, favorites storage, playlists storage, lyrics parsing, audio backend, Electron, importer, index, metadata, downloader, theme, or persistent storage behavior is changed.
