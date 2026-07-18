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
U40-A：个人项目快速维护规则完成
U40-B：全产品用户旅程与交互覆盖验收完成
U40-C：UI 细节收口完成
当前任务：按需日常维护，仅由真实问题或明确需求触发
大型功能：长期冻结，除非用户明确重新解冻
```

Yang-Kura 已完成个人本地媒体库主链、正式页面、播放器边界、主题与空状态治理，并建立增量架构门禁、可重复运行的全产品自动用户旅程验收和日常 UI 细节基线。当前版本仍为 `0.169.0-beta.2`，既有 Beta 2 Release 不变。

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

## U40-B 全产品自动验收

- 工作流：`.github/workflows/u40b-full-product-acceptance.yml`。
- 主旅程：`scripts/test-u40b-full-product-journey.mjs`。
- 汇总器：`scripts/verify-u40b-full-product-acceptance.mjs`。
- 组合执行 U28、U29、U30、U31、U32 与 U40-B 用户旅程。
- 自动生成 6 个 1 秒 WAV、4 类字幕、封面和临时资源库，只在 Windows runner 临时目录操作。
- 最终结果：6/6 套件通过，635 个可见控件状态有证据，65 条操作记录，14 条用户旅程，19 张截图，未覆盖控件 0，运行时错误 0。
- 说明：`docs/U40B_FULL_PRODUCT_ACCEPTANCE.md`。
- 该工作流用于按需综合复核，不作为每个普通 PR 的默认门禁。
- 物理扬声器、声卡、真实显示器主观观感和第三方程序界面按用户要求排除。

## U40-C UI 细节收口

- PR：#87。
- 统一样式文件：`src/styles/u40c-ui-polish.css`。
- 浅色 AI 维护页状态、标签和次级按钮改用语义 Token，提高辨识度。
- 少量专辑、艺术家和文件夹结果使用紧凑固定范围，不再被网格拉伸。
- 全屏歌词保留沉浸暗色舞台，同时统一主应用圆角、边框、阴影和品牌材质，并移除装饰窗口圆点。
- `1120px` 以下设置页压缩维护入口，将四个设置标签保持为单行可滚动导航。
- 工作流：`.github/workflows/u40c-ui-polish.yml`；验证器：`scripts/verify-u40c-ui-polish.mjs`。
- Windows Run `29626125281`：TypeScript、production/Electron build、U40-C verifier、U30、U32、U40-B 相关用户旅程全部通过。
- Artifact `8423932306`，digest `sha256:b9c255d9615d2e59d5f2b3c0802d22b6b04f454f6668941831f32bf448724a00`。
- 没有修改播放器、资源库、Index、导入器、文件操作、安装器或发布版本。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，个人本地媒体库主链已完成 |
| Windows 可交付性 | Beta 2 已发布并完成远端资产验证 |
| 日常 UI | 正式页面、主题、维护入口、空状态及 U40-C 细节收口完成 |
| 架构防回退 | 已建立增量门禁，历史问题渐进清理 |
| 自动用户旅程 | U40-B 全产品组合验收通过，可按需重复执行 |
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
- U40-B 只在需要全产品复核、发布前集中验收或大范围用户流程变更时运行。
- 个人项目默认按投入产出比分级验证；纯文档和低风险内部整理不扩大到发布级门禁。
- 一个任务只使用一个 PR，功能、必要文档和交接在同一 PR 收口，不再追加独立“文档收口 PR”。
- 核心文档集中维护 `README.md`、`PROJECT_STATE.md`、`PROJECT_ROADMAP.md`、`AI_HANDOFF/WORKLOG.md` 和当前交接；历史镜像只在确有依赖时同步。

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

用户不承担测试、排错、构建、Git、文档或发布操作。ChatGPT 负责规划、开发、自动测试、PR、合并和交付；物理硬件和第三方程序界面不属于默认自动验收范围。

<!-- 历史发布候选基线：0.167.0-mvp129 -->
