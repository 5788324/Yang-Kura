# K2-R5 UI Multi-Model Handoff

更新日期：2026-09-23  
状态：**ACTIVE — DESIGN EXPLORATION**

## 当前主线

- K2-R2：Catalog foundation complete；
- K2-R3：backend complete，真实 E:\\arsm 门禁待 K2-R9；
- K2-R4：functional complete，Windows CI PASS，真实库门禁待 K2-R9；
- K2-R5：ACTIVE；
- K2-R5.1 Midnight Glass App Shell 已完成并通过 Windows CI。

## 当前任务

不是继续无脑写页面，而是先通过有限额度的多模型并行把 Kura UI 视觉体系锁定。

当前可用：

- GPT-6：主集成与实现；
- Claude Sonnet 5：视觉总监；
- Kimi K3：独立设计系统；
- Gemini 3.8 Flash：批量 QA。

正式工作流见：

- `docs/K2_R5_MULTI_MODEL_UI_WORKFLOW.md`
- `docs/K2_R5_MODEL_PROMPTS.md`

## 三主题固定研究对象

1. Midnight Glass
2. Studio Graphite
3. Aurora Dream

必须是 Design Modes，不允许只换色。

## Android 边界

Android **只做 UI/Design System/Compose mapping**。

当前仍禁止：

- 建 Android 工程；
- 正式 fork APlayer；
- 写完整 Android 业务；
- 与 Desktop 争夺主开发资源。

## 外部模型输出

统一目标路径：

```text
docs/ui-lab/k2-r5/
01_CLAUDE_DESIGN_PROPOSAL.md
02_KIMI_DESIGN_PROPOSAL.md
03_GEMINI_REVIEW.md
04_GPT6_DESIGN_DECISION.md
05_THEME_DELTA_MATRIX.md
06_ANDROID_MAPPING.md
```

如果输出暂时只存在聊天，必须回传给 GPT-6 入库后才算已交接。

## 下一动作

1. 用户把 Claude Prompt 发给 Claude；
2. 用户把 Kimi Prompt 发给 Kimi；
3. 两份输出回传；
4. Gemini 做交叉 QA；
5. GPT-6 形成唯一 Design Decision；
6. 再继续 K2-R5.2 代码实现。

不要在 Claude/Kimi 输出回来前让多个模型各自修改 main。
