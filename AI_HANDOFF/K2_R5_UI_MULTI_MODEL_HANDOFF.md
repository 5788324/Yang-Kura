# K2-R5 UI Multi-Model Handoff

更新日期：2026-09-23  
状态：**DESIGN DECISION LOCKED — K2-R5.2 READY**

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

## 已完成的多模型阶段

- Claude Sonnet 5 proposal：已回收；
- Kimi K3 proposal：已回收；
- Gemini 角色：由 GPT-6 代替完成 cross-model QA；
- GPT-6 Design Decision：已锁定；
- Theme Delta Matrix：已锁定；
- Android Mapping：已锁定。

正式设计真源：

- `docs/ui-lab/k2-r5/03_GPT6_CROSS_REVIEW.md`
- `docs/ui-lab/k2-r5/04_GPT6_DESIGN_DECISION.md`
- `docs/ui-lab/k2-r5/05_THEME_DELTA_MATRIX.md`
- `docs/ui-lab/k2-r5/06_ANDROID_MAPPING.md`

## 下一动作

直接进入 **K2-R5.2 Shared UI + Home / Music / ASMR 实现**。

Claude / Kimi 暂停调用，保留额度用于 Windows 截图阶段的最终视觉审查。

## Reference-driven UI route

2026-09-26 起，K2-R5 不再以 AI 从零设计为主。

正式参考：

- Desktop Music hierarchy：YesPlayMusic；
- Desktop Player / Lyrics：SPlayer-Next（reference only, AGPL）；
- Desktop large-library architecture：Feishin（reference only, GPL）；
- Studio management：fooyin（reference only, GPL）；
- Android Scaffold/Player：Resonate（MIT code candidate）；
- Android multi-source/adaptive：Aurora（Apache-2.0 code candidate）。

必读：

- `docs/ui-lab/k2-r5/07_REFERENCE_UI_AUDIT.md`
- `docs/ui-lab/k2-r5/08_REFERENCE_MAP.md`

下一步不是继续画概念图，而是做第一版 reference-derived Desktop sample。

## First reference-derived sample

已实现第一批真实页面样板：

- Music Library；
- Album/Artist/Folder Detail visual layer；
- PlayerBar。

样板 marker：

- `data-k2-reference-sample="music-library-v1"`
- `data-k2-reference-player="v1"`

下一门禁：

1. Windows CI；
2. 1440×900 / 1024×720 screenshot；
3. 视觉方向通过后再迁移 ASMR 和 Shared UI。

### Sample CI result

`fd1de72a9976c077988cb7baa595cf841a586447` Windows Branch Validation **PASS**。

因此第一版 reference-derived Music/Detail/Player 样板已经具备截图验收资格。

在视觉截图未审查前：

- 不批量迁移 ASMR；
- 不继续大范围 Shared UI 风格替换；
- 不声明最终视觉完成。

## Automated screenshot gate

K2-R5 reference sample 已接入现有 U30 Electron/CDP 自动化。

Artifact：
`k2-r5-reference-screenshots-<SHA>`

审图前仍禁止把 Music 样板批量扩散到 ASMR。

## Visual review result

v1 screenshots 已真实下载并审查：**VISUAL NO-GO / FUNCTIONAL PASS**。

不要基于 v1 扩散 ASMR。

当前正在验证 v2：
- light-first Mist Ivory；
- narrower/flat Sidebar；
- fewer/larger album columns；
- metadata retreat；
- quieter TopBar/player chrome。
