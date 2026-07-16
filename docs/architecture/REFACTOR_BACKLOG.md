# Yang-Kura Beta 2 重构待办

> 排序原则：先消除高耦合和契约漂移，再迁移页面；不为了目录整齐而搬代码。  
> P0 必须在对应纵向迁移前完成；P1 在 Beta 2 内完成；P2 可在 Beta 2 后评估。

## P0：Beta 2 基础阻断项

| ID | 任务 | 当前问题 | 目标阶段 | 验收标准 |
|---|---|---|---|---|
| ARC-001 | 建立共享 IPC 契约与 channel registry | main、preload、electron-api 三套类型和裸字符串并存 | U35/U36 | 新 IPC 只在共享目录定义一次；三端编译使用同一类型；禁止新增裸 channel |
| ARC-002 | 拆分 `electron/main.ts` | 约 4,800 行级，几乎所有本机能力集中 | U36～U39 | 入口只保留生命周期、窗口和模块注册；library/player/importer/metadata/maintenance 分域 |
| ARC-003 | 拆分 Settings | 3,500 行以上，日常设置、维护和历史记录混合 | U35/U39 | Appearance、Playback、Library、Importer、Maintenance 独立组件；日常页不 import 历史服务 |
| ARC-004 | 拆分/归档 Diagnostics 历史层 | 运行时页面保存大量 MVP 合同和旧 UI 报告 | U35/U39/U40 | 当前维护能力独立；历史展示不进入日常 bundle；无新增隐藏锚点 |
| ARC-005 | 拆分 App Shell 与用例 | App 同时负责路由、数据加载、元数据、歌单、播放器和弹层 | U35/U36 | AppShell 只组合路由/布局/全局弹层；业务操作进入 feature controller/application service |
| ARC-006 | 拆分播放器中央 hook | `useAudioPlayer` 同时处理两后端、队列、历史、字幕和持久化 | U38 | Controller、HTMLAudio adapter、mpv client、queue/history persistence、subtitle loader 可单测 |
| QLT-001 | IPC 运行时参数校验 | main 使用 `request as Partial<T>` 后手工判断 | U35/U36 | 共享 validator 返回明确 `Result`；无未经校验 payload 进入服务层 |
| TST-001 | 分离当前行为测试与历史兼容 | stable regression 临时改写 package 版本并运行大量旧 verifier | U35/U40 | 当前稳定链只验证现行行为；历史 verifier 独立归档且不改写 package.json |
| CI-001 | 建立风险分级 CI | 文档变更触发完整 E2E/打包/发布验证 | U34 | 文档轻量门禁；产品代码完整回归；打包/发布仅由相关路径触发 |
| UI-001 | 建立正式语义 Design Token | 当前主题仍是旧三主题并含页面内颜色常量 | U35 | 暮夜琥珀、雾光象牙使用同一语义 token；组件不硬编码主题色 |

## P1：Beta 2 内必须完成

| ID | 任务 | 目标阶段 | 验收标准 |
|---|---|---|---|
| TYP-001 | TypeScript strict 按目录启用 | U35～U40 | 新目录 strict；迁移模块无新增 `any`、非空断言或宽泛错误 |
| TYP-002 | 拆分 `src/types.ts` | U35～U38 | Domain、UI、Index、Settings、Playback 类型分域；删除过时“future model”注释 |
| LEG-001 | 归档历史 runtime service | U40 | 只被旧 verifier/历史 UI 使用的 service 移出活跃运行时目录 |
| LEG-002 | 缩减 `src/services/index.ts` | U35/U40 | 按域 barrel；禁止全量聚合历史服务 |
| PKG-001 | 移出 package 历史数据库 | U40 | `package.json` 仅保留构建所需元数据；MVP 说明进入 archive/docs |
| APP-001 | 明确资源库权威状态源 | U36/U37 | Index read/apply 不再依赖多处 localStorage + window event 隐式联动 |
| APP-002 | 明确设置仓库 | U35/U36 | 设置 schema、默认值、迁移和隐私清洗集中管理 |
| APP-003 | 明确事件机制 | U36 | 使用受控事件总线或显式订阅；事件名称集中；不自动引入 Redux |
| LIB-001 | Library repository/use cases | U37 | 页面不直接操作 Index cache；加载、刷新、恢复和健康状态有统一接口 |
| META-001 | 元数据覆盖与 Provider 边界 | U37 | 本地覆盖、Provider preview、选择性应用和恢复各自职责清晰 |
| PLY-001 | Player state machine | U38 | 播放状态转换可测试；mpv/HTMLAudio fallback 不由 UI 组件拼接 |
| PLY-002 | Queue/History/Persistence 分离 | U38 | 队列操作、历史保存、续播与 backend 无直接耦合 |
| SUB-001 | Subtitle service | U38 | 加载、格式归一、语言切换、偏移和错误状态独立 |
| IMP-001 | Import application workflow | U39 | preview/readiness/execute/rollback/index-refresh 由用例协调，不由页面串接裸 IPC |
| MNT-001 | AI Maintenance 独立功能域 | U39 | Index、Provider、mpv、Importer 历史集中；设置页只保留用户配置入口 |
| UI-002 | 新 App Shell | U36 | 侧栏、顶栏、搜索、内容网格和全局弹层遵守 DESIGN.md |
| UI-003 | 新基础组件 | U35 | Button、Dialog、Drawer、MediaCard、TrackRow、Feedback、EmptyState 可复用并可访问 |
| UI-004 | 三播放器正式实现 | U38 | 经典/黑胶/歌词角色不同，均覆盖真实 backend/queue/subtitle 状态 |

## P2：Beta 2 后评估

| ID | 候选项 | 前置条件 |
|---|---|---|
| DATA-001 | SQLite 全面迁移 | Beta 2 稳定观察证明 JSON 查询/并发已成为真实瓶颈 |
| PLY-003 | Player Core v2 | 当前 controller/backends 分层完成且有实际新增需求 |
| DL-001 | 正式下载器 | Beta 2 发布和稳定观察完成；Importer 边界稳定 |
| ASR-001 | Arsm_Transcribe Worker 接入 | Worker manifest、任务治理和回收合同完成 |
| REMOTE-001 | OpenList/WebDAV | 本地资源库模型稳定，且不破坏 token/隐私边界 |
| AI-001 | 完整 AI Agent | Maintenance API 稳定、权限和操作预览明确 |

## 执行批次

为避免再次过度拆分，Beta 2 按 7 个有效批次推进：

```text
B2-1：U34 审计与流程修正
B2-2：U35 共享契约 + Design System + Settings/Maintenance 边界
B2-3：U36 App Shell + IPC/状态统一
B2-4：U37 首页/资源库/详情纵向迁移
B2-5：U38 三播放器/歌词纵向迁移
B2-6：U39 导入器/设置/维护纵向迁移
B2-7：U40 历史清理 + U41 Windows 发布
```

预计约 **9～13 个有效开发轮次**。低风险且同一用户链路上的修改默认合并处理。

## 每轮完成条件

- 只触碰本轮纵向切片及必要共享基础；
- 现有不可破坏行为通过相关专项测试；
- 不增加新的历史字符串锚点；
- 不把旧代码和新代码长期双轨并存；
- PR 收口时只执行一次完整稳定回归；
- 合入后仓库保持可运行，不留下“以后再接”的不可用中间态。
