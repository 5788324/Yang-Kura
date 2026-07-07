# CURRENT ROADMAP — MVP-41

Version: `0.79.0-mvp41`

## Focus

MVP-41 continues the existing media-product polish plan. The scope is the full-player listening surface: player detail page, lyrics-focused page, inline player copy, and user-facing playback state presentation.

## Completed

- Added `playerSurfaceExperienceService` for player-page chips, stats, listening context, lyric hints, and footer status copy.
- Player detail page now shows user-facing chips such as 音声 / 音乐, 本地资源 / 示例资源, 有歌词, RJ号, and playback stop strategy.
- Player detail page now shows compact stats for duration, progress, queue length, and lyric line count.
- Player header now uses listening-surface copy instead of technical playback-build wording.
- Lyrics empty state now uses a contextual user-facing hint instead of generic engineering copy.
- Queue, chapter, and bookmark labels were simplified to normal media-library Chinese.
- Player bar floating lyrics copy was renamed from desktop-oriented wording to “歌词浮窗”, avoiding a false OS-level feature claim.

## Boundaries

No SQLite, downloader, metadata scraping, mpv backend, raw absolute path exposure, `file://` exposure, or file delete/move/rename behavior is added.

## Next

MVP-42 should continue the planned polish pass around daily listening surfaces. Recommended next scope: player queue drawer / playlist interactions / recent playback surfaces, while keeping backend expansion postponed.
