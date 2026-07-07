# Yang-Kura CURRENT ROADMAP — MVP-32

## Status

Version: `0.70.0-mvp32`

MVP-32 continues the packaged-app usability track. The app already scans a selected local root, writes `library-index.json`, reads it back into ASMR/music pages, plays local audio, reads subtitles, opens external files, builds Windows packages, and stores playback history.

## MVP-32 Scope

MVP-32 focuses on startup and index-recovery guidance:

1. Remember the last selected library display name without persisting absolute paths.
2. Remember the last successful `library-index.json` read/write summary.
3. Show packaged users that after restart they must reselect the same directory to restore Electron main-side permission/token state.
4. Show a clear home-page resource-library status card.
5. Show a Settings-page “last library” card with collection/track counts and last read time.

## Still out of scope

- SQLite
- Downloader
- Metadata scraping
- File deletion/move/rename
- Large UI redesign
- NetEase-style player visual overhaul
