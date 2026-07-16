# PROJECT_STATE

## 当前状态

```text
核心版本：0.168.0-beta.1
代码事实来源：GitHub main
Beta 1：已发布并完成远端资产回读
当前主线：Beta 2 联合整备
U34：联合审计完成
U35-A：共享 IPC 合同与 Design System 基础完成
U35-B：正式主题与生产 AppShell 接线完成
U36-A：导航注册表与 Preload IPC 统一完成
U36-B：App Shell、Router 与 Overlay 拆分完成
U36-C：Main IPC 分域注册完成
U37-A：资源库页面状态与错误恢复完成
当前阶段：U37-B 首页与音声库列表 UI
目标版本：0.169.0-beta.2
大型功能：继续冻结，Beta 2 完成后重新评估
```

Yang-Kura 已具备本地媒体库、播放、字幕、导入、元数据、维护和 Windows 发布主链。当前工作不是继续堆叠功能，而是把现有产品整理为可长期维护、视觉统一、边界清晰的 Beta 2。

## Beta 1 已完成事实

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only 与受控 move-only 导入事务、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- 缺失文件、受控索引清理、备份保留和维护历史。
- 50,000 曲目生成数据性能基准。
- portable 与 NSIS 构建、安装、重复安装、卸载、数据保留和进程回收。
- `v0.168.0-beta.1` prerelease 与三个资产完成远端文件名、大小和 SHA-256 校验。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，具备日常本地媒体库主链 |
| Windows 可交付性 | Beta 可用，尚未代码签名 |
| 代码可维护性 | 持续改善；`App.tsx` 组合职责已拆，主要负债转向 `electron/main.ts`、设置/维护巨型页面和历史兼容层 |
| UI 视觉质量 | 两套正式主题和生产 AppShell 已接入，页面级迁移尚未完成 |
| 新增大功能条件 | 尚不具备，应先完成 Beta 2 |

## U34：联合审计与基线 — 已完成

已输出：

- `docs/architecture/ARCHITECTURE_AUDIT.md`
- `docs/architecture/DEPENDENCY_MAP.md`
- `docs/architecture/REFACTOR_BACKLOG.md`

主要结论：

1. `electron/main.ts` 约 4,800 行级，窗口、协议、扫描、Index、维护、mpv、Provider、导入和 IPC 共存。
2. `SettingsPage.tsx`、`DiagnosticsPage.tsx` 仍是巨型运行时页面。
3. `App.tsx` 和 `useAudioPlayer.ts` 曾同时承担组合、状态和业务协调。
4. Renderer、Preload、Main 曾各自维护 IPC 类型和裸 channel。
5. TypeScript strict 尚未按目录收紧。
6. 历史 verifier、MVP 文案和兼容路径仍需在 U40 清理。

执行策略：保留核心业务与安全边界，渐进拆分高耦合文件，按页面纵向迁移，不进行全项目推倒重写。

## U35：架构边界与 Design System — 已完成

### U35-A

- 建立 `electron/ipc/contracts.ts` 唯一 channel 注册表。
- 建立 `IpcResult<T>`、`IpcError` 和错误分类。
- 建立暮夜琥珀、雾光象牙语义 Token。
- 新增 AppShell、Button、Surface、Feedback、Dialog、Drawer、MediaCard、TrackRow。
- 修复 U32 TypeScript/build 非 fail-fast 假阳性。

### U35-B

- 两套正式主题投入生产运行。
- Renderer 入口接入 ThemeRuntimeBridge 和 AppShell production bridge。
- TopBar、Sidebar、内容区、PlayerBar、队列和续播提示接入语义样式。
- 历史主题设置与正式主题兼容。
- TypeScript、Electron E2E、稳定回归、portable 与 NSIS 全部通过。

## U36：应用壳与契约统一 — 已完成

### U36-A：导航与 Preload IPC — 已完成

- 建立 `src/app/navigation.ts` 页面元数据事实源。
- Sidebar 改为消费统一导航注册表。
- 请求类型从 `electron/preload.ts` 拆到 `electron/preload/contracts.ts`。
- Preload 所有 invoke/on/removeListener 使用 `IPC_CHANNELS`。
- `window.yangKura` API、路径 token 和产品行为保持不变。

### U36-B：App Shell、Router 与 Overlay — 已完成

- 新增 `src/app/TopBar.tsx`，集中顶部运行状态。
- 新增 `src/app/AppRouter.tsx`，集中页面 lazy loading、详情路由和内部维护路由。
- 新增 `src/app/QueueDrawer.tsx`，集中队列摘要、列表、清空和 Escape 行为。
- 新增 `src/app/PlayerOverlayHost.tsx`，集中 Lyrics 与断点续播覆盖层。
- `App.tsx` 只保留顶层状态、业务协调和壳组合。
- Index、播放、字幕、元数据、导入事务和路径安全行为保持不变。

### U36-C：Main IPC 分域注册 — 已完成

- 建立 Library、Media、Player、Metadata、Importer 五个 Main 注册模块。
- 建立共享 `registerInvokeHandler`，统一注册前的旧 handler 清理。
- `electron/main.ts` 不再直接调用 `ipcMain.handle/removeHandler`。
- Main channel 统一从 `IPC_CHANNELS` 解析，并增加裸 channel 自动门禁。
- 业务实现函数、事务边界、返回模型和 Preload API 保持不变。

