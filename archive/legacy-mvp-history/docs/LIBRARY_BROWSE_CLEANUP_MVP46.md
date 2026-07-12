# MVP-46 — 音声库 / 音乐库浏览细节统一

## Goal

MVP-46 keeps the project moving toward a Chinese local media player instead of a tool dashboard. It cleans the library browsing surfaces without changing backend capability.

## Added

- `src/services/libraryBrowseSurfaceService.ts`
- `docs/CURRENT_ROADMAP_MVP46.md`
- `docs/LIBRARY_BROWSE_CLEANUP_MVP46.md`
- `scripts/verify-mvp46-library-browse-cleanup.mjs`

## UI changes

### 音声库

- Adds `mvp46-asmr-browse-summary` for a cleaner browse summary.
- Summary cards show 作品、音轨、本地、字幕.
- Active filters are displayed as small Chinese chips.
- A reset button appears only when filters are active.
- The mode text is simplified to `封面浏览` / `列表浏览`.
- The old “物理文件大小” sort copy is changed to user-facing file-count wording.

### 音乐库

- Adds `mvp46-music-browse-summary` for the matching music-library browse summary.
- Summary cards show 专辑、歌曲、本地、歌词.
- Active drill-down state is shown with compact chips.
- The page title is simplified to `音乐库`.
- The track-list helper copy clarifies that normal audio plays inline while video/image entries open externally.

## Code structure

`libraryBrowseSurfaceService` centralizes the browsing summary model for ASMR and music pages. Components keep rendering/layout work and no longer need to build every summary label inline.

## Cleanup

- Stale MVP-45 package manifest is replaced by the MVP-46 handoff manifest.
- The handoff file is renamed from the old MVP-44→MVP-45 label to MVP-46 current handoff naming.
- README / PROJECT_STATE / NEXT_CHAT_HANDOFF / RUN_ME_FIRST and docs copies are updated to 0.84.0-mvp46.

## Safety

MVP-46 does not add backend capability. It does not introduce:

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
- Renderer 不接收 absolutePath。
- Renderer 不接收 file://。
