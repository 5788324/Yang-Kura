# U41 执行计划

## U41-A：审计基线 — COMPLETE

页面、按钮、路由、模块、工作流和历史代码基线已建立。

## U41-B：日常用户入口 — LOCAL COMPLETE / WINDOWS VERIFY

- 真实四步 Importer；
- copy/move、冲突、OperationLog、rollback、Index backup/patch/refresh；
- 删除伪数据刷新；
- 单一版本源；
- 历史 Importer 退出生产 bundle；
- Draft PR Windows E2E 和 Codex `%TEMP%` 实机为合并门禁。

## U41-C：运行时补丁 — LOCAL COMPLETE / WINDOWS VERIFY

- Electron 39.8.10 补丁与 0 vulnerability audit；
- 显式关闭 worker/subframe Node 集成、webview 与新窗口；
- custom protocol / U28 / U29 / packaging Windows 工作流；
- mpv fixture 永久 LF 与 `.gitattributes`；
- TopBar 辅助技术状态播报；
- 维护入口文案校正。

## U41-D：生产表面瘦身

- 移除冻结 downloader route/bundle；
- 归档旧巨页；
- 批量迁移历史 verifier；
- 清理不可达 service/workflow/docs；
- 一次完整回归。

## U41-E：公开包与 RC

- Codex 验收 Beta 3 portable/NSIS；
- 修复确认缺陷；
- 发布 `1.0.0-rc.1`；
- 最终 Windows 验收后发布 `1.0.0`。
