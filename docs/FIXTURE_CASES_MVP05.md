# MVP-05 Fixture Case Expansion

MVP-05 expands the controlled fixture set before any real disk scanning.

## Scope

Input is still `fixtureLibrarySampleEntries` only. The scanner still runs in memory and must not read a real directory, write `library-index.json`, attach Electron, or use SQLite.

## Added cases

| Case | Fixture example | Expected diagnosis |
|---|---|---|
| Duplicate RJ | `RJ00000111_重复作品A` + `RJ00000111_重复作品B` | duplicate RJ group, report only |
| Empty directory | `RJ08888888_空目录/.keep` | metadata-only / no playable assets |
| Cover-only | `RJ09999999_只有封面/cover.jpg` | no playable assets |
| Video ASMR | `RJ06666666_视频ASMR/*.mp4|*.mkv` | video tracks counted; later external-player path |
| Image/CG | `RJ05555555_CG差分合集/cg/*.png|*.webp` | image tracks counted; no internal reader in MVP |
| Multi-language subtitles | `.zh.lrc`, `.ja.lrc`, `.bilingual.lrc`, `.zh.vtt`, `.zh.srt` | subtitle matching and language detection |
| Multi disc / bonus | `Disc 1/`, `Disc 2/`, `特典/` | nested relative paths stay under one collection |
| Duplicate track path | `music/Duplicate Path/01 same.mp3` repeated in virtual entries | duplicate path group |
| Missing music cover | `Missing Cover Album/01 only.mp3` | missing cover warning |

## Safety boundary

MVP-05 is still a fixture-only planning and validation layer.

Forbidden:

- `node:fs` / real filesystem scanning in scanner/report services
- Electron IPC
- SQLite
- `localStorage`
- `HTMLAudio` / `new Audio`
- writing `library-index.json`
- deleting, moving, renaming, or repairing files

## Why this comes before real scanning

These cases represent realistic ASMR/RJ and music-library structures. Testing them as virtual entries prevents future real scanner logic from silently treating edge cases as successful imports.
