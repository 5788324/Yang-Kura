# MVP-63 — Electron resolved binary path false-negative fix

Version: `0.101.0-mvp63`

MVP-63 is a small fix round for the MVP-62 local Codex regression report. The report confirmed that Electron itself was usable and `cmd.exe /d /c node_modules\.bin\electron.cmd --version` returned `v39.8.1`, but `desktop:setup` and `desktop:smoke-check:strict` failed because scripts resolved `path.txt` incorrectly.

## Root cause

On the tested Windows machine:

```text
node_modules/electron/path.txt = electron.exe
actual binary = node_modules/electron/dist/electron.exe
wrong script check = node_modules/electron/electron.exe
```

This caused a false negative.

## Fix

Both files now use candidate path resolution:

```text
getElectronResolvedBinaryCandidatePaths
path.isAbsolute(relativeBinary)
basename-only path.txt
node_modules/electron/dist/electron.exe
node_modules/electron/electron.exe fallback
```

Changed files:

- `scripts/setup-electron-desktop.mjs`
- `scripts/desktop-smoke-check.mjs`

## UI / diagnostics markers

```text
mvp63-electron-binary-path-fix
mvp63-electron-binary-path-fix-review
```

## Retest focus

```bash
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

Codex should verify:

- `path.txt` can be `electron.exe`.
- strict smoke checks `dist/electron.exe`.
- `.cmd` still launches through `cmd.exe /d /c`.
- `dev:electron` opens `Yang-Kura Audio Library`.
- Diagnostics page is manually rechecked because MVP-62 reported a black-view / black-screen partial result.

## Safety boundary

MVP-63 不新增业务功能。MVP-63 does not add SQLite, downloader, metadata scraping, mpv, real file delete / move / rename, scanner/index/playback core changes, or large component splitting. Renderer still must not receive `absolutePath` or `file://`.
