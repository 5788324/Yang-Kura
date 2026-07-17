# Yang-Kura Beta 2 重构待办

> 排序原则：先消除高耦合和契约漂移，再迁移页面；不为了目录整齐而搬代码。  
> 当前版本已发布，待办采用渐进式治理，不重新恢复历史大阶段。

## P0：高风险结构项

| ID | 任务 | 当前问题 | 验收标准 |
|---|---|---|---|
| ARC-001 | 共享 IPC 契约与 channel registry | 已完成基础分域 | 新 IPC 只定义一次；禁止新增裸 channel |
| ARC-002 | 拆分 `electron/main.ts` | 生命周期和多个本机能力仍集中 | 入口只保留生命周期、窗口和模块注册 |
| ARC-003 | 拆分 Settings | 日常设置、维护和历史内容混合 | 日常页不 import 历史服务 |
| ARC-004 | 拆分/归档 Diagnostics 历史层 | 运行时仍保留历史验证展示 | 历史展示不进入日常 bundle |
| ARC-005 | 拆分 App Shell 与用例 | 已完成主要 Router/AppShell 边界 | 页面不承担跨域业务编排 |
| ARC-006 | 拆分播放器中央 Hook | Queue、Persistence 与 Backend 已拆分，Subtitle 待处理 | Controller、Backend、Persistence、Subtitle 边界可独立验证 |
| QLT-001 | IPC 运行时参数校验 | 部分 Main 处理仍手工判断 | 未校验 payload 不进入服务层 |
| TST-001 | 分离当前行为测试与历史兼容 | stable regression 仍包含历史兼容层 | 当前稳定链优先验证现行行为 |

## P1：持续治理

| ID | 任务 | 验收标准 |
|---|---|---|
| TYP-001 | TypeScript strict 按目录启用 | 新目录无新增 `any` 或宽泛跨层类型 |
| TYP-002 | 拆分 `src/types.ts` | Domain、UI、Index、Settings、Playback 类型分域 |
| LEG-001 | 归档历史 runtime service | 历史服务不进入日常运行时 |
| LEG-002 | 缩减 `src/services/index.ts` | 按领域导出，禁止历史服务全量聚合 |
| PKG-001 | 移出 package 历史数据库 | package 只保留构建所需元数据 |
| APP-001 | 明确资源库权威状态源 | Index read/apply 不依赖多处隐式联动 |
| APP-002 | 明确设置仓库 | schema、默认值、迁移和隐私清洗集中 |
| APP-003 | 明确事件机制 | 事件名称集中，订阅显式 |
| LIB-001 | Library repository/use cases | 页面不直接操作 Index cache |
| META-001 | 元数据覆盖与 Provider 边界 | 本地覆盖、预览、应用和恢复职责清晰 |
| PLY-001 | Player Controller/Backend | U38-B 已完成；UI 不拼接 mpv/HTMLAudio fallback |
| PLY-002 | Queue/History/Persistence | U38-A 已完成；与 Backend 无直接耦合 |
| SUB-001 | Subtitle service | U38-C：请求、取消、结果映射和错误状态独立 |
| IMP-001 | Import application workflow | preview/readiness/execute/rollback/index-refresh 由用例协调 |
| MNT-001 | AI Maintenance 独立功能域 | 设置页只保留用户配置入口 |

## 长期冻结候选

| ID | 候选项 | 前置条件 |
|---|---|---|
| DATA-001 | SQLite 全面迁移 | JSON 已成为真实瓶颈且用户明确解冻 |
| PLY-003 | Player Core v2 | 当前分层完成且有实际新增需求 |
| DL-001 | 正式下载器 | 用户明确解冻 |
| ASR-001 | Arsm_Transcribe Worker 接入 | 用户明确解冻且 Worker 合同完成 |
| REMOTE-001 | OpenList/WebDAV | 本地资源模型稳定且用户明确解冻 |
| AI-001 | 完整 AI Agent | Maintenance API 稳定且用户明确解冻 |

## 每轮完成条件

- 只触碰本轮纵向切片及必要共享基础；
- 现有不可破坏行为通过相关专项测试；
- 不增加隐藏 DOM、HTML 注释或 package 元数据锚点；
- 不把旧代码和新代码长期双轨并存；
- PR 收口执行完整稳定回归；
- 合入后仓库保持可运行。

## U38 维护进度

- PLY-002 Queue/History/Persistence：U38-A 已完成。
- PLY-001 Controller/Backend：U38-B 已完成。
- ARC-006 中央 Hook 拆分：Queue/Persistence 与 Backend 已完成；U38-C Subtitle loader 与字幕状态继续。
- SUB-001 Subtitle service：当前 U38-C。
