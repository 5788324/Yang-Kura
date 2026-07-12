# U04 Runtime Accessibility Bridge

## Purpose

U04 adds a narrow runtime bridge for legacy UI surfaces that have not yet been individually refactored. It improves keyboard and assistive-technology behavior without changing media, playback, importer, index, metadata, Electron, or persistence logic.

## Behavior

- icon-only buttons inherit an accessible name from their existing `title`;
- close buttons containing the Lucide `X` icon receive a Chinese accessible name;
- sibling form labels are associated with their input, textarea, or select when the legacy markup omitted `htmlFor`;
- visible fixed overlays with interactive content receive dialog semantics;
- dialogs receive an accessible title from their first heading;
- focus moves into a newly opened dialog;
- Tab and Shift+Tab stay inside the active dialog;
- Escape activates the dialog close/cancel control when one exists;
- focus returns to the previously focused control after the dialog is removed.

## Boundaries

The bridge does not:

- read or mutate localStorage;
- access Electron IPC;
- change media scanning, index writes, playback, queue, importer, downloader, or metadata behavior;
- replace future component-level dialog cleanup;
- claim Narrator acceptance without Windows GUI verification.

## Verification

```powershell
node scripts/verify-u04-runtime-accessibility.mjs
npm run lint
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm run verify:stable
npm run build
```
