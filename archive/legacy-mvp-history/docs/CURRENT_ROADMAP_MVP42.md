# Yang-Kura Current Roadmap — MVP-42

Version: `0.80.0-mvp42`

## Current focus

MVP-42 continues the planned media-product polish stage. The goal is to make the daily listening surfaces feel like a usable audio library rather than a diagnostic panel.

## Completed in MVP-42

- Added `dailyListeningSurfaceService` for user-facing daily listening summaries.
- Added a Dashboard daily-listening block for continue listening, queue status, and playlist entry.
- Improved the queue drawer with queue count, duration, current position, completion strategy, and track badges.
- Updated the app header copy to `日常播放 / 媒体库体验`.
- Kept diagnostics, scanner, index, and technical wording out of the new main listening surfaces.

## Still intentionally out of scope

- SQLite.
- Real downloader.
- ASMR.one / DLsite metadata scraping.
- mpv backend.
- File delete / move / rename.
- Renderer exposure of `absolutePath` or `file://`.

## Next recommended stage

MVP-43 should continue media-product polish, preferably around collection/detail navigation and empty states, before starting any larger backend or downloader work.
