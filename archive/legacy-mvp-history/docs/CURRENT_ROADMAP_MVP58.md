# CURRENT ROADMAP — MVP-58

Version: `0.96.0-mvp58`

## Focus

MVP-58 is a settings/about polish round for personal local use.

Main goal:

```text
Settings daily flow becomes clearer:
choose library → read local record → return to player.
```

## What changed

- Added `src/services/settingsPersonalWorkflowService.ts`.
- Settings page adds `mvp58-settings-personal-workflow`.
- About page adds `mvp58-about-personal-privacy`.
- Diagnostics page adds `mvp58-settings-personal-workflow-review`.
- About copy no longer presents the app as a cloud/commercial/AI demo product.
- Privacy copy now says local records, no upload, tokenized root, no real-file mutation.

## Still not included

- SQLite.
- Downloader.
- Metadata scraping.
- mpv backend.
- Advanced file organization.
- Batch rename.
- Large component split.
