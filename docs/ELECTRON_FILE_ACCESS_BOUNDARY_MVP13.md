# MVP-13 Electron Shell Boundary + File Access Contract

## Status

```text
planned-contract-only
```

MVP-13 does **not** implement Electron. It only defines the future file-access boundary before any real `main` / `preload` work begins.

Current hard limits:

```text
no Electron main/preload implementation
no real directory picker call
no real directory read
no library-index.json write
no SQLite access
no media playback
no file deletion / move / rename / metadata mutation
no absolute path or file:// exposure to renderer
```

---

## Why this exists

The project is close to the point where Electron could be added, but file access must not be introduced casually. This contract fixes the safe shape first:

```text
renderer UI
  -> narrow preload API
  -> main-side user-selected root token
  -> read-only dry-run preview
  -> no index write until a later explicit confirmation phase
```

---

## allowed IPC surface

MVP-13 defines these future channel names only:

```text
yang-kura:dialog:select-library-root
yang-kura:scanner:dry-run:request
yang-kura:scanner:dry-run:progress
yang-kura:scanner:dry-run:response
yang-kura:scanner:dry-run:error
yang-kura:scanner:dry-run:cancel
yang-kura:index:write-preview-request
```

These channels are contracts, not implementation. They must not be wired to real Electron in MVP-13.

---

## Directory picker contract

Future API:

```text
window.yangKura.selectLibraryRoot()
```

Rules:

```text
user gesture required
system directory picker only
returns rootPathToken
returns displayName
renderer does not receive absolutePath
renderer does not receive file:// URL
manual path text is not accepted as a scan source
```

The root token is an opaque handle used for later dry-run requests.

---

## Read-only dry-run scanner permission

Future permission:

```text
scanner.readOnlyDryRun
```

Allowed later, not now:

```text
canReadDirectoryEntries = true
```

Still forbidden:

```text
canReadFileBytes = false
canReadMediaMetadata = false
canWriteIndex = false
canMutateFiles = false
followSymlinks = false
```

Default limits:

```text
maxEntries = 5000
maxDepth = 8
```

---

## Path tokenization

Policy:

```text
path-tokenization-v1
```

Renderer receives:

```text
root token
relativePath
displayName
```

Renderer must not receive:

```text
absolute path
file:// URL
raw Node path object
```

Example renderer-safe shape:

```text
<root-token>/RJ01234567_雨音耳かき/01_本編.mp3
```

The absolute path stays on the main side.

---

## Preload exposure

Future namespace:

```text
window.yangKura
```

Allowed future methods:

```text
selectLibraryRoot()
requestScannerDryRun(envelope)
cancelScannerDryRun(correlationId)
onScannerDryRunProgress(listener)
onScannerDryRunResponse(listener)
onScannerDryRunError(listener)
```

Forbidden exposure:

```text
fs
path
shell
raw ipcRenderer
absolutePath passthrough
fileUrl passthrough
```

---

## Forbidden file mutation APIs

These APIs are explicitly forbidden in the scanner path:

```text
fs.rm / fs.unlink
fs.rename
fs.writeFile / fs.appendFile
fs.copyFile
fs.chmod / fs.chown
child_process.exec / spawn
fs.watch / chokidar
fetch remote metadata
```

Reason: Yang-Kura must prove read-only dry-run behavior before any persistent write path is introduced.

---

## Implementation phases

```text
MVP-13: contract only
MVP-14: Electron shell skeleton + stub preload API, still no real read
MVP-15: directory picker token flow, still no scan
MVP-16: read-only dry-run scanner for a small user-selected test folder
```

Do not skip directly to scanning `E:\arsm`.

