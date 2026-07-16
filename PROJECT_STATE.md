# PROJECT_STATE

## 当前状态

```text
核心版本：0.168.0-beta.1
代码事实来源：GitHub main
Beta 1：已发布并完成远端资产回读
当前阶段：Beta 2 规划与实施准备
下一条主线：代码结构/质量整备 + UI 全面重写
目标版本：0.169.0-beta.2
大功能：继续冻结，Beta 2 完成后重新评估
```

Yang-Kura 已经完成本地媒体库、播放、字幕、导入、元数据、维护和 Windows 发布主链。当前不是继续堆叠功能的阶段，而是把现有产品整理成可长期维护、可持续扩展、视觉上接近正式产品的 Beta 2。

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
- `v0.168.0-beta.1` GitHub prerelease 与三个资产的文件名、大小和 SHA-256 已完成远端校验。

## 当前产品判断

| 维度 | 判断 |
|---|---|
| 核心功能完整度 | 高，已具备日常本地媒体库主链 |
| Windows 可交付性 | Beta 可用，尚未代码签名 |
| 代码可维护性 | 中等，连续迭代后存在模块拥挤、职责交叉和历史门禁负担 |
| UI 视觉质量 | 不满足长期目标，需要重写设计系统、页面结构与动画 |
| 新增大功能条件 | 尚不具备，应先完成 Beta 2 整备 |

## 当前主线：Beta 2 联合整备

Beta 2 不是单纯换皮，也不是全项目推倒重写。执行原则：

```text
冻结现有业务行为
→ 审计代码和 UI
→ 建立分层、契约和设计系统
→ 分页面迁移 UI
→ 同步拆分被触碰的业务模块
→ 删除旧 UI 与废弃兼容层
→ 完整回归和 Windows 发布
```

### U34：联合审计与基线

- 代码依赖图、超大文件、复杂函数、循环依赖和重复逻辑。
- UI 页面、组件、交互、主题和动画审计。
- 建立不可破坏行为清单、性能基线和截图基线。
- 输出 `ARCHITECTURE_AUDIT.md`、`DEPENDENCY_MAP.md`、`REFACTOR_BACKLOG.md`。

### U35：架构边界与设计系统

- 建立 `app / features / domain / application / infrastructure / shared` 依赖方向。
- UI 必须遵守 `docs/DESIGN.md`。
- 建立语义 Token、暮夜琥珀深色主题、雾光象牙浅色主题。
- 建立统一按钮、菜单、抽屉、弹窗、媒体卡片、音轨行和反馈组件。

### U36：应用壳与契约统一

- 重写 App Shell、侧栏、顶栏、内容网格、搜索和全局弹层。
- Renderer、Preload、Main 的 IPC 类型只有一个事实来源。
- 清理裸 IPC 字符串、`any`、宽泛状态和重复 Store。

### U37：资源库与详情 UI 迁移

- 首页、音声库、RJ 详情、音乐库、专辑/艺术家详情。
- 多选、批量操作、高级筛选、空状态和错误恢复。
- 同步拆分资源库、元数据和 Provider 的被触碰模块。

### U38：播放器与歌词 UI 迁移

- 经典、黑胶、歌词三种播放器。
- PlayerBar、队列、睡眠定时、字幕管理、后端状态。
- Motion 动画系统、reduced-motion 和性能限制。
- 同步整理 PlayerController、PlaybackBackend、Queue、Subtitle 边界。

### U39：导入器、设置与维护 UI

- 导入预览、冲突处理、执行进度、失败、回滚和完成摘要。
- 设置按职责拆分；AI 维护与日常层彻底分离。
- 备份恢复、缺失文件、Provider/mpv/导入历史的维护界面。

### U40：质量门禁与清理

- TypeScript strict 逐目录收紧。
- ESLint/import 边界、循环依赖、浮动 Promise、裸 IPC 和新增 `any` 门禁。
- 删除旧 UI、废弃组件、历史兼容路径和无价值 verifier 字符串断言。
- 核心 Domain/Application 测试优先，不追求无意义 100% 覆盖率。

### U41：Beta 2 发布

- 版本目标：`0.169.0-beta.2`。
- 完整 Branch Validation、Electron E2E、Windows portable/NSIS、安装/卸载、数据保留和资产回读。
- Beta 2 原则上不增加大型业务功能。

## 当前执行优先级

1. **先做 U34 联合审计。** 不应先把原型 UI 直接覆盖正式代码。
2. **随后并行推进架构边界与设计系统。** UI 重写必须依赖稳定组件/契约基础。
3. **按页面纵向迁移。** 每迁移一个页面，同步整理该页面触碰的业务模块。
4. **不单独做长期纯后端重构，也不单独做脱离业务的纯视觉换皮。**

## 功能冻结

Beta 2 完成前禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2 或原生音频内核重写；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、插件市场和在线服务；
- 与 Beta 2 无关的大型 Provider。

这些功能不是取消，而是推迟到 Beta 2 完成并重新评估之后。

## Beta 2 完成门槛

- 现有核心功能无回归。
- 新旧 UI 完成迁移，日常界面不再依赖旧视觉层。
- 深色、浅色、窗口/DPI、键盘和 reduced-motion 全矩阵通过。
- 三种播放器均可在真实 Electron 环境使用。
- 重要二级流程具备完整 UI：首次启动、Index 恢复、元数据编辑、导入失败/回滚、维护历史。
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
