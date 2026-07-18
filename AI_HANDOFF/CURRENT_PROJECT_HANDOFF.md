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
U34～U40-D3：完成
Issue #66：已关闭
当前任务：按需日常维护
```

必须从最新 `origin/main` 接手。状态见 `PROJECT_STATE.md`，路线见 `PROJECT_ROADMAP.md`，日志见 `AI_HANDOFF/WORKLOG.md`，U40-D 系列证据见 `docs/U40D_FINAL_EVIDENCE.md`。

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

## 当前提交事实

```text
U40-D 合并提交：5daa0102b1114b6213d3240aa7cb4e66285ca7ab
U40-D2 合并提交：b13a9149d1fcaf4ee409326c0fc4e219806aad88
U40-D3 合并提交：03a3b75f95974b3370e12cb34dde20a4429e17fb
U40-D3 验证候选：596358dbc8cb3afc9a87b1967aad260f5db0e29a
U40-D3 Run：29636584817
相对导入循环：0
```

U40-D3 候选通过：Architecture Guardrails、TypeScript/构建、定向 U40-D 回归、资源库与重启、播放器/字幕/持久化会话、主题/窗口/键盘和日常页面链。未运行 portable、NSIS、安装/卸载或新 Release。

## Codex 真实库实测结论

有效报告基线：

```text
branch：main
HEAD = origin/main = b13a9149d1fcaf4ee409326c0fc4e219806aad88
音声库：E:\arsm
独立 profile：%TEMP%\YangKura-U40D2-Retest\profile
```

已实测：

- 日常 profile 项目计数测试前后均为 776，隔离有效。
- `E:\arsm` 在 15 秒内读取为 75 个集合、3540 条轨道。
- 首页、顶栏、设置和音声库状态一致。
- 搜索、视图切换、作品详情、轨道、队列、历史和临时歌单恢复有实机证据。
- 三主题同步并跨重启保持；空歌单不再显示 `$0`；导入首屏不再显示 MVP/IPC/Scanner/Contract 等术语。
- 单实例通过；连续三次完整重启恢复通过；关闭后相关进程为 0。
- 临时加入本机 mpv 目录到测试进程 PATH 后，真实播放从 `0:29 / 3:12` 推进到 `0:47 / 3:12`，Seek 和 33 行全屏歌词通过。

报告内部曾同时保留初始 `FAIL / NO-GO` 和后续撤销结论。正确解释是：mpv 主链通过；无 mpv 时 HTMLAudio 曾停在 `0:00 / 0:00`，不能仅凭 mpv 成功认定回退正常。U40-D3 已把该状态改为 10 秒内成功或明确失败。

仍为 `NOT TESTED`：本轮真实音乐库读取、临时导入事务、外部打开、物理 DPI/减少动画、完整键盘焦点、损坏 Index 和临时歌单删除确认。不得推断。

第二次启动约 20 秒恢复首页仅作为非阻断性能 Observation，不自动触发新治理轮次。

## 强制效率规则

以下规则优先于历史流程、旧 verifier 和“所有灯都绿”的惯性做法：

1. **先锁定基线再工作**：任何 Codex、GUI、CI 或实机验收开始前必须执行 `git fetch origin`，并确认 `branch = main`、`HEAD = origin/main = 任务指定提交`。任一不符立即停止，不得在旧提交上继续测试。
2. **按风险验证**：普通 UI、Renderer、Hook、状态和文档改动只运行 TypeScript、production build、相关 E2E 和定向验证；不得默认运行 portable、NSIS、安装/卸载或发布链。
3. **完整打包仅限**：Electron Main、依赖、安装器、用户数据格式、升级/卸载、正式 Release 或仅打包环境可复现的问题。
4. **批量修改后一次推送**：禁止通过 GitHub 内容接口逐文件反复提交并让每个小提交重跑 CI。应先完成相关修改，再以一到两个提交推送。
5. **CI 只保留一次最终验证**：推送后只检查启动、最终结果和合并结果三个节点；环境波动最多重试一次。专项门禁已提供充分证据后，不继续等待无关发布级工作流。
6. **旧测试不得绑架当前结构**：历史 verifier 与当前行为冲突时，直接替换为当前行为测试或归档，不为保留旧字符串、旧页面或隐藏兼容文本反复修改产品代码。
7. **文档最后一次同步**：代码和测试稳定后，一次性更新 `PROJECT_STATE.md`、`WORKLOG.md` 和当前交接；不创建额外文档收口 PR。
8. **禁止自行扩展范围**：修复 Bug 不得自动扩大为全项目治理、完整发布验收或额外功能。
9. **个人项目优先级**：真实 Bug、用户可见体验、小型明确功能、稳定性技术债、纯代码整齐依次降低；不追求商业级流程完整度。
10. **Codex 只做不可替代实机项**：物理声卡、扬声器、真实显示器/DPI、安装器差异和第三方程序界面。自动化能完成的内容不得重复交给 Codex。

## Codex 报告有效性规则

- 报告必须在开头记录 `git fetch` 后的 `HEAD`、`origin/main` 和任务指定提交。
- 若任务提交不在当前历史中，报告只能标记为 `BASELINE_INVALID`，不得继续输出产品 `NO-GO`。
- 旧提交上的缺陷只能作为“待在最新 main 复测的线索”，不能直接登记为当前产品 Bug。
- 启动方式必须按任务文档执行；不得以“等价入口”替代规定命令后仍声称完成对应验收。
- 补充结果与报告标题/总评冲突时，必须按时间顺序重算最终结论，不得同时保留互斥结论。
- `NOT TESTED` 必须保留，不得推断为 PASS 或 FAIL。

## 后续规则

- 不预排 U40-E 或连续结构治理。
- 只由真实 Bug、明确体验问题或小型功能触发新任务。
- 一个任务一个 PR；必要文档和交接同一轮收口。
- 新功能不得写回旧巨型设置/诊断页面。
- Architecture Guardrails 继续禁止新增显式 `any`、Renderer 裸 IPC、跨层实现导入和相对导入循环。

## 冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、账号和插件市场保持冻结。

<!-- 历史验证锚点：U39-G：最终综合验收完成；不再存在预排的下一轮 U39。 -->