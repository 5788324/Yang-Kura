# U12 Full Player Presentational Split

## Purpose

`LyricsPanel.tsx` still contains a large amount of JSX after U09 and U10. U12 extracts two stable, presentation-only regions without moving player commands or stateful behavior:

- `FullPlayerHeader`: return button, player-view selector and source status;
- `PlayerFocusSummary`: current track summary, chips and explanatory cards.

## Boundaries

The extracted components do not own:

- playback, pause, previous/next or Seek commands;
- queue, bookmarks, sleep timer or subtitle scrolling;
- localStorage/sessionStorage;
- Electron, IPC, importer, index or metadata operations;
- focus/Escape lifecycle or vinyl animation.

Those responsibilities remain in `LyricsPanel.tsx`, `useFullPlayerDialog`, `useVinylMotion` and the existing player services.

## Behavior preservation

U12 keeps the existing DOM identifiers and visible content:

- `mvp78-player-header-wrap-safe`;
- `lyrics-close-btn`;
- `mvp73-player-daily-visual-focus`;
- 经典模式 / 黑胶唱片 / 歌词模式;
- current mode title, source hint, focus chips and cards.

The decorative window dots are explicitly marked `aria-hidden` because they do not represent controls.

## Verification

`scripts/verify-u12-full-player-presentational-split.mjs` checks:

- `LyricsPanel.tsx` delegates both regions to the new components;
- original identifiers and visible labels remain present;
- the new components render the expected model fields;
- no state/effect, storage, Electron or playback-command markers enter the presentational components.

The normal Windows Pull Request gate must still pass dependency audit, all U verifiers, `verify:stable` and the production build before merge. The temporary branch-only patch automation must remove itself before the final merge candidate is reviewed.
