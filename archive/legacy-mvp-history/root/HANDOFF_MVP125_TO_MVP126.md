# HANDOFF MVP125 → MVP126

## 版本

`0.164.0-mvp126`

## 主题

大资源库性能评估与首屏降载。

## 关键文件

- `src/services/libraryPerformanceService.ts`
- `src/components/DiagnosticsPageShell.tsx`
- `src/components/LibraryPerformanceDiagnosticsPanel.tsx`
- `scripts/benchmark-mvp126-large-library.mjs`
- `scripts/verify-mvp126-large-library-performance.mjs`
- `docs/LARGE_LIBRARY_PERFORMANCE_MVP126.md`

## 重点回归

- 音声/音乐搜索结果总数保持正确。
- “再显示”只扩大渲染窗口，不改变筛选结果。
- 播放队列仍使用完整筛选结果。
- 完整诊断页仍可主动打开。
- 导入器、元数据、mpv 回归不受影响。
