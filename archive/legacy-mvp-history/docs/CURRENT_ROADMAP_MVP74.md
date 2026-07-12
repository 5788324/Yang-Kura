# Yang-Kura CURRENT ROADMAP - MVP-74

版本：`0.112.0-mvp74`

## 本轮目标

MVP-74：播放器底栏 / 首页重复入口继续清理。

本轮只做日常 UI 信息架构收口：

```text
底部播放器
→ 保留标题、封面、播放控制、队列、字幕、音量、喜欢、歌单入口
→ 减少状态 chip 和策略文案拥挤感
→ 历史状态 / verifier marker 继续保留为隐藏维护信息

首页
→ 保留继续播放、最近播放、最近加入、音声库、音乐库、歌单入口
→ 重复的 Beta / 媒体概览 / 工程说明区块后置为 sr-only marker
→ 主界面不显示 Contract / Scanner / IPC / MVP 历史等工程词
```

## 完成内容

1. 新增 `playerBarDailyCleanupService`，集中生成 MVP-74 底部播放器和首页日常收口模型。
2. `PlayerBar.tsx` 新增 `mvp74-playerbar-daily-control-strip`，把可见底栏状态压缩成更日常的听音摘要。
3. `PlayerBar.tsx` 将 MVP-49 / MVP-54 / MVP-59 旧底栏状态保留为 `sr-only` verifier marker，不删除历史 marker。
4. `Dashboard.tsx` 新增 `mvp74-home-daily-entry-cleanup` 和 `mvp74-home-maintenance-markers`。
5. `Dashboard.tsx` 将 `mvp59-home-beta-polish` 与 `mvp39-media-overview` 默认后置为 `sr-only`，减少首页重复入口和工程说明。
6. 不改真实扫描、不改写 index、不改播放内核、不接新功能。

## 安全边界

- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 absolutePath
- 不向 Renderer 暴露 file://
- 不改真实扫描 / 写 index / 播放内核链路

## 下一步建议

MVP-75：诊断页 MVP 历史按阶段分组折叠。重点是让诊断页更适合 AI 维护，同时默认隐藏长历史验证区块。
