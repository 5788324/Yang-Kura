# PROJECT_STATE

## 当前状态

```text
核心版本：0.168.0-beta.1
代码事实来源：GitHub main
已合入主线：U02～U32
当前任务：U33 版本、Release Notes、tag、Windows 资产与 GitHub Beta 发布
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
剩余主线：U33 发布、回读与最终交接
MVP130：独立实验下载器，Beta 发布完成前继续冻结，禁止合入
```

U32 已通过 portable、NSIS、安装、重复安装、卸载、用户数据保留、完整页面、fallback、进程退出和 SHA-256 验收，并以提交 `c06e5b31b8472d6903dba1827a2994b0a8f199ec` 合入 `main`。

GitHub `main` 是唯一代码事实来源。U33 当前工作分支为 `agent/u33-beta-release`，Draft PR 为 #41。

## AI 自主管理规则

> 用户不承担测试、排错、构建、Git 操作或验收组织，只接收最终成果。

默认分工：

1. ChatGPT 负责需求拆解、架构、代码、自动测试、Windows CI、Electron UI 自动化、截图审查、回归、Git、PR、文档、合并、tag、Release 和最终交付。
2. 能通过代码、临时样本、GitHub Actions、Electron/CDP 或其他自动化完成的验证，必须由 ChatGPT 自己闭环，不得转交用户。
3. 只有确实依赖用户本机、真实硬件、物理设备、受限账号或无法自动化的系统集成时，才交给 Codex 执行实机步骤。
4. 个人自用项目按实际风险选择测试强度；简单、低风险且相关的任务允许合并处理。
5. 不要求用户运行命令、制作样本、截图、判断 PASS/FAIL 或整理报告。

详细规则见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 已完成主线

### U02～U08：产品化与真实性

- 干净空状态、中文界面、键盘焦点、弹窗语义。
- PlayerBar 主题与全屏播放器交互收口。
- 移除演示媒体和伪造播放/字幕状态。

### U09～U23：渐进式结构与质量

- 播放器生命周期、歌词时间线、依赖门禁、侧栏导航和三主题合同。
- PlayerBar 纯逻辑、临时 UI、主展示区、辅助控制、进度轨道和展示模型完成渐进拆分。

### U24～U26：日常 UI 去工程化

- 下载规划、诊断、检修、回归和工程状态退出日常视觉层。
- AI 维护入口和历史兼容层保留，但不得长期污染主界面。

历史 UI 硬规则继续有效：

> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。

### U27：Windows GUI 验收

历史结论 `NO-GO`，发现 MAJ-001 资源库状态断裂与 MAJ-002 Demo 诊断。两项均已在 U28 关闭。

### U28：资源库授权与真实 Index 闭环

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断统一。
- 合法空 Index、损坏 JSON、多编码、媒体协议和重启边界通过 Electron E2E。

### U29：播放器与字幕全流程

- HTMLAudio/mpv 真实续播起点一致。
- Seek、队列、完成策略、重启恢复和 token 对账完成。
- LRC、SRT、VTT、ASS、双语和无字幕自动验收通过。

### U30：日常 UI、三主题、窗口、DPI 与键盘

- 三档窗口/DPI 与三主题矩阵通过。
- PlayerBar、侧栏、Escape、焦点返回、reduced-motion 和 focus-visible 完成。

### U31：导入器事务与数据安全

- copy-only 与 move-only 接入统一事务服务。
- 默认不覆盖目标；copy 失败清理本轮新文件，move 失败逆向恢复本轮已移动文件。
- OperationLog 保存事务和回滚结果，仍不保存绝对路径。

### U32：发布候选 UI 与 Windows 发布物

U32-A：

- 日常侧栏只保留首页、音声库、音乐库、歌单、导入和设置。
- 下载规划与诊断退出可见导航。
- 首页、资源库、歌单、导入器和设置完成发布候选对齐。

U32-B：

- portable 与 NSIS 构建和完整页面启动通过。
- 中文/空格路径通过。
- NSIS 安装、重复安装和卸载通过。
- 用户数据保留，残留进程为零。
- packaged mpv 不可用时 HTMLAudio fallback 通过。
- 包内 Index、日志、缓存、备份和用户数据泄漏为零。
- SHA-256、截图和报告完整。

正式证据见 `docs/U32_RELEASE_CANDIDATE_PACKAGING.md`。

