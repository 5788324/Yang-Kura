# CURRENT ROADMAP — MVP-47

Version: `0.85.0-mvp47`

## Focus

MVP-47 performs packaged-app regression validation preparation and small diagnostics copy cleanup after MVP-46 library-browse polish.

## Scope

- Add a packaged-app regression checklist model for the current Windows desktop flow.
- Surface the checklist in Diagnostics as a compact Chinese user-facing block.
- Update `desktop-smoke-check.mjs` so the advisory checklist reflects the current MVP-47 chain.
- Clean risky old diagnostics demo wording that implied downloads, SQLite writes, physical renames or physical deletes.
- Keep homepage, library pages, player, scanner, index writer, lyrics reader, and actual packaging logic unchanged.

## Out of scope

- SQLite
- downloader
- ASMR.one / DLsite metadata scraping
- mpv backend
- file deletion / move / rename
- absolutePath or file:// exposure to renderer
- new scanner, index writer, playback engine, lyrics reader, or installer behavior

## Next

MVP-48 should be a Beta 0.1 stage closeout package if MVP-47 validation remains stable.
