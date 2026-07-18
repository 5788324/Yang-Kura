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
U40-D2：最新 main 真实库定向实机复测完成
U40-D3：HTMLAudio 停滞状态收口完成
Git Fast Lane v2：项目级默认规则已生效
当前任务：Beta 3 正式日用发布收口
大型功能：长期冻结
```

当前公开版本仍为 `0.169.0-beta.2`，既有 Beta 2 Release 不变。当前 `main` 已包含 U40-D2/U40-D3 修复，因此 Beta 3 发布收口是当前唯一主线。

## 发布事实

- Release：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 资产：portable、NSIS setup、`SHA256SUMS.txt`
- 证据：`release/beta2-publication-state.json`
- 当前差距：公开 Beta 2 安装包未包含 U40-D2/U40-D3；下一发布目标为 Beta 3。

## 已完成产品能力

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、fallback、Seek、Queue、History 和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- 首页、音声库、RJ 详情、音乐库及分组详情。
- portable、NSIS、安装、重复安装、卸载和用户数据保留。

## U40-D～U40-D3 缺陷收口

| 编号 | 状态 | 处理结果 |
|---|---|---|
| U40-B01 | 已修复 | 读取进入共享协调器；15 秒超时、错误、重试、迟到结果和中断恢复均有明确状态。 |
| U40-B02 | 已修复 | 设置、顶栏、首页、音声库和音乐库统一读取同一 `LibrarySessionSnapshot`。 |
| U40-B03 | 已修复并实测 | 显式隔离 profile；日常 profile 计数在实测前后保持 776；队列和历史以当前资源库为有效边界。 |
| U40-M01 | 已修复并实测 | `E:\arsm` 在 15 秒内读取为 75 个集合、3540 条轨道；不再只有两个错误一级目录集合。 |
| U40-M02 | 已修复并实测 | 日常设置、主题、歌单文案和导入页生产语言通过实机复测。 |
| U40-D2-R01 | 已修复并实测 | `YANG_KURA_USER_DATA_ROOT` 隔离、单实例和连续三次重启恢复通过。 |
| U40-D2-R02 | 已修复并实测 | 歌单不再显示字面量 `$0`；三主题设置与顶栏同步并可跨重启保持。 |
| U40-O01 | 环境观察 | mpv 不在启动进程 PATH 时不可用；产品已有手动选择 mpv 可执行文件入口。 |
| U40-D3 | 已修复 | HTMLAudio 元数据读取和启动各增加 10 秒超时；失败时清除伪播放状态并提示选择 mpv，不再无限停在 `0:00 / 0:00`。 |

## Issue #66 关闭结论

- `SettingsPage.tsx` 和 `DiagnosticsPage.tsx` 只保留历史兼容源码，不再进入生产路由。
- 新增读取协调、集合规范化和测试 profile 清理服务，未继续向旧巨型页面或 `electron/main.ts` 堆叠职责。
- `fixtureLibraryScanner` 与 `virtualLibraryPathParser` 的历史相对导入循环已消除；当前相对导入循环为 0。
- 历史 package 元数据和旧 verifier 仅作发布追溯；不得重新作为当前产品能力入口。
- Issue #66 已完成，不再保留开放结构治理清单。

## 验证事实

```text
U40-D 合并提交：5daa0102b1114b6213d3240aa7cb4e66285ca7ab
U40-D2 合并提交：b13a9149d1fcaf4ee409326c0fc4e219806aad88
U40-D3 合并提交：03a3b75f95974b3370e12cb34dde20a4429e17fb
U40-D3 验证候选：596358dbc8cb3afc9a87b1967aad260f5db0e29a
U40-D3 Run：29636584817
```

U40-D3 候选已通过 Architecture Guardrails，以及 U40-D Real Library Stability 中的 TypeScript/构建、定向回归、资源库与重启、播放器/字幕/持久化会话、主题/窗口/键盘和日常页面链。该补丁未触发 portable、NSIS、安装/卸载或 Release 资产链。

## 真实库实机验收

U40-D2 Codex 使用正确基线和规定入口完成：

```text
分支：main
HEAD = origin/main = b13a9149d1fcaf4ee409326c0fc4e219806aad88
音声库：E:\arsm
读取结果：75 个集合、3540 条轨道，15 秒内完成
独立 profile：%TEMP%\YangKura-U40D2-Retest\profile
日常 profile：测试前后均为 776 项
单实例：PASS
完整重启：3 次 PASS
进程回收：PASS
```

临时加入本机 mpv 目录到测试进程 PATH 后，真实音轨从 `0:29 / 3:12` 推进到 `0:47 / 3:12`，Seek 可用，全屏歌词加载 33 行，证明 mpv 主链、进度和字幕可用。该结果不等同于证明所有真实编码均可由 HTMLAudio 播放；因此 U40-D3 另行收口基础播放停滞和错误提示。

Beta 3 发布前仍需定向覆盖：真实音乐库 `D:\CloudMusic\VipSongsDownload` 只读链、`%TEMP%` 临时副本中的 Index/导入/回滚，以及最新 main 的 portable/NSIS/安装升级卸载和资产校验。其余历史未测项不自动扩大本轮范围。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，个人本地媒体库主链已完成 |
| Windows 可交付性 | Beta 2 已发布；Beta 3 正在把最新 main 修复带入正式安装包 |
| 读取状态可信度 | 共享状态、15 秒超时和真实音声库读取均已验证 |
| 日常 profile | 独立 profile、日常数据不受影响、队列与历史恢复均已实测 |
| 真实库分组 | `E:\arsm` 已按 75 个实际集合呈现 |
| 播放 | mpv 真实播放、Seek、字幕通过；HTMLAudio 停滞会在 10 秒内明确失败 |
| 日常 UI | 三主题、歌单文案、导入页语言和设置入口已实测收口 |
| 架构 | 增量门禁有效，历史相对导入循环为 0 |
| 当前重点 | Beta 3 正式日用发布收口 |

## Git Fast Lane v2

完整规则见 `docs/GIT_FAST_LANE_V2.md`。项目默认执行：一个任务一个分支和 PR、1～2 个逻辑提交、一次最终 CI、禁止临时补丁工作流、多文件批量提交、按 L0～L3 风险分级验证。正式 Release 属于 L3，只执行一次完整 Windows 打包与资产回读。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、在线账号、插件市场和无关大型 Provider。

## AI 自主管理规则

用户不承担测试、排错、构建、Git、文档或发布操作。ChatGPT 负责规划、开发、自动测试、PR、合并和交付；物理硬件、真实声卡和主观显示效果由 Codex 按专项文档验证。Git Fast Lane v2 与 Beta 3 发布目标视为本项目持续记忆和默认执行规则。

<!-- 历史验证锚点：U39-G：最终 Windows 回归与打包验收完成。 -->
