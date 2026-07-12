# MVP-80 — Settings / Diagnostics Daily Finalization

## 目标

本轮继续减少普通用户界面的工程感。设置页和诊断页保留必要维护能力，但默认表层只显示日常用户需要的信息。

## 设置页调整

新增：

```text
mvp80-settings-daily-finalize
mvp80-settings-daily-cards
mvp80-settings-hidden-engineering-terms
mvp80-settings-history-folded
```

效果：

- 资源库、主题、隐私说明仍是日常入口。
- 高级资源库工具继续默认收起。
- Beta / Electron / GUI 回归等历史维护记录默认折叠。
- 可见文案更偏“资源库记录 / 扫描预览 / 应用记录”，减少 Scanner / Contract / Dry-run / MVP 标签直出。

## 诊断页调整

新增：

```text
mvp80-diagnostics-daily-finalize
mvp80-diagnostics-daily-cards
mvp80-diagnostics-surface-audit
mvp80-diagnostics-hidden-engineering-terms
```

效果：

- 诊断页仍以“日常诊断”开头。
- 工程历史、verifier、IPC、Contract、Scanner 继续默认折叠。
- 增加一组表层审查卡片，给后续 AI 维护时确认主界面是否继续日常化。

## 安全边界

MVP-80 不接任何新真实能力。它只调整可见层级、文案、默认折叠和验证文档。
