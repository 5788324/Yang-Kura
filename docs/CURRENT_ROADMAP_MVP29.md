# Yang-Kura CURRENT ROADMAP - MVP-29

## Goal

Create Windows desktop packaging for the existing MVP-28.2 Electron app without adding new business features.

## Scope

- Windows portable executable via electron-builder.
- Windows NSIS installer via electron-builder.
- release/ output directory.
- Keep stable Electron userData/session/cache/logs/crashDumps paths.
- Keep renderer path isolation: no absolutePath or file:// exposure.

## Out of Scope

- SQLite.
- Downloader integration.
- Network metadata scraping.
- UI redesign or player polish.
- Deleting, moving, or renaming user media files.

## Validation

Run npm ci, lint, build:electron, verify:all, build, audit, desktop smoke, validation bundle, desktop:pack, desktop:dist, and verify:mvp29-windows-packaging.
