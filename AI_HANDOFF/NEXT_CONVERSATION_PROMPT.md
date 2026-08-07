# 新对话启动提示词

请接手 `5788324/Yang-Kura`，依次读取：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/WORKLOG.md`
5. `docs/GIT_FAST_LANE_V2.md`
6. `docs/U42_DAILY_UI_SIMPLIFICATION.md`
7. `docs/U41E_RC_FINAL_ACCEPTANCE.md`
8. `docs/RELEASE_NOTES_1.0.0-rc.1.md`
9. `docs/product-review/Yang-Kura_真实用户控件精简与功能缺口复审_2026-08-06_REV2.md`

固定事实：

```text
main: 72066aa78b2eaa32f0750b115770d6847e5d46c9
public version: 1.0.0-rc.1（GitHub Release + Prerelease）
local candidate: 1.0.0-rc.1
scope: U41-D + Git Fast Lane v2.3 + U41-E（已合并）
current candidate: U42 日常界面精简（Draft PR #94，未合并）
remote branch: product/u42-daily-ui-simplification
RC tag/release: v1.0.0-rc.1（已存在，未修改）
```

U42 发布参数：

```text
parent: 72066aa78b2eaa32f0750b115770d6847e5d46c9
branch: product/u42-daily-ui-simplification（已推送）
commit: ui: simplify daily controls and advanced actions（已推送）
Draft PR: #94（当前 Draft，等待 ChatGPT 第二轮源码与视觉审查）
push: exactly once（仅本轮修复提交 `fix: close U42 review and CI gaps` 允许一次额外推送）
```

历史任务（U41-E 时期）参考：`release: prepare Yang-Kura 1.0.0-rc.1`。

必须遵守 Git Fast Lane v2.3：禁止使用 GitHub Contents API 或 Git Data API 发布多文件源码；真实 clone/native Git 失败最多同路径重试一次，随后立即交给 Codex，不再绕路。

下一步：审核 U42 Draft PR #94 的修复提交、全部 GitHub workflow 回读、U40-B Windows artifact（含 U42 截图）与实机证据。在所有证据全绿前不得宣称 U42 已合并或已发布。
