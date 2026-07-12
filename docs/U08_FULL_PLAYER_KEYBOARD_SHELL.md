# U08 Full Player Keyboard Shell

## Purpose

The full-screen playback and lyrics surface visually replaces the application, but it previously lacked full-screen dialog semantics and predictable keyboard entry/exit behavior.

## Changes

- the full-screen root exposes `role="dialog"`, `aria-modal="true"`, and a Chinese accessible name;
- opening the surface moves focus to the visible “返回” button;
- Escape closes the full-screen surface;
- closing returns focus to the element that opened it when that element still exists;
- event listeners and scheduled focus work are cleaned up on unmount.

## Boundaries

No play, pause, Seek, queue, volume, loop, lyrics parsing, bookmarks, sleep timer, animation, audio backend, Electron, importer, index, metadata, downloader, or visual layout behavior is changed.

## Verification

The focused U08 verifier and the automatic Windows branch validation must pass before merge. Narrator pronunciation and real keyboard feel remain part of later GUI acceptance.
