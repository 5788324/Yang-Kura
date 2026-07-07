# MVP-33 Library Browse Filters

MVP-33 adds a small UI/domain boundary around ASMR/RJ library browsing.

## New service

`src/services/libraryBrowseService.ts`

It derives these user-facing states from existing app data:

- subtitle state from `subtitleRelativePaths`, `lyricsRelativePath`, `lyricsSourceKind`, or loaded lyrics;
- source state from tokenized real-index tracks (`rootPathToken + sourceRelativePath`);
- playback state from `yang_kura_playback_history_v1` through `playbackHistoryService`.

The service never persists or handles:

- `absolutePath`
- `file://`
- temporary media URLs

## ASMR page changes

The ASMR library page now supports:

- source filter: all / real index / demo;
- subtitle filter: all / has subtitle / missing subtitle;
- playback filter: all / unplayed / in progress / completed;
- real playback-history sorting;
- subtitle count and playback-progress badges.

## Demo cleanup included in this round

MVP-33 removes the most misleading ASMR page wording:

- `物理移除此作品` is replaced by `从当前列表移除`;
- delete confirmation explicitly says disk files are not deleted;
- `重新抓取 ASMR.one 元数据` is replaced by a local display refresh demo label;
- quick-filter modal headings are Chinese.

Remaining demo-only pages are intentionally not deleted yet. They should be cleaned after the core daily-use path is stable.
