# PROJECT_STATE

## 当前状态

```text
核心版本：0.167.0-mvp129
代码事实来源：GitHub main
已合入主线：U02～U29
当前完成候选：U30 日常 UI、三主题、窗口、DPI 与键盘验收
下一任务：U31 导入器与数据安全
剩余主线：U31～U33
MVP130：独立实验下载器，继续冻结，禁止合入
```

GitHub `main` 是唯一代码事实来源。长期文档不固定未来基线 SHA；每轮验收报告必须记录实际被测 HEAD、Actions run 和产物。

## AI 自主管理规则

> 用户不承担测试、排错、构建、Git 操作或验收组织，只接收最终成果。

默认分工：

1. ChatGPT 负责需求拆解、架构、代码、自动测试、Windows CI、Electron UI 自动化、截图审查、回归、Git、PR、文档、合并与最终交付。
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

### U09～U23：结构与质量

- 播放器生命周期、歌词时间线、依赖门禁、侧栏导航和三主题合同。
- PlayerBar 纯逻辑、临时 UI、主展示区、辅助控制、进度轨道和展示模型拆分。
- 全部改动保持渐进式，不进行全项目重写。

### U24～U26：日常 UI 去工程化

- 下载规划、诊断、检修、回归和工程状态退出日常视觉层。
- AI 维护入口默认折叠；资源库检修使用独立可见性开关。

### U27：Windows GUI 验收

U27 最终为 `NO-GO`，发现：

- `MAJ-001`：原生目录授权、Index、页面计数和浏览状态断裂。
- `MAJ-002`：诊断页仍以 Demo 状态冒充真实资源状态。

该结论作为历史证据保留，不代表当前状态。

### U28：资源库授权与真实 Index 闭环

U28 已完成并合入 `main`：

- 原生目录授权、当前窗口安全 token、设置页、Index 读取、首页、资源库、PlayerBar 和诊断统一为同一会话快照。
- 合法空 Index 与读取失败严格区分。
- UTF-8、UTF-8 BOM、UTF-16 LE/BE BOM 与 JSON/文件系统错误分类完成。
- 真实 Electron E2E 覆盖未授权、空 Index、损坏 JSON、非空 Index、媒体协议、播放和重启授权边界。
- `MAJ-001`、`MAJ-002` 已关闭。

### U29：播放器、队列、续播与字幕全流程

U29 已完成实现和自动化验收：

- HTMLAudio 与 mpv 使用同一真实续播起点。
- Seek、队列、重启恢复、新授权 token 对账和完成状态统一。
- 播放历史、首页状态和 LRC/SRT/VTT/ASS/双语/无字幕通过 Windows Electron E2E。

详细证据见 `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`。

### U30：日常 UI、三主题、窗口、DPI 与键盘

U30 已完成实现和自动化验收：

- 1040×680、1280×800、1600×900 三档窗口/DPI 矩阵无横向溢出或 PlayerBar 遮挡。
- dark、acrylic-mist、ocean-drops 三主题通过截图与 DOM 布局检查。
- 现代队列恢复时不再重复显示旧版续播提示。
- 队列支持 Escape 关闭并把焦点返回触发按钮；全屏歌词继续支持 Escape。
- reduced-motion 和全局 focus-visible 合同完成。
- 窄窗口保留真实资源库状态文本，只做截断，不隐藏状态。
- U28、U29、U30 Electron E2E、全部 verifier、稳定回归和最终生产构建同时通过。

详细证据见 `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`。

## 历史质量事实与 verifier 兼容合同

以下已完成事实继续保留，防止后续文档更新误删历史质量合同：

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
- U24（已完成）：下载规划和诊断工具进入默认折叠的 AI 维护。
- U25（已完成）：历史工程卡、命令行说明和回归状态退出日常视觉层。
- U26（已完成）：资源库设置边界使用独立布尔开关与顶层 `hidden` 安全收口；U09～U26 结构、质量与日常 UI 增量完成。
- U27 已完成：最终结论 NO-GO；历史 `CONDITIONAL GO` 已被真实音声库补测覆盖，MAJ-001、MAJ-002 转入 U28 真实 Index 修复并关闭。

历史 UI 硬规则原文继续有效：

> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。

## 当前阶段

```text
U28 资源库闭环：完成
→ U29 播放器与字幕全流程：完成
→ U30 日常 UI、三主题、窗口、DPI、键盘：完成
→ U31 导入器与数据安全
→ U32 Windows 发布候选验收
→ U33 版本与 Beta 发布
```

## 后续仍需完成

1. **U31**：copy-only、临时副本上的 move-only、冲突与不覆盖、OperationLog、Index 备份恢复和失败回滚。
2. **U32**：strict smoke、实际 mpv Windows acceptance、portable、NSIS、安装升级卸载、中文/空格路径、用户数据保留、残留进程和 SHA-256。
3. **U33**：关闭或记录 Blocker/Major、版本号、Release Notes、tag、产物 SHA-256 和新 Beta 发布。

## 自动验证与冻结项

每个 PR 必须执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
TypeScript 与 Electron 构建
U28/U29/U30 Electron E2E
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

冻结项：

- 禁止为了整洁进行全项目重构。
- SQLite 全面迁移、系统媒体控制、完整 AI Agent、OpenList/WebDAV、Player Core v2 和全局 CSS 重写仅在 U33 之后按明确需求启动。
- MVP130 下载器继续冻结，禁止自动合入主线。
