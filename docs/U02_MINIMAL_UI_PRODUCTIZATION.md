# U02 Minimal UI Productization

## Scope

This branch starts from clean `0.167.0-mvp129` and only productizes first-run UI behavior:

- clean profiles start without mock works, albums, favorites, recent plays, or seeded playlists;
- the header reports real library state instead of development-stage text;
- the home page has a direct empty-library action and no visible MVP110/MVP111 closeout panels;
- daily media/import navigation is separated from settings, download planning, and diagnostics;
- existing localStorage and real Local JSON Index loading remain supported.

## Boundaries

No Electron, playback, mpv fixture, importer, diagnostics, settings, index write/backup/restore, SQLite, downloader implementation, or stable-regression runner behavior was changed.

## Verification

```powershell
node scripts/verify-u02-minimal-ui-productization.mjs
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm run verify:stable
npm run build
```
