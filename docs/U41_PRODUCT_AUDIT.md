# U41 全产品审计与 U41-B / U41-C 更新

## 当前结论

```text
基线：main @ 8a92978bbd07aa9f490ec15c9037366793168e2c
公开版本：0.170.0-beta.3
U41-A：COMPLETE
U41-B：LOCAL COMPLETE / WINDOWS VERIFY
U41-C：LOCAL COMPLETE / WINDOWS VERIFY
1.0.0：NO-GO
```

U41-A 发现的真实 Importer UI Blocker、伪数据刷新、About 旧版本和 Importer 历史 bundle 已在 U41-B 本地候选中修复。Electron 补丁、CRLF fixture、TopBar live region 和维护文案已在 U41-C 修复。U41-B/C 仍需 Draft PR Windows E2E、U28/U29、打包和 Codex 实机。

## 可复现审计

```text
node scripts/audit-u41-product-surface.mjs
npm run verify:u41b-daily-user-entry
npm run verify:u41c-runtime-patch
npm run lint
npm run build
npm run build:electron
npm run test:u31:importer-transactions
npm run verify:stable
```

## 当前规模

| 维度 | U41-A | U41-B |
|---|---:|---:|
| 生产路由 | 8 | 8 |
| 静态控件标记 | 268 | 274 |
| 代码模块 | 215 | 217 |
| 生产入口可达 | 146 | 123 |
| 不可达实现 | 67 | 92 |
| Workflow | 15 | 17 |
| verifier | 85 | 87 |
| test script | 21 | 22 |
| Importer minified chunk | 约 255 KB | 22.03 KB |

可达模块下降、不可达模块上升是预期结果：旧 Importer 历史模型不再进入生产 graph，但文件尚未删除。U41-D 将一次性迁移 verifier 并清理这些实现。

## U41-B 已处理

### U41-BLOCKER-001：真实导入 UI

新页面形成完整链：

```text
tokenized 来源选择与只读扫描
→ 文件选择、目标资源库、copy/move 与安全相对路径
→ 真实冲突预检
→ U31 事务、OperationLog、rollback
→ Index backup、patch、读回与 UI refresh
```

本地静态/事务门禁 PASS。Windows 可见 E2E 已编写但当前 Linux 环境 `NOT RUN`。

### U41-MAJ-001：伪数据刷新

生产 `App`、`AppRouter` 和 `AsmrLibraryPage` 不再包含随机封面、虚构音轨或“演示数据未联网”刷新链。

### U41-MAJ-002：版本事实

Vite 从 `package.json` 注入版本；About 读取统一常量。源码版本已同步为 `0.170.0-beta.3`。

### U41-MAJ-004：Importer bundle

旧 4000 行页面被紧凑 Daily 页面替换，生产 chunk 降至 22.03 KB。

## U41-C 已处理

- Electron 39.8.10 与 0 vulnerability audit；
- BrowserWindow worker/subframe/webview/window.open hardening；
- mpv fixture LF 与 `.gitattributes`；
- TopBar polite live region；
- 维护入口真实能力文案。

## 剩余风险

- U41-MAJ-005：冻结 downloader 仍在生产 route/bundle；
- U41-MAJ-006：约 92 个不可达实现待批量清理；
- U41-B Windows Importer E2E 与 Codex 实机未完成；
- U41-C U28/U29/custom protocol/portable/NSIS 未在当前 Linux 环境运行。

## 1.0 顺序

```text
U41-B + U41-C Windows 验收
→ U41-D
→ U41-E
→ 1.0.0-rc.1
→ 最终 Windows 验收
→ 1.0.0
```
