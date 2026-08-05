# 新对话启动提示词

请接手 `5788324/Yang-Kura`，依次读取：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/WORKLOG.md`
5. `docs/GIT_FAST_LANE_V2.md`
6. `docs/U41D_LEGACY_CLEANUP.md`
7. `docs/U41E_RC_FINAL_ACCEPTANCE.md`
8. `docs/RELEASE_NOTES_1.0.0-rc.1.md`

固定事实：

```text
main: 18ada58b76a3aa0828506d2d02c57ecd22fbc587
public version: 0.170.0-beta.3
local candidate: 1.0.0-rc.1
scope: U41-D + Git Fast Lane v2.3 + U41-E
remote U41-D/U41-E PR: no reliable evidence
RC tag/release: NOT CREATED
```

发布参数：

```text
parent: 18ada58b76a3aa0828506d2d02c57ecd22fbc587
branch: release/u41e-rc1-candidate
commit: release: prepare Yang-Kura 1.0.0-rc.1
push: exactly once
PR: Draft
```

必须遵守 Git Fast Lane v2.3：禁止使用 GitHub Contents API 或 Git Data API 发布多文件源码；真实 clone/native Git 失败最多同路径重试一次，随后立即交给 Codex，不再绕路。

下一步：审核 Codex 返回的远端 SHA、完整 diff、9 条现行 workflow、U41-E Windows RC 证据与实机报告。在所有证据出现前不得宣称 RC 已发布。
