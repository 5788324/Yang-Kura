# MVP-51 — 播放器沉浸页继续精修

Version: `0.89.0-mvp51`

## 目标

让播放器大页更适合日常听音频：

- 当前播放模式更明确。
- 歌词 / 字幕状态更清楚。
- 队列和播放策略更容易理解。
- 无歌词 / 无字幕时不再像错误状态。

## 新增文件

```text
src/services/playerImmersionPolishService.ts
scripts/verify-mvp51-player-immersion-polish.mjs
docs/CURRENT_ROADMAP_MVP51.md
docs/PLAYER_IMMERSION_POLISH_MVP51.md
```

## UI 锚点

```text
mvp51-player-immersion-rail
mvp51-lyrics-empty-state
mvp51-player-immersion-polish
```

## 安全边界

本轮不做：

```text
不接 SQLite
下载器
ASMR.one / DLsite / 网易云元数据抓取
mpv 后端
不删除 / 移动 / 重命名真实文件
absolutePath 暴露
file:// 暴露
真实扫描链路改动
真实播放内核改动
写 index 逻辑改动
字幕读取逻辑改动
打包逻辑改动
```

## 验证

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
