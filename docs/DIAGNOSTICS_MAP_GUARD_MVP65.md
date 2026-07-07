# MVP-65 — Diagnostics map guard

版本：`0.103.0-mvp65`

## 背景

MVP-64 的 Error Boundary 已经把诊断页黑屏降级为中文安全页，用户本机复测显示错误摘要为：

```text
Cannot read properties of undefined (reading 'map')
```

## 修复

`src/components/DiagnosticsPage.tsx` 新增 `toArray` 兜底函数，并把诊断页里容易来自历史 service / stored JSON / 运行时探针的数组输入包成安全数组。

重点覆盖：

- `electronStubSmokeCheck.methods`
- `method.safetyAssertions`
- `electronStubSmokeCheck.notes`
- `electronStubSmokeCheck.forbiddenActions`
- `fixtureReport.集合`
- `electronDryRunScannerMvp20Contract.acceleratedPlan`
- `storedDryRunReport.discoveredEntries`
- `filteredWorks`
- `scannedItems`
- `deadLinksList`
- `duplicateAnalysis`
- `group.works`

## 边界

本轮不改真实媒体链路：

- 不接 SQLite
- 不接下载器
- 不接元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 `absolutePath` / `file://`
- 不改扫描 / 写 index / 播放 / 字幕 / 打包链路

## 复测重点

1. 进入首页。
2. 点击左侧“诊断工具”。
3. 不应出现 `mvp64-diagnostics-runtime-fallback`。
4. 诊断页应正常显示，或至少不再出现 `undefined.map` 降级。
5. 首页 / 设置页 / 播放器仍可返回使用。
