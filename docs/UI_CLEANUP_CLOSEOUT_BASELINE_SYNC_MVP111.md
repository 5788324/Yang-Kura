# MVP111 — UI Cleanup Closeout + GitHub Baseline Sync

## Goal

MVP111 closes the MVP109–MVP110 UI daily-surface cleanup sequence and records the current GitHub baseline.

The user-facing application should continue to behave like a local media library, not like an AI engineering console.

## Baseline status

| Line | Status |
|---|---|
| GitHub main | `0.146.0-mvp108 / 2e4a4aa` |
| Local package | `0.149.0-mvp111` |
| Importer | MVP108 command + smoke validation PASS |
| MVP109–MVP111 | Pending UI cleanup packages to merge after validation |

## What changed

- Added a small UI closeout model: `uiCleanupCloseoutBaselineSyncService`.
- Added dashboard closeout card: `mvp111-ui-cleanup-closeout`.
- Added settings baseline sync section: `mvp111-github-baseline-sync`.
- Updated project handoff and state docs to prevent confusion between GitHub main and local MVP111 package.
- Added `verify:mvp111-ui-cleanup-closeout-baseline-sync`.

## What did not change

- Importer copy-only executor.
- Importer move-only executor.
- Scanner.
- `library-index.json` write/read logic.
- Local audio playback.
- Lyrics/subtitle read.
- External open.
- Packaging configuration.

## Next recommended feature

After MVP109–MVP111 are merged, start:

```text
Metadata Override / 本地元数据编辑层
```

The first metadata phase should be local-only:

- title;
- RJ code;
- circle;
- CV;
- tags;
- cover selection;
- notes;
- rating;
- play/listening status;
- music artist / album / track fields.

No network provider should be added in the first metadata phase.
