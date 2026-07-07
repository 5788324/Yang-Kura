# MVP-55 — 组件体检与低风险结构清理计划

Version: `0.93.0-mvp55`

## 目标

本轮把当前大组件状态记录清楚，避免继续盲目堆 UI 逻辑。

核心原则：

```text
先体检
先抽 service
不一次性拆大组件
不破坏 Beta 0.1 已稳定链路
```

## 新增锚点

- `mvp55-settings-component-health`
- `mvp55-component-health-review`

## 新增服务

```text
src/services/componentHealthReviewService.ts
```

该服务集中提供：

- 设置页组件体检摘要
- 诊断页组件体检模型
- 大组件风险分级
- 低风险清理计划
- 本轮安全边界和后置项

## 当前体检结论

| 区域 | 结论 |
|---|---|
| `DiagnosticsPage.tsx` | 最大组件，历史锚点多，暂不大拆 |
| `LyricsPanel.tsx` | 播放器大页耦合多，暂不大拆 |
| `SettingsPage.tsx` | 可继续抽文案和状态模型 |
| `AsmrLibrary.tsx` | 可继续做低风险浏览模型抽离 |
| `AsmrDetail.tsx` | 后续可抽详情摘要和空状态模型 |
| `MusicLibrary.tsx` / `PlayerBar.tsx` / `PlaylistPage.tsx` / `Dashboard.tsx` | 当前保持观察，小步 polish |

## 清理策略

1. 大组件不做一次性拆分。
2. 新增 UI 状态、文案、摘要先放 service。
3. 诊断页保留历史 verifier 锚点，不拆旧区块。
4. 播放器只做表层 polish，不动 HTMLAudio / 字幕 / 队列。
5. 资源库只做浏览统一，不改 Local JSON Index 链路。

## 安全边界

本轮没有做：

- SQLite
- 下载器
- 元数据抓取
- mpv
- 真实扫描链路改动
- index 写入 / 读取链路改动
- 播放内核改动
- 字幕读取链路改动
- 打包逻辑改动
- 删除 / 移动 / 重命名真实媒体文件
- Renderer 暴露 `absolutePath` 或 `file://`

## 明确不接

- 不接 SQLite
- 不接下载器
- 不接元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
