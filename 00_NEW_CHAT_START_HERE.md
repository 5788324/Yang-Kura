# 00_NEW_CHAT_START_HERE

新对话接手 Yang-Kura 时，按以下顺序阅读：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `AI_HANDOFF/00_READ_THIS_FIRST.md`
3. `PROJECT_STATE.md`
4. `PROJECT_ROADMAP.md`
5. `docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md`
6. `docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md`
7. `docs/UI_DAILY_SURFACE_RULES.md`
8. `RUN_ME_FIRST.md`
9. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 当前状态摘要

```text
核心版本：0.167.0-mvp129
U02～U26：已完成
U27 最终结论：NO-GO
当前主线：U28 资源库授权 → 真实 Index → 浏览 → 播放闭环
阻断项：MAJ-001、MAJ-002
MVP130：继续冻结，禁止合入
```

用户反馈问题可能已经修复并推送到 Git，但交接时 GitHub `main` 未显示可验证的产品修复提交。新对话第一步必须拉取最新 `origin/main`、检查最近提交和 PR，并核对修复实际位置；不要直接重复开发或宣布已修复。

不要从旧 Round、旧固定 SHA、历史 MVP 文档或旧 ZIP 开始。完整交接和执行决策树统一见 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`。