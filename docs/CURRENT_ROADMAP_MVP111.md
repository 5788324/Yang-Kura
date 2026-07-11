# Current Roadmap — MVP111

Current package version: `0.149.0-mvp111`.

## Current formal GitHub baseline

```text
GitHub main = 0.146.0-mvp108
Git HEAD = 2e4a4aa feat: add MVP108 importer final regression checklist
status = clean at Codex validation time
```

MVP108 is the last confirmed and pushed main-branch baseline. It passed importer command validation and small-sample importer smoke checks.

## Current local source package

```text
MVP109: UI engineering panel cleanup
MVP110: global daily UI cleanup
MVP111: UI cleanup closeout + GitHub baseline sync
```

These packages are UI/documentation closeout packages on top of MVP108. They do not alter importer execution, scanner, library-index write/read, local playback, lyrics read, or external-open chains.

## Recommended order

1. Merge MVP109/MVP110/MVP111 after normal command validation.
2. Do not re-open importer feature work unless the desktop UI test finds a concrete bug.
3. Start the next product feature as `Metadata Override / 本地元数据编辑层`.

## Guardrails

- No SQLite.
- No real downloader provider.
- No network metadata provider.
- No mpv backend.
- No deletion / move / rename of real media files.
- No absolutePath / file:// exposure in daily surfaces.
