# MVP-15 Electron Dependency + Shell Launch Scripts

## Goal

MVP-15 moves Yang-Kura from an Electron type/skeleton contract to a runnable shell chain:

```text
electron/main.ts
+ electron/preload.ts
+ tsconfig.electron.json
+ npm scripts
```

The shell may open the current React/Vite UI when the Electron binary is installed, but it still does not implement real library access.

## Added scripts

```bash
npm run build:electron
npm run desktop:dev
npm run desktop:preview
npm run electron:install
npm run verify:mvp15-electron-launch-scripts
```

## Runtime behavior

`electron/main.ts` may now:

```text
create BrowserWindow
load Vite dev URL in desktop:dev
load dist/index.html in desktop:preview
use preload.js
```

`electron/preload.ts` may now expose:

```text
window.yangKura.getElectronShellStatus()
window.yangKura.selectLibraryRoot()
window.yangKura.requestScannerDryRun()
```

The last two methods are disabled runtime stubs.

## Still forbidden

- No directory picker
- No scanner IPC
- No real directory traversal
- No library-index.json write
- No SQLite
- No real audio playback
- No absolute path returned to renderer
- No file mutation APIs

## Validation

Run:

```bash
npm ci
npm run lint
npm run build:electron
npm run verify:mvp15-electron-launch-scripts
npm run verify:all
npm run build
npm audit --audit-level=high
```

Manual smoke test:

```bash
npm run desktop:dev
```

Expected result:

```text
Electron window opens current Vite UI when Electron binary installation succeeds.
window.yangKura exists only inside Electron.
Directory picker returns disabled stub response.
Scanner dry-run returns disabled stub response.
No real disk access occurs.
```

## Next stage

MVP-16 should add a renderer-side Electron status probe so Diagnostics can show whether `window.yangKura` is available at runtime. It should still avoid real directory access.

## Electron binary note

`electron` is stored as an optional dependency so `npm ci` can still validate source code in network-restricted environments where the Electron binary download is blocked. To run the desktop shell, install the binary explicitly:

```bash
npm run electron:install
```

This does not enable any file access capability by itself.
