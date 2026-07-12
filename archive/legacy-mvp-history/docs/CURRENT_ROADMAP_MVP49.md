# CURRENT ROADMAP — MVP-49

Current version: `0.87.0-mvp49`

## 本轮目标

MVP-49 是 Beta 0.1 之后的轻量体验打磨轮：

```text
播放器与首页视觉精修
```

本轮只做首页听音频入口和底部播放器状态条的表层产品化，不改变扫描、索引、播放、字幕、打包或文件操作链路。

## 已完成

- 新增 `src/services/listeningExperiencePolishService.ts`。
- 首页 `mvp39-media-overview` 保留旧锚点，同时新增 `mvp49-home-media-focus`。
- 底部播放器新增 `mvp49-player-status-strip`。
- 诊断页新增 `mvp49-listening-polish` 收口区块。
- 新增 `docs/LISTENING_EXPERIENCE_POLISH_MVP49.md`。
- 新增 `scripts/verify-mvp49-listening-polish.mjs` 并接入 `verify:all`。

## 继续后置

- SQLite。
- 下载器。
- ASMR.one / DLsite / 网易云元数据抓取。
- mpv 后端。
- 高级文件整理 / 批量重命名。
- 转录 / 翻译 / LRC 生成任务队列。

## 安全边界

- UI 必须中文。
- 主界面媒体感优先，工程信息继续后置到诊断页。
- Renderer 不接收 absolutePath。
- Renderer 不接收 file://。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不修改真实扫描、写 index、播放、字幕、打包链路。
