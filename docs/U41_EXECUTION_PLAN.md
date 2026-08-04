# U41 执行计划

## U41-A：审计基线 — COMPLETE

页面、按钮、路由、模块、工作流和历史代码基线已建立。

## U41-B：日常用户入口 — COMPLETE / MERGED

- 真实四步 Importer；
- copy/move、冲突、OperationLog、rollback、Index backup/patch/refresh；
- 删除伪数据刷新；
- 单一版本源；
- Windows visible E2E 和 CI PASS。

## U41-C：运行时补丁 — COMPLETE / MERGED

- Electron 39.8.10 与依赖审计；
- worker/subframe/webview/window.open hardening；
- custom protocol / U28 / U29 / portable / NSIS PASS；
- PR #92 合并为 `main@18ada58b...`。

## U41-D：生产表面瘦身 — LOCAL COMPLETE / CUMULATIVE CANDIDATE

- Downloader 退出生产 route/bundle；
- 94 个历史源码文件归档；
- workflow 17→9；
- verifier 87→58；
- 不可达实现 93→0；
- focused verifier 与完整 stable 已建立。

## Git Fast Lane v2.3 — FIXED PROJECT RULE

- 多文件源码只通过真实 clone/native Git 发布；
- 一次正常尝试 + 最多一次同路径重试；
- 仍失败立即交给 Codex；
- 禁止 Contents API 逐文件提交；
- 禁止手工拼装 blob/tree/commit；
- 未经远端回读不得宣称分支、提交、PR 或 CI 存在。

## U41-E：1.0 RC 最终验收 — LOCAL IMPLEMENTED / WINDOWS VERIFY

- 候选版本 `1.0.0-rc.1`；
- 7 个生产路由 × 1280/1024/800 三档窗口；
- 溢出、控件越界、最小尺寸、键盘焦点和 About 版本门禁；
- U32 workflow 升级为单一 U41-E Windows RC 门禁；
- 复用 U28/U29/U30/U31/U40-B/U41-B；
- portable/NSIS、安装升级卸载、数据保留和进程回收纳入同一 workflow；
- 本地 Electron 可见测试因二进制下载 DNS 阻断而 `NOT RUN`，不再重试。

## 发布顺序

```text
累积源码包
→ Codex 干净 clone / 单一提交 / 一次推送 / Draft PR
→ GitHub U41-E workflow
→ Codex 固定 SHA 实机验收
→ GO 时创建 v1.0.0-rc.1 prerelease
→ RC 观察
→ 1.0.0
```
