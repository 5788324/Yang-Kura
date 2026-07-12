# U07 Immersive Player Truthful State and Motion

## Problems

The full-screen lyrics/player surface had two product issues:

1. opening a track with no bookmark storage created and persisted three demo bookmarks;
2. vinyl and tonearm physics used a perpetual JavaScript animation loop that ignored the operating system's reduced-motion preference.

## Changes

- missing bookmark storage now starts with an empty list and does not create a storage record;
- existing saved bookmarks still load unchanged;
- manual bookmark creation and deletion remain unchanged;
- the vinyl physics loop observes `prefers-reduced-motion`;
- reduced-motion mode cancels the animation frame and restores a static record/tonearm position;
- changing the system preference while the panel is open starts or stops the animation safely.

## Boundaries

No play, pause, Seek, queue, volume, lyrics parsing, sleep timer, audio backend, Electron, importer, index, metadata, downloader, or storage-key migration is changed.

## Verification

The focused U07 verifier and the automatic Windows branch validation must pass before merge.
