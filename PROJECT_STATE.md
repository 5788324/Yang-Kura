# PROJECT_STATE

## 当前状态

```text
核心版本：0.169.0-beta.2
代码事实来源：GitHub main
Beta 1 / Beta 2：已发布并完成远端资产校验
U34～U38：架构、正式媒体库与播放器边界完成
U39-A～U39-G：日常体验、架构门禁与最终综合验收完成
U40-A：个人项目快速维护规则完成
U40-B：全产品用户旅程与交互覆盖验收完成
U40-C：UI 细节收口完成
U40-D：真实资源库稳定性修复与 Issue #66 收口完成
当前任务：按需日常维护
大型功能：长期冻结
```

当前版本仍为 `0.169.0-beta.2`，既有 Beta 2 Release 不变。

## 发布事实

- Release：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 资产：portable、NSIS setup、`SHA256SUMS.txt`
- 证据：`release/beta2-publication-state.json`

## 已完成产品能力

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、fallback、Seek、Queue、History 和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- 首页、音声库、RJ 详情、音乐库及分组详情。
- portable、NSIS、安装、重复安装、卸载和用户数据保留。

## U40-D 缺陷收口

| 编号 | 状态 | 处理结果 |
|---|---|---|
| U40-B01 | 已修复 | 读取进入共享协调器；15 秒超时、错误、重试、迟到结果和中断恢复均有明确状态。 |
| U40-B02 | 已修复 | 设置、顶栏、首页、音声库和音乐库统一读取同一 `LibrarySessionSnapshot`。 |
| U40-B03 | 已修复 | 自动化 profile 隔离；日常启动清理旧测试数据；队列和历史以当前资源库为有效边界。 |
| U40-M01 | 已修复 | 旧版大集合按 RJ 或实际目录层级重新分组；空集合不进入日常页面。 |
| U40-M02 | 已修复 | 生产设置切换到轻量日常页面；旧工程设置与旧完整诊断退出运行时。 |
| U40-O01 | 环境观察 | mpv 缺失不判为代码失败；HTMLAudio 回退链已自动验证。 |

## Issue #66 关闭结论

- `SettingsPage.tsx` 和 `DiagnosticsPage.tsx` 只保留历史兼容源码，不再进入生产路由。
- 新增读取协调、集合规范化和测试 profile 清理服务，未继续向旧巨型页面或 `electron/main.ts` 堆叠职责。
- `fixtureLibraryScanner` 与 `virtualLibraryPathParser` 的历史相对导入循环已消除；当前相对导入循环为 0。
- 历史 package 元数据和旧 verifier 仅作发布追溯；不得重新作为当前产品能力入口。
- Issue #66 已完成，不再保留开放结构治理清单。

## 最终自动验收

```text
候选提交：189c5a65cb024838cb288874e7c78f8e07b0671c
U40-D Run：29628604275
Artifact：8424721819
Digest：sha256:d577eed18e51ce8686149e6ac04c1eb9f6341e30b72d9462c3960ed93d244f37
```

同一候选提交通过：Documentation Validation、Architecture Guardrails、UI Fast Validation、U40-C UI Polish、U40-D Real Library Stability、Branch Validation 和 U32 Release Candidate Packaging。Branch Validation 内的 U28～U32、当前行为 verifier、stable regression 和最终 production build 全部通过。

## 真实库实机验收

Codex 测试文档：`docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`。

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

当前自动化没有访问上述真实目录。Codex 必须按文档执行只读真实库验收；导入、Index 写入、备份恢复和回滚只在临时副本执行。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，个人本地媒体库主链已完成 |
| Windows 可交付性 | Beta 2 已发布并完成远端资产验证 |
| 读取状态可信度 | U40-D 已建立跨页面单一状态、超时和恢复机制 |
| 日常 profile | 自动化样本隔离并具备旧污染清理 |
| 真实库分组 | 旧版错误大集合会按实际作品/专辑层级规范化 |
| 日常 UI | 正式页面、主题、空状态、轻量设置和维护入口已收口 |
| 架构 | 增量门禁有效，历史相对导入循环为 0 |
| 当前重点 | 真实使用反馈与明确小型需求 |

## 快速开发模式

- 普通 UI、Hook 和状态：TypeScript、构建、相关 E2E、定向 verifier。
- 播放器 Renderer：`Player Fast Validation`。
- 设置、主题和日常页面：`UI Fast Validation`。
- 架构增量：`Architecture Guardrails`。
- Electron Main、安装器、依赖、用户数据目录和正式发布变化：完整 Windows 与打包验收。
- 一个任务一个 PR；功能、必要文档、工作日志和交接同一 PR 收口。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、在线账号、插件市场和无关大型 Provider。

## AI 自主管理规则

用户不承担测试、排错、构建、Git、文档或发布操作。ChatGPT 负责规划、开发、自动测试、PR、合并和交付；物理硬件、真实声卡和主观显示效果由 Codex 按专项文档验证。
