# MVP-14 Electron Shell Skeleton + Preload Type Contract

## Status

MVP-14 creates the first Electron-shaped files, but they are **contract-only stubs**.

Implemented files:

```text
electron/main.ts
electron/preload.ts
src/types/electron-api.d.ts
src/services/electronShellSkeletonContractService.ts
```

## What this stage allows

```text
- Define future Electron main-process responsibilities
- Define future preload namespace: window.yangKura
- Define typed stub methods:
  - selectLibraryRoot()
  - requestScannerDryRun()
  - getElectronShellStatus()
- Display the shell skeleton in DiagnosticsPage
```

## What this stage forbids

```text
- No Electron runtime dependency
- No BrowserWindow
- No contextBridge.exposeInMainWorld call
- No ipcMain.handle / ipcRenderer.invoke call
- No real directory picker
- No real directory scan
- No library-index.json write
- No SQLite
- No true audio playback
- No absolutePath returned to renderer
- No file:// URL generation
- No delete / move / rename / write file operations
```

## Design decision

MVP-13 defined the file access boundary. MVP-14 adds the first physical shell files while keeping them inert.

The point is to make the future Electron migration explicit without silently turning on file-system privileges.

## Future sequence

```text
MVP-15: add Electron dependency and shell build scripts, still no file access
MVP-16: run Vite UI inside Electron shell, preload namespace still stubbed
MVP-17: implement user-gesture-only directory picker returning root token only
MVP-18: implement read-only dry-run scanner for a small selected sample directory
MVP-19: add write-index preview and second confirmation gate
```
