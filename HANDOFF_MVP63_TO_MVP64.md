# HANDOFF MVP-63 TO MVP-64

当前版本：`0.102.0-mvp64`

## 本轮完成

MVP-64：诊断页黑视图修复。

新增 App 层 `DiagnosticsRuntimeBoundary`，包裹 `DiagnosticsPage`。如果诊断页局部运行时报错，显示 `mvp64-diagnostics-runtime-fallback` 中文降级页，避免 Electron 窗口整窗黑屏。

## 本机复测顺序

```bash
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

重点点击左侧“诊断工具”。

## 禁止项

不接 SQLite / 下载器 / 元数据抓取 / mpv，不删除 / 移动 / 重命名真实媒体文件，不改扫描和写 index 链路。
