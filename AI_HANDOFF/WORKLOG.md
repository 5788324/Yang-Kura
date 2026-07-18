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

### Beta 3 发布准备

- PR #91 建立，目标版本 `0.170.0-beta.3`。
- 发布计划、Release Notes、构建/安装/发布工作流和远端资产验证脚本已加入候选分支。
- Beta 2 保持冻结；Beta 3 只允许合入 main 后创建 prerelease。

### B3-MAJ-001

- 首次 Codex：合法 WAV 已索引，但点击后播放器无当前音轨，队列为 0；`PARTIAL / NO-GO`。
- 第二次 Codex：正确基线再次复现两个详情页入口均无播放器状态；`FAIL / NO-GO`。
- 远端随后加入 TrackRow、播放器后端和真实鼠标 E2E 尝试，但不能以 CI 通过替代 Windows 复测。
- v1 本地包修改旧 `AsmrDetail.tsx`，生产路由不使用该文件；作废。
- v2 本地包正确定位生产链；lint、Renderer 和 Electron build 通过，但 E2E 在 `RJ detail action backend duration` 超时；Codex 恢复临时改动，无提交、无推送；作废。
- v3 本地包只在对话中生成，没有执行、没有验证、没有推送；本次交接明确废弃，不进入 Git。

### 对话结束交接

- 用户要求暂停开发。
- 当前没有有效 Bug 修复，发布结论继续为 `NO-GO`。
- PR #91 转为草稿阻断状态。
- 清理文档中“已修复”“最终候选已通过”等不再成立的表述。
- 更新 README、PROJECT_STATE、PROJECT_ROADMAP、CURRENT_PROJECT_HANDOFF、WORKLOG，并新增新对话提示词和阻断状态文档。
- 本次 Git 变更仅为文档交接，不代表产品代码进展。

## 当前结论

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
交接前产品代码基线：69fe73b794d467d619ffbcfa5d794c0af23359f7
当前任务：开发暂停，新对话重新诊断 B3-MAJ-001
PR #91：草稿、禁止合并
Beta 3 Release：尚未创建
大型功能：长期冻结
```
