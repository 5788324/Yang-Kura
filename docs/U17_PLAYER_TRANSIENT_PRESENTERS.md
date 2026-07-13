# U17 Player Transient Presenters

## Purpose

`PlayerBar.tsx` still contained three self-contained display blocks:

- the playlist picker menu;
- the vertical volume popover;
- the temporary player Toast.

U17 moves these blocks into a small presentation module so the player container keeps event orchestration and business decisions without owning every transient JSX tree.

## Changes

- add `PlayerPlaylistMenu` for playlist labels, read-only state and already-collected state;
- add `PlayerVolumePopover` for the vertical volume range and percentage display;
- add `PlayerToast` for transient status announcements;
- keep playlist add/existing/read-only decisions and all messages in `PlayerBar.tsx`;
- keep U16 timer Hooks in `PlayerBar.tsx`; the new presenters own no timers or React lifecycle;
- add menu, close-button, volume-range and polite status semantics without changing visible content.

## Preserved behavior

- the playlist trigger opens and closes the same menu;
- system playlists remain disabled and marked read-only;
- existing playlists remain marked `已收藏`;
- selecting an editable playlist keeps the same add and Toast behavior;
- the volume popover keeps the same value, percentage, layout and change callback;
- Toast timing remains owned by the U16 Hook and visible messages remain unchanged.

## Boundaries

No play, pause, previous, next, Seek, queue, loop, completion mode, volume calculation, mute, favorites, playlist storage, lyrics, audio backend, Electron, importer, index, metadata, downloader, theme or persistent storage behavior is changed.
