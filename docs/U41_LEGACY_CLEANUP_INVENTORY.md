# U41 历史代码、脚本、工作流与文档清理清单

## 当前状态

U41-D 已按“先证明不可达，再批量归档”完成本地清理。所有历史文件保留在 `archive/`，不再参与产品编译或现行 CI。

## 生产源码归档

| 类别 | 数量 | 位置 |
|---|---:|---|
| 冻结 Downloader 页面 | 1 | `archive/u41d-legacy-code/src/components/DownloaderPage.tsx` |
| 被正式页面替代的旧巨页 | 5 | `archive/u41d-legacy-code/src/components/` |
| 不可达历史 service / model / fixture | 88 | `archive/u41d-legacy-code/src/` |
| 合计 | 94 | `archive/u41d-legacy-code/` |

旧巨页包括：

- `DiagnosticsPage.tsx` → `DiagnosticsPageShell.tsx`；
- `SettingsPage.tsx` → `SettingsPageDaily.tsx`；
- `Dashboard.tsx` → `HomeLibraryPage.tsx`；
- `AsmrLibrary.tsx` → `AsmrLibraryPage.tsx`；
- `AsmrDetail.tsx` → `RjDetailPage.tsx`。

## 明确保留的声明例外

- `src/types/electron-api.d.ts`；
- `src/types/electron-runtime-shim.d.ts`。

两者是全局 TypeScript 声明，不要求出现在运行时 import graph。

## Downloader 冻结边界

以下生产入口已删除：

- `PageType.downloader`；
- `APP_ROUTE_REGISTRY.downloader`；
- Sidebar icon / hidden button；
- AppRouter lazy import / route branch；
- `src/components/DownloaderPage.tsx`。

`MVP130_EXPERIMENTAL_DO_NOT_MERGE.md` 继续保留，下载器实现不解冻。

## Workflow

现行 9 条 workflow：Architecture、Branch、Docs、Player Fast、UI Fast、U32、U40-B、U41-B、U41-C。

归档 8 条：Beta 3 专用发布、U33 三条、U39 final、U40-C、U40-D retest、U40-D real-library stability。位置：`archive/u41d-workflows/`。

## Verifier

- 归档 30 个失效的 MVP/历史 verifier；
- 删除 package 中对应 `verify:mvp*` 命令；
- 现行 verifier：58；
- 新增 `verify:u41d-legacy-cleanup`；
- 历史 package MVP 元数据保存到 `archive/u41d-history/package-mvp-metadata.json`。

## 结果

```text
生产代码文件：123
生产可达：121
不可达实现：0
声明例外：2
生产路由：7
Workflow：9
Verifier：58
```

## 验证

- `node scripts/audit-u41-product-surface.mjs`；
- `npm run verify:u41d-legacy-cleanup`；
- `npm run verify:stable`；
- `npm run build` 后无 Downloader chunk。
