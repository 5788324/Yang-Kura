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

必须从最新 `origin/main` 接手。状态见 `PROJECT_STATE.md`，路线见 `PROJECT_ROADMAP.md`，日志见 `AI_HANDOFF/WORKLOG.md`，U40-D 最终证据见 `docs/U40D_FINAL_EVIDENCE.md`。

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

- U40-B01：读取不再永久 pending；15 秒超时、失败、重试、迟到结果和中断恢复明确。
- U40-B02：设置、顶栏、首页、音声库和音乐库使用同一读取状态。
- U40-B03：测试 profile 隔离；日常启动清理旧 U29 等测试数据；当前资源库约束队列和历史。
- U40-M01：旧版一级目录大集合按 RJ 或实际作品/专辑目录重新分组；空集合移除。
- U40-M02：日常设置不再显示工程实现术语；历史完整诊断退出运行时。
- U40-O01：mpv 缺失作为环境 Observation；HTMLAudio 回退保持可用。

## 最终验证事实

```text
PR：#88
最终 PR head：565097c8fa54b5281b788798dd51266b46a81dd2
U40-D Run：29629121046
Artifact：8424882277
Artifact size：12406081 bytes
Digest：sha256:fbc7a3d487d0dd20efb0586ff5856f2ddb0431a6d2006301120e342b1ba2ff07
合并提交：5daa0102b1114b6213d3240aa7cb4e66285ca7ab
相对导入循环：0
```

最终 PR head 的 Documentation Validation、Architecture Guardrails、UI Fast Validation、U40-C UI Polish、U40-D Real Library Stability、Branch Validation 和 U32 Release Candidate Packaging 全部通过。Branch Validation 内 U28～U32、当前行为 verifier、stable regression 和最终 production build 全部通过。

## Codex 真实库验收

文档：`docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

真实库只读。导入、Index 写入、备份恢复和回滚只在 `%TEMP%\YangKura-U40D-RealAcceptance` 临时副本执行。自动化未访问用户真实目录，也未替代这一步实机验收。

## 强制效率规则

以下规则优先于历史流程、旧 verifier 和“所有灯都绿”的惯性做法：

1. **先锁定基线再工作**：任何 Codex、GUI、CI 或实机验收开始前必须执行 `git fetch origin`，并确认 `branch = main`、`HEAD = origin/main = 任务指定提交`。任一不符立即停止，不得在旧提交上继续测试。
2. **按风险验证**：普通 UI、Renderer、Hook、状态和文档改动只运行 TypeScript、production build、相关 E2E 和定向 verifier；不得默认运行 portable、NSIS、安装/卸载或发布链。
3. **完整打包仅限**：Electron Main、依赖、安装器、用户数据格式、升级/卸载、正式 Release 或仅打包环境可复现的问题。
4. **批量修改后一次推送**：禁止通过 GitHub 内容接口逐文件反复提交并让每个小提交重跑 CI。应先完成相关修改，再以一到两个提交推送。
5. **CI 只保留一次最终验证**：推送后只检查启动、最终结果和合并结果三个节点；环境波动最多重试一次。专项门禁和 Branch Validation 已提供充分证据后，不继续等待无关发布级工作流。
6. **旧测试不得绑架当前结构**：历史 verifier 与当前行为冲突时，直接替换为当前行为测试或归档，不为保留旧字符串、旧页面或隐藏兼容文本反复修改产品代码。
7. **文档最后一次同步**：代码和测试稳定后，一次性更新 `PROJECT_STATE.md`、`WORKLOG.md` 和当前交接；不创建额外文档收口 PR。
8. **禁止自行扩展范围**：修复 Bug 不得自动扩大为全项目治理、完整发布验收或额外功能。出现新范围时先停止并按投入产出比重新裁剪。
9. **个人项目优先级**：真实 Bug、用户可见体验、小型明确功能、稳定性技术债、纯代码整齐依次降低；不追求商业级流程完整度。
10. **Codex 只做不可替代实机项**：物理声卡、扬声器、真实显示器/DPI、安装器差异和第三方程序界面。能由 GitHub Actions 或 ChatGPT 自动完成的内容不得重复交给 Codex。

## Codex 报告有效性规则

- 报告必须在开头记录 `git fetch` 后的 `HEAD`、`origin/main` 和任务指定提交。
- 若任务提交不在当前历史中，报告只能标记为 `BASELINE_INVALID`，不得继续输出产品 `NO-GO`。
- 旧提交上的缺陷只能作为“待在最新 main 复测的线索”，不能直接登记为当前产品 Bug。
- 启动方式必须按任务文档执行；不得以“等价入口”替代规定命令后仍声称完成对应验收。
- `NOT TESTED` 必须保留，不得推断为 PASS 或 FAIL。

## 后续规则

- 不预排 U40-E 或连续结构治理。
- 只由真实 Bug、明确体验问题或小型功能触发新任务。
- 一个任务一个 PR；必要文档和交接同一 PR 收口。
- 新功能不得写回旧巨型设置/诊断页面。
- Architecture Guardrails 继续禁止新增显式 `any`、Renderer 裸 IPC、跨层实现导入和相对导入循环。

## 冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、账号和插件市场保持冻结。

<!-- 历史验证锚点：U39-G：最终综合验收完成；不再存在预排的下一轮 U39。 -->