## 当前主线：U33 Beta 发布

目标计划：`release/u33-release-plan.json`。

```text
previousVersion：0.167.0-mvp129
version：0.168.0-beta.1
tag：v0.168.0-beta.1
title：Yang-Kura 0.168.0 Beta 1
channel：beta
prerelease：true
```

现有 GitHub 发布历史预检结果：

```text
existing tags：0
existing releases：0
target collision：false
preflight run：29389036701 — PASS
```

U33 必须完成：

1. `package.json` 与 `package-lock.json` 同步到 `0.168.0-beta.1`。
2. README、项目状态、路线图、交接和 Release Notes 同步。
3. Branch Validation、U33 Release Preflight 和 U33 Beta Release 的 PR 构建全部通过。
4. 最终 portable、NSIS、完整首页、安装/重复安装/卸载、fallback、数据保留和进程退出继续通过。
5. 生成并校验最终 `SHA256SUMS.txt`。
6. PR squash 合入 `main` 后，受控工作流才允许创建 `v0.168.0-beta.1` prerelease。
7. 回读 GitHub Release，验证目标提交、标题、prerelease 状态、资产名、体积、下载 URL 和本地 SHA-256。
8. 更新最终状态与交接。

## 当前阶段

```text
U28 资源库闭环：完成
→ U29 播放器与字幕全流程：完成
→ U30 日常 UI、三主题、窗口、DPI、键盘：完成
→ U31 导入器事务与数据安全：完成
→ U32 发布候选 UI、portable、NSIS、安装升级卸载：完成
→ U33 Beta 版本、tag、资产、Release：当前
```

## 自动验证

每个 PR 必须执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
TypeScript 与 Electron 构建
U28/U29/U30 Electron E2E
U31 importer transaction matrix
U32 visual audit
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

U33 额外执行：

```text
release tag/release collision preflight
portable + NSIS build
packaged install/fallback acceptance
complete packaged home readiness
SHA256SUMS verification
main-only GitHub prerelease publication
published release asset and target-commit verification
```

## 冻结项

Beta 发布完成前禁止启动或合入：

- MVP130 正式下载器；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- 全局 CSS 或全项目架构重写。

## 历史质量事实与 verifier 兼容合同

以下为已完成历史事实，不代表当前版本或当前任务：

- 历史核心版本：0.167.0-mvp129。
- U10（已完成）：歌词时间线纯领域逻辑和真实行为断言。
- U11（已完成）：high / critical 依赖风险阻止合并；CI 保留逐 verifier TSV 报告与稳定回归日志。
- U12（已完成）：侧栏导航类型化、可访问性、AI 维护边界和稳定页面合同。
- U13（已完成）：三主题合同与旧配置迁移。
- U14（已完成）：PlayerBar 中性色 token bridge 收口。
- U15（已完成）：播放器底栏纯逻辑抽离。
- U16（已完成）：临时 UI 生命周期 Hook。
- U17（已完成）：临时展示组件，包括歌单、音量和 Toast。
- U18（已完成）：次级展示组件、Seek 预览、空状态和歌词浮窗。
- U19（已完成）：主展示区抽离完成。
- U20（已完成）：辅助控制区与兼容标记收口。
- U21（已完成）：进度轨道与 Seek 交互生命周期抽离。
- U22（已完成）：播放器事件、收藏、歌单、Toast 与浮动歌词派生收口。
- U23（已完成）：展示模型聚合完成，PlayerBar 结构收口。
- U24（已完成）：下载规划和诊断工具进入默认折叠的 AI 维护，后续 U32 将工程入口从可见侧栏移入隐藏兼容层。
- U25（已完成）：历史工程卡、命令行说明和回归状态退出日常视觉层。
- U26（已完成）：资源库设置边界使用独立布尔开关与顶层 `hidden` 安全收口；U09～U26 结构、质量与日常 UI 增量完成。
- U27 已完成：最终结论 NO-GO；历史 `CONDITIONAL GO` 已被真实音声库补测覆盖，MAJ-001、MAJ-002 转入 U28 真实 Index 修复并关闭。

历史资源库维护合同继续保留：

- 资源库设置边界优先使用独立布尔开关与顶层 `hidden`。
- 不创建跨越现有条件块的新父容器。
- U27 的真实 Index 修复、MVP130 冻结和安全边界继续可追溯。
