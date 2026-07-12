# Diagnostics Black View Fix MVP-64

版本：`0.102.0-mvp64`

MVP-64 修复本机 GUI 回归中点击“诊断工具”后出现的黑屏 / 黑视图问题。

## 背景

MVP-63 已确认：

- Node 22.22.2 / npm 10.9.7 环境可用。
- `desktop:setup` 可解析 `path.txt = electron.exe` 到 `node_modules/electron/dist/electron.exe`。
- `desktop:smoke-check:strict` 可执行 `electron --version`。
- `dev:electron` 可打开 `Yang-Kura Audio Library`。

剩余 blocker 是诊断页点击后黑视图。

## 变更

新增：

- `src/components/DiagnosticsRuntimeBoundary.tsx`
- `src/services/diagnosticsBlackViewFixService.ts`
- `scripts/verify-mvp64-diagnostics-black-view-fix.mjs`

修改：

- `src/App.tsx`
- `src/components/SettingsPage.tsx`
- `src/components/DiagnosticsPage.tsx`
- `src/services/index.ts`

## 核心策略

`DiagnosticsRuntimeBoundary` 包裹 `DiagnosticsPage`。

如果 `DiagnosticsPage` 某个区块渲染时报错：

- 不再让 React root 整体卸载成黑屏。
- 显示 `mvp64-diagnostics-runtime-fallback`。
- 降级页说明这是诊断页运行时错误，不影响首页、音声库、音乐库、播放器。
- 提供“重新尝试打开诊断页”按钮。

## 复测重点

1. `npm run desktop:setup`
2. `npm run desktop:smoke-check:strict`
3. `npm run dev:electron`
4. 点击左侧“诊断工具”
5. 确认不再出现整窗黑屏
6. 如果仍有诊断区块错误，应看到 `mvp64-diagnostics-runtime-fallback`
7. 返回首页 / 设置页后应用仍可继续使用

## 安全边界

MVP-64 不改变真实媒体链路：

- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 `absolutePath` 或 `file://`
