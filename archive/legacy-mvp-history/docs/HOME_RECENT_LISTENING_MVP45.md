# MVP-45 — 首页 / 最近播放 / 继续播放表层产品化

## Goal

MVP-45 makes the first screen more useful as a personal local audio player. The home page now prioritizes:

1. **继续播放** — a large, media-first continue-listening card with cover, progress, source and subtitle badges.
2. **最近播放** — richer recent-play cards with progress, kind, source and subtitle status.
3. **快捷入口** — 音声库、音乐库、歌单、导入 / 更新资源库.
4. **资源库状态** — still visible, but compact and user-facing rather than engineering-heavy.

## Added

- `src/services/homeRecentListeningService.ts`
- `docs/CURRENT_ROADMAP_MVP45.md`
- `docs/HOME_RECENT_LISTENING_MVP45.md`
- `scripts/verify-mvp45-home-recent-listening.mjs`

## UI changes

### Dashboard

Dashboard now includes these MVP-45 sections:

- `mvp45-home-continue-listening`
- `mvp45-home-quick-entry`
- `mvp45-home-recent-listening`

The page keeps previous compatibility anchors:

- `mvp42-daily-listening-surface`
- `mvp39-media-overview`

The visible surface is more Chinese and media-oriented. It avoids exposing scanner / contract / bridge / engine wording on the home page.

### Service model

`homeRecentListeningService` computes the UI model for:

- continue-listening card
- recent playback cards
- quick entry cards
- source / subtitle / progress badges

This keeps Dashboard layout code simpler and prevents more playback/product logic from accumulating directly inside the component.

## Safety

MVP-45 does not add backend capability. It does not introduce:

- SQLite
- downloader
- ASMR.one / DLsite metadata scraping
- mpv
- file deletion / move / rename
- raw absolute paths
- file:// exposure

No real media files are deleted, moved, renamed, copied, or rewritten.

## Explicit scope wording

- 不接 SQLite。
- 不删除 / 移动 / 重命名用户真实媒体文件。
