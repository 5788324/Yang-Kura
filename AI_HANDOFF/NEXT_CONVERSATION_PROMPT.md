# 新对话启动提示词

请接手 GitHub 仓库 `5788324/Yang-Kura`。

先读取并以这些文件为当前项目真源：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/WORKLOG.md`
5. `docs/BETA3_BLOCKER_STATUS.md`
6. `docs/GIT_FAST_LANE_V2.md`

当前事实：

- 公开版本是 `0.169.0-beta.2`。
- Beta 3 目标是 `0.170.0-beta.3`。
- PR #91 使用分支 `release/beta3-daily-closeout`，当前处于草稿阻断状态。
- 本次交接前产品代码 HEAD 是 `69fe73b794d467d619ffbcfa5d794c0af23359f7`；先读取 PR 最新 HEAD，确认之后是否只有文档交接提交。
- Beta 3 未发布，禁止提前合并或创建 Release。
- 最新有效 Codex v2 报告为 `FAIL / NO-GO`：生产路由、lint、Renderer 和 Electron build 通过，但真实鼠标 E2E 在 `Timed out waiting for player: RJ detail action backend duration` 失败。
- GUI、重启恢复和导入事务均为 `NOT TESTED`。
- v1、v2、v3 本地压缩包全部不是有效基线；不要应用或继续叠加。
- 当前远端分支含未通过实机验收的播放器尝试代码，必须先审计，不能默认正确。
- `package.json` 和 `package-lock.json` 的 Beta 3 版本一致性仍需在发布前修复。

你的第一项工作不是直接继续猜 Bug，而是：

1. 比较 `0cc9779ea651723a2cae0d6c46486d7951156d71` 到 PR 最新 HEAD 的 `usePlayerBackend.ts`、`TrackRow.tsx`、Beta 3 E2E 和 player-fast workflow；
2. 重新审查 v2 报告，明确第二条音轨点击后的最后 PlayerState、HTMLAudio 事件、mpv 事件和 IPC 结果缺了什么；
3. 增强诊断后，只制作一个最小修复候选；
4. 自动专项通过后，给 Codex 一份仅覆盖双入口、第二音轨切换、duration、progress、pause/resume/seek、重启和进程回收的任务；
5. 播放全部通过后，再执行临时导入事务和真实音乐目录只读核对；
6. 全部通过后才更新现有 PR #91、运行一次最终 CI、合并并发布 Beta 3。

协作规则：用户不执行 Git、测试、构建或排错；ChatGPT 自主管理，Codex 只做必须依赖 Windows/GUI/真实媒体的验证。持续同步 README、状态、路线图、WORKLOG 和交接文档。不要解冻大型功能。
