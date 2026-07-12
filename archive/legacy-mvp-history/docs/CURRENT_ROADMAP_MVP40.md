# CURRENT ROADMAP — MVP-40

Version: `0.78.0-mvp40`

## Focus

MVP-40 continues the existing media-library polish plan. The scope is visual/interaction consistency for the normal music library and playlist pages.

## Completed

- Added unified music-library overview cards.
- Added playlist overview cards for total playlists, user playlists, tracks, ASMR/音声音轨, and music tracks.
- Added `mediaSurfaceStatusService` for reusable user-facing status badges.
- Music album cards now show consistent source/subtitle/external-open badges.
- Music track rows now show compact source/subtitle/type badges.
- Playlist cards now show consistent system/user, ASMR/music, local/empty state badges.
- Folder view wording no longer implies physical path exposure or unsafe mounting.

## Boundaries

No SQLite, downloader, metadata scraping, mpv backend, raw absolute path exposure, `file://` exposure, or file delete/move/rename behavior is added.

## Next

MVP-41 should continue media-product polish or start a small UI pass for lyrics/player details, depending on the current plan. Backend expansion remains postponed.
