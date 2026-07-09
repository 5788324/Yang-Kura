# CURRENT_ROADMAP_MVP104 `mvp104-move-only-execution-readiness-v1`

当前版本：`0.142.0-mvp104`。

## 当前阶段

copy-only 导入链路已经在 MVP102 收口，MVP103 已经冻结 move-only strategy。本轮 MVP104 把 move-only 进入真实执行前必须满足的门禁压缩为一个 readiness gate。

```text
MVP103 move-only strategy
→ MVP104 move-only execution readiness
→ MVP105 small-sample move-only executor
→ MVP106 move-only closeout
→ MVP107 importer daily UI cleanup
```

## MVP104 做什么

- 消费现有 TargetPathPlan / ConflictReport。
- 生成 move-only preflight checks。
- 固定二次确认文本：`CONFIRM_MOVE_IMPORT`。
- 固定 `overwrite=false`。
- 固定 `executeButtonState=disabled-readiness-only`。
- 记录 OperationLog 必要字段和失败停止策略。
- 为 MVP105 小样本真实 move executor 准备输入边界。

## MVP104 不做什么

- 不执行真实 move。
- 不调用 `fs.rename`。
- 不调用 `fs.rm` / `fs.unlink`。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不接下载器。
- 不接元数据 Provider。
- 不接 mpv。
- 不返回 `absolutePath`。
- 不返回 `file://`。

## 提速决策

项目是个人本地项目，不分享、不商业、不作为开源发布目标。后续不做企业级权限系统，但保留最小必要边界：预览、确认、日志、失败停止、不覆盖、不静默删除。

Codex 非必要不安排；只有真实 move 或打包版关键验收需要本机确认时再使用。

UI 清理不插队。导入器工程说明目前保留给 AI 维护，用户本人不会看；导入器 copy + move 双链路完结后再折叠到诊断页 / AI 维护区。
