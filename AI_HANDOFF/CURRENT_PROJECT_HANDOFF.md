# Yang-Kura 当前项目交接

## 0. 本次交接结论

Beta 3 仍为 `FAIL / NO-GO`。第一轮工作已从“暂停等待”进入“诊断增强候选”阶段；本轮只增强 Windows E2E 证据采集，并修正文档校验规则，不修改播放器业务行为，不代表缺陷已修复。

```text
仓库：https://github.com/5788324/Yang-Kura.git
公开主分支：main
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
正式稳定版目标：1.0.0
PR：#91
候选分支：release/beta3-daily-closeout
本轮起始 HEAD：7f088a077afb8f172511f291309c461db6fe8a56
交接前产品代码基线：69fe73b794d467d619ffbcfa5d794c0af23359f7
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
索引：Local JSON Index
Issue #66：已关闭
当前任务：第一轮诊断增强，等待 Windows E2E 证据
发布状态：NO-GO
```

## 1. 用户确认的最终路线

```text
完成 Beta 3
→ 全面审查项目 UI、功能和所有按钮的完整调用链
→ 修复自动化审查发现的问题
→ 生成 Codex 实机验收提示词
→ Codex 在固定 branch/SHA 上执行 Windows 全量验收
→ 清理无用文件和历史遗留
→ 正式发布 1.0.0
→ 后续只迭代 Bug、UI 和明确的小功能
```

1.0 后不再规划主动的大版本更新。下载器、SQLite、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录正式接入、云同步、账号和插件市场等大型功能，只有用户明确提出真实需求后才单独评估和立项。

## 2. 用户协作规则

- 用户不执行 Git、构建、测试、排错或发布。
- ChatGPT 负责架构、实现、自动测试、文档、Git、PR、合并、发布和最终验收管理。
- Codex 只负责必须依赖用户 Windows、本地媒体、GUI、声卡、第三方程序和真实文件系统的工作。
- 需要 Codex 时，ChatGPT 必须提供可直接复制的完整提示词；用户只负责转发。
- README、PROJECT_STATE、PROJECT_ROADMAP、WORKLOG、当前阶段路线和交接文档必须在开发过程中持续同步。
- 当前优先速度和准确性，不做无关治理或未经确认的大型功能。

## 3. Git 工作方式

采用集中式 Git 流程：

```text
锁定 branch/SHA 并拉取一次
→ 一次性读取相关源码与文档
→ 本地完成分析、开发、批量修改、自动测试和文档
→ 审查完整 diff
→ 1～2 个逻辑提交
→ 统一推送一次
→ 必要 CI
→ Codex 固定 SHA 实机验收
→ 合并和发布
```

硬性要求：

- 一个任务一个分支、一个 PR。
- 候选稳定前禁止逐文件远程提交、边改边推和重复触发 CI。
- 多文件必须批量提交。
- 通常一次推送；真实 CI 失败最多追加一次修复推送。
- 文档与代码在同一轮最终推送前同步。
- Codex 验收前必须有固定远端 branch/SHA，测试后由 ChatGPT 处理报告和后续 Git。
- 当前执行环境若无法解析 `github.com`，使用 GitHub 连接器读取固定 SHA 和创建单一 tree/commit，不退回逐文件提交。

## 4. 当前 Git 与发布事实

- `main` 仍未包含 Beta 3。
- PR #91 未合并，Beta 3 Release 未创建。
- Beta 2 tag `v0.169.0-beta.2` 和 Release ID `355486824` 保持冻结。
- PR 分支在交接前的产品代码 HEAD 为 `69fe73b794d467d619ffbcfa5d794c0af23359f7`。
- 该 HEAD 含多轮播放器和测试尝试，但最新 Windows 专项未通过，只能视为未验收候选。
- `package.json` 和 `package-lock.json` 仍为 Beta 2；Beta 3 正式发布前必须在仓库中同步版本。
- 上一轮文档提交 `7f088a0...` 的 Documentation Validation 因校验脚本仍要求旧路线文案而失败；其余主要工作流通过。本轮同步更新校验规则。

