# U06 Player Theme Bridge

## Purpose

The bottom player bar still used a fixed zinc/black visual foundation even when the rest of Yang-Kura changed theme. U06 maps those legacy neutral surfaces to the existing theme variables without changing player behavior.

## Changes

The bridge is scoped to `#app-player-bar` and maps:

- the player background to `--player-bg`;
- neutral borders to `--border-color`;
- neutral panels to `--input-bg` and `--hover-bg`;
- zinc primary, secondary, and muted text to the existing text tokens;
- range-input accent color to `--brand-color`.

The existing sky/pink playback accents are intentionally retained in this round. They require visual contrast review before being replaced globally.

## Boundaries

U06 does not change:

- play, pause, previous, next, loop, completion, queue, volume, or Seek behavior;
- audio backends or `useAudioPlayer`;
- lyrics parsing or player state;
- Electron, importer, index, metadata, downloader, or theme selection.

## Verification

The focused U06 verifier and the automatic Windows branch validation must pass before merge. Final visual acceptance across all themes remains a Windows GUI task.
