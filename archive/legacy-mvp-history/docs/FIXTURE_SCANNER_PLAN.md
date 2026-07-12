# P2 Fixture Scanner Plan

## Goal

P2 adds a safe scanner prototype that converts controlled fixture entries into `LocalJsonIndex`.

It is **not** a real filesystem scanner.

## Scope

Allowed:

- `tests/fixtures/library_sample/` as a documented sample layout.
- `src/services/fixtureLibrarySample.ts` as virtual fixture input.
- `src/services/fixtureLibraryScanner.ts` as an in-memory converter.
- `LocalJsonIndex` output with `sourceKind: "fixture"`.
- RJ folder detection.
- Music album folder detection.
- Audio/video/cover/subtitle extension classification.
- Same-base subtitle matching.

Forbidden:

- No Electron.
- No `fs` / `node:fs` in scanner service.
- No real `E:\\arsm` scan.
- No write to `library-index.json`.
- No SQLite.
- No `localStorage`.
- No `new Audio()`.
- No file delete/move/rename/repair.

## Fixture cases

```text
library_sample/
├── asmr/
│   ├── RJ01234567_雨音耳かき/
│   │   ├── cover.jpg
│   │   ├── 01_本編.mp3.fixture
│   │   ├── 01_本編.zh.lrc
│   │   └── 02_耳かき.wav.fixture
│   ├── RJ07654321_添い寝 特典/
│   │   ├── cover.webp
│   │   └── 01_添い寝.flac.fixture
│   └── 中文 空格 无RJ作品/
│       ├── folder.png
│       └── track one.m4a.fixture
└── music/
    ├── Aimer - Walpurgis/
    │   ├── cover.jpg
    │   ├── 01 Walpurgis.flac.fixture
    │   ├── 01 Walpurgis.ja.lrc
    │   └── 02 STAND-ALONE.mp3.fixture
    └── Singles 中文 空格/
        ├── cover.png
        └── 夜に駆ける.mp3.fixture
```

The `.fixture` suffix marks placeholder files. The scanner runtime uses the virtual paths in `fixtureLibrarySample.ts` rather than reading these placeholder files.

## Output requirements

The fixture scanner must output:

- 2 roots: ASMR and music.
- At least one `rj_work` collection.
- At least one `music_album` collection.
- At least one no-RJ `music_folder` style collection.
- Audio tracks with `TrackSource.relativePath` only.
- Covers with `CoverSource.relativePath` only.
- Subtitles with `SubtitleSource.relativePath` only.
- warnings explaining this is fixture-only.

## Next stage

After P2 passes, P3 can introduce a fixture-backed scanner contract for a real directory scanner, still without touching the user's real media library.

## MVP-03 report layer

MVP-03 adds a report service on top of the fixture scanner:

```text
src/services/fixtureScannerReportService.ts
```

It analyzes the fixture `LocalJsonIndex` in memory and reports:

- missing cover collections
- no-audio collections
- audio tracks without subtitles
- duplicate RJ groups
- duplicate track relativePath groups
- collection quality scores
- next actions

This still does not read the real filesystem or write `library-index.json`.


## MVP-05 expansion

The fixture scanner now includes broader virtual cases: duplicate RJ, empty/cover-only folders, video ASMR, image/CG assets, multi-language subtitles, multi-disc/bonus folders, duplicate track paths, and missing-cover music. These are still virtual entries and are not discovered by scanning a real directory.

## MVP-09 Update：parser-driven scanner

MVP-09 后，fixture scanner 不再独立维护路径语义判断。

集中到 `virtualLibraryPathParser` 的规则包括：

```text
extension -> mediaKind
RJ extraction
cover candidate
subtitle candidate
subtitle language
disc / trackNo
specialRole
collectionType
```

`fixtureLibraryScanner` 只负责聚合 parser 输出并生成 fixture `LocalJsonIndex`。
