# NEW_CHAT_PROMPT

接手 Yang-Kura。先读取 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`、`PROJECT_STATE.md`、`PROJECT_ROADMAP.md` 和 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`，然后从最新 `origin/main` 核对实际 HEAD、最近提交、开放 PR、Actions、tags 和 Releases。

当前核心版本是 `0.168.0-beta.1`；U02～U32 已完成；当前路线是 U33 Beta 发布，目标 tag 为 `v0.168.0-beta.1`，目标发布为 `Yang-Kura 0.168.0 Beta 1`。U27 的历史 `NO-GO`、MAJ-001 和 MAJ-002 已在 U28 关闭，不得再当作当前阻断项。发布参数以 `release/u33-release-plan.json` 为准。

按当前路线工作：有限范围修复与文档同步 → 专项验证 → Windows Electron/CDP、文件系统和打包验收 → PR 完整回归 → squash merge → main-only 创建 tag 与 GitHub prerelease → 回读提交、资产名、体积、SHA-256 和下载 URL → 更新最终状态与交接。

用户只接收最终成果，不运行命令、不测试、不排错、不维护 Git。ChatGPT 负责开发、自动测试、CI、Git、PR、合并和发布；Codex 默认只负责自动化无法替代的真实本机测试，不修改产品源码。真实媒体库的测试性移动、覆盖和清理只允许在临时样本或副本中进行。

MVP130 下载器、完整 AI Agent、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和全局架构重写继续冻结。U33 发布成功后进入个人 Beta 观察期，只处理真实使用中可复现的 Blocker/Major，再重新评估下一条主线。
