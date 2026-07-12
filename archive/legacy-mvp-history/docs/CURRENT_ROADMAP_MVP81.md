# CURRENT_ROADMAP_MVP81

## 版本

`0.119.0-mvp81`

## 本轮目标

MVP-81：离线 Demo 封面清扫 / UI 控制台噪音修复。

本轮根据 DeepSeek 运行时审查里提到的网络图片失败现象，移除源码中 UI Demo 直接引用 Unsplash 远程封面的行为，统一改用 `coverArtworkService.makeFallbackCover(...)` 生成本地 SVG data URL 占位封面。

## 范围

- `src/mockData.ts` 默认封面本地化。
- `src/components/DownloaderPage.tsx` Demo 下载任务封面本地化。
- `src/components/DiagnosticsPage.tsx` Demo 扫描/导入封面本地化，并增加 MVP81 诊断区。
- `src/App.tsx` Demo 元数据刷新候选封面本地化。
- `src/services/playlistPersistenceService.ts` 新建歌单默认封面本地化。
- 新增 verifier，禁止源码继续出现 `images.unsplash.com`。

## 不做

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。

## 下一步

如果 DeepSeek 继续给出 bug 清单，下一轮可继续做 MVP-82 小 bugfix。没有新 bug 时，建议进入 Beta 0.1 阶段性收口 / GitHub 推送准备。
