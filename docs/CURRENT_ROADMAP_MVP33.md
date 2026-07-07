# Yang-Kura CURRENT ROADMAP — MVP-33

## Status

Version: `0.71.0-mvp33`

MVP-33 continues the daily-use track after MVP-32 startup/index recovery guidance. The app already supports packaged startup, local index read/write, HTMLAudio playback, subtitle loading, external open, playback history, and library session hints.

## MVP-33 Scope

MVP-33 focuses on resource-library browsing and search/filter usability:

1. Add a small browse-domain service for ASMR/RJ cards.
2. Filter ASMR/RJ works by source: all / real `library-index.json` resources / demo resources.
3. Filter by subtitle state: all / has subtitle / missing subtitle.
4. Filter by playback state: all / unplayed / in progress / completed.
5. Sort by real playback history instead of legacy placeholder keys.
6. Show subtitle and playback badges on list/grid views.
7. Replace the most misleading demo remnants in the ASMR context menu:
   - no “physical delete” wording;
   - no fake ASMR.one metadata fetch wording;
   - no claim that disk files are deleted.

## Demo residue cleanup stage

Demo residue cleanup is not a single one-time step. It is split into three levels:

- MVP-33+: remove user-facing dangerous/misleading wording while improving real browsing.
- MVP-34/MVP-35: move remaining engineering cards and demo notes into Diagnostics/developer areas.
- Beta cleanup: remove or archive legacy mock-only pages once SQLite/metadata/downloader decisions are made.

## Still out of scope

- SQLite
- Downloader
- Metadata scraping
- File deletion/move/rename
- Big NetEase-style player redesign
- mpv/FFmpeg backend
