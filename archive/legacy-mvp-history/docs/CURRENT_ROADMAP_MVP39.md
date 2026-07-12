# CURRENT ROADMAP — MVP-39

Version: `0.77.0-mvp39`

## Goal

MVP-39 continues the planned media-library experience polish without changing the real file / index / playback safety boundary.

This stage keeps the existing feature order and focuses on daily-use surfaces:

```text
Home page as listening hub
Settings page as simple resource-library entry
Advanced scanner/index tooling folded away
Diagnostics remains the technical detail area
```

## Completed in MVP-39

- Added a dashboard media-library overview block for continue playing, ASMR works, music tracks, and playlists.
- Added `mediaLibraryExperienceService` to centralize user-facing dashboard copy and counts.
- Folded scanner preview, write-preview, write-index, and scanner-contract detail behind an “高级资源库工具” disclosure in Settings.
- Kept the simple flow visible: choose directory, read existing index, one-click scan and apply.
- Continued replacing primary Settings copy with Chinese user-facing resource-library wording.

## Boundaries

MVP-39 does not add:

- SQLite
- downloader
- metadata scraping
- mpv backend
- file delete / move / rename
- absolutePath or `file://` exposure to renderer

## Next planned stage

MVP-40: continue according to the current plan, likely focused on music-library / playlist visual consistency or another small media-library polish pass before larger backend changes.
