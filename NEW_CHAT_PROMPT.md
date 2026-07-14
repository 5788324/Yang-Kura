# NEW_CHAT_PROMPT

接手 Yang-Kura。先读取 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`、`PROJECT_STATE.md` 和 `PROJECT_ROADMAP.md`，然后从最新 `origin/main` 核对实际 HEAD、最近提交、开放 PR 和远端分支。

当前核心版本是 `0.167.0-mvp129`；U02～U26 已完成；U27 真实资源库补测最终为 `NO-GO`，阻断项是 MAJ-001（目录授权、Index 和浏览状态断裂）与 MAJ-002（诊断页用 Demo 状态冒充真实状态）。当前路线是 U28 修复并复验“原生目录授权 → 真实 Index → 浏览作品 → 播放音轨”。

用户反馈该问题可能已经修复并推送到 Git，但交接时 GitHub `main` 未看到可验证的产品修复提交。第一步必须核对修复实际在 main、其他分支/PR，还是尚未存在；不要重复开发，也不要未经实机验证就宣布已修复。

严格按路线工作：独立分支 → 有限范围实现/验收 → U02～U28 verifier → `npm run verify:stable` → `npm run build` → Windows GUI 真实闭环 → PR → squash merge → 更新状态文档。真实 `E:\arsm` 只读验证，可写测试只使用临时样本。MVP130、完整 AI Agent、SQLite、远程资源库和 Player Core v2 继续冻结。