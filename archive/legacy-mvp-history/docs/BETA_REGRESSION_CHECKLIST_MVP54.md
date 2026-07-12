# MVP-54 — Beta 回归清单与小范围收口

Version: `0.92.0-mvp54`

## Goal

MVP-54 fixes the next practical problem after Beta 0.1 closeout: the project now needs a clear, repeatable manual regression path without adding more major features.

## UI anchors

- `mvp54-settings-regression-path`
- `mvp54-home-regression-hint`
- `mvp54-player-regression-strip`
- `mvp54-player-empty-regression-hint`
- `mvp54-beta-regression-checklist`

## What changed

### Settings

Settings now has a compact Beta regression path:

1. 选择目录
2. 读取记录
3. 播放检查

The advanced scanner/index tools remain folded away.

### Dashboard

The home page now shows small Beta 0.1 status hints for:

- 资源库
- 最近播放
- 播放器

### PlayerBar

The bottom player now has a compact status line showing:

- 本地音频 / 示例音频
- 有字幕 / 无字幕
- 队列数量

### Diagnostics

Diagnostics now has the full manual checklist:

- 打包版启动
- 资源库恢复
- 资源库浏览
- 播放与字幕
- 外部打开

It also lists validation commands, guardrails, and deferred items.

## Not changed

- Scanner logic.
- library-index.json write/read logic.
- HTMLAudio playback core.
- Lyrics/subtitle read logic.
- Packaging logic.
- SQLite.
- Downloader.
- Metadata scraping.
- mpv backend.
- Any file mutation behavior.

## Safety

MVP-54 preserves the existing safety boundary:

- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 `absolutePath`。
- 不向 Renderer 暴露 `file://`。
- 不接 SQLite。
- 不接下载器。
- 不接元数据抓取。
- 不接 mpv。
