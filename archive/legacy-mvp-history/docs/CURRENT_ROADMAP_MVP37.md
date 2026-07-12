# CURRENT ROADMAP — MVP-37

Version: `0.75.0-mvp37`

MVP-37 improves cover artwork behavior for real Local JSON Index resources.

## Completed in MVP-37

- Map `collection.cover.relativePath` from `library-index.json` to tokenized `yang-kura-media://cover/<rootPathToken>/<relativePath>` URLs.
- Add a safe cover resolver in Electron main that accepts image extensions only.
- Add generated SVG fallback covers for ASMR, music, playlist, and track surfaces.
- Add reusable `CoverArtwork` component with load-failure fallback.
- Propagate `coverSourceKind` and `coverRelativePath` metadata into UI models.
- Replace main media cover surfaces with `CoverArtwork`.

## Still intentionally postponed

- SQLite.
- Downloader.
- Online metadata scraping.
- Embedded cover extraction from audio tags.
- mpv / FFmpeg playback backend.
- File delete / move / rename operations.

## Next planned stage

MVP-38 should continue the existing sequence with UI demo/diagnostic cleanup and media-library polish, without changing the file mutation boundary.
