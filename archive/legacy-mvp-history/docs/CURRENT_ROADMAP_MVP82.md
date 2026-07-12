# CURRENT_ROADMAP_MVP82

## 版本

`0.120.0-mvp82`

## 本轮目标

MVP-82 是一轮 bugfix / UI 细节清扫，不新增功能。

重点处理 DeepSeek 对 MVP81 的二次审查结果：

- Dashboard / AsmrLibrary / MusicLibrary 残留的无效 Tailwind scale utility。
- LyricsPanel 残留的 `bg-white/2` 弱背景类。
- `animate-scale-up` 未定义导致的弹窗动画静默失效。
- `formatDuration` / `formatTotalDuration` 在缺失时长时可能显示 `NaN:NaN` 或 `NaN小时NaN分钟`。

## 本轮不做

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除、移动、重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath / file://。
- 不改真实扫描、写 index、播放内核链路。

## 下一步

如 DeepSeek 继续发现 UI bug，可继续做 MVP-83 小修。
如果没有新 bug，建议进入 Beta 0.1 阶段性收口 / GitHub 推送准备。
