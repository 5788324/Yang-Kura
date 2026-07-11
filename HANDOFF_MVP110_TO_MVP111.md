# Handoff — MVP110 to MVP111

## From

`0.148.0-mvp110` — global daily UI cleanup.

## To

`0.149.0-mvp111` — UI cleanup closeout + GitHub baseline sync.

## Context

Codex completed MVP108 merge and validation:

```text
GitHub main = 0.146.0-mvp108
HEAD = 2e4a4aa feat: add MVP108 importer final regression checklist
importer smoke test = PASS
```

MVP109 and MVP110 were local source packages focused on reducing AI engineering-panel feel. MVP111 records this state and prepares the sequence for later GitHub merge.

## This package changes

- Adds `src/services/uiCleanupCloseoutBaselineSyncService.ts`.
- Adds dashboard closeout UI block.
- Adds settings GitHub baseline sync UI block.
- Adds MVP111 docs and verifier.
- Updates project state and next-chat handoff docs.

## This package does not change

- Importer copy/move execution.
- Scanner.
- Library index write/read.
- Playback.
- Lyrics/subtitle read.
- External-open.
- SQLite / downloader / metadata provider / mpv.

## Suggested next step

If merging to GitHub, run command validation only. No new Codex feature work is required unless validation fails.
