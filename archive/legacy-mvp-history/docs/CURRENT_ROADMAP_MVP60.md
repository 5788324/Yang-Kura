# CURRENT ROADMAP — MVP-60

Version: `0.98.0-mvp60`

## Current stage

MVP-60 fixes the current line as a **personal-use Beta 0.1 candidate package**.

The project remains:

- React + Vite + TypeScript + Electron
- Local JSON Index first
- SQLite postponed
- Chinese UI
- ASMR/RJ + normal music local audio library

## What MVP-60 does

MVP-60整理当前候选包能力边界、人工回归路径和长期交接文档。

It adds:

- `src/services/betaCandidateCloseoutService.ts`
- Settings/About block `mvp60-beta-candidate-summary`
- Diagnostics block `mvp60-beta-candidate-closeout`
- `docs/BETA_CANDIDATE_CLOSEOUT_MVP60.md`
- `scripts/verify-mvp60-beta-candidate-closeout.mjs`

## Beta 0.1 candidate baseline

Current user-facing baseline:

1. Select local library root.
2. Dry-run scan.
3. Write / backup `library-index.json`.
4. Read the index into ASMR and music libraries.
5. Play local audio.
6. Read LRC / SRT / VTT / ASS subtitles.
7. Open videos, images, files, and folders externally.
8. Keep playback history, queue, playlists, covers, and recent listening surfaces.
9. Keep Settings daily actions separated from Diagnostics technical detail.
10. Keep main surfaces Chinese and media-first.

## Still postponed

- SQLite
- Downloader
- ASMR.one / DLsite / NetEase metadata scraping
- mpv backend
- Advanced file organization
- Batch rename
- Large component one-shot split

## Safety boundary

MVP-60 does not change scanner, index write/read, playback, lyrics, packaging, Electron file access, or media mutation behavior.

It does not expose `absolutePath` or `file://` to Renderer.

It does not delete / move / rename real media files.
