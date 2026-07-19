# U41 缺陷清单

```text
Beta 3：已发布，可继续个人日用
U41-B：本地候选完成，等待 Windows CI/实机
U41-C：本地候选完成，等待 Windows runtime/packaging
1.0.0：NO-GO
```

| ID | 级别 | 状态 | 证据 / 下一门禁 |
|---|---|---|---|
| U41-BLOCKER-001 | Blocker | FIXED IN CANDIDATE / VERIFY | 日常四步 Importer 已接 Main 事务；U31、本地构建 PASS；必须通过 Windows 可见流程 E2E 和 Codex `%TEMP%` 实机后关闭 |
| U41-MAJ-001 | Major | FIXED IN CANDIDATE | 生产音声库伪刷新按钮、随机封面和虚构音轨 handler 已删除 |
| U41-MAJ-002 | Major | FIXED IN CANDIDATE | About 读取 Vite 注入的 package version；源码版本为 `0.170.0-beta.3` |
| U41-MAJ-003 | Major | FIXED IN CANDIDATE / WINDOWS VERIFY | Electron 升至 39.8.10，audit 为 0；显式关闭 worker/subframe Node 集成与新窗口；必须重跑 protocol/U28/U29/portable/NSIS |
| U41-MAJ-004 | Major | FIXED IN CANDIDATE | Importer chunk 从约 255 KB 降为约 22 KB；历史模型退出生产 graph |
| U41-MAJ-005 | Major | OPEN / U41-D | 冻结 downloader 仍保留 production route 和 lazy chunk |
| U41-MAJ-006 | Major | OPEN / U41-D | U41-B 后不可达实现约 92 个，包含退出 production graph 的历史 importer services；需批量清理 |
| U41-MIN-001 | Minor | FIXED IN CANDIDATE | mpv executable fixtures 已永久转 LF，并由 `.gitattributes` 固定 |
| U41-MIN-002 | Minor | FIXED IN CANDIDATE | 维护入口改为真实资源统计与性能检查，明确历史工程诊断已归档 |
| U41-MIN-003 | Minor | FIXED IN CANDIDATE | TopBar 状态增加 polite live region 和 atomic update |

## 合并前门禁

- U41-B Windows Importer E2E；
- U41-C U28 / U29 / custom protocol；
- portable / NSIS 构建、安装、覆盖安装、卸载与页面就绪；
- Codex `%TEMP%` copy/move、冲突、失败回滚、OperationLog、Index backup/patch/refresh；
- 无绝对路径泄漏、真实库破坏或残留进程。

## 不扩大范围

- 不实现下载器；
- 不跨 Electron 主版本；
- 不删除全部不可达模块；
- 不改播放器架构；
- 不以 Linux 静态验证替代 Windows Electron 可见流程。
