# MVP-11 Dry-Run IPC Stub Contract

## Status

```text
planned-stub-only
```

MVP-11 defines the future dry-run scanner IPC surface for Yang-Kura. It does not implement a real Electron main process, does not access real directories, and does not write `library-index.json`.

## Scope

This stage adds a UI-visible contract for:

```text
IPC channel names
request envelope
response envelope
error envelope
dry-run only stub result
blocked reasons
forbidden actions
```

## Channel names

```text
yang-kura:scanner:dry-run:request
yang-kura:scanner:dry-run:response
yang-kura:scanner:dry-run:error
yang-kura:scanner:dry-run:progress
yang-kura:scanner:dry-run:cancel
```

These names are contract placeholders only. No real IPC bridge is wired in this stage.

## Request envelope

```ts
ScannerIpcRequestEnvelopeContract {
  envelopeVersion: 1;
  channel: 'yang-kura:scanner:dry-run:request';
  correlationId: string;
  requestKind: 'scanner-dry-run';
  payloadShape: 'ScannerDryRunRequestContract';
  payload: ScannerDryRunRequestContract;
  rendererOnly: true;
  requiresUserConfirmation: true;
}
```

Required safety invariants:

```text
payload.mode = dry-run
payload.previewOnly = true
payload.limits.followSymlinks = false
payload.limits.allowFileMutation = false
payload.limits.allowIndexWrite = false
```

## Response envelope

```ts
ScannerIpcResponseEnvelopeContract {
  envelopeVersion: 1;
  channel: 'yang-kura:scanner:dry-run:response';
  correlationId: string;
  ok: true;
  payloadShape: 'PlannedDryRunScannerResultContract';
  payload: PlannedDryRunScannerResultContract;
  indexWriteAllowed: false;
  responseSource: 'planned-stub';
}
```

The response is always a stub result in MVP-11. It reuses `PlannedDryRunScannerResultContract` from MVP-10.

## Error envelope

```ts
ScannerIpcErrorEnvelopeContract {
  envelopeVersion: 1;
  channel: 'yang-kura:scanner:dry-run:error';
  correlationId: string;
  ok: false;
  errorCode: ScannerIpcErrorCode;
  message: string;
  hint: string;
  blockedReasons: ScannerDryRunBlockedReasonContract[];
}
```

## Forbidden in MVP-11

```text
no real Electron IPC implementation
no real directory access
no library-index.json write
no SQLite access
no media playback
no file deletion/move/metadata mutation
```

## Files

```text
src/services/plannedScannerIpcStubContractService.ts
src/components/DiagnosticsPage.tsx
scripts/verify-mvp11-dry-run-ipc-stub.mjs
docs/DRY_RUN_IPC_STUB_CONTRACT_MVP11.md
```
