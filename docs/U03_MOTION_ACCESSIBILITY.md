# U03 Motion and Accessibility

## Scope

This round applies a narrow accessibility baseline without changing playback, Electron, importer, index, downloader, or theme architecture:

- set the document language and title for the Chinese UI;
- add a global `prefers-reduced-motion` fallback for infinite and decorative motion;
- add a visible focus ring for keyboard users;
- improve sidebar search, navigation landmarks, current-page state, and decorative icon semantics;
- add a focused static verifier.

## Explicitly deferred

- per-dialog focus trapping and focus return;
- Narrator validation;
- form-label cleanup across Settings, Importer, and Diagnostics;
- full theme contrast remediation;
- Player Core or media-key work.

## Verification

```powershell
node scripts/verify-u03-motion-accessibility.mjs
npm run lint
npm run verify:stable
npm run build
```
