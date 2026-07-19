# Yang-Kura

> 当前公开版本：`0.169.0-beta.2`  
> 下一版本目标：`0.170.0-beta.3`  
> 正式稳定版目标：`1.0.0`  
> 当前阶段：Beta 3 R6 点击加固与剩余发布门禁  
> 发布结论：`PARTIAL / NO-GO`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；索引采用 Local JSON Index。

## 当前事实

- Beta 2 已发布并完成远端资产校验。
- PR #91 仍为 Draft，不得提前合并或发布。
- PR 当前远端 HEAD 为 `84e3caabec37a8de3843a51068b15bce76385524`，该 SHA 的 9 条 GitHub Actions 工作流全部 PASS。
- R5 Windows fresh clone 在该 SHA 上完成实机复测，并额外把 `TrackRow` 主按钮改为直接 `onClick`；这项点击加固尚未进入远端，属于本 R6 源码包。
- `E:\arsm` 实机读取为 137 个作品或专辑、6979 条音轨；RJ00331318 有 14 条可播放音轨和 14 条字幕音轨。
- HTMLAudio duration/progress、暂停/恢复、Seek、第二音轨切换、上一首/下一首、音量/静音和同 Profile 重启续播均 PASS。
- 音频 8086、字幕 11149、封面 4895、专辑目录 267，测试前后均未减少；无删除、异常移动或重命名。
- B3-MAJ-001～003 已由 R5 实机关闭；B3-MAJ-004 已通过自动化封面映射验证，但仍缺多个真实专辑的定向视觉核对。
- Beta 3 合并前还需完成：R6 单一提交与 CI、真实多专辑封面核对、真实小样本导入事务/冲突/失败回滚/OperationLog。
- ChatGPT 只读拉取 GitHub并交付完整源码包；Codex / DeepSeek 负责单一提交和推送，Codex 只负责 Windows 实机门禁。

## 当前产品能力

- 本地目录选择、扫描、Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ 与普通音乐双资源库、搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## 当前 Beta 3 门禁

| 编号 | 当前状态 | 证据 / 下一步 |
|---|---|---|
| B3-MAJ-001 | PASS | 第一条 duration=3:12、第二条 duration=14:43，progress、暂停/恢复和 Seek 正常 |
| B3-MAJ-002 | PASS | 默认 HTMLAudio，无 `spawn mpv.exe ENOENT` 或播放错误 |
| B3-MAJ-003 | PASS | 同 Profile 重启后自动读库，首页继续播放并从约 3:00 续播 |
| B3-MAJ-004 | PARTIAL | 自动化独立封面映射 PASS；仍需真实库多专辑视觉核对 |
| R6 固定 SHA | 待完成 | 直接 `onClick` 点击加固需提交、推送并通过 CI |
| 导入事务 | 待完成 | 使用临时小样本验证 copy/move、冲突、失败回滚和 OperationLog |

R5 已证明播放、重启和资源保护链路可用，但本地 TrackRow 点击加固尚未进入远端，封面与导入事务门禁也未全部完成，因此 PR 继续保持 `PARTIAL / NO-GO`。

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
→ Codex / DeepSeek 按批准流程合并和发布
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
