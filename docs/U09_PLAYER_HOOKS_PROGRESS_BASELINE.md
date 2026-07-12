# U09 Player Hooks and Progress Baseline

## Purpose

U09 combines two maintenance tasks that were blocking reliable continuation:

1. project status documents still described the old Round 6 / pre-U02 baseline;
2. `LyricsPanel.tsx` directly owned full-screen focus lifecycle and the perpetual vinyl animation loop.

## Structure change

### `useFullPlayerDialog`

Owns:

- focusing the visible return button when the full player opens;
- closing the surface with Escape;
- using the latest `onClose` callback;
- restoring focus to the opening control when it still exists;
- removing listeners and scheduled focus work on unmount.

### `useVinylMotion`

Owns:

- the decorative record and tonearm animation frame loop;
- playback progress and duration snapshots through refs;
- operating-system `prefers-reduced-motion` handling;
- static visual fallback and animation cleanup.

`LyricsPanel.tsx` continues to own player presentation, sleep timer, bookmarks, lyrics, queue rendering and user commands.

## Behavior boundary

U09 does not change:

- play, pause, previous, next, Seek, volume or loop behavior;
- mpv or HTMLAudio backends;
- queue, playback history or completion strategy;
- lyrics parsing, subtitle loading or bookmark persistence;
- Electron, importer, metadata, index or downloader behavior;
- visual layout or theme selection.

## Project status record

The maintained documents now describe:

- MVP129 as the core version;
- U02～U08 as merged productization work;
- U09 as the current incremental structure task;
- Windows PR validation as the routine automatic gate;
- full Windows GUI and release-chain verification as remaining release work;
- MVP130 as a frozen, isolated downloader experiment.

Hardcoded Git SHAs are removed from long-lived status documents. GitHub `main` and merged Pull Requests remain the code source of truth.

## Verification

Before merge, U09 must pass:

```text
scripts/verify-u09-player-hooks-progress-baseline.mjs
all existing verify-u*.mjs
npm run verify:stable
npm run build
```

The refactor is accepted only if the Windows branch validation succeeds.
