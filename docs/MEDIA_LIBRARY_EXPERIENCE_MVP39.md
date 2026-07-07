# MVP-39 — Media Library Experience Polish

MVP-39 is a user-experience cleanup pass after playback history, queue persistence, playlist persistence, local covers, and first-round UI copy cleanup.

## What changed

### Dashboard

The dashboard now has a media-library overview block with four daily-use cards:

- Continue playing
- ASMR works
- Music tracks
- Playlists

The cards are user-facing and avoid scanner / IPC / build terminology.

### Settings

The Settings resource-library page keeps the daily flow visible:

```text
choose directory
→ read existing resource record
→ one-click scan and apply
```

Advanced operations are now folded behind “高级资源库工具”:

- scan preview
- write preview
- index write confirmation
- scanner safety workflow details

This reduces engineering noise in the normal settings path while keeping all diagnostics and safety controls available.

## Safety

No behavior in this stage mutates real media files.

The existing boundaries remain:

- no delete / move / rename
- no SQLite write
- no downloader
- no network metadata scraping
- no mpv process
- no raw absolute path returned to renderer
- no `file://` returned to renderer

## Validation

Use:

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
