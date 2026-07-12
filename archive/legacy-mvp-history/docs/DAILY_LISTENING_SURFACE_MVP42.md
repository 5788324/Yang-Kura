# MVP-42 — Daily Listening Surface

MVP-42 adds a small user-facing layer for daily playback entry points.

## New service

`src/services/dailyListeningSurfaceService.ts`

Responsibilities:

- Summarize the current queue.
- Produce user-facing queue badges.
- Produce Dashboard daily-listening cards.
- Produce track badges for queue rows.
- Avoid any direct filesystem, URL resolution, downloader, SQLite, or metadata work.

## Dashboard changes

The Dashboard now has `mvp42-daily-listening-surface`.

It highlights:

- Continue listening.
- Current queue state.
- A useful playlist entry.
- Audio-library hints in Chinese.

## Queue drawer changes

The queue drawer now has `mvp42-queue-drawer-surface`.

It displays:

- Queue count.
- Total queue duration.
- Current queue position.
- Completion strategy.
- ASMR/music/local/subtitle badges per track.

## Safety rules

MVP-42 does not store or expose:

- `absolutePath`.
- `file://`.
- Temporary resolved media URLs.
- Real downloader state.
- SQLite state.

It does not delete, move, rename, copy, or repair user files.
