# HANDOFF MVP72 TO MVP73

## 版本

```text
from: 0.110.0-mvp72
to:   0.111.0-mvp73
```

## 本轮主题

MVP-73：播放器大页视觉继续精修 / 日常听音表层收口。

## 关键改动

- 新增 `src/services/playerDailyVisualFocusService.ts`
- `LyricsPanel.tsx` 新增播放器日常焦点区 `mvp73-player-daily-visual-focus`
- MVP-50 / MVP-51 / MVP-59 播放页历史 marker 保留但后置到 `sr-only`
- 新增 `docs/CURRENT_ROADMAP_MVP73.md`
- 新增 `docs/PLAYER_DAILY_VISUAL_FOCUS_MVP73.md`
- 新增 `scripts/verify-mvp73-player-daily-visual-focus.mjs`

## 安全边界

- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 absolutePath
- 不向 Renderer 暴露 file://
- 不改真实扫描 / 写 index / 播放内核链路

## 下一步

建议 MVP-74 继续做播放器底栏和首页重复入口清理，仍然不新增真实能力。
