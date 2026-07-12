# MVP-76 — 音声库 / 音乐库卡片视觉统一

Current version: `0.114.0-mvp76`

## 目标

本轮目标是检查并修正日常媒体库页面里的 UI 布局问题：卡片列数过密、长标题挤压、状态标签溢出、歌曲行按钮拥挤、封面比例不稳定。

## 改动范围

### 音声库

- `mvp76-asmr-card-layout-unity`
- 卡片墙列宽改为：`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`。
- 卡片保持固定封面比例：`aspect-square`。
- 作品标题固定两行：`line-clamp-2`。
- 社团 / CV 使用 `min-w-0` 与 `truncate`，避免长文本撑开卡片。
- 字幕、播放进度、时长状态允许换行，不再挤出卡片。

### 音乐库

- `mvp76-music-track-layout-unity`
- `mvp76-music-card-layout-unity`
- 歌曲行在窄屏从横排改成 `flex-col sm:flex-row`，操作按钮不会压缩歌曲标题。
- 专辑墙与音声墙使用一致列宽节奏。
- 专辑标题固定两行，徽章区域和底部信息有稳定高度。

### 诊断页

- `mvp76-card-layout-unity`
- 默认折叠，供 AI / 维护时检查布局策略。
- 主界面不显示工程说明，只保留轻量 sr-only marker 和中文媒体库表层。

## 验收点

- 音声库卡片在普通桌面宽度下不再过窄。
- 音声作品长标题、长社团名、多个 CV 不撑开卡片。
- 字幕 / 播放进度 / 时长信息可换行，不遮挡底部。
- 音乐歌曲行在窄屏下操作按钮换到下一行。
- 音乐专辑卡片标题、徽章、底部信息高度更稳定。

## 不做

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。
