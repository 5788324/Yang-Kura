# MOVE_ONLY_STRATEGY_MVP103 `mvp103-move-only-strategy-v1`

## 目标

MVP103 定义受控 move-only 导入策略。它不是 executor，不移动任何真实文件。

## 关键决策

1. copy-only 仍是默认推荐导入方式。
2. move-only 是用户显式选择的高风险动作。
3. move-only 必须基于既有 ImportPlan / TargetPathPlan / ConflictReport。
4. move-only 执行前必须二次确认。
5. move-only 必须写 OperationLog。
6. 失败时停止，不继续清理源目录。
7. 目标冲突默认跳过，不覆盖。
8. 跨盘移动按 copy + verify + cleanup 的安全模型设计，不假设 rename 永远成功。

## 个人项目边界

Yang-Kura 是个人本地项目，不分享、不商业、不作为开源发布目标。安全边界不按企业级权限系统设计，但真实文件移动必须保留：

```text
预览
二次确认
操作日志
不覆盖
失败停止
可解释结果
```

## UI 策略

导入器主界面最终只保留日常使用内容：

```text
选择来源
导入预览
冲突摘要
目标路径
执行按钮
结果摘要
```

MVP86-MVP106 的工程卡片、合同、verifier 文案后续折叠进：

```text
诊断页
AI 维护区
开发者详情
```

MVP103 不做 UI 大清理，避免和 move-only 策略混改。UI cleanup 放到导入器完结后。

## Codex

MVP103 不需要 Codex。Codex 额度少，只在必要实机测试或关键验收时使用。
