# PROJECT_ROADMAP

> **文档定位：Yang-Kura 唯一长期开发路线真源。**
>
> 代码事实以最新 GitHub `main` 为准；当前执行状态见 `PROJECT_STATE.md`；UI 规则见 `docs/DESIGN.md`；固定协作分工见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 1. 文档优先级

1. GitHub `main`：唯一代码事实来源。
2. `PROJECT_STATE.md`：当前版本、完成事实和当前任务。
3. `PROJECT_ROADMAP.md`：长期顺序、冻结项和发布门槛。
4. `docs/DESIGN.md`：UI、主题、组件、动画和页面规则。
5. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`：新对话接手入口。
6. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`：AI、Codex 与用户的固定分工。

## 2. 当前基线

```text
版本：0.168.0-beta.1
Beta 1：已发布并完成远端资产校验
已完成主线：U02～U33
当前计划：U34～U41 Beta 2 联合整备
Beta 2 目标：0.169.0-beta.2
大功能：Beta 2 完成前继续冻结
```

## 3. 长期产品目标

Yang-Kura 是面向 Windows 的个人本地音频媒体库：

- ASMR/RJ 音声库；
- 普通本地音乐库；
- 统一 Track 播放器；
- 字幕与歌词；
- 导入、元数据和资源维护；
- 后续可扩展下载、转录、远端资源和更稳定数据层。

当前阶段不追求功能数量，而追求：

```text
现有能力可信
+ 代码可长期维护
+ UI 达到正式产品质量
+ 后续模块可独立接入
```

## 4. 已完成阶段

### 阶段 A：核心媒体能力

- Electron Windows 桌面壳与安全路径 token。
- Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ、普通音乐、首页、详情、收藏、歌单、队列和历史。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复与 DLsite 单 RJ Provider。
- 50,000 曲目性能基准。

### U02～U26：产品化、结构与日常 UI

- 干净配置、中文、键盘焦点、弹窗和全屏播放。
- PlayerBar 渐进拆分、主题合同和稳定回归。
- 工程信息、诊断和历史工具退出日常界面。

### U27～U32：真实 Windows 闭环

- U27 暴露资源库和 Demo 问题。
- U28 完成目录授权、Index、浏览和播放闭环。
- U29 完成播放器、Seek、队列、续播和字幕全流程。
- U30 完成主题、窗口、DPI、键盘和可访问性矩阵。
- U31 完成导入事务、失败回滚和数据安全。
- U32 完成发布候选 UI、portable、NSIS、安装/卸载、数据保留和 SHA-256。

### U33：Beta 1 发布

- 版本：`0.168.0-beta.1`。
- Tag：`v0.168.0-beta.1`。
- GitHub prerelease、portable、setup、`SHA256SUMS.txt` 已发布。
- 远端资产名、大小、目标提交和 SHA-256 已固化并校验。
- 发布工作流已具备幂等恢复与故障证据。

## 5. 当前主线：Beta 2 联合整备

### 总体策略

不采用以下极端路线：

- 只重构代码，长期看不到产品改善；
- 只替换 UI，继续依赖混乱状态和跨层调用；
- 全项目推倒重写；
- 一次性迁移 SQLite、播放器内核和 UI。

采用纵向切片：

```text
审计
→ 稳定契约与设计系统
→ App Shell
→ 资源库/详情
→ 播放器/歌词
→ 导入/设置/维护
→ 清理与质量门禁
→ Beta 2 发布
```

### U34：联合审计与不可破坏基线

目标：先确认真实结构和 UI 问题，不凭感觉重构。

交付：

- `docs/architecture/ARCHITECTURE_AUDIT.md`
- `docs/architecture/DEPENDENCY_MAP.md`
- `docs/architecture/REFACTOR_BACKLOG.md`
- 核心用户流程与不可破坏行为清单
- 构建、测试、包体、性能和截图基线
- 文件/函数复杂度、循环依赖、重复代码和跨层引用报告

U34 不改变产品行为。

### U35：架构边界与 Design System

目标结构：

```text
src/
├─ app/                 启动、路由、顶层组合
├─ features/            页面和用户功能
├─ domain/              领域模型和业务规则
├─ application/         用例、协调服务和事务
├─ infrastructure/      Electron、文件系统、Index、mpv、Provider
├─ shared/              契约、工具和基础 UI
└─ tests/               fixtures、harness 和测试工具
```

依赖方向：

```text
UI / Adapter → Application → Domain
Infrastructure 实现 Domain/Application 接口
```

设计侧：

- `docs/DESIGN.md` 成为规则级事实源。
- 建立语义 Token，而不是页面内颜色常量。
- 首发主题：暮夜琥珀、雾光象牙。
- 建立组件、图标、排版、间距、密度、阴影、反馈和 Motion 规范。

### U36：App Shell、状态与 IPC 契约 — 已完成

- 重写桌面应用壳、导航、全局搜索、弹层和内容网格。
- Renderer/Preload/Main 共用唯一 IPC 契约。
- 裸 channel、重复类型和宽泛 payload 退出主线。
- 逐步清理 `any`、非空断言和重复状态源。
- 加入运行时参数校验和明确错误模型。

