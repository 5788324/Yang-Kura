# MVP-73 播放器大页日常视觉收口

版本：`0.111.0-mvp73`

## 背景

MVP-71 / MVP-72 已经把首页、设置页、诊断页的工程信息向 AI 维护区收口。MVP-73 继续处理播放器大页：播放页应该服务日常听音，而不是展示工程阶段。

## UI 原则

```text
播放器大页可见内容：
- 当前音轨
- 作者 / 社团 / 专辑
- 播放进度
- 字幕状态
- 队列数量
- 播放结束策略
- 睡前控制

播放器大页不可见主表层：
- MVP 历史
- verifier
- Electron / IPC
- Scanner / Contract
- absolutePath / file://
```

## 实现

新增：

```text
src/services/playerDailyVisualFocusService.ts
```

修改：

```text
src/components/LyricsPanel.tsx
src/services/index.ts
package.json
package-lock.json
```

新增播放器可见聚合区：

```text
mvp73-player-daily-visual-focus
```

保留历史 marker，但后置为屏幕阅读/验证用途：

```text
mvp73-player-maintenance-markers
mvp50-lyrics-visual-header
mvp59-lyrics-copy-polish
mvp51-player-immersion-rail
```

## 不做事项

- 不接 SQLite
- 不接下载器
- 不接元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实文件
- 不向 Renderer 暴露 absolutePath
- 不向 Renderer 暴露 file://
- 不改变 HTMLAudio 播放内核
- 不改变真实扫描 / 写 index 链路
