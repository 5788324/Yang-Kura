# U20 Player Auxiliary Controls

## Purpose

After U19, `PlayerBar.tsx` still owned the full right-side auxiliary control tree:

- playback completion strategy;
- playlist menu trigger and popup;
- floating-lyrics toggle;
- mute button and volume popover;
- the explicit “more actions later” feedback button;
- two hidden compatibility marker regions.

U20 extracts this display-heavy region while leaving every business decision and state transition in the container.

## Changes

- add `PlayerAuxiliaryControls` for the completion strategy, playlist trigger/menu, floating lyrics, volume/mute, and More controls;
- add `PlayerCompatibilityMarkers` to centralize the remaining MVP59/MVP79 hidden marker IDs without removing historical contracts;
- consolidate repeated auxiliary icon-button class strings into stable local constants;
- mark all decorative auxiliary icons as `aria-hidden`;
- keep playlist mutation, Toast selection, lyrics state, mute state, completion behavior, and volume events in `PlayerBar.tsx`;
- update U14 and U19 verifiers so they follow presentation responsibilities instead of old source locations.

## Preserved behavior

- completion strategy still invokes the existing optional callback;
- playlist selection still uses the existing read-only and duplicate checks and the same Toast text;
- floating lyrics still opens/closes with the same state and messages;
- mute and volume use the same callbacks and delayed visibility Hook;
- More still provides the same explicit placeholder message;
- all visible wording, layout utilities, colors, and animation classes remain unchanged.

## Boundaries

No play, pause, previous, next, loop, Seek, queue, favorites, playlist storage, lyrics parsing, audio backend, Electron, importer, index, metadata, downloader, theme, or persistent-storage behavior is changed.
