# U41-D 冻结功能与历史代码清理

## 基线与结论

```text
base main: 18ada58b76a3aa0828506d2d02c57ecd22fbc587
public version: 0.170.0-beta.3
local result: PASS
Windows result: INCLUDED IN U41-E CUMULATIVE WINDOWS VERIFY
1.0.0-rc.1: NO-GO / WINDOWS VERIFY
```

## 生产路由清理

冻结 Downloader 已从以下位置删除：

- `PageType`；
- `APP_ROUTE_REGISTRY`；
- Sidebar icon map 与隐藏按钮；
- AppRouter lazy import 与 route branch；
- `src/components/DownloaderPage.tsx`。

历史源码保存在 `archive/u41d-legacy-code/src/components/DownloaderPage.tsx`。本轮不实现任何下载能力。

## 不可达实现归档

U41-B 后的审计发现 93 个生产不可达实现。本轮全部迁入 `archive/u41d-legacy-code/`，主要包括：

- 被正式页面替代的 Diagnostics、Settings、Dashboard、AsmrLibrary、AsmrDetail；
- 旧 Importer 展示模型和 copy/move 阶段模型；
- MVP19～MVP28 Electron 合同展示 service；
- fixture scanner、virtual path 和 demo model；
- Beta 候选、UI review、布局 polish 和历史 closeout model；
- 旧 `src/services/index.ts`、`mockData.ts`、`quickFiltersData.ts`。

归档目录不参与 TypeScript 编译，但保持原始相对结构，便于历史追溯。

## 代码图结果

| 指标 | U41-B/C | U41-D |
|---|---:|---:|
| 生产路由 | 8 | 7 |
| 代码文件 | 217 | 123 |
| 生产可达 | 123 | 121 |
| 不可达实现 | 92～93 | 0 |
| 声明例外 | 2 | 2 |
| Workflow | 17 | 9 |
| Verifier | 87 | 58 |
| Importer chunk | 22.03 KB | 22.02 KB |
| Downloader chunk | 存在 | 不存在 |

两个声明例外为：

- `src/types/electron-api.d.ts`；
- `src/types/electron-runtime-shim.d.ts`。

它们是 TypeScript 全局声明，明确保留。

## Workflow 与 verifier 收敛

迁入 `archive/u41d-workflows/`：

- Beta 3 专用发布 workflow；
- U33 三条历史发布 workflow；
- U39 final acceptance；
- U40-C UI polish；
- U40-D Codex retest；
- U40-D Real Library Stability。

现行 9 条 workflow：

1. Architecture Guardrails；
2. Branch Validation；
3. Documentation Validation；
4. Player Fast Validation；
5. UI Fast Validation；
6. U32 Release Candidate Packaging；
7. U40-B Full Product Acceptance；
8. U41-B Daily User Entry；
9. U41-C Runtime Patch。

30 个失效的 MVP/历史 verifier 迁入 `archive/u41d-verifiers/`。对应 `verify:mvp*` package 命令已删除；历史 package MVP 元数据保存在 `archive/u41d-history/package-mvp-metadata.json`。

## 新门禁

`verify:u41d-legacy-cleanup` 验证：

- 路由只剩 7 个；
- Downloader 不存在于生产源码；
- 不可达实现为 0；
- archive 证据存在；
- workflow 为 9；
- verifier 不超过 60；
- Importer 使用 U41-B 当前锚点；
- stable 已接入 U41-D。

## 本地验证

```text
npm audit --audit-level=moderate       PASS / 0 vulnerabilities
npm run lint                           PASS
npm run build:electron                 PASS
npm run build                          PASS / 1781 modules
npm run verify:u29-player-reliability  PASS
npm run verify:u30-ui-fast-track       PASS
npm run test:u31:importer-transactions PASS
npm run verify:u41b-daily-user-entry   PASS
npm run verify:u41c-runtime-patch      PASS
npm run verify:u41d-legacy-cleanup     PASS
npm run verify:handoff                 PASS
npm run verify:stable                  PASS
```

所有 importer smoke 和 transaction 测试只使用临时目录，没有访问真实媒体库。

## Windows 合并门禁

U41-D 不再单独发布，将随 U41-E 累积候选以固定父 SHA 建立一个 Draft PR，并通过现行 9 条 workflow 中被路径触发的门禁。重点确认：

- UI 中不存在 Downloader 入口；
- Importer、Settings、Diagnostics maintenance 正常打开；
- portable/NSIS 构建和 packaged readiness 正常；
- U28/U29/U31 无回归；
- dist 不包含 Downloader chunk；
- 无残留进程。
