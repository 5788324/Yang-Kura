# MVP-53 — 资源库视觉统一与回归小修

Version: `0.91.0-mvp53`

## Scope

本轮同时收口三个主资源库表层：

- 音声库：`mvp53-asmr-visual-unity`
- 音乐库：`mvp53-music-visual-unity`
- 歌单页：`mvp53-playlist-visual-unity`
- 诊断页：`mvp53-library-visual-unity`

## Implementation

新增：

```text
src/services/libraryVisualUnityService.ts
```

该 service 只负责 UI 展示模型：

- 浏览节奏文案
- 当前结果 / 本地记录 / 字幕记录 chip
- 歌单音声 / 音乐混合提示
- 诊断页收口说明

## Guardrails

本轮不做：

- 不改扫描链路
- 不改 library-index.json 写入 / 读取链路
- 不改 HTMLAudio 播放内核
- 不改字幕读取链路
- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- Renderer 不接收 absolutePath
- Renderer 不接收 file://
