# U41 缺陷清单

```text
Beta 3：已发布，可继续个人日用
U41-B / U41-C：Windows + CI PASS，已合并
U41-D：本地 PASS，等待 Draft PR CI
1.0.0：NO-GO
```

| ID | 级别 | 状态 | 证据 / 下一门禁 |
|---|---|---|---|
| U41-BLOCKER-001 | Blocker | CLOSED | 真实四步 Importer、U31、Windows visible E2E 和 GitHub CI 全部通过 |
| U41-MAJ-001 | Major | CLOSED | 伪刷新、随机封面和虚构音轨 handler 已删除 |
| U41-MAJ-002 | Major | CLOSED | About 使用统一 `APP_VERSION` |
| U41-MAJ-003 | Major | CLOSED | Electron 39.8.10、custom protocol、U28/U29、portable/NSIS PASS |
| U41-MAJ-004 | Major | CLOSED | Importer chunk 约 22 KB，旧模型退出生产 graph |
| U41-MAJ-005 | Major | FIXED IN U41-D / CI VERIFY | Downloader 已从 PageType、导航、Router、Sidebar、生产源码和 dist 移除 |
| U41-MAJ-006 | Major | FIXED IN U41-D / CI VERIFY | 93 个不可达实现已归档；生产图不可达实现为 0 |
| U41-MIN-001 | Minor | CLOSED | mpv fixtures 固定 LF |
| U41-MIN-002 | Minor | CLOSED | 维护入口文案与真实能力一致 |
| U41-MIN-003 | Minor | CLOSED | TopBar polite live region |

## U41-D 合并门禁

- 固定父 SHA `18ada58b76a3aa0828506d2d02c57ecd22fbc587`；
- 一个分支、一个提交、一次推送、Draft PR；
- lint、build、build:electron、stable、U41-D verifier PASS；
- Windows UI matrix、U28/U29/U31、U32 packaged readiness PASS；
- dist 无 Downloader chunk；
- archive 不参与产品编译；
- 无真实媒体修改或残留进程。

## 不扩大范围

- 不实现下载器；
- 不改播放器架构；
- 不改 Index schema；
- 不删除 archive 历史证据；
- 不把 U41-E 视觉/安装包验收混入 U41-D。
