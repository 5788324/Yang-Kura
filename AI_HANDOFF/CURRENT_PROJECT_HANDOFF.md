# Yang-Kura 当前项目交接

## 当前结论

```text
仓库：https://github.com/5788324/Yang-Kura.git
main：8a92978bbd07aa9f490ec15c9037366793168e2c
公开版本：0.170.0-beta.3
Tag：v0.170.0-beta.3
当前本地任务：U41-B + U41-C 累积候选
GitHub：尚未提交、尚未推送、尚未建立 PR
1.0.0：NO-GO
```

Beta 3 已发布。U41-A 审计完成。U41-B 和 U41-C 均已在同一固定父 SHA 本地完成，但 Windows 可见 Importer、U28/U29 和 portable/NSIS 尚未在 Draft PR CI/Codex 实机运行。

## 协作规则

- ChatGPT 只读 GitHub，负责本地开发、测试、文档和完整源码包；
- DeepSeek / Codex 固定父 SHA 应用源码包；
- 一个任务一个分支、一个提交、一次推送、Draft PR；
- Codex 负责 Windows Electron GUI、公开安装包和真实媒体；
- 用户不执行 Git、构建或测试。

## 累积产品变更

### U41-B

1. `ImporterPage` 为真实四步流程；
2. 来源/目标目录使用独立 tokenized 角色；
3. copy/move 接 U31 transaction、OperationLog 和 rollback；
4. 成功后 Index backup、patch、读回并刷新协调器；
5. 删除伪元数据刷新；
6. About 版本来自 package build define；
7. Importer chunk 约 22 KB。

### U41-C

1. Electron 依赖与 setup 固定到 `^39.8.10`；
2. audit 为 0 vulnerability；
3. 显式关闭 worker/subframe Node integration、webview 和 `window.open`；
4. mpv fixture 永久 LF，新增 `.gitattributes`；
5. TopBar 增加 polite live region；
6. 维护入口改为真实资源状态与性能检查；
7. 新增 Windows U28/U29/portable/NSIS 合并门禁。

详见 `docs/U41B_DAILY_USER_ENTRY.md` 和 `docs/U41C_RUNTIME_PATCH.md`。

## 已通过

- lint；
- Renderer / Electron build；
- U41-B / U41-C focused verifier；
- U40-D 兼容 verifier；
- U31 importer transactions；
- U30；
- Beta 3 runtime hardening；
- 50,000 音轨；
- MVP129 Index maintenance；
- npm audit；
- stable regression（不再临时转换 CRLF fixture）。

当前 Linux 环境无法下载 Electron binary。U41-B visible E2E、U28/U29 和打包严格为 `NOT RUN`。

## 应用任务

```text
branch: feat/u41bc-daily-runtime-closeout
parent: 8a92978bbd07aa9f490ec15c9037366793168e2c
commit: feat: connect importer and harden Electron runtime
PR: Draft
push: exactly once
```

应用前必须确认远端 `main` 仍等于固定父 SHA；否则停止并回报，不允许自动 rebase 或覆盖。

## PR 门禁

- Windows U41-B 与 U41-C workflows 全绿；
- `test:u41b:importer-e2e`、U28、U29 PASS；
- portable / NSIS / U32 PASS；
- Codex `%TEMP%` copy/move、冲突、失败回滚、OperationLog、Index backup/patch、重启刷新 PASS；
- 不访问或修改真实 `E:\arsm` 媒体本体；
- 门禁未完成前保持 Draft / NO-GO。

## 后续

本累积 PR 合并后执行 U41-D：冻结 downloader 与历史 production surface 批量清理。不要在当前候选混入下载器实现或全局架构重写。
