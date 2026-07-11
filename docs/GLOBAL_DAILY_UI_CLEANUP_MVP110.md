# MVP110 — Global Daily UI Cleanup

## Goal

MVP110 reduces the remaining “AI engineering panel” feel across daily surfaces.

The user-facing application should read as a local media library, not as a project status console.

## Changed visible surfaces

### Dashboard

Adds a `mvp110-dashboard-daily-surface` block that explains the daily surface rule in user-facing Chinese.

### Settings

Rewrites visible technical wording:

| Before | After |
|---|---|
| `rootPathToken` | 目录授权 / 页面显示目录名称 |
| `dry-run` | 目录预览 |
| `Renderer` | 页面 |
| `读取现有 index` | 读取已有记录 |
| `absolutePath / file://` visible copy | hidden maintenance anchor only |

### Downloader

Downgrades the page into a future-planning placeholder:

- no real download claim;
- no real provider claim;
- no encrypted-channel wording;
- no “metadata fetched through proxy” wording;
- no database-ready implication.

## Maintenance preservation

The cleanup does not delete maintenance context. Internal markers and historic verifier anchors remain as comments, `sr-only`, or diagnostics-only text.

## Guardrails

- No scanner change.
- No importer executor change.
- No index write/read change.
- No SQLite.
- No downloader implementation.
- No metadata provider.
- No mpv.
- No real file mutation.
