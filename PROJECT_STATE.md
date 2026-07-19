# PROJECT_STATE

## 当前状态

```text
公开版本：0.170.0-beta.3
公开标签：v0.170.0-beta.3
main：8a92978bbd07aa9f490ec15c9037366793168e2c
Beta 3：已发布
当前任务：U41-B + U41-C 累积候选
GitHub 状态：尚未提交、尚未推送、尚未建立 PR
1.0.0：NO-GO
```

## U41-B 已完成的本地产品修改

1. 日常 Importer 改为真实四步流程；
2. 复用 tokenized scanner、copy/move、OperationLog、rollback 和 Index patch IPC；
3. 来源与目标目录选择角色分离；
4. 删除生产音声库伪数据刷新入口和 handler；
5. Vite 从 `package.json` 注入应用版本；
6. 历史 Importer 模型退出生产依赖图，chunk 约 22 KB。

## U41-C 已完成的本地运行时修改

1. Electron 从 39.8.1 升至 39.8.10；
2. `npm audit --audit-level=moderate` 为 0 vulnerability；
3. 显式关闭 worker/subframe Node 集成、webview 与 Renderer 新窗口；
4. custom protocol 保持 tokenized path、静态 MIME、Range 与 `corsEnabled=true（Renderer fetch 兼容；token 与相对路径校验不变）`；
5. mpv executable fixtures 永久使用 LF，并新增 `.gitattributes`；
6. TopBar 状态增加 polite live region；
7. 维护入口明确只提供真实资源统计和性能检查。

## 本地验证

已通过：lint、Renderer build、Electron build、U41-B/U41-C focused verifier、U40-D 兼容 verifier、U31 importer transactions、U30、Beta 3 runtime hardening、50,000 音轨、MVP129 Index maintenance、`npm audit` 和 stable regression。

当前 Linux 环境无法下载 Electron 39.8.10 二进制，因此以下严格为 `NOT RUN`：

- U41-B Windows Importer 可见 E2E；
- U28 / U29 Electron E2E；
- portable / NSIS 与 U32 安装链。

## U41 缺陷状态

| ID | 当前状态 |
|---|---|
| U41-BLOCKER-001 真实 Importer UI | FIXED IN CANDIDATE / WINDOWS VERIFY |
| U41-MAJ-001 伪元数据刷新 | FIXED IN CANDIDATE |
| U41-MAJ-002 About 旧版本 | FIXED IN CANDIDATE |
| U41-MAJ-003 Electron 补丁 | FIXED IN CANDIDATE / WINDOWS VERIFY |
| U41-MAJ-004 Importer 历史 bundle | FIXED IN CANDIDATE |
| U41-MIN-001～003 | FIXED IN CANDIDATE |
| U41-MAJ-005 冻结下载器生产路由 | OPEN / U41-D |
| U41-MAJ-006 历史不可达模块 | OPEN / U41-D |

## 下一门禁

- 固定父 SHA 应用 U41-A+B+C 累积覆盖层；
- 一个提交、一次推送、Draft PR；
- Windows U41-B 与 U41-C workflows 全绿；
- Codex 完成 `%TEMP%` Importer、U28/U29、portable/NSIS 与进程回收；
- 未完成前不合并，不开始 U41-D 远端集成。
