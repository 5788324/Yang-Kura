# Yang-Kura Current Roadmap — MVP110

## Version

`0.148.0-mvp110`

## Focus

MVP110 continues the global UI daily-use cleanup after MVP109.

The product rule is:

```text
主界面媒体感优先，工程信息后置。
```

## Completed in MVP110

- Dashboard: adds a daily-use surface summary for media-first entry points.
- Settings: rewrites visible token / dry-run / Renderer wording into normal user language.
- Downloader: downgrades the page to a future planning entry and removes misleading provider / encrypted-channel wording.
- Services: adds `globalDailyUiCleanupService` as the model for this cleanup round.
- Verification: adds `verify:mvp110-global-daily-ui-cleanup`.

## Out of scope

- No copy-only executor changes.
- No move-only executor changes.
- No scanner changes.
- No `library-index.json` write/read changes.
- No SQLite.
- No real downloader source.
- No metadata provider.
- No mpv.
- No deletion / movement / rename of real media files.
- No `absolutePath` or `file://` exposure in user-facing UI.

## Next decision

Wait for Codex importer acceptance feedback.

If the importer has real-machine failures, the next round should be a minimal importer bugfix.

If acceptance passes, continue either:

1. MVP111 — final UI wording sweep for Settings / Diagnostics default view / Downloader placeholder; or
2. MVP111 — local metadata override model if UI daily-use cleanup is acceptable.