### U37：资源库与详情纵向迁移 — 当前阶段

详细执行计划：`docs/architecture/U37_EXECUTION_PLAN.md`。

- **U37-A（完成）**：页面状态、空资源库、无效详情选择和渲染错误恢复。
- **U37-B（当前）**：首页、音声库列表、筛选工具栏、MediaCard/TrackRow、多选与低风险批量操作。
- **U37-C**：RJ 详情、音轨列表、元数据编辑、DLsite 字段选择性应用和字幕状态。
- **U37-D**：音乐库、专辑/艺术家/文件夹详情、批量加入队列/收藏和 U37 全矩阵验收。

同步整理：LibraryRepository、Index Reader/Writer、Metadata、Provider 和页面状态边界。

### U38：播放器与歌词纵向迁移

三种正式模式：

1. 经典：高效率日常播放。
2. 黑胶：沉浸式封面/唱片体验。
3. 歌词：日文、中文、双语与字幕管理。

必须覆盖：

- PlayerBar、队列、下一首播放、拖拽和移除；
- 睡眠定时、播放完成策略、后端/fallback 状态；
- 字幕来源、偏移、重新关联、无字幕状态；
- reduced-motion、键盘、焦点返回和窗口适配。

同步整理：PlayerController、PlaybackBackend、QueueService、PlaybackPersistence、SubtitleService。

### U39：导入器、设置与 AI 维护纵向迁移

导入器：

- 来源选择、识别、目标树、冲突、确认、执行、取消、失败、回滚、完成摘要。
- copy/move 安全语义必须与现有事务保持一致。

设置：

- 外观、资源库、播放、字幕、导入和高级设置分区。
- 设置搜索、恢复默认和导入/导出可后置为 P2。

AI 维护：

- 缺失文件、Index 备份/恢复、Provider、mpv、导入历史和版本日志。
- 日常界面不得显示 verifier、MVP、命令行或绝对路径。

### U40：质量门禁、历史清理与文档

- TypeScript strict 按目录逐步收紧。
- 新增跨层引用、循环依赖、浮动 Promise、裸 IPC 和 `any` 自动阻断。
- 复杂度/文件规模超限产生报告；高风险区域必须拆分或说明。
- 删除旧 UI、废弃组件、重复工具和不再执行的兼容路径。
- 历史 MVP verifier 归档，日常门禁转为行为测试和稳定合同。
- 建立架构、数据流、IPC、错误模型、测试策略和扩展指南。

### U41：Beta 2 发布

目标版本：`0.169.0-beta.2`。

必须通过：

- TypeScript、Electron、依赖审计和稳定回归；
- U28～U32 现有真实功能门禁；
- 新 App Shell、主题、三播放器和主要页面 E2E；
- 深色/浅色、三档窗口/DPI、键盘、焦点和 reduced-motion；
- portable、NSIS、安装、重复安装、卸载、数据保留和进程退出；
- Release 资产名、大小、下载 URL 和 SHA-256 回读。

## 6. 执行顺序和预计轮次

| 阶段 | 预计轮次 | 说明 |
|---|---:|---|
| U34 | 1～2 | 只审计和建立基线 |
| U35 | 2 | 架构边界 + Design System |
| U36 | 2 | App Shell + IPC/状态契约 |
| U37 | 3～4 | 资源库和详情迁移 |
| U38 | 3～4 | 三播放器和歌词迁移 |
| U39 | 2～3 | 导入器、设置和维护迁移 |
| U40 | 2 | 门禁、清理和文档 |
| U41 | 1～2 | Windows 发布与回读 |

总计约 **16～21 个开发轮次**。可合并低风险相关任务，但不得牺牲行为回归和数据安全。

## 7. 大功能冻结

Beta 2 完成前继续冻结：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- Arsm_Transcribe 正式接入；
- 云同步、在线账号和插件市场；
- 与 Beta 2 无关的大型 Provider。

## 8. Beta 2 后路线

Beta 2 完成后先进入短期稳定观察，再按收益/风险重新排序：

1. Blocker/Major 修复。
2. 正式 1.0 发布准备。
3. 下载器、SQLite、转录 Worker、远端资源或播放器增强只能选一条主线启动。
4. 不从历史待办自动恢复全部项目。

## 9. 上线门槛

Beta 2 可视为“个人长期使用上线候选”，但正式 `1.0.0` 仍需：

- 至少一轮真实日常库连续使用观察；
- 无数据丢失、索引损坏、导入回滚或双重播放 Blocker；
- 首次启动、升级、卸载、备份恢复和 fallback 可重复；
- 已知限制和数据备份说明清晰；
- 决定是否接受无代码签名的 SmartScreen 提示，或为正式公开分发补代码签名。

## 10. 自主管理与快速通道

用户只接收最终成果，不承担测试、排错、Git 或发布操作。ChatGPT 负责实现、测试、文档、PR、合并和发布；Codex 仅用于 CI 无法替代的 Windows 实机、显示缩放、声卡/驱动或安装器差异验证。