# HANDOFF MVP80 TO MVP81

## 当前版本

`0.119.0-mvp81`

## 基线

`0.118.0-mvp80`

## 本轮完成

MVP-81：离线 Demo 封面清扫 / UI 控制台噪音修复。

本轮移除了 UI 原型中直接请求 Unsplash 远程封面的行为，改为使用 `coverArtworkService.makeFallbackCover(...)` 生成本地 SVG data URL 封面。

## 变更文件

- `src/mockData.ts`
- `src/App.tsx`
- `src/components/DownloaderPage.tsx`
- `src/components/DiagnosticsPage.tsx`
- `src/services/playlistPersistenceService.ts`
- `src/services/offlineDemoCoverCleanupService.ts`
- `src/services/index.ts`
- `docs/CURRENT_ROADMAP_MVP81.md`
- `docs/OFFLINE_DEMO_COVER_CLEANUP_MVP81.md`
- `scripts/verify-mvp81-offline-demo-cover-cleanup.mjs`
- `PACKAGE_MANIFEST_MVP81_HANDOFF.txt`

## 未做

不接 SQLite / 下载器 / 元数据抓取 / mpv，不改扫描、写 index、播放内核，不删除/移动/重命名真实媒体文件。

## 下一轮建议

MVP-82：继续接收 DeepSeek bug 清单做小范围 UI bugfix；若无新 bug，进入 Beta 0.1 阶段性收口 / GitHub 推送准备。

## 路径安全

继续不向 Renderer 暴露 absolutePath，不向 Renderer 暴露 file://。
