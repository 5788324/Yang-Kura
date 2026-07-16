# U35-B Production Shell

## Status

U35-B connects the U35-A design-system foundation to the current production renderer without rewriting the existing media-library state tree.

## Delivered

- `AppShell` production bridge is active from `src/main.tsx`.
- Canonical Beta 2 themes are active:
  - `dusk-amber` / 暮夜琥珀
  - `mist-ivory` / 雾光象牙
- Existing stored theme values migrate at runtime:
  - `dark` and `acrylic-mist` → `dusk-amber`
  - `ocean-drops` → `mist-ivory`
- The top application bar exposes a keyboard-accessible canonical theme toggle.
- Canonical and legacy theme storage remain synchronized during the transition.
- The production shell restyles the existing TopBar, Sidebar, content viewport, PlayerBar, queue drawer and resume toast through semantic tokens.
- Narrow-window and reduced-motion behavior are included.

## Migration strategy

The existing `App.tsx` remains the state and route coordinator in this batch. U35-B wraps it with the new shell rather than performing a high-risk simultaneous rewrite of navigation, player state, library state and overlays.

```text
existing App runtime
→ canonical ThemeRuntimeBridge
→ AppShell production bridge
→ semantic shell CSS
→ U36 internal route/state extraction
```

## Compatibility

The following behavior is intentionally unchanged:

- Local JSON Index read/write/backup/restore;
- resource-library authorization;
- HTMLAudio/mpv playback and fallback;
- queue, history, playlists and resume state;
- subtitles and lyrics;
- metadata overrides and DLsite Provider;
- copy-only and move-only importer transactions;
- portable and NSIS packaging.

The old Settings theme selector remains temporarily available. Its three historical values are translated into the two canonical Beta 2 themes. U39 will replace the old appearance section with the final two-theme settings surface.

## Acceptance

U35-B is accepted only when:

- TypeScript and Electron builds pass;
- U28–U32 Electron/Windows regressions pass;
- `verify-u35a-foundation.mjs` and `verify-u35b-production-shell.mjs` pass;
- stable regression passes;
- portable and NSIS acceptance pass;
- no hard-coded palette value is introduced in the production-shell layer.

## Next

U36 will remove the bridge-only limitation by extracting production TopBar, Sidebar, Router and global overlay composition from `App.tsx`, then migrate IPC calls domain by domain to the canonical registry.
