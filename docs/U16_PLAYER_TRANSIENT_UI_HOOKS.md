# U16 Player Transient UI Hooks

## Purpose

`PlayerBar.tsx` still owned two short-lived UI lifecycles:

- the 800 ms delayed close for the volume popover;
- the 2500 ms auto-dismiss timer for player toast messages.

U16 moves these lifecycles into small reusable Hooks and a resettable timer primitive without changing player behavior.

## Changes

- add `createResettableTimeout` with injected scheduler support for executable timer tests;
- add `useDelayedVisibility` for the volume hover popover;
- add `useAutoDismissMessage` for player toast messages;
- cancel pending timers when Hooks unmount, the message changes, or delayed visibility is reopened;
- keep `PlayerBar.tsx` responsible for event wiring and rendering instead of timer ownership.

## Preserved behavior

- entering the volume control shows the slider immediately;
- leaving schedules the same 800 ms delayed close;
- re-entering cancels the pending close;
- toast messages still disappear after 2500 ms;
- all existing toast call sites and visible text remain unchanged.

## Boundaries

No play, pause, previous, next, Seek, queue, loop, completion mode, volume value, mute, favorites, playlists, lyrics, audio backend, Electron, importer, index, metadata, downloader, theme, or storage behavior is changed.
