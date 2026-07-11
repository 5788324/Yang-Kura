# MVP112 UI Audit Bugfix

本轮来源于 Codex GUI 审计的 `NEEDS_FIX` 结论。

## 修复映射

- High：旧设置绝对路径泄露 → 初始化迁移、setter 过滤、安全显示、local 输入只读。
- Major：Downloader duplicate key → 时间戳 + 单调序列 ID；旧下载 Demo 默认不渲染。
- Major：页面切换滚动不复位 → 主滚动容器 ref + route/detail effect。
- Major：Importer 工程面板感 → 四步日常流程置顶，高级工具折叠。
- Medium：Diagnostics 过重 → 轻量外壳 + 按需挂载完整维护页。
- Medium：无障碍 → 收藏、队列、外部打开、定位、播放按钮补 accessible name；hover-only 播放按钮改为常显。
- Performance：Diagnostics / Importer / Downloader / Settings / LyricsPanel 代码拆分。

## 兼容说明

旧 verifier 标记仍保留在源码，但不再通过 `sr-only` 暴露给屏幕阅读器。
