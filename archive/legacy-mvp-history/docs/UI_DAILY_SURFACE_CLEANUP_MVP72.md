# MVP-72：日常界面继续收口

```text
version: 0.110.0-mvp72
类型：UI / 信息架构收口
```

## 目标

MVP-72 不新增功能，只继续把 Yang-Kura 从“工程验证面板”收成“日常媒体库软件”。

主界面原则：

```text
首页先服务听音频：继续播放、最近播放、最近加入、资源库入口。
普通页面不显示 MVP / verifier / IPC / Scanner / Contract 等工程词。
维护信息保留，但默认折叠在 AI 维护区、开发者详情、历史验证、高级诊断中。
```

## 改动

```text
src/services/dailySurfaceCleanupService.ts
src/components/Dashboard.tsx
src/components/SettingsPage.tsx
src/components/DiagnosticsPage.tsx
src/services/index.ts
scripts/verify-mvp72-daily-surface-cleanup.mjs
```

## 验收点

```text
package.json version = 0.110.0-mvp72
首页存在 mvp72-home-daily-surface-cleanup
设置页存在 mvp72-settings-daily-workflow-cleanup
诊断页存在 mvp72-daily-diagnostics-summary
AI 维护 details 默认折叠
verify:all 包含 verify:mvp72-daily-surface-cleanup
```

## 安全边界

```text
不接 SQLite
不接下载器
不接 ASMR.one / DLsite / 网易云元数据抓取
不接 mpv
不删除 / 移动 / 重命名真实媒体文件
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
不改真实扫描 / 写 index / 播放内核链路
```
