# MVP-58 — 设置页个人使用流程收口

Version: `0.96.0-mvp58`

## Purpose

MVP-58 keeps Yang-Kura focused as a personal local audio media library.
The settings page should not feel like a developer control panel or enterprise product.

## UI anchors

- `mvp58-settings-personal-workflow`
- `mvp58-about-personal-privacy`
- `mvp58-settings-personal-workflow-review`

## User-facing flow

The daily settings flow is now described as:

1. 选择资源库。
2. 读取本地记录。
3. 回到播放器。

Advanced scanning details remain folded or moved to Diagnostics.

## Privacy and local-safety language

The About page now emphasizes:

- 个人本地媒体库。
- 不上传真实媒体。
- Renderer 不接收 `absolutePath`。
- Renderer 不接收 `file://`。
- 不删除 / 移动 / 重命名真实媒体文件。
- Local JSON Index 优先，SQLite 后置。

## Code structure

New service:

```text
src/services/settingsPersonalWorkflowService.ts
```

It centralizes:

- settings daily workflow model
- about/privacy model
- diagnostics model
- guardrails
- deferred features

## Not changed

MVP-58 does not change:

- scanner logic
- `library-index.json` write/read logic
- HTMLAudio playback logic
- lyrics/subtitle read logic
- packaging logic
- SQLite
- downloader
- metadata scraping
- mpv
- large component splitting
