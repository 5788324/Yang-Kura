# MVP-17 Electron Shell Smoke Check UI

MVP-17 adds a renderer-side smoke-check UI for the Electron preload bridge stubs.

## Goal

The diagnostic UI can call the three `window.yangKura` methods that were typed in MVP-14 and exposed as runtime stubs in MVP-15:

```text
getElectronShellStatus()
selectLibraryRoot()
requestScannerDryRun()
```

The purpose is only to prove renderer-to-preload reachability in Electron shell mode.

## Current behavior

- Browser/Vite mode: `window.yangKura` is absent, so the smoke check reports `blocked` safely.
- Electron stub mode: `window.yangKura` exists and each method returns a disabled stub response.
- The smoke check treats disabled stub responses as a pass because file access must remain off.

## Forbidden in MVP-17

```text
no real directory picker
no scanner IPC implementation
no real directory traversal
no library-index.json writes
no SQLite integration
no real audio playback integration
no absolute path returned to renderer
no file mutation APIs
```

## Next step

MVP-18 can begin implementing a directory-picker stub contract or Electron smoke validation script. Real directory selection should still stay tokenized and read-only until the explicit dry-run phase.
