# PROJECT_STATE

## 当前状态

```text
核心版本：0.168.0-beta.1
代码事实来源：GitHub main
Beta 1：已发布并完成远端资产回读
U34～U36：架构基础与契约整备完成
U37-A：资源库页面状态与错误恢复完成
U37-B：首页与音声库列表 UI 完成
U37-C：RJ 详情 UI 完成
当前任务：U37-D 音乐库与详情 UI
发布条件：媒体库正式页面完成 + 核心回归与 Windows 发布候选通过
大型功能：长期冻结，除非用户明确重新解冻
```

Yang-Kura 已具备本地媒体库、播放、字幕、导入、元数据、维护和 Windows 发布主链。项目仅供个人本地使用，不商业化、不对外分享。当前目标是完成正式音乐库与详情页面并尽快投入日常使用；发布后持续修 Bug、优化 UI/性能/播放体验并解决技术债。

## 开放跟踪

- [Issue #65：完成媒体库并发布个人日用版](https://github.com/5788324/Yang-Kura/issues/65)
- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

## 已完成的产品能力

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only 与受控 move-only 导入事务、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- 缺失文件、受控索引清理、备份保留和维护历史。
- 50,000 曲目生成数据性能基准。
- portable、NSIS、安装、重复安装、卸载、数据保留和进程回收。
- `v0.168.0-beta.1` prerelease 与三个资产完成远端文件名、大小和 SHA-256 校验。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，日常本地媒体库主链已存在 |
| Windows 可交付性 | Beta 可用，尚未代码签名 |
| UI 状态 | 正式首页、音声库和 RJ 详情已迁移；音乐库与主要钻取页面待完成 |
| 技术债 | 必须持续解决，采用渐进式拆分，不进行全项目推倒重写 |
| 上线条件 | U37-D 完成并通过核心回归与 Windows 发布候选 |
| 大功能 | 长期冻结，不从历史待办自动恢复 |

## 已完成的架构整备

### U34：审计与交付规则

- 输出 `ARCHITECTURE_AUDIT.md`、`DEPENDENCY_MAP.md`、`REFACTOR_BACKLOG.md`。
- 确认 Main、Settings、Diagnostics、播放器 Hook、IPC 重复和历史 verifier 是主要负债。
- 固定渐进拆分、行为冻结和快速交付规则。
- 文档任务改走轻量门禁。

### U35：共享契约与 Design System

- 建立唯一 `IPC_CHANNELS`、`IpcResult<T>` 和 `IpcError`。
- 建立暮夜琥珀、雾光象牙语义 Token。
- 新增 AppShell、Button、Surface、Feedback、Dialog、Drawer、MediaCard、TrackRow。
- 两套正式主题投入生产运行。
- TopBar、Sidebar、内容区、PlayerBar、队列和续播提示接入语义样式。

### U36：App Shell 与 IPC 边界

- 建立 `src/app/navigation.ts` 页面元数据事实源。
- Sidebar 改用统一导航注册表。
- Preload 请求类型拆到 `electron/preload/contracts.ts`。
- 新增 `TopBar.tsx`、`AppRouter.tsx`、`QueueDrawer.tsx`、`PlayerOverlayHost.tsx`。
- Main 注册层按 Library、Media、Player、Metadata、Importer 分域。
- `electron/main.ts` 不再直接拥有 `ipcMain.handle/removeHandler`。
- Index、播放、字幕、元数据、导入事务和路径安全语义保持不变。

## U37：媒体库正式页面

### U37-A：已完成

- 页面连接状态统一分类。
- 首页、音声库、RJ 详情和音乐库具备页面级错误隔离和原地重试。
- 无效 RJ 详情 ID 有明确恢复入口。

### U37-B：已完成

- 正式 `HomeLibraryPage` 替换旧首页生产路由。
- 正式 `AsmrLibraryPage` 替换旧音声库生产路由。
- 支持搜索、排序、社团/声优/标签/来源/字幕/播放/个人状态筛选。
- 网格和列表使用共享 `MediaCard`、`TrackRow`。
- 支持作品多选、全选当前结果和批量加入歌单。
- 保留大库搜索索引、渲染窗口、root token、相对路径和元数据覆盖语义。

### U37-C：已完成

- 新增 `src/features/library/RjDetailPage.tsx`，替换旧 RJ 详情生产路由。
- Hero、作品信息、播放入口、字幕覆盖和文件健康信息使用正式语义层级。
- 音轨列表使用共享 `TrackRow`，保留播放、队列、收藏、外部打开和文件管理器定位。
- 新增 `RjMetadataDialog.tsx`，保留本地覆盖、清除覆盖、DLsite 查询、差异预览和字段选择性应用。
- 评分、听音状态和个人笔记写入本地覆盖层，不修改媒体文件。
- 无音轨、无字幕、资源警告、Provider 失败和失效详情均有恢复状态。

### U37-D：当前任务

- 迁移歌曲、专辑、艺术家、文件夹四种视图及其钻取页面。
- 统一工具栏、搜索、筛选、排序和页面状态。
- 补齐多选、批量加入队列、收藏筛选和外部打开反馈。
- 完成媒体库深色/浅色、小窗口、键盘、空状态和 Electron 回归矩阵。
- 同步拆分音乐库与钻取页面被触碰的高耦合逻辑，不保留长期双轨实现。

## 个人日用版发布

U37-D 完成后，不再等待所有后续 UI/架构阶段才允许使用。满足以下条件即可发布个人日用版本：

1. 首页、音声库、RJ 详情、音乐库和主要钻取页面使用正式 UI；
2. 本地扫描、Index、播放、字幕、歌单、队列、导入、元数据和维护能力无回归；
3. 没有数据丢失、索引损坏、导入回滚失败、双重播放等阻断问题；
4. portable、NSIS、安装、卸载、数据保留和进程回收通过；
5. 已知限制写入发布说明。

发布后进入长期日用维护：

```text
真实使用 Bug
→ 日常体验、性能和 UI 优化
→ 持续技术债治理
→ 必要的小功能补全
```

三播放器深度重写、设置/维护 UI 重构、历史清理和质量门禁继续推进，但不再作为首次日用发布的统一阻断条件。

## 技术债治理

技术债跟踪见 Issue #66。优先处理：

- `electron/main.ts` 继续按领域下沉实现；
- `SettingsPage.tsx` 拆分日常设置与 AI 维护；
- `DiagnosticsPage.tsx` 归档历史运行时内容；
- `useAudioPlayer.ts` 拆分 Controller、Backend、Queue/History、Subtitle 和持久化；
- `src/types.ts` 按领域拆分；
- 历史 MVP verifier 和 package 元数据退出日常运行时；
- 新目录与迁移目录逐步收紧 TypeScript strict；
- 自动阻断新增裸 IPC、跨层引用、循环依赖和未经说明的 `any`。

处理方式：修改哪个用户链路，就同步整理该链路。禁止为了目录整齐而搬代码，也禁止长期保留旧实现和新实现双轨并存。

## 执行效率与风险分级

项目仅供个人使用，不建立企业级权限、审批、遥测、合规或多人协作体系。

```text
一次全局搜索
→ 批量修改相关任务
→ targeted 验证
→ 一个 PR
→ PR 收口时一次稳定回归
→ squash merge
```

- 小型 UI、文案、局部逻辑、测试和文档默认合并处理。
- 不为每个小修改重复运行完整 Windows、portable、NSIS 和发布链。
- 真实文件删除/移动/覆盖、数据迁移、安装和发布仍使用临时目录或副本、备份、回滚和专项验收。
- 数据安全门槛只保留与真实个人媒体库损坏直接相关的部分。

## 长期冻结

除非用户以后明确重新解冻，否则禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

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
