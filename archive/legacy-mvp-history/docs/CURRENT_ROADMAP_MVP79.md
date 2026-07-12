# CURRENT ROADMAP MVP-79

版本：`0.117.0-mvp79`

## 阶段定位

MVP-79 是播放器 UI bugfix 轮。目标是处理 DeepSeek 在 MVP-78 后指出的播放器 UI 细节问题，不扩展真实功能。

## 本轮修复

1. 替换无效 Tailwind utility：`zinc-850`、`zinc-750`、`sky-450`、`py-0.2`、`scale-102/103/97/98`。
2. 补齐 `animate-bounce-subtle`，使用 `translate` 避免覆盖已有 `transform`。
3. 移除 PlayerBar 根区域点击即打开歌词页的误触发行为。
4. More 按钮不再是死按钮，点击显示“后续开放”提示。
5. PlayerBar / LyricsPanel 统一 LRC 小数秒解析。
6. LyricsPanel 睡前暗屏时钟改为每秒刷新。
7. LyricsPanel cover 背景图增加 `coverUrl` 保护，避免 `url(undefined)`。

## 不变边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。

## 下一步建议

MVP-80：设置页 / 诊断页最终日常化检查，继续确认主界面不暴露 Scanner / Contract / Bridge / MVP 编号。
