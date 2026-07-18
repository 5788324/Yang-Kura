# Yang-Kura

> 当前公开版本：`0.169.0-beta.2`  
> 下一版本目标：`0.170.0-beta.3`  
> 正式稳定版目标：`1.0.0`  
> 当前阶段：Beta 3 播放阻断诊断已暂停  
> 发布结论：`NO-GO`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；索引采用 Local JSON Index。

## 当前事实

- Beta 2 已发布并完成远端资产校验。
- PR #91 仍保留，但处于阻断草稿状态，不得合并或发布。
- 交接前产品代码基线为 `69fe73b794d467d619ffbcfa5d794c0af23359f7`。
- 最新有效 Codex v2 报告为 `FAIL / NO-GO`。
- lint、Renderer build、Electron build 和生产路由核对通过。
- 真实鼠标 E2E 在第二条音轨等待后端时长时失败：`Timed out waiting for player: RJ detail action backend duration`。
- Windows GUI、重启恢复和导入事务因此均为 `NOT TESTED`。
- v1、v2、v3 本地修复包均不是有效 Git 基线；后续从 PR #91 最新 HEAD 继续。

## 当前产品能力

- 本地目录选择、扫描、Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ 与普通音乐双资源库、搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## 当前唯一发布阻断

`B3-MAJ-001` 尚未修复。当前证据只能确认问题位于 RJ 详情页第二条本地音轨切换后的播放器后端装载或 duration 回传链，不能确认具体根因。

下一轮必须审查：

1. `RjDetailPage → TrackRow → useAudioPlayer → usePlayerBackend`；
2. HTMLAudio 连续换源后的 metadata 生命周期；
3. mpv `loadfile replace` 后的 duration 事件；
4. 当前 PR 分支相对 `0cc9779e...` 的未验证播放器改动应保留还是回退；
5. `package.json` / `package-lock.json` 的版本一致性。

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