# MVP-10 Planned Dry-Run Scanner Result Contract

## Status

MVP-10 is a **planned contract only** milestone.

It defines the future shape of a real scanner dry-run result before any real filesystem access exists.

Current stage still does **not**:

```text
read real directories
scan E:\arsm
write library-index.json
connect Electron IPC
connect SQLite
play media
read real LRC/SRT/VTT/ASS files
move/delete/rename files
```

## Purpose

The next real scanner must be split into two phases:

```text
phase 1: dry-run preview
phase 2: write-index only after explicit user confirmation
```

MVP-10 locks the dry-run output contract so later Electron work cannot silently jump into file mutation or index writing.

## New service

```text
src/services/plannedDryRunScannerResultContractService.ts
```

The service exports:

```text
plannedDryRunScannerResultContractService.getContract()
```

The returned contract includes:

```text
ScannerDryRunRequestContract
ScannerDryRunPreviewSummaryContract
ScannerDryRunDiscoveredEntryContract[]
ScannerDryRunWarningContract[]
ScannerDryRunBlockedReasonContract[]
ScannerDryRunOutputShapeContract
safetyChecklist
nextActions
```

## ScannerRequest contract

Required request fields:

```text
requestVersion = 1
rootId
rootLabel
rootPathToken = <user-selected-root>
libraryType = asmr / music / mixed
scanProfile = asmr-rj / music-folder / mixed-folder
mode = dry-run
previewOnly = true
limits
```

Safety limits:

```text
maxEntries = 5000
maxDepth = 8
includeHidden = false
followSymlinks = false
allowNetwork = false
allowFileMutation = false
allowIndexWrite = false
```

## Dry-run result contract

The future dry-run result must expose:

```text
sourceKind = electron-scan
previewOnly = true
discoveredEntryCount
collectionCandidateCount
trackCandidateCount
coverCandidateCount
subtitleCandidateCount
warningCount
blockedReasonCount
canWriteIndex = false
```

The output shape is intentionally explicit:

```text
localJsonIndexDraft: LocalJsonIndex | undefined
scannerReport: FixtureScannerReport-compatible summary | undefined
discoveredEntries: ScannerDryRunDiscoveredEntry[]
warnings: ScannerDryRunWarning[]
blockedReasons: ScannerDryRunBlockedReason[]
writeTarget: never during dry-run
```

## Discovered entries

Each discovered entry must be relative-path based:

```text
id
relativePath
entryKind
parserStatus
plannedAction
collectionCandidate
trackCandidate
rjIdNorm
warningCodes
```

Forbidden in MVP-10 / dry-run UI layer:

```text
absolutePath
fileUrl
file handles
real media reads
real subtitle reads
```

## UI exposure

`DiagnosticsPage` now shows:

```text
MVP-10 Planned Dry-Run Scanner Result Contract
ScannerRequest dry-run contract
preview summary / output shape
discoveredEntries contract sample
warnings
blockedReasons
safety checklist
```

## Verification

New verification script:

```text
scripts/verify-mvp10-dry-run-contract.mjs
```

It checks:

```text
service exists
DiagnosticsPage exposes MVP-10 contract
package scripts include verify:mvp10-dry-run-contract
contract includes ScannerDryRunRequest / ScannerDryRunResult structure
service does not import fs/electron/sqlite/child_process/localStorage/new Audio
```
