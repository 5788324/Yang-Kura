# U41 历史代码、脚本、工作流与文档清理清单

## 原则

- 先修功能，再清理；
- 批量处理引用与 verifier，不逐个失败逐个补；
- 删除前必须确认生产 import、测试、构建和发布链均无依赖；
- 历史证据优先移动到 `archive/`，不要求全部永久删除；
- 不在清理轮解冻新功能或重写架构。

## A. 生产入口不可达的旧页面

| 文件 | 约大小 | 替代页面 | 建议 |
|---|---:|---|---|
| `src/components/DiagnosticsPage.tsx` | 509 KB | `DiagnosticsPageShell.tsx` | 移入 archive，更新文本 verifier |
| `src/components/SettingsPage.tsx` | 197 KB | `SettingsPageDaily.tsx` | 移入 archive，保留必要测试 fixture |
| `src/components/AsmrDetail.tsx` | 66 KB | `features/library/RjDetailPage.tsx` | 删除生产副本 |
| `src/components/AsmrLibrary.tsx` | 61 KB | `features/library/AsmrLibraryPage.tsx` | 删除生产副本 |
| `src/components/Dashboard.tsx` | 40 KB | `features/library/HomeLibraryPage.tsx` | 删除生产副本 |

## B. 不可达历史 service

静态生产 import 图识别 67 个不可达实现模块。主要类别：

- Beta 候选/收口展示模型；
- MVP19～MVP28 Electron 合同展示模型；
- 旧 diagnostics/settings UI model；
- fixture scanner 与 virtual path 历史模型；
- UI bug sweep / layout review / cleanup 展示模型；
- 旧 `src/services/index.ts` 汇总出口；
- `mockData.ts`、`quickFiltersData.ts`。

处理建议：

1. 先生成“生产 import 为 0、测试 import 为 N”的矩阵；
2. 测试只需要文本 fixture 的，移动到 `tests/fixtures/history/`；
3. 只被旧 verifier 读取的，随 verifier 一起归档；
4. 仍被当前业务 service 间接使用的不得删除。

## C. Importer 历史模型

当前 `ImporterPage.tsx`：

- 约 186 KB 源码；
- import 子图 26 文件、约 425 KB；
- production minified chunk 约 255 KB；
- 初始化 20+ 个历史 `getModel()`；
- 大部分内容在 hidden `<section>` / `<details>` 内；
- 日常 UI 没有真实执行入口。

建议不是“小修当前文件”，而是：

```text
新建 ImporterPageDaily
→ 只保留来源、预览、冲突、copy/move、结果五个状态
→ 接入已有 Main transaction IPC
→ 将旧 ImporterPage 与模型整体归档
```

## D. 下载器实验页

- 从 `PageType` 删除 `downloader`；
- 从 `APP_ROUTE_REGISTRY` 删除；
- 从 `NAVIGATION_ICONS`、隐藏按钮和 AppRouter 删除；
- 把 `DownloaderPage.tsx` 移入 `archive/experimental-downloader/`；
- 保留 `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`，继续冻结实现。

## E. Workflows

当前 15 条 workflow。1.0 前建议：

### 保留并收敛

- Branch Validation；
- Documentation Validation；
- Architecture Guardrails；
- Player Fast Validation；
- U40-B Full Product Acceptance（仅手动/大范围变更）；
- U32 Release Candidate Packaging；
- 未来 1.0 Release workflow。

### 归档或改为手动历史审计

- Beta 1/Beta 2 U33 三条历史 release audit；
- U39 final acceptance；
- U40-C UI polish；
- U40-D Codex retest；
- U40-D Real Library Stability；
- Beta 3 专用 release workflow在 1.0 发布后归档。

不得在当前审计 PR 中直接删除；应在功能缺陷修完后一次性调整。

## F. 文档与脚本规模

| 类别 | 数量 |
|---|---:|
| docs | 117 |
| archive | 478 |
| root `CURRENT_ROADMAP_MVP*` | 18 |
| verifier scripts | 85 |
| test scripts | 21 |

核心事实源只保留：

- README；
- PROJECT_STATE；
- PROJECT_ROADMAP；
- WORKLOG；
- CURRENT_PROJECT_HANDOFF；
- DESIGN；
- 当前版本 Release Notes；
- 当前阶段验收/缺陷文档。

其余历史阶段文档按版本批量归档，不再作为强制 verifier token。

## G. 明确保留

- `src/types/electron-api.d.ts` 与 runtime shim：虽然 import 图不可达，但属于 TypeScript 全局声明；
- Electron IPC contracts、preload contracts、main services；
- release plan、发布 notes、Beta 2 publication state；
- 当前 U28/U29/U30/U31/U32/U40-B 核心测试；
- 真实文件操作安全边界和 OperationLog 实现；
- DESIGN 与主题 token。
