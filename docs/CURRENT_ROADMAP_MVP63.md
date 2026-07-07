# CURRENT ROADMAP — MVP-63

Version: `0.101.0-mvp63`

## Focus

MVP-63 is a narrow Electron GUI regression fix round after the MVP-62 local Codex report returned NEEDS_FIX.

## Scope

- Fix Electron resolved binary path parsing when `path.txt` is basename-only, e.g. `electron.exe`.
- Ensure `desktop:setup` and `desktop:smoke-check:strict` check `node_modules/electron/dist/electron.exe` before legacy package-root fallback.
- Keep Windows `.cmd` launch through `cmd.exe /d /c`.
- Document that Diagnostics black-view behavior still needs GUI retest after strict smoke passes.

## Non-goals

No SQLite, downloader, metadata scraping, mpv, real file mutation, scanner/index/playback core changes, or large component splitting.
