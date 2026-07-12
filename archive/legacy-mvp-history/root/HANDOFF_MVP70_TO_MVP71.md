# HANDOFF MVP-70 → MVP-71

## 源码基线

```text
MVP-70：0.108.0-mvp70
MVP-71：0.109.0-mvp71
```

MVP-70 是 Beta 0.1 最终交接包 / RC 可交付包。用户已在本机确认真实链路通过：

```text
选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放 / 打开
```

## MVP-71 本轮定位

本轮不是扩功能，而是主界面简化和诊断信息收口。

```text
首页：继续播放 / 最近播放 / 最近加入 / 音声库入口 / 音乐库入口 / 歌单入口
诊断页：工程信息默认折叠到 AI 维护区
设置页：日常路径入口优先，开发者详情默认折叠
```

## 修改摘要

```text
新增 userFacingSimplificationService
首页新增日常入口区
设置页新增 MVP-71 精简说明，并将桌面端状态收进 AI 维护区
诊断页将大量工程 / MVP 历史信息收进 mvp71-ai-maintenance-zone details
新增 MVP-71 verifier
```

## 未做事项

```text
不接 SQLite
不接下载器
不接元数据抓取
不接 mpv
不删除 / 移动 / 重命名媒体文件
不向 Renderer 暴露 absolutePath 或 file://
不改扫描 / 写 index / 播放内核链路
```

## 下一步建议

```text
MVP-72：可继续做主页面视觉细节精修，或先做一次本机打包版回归验收。
```
