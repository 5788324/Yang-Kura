# HANDOFF MVP-78 TO MVP-79

## 基线

- 上一版：`0.116.0-mvp78`
- 当前版：`0.117.0-mvp79`
- 本轮类型：播放器 UI bugfix

## DeepSeek 审查输入

DeepSeek 结论：`NEEDS_FIX`，不是 `STOP`。

主要建议：

- 修复 PlayerBar 和其他组件中的非标准 Tailwind 类。
- 修复 More 死按钮。
- 移除播放栏整栏点击打开歌词页的误触发。
- 修复 LyricsPanel 中 `scale-102`。
- 修复暗屏时钟不刷新。
- 统一 LRC 毫秒解析。

## 本轮实际处理

- 新增 `src/services/playerUiBugfixService.ts`。
- 更新 `src/components/PlayerBar.tsx`。
- 更新 `src/components/LyricsPanel.tsx`。
- 更新 `src/components/DiagnosticsPage.tsx`。
- 更新 `src/index.css`。
- 新增 `docs/CURRENT_ROADMAP_MVP79.md`。
- 新增 `docs/PLAYER_UI_BUGFIX_MVP79.md`。
- 新增 `scripts/verify-mvp79-player-ui-bugfix.mjs`。

## 保持不变

不接 SQLite / 下载器 / 元数据抓取 / mpv；不删除、移动、重命名真实媒体文件；不向 Renderer 暴露 absolutePath 或 file://；不改扫描、写 index、播放内核链路。

## 下一轮建议

MVP-80：设置页 / 诊断页最终日常化检查。

- 不删除 / 移动 / 重命名真实媒体文件。
