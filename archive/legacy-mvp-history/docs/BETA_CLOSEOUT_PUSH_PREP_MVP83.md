# MVP-83 Beta 0.1 阶段性收口 / 推送准备

version: `0.121.0-mvp83`

## 结论

本轮是收口准备轮，不是功能开发轮。Yang-Kura 当前仍以本地源码包为最新基线，GitHub `main` 在公司网络无法推送期间不能视为最新状态。

## 已整理内容

- 当前源码基线：`0.121.0-mvp83`
- 上一轮基线：`0.120.0-mvp82`
- 推送策略：回住所后新分支推送，不在公司网络反复尝试。
- 验证策略：推送前本机复跑 `npm ci --ignore-scripts`、`lint`、`build:electron`、`verify:all`、`build`、`audit high`。
- 安全边界：不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除、移动、重命名真实媒体文件，不暴露 `absolutePath` 或 `file://`。

## 不做事项

本轮没有新增真实扫描、写 index、播放、字幕、外部打开、下载或文件变更能力。
