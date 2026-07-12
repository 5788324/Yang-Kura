# U05 Truthful ASMR Detail State

## Problem

The ASMR detail page previously wrote demo-like state when no local record existed:

- the first track was marked 100% complete;
- the second track was marked 62% complete;
- the first tracks received bilingual, Chinese, or Japanese subtitle associations.

That behavior made a real library look as though it already had playback history and subtitle files.

## Change

- missing playback-progress storage now starts as an empty object;
- missing per-work subtitle-association storage now starts as an empty object;
- existing valid localStorage records continue to load unchanged;
- manual completion, subtitle association, rating, status, and notes behavior remain unchanged.

## Compatibility

U05 does not automatically delete existing localStorage records because old seeded values cannot be distinguished safely from values that a user may have intentionally created. It prevents new false state from being generated.

## Boundaries

No playback backend, queue, media file, subtitle parser, Electron, importer, index, metadata provider, or storage-key migration is changed.
