# Yang-Kura 工作日志

> 只记录当前有效事实。代码与合并事实以 GitHub 为准，候选验收以最新有效 Codex 报告为准。

## 2026-07-16～2026-07-17

- U34～U37：架构、Design System、IPC 分域和正式媒体库页面完成。
- Beta 2：`v0.169.0-beta.2`，Release ID `355486824`，portable、setup 和 SHA256SUMS 远端一致。
- U38：Queue、History、Persistence、HTMLAudio/mpv Backend 和 Subtitle lifecycle 分离。
- U39：日常体验、授权持久化、架构门禁和完整 Windows/打包验收。

## 2026-07-18

### U40-A～U40-D3

- 快速维护规则、全产品旅程、UI 收口、真实库读取与分组、独立 Profile、单实例、主题、歌单、导入页和 HTMLAudio 停滞状态完成。
- Issue #66 关闭。

### Git Fast Lane v2

- 一个任务一个分支和 PR。
- 普通维护按 L0～L2，正式发布按 L3。
- 用户不承担 Git、构建、测试或发布。

### Beta 3 正式日用发布收口 — 进行中

- PR #91 建立，目标版本 `0.170.0-beta.3`。
- 发布计划、Release Notes、构建/安装/发布工作流和远端资产验证脚本已加入候选分支。
- Beta 2 保持冻结；Beta 3 只允许合入 main 后创建 prerelease。
- 发布收口被 B3-MAJ-001 阻断。

### B3-MAJ-001

- 首次 Codex：合法 WAV 已索引，但点击后播放器无当前音轨，队列为 0；`PARTIAL / NO-GO`。
- 第二次 Codex：正确基线再次复现两个详情页入口均无播放器状态；`FAIL / NO-GO`。
- 远端随后加入 TrackRow、播放器后端和真实鼠标 E2E 尝试，但不能以 CI 通过替代 Windows 复测。
- v1 本地包修改旧 `AsmrDetail.tsx`，生产路由不使用该文件；作废。
- v2 本地包正确定位生产链；lint、Renderer 和 Electron build 通过，但 E2E 在 `RJ detail action backend duration` 超时；Codex 恢复临时改动，无提交、无推送；作废。
- v3 本地包只在对话中生成，没有执行、没有验证、没有推送；明确废弃，不进入 Git。

### 用户确认 1.0 最终路线

```text
完成 Beta 3
→ 全面审查 UI、功能和所有按钮的全功能链路
→ 自动化修复与回归
→ Codex Windows 实机全量验收
→ 清理无用文件和历史遗留
→ 发布正式 1.0.0
→ 后续只维护 Bug、UI 和明确的小功能
```

- 1.0 前不得因为 Beta 3 发布成功就跳过全产品审查。
- 全产品审查必须覆盖生产路由、页面、菜单、按钮、快捷键、播放器、资源库、Index、导入、元数据、设置、安装器和数据保留。
- 每个按钮检查 UI → Hook/Service → IPC/Main → 后端/文件系统 → 成功反馈、失败提示与恢复链。
- 自动化通过后，ChatGPT 生成固定 branch/SHA 的 Codex 提示词，由用户转发；用户不亲自测试。
- Codex 无 Blocker/Major 且必要项全部 PASS 后，才允许清理项目并发布 1.0.0。
- 1.0 后默认进入维护模式，不主动规划大版本；大型功能仅在用户明确需要时单独立项。

### Git Fast Lane v2.1

```text
锁定并拉取源码一次
→ 本地集中完成分析、开发、批量修改、自动测试和文档
→ 审查完整 diff
→ 1～2 个逻辑提交
→ 统一推送一次
→ 一次必要 CI
→ 需要实机时输出 Codex 提示词
→ Codex 固定 SHA 验收
→ ChatGPT 合并和发布
```

- 候选稳定前不逐文件远程提交、不边改边推、不反复触发 CI。
- 多文件任务必须批量提交。
- 通常一次推送；真实 CI 失败最多追加一次修复推送。
- 文档与代码在同一轮最终推送前同步。
- 用户只转发 Codex 提示词，不承担 Git、构建、测试或排错。

### 第一轮：B3-MAJ-001 诊断增强

- 起始 HEAD：`7f088a077afb8f172511f291309c461db6fe8a56`。
- 标准 `git clone` 因当前执行环境无法解析 `github.com` 失败；未改用逐文件提交。
- 使用 GitHub 连接器按固定 SHA 读取源码，在单一工作区准备完整候选，最终使用单一 tree/commit 统一推送。
- 审计确认现有 E2E 在第二条行尾按钮后只等待 duration，超时时未保存完整 PlayerState、HTMLAudio、mpv、IPC 和 Electron 证据。
- 新增独立预加载诊断探针，不修改播放器业务逻辑，也不更改原 E2E 的通过条件。
- 探针输出 `diagnostic-probe.json`，记录状态时间线、HTMLAudio 事件、mpv/IPC、Renderer 和 Electron 输出。
- 修正 `verify-handoff.mjs`：旧校验仍要求上轮路线文案，导致文档提交的 Documentation Validation 失败；新规则核对 Beta 3 → 1.0 路线和 Git Fast Lane v2.1。
- 本轮提交后等待 Windows Player Fast Validation 证据，再决定最小修复。

## 当前结论

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
正式稳定版目标：1.0.0
当前任务：第一轮诊断增强，等待 Windows E2E 证据
PR #91：草稿、禁止合并
Beta 3 Release：尚未创建
大型功能：长期冻结，只有明确需求后启动
Git：集中修改、单一提交、统一推送
```
