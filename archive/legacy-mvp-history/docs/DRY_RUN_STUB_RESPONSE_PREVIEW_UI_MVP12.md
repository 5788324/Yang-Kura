# MVP-12 Dry-Run Stub Response Preview UI

## Goal

MVP-12 turns the MVP-11 dry-run IPC stub contract into a UI-facing preview model.

It is still a planned/stub layer. It does not send Electron IPC, does not read real directories, and does not write `library-index.json`.

```text
plannedScannerIpcStubContractService
  -> plannedDryRunStubPreviewUiService
  -> DiagnosticsPage preview section
```

## Added files

```text
src/services/plannedDryRunStubPreviewUiService.ts
scripts/verify-mvp12-dry-run-stub-preview-ui.mjs
docs/DRY_RUN_STUB_RESPONSE_PREVIEW_UI_MVP12.md
```

## UI preview sections

DiagnosticsPage now shows:

```text
MVP-12 Dry-Run Stub Response Preview UI
- request envelope preview
- response payload preview
- error state preview
- dry-run result cards
- warning preview cards
- still no real Electron IPC
```

## Contract model

The service exposes:

```text
PlannedDryRunStubPreviewUiModel
DryRunRequestEnvelopePreview
DryRunResponsePayloadPreview
DryRunErrorStatePreview
DryRunResultPreviewCard
DryRunWarningPreviewCard
```

The preview model is derived from the MVP-11 IPC stub contract and MVP-10 dry-run result contract. It does not duplicate scanner business logic.

## Hard boundaries

MVP-12 is forbidden from doing any of the following:

```text
no real Electron IPC call
no real directory read
no library-index.json write
no SQLite access
no media playback
no file mutation
```

## Acceptance

```text
npm run verify:mvp12-dry-run-stub-preview-ui
npm run verify:all
npm run build
npm audit --audit-level=high
```
