# MVP-59 — 首页与播放器最终 Beta 视觉小修

Version: `0.97.0-mvp59`

## 新增文件

- `src/services/homePlayerBetaPolishService.ts`
- `docs/CURRENT_ROADMAP_MVP59.md`
- `docs/HOME_PLAYER_BETA_POLISH_MVP59.md`
- `scripts/verify-mvp59-home-player-beta-polish.mjs`
- `HANDOFF_MVP58_TO_MVP59.md`
- `PACKAGE_MANIFEST_MVP59_HANDOFF.txt`

## UI 锚点

- `mvp59-home-beta-polish`
- `mvp59-player-compact-strip`
- `mvp59-player-empty-hint`
- `mvp59-player-beta-chips`
- `mvp59-lyrics-copy-polish`
- `mvp59-home-player-beta-polish`

## 本轮说明

MVP-59 只做表层体验收口。

首页：

- 增加轻量 Beta 首页收口区块。
- 首页继续强调继续播放、最近播放和资源库入口。
- 资源库状态从大块工程提示继续降噪。

播放器底栏：

- 新增一行紧凑中文状态 `mvp59-player-compact-strip`。
- 旧 MVP-50 / MVP-54 状态保留给 verifier，但转为屏幕阅读器锚点，不再继续占主视觉。
- 空播放器状态改成更简洁的个人本地播放器提示。

播放页 / 歌词页：

- 新增 `mvp59-lyrics-copy-polish`。
- 统一当前模式、来源、字幕、队列等中文表达。
- 无字幕时继续说明：没有字幕也可以正常播放本地音频。

## 安全边界

本轮没有改变：

- 扫描链路
- `library-index.json` 写入链路
- HTMLAudio 播放内核
- 字幕读取链路
- 打包链路
- SQLite / 下载器 / 元数据 / mpv 后置
- 不删除 / 移动 / 重命名真实文件
- 不向 Renderer 暴露 `absolutePath`
- 不向 Renderer 暴露 `file://`

## 验证

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
