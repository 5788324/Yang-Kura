# MVP129 Stabilization Round 4 — Windows Release Gate Fix

## Scope

This patch only addresses findings from the Round 3 Windows acceptance report.

### P1: Windows mpv fixture

The old runtime test copied a JavaScript fixture and renamed it `mpv.exe`. Windows cannot execute that file as a PE executable.

The test now copies the current Windows `node.exe` to a temporary file named `mpv.exe`. Running `mpv.exe --version` exercises the same direct `spawn()` path with a real Windows executable. The selected path, persistence, reload and clear behavior remain covered.

### P1: electron-builder blockmap import

The compatibility patch now:

- checks both `app-builder-lib/out/.../blockmap.js` and `app-builder-lib/src/.../blockmap.ts`;
- patches CommonJS and TypeScript import forms;
- fails when no blockmap implementation is found;
- fails if an incompatible import remains;
- verifies that the compiled blockmap module and `@noble/hashes/blake2b` can load;
- runs explicitly before `desktop:pack` and `desktop:dist`;
- also runs during `desktop:setup`.

In the non-Windows stabilization environment, `desktop:pack` passed the previous blockmap failure point and entered Windows packaging. It later stopped only because `github.com` could not be resolved to download the Windows Electron artifact.

### P2: current validation command

`desktop-smoke-check` now identifies the MVP129 stable candidate and recommends `npm run verify:stable`. The historical `verify:all` command is retained for archive compatibility but is not a release gate.

## Required Windows re-test

1. `npm ci --ignore-scripts`
2. `npm run build:electron`
3. `npm run test:mpv:settings-runtime`
4. `npm run verify:mvp129-stabilization-round4`
5. `npm run verify:stable`
6. `npm run desktop:setup`
7. `npm run desktop:smoke-check:strict`
8. `npm run desktop:pack`
9. `npm run desktop:dist`
10. Test portable, installer and uninstall.

MVP130 must remain outside this source tree.
