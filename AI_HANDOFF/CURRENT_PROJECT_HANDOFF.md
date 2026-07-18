# Yang-Kura 当前项目交接

## 当前事实

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
公开版本：0.169.0-beta.2
下一版本：0.170.0-beta.3
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
索引：Local JSON Index
Beta 2：已发布，Release ID 355486824
U34～U40-D3：完成
Issue #66：已关闭
Git Fast Lane v2：已生效
当前任务：Beta 3 播放阻断最终实机复测
```

必须从最新 `origin/main` 或任务明确指定的 PR 分支接手。状态见 `PROJECT_STATE.md`，路线见 `PROJECT_ROADMAP.md`，日志见 `AI_HANDOFF/WORKLOG.md`，Git 规则见 `docs/GIT_FAST_LANE_V2.md`，U40-D 系列证据见 `docs/U40D_FINAL_EVIDENCE.md`。

## 当前运行时边界

- 日常设置：`src/components/SettingsPageDaily.tsx`。
- AI 维护：`src/components/DiagnosticsPageShell.tsx`；旧 `DiagnosticsPage.tsx` 不再加载。
- 读取协调：`src/services/libraryReadCoordinatorService.ts`。
- 跨页面会话：`src/services/librarySessionService.ts`。
- 旧版集合修复：`src/services/libraryIndexNormalizationService.ts`。
- 自动化污染清理：`src/services/automationProfileCleanupService.ts`。
- 队列有效性：`src/player/playerRuntimePolicy.ts`。
- 历史有效性：`src/services/playbackHistoryService.ts`。
- 播放后端：`src/hooks/usePlayerBackend.ts`。
- 详情页行级播放入口：`src/shared/ui/TrackRow.tsx`、`src/features/library/RjDetailPage.tsx`。
- 自动验收 profile 标记：`electron/preload.ts`。

旧 `SettingsPage.tsx` 和 `DiagnosticsPage.tsx` 只保留历史追溯，不得重新接回生产路由。

## U40-D～U40-D3 收口

- U40-B01：读取不再永久 pending；15 秒超时、失败、重试、迟到结果和中断恢复明确。
- U40-B02：设置、顶栏、首页、音声库和音乐库使用同一读取状态。
- U40-B03：测试 profile 隔离；当前资源库约束队列和历史。
- U40-M01：旧版一级目录大集合按 RJ 或实际作品/专辑目录重新分组；空集合移除。
- U40-M02：日常设置、导入页和维护入口不再暴露旧工程页面。
- U40-D2：显式 `YANG_KURA_USER_DATA_ROOT`、单实例、歌单 `$0`、主题同步和导入页工程术语已修复并实测。
- U40-D3：HTMLAudio 元数据读取和启动各有 10 秒超时；失败后清除伪播放状态，并引导到“设置 → 播放方式”选择 mpv。

## Beta 3 播放阻断当前结论

两次 Codex 专项报告均为有效基线，均证明 `B3-MAJ-001` 在当时候选上仍为 `FAIL / NO-GO`。第二次报告使用合法 38.009 秒 WAV，扫描与作品命名通过，但详情页主区域和行尾播放按钮均没有进入播放器。

当前 PR #91 已完成两层修复：

1. TrackRow 捕获阶段统一处理主区域和行尾播放按钮，避免可见点击未进入 `onPlayTrack`；
2. HTMLAudio `loadedmetadata` 早于模式切换时仍按当前 track ID 写回真实时长，且 fallback 完成后再次兜底同步当前音轨和队列时长。

专项自动化使用真实 CDP 鼠标事件和 `durationSeconds = 0` 的 WAV，验证两个入口都进入 `html-audio`、队列为 2，并分别回填 8 秒和 9 秒。页面错误和控制台错误均为 0。

```text
行级入口修复：94d5ca0a07f84e060997214ef58e574b3355b2de
HTMLAudio 时长竞态修复：1655bcce63fffefa13dbd162693b2425173d9345
最终代码候选：b5327d68d69966fb4e4358cf667aac1aba6270ba
Player Fast Validation：29640816385 PASS
Beta 3 Windows 候选构建：29640816414 PASS
```

PR #91 仍保持开放，Release 未创建。下一步只允许 Codex 在最新分支上复测 B3-MAJ-001；A 通过后才继续临时副本事务和真实音乐目录只读链。

## 当前提交事实

```text
U40-D 合并提交：5daa0102b1114b6213d3240aa7cb4e66285ca7ab
U40-D2 合并提交：b13a9149d1fcaf4ee409326c0fc4e219806aad88
U40-D3 合并提交：03a3b75f95974b3370e12cb34dde20a4429e17fb
Beta 3 播放入口修复：94d5ca0a07f84e060997214ef58e574b3355b2de
Beta 3 时长竞态修复：1655bcce63fffefa13dbd162693b2425173d9345
Beta 3 最终代码候选：b5327d68d69966fb4e4358cf667aac1aba6270ba
相对导入循环：0
```

## Codex 真实库实测结论

已实测 `E:\arsm`：75 个集合、3540 条轨道；日常 profile 不受影响；三主题、歌单、导入页语言、单实例、三次重启、进程回收、mpv 真实播放、Seek 和 33 行歌词均有证据。HTMLAudio 不支持编码时由 U40-D3 在 10 秒内明确失败，不再伪播放。

Beta 3 当前剩余实机范围：

1. 最新候选上的 B3-MAJ-001 双播放入口、真实时长、进度、暂停/继续、Seek、队列和重启；
2. A 通过后，`%TEMP%\YangKura-Beta3-Acceptance` 临时副本中的 Index 写入/备份恢复、copy-only、move-only、冲突、失败回滚和 OperationLog；
3. `D:\CloudMusic\VipSongsDownload` 真实音乐库只读链，禁止在真实目录生成 Index。

## Git Fast Lane v2

完整规则：`docs/GIT_FAST_LANE_V2.md`。

- 一个任务一个分支、一个 PR。
- 通常一次推送，真实 CI 失败最多再修一次。
- 通常一个提交；规则准备与产品发布合并任务最多两个提交。
- 多文件改动使用批量 tree/commit，不逐文件制造提交。
- 禁止一次性补丁工作流和临时自动提交工作流。
- CI 只检查启动、最终结果和合并/发布结果。
- L0 文档、L1 UI、L2 播放/资源库/导入、L3 Main/安装器/正式发布按风险分级。
- Beta 3 属于 L3，只执行一次完整 Windows 打包、安装升级卸载和远端资产回读。

## Codex 报告有效性规则

- 开头记录 fetch 后的分支、`HEAD`、远端分支和任务指定提交。
- 任务提交不在历史中只能报告 `BASELINE_INVALID`。
- 必须使用任务文档规定入口，不能以“等价入口”代替。
- `NOT TESTED` 必须保留，不得推断。
- Codex 只做真实目录、物理设备、第三方程序和安装器差异；自动化能完成的内容不重复执行。

## Beta 3 发布边界

- 目标版本：`0.170.0-beta.3`。
- PR 候选构建 portable/NSIS 并完成安装验收，但不发布。
- 合入 `main` 后才创建 `v0.170.0-beta.3` prerelease。
- 发布资产：portable、NSIS setup、`SHA256SUMS.txt`。
- 发布后必须回读目标提交、资产名称、大小和 SHA-256。
- Beta 2 发布记录保持冻结，不覆盖、不删除。
- 不解冻下载器、SQLite、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录、云同步、账号或插件市场。

## GPT/AI 项目记忆

后续对话默认记住并执行：用户不参与 Git、测试、构建和发布；ChatGPT 自主管理；Git Fast Lane v2 优先；当前唯一主线为 Beta 3 播放阻断最终实机复测；不得扩展为新功能或连续治理轮次。

<!-- 历史验证锚点：U39-G：最终综合验收完成。 -->
