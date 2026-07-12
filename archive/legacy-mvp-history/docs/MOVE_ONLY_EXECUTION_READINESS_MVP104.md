# MOVE_ONLY_EXECUTION_READINESS_MVP104 `mvp104-move-only-execution-readiness-v1`

## 目标

MVP104 是 move-only 真实执行前的最后一个门禁 MVP。它不移动文件，只确认下一轮 MVP105 需要具备哪些输入、确认、冲突、日志和失败停止策略。

## Readiness 输出

核心服务：

```text
src/services/moveOnlyExecutionReadinessService.ts
```

核心结果：

```text
readinessVersion: mvp104-move-only-execution-readiness-v1
mode: move-only-execution-readiness
canExecuteMoveInMvp104: false
confirmationText: CONFIRM_MOVE_IMPORT
executeButtonState: disabled-readiness-only
realMoveExecuted: false
fsRenameCalled: false
fsRmCalled: false
fsUnlinkCalled: false
```

## MVP105 必须输入

```text
sourceRootToken
targetRootPathToken
ImportPlan / TargetPathPlan
ConflictReport
confirmationText = CONFIRM_MOVE_IMPORT
overwrite = false
operationLog enabled
```

## 失败策略

- blocker 存在时不进入执行。
- 目标存在同名文件时跳过或阻塞，不覆盖。
- 执行中失败必须停止当前批次。
- 不继续清理源目录。
- 失败结果进入 OperationLog 和用户可读摘要。

## 安全边界

本轮仍然不做真实文件变更。`fs.rename`、`fs.rm`、`fs.unlink`、`fs.copyFile`、`fs.writeFile` 不进入 MVP104 服务。

## 后续

下一轮可以进入 `MVP105 small-sample move-only executor`，但必须保持小样本、二次确认、禁覆盖、失败停止和 OperationLog。
