# Yang-Kura

> 当前公开版本：`0.169.0-beta.2`  
> 下一版本目标：`0.170.0-beta.3`  
> 正式稳定版目标：`1.0.0`  
> 当前阶段：Beta 3 真实库阻断合并修复  
> 发布结论：`NO-GO`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；索引采用 Local JSON Index。

## 当前事实

- Beta 2 已发布并完成远端资产校验。
- PR #91 仍为 Draft，不得提前合并或发布。
- 本轮固定起点为 `1f839e5298d96a61ceaf8e4621b17244c0f8946a`。
- 正式 Windows 真实库扫描已通过：`E:\arsm` 显示 137 个作品或专辑、7145 条音轨。
- 详情页、Queue、上一首/下一首、字幕和全屏歌词已通过。
- 当前阻断为真实音频 duration/progress、mpv 缺失回退、同 Profile 重启黑屏和重复专辑封面。
- 用户允许程序扫描真实库并更新 `library-index.json` 与 backup；只禁止删除或破坏音频、字幕、封面和专辑目录。
- 本轮采用单一合并修复、单一提交、统一推送；CI 通过后再做固定 SHA Windows 实机复测。

## 当前产品能力

- 本地目录选择、扫描、Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ 与普通音乐双资源库、搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## 当前 Beta 3 阻断

| 编号 | 阻断 |
|---|---|
| B3-MAJ-001 | HTMLAudio 真实 WAV duration 为 0、progress 不推进 |
| B3-MAJ-002 | 未安装 mpv 时出现 `spawn mpv.exe ENOENT` |
| B3-MAJ-003 | 同一 Profile 重启后首页黑屏 |
| B3-MAJ-004 | 大库拆分后的多个专辑复用同一封面 |

本轮候选修复包含本地媒体 Range/MIME 流式响应、mpv 可选后端、大 Index 启动恢复、按实际 RJ 目录独立选择封面，以及对应自动验证。自动门禁和固定 SHA 实机复测全部通过前，PR 保持 `NO-GO`。

## 已确认的项目终局

```text
完成 Beta 3
→ 全面审查项目 UI、功能和所有按钮的完整链路
→ 自动化修复与回归
→ Codex Windows 实机全量验收
→ 清理无用文件和历史遗留
→ 正式发布 1.0.0
→ 进入 Bug、UI 和小功能维护模式
```

1.0 前的全项目审查必须建立生产入口清单，并逐项核对：

```text
UI / 按钮
→ Renderer
→ Hook / Store / Service
→ IPC / Electron Main
→ 文件系统、Index、播放器或外部程序
→ 成功状态
→ 失败提示、取消、回滚、重试和恢复
```

自动化通过后，由 ChatGPT 生成固定 branch/SHA 的 Codex 提示词，用户只负责转发。Codex 在真实 Windows、GUI、声卡、本地媒体和文件系统上验收；无 Blocker/Major 且必要项全部 PASS 后，才清理项目并发布 `1.0.0`。

## Git 工作方式

```text
锁定远端基线并拉取一次
→ 本地集中完成分析、开发、批量修改、测试和文档
→ 1～2 个逻辑提交
→ 统一推送一次
→ 一次必要 CI
→ 需要实机时输出 Codex 提示词
→ Codex 固定 SHA 验收
→ ChatGPT 合并和发布
```

禁止逐文件远程提交、边改边推、重复触发 CI 和临时补丁工作流。真实 CI 失败时最多追加一次修复推送。

## 1.0 后维护范围

默认只处理：

- 真实 Bug；
- UI 和交互优化；
- 明确的小功能；
- 修改链路内必要的技术债。

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号和插件市场继续冻结。只有用户明确提出实际需要后，才单独评估和立项。

## 文档入口

- `PROJECT_STATE.md`
- `PROJECT_ROADMAP.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- `AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md`
- `AI_HANDOFF/WORKLOG.md`
- `docs/BETA3_BLOCKER_STATUS.md`
- `docs/GIT_FAST_LANE_V2.md`
