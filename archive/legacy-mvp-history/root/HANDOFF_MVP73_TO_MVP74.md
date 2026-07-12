# HANDOFF MVP73 TO MVP74

## 版本

```text
from: 0.111.0-mvp73
to:   0.112.0-mvp74
```

## 本轮主题

MVP-74：播放器底栏 / 首页重复入口继续清理。

## 关键改动

- 新增 `src/services/playerBarDailyCleanupService.ts`
- `PlayerBar.tsx` 新增 `mvp74-playerbar-daily-control-strip`
- `PlayerBar.tsx` 将旧底栏状态 chip 后置为 `sr-only` marker
- `Dashboard.tsx` 新增 `mvp74-home-daily-entry-cleanup`
- `Dashboard.tsx` 将 `mvp59-home-beta-polish` 与 `mvp39-media-overview` 默认后置为 `sr-only`
- 新增 `docs/CURRENT_ROADMAP_MVP74.md`
- 新增 `docs/PLAYERBAR_HOME_CLEANUP_MVP74.md`
- 新增 `scripts/verify-mvp74-playerbar-home-cleanup.mjs`

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

建议 MVP-75 做诊断页 MVP 历史按阶段分组折叠，继续降低日常使用噪音。