## 5. 最新有效实机报告

有效文件：

- `BETA3_RETEST_V2_COMMAND_RESULTS.txt`
- `BETA3_RETEST_V2_FINAL_REPORT.md`
- `BETA3_RETEST_V2_FUNCTION_MATRIX.md`
- `BETA3_RETEST_V2_DEFECTS.md`

有效基线：

```text
branch = release/beta3-daily-closeout
HEAD = 69fe73b794d467d619ffbcfa5d794c0af23359f7
candidate ZIP SHA256 = 5E26432094479331DF8BCCDD50CBC1BA2565D37B64E78389B6BE8148ADCDFE02
```

结果：

```text
候选哈希：PASS
生产路由：PASS
TrackRow 直接激活源码核对：PASS
lint：PASS
Renderer build：PASS
Electron build：PASS
真实鼠标 E2E：FAIL
错误：Timed out waiting for player: RJ detail action backend duration
GUI：NOT TESTED
重启恢复：NOT TESTED
临时导入事务：NOT TESTED
```

## 6. 已确认生产链

```text
src/app/AppRouter.tsx
→ src/features/library/RjDetailPage.tsx
→ src/shared/ui/TrackRow.tsx
→ src/hooks/useAudioPlayer.ts
→ src/hooks/usePlayerBackend.ts
→ HTMLAudio 或 mpv
```

旧 `src/components/AsmrDetail.tsx` 不进入生产路由。

## 7. 第一轮诊断增强内容

本轮新增独立 Node 预加载探针 `scripts/beta3-playback-diagnostic-probe.mjs`，由 Player Fast Validation 在原 E2E 之前加载。原测试的点击、队列、模式和 duration 判定保持不变。

探针保存：

- PlayerBar 的 trackId、playbackMode、progress、duration、queueCount、currentIndex；
- HTMLAudio 的 load/play/pause 调用和 metadata、duration、canplay、error 等事件；
- `requestMpvPlaybackStart`、`requestResolveTrackMediaUrl`、`requestMpvPlaybackCommand` 请求与结果；
- mpv ready、duration、time、fallback、error 等事件；
- Renderer console、page exception；
- Electron stdout/stderr；
- 状态变化时间线和最后快照。

输出文件：

```text
artifacts/beta3-rj-detail-playback-entry/diagnostic-probe.json
```

该文件随现有 `player-fast-validation-evidence` artifact 上传。只有读取这份 Windows 证据后，才决定未验收改动是保留、局部重写还是回退。

## 8. 作废候选

- v1：修改旧 AsmrDetail，作废。
- v2：生产链正确但 E2E 失败，临时改动已恢复，作废。
- v3：未执行、未验证、未推送，作废。
- 后续从 GitHub PR #91 最新 HEAD 开始，不复制或叠加旧压缩包。

## 9. 下一步

1. 等待本轮唯一推送触发 Documentation Validation 和 Player Fast Validation。
2. 下载 `player-fast-validation-evidence`。
3. 读取原 `report.json`、`console.log` 和新 `diagnostic-probe.json`。
4. 明确第二条音轨实际停在哪一层。
5. 若根因明确，再制作单一最小修复候选。
6. 自动专项通过后生成 Codex 播放器验收提示词。
7. 播放通过后执行导入事务、真实音乐目录只读链并发布 Beta 3。
8. Beta 3 后进入全项目 UI/功能/按钮审查和 1.0 收口。

## 10. 禁止事项

- 不提前合并 PR #91 或创建 Beta 3 Release。
- 不把旧 CI 绿灯替代最新实机失败。
- 不要求用户亲自测试。
- 不逐文件提交或反复推送。
- 不在诊断证据明确前修改播放器行为。
- 不在 1.0 前插入未经确认的大型功能。
- 不因清理项目而删除仍被生产、测试、构建或发布链引用的文件。
