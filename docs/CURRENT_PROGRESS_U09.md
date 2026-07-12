# Current Progress — U09

## Current product state

- Core baseline: `0.167.0-mvp129`.
- U02～U08 productization changes are merged.
- The local media library, importer, metadata, playback, subtitle, index maintenance and packaging foundations are present.
- The active phase is product quality, incremental structure cleanup and release re-validation.
- MVP130 remains an isolated downloader experiment and is not part of the stable line.

## Current quality task

U09 extracts full-player dialog lifecycle and decorative vinyl motion from `LyricsPanel.tsx` into dedicated hooks without changing playback behavior.

## Remaining release work

- Windows GUI end-to-end acceptance.
- Targeted defect fixes from real use.
- Electron strict smoke and mpv acceptance re-run.
- portable / NSIS packaging, install/uninstall and process cleanup verification.
- version, release notes, tag and artifact checksum closeout.
