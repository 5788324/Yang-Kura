# Yang-Kura fixture library sample

This directory is a controlled fixture tree for scanner development.

It intentionally contains placeholder files only. Files ending with `.fixture` are not real media files.

## MVP-05 cases

- Normal ASMR/RJ work with cover, audio, and zh/ja/bilingual LRC.
- ASMR folder without RJ code.
- Duplicate RJ: `RJ00000111_重复作品A` and `RJ00000111_重复作品B`.
- Empty / metadata-only folder: `RJ08888888_空目录`.
- Cover-only folder: `RJ09999999_只有封面`.
- Video ASMR: `RJ06666666_视频ASMR` with mp4/mkv and srt.
- Image/CG folder: `RJ05555555_CG差分合集` with non-cover image assets.
- Multi-disc / special folder: `RJ04444444_多Disc特典`.
- Music album: `Aimer - Walpurgis`.
- Music singles folder with Chinese/Japanese path.
- Duplicate track path virtual case: `music/Duplicate Path/01 same.mp3` is duplicated in the virtual entry list.
- Missing-cover music album: `Missing Cover Album`.

## Hard boundary

Do not replace these placeholders with real media. MVP-05 remains fixture-only and must not scan a real disk path.


## MVP-08.1 note

The physical fixture tree is intentionally minimized for Windows zip compatibility. Runtime fixture cases are virtual entries in `src/services/fixtureLibrarySample.ts`; package-safe fixture metadata is in `tests/fixtures/library_sample_manifest.json`.
