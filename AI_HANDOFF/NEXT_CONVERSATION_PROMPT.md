# 新对话启动提示词

请接手 `5788324/Yang-Kura`。

优先读取：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/WORKLOG.md`
5. `docs/U41B_DAILY_USER_ENTRY.md`
6. `docs/U41C_RUNTIME_PATCH.md`
7. `docs/U41_DEFECT_BACKLOG.md`

固定事实：

```text
main：8a92978bbd07aa9f490ec15c9037366793168e2c
公开版本：0.170.0-beta.3
U41-B + U41-C：本地累积候选完成，等待应用和 Windows 门禁
1.0：NO-GO
```

协作边界：ChatGPT 只读 GitHub并交付完整源码包；DeepSeek/Codex 使用一个分支、一个提交、一次推送和 Draft PR；Codex 负责 Windows 实机；用户不运行命令。

当前应用参数：

```text
branch: feat/u41bc-daily-runtime-closeout
parent: 8a92978bbd07aa9f490ec15c9037366793168e2c
commit: feat: connect importer and harden Electron runtime
```

必须检查：

- 累积 exact overlay；
- lint/build/build:electron；
- U41-B / U41-C verifier；
- npm audit moderate gate；
- U31 Importer transactions；
- Windows Importer visible E2E、U28、U29；
- portable/NSIS/U32；
- CI 全绿后再给 Codex 固定 SHA 实机任务。

不要解冻下载器、删除全部历史模块、跨 Electron 主版本或重写播放器。
