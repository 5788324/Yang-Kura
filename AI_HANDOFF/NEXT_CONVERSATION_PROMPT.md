# 新对话启动提示词

请接手 GitHub 仓库 `5788324/Yang-Kura`。

先读取并以这些文件为当前项目真源：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/WORKLOG.md`
5. `docs/BETA3_BLOCKER_STATUS.md`
6. `docs/GIT_FAST_LANE_V2.md`

## 当前事实

- 公开版本是 `0.169.0-beta.2`。
- Beta 3 目标是 `0.170.0-beta.3`。
- 正式稳定版目标是 `1.0.0`。
- PR #91 使用分支 `release/beta3-daily-closeout`，当前处于草稿阻断状态。
- 交接前产品代码 HEAD 是 `69fe73b794d467d619ffbcfa5d794c0af23359f7`；开始时先 fetch 并锁定 PR 最新 branch/SHA。
- Beta 3 未发布，禁止提前合并或创建 Release。
- 最新有效 Codex v2 报告为 `FAIL / NO-GO`：生产路由、lint、Renderer 和 Electron build 通过，但真实鼠标 E2E 在 `Timed out waiting for player: RJ detail action backend duration` 失败。
- GUI、重启恢复和导入事务均为 `NOT TESTED`。
- v1、v2、v3 本地压缩包全部不是有效基线；不要应用或继续叠加。
- 当前远端分支含未通过实机验收的播放器尝试代码，必须先审计，不能默认正确。
- `package.json` 和 `package-lock.json` 的 Beta 3 版本一致性仍需在发布前修复。

## 第一阶段：完成 Beta 3

不要直接继续猜 Bug。按以下顺序执行：

1. 比较 `0cc9779ea651723a2cae0d6c46486d7951156d71` 到 PR 最新 HEAD 的 `usePlayerBackend.ts`、`TrackRow.tsx`、Beta 3 E2E 和 player-fast workflow。
2. 重新审查 v2 报告，补齐第二条音轨点击后的 PlayerState、HTMLAudio、mpv、IPC、renderer console 和 page error 证据。
3. 增强诊断后只制作一个证据驱动的最小修复候选。
4. 自动专项通过后，生成一份可直接转发给 Codex 的播放器实机验收提示词，固定 repository、branch 和 SHA。
5. 播放全部通过后，再执行临时导入事务和真实音乐目录只读核对。
6. 全部通过后同步 Beta 3 版本，运行一次最终 L3 CI，合并现有 PR #91 并发布 Beta 3。

## 第二阶段：1.0 全项目收口

Beta 3 发布后不要直接结束，也不要开始大型新功能。继续：

1. 建立所有生产路由、页面、详情页、弹窗、菜单、工具栏、列表按钮、播放器控件、设置项和快捷键清单。
2. 对每个入口核对完整链路：

```text
UI 入口
→ Renderer 事件
→ Hook / Store / Service
→ IPC / Electron Main
→ 文件系统、Index、播放器或外部程序
→ 成功状态
→ 错误提示、取消、回滚、重试和恢复
```

3. 全面审查 UI、功能和按钮是否存在死入口、无响应、重复调用、状态不同步、错误文案、缺失加载/空/失败状态或不可达旧组件。
4. 扩充自动化功能矩阵并修复问题，Blocker/Major 清零。
5. 生成一份固定 branch/SHA 的 Codex Windows 全量验收提示词，由用户转发；Codex 只测试，不自行开发。
6. Codex 必须在真实 Windows、GUI、声卡、本地媒体和文件系统上返回 PASS/FAIL/NOT TESTED、日志、截图、进程和安装卸载证据。
7. 实机通过后清理无用源码、脚本、工作流、过期报告、临时候选和构建遗留；删除前确认无生产、测试、构建或发布引用。
8. 完成最终 L3 发布链，正式发布 `1.0.0`，回读目标提交、资产名称、大小和 SHA-256。

## 1.0 后模式

正式版后默认只处理：

- Bug 修复；
- UI 与交互优化；
- 明确的小功能；
- 修改链路内必要的技术债。

不主动规划大型版本。下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录正式接入、云同步、账号和插件市场等大型功能，只有用户明确提出实际需要后才单独评估和立项。

## Git 工作流

严格执行集中式流程：

```text
锁定 branch/SHA 并拉取一次
→ 一次性读取相关源码和文档
→ 本地完成开发、批量修改、自动测试和文档
→ 审查完整 diff
→ 1～2 个逻辑提交
→ 统一推送一次
→ 一次必要 CI
→ 需要实机时输出 Codex 提示词
→ 用户转发，Codex 固定 SHA 验收
→ ChatGPT 处理报告、合并和发布
```

禁止逐文件远程提交、边改边推、反复触发 CI 和临时补丁工作流。真实 CI 失败时最多追加一次修复推送。

协作规则：用户不执行 Git、测试、构建或排错；ChatGPT 自主管理，Codex 只做必须依赖 Windows/GUI/真实媒体的验证。持续同步 README、PROJECT_STATE、PROJECT_ROADMAP、WORKLOG 和交接文档。