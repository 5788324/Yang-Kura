# Yang-Kura CURRENT ROADMAP - MVP-73

版本：`0.111.0-mvp73`

## 本轮目标

MVP-73：播放器大页视觉继续精修 / 日常听音表层收口。

本轮只做播放器 UI 信息架构与视觉收口：

```text
播放器大页
→ 更突出封面 / 标题 / 歌词 / 队列 / 睡前控制
→ 减少播放页顶部工程卡片
→ 工程、verifier、MVP 历史、Electron、IPC、Scanner、Contract 信息继续后置到诊断页
```

## 完成内容

1. 新增 `playerDailyVisualFocusService`，集中生成播放器大页日常听音模型。
2. 播放器大页新增 `mvp73-player-daily-visual-focus` 用户可见聚合区。
3. 原有 MVP-50 / MVP-51 / MVP-59 播放页维护 marker 保留为 sr-only，不删除历史 verifier marker。
4. 黑胶、经典、歌词三种模式增加 MVP-73 可验证标记。
5. 不改真实播放内核、不改扫描、不改写 index、不改文件访问。

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

MVP-74：播放器底栏 / 首页重复入口继续清理。重点是让底部播放器和首页入口更像正常媒体播放器，不扩大真实能力。
