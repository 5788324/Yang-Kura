# MVP-43 — Collection Detail Navigation and Empty States

MVP-43 adds a shared UI model for collection/detail summaries and empty states.

## Added files

- `src/services/collectionDetailExperienceService.ts`
- `docs/CURRENT_ROADMAP_MVP43.md`
- `docs/COLLECTION_EMPTY_STATES_MVP43.md`
- `scripts/verify-mvp43-collection-empty-states.mjs`

## UI coverage

### ASMR detail

- Adds `mvp43-asmr-detail-navigation` for breadcrumb-like location and collection summary.
- Adds `mvp43-asmr-empty-state` for no-track works.
- Rewords older local-record copy so the page no longer emphasizes physical paths or parser details.

### Music library

- Adds `mvp43-music-empty-state` for no-track, no-album, no-artist, and no-folder states.
- Keeps search/filter empty states user-facing and actionable.

### Playlists

- Adds `mvp43-playlist-detail-navigation` for playlist detail summary.
- Adds `mvp43-playlist-empty-state` for empty playlists and no matching playlists.
- Empty-state copy reminds that playlist edits do not delete, move, or rename real files.

## Safety boundary

MVP-43 does not add filesystem write behavior, SQLite, downloader logic, metadata scraping, mpv, or any raw path exposure. It only adjusts UI models, copy, and display components.
