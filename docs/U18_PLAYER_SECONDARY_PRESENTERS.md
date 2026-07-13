# U18 Player Secondary Presenters

## Purpose

`PlayerBar.tsx` still owned three low-risk display-only blocks after U17:

- the progress hover preview;
- the empty-player placeholder;
- the floating lyrics overlay.

U18 extracts all three together to reduce the container's JSX density while preserving every player decision and event flow.

## Changes

- add `PlayerSeekPreview` for the hover time tooltip;
- add `PlayerEmptyState` for the no-track placeholder and compatibility markers;
- add `PlayerFloatingLyrics` for the synchronized lyric overlay and close button;
- keep hover calculations, lyric parsing, current-line selection, open/close state and all player commands in `PlayerBar.tsx`;
- add a Chinese accessible name to the invisible progress range;
- expose the floating-lyrics toggle with `aria-pressed`;
- expose the lyric overlay as a polite status region and keep its close control as a real button.

## Preserved behavior

- Seek preview position and formatted time remain unchanged;
- the empty title, hint and hidden regression markers remain unchanged;
- floating lyrics still stop click propagation, show the same text and close through the same state setter;
- reduced-motion remains governed by the existing global accessibility stylesheet;
- all current colors, layout, animation classes and visible wording remain unchanged.

## Boundaries

No play, pause, previous, next, Seek calculation or submission, queue, loop, completion mode, volume, mute, favorites, playlists, lyric parsing, active-line calculation, audio backend, Electron, importer, index, metadata, downloader, theme or persistent storage behavior is changed.
