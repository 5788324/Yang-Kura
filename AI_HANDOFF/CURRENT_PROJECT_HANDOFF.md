# Yang-Kura 当前项目交接

## 当前事实

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
版本：0.169.0-beta.2
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
索引：Local JSON Index
Beta 2：已发布，Release ID 355486824
U34～U40-D：完成
Issue #66：已关闭
当前任务：按需日常维护
```

必须从最新 `origin/main` 接手。状态见 `PROJECT_STATE.md`，路线见 `PROJECT_ROADMAP.md`，日志见 `AI_HANDOFF/WORKLOG.md`。

## U40-D 运行时边界

- 日常设置：`src/components/SettingsPageDaily.tsx`。
- AI 维护：`src/components/DiagnosticsPageShell.tsx`；旧 `DiagnosticsPage.tsx` 不再加载。
- 读取协调：`src/services/libraryReadCoordinatorService.ts`。
- 跨页面会话：`src/services/librarySessionService.ts`。
- 旧版集合修复：`src/services/libraryIndexNormalizationService.ts`。
- 自动化污染清理：`src/services/automationProfileCleanupService.ts`。
- 队列有效性：`src/player/playerRuntimePolicy.ts`。
- 历史有效性：`src/services/playbackHistoryService.ts`。
- 自动验收 profile 标记：`electron/preload.ts`。

旧 `SettingsPage.tsx` 和 `DiagnosticsPage.tsx` 只保留历史追溯，不得重新接回生产路由。

## 已修复缺陷

- U40-B01：读取不再永久 pending；15 秒超时、失败、重试和中断恢复明确。
- U40-B02：设置、顶栏、首页、音声库和音乐库使用同一读取状态。
- U40-B03：测试 profile 隔离；日常启动清理旧 U29 等测试数据；当前资源库约束队列和历史。
- U40-M01：旧版一级目录大集合按 RJ 或实际作品/专辑目录重新分组；空集合移除。
- U40-M02：日常设置不再显示工程实现术语；历史完整诊断退出运行时。
- U40-O01：mpv 缺失作为环境 Observation；HTMLAudio 回退保持可用。

## 验证事实

```text
候选提交：189c5a65cb024838cb288874e7c78f8e07b0671c
U40-D Run：29628604275
Artifact：8424721819
Digest：sha256:d577eed18e51ce8686149e6ac04c1eb9f6341e30b72d9462c3960ed93d244f37
相对导入循环：0
```

最终候选的 Documentation、Architecture、UI Fast、U40-C、U40-D、Branch Validation 和 U32 Packaging 全部通过。Branch Validation 内 U28～U32、当前行为 verifier、stable regression 和最终 production build 全部通过。

## Codex 真实库验收

文档：`docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

真实库只读。导入、Index 写入、备份恢复和回滚只在 `%TEMP%\YangKura-U40D-RealAcceptance` 临时副本执行。当前自动化未访问用户真实目录，也未替代这一步实机验收。

## 后续规则

- 不预排 U40-E 或连续结构治理。
- 只由真实 Bug、明确体验问题或小型功能触发新任务。
- 一个任务一个 PR；必要文档和交接同一 PR 收口。
- 新功能不得写回旧巨型设置/诊断页面。
- Architecture Guardrails 继续禁止新增显式 `any`、Renderer 裸 IPC、跨层实现导入和相对导入循环。

## 冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、账号和插件市场保持冻结。

<!-- 历史验证锚点：U39-G：最终综合验收完成；不再存在预排的下一轮 U39。 -->
