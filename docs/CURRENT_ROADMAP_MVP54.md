# CURRENT ROADMAP — MVP-54

Version: `0.92.0-mvp54`

## Current focus

MVP-54 is a small Beta 0.1 regression and UI cleanup round.

It does not add new backend capability. It makes the current personal-use Beta easier to verify by surfacing a clear manual checklist in Diagnostics and small user-facing hints in Settings, Dashboard, and PlayerBar.

## Completed in this round

- Added `betaRegressionChecklistService`.
- Added Settings regression path surface.
- Added Dashboard Beta 0.1 daily-check hints.
- Added PlayerBar compact regression state line.
- Added Diagnostics manual regression checklist.
- Replaced MVP-53 handoff/package files with MVP-54 files.
- Added `verify:mvp54-beta-regression-checklist` and included it in `verify:all`.

## Still deferred

- SQLite.
- Downloader.
- Metadata scraping.
- mpv backend.
- Advanced file organization / batch rename.

## Safety rules unchanged

- UI remains Chinese.
- Main UI stays media-first; diagnostics keep technical detail.
- Renderer does not receive absolutePath.
- Renderer does not receive file://.
- No real media files are deleted, moved, or renamed.
