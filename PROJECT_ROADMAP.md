# PROJECT_ROADMAP

## 基线

```text
公开版本：0.170.0-beta.3
main：18ada58b76a3aa0828506d2d02c57ecd22fbc587
本地候选：1.0.0-rc.1
当前主线：U41-E 1.0 RC 最终验收
正式目标：1.0.0
1.0：NO-GO / WINDOWS VERIFY
```

## 已完成

- U34～U40：架构、日常页面、播放器、真实库、重启、封面和 Beta 3；
- U41-A：产品 UI / 功能 / 按钮 / 代码表面审计；
- U41-B：真实 Importer、伪刷新删除、版本单一来源；
- U41-C：Electron 39.8.10、运行时 hardening、Windows 打包验收；
- PR #92：合并到 `main@18ada58b...`；
- U41-D 本地：Downloader 退出生产、不可达实现归零、workflow/verifier 收敛；
- Git Fast Lane v2.3：原生 Git 失败即止损并交给 Codex；
- U41-E 本地实现：RC 版本、最终多窗口/键盘门禁、单一 Windows RC workflow。

## U41-E：当前门禁

1. 固定父 SHA `18ada58b...`；
2. 累积包含 U41-D、Git v2.3 与 U41-E；
3. 一个分支 `release/u41e-rc1-candidate`；
4. 一个提交 `release: prepare Yang-Kura 1.0.0-rc.1`；
5. 一次推送和 Draft PR；
6. GitHub `U41-E Release Candidate Final Acceptance` 全绿；
7. Codex 固定 SHA 完成真实 Windows、声卡、三档窗口、portable/NSIS、安装升级卸载和数据保留；
8. Blocker/Major 为 0。

## 后续顺序

```text
U41-E Draft PR + Windows CI
→ Codex 固定 SHA 实机验收
→ 1.0.0-rc.1 GO / NO-GO
→ GO 时创建 v1.0.0-rc.1 prerelease
→ RC 观察与缺陷收口
→ 1.0.0 最终候选
→ Windows 最终验收
→ v1.0.0
```

## 冻结范围

Downloader、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步、插件市场和全局架构重写不进入 1.0 RC。

## Git 发布约束

以 `docs/GIT_FAST_LANE_V2.md` v2.3 为唯一有效规则：禁止 GitHub API 多文件源码发布；真实 Git 发布失败最多一次同路径重试，随后立即交给 Codex，不再消耗时间绕过连接器限制。
