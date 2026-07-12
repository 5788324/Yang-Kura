# CURRENT_ROADMAP_MVP64

版本：`0.102.0-mvp64`

本轮定位：MVP-64 诊断页黑视图修复。

## 本轮只修

- 点击左侧“诊断工具”后 Electron 窗口黑屏 / 黑视图。
- 给 `DiagnosticsPage` 增加 App 层运行时保护壳。
- 运行时异常时显示 `mvp64-diagnostics-runtime-fallback`，不让整窗黑屏。
- 设置页显示 `mvp64-diagnostics-black-view-fix` 复测说明。

## 不做

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不改扫描链路。
- 不改写 index 链路。
- 不改播放内核。
- 不做大组件一次性拆分。
