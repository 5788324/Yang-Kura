# PROJECT_STATE

## 当前状态

```text
核心版本：0.169.0-beta.2
代码事实来源：GitHub main
Beta 1 / Beta 2：已发布并完成远端资产校验
U34～U36：架构基础与契约整备完成
U37-A～U37-D：媒体库正式页面完成
U38-A～U38-C：播放器结构治理完成
U39-A～U39-E：日常体验与审计问题修复完成
U39-F：增量架构防回退门禁完成
U39-G：最终 Windows 回归与打包验收完成
当前任务：按需日常维护，仅由真实问题或明确需求触发
大型功能：长期冻结，除非用户明确重新解冻
```

Yang-Kura 已完成个人本地媒体库主链、正式页面、播放器边界、主题与空状态治理，并建立增量架构门禁。当前版本仍为 `0.169.0-beta.2`，既有 Beta 2 Release 不变。

## 发布事实

- Release：[`v0.169.0-beta.2`](https://github.com/5788324/Yang-Kura/releases/tag/v0.169.0-beta.2)
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 发布时间：`2026-07-17T05:21:02Z`
- 资产：portable、NSIS setup、`SHA256SUMS.txt`
- 证据：`release/beta2-publication-state.json`
- 当前开放主线：Issue #66

## 已完成产品能力

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、fallback、Seek、Queue、History 和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- 首页、音声库、RJ 详情、音乐库及分组详情。
- portable、NSIS、安装、重复安装、卸载和用户数据保留。

## U38 播放器治理结论

```text
U38-A：Queue / History / Persistence
→ U38-B：Controller / Backend
→ U38-C：Subtitle lifecycle / state
→ 连续结构治理收口
```

播放器后端、字幕生命周期和会话持久化已形成独立边界，不再继续为了目录整齐拆分。

## U39 完成事实

- U39-A：播放器底栏和弹层进入语义主题体系。
- U39-B：设置页提供 AI 维护入口，性能与完整诊断按需加载。
- U39-C：root token 授权持久化，重启后可直接读取和播放。
- U39-D：雾光象牙文字与状态色至少 `4.5:1`，交互边界至少 `3:1`。
- U39-E：空音乐库和未选择导入来源时不再显示空壳或误导性示例结果。
- U39-F：增量架构门禁禁止新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。
- U39-G：完整 Windows 回归、U39-A～F、stable regression、portable、NSIS、安装卸载和数据保留在同一候选提交通过。

## U39-F 架构门禁

- 工作流：`.github/workflows/architecture-guardrails.yml`
- 主脚本：`scripts/verify-u39f-architecture-guardrails.mjs`
- 负向测试：`scripts/test-u39f-architecture-guardrails.mjs`
- 报告：`artifacts/u39f-architecture-guardrails/report.json`
- 模式：只比较 Pull Request base 与 head，不要求一次性消除历史问题。
- 当前基线：1 个历史相对导入环，0 个本 PR 新增循环。
- 四类故意违规已经由临时 Git 仓库测试证明会被拒绝。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，个人本地媒体库主链已完成 |
| Windows 可交付性 | Beta 2 已发布并完成远端资产验证 |
| 日常 UI | 正式页面、主题、维护入口和空状态已收口 |
| 架构防回退 | 已建立增量门禁，历史问题渐进清理 |
| 当前重点 | 真实使用反馈、明确小功能和触链技术债 |
| 大型功能 | 长期冻结 |

## U39-G 最终验收

- 工作流：`.github/workflows/u39-final-acceptance.yml`。
- 清单：`scripts/verify-u39-final-acceptance.mjs`。
- 说明：`docs/U39_FINAL_ACCEPTANCE.md`。
- 结果：U39 预排治理轮次结束；Issue #66 继续作为长期渐进治理清单。

## 快速开发模式

- UI、Hook、状态管理：TypeScript、构建、相关 E2E 和定向 verifier。
- 播放器 Renderer：`Player Fast Validation`。
- 设置、主题和日常页面：`UI Fast Validation`。
- TypeScript / Electron 架构增量：`Architecture Guardrails`。
- Electron Main、安装器、依赖、用户数据目录和正式发布变化：完整 Windows 与打包验收。

## 仍在 Issue #66 跟踪

- `SettingsPage.tsx` 的真实维护工具在触碰对应功能时逐块迁移。
- `DiagnosticsPage.tsx` 历史运行时内容继续归档。
- `electron/main.ts` 和 `src/types.ts` 只在修改对应领域时继续下沉。
- 1 个历史相对导入环在触碰相关链路时清理。
- 历史 MVP verifier 与 package 元数据逐步退出日常运行时。

禁止为了关闭清单而进行全项目搬迁或推倒重写。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、在线账号、插件市场和无关大型 Provider。

## AI 自主管理规则

用户不承担测试、排错、构建、Git、文档或发布操作。ChatGPT 负责规划、开发、自动测试、PR、合并和交付；Codex 只用于自动化无法替代的 Windows 实机、驱动、声卡、显示缩放或安装器差异测试。

<!-- 历史发布候选基线：0.167.0-mvp129 -->
