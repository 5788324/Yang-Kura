# MVP-50 — 播放器视觉继续打磨

Version: `0.88.0-mvp50`

## Summary

本轮只做播放器视觉和状态表达收口。目标是让底部播放器和播放页更像本地媒体播放器，而不是工程面板。

## Added

```text
src/services/playerVisualPolishService.ts
scripts/verify-mvp50-player-visual-polish.mjs
```

## UI changes

### Bottom player

Adds:

```text
mvp50-player-visual-strip
mvp50-player-empty-hint
```

Displays:

- current time / total time
- remaining time
- queue count
- source and subtitle context through safe UI copy

### Full player / lyrics panel

Adds:

```text
mvp50-lyrics-visual-header
```

Displays:

- playback mode
- track type
- local/demo source
- subtitle status
- progress bar
- remaining time
- playback strategy

### Diagnostics

Adds:

```text
mvp50-player-visual-polish
```

Diagnostics records the round summary and safety boundary. This information is not surfaced on the daily home/player screens except as normal media UI.

## Safety boundary

This round does not add or change:

- scanner chain
- index write/read chain
- playback engine
- lyrics read IPC or parser
- packaging chain
- 不接 SQLite
- 不接 downloader
- 不接 metadata scraping
- 不接 mpv
- 不删除 / 移动 / 重命名真实文件
- absolutePath exposure
- file:// exposure

## Validation

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
