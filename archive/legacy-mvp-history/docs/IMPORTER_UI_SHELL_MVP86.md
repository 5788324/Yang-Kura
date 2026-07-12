# IMPORTER_UI_SHELL_MVP86

Version: `0.124.0-mvp86`

## Summary

MVP-86 adds the first user-facing importer page. It is a preview shell only.

The page uses the MVP-85 contracts:

- `ImportTaskContract`
- `ImportFileContract`
- `MetadataSourceContract`
- `ImportTargetPlanContract`
- `ImportConflictReportContract`

## User-facing result

The sidebar now has a `导入器` entry. The page shows:

1. Import source options.
2. Preview steps.
3. A mock RJ import task.
4. Source files.
5. Metadata candidates.
6. Conflict preview.
7. Target path plan.
8. Disabled execution action.
9. Safety guardrails.

## Markers

- `mvp86-importer-ui-shell`
- `mvp86-import-source-options`
- `mvp86-import-preview-steps`
- `mvp86-import-preview-task`
- `mvp86-import-file-list`
- `mvp86-import-metadata-preview`
- `mvp86-import-conflict-preview`
- `mvp86-import-target-plan-preview`
- `mvp86-importer-guardrails`
- `mvp86-importer-disabled-execute-button`

## Safety

MVP-86 does not implement real import execution. It does not call:

- `fs.copyFile`
- `fs.rename`
- `fs.rm`
- `fs.unlink`
- real import IPC
- real directory scan
- network metadata fetch

Paths shown in the page are tokenized and relative examples only. The Renderer still must not receive `absolutePath` or `file://`.

## Next round

MVP-87 should start RJ album import recognition in read-only mode.