## 后续顺序

### U37：资源库与详情 UI — 当前阶段

#### U37-A：页面状态与错误恢复 — 已完成

- 新增 `LibraryPageState`，统一首页、音声库和音乐库的未连接、空资源库和正常内容状态。
- 新增 `LibraryRouteBoundary`，限制页面渲染异常并提供原地重试。
- AppRouter 为首页、音声库、RJ 详情和音乐库建立页面级边界。
- 无效 RJ 详情 ID 显示明确恢复入口。

#### U37-B：首页与音声库列表 — 当前任务

- 整理首页继续播放、最近加入和常用入口。
- 迁移音声库筛选工具栏、结果摘要、MediaCard/TrackRow。
- 增加作品多选、全选当前结果和批量加入歌单。
- 保留大库搜索索引和渲染窗口。

#### U37-C / U37-D：后续

- U37-C：RJ 详情、音轨列表、元数据和字幕状态。
- U37-D：音乐库、专辑/艺术家/文件夹详情与 U37 全矩阵验收。
- 详细范围见 `docs/architecture/U37_EXECUTION_PLAN.md`。

### U38：播放器与歌词 UI

- 经典、黑胶、歌词三种播放器。
- PlayerBar、队列、睡眠定时、字幕管理和后端状态。
- Motion、reduced-motion 和性能限制。

### U39：导入器、设置与维护 UI

- 导入预览、冲突、进度、失败、回滚和完成摘要。
- Settings 按职责拆分；AI 维护与日常层分离。
- 备份恢复、缺失文件、Provider、mpv 和导入历史维护界面。

### U40：质量门禁与历史清理

- TypeScript strict 逐目录收紧。
- ESLint/import 边界、循环依赖、浮动 Promise、裸 IPC 和新增 `any` 门禁。
- 删除旧 UI、废弃组件、历史兼容路径和字符串 verifier。

### U41：Beta 2 发布

- 目标：`0.169.0-beta.2`。
- 完整 Branch Validation、Electron E2E、portable/NSIS、安装/卸载、数据保留和资产回读。
- 原则上不增加大型业务功能。

## 当前执行优先级

1. 完成 U37-B 首页与音声库列表 UI。
2. 每个 PR 保持现有业务可运行，不留下跨轮不可用中间态。
3. 页面迁移时同步整理被触碰的业务模块。
4. 低风险相关工作批量处理，一个 PR 只执行一次最终完整门禁。
5. 不做脱离业务的长期纯后端重构，也不做只换颜色的表面换皮。

## 执行效率硬规则

```text
一次全局搜索
→ 批量修改
→ targeted 验证
→ 一个 PR
→ 一次最终完整门禁
→ squash merge
```

- 禁止逐个字符串失败反复推送完整 CI。
- 禁止新增隐藏 DOM、注释、`sr-only` 或 package metadata verifier 锚点。
- 文档任务使用轻量门禁。
- CI 和进度只在关键节点检查与汇报。
- 高风险文件事务、数据迁移、安装和发布继续严格验证。

## 功能冻结

Beta 2 完成前禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与 Beta 2 无关的大型 Provider。

这些功能不是取消，而是推迟到 Beta 2 完成后重新评估。

## Beta 2 完成门槛

- 现有核心功能无回归。
- 日常界面不再依赖旧视觉层。
- 深色、浅色、窗口/DPI、键盘和 reduced-motion 全矩阵通过。
- 三种播放器在真实 Electron 环境可用。
- 首次启动、Index 恢复、元数据编辑、导入失败/回滚和维护历史具备完整 UI。
- 模块依赖方向可由自动门禁验证。
- 不新增裸 IPC、跨层引用、循环依赖和未经说明的 `any`。
- portable、NSIS、安装、重复安装、卸载、用户数据保留、fallback 和进程退出通过。
- 发布资产、大小和 SHA-256 完成远端回读。

## AI 自主管理规则

用户不承担测试、排错、构建、Git、文档或发布操作。ChatGPT 负责规划、开发、自动测试、PR、合并和交付；Codex 只用于 CI 无法替代的 Windows 实机、驱动、声卡、显示缩放或安装器差异测试。

<!--
LEGACY_PROGRESS_VERIFIER_ANCHORS
以下文本仅供历史 U09～U27 verifier 识别，不代表当前执行状态。
核心版本：0.167.0-mvp129
U02～U08
U09
U10（已完成）
U11（已完成）
high / critical 依赖风险
逐 verifier TSV 报告
U12
U13
三主题合同
U14
U15
临时 UI 生命周期
U16
U17
U18
U19（已完成）
U20
辅助控制区
U20（已完成）
U21
进度轨道
U21（已完成）
U22
播放器事件
U22（已完成）
U23
展示模型聚合
PlayerBar 结构收口
U24
U25
日常层只展示用户实际会使用的功能
诊断、回归、工程状态
AI 维护
不得长期污染主界面
U26
U09～U26
资源库设置边界
优先使用独立布尔开关与顶层 `hidden`
不创建跨越现有条件块的新父容器
U27 已完成
最终结论 NO-GO
U28
MAJ-001
MAJ-002
真实 Index
MVP130
冻结
GitHub main
-->
