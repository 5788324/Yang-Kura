# Yang-Kura 当前项目交接

> 新对话或其他 AI 接手时的当前权威交接。代码事实以最新 GitHub `main` 为准；状态见 `PROJECT_STATE.md`，工作记录见 `AI_HANDOFF/WORKLOG.md`，长期顺序见 `PROJECT_ROADMAP.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
当前版本：0.169.0-beta.2
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
用途：ASMR/RJ 与普通音乐的个人本地音频媒体库
当前索引：Local JSON Index
Beta 1：已发布并完成远端资产校验
Beta 2：个人日用版已发布并完成远端资产校验
U34～U36：完成
U37-A～U37-D：完成
U38-A～U38-C：完成
U39-A：播放器底栏主题一致性完成
U39-B：设置与 AI 维护入口边界完成
U39-C：资源库授权持久化与重启恢复完成
U39-D：雾光象牙浅色主题对比度完成
当前任务：继续修复 U39 审计剩余 Major/Minor 问题
大型功能：长期冻结，除非用户明确重新解冻
```

必须从最新 `origin/main` 接手。禁止使用旧 ZIP、历史 MVP 包、旧工作区或文档中的旧固定 SHA 作为代码来源。

当前开放跟踪：

- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

Issue #65 已完成并关闭。

## 2. 发布事实

```text
tag：v0.169.0-beta.2
Release ID：355486824
目标提交：14bc78a81c827882efc232c6c6c12f0d8ed04542
发布时间：2026-07-17T05:21:02Z
资产：portable、NSIS setup、SHA256SUMS
证据：release/beta2-publication-state.json
```

三个远端资产的文件名、大小、下载文件 SHA-256 和 GitHub digest 已全部校验通过。

## 3. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `AI_HANDOFF/WORKLOG.md`
4. `PROJECT_ROADMAP.md`
5. `docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md`
6. `docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md`
7. `docs/architecture/U38_PLAYER_SUBTITLE_BOUNDARY.md`
8. `docs/architecture/U39_PLAYERBAR_THEME.md`
9. `docs/architecture/U39_MAINTENANCE_ENTRY.md`
10. `docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md`
11. `docs/architecture/U39_LIGHT_THEME_CONTRAST.md`
12. `docs/DESIGN.md`
13. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
14. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 4. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、架构、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和发布。简单、低风险且相关的任务默认合并处理。

Codex 只处理自动化无法替代的真实本机、显示器/DPI、硬件、声卡、驱动、安装器或系统集成测试。Codex 默认只测试，不修改源码。

## 5. 已完成事实

### 核心产品

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载、数据保留和进程回收。

### U34～U39-D

- 完成架构审计、统一 IPC、语义主题、AppShell、Router、Overlay 与 Main IPC 分域。
- 正式首页、音声库、RJ 详情和音乐库已替换旧生产路由。
- U38-A：`playerQueueTransitions.ts` 与 `usePlayerSessionPersistence.ts` 分离 Queue、History、续播和会话持久化。
- U38-B：`usePlayerBackend.ts` 集中 HTMLAudio、mpv、媒体解析、fallback、Seek 与后端同步。
- U38-C：`usePlayerSubtitles.ts` 集中字幕请求代次、过期结果丢弃、来源变化重载、结果映射和当前曲目/Queue 状态同步。
- U39-A：PlayerBar、播放控制、进度条和临时弹层使用语义主题 Token，不再固定为 zinc 深色。
- U39-B：设置页提供独立 AI 维护入口；维护概览、性能诊断和完整历史诊断逐级按需加载。
- U39-C：Main 持久化 root token 授权映射，重新选择旧目录时接管 Index token，重启后可直接读取和播放。
- U39-D：雾光象牙统一新旧主题变量；文字/状态色达到 4.5:1，组件边界达到 3:1，并由真实 Electron 运行时重复验证。
- `diagnostics` 仍是隐藏维护路由，不出现在日常侧栏。
- 现有资源库检修、索引清理、备份和恢复能力未删除，后续触碰对应功能时逐块迁移。
- `useAudioPlayer.ts` 只保留 Controller、完成策略和用户操作协调。
- U29 Electron E2E 覆盖真实后端、Seek、Queue、LRC/SRT/VTT/ASS、重启授权和续播。
- U30 Electron UI matrix 覆盖主题、键盘焦点和无障碍表层。

## 6. 当前执行优先级

```text
真实使用 Bug
→ 字幕与播放实际体验
→ 日常 UI / 性能
→ 修改相关链路时顺带处理技术债
```

不要继续开启纯播放器拆分阶段。发现真实字幕问题时，优先在 `usePlayerSubtitles.ts`、Electron 字幕读取接口和 U29 样本中定向修复。播放器表层问题优先在语义 Token 和 U30 UI matrix 中修复。

设置与维护后续原则：只在修改真实检修功能时，把对应状态和 UI 从 `SettingsPage.tsx` 迁入独立维护 Feature；迁移完成前不得隐藏或删除真实维护能力。

## 7. 快速验证规则

- 普通 UI、Hook 和状态管理：TypeScript、生产构建、相关 E2E、定向 verifier。
- 播放器 Renderer：`Player Fast Validation`；运行时变更执行 U29，主题与无障碍变更执行 U30。
- 设置、导航、主题和维护表层：`UI Fast Validation`，执行 TypeScript、Renderer/Electron build、定向 verifier、U30，以及浅色主题运行时对比度验收。
- portable、NSIS、安装与卸载：仅 Electron Main、安装器、依赖、打包配置、用户数据目录或正式发布变化时执行。
- 一个任务一个 PR；功能和必要文档同一 PR 收口；不再创建额外文档收口 PR。

## 8. 长期冻结

除非用户明确重新解冻，否则禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 9. UI 与风险边界

- 中文用户界面；工程术语只进入 AI 维护或开发文档。
- 内容优先；主题必须改变完整材质系统并支持 reduced-motion。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- Renderer 不接收不必要的绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 当前项目不要求商业代码签名或公开分发标准。
