# U14 Player Neutral Token Bridge

## Purpose

U06 connected the bottom player shell to the active theme, but several neutral utility variants used by tooltips, dropdowns, the volume popover, badges and hover states were not covered. Those gaps could still expose fixed zinc/white surfaces when switching between the three supported themes.

## Changes

- define player-scoped semantic aliases for surface, panel, hover, border and text tokens;
- cover the remaining translucent player surfaces such as `bg-zinc-950/90`, `bg-white/5` and `bg-white/10`;
- cover weak white borders, muted separators and nested hover/group-hover variants;
- keep all selectors scoped to `#app-player-bar`;
- retain the existing sky, pink, rose, amber, indigo and emerald functional accents;
- keep playback controls, popover behavior and component markup unchanged.

## Boundaries

U14 does not change play, pause, Seek, queue, loop, volume, favorites, playlists, lyrics, toasts, player state, audio backends, Electron, importer, index, metadata or downloader behavior.

## Verification

`scripts/verify-u14-player-neutral-token-bridge.mjs` checks that every known neutral utility gap in `PlayerBar.tsx` has a scoped token mapping, that functional accents are not globally overridden, and that project progress records U13 completion and U14 as the current task. The normal Windows gate still runs dependency audit, all focused verifiers, `verify:stable` and the production build.
