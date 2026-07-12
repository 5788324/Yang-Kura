# CURRENT ROADMAP — MVP-76

Current version: `0.114.0-mvp76`

## 本轮定位

MVP-76 是 Beta 0.1 后的 UI 布局收口轮：**音声库 / 音乐库卡片视觉统一**。

本轮只处理媒体库表层布局，不进入真实扫描、写 index、播放内核或文件操作。

## 已完成

- 新增 `src/services/libraryCardLayoutPolishService.ts`。
- 音声库卡片墙新增 `mvp76-asmr-card-layout-unity`。
- 音乐库歌曲列表新增 `mvp76-music-track-layout-unity`。
- 音乐库专辑墙新增 `mvp76-music-card-layout-unity`。
- 诊断页新增默认折叠的 `mvp76-card-layout-unity` UI 布局检查。
- 新增 `scripts/verify-mvp76-card-layout-unity.mjs` 并接入 `verify:all`。

## 布局修正重点

- 卡片列宽从过早四列改成更安全的 `sm -> xl -> 2xl` 节奏。
- 封面保持 `aspect-square`，不被标题和标签高度挤压。
- 长标题固定两行 `line-clamp-2`。
- 社团 / CV / 艺术家 / 专辑名称使用 `min-w-0` 与 `truncate`。
- 字幕、播放进度、时长等状态使用 `flex-wrap`，避免溢出卡片。
- 音乐歌曲行在窄屏使用 `flex-col sm:flex-row`，操作区不挤压标题。

## 安全边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。

## 下一轮建议

MVP-77：打包版回归验收清单更新 / MVP71～MVP76 UI 收口后的人工验收准备。
