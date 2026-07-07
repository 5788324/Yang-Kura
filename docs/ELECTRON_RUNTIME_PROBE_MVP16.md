# MVP-16 Renderer-Side Electron Status Probe

## Goal

MVP-16 adds a renderer-side status probe so the UI can tell whether it is running in normal Browser/Vite mode or inside the Electron shell stub.

This is still not a filesystem feature.

## Added files

```text
src/services/electronRuntimeProbeService.ts
scripts/verify-mvp16-electron-runtime-probe.mjs
docs/ELECTRON_RUNTIME_PROBE_MVP16.md
```

Updated UI:

```text
src/components/DiagnosticsPage.tsx
src/components/SettingsPage.tsx
```

## Runtime detection

The renderer checks:

```text
window.yangKura exists?
window.yangKura.getElectronShellStatus() works?
```

Possible modes:

```text
browser-vite     no preload bridge detected

electron-stub    preload bridge detected and status returned

probe-error      bridge exists but status probe failed safely
```

## What the probe displays

Diagnostics and Settings can now show:

```text
current runtime mode
whether window.yangKura is present
how the status was checked
preload shell status, when available
safe/blocked capability cards
probe notes
forbidden actions
```

## Safety boundary

MVP-16 does not implement:

```text
real directory picker
real scanner IPC
real directory traversal
library-index.json write
SQLite integration
real audio playback
absolute path exposure
file mutation APIs
```

The probe only reads an already-exposed stub method when running in Electron. In Browser/Vite mode it reports `browser-vite` and stops.

## Expected behavior

In `npm run dev` browser mode:

```text
mode = browser-vite
bridgeDetected = false
file access = disabled
```

In `npm run desktop:dev` after Electron is installed:

```text
mode = electron-stub
bridgeDetected = true
status = mvp15-shell-runtime-stub
file access = disabled
```

The Electron shell status remains `mvp15-shell-runtime-stub` because MVP-15 created the shell runtime stub. MVP-16 adds renderer-side detection and UI display for it.
