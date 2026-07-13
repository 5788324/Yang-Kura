# U21 Player Progress Interaction

## Purpose

After U20, `PlayerBar.tsx` still owned the complete progress-track DOM plus Hover and drag lifecycle state. U21 separates that remaining interaction-heavy region without changing the existing Seek contract.

## Changes

- add `usePlayerSeekInteraction` for Hover preview, drag preview, pending Seek value, track geometry, and final commit orchestration;
- add `PlayerProgressTrack` for the progress rail, fill, hover preview, hidden range input, and accessible progress label;
- continue using U15 `playerBarMath` for duration protection, pointer conversion, clamping, and progress metrics;
- rename local visibility state to explicit `isPlaylistMenuOpen`, `isFloatingLyricsVisible`, `isVolumePopoverVisible`, and `playerToastMessage` names;
- update auxiliary-control props and historical verifiers to follow the clearer state contract.

## Preserved interaction order

- clicking the track still submits one immediate Seek;
- starting a range drag stores the current display position without seeking;
- range changes update only the local drag preview;
- mouse or touch release submits the pending value once and clears the preview;
- Hover leaving clears only the Hover tooltip;
- zero or invalid duration remains non-seekable.

## Boundaries

No play, pause, previous, next, loop, queue, completion mode, volume, mute, favorites, playlist storage, lyrics parsing, audio backend, Electron, importer, index, metadata, downloader, theme, persistent storage, visible wording, layout, color, or animation behavior is changed.
