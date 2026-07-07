# MVP-38 UI Copy Cleanup

## Principle

主界面媒体感优先，工程信息后置。

Yang-Kura already has real packaged-app capability: local index read/write, HTMLAudio playback, lyrics reading, external opening, queue/history/playlist persistence, and local cover artwork. The user-facing surfaces should now present those capabilities as a media library, not as a diagnostic console.

## User-facing surfaces cleaned in MVP-38

| Surface | Cleanup |
|---|---|
| App top bar | Removed MVP/version-style badge from the primary header. |
| Sidebar | Replaced development-build wording with local media-library wording. |
| Dashboard | Reworded resource-library status to avoid raw technical index phrasing. |
| ASMR Library | Replaced “真实 index / 演示 / 诊断状态” with “本地资源 / 示例资源 / 资源状态”. |
| Playlists | Replaced system demo wording with system example wording. |
| Downloader | Kept Coming Soon state, removed claims of crawler, SQLite write, physical disk readiness, and real sandbox behavior. |

## Technical information placement

Detailed terms such as IPC, Contract, Stub, Dry-run, Electron channel, scanner envelopes, and MVP history should stay in:

- Diagnostics
- developer-facing docs
- verification scripts
- handoff files

They should not dominate:

- Dashboard
- Player surfaces
- ASMR Library
- Music Library
- Playlist pages

## Safety boundary

This cleanup is text/UI-only. It does not change media-file behavior.

Still forbidden:

- deleting files
- moving files
- renaming files
- writing SQLite
- starting real downloads
- scraping ASMR.one / DLsite metadata
- exposing absolute paths or `file://` URLs to renderer
