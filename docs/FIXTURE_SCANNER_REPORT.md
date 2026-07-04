# MVP-03 Fixture Scanner Report / Diagnostics Layer

MVP-03 adds a report layer on top of the fixture-only scanner.

## Purpose

The scanner from MVP-02 converts virtual fixture entries into an in-memory `LocalJsonIndex`. MVP-03 does not change that scanner into a real filesystem scanner. It only analyzes the in-memory index and reports quality issues that future real scanning must handle carefully.

## What the report checks

- Summary counts: roots, collections, tracks, audio tracks, video tracks, covers, subtitles.
- Collection diagnostics:
  - missing cover
  - no playable audio/video
  - RJ collection missing normalized RJ id
  - collection quality score
- Track diagnostics:
  - missing relativePath
  - audio track missing matched subtitle
- Duplicate diagnostics:
  - duplicate RJ id groups
  - duplicate track relativePath groups
- Status:
  - `pass`
  - `needs-review`
  - `blocked`

## Safety boundary

This layer is still fixture-only.

Forbidden:

```text
No real filesystem scanning
No E:\arsm scanning
No absolutePath generation
No fileUrl generation
No library-index.json write
No Electron
No SQLite
No HTMLAudio
No delete / move / rename / repair
```

Allowed:

```text
fixture entries -> LocalJsonIndex -> FixtureScannerReport
```

## Why this layer exists

Before touching a real library, the project needs deterministic diagnostics for unsafe cases:

- A folder has no audio.
- A collection has no cover.
- A track has no subtitle.
- Two collections share one RJ id.
- Two tracks have the same relative path.

The report must only surface issues. It must not fix, merge, delete, rename, or write anything.

## Expected next step

MVP-04 can add a UI / diagnostics page adapter for this report, or expand fixture cases. It still should not scan a real disk.


## MVP-05 report additions

The report summary now includes image track count, image-only collection count, and metadata-only collection count. Image/CG-only collections are warnings, while empty or cover-only collections remain blocking diagnostics because they have no playable or asset track entries.
