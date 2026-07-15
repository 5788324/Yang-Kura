# PROJECT_STATE

## 当前状态

```text
核心版本：0.167.0-mvp129
代码事实来源：GitHub main
已合入主线：U02～U30
当前完成候选：U31 导入器事务与数据安全
下一任务：U32 Windows 发布候选验收
剩余主线：U32～U33
MVP130：独立实验下载器，继续冻结，禁止合入
```

GitHub `main` 是唯一代码事实来源。长期文档不固定未来基线 SHA；每轮验收报告记录实际被测 HEAD、Actions run 和产物。

## AI 自主管理规则

> 用户不承担测试、排错、构建、Git 操作或验收组织，只接收最终成果。

1. ChatGPT 负责需求拆解、架构、代码、自动测试、Windows CI、Electron UI 自动化、截图审查、回归、Git、PR、文档、合并与最终交付。
2. 能通过代码、临时样本、GitHub Actions、Electron/CDP 或其他自动化完成的验证，由 ChatGPT 自己闭环。
3. 只有真实安装器、硬件、驱动、系统对话框或其他 CI 无法替代的系统集成才交给 Codex；用户不测试。
4. 个人自用项目按实际风险选择测试强度；简单、低风险且相关的任务允许合并处理。
5. 测试性删除、移动、覆盖和批量写入只使用自动生成的临时目录或副本。

详细规则见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 已完成主线

### U02～U08：产品化与真实性

- 干净空状态、中文界面、键盘焦点、弹窗语义。
- PlayerBar 主题与全屏播放器交互收口。
- 移除演示媒体和伪造播放/字幕状态。

### U09～U23：结构与质量

- 播放器生命周期、歌词时间线、依赖门禁、侧栏导航和三主题合同。
- PlayerBar 纯逻辑、临时 UI、主展示区、辅助控制、进度轨道和展示模型拆分。

### U24～U26：日常 UI 去工程化

- 下载规划、诊断、检修、回归和工程状态退出日常视觉层。
- AI 维护入口默认折叠；资源库检修使用独立可见性开关。

### U27：Windows GUI 验收

U27 最终结论为 `NO-GO`，发现 `MAJ-001` 资源库状态断裂和 `MAJ-002` Demo 诊断。该结论作为历史证据保留。

### U28：资源库授权与真实 Index 闭环

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断统一。
- 合法空 Index、失败、损坏 JSON 和多编码明确分类。
- `MAJ-001`、`MAJ-002` 已关闭。

### U29：播放器、队列、续播与字幕全流程

U29 已完成实现和自动化验收：

- HTMLAudio/mpv 使用同一真实续播起点。
- Seek、队列、重启恢复、新授权 token 对账和完成状态统一。
- LRC、SRT、VTT、ASS、双语和无字幕通过 Windows Electron E2E。

详细证据见 `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`。

### U30：日常 UI、三主题、窗口、DPI 与键盘

U30 已完成实现和自动化验收：

- 1040×680、1280×800、1600×900 三档窗口/DPI 矩阵通过。
- dark、acrylic-mist、ocean-drops 三主题通过截图与 DOM 布局检查。
- 队列 Escape、焦点返回、全屏歌词 Escape、reduced-motion 和 focus-visible 完成。
- 窄窗口保留真实资源库状态文本。

详细证据见 `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`。

### U31：导入器事务与数据安全

U31 已完成实现和自动化验收：

- 现有 copy-only 与 move-only 执行器统一接入 `u31-import-transaction-v1`。
- copy-only 继续保留源文件并固定不覆盖目标。
- move-only 继续限制为小样本、二次确认和不覆盖目标。
- 批次中途失败时，copy-only 删除本轮新复制文件；move-only 逆向恢复本轮已移动文件。
- 只清理本轮创建且仍为空的目标目录，不触碰既有目录或其他文件。
- OperationLog 增加事务版本、回滚是否执行、回滚是否成功、已回滚项和回滚失败项；仍只保存相对路径。
- Index 备份、恢复、维护历史沿用 MVP128/MVP129 已验证实现，没有重复造轮子。
- Windows 临时目录覆盖复制成功、冲突跳过、路径越界阻断、复制回滚、移动成功、移动冲突和移动逆向回滚。
- U28～U31 专项测试、原有 importer/index 测试、全部 verifier、稳定回归和桌面构建通过。

详细证据见 `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`。

## 历史质量兼容合同

- U10～U23 的歌词、依赖、导航、主题与 PlayerBar 渐进式拆分合同继续有效。
- U24～U26 的日常 UI 去工程化合同继续有效。
- U27 历史 `NO-GO` 继续保留；相关 Major 已在 U28 关闭。
- 日常层只展示用户实际使用的功能；诊断、回归、工程状态和检修工具留在 AI 维护或隐藏兼容层。

## 当前阶段

```text
U28 资源库闭环：完成
→ U29 播放器与字幕全流程：完成
→ U30 日常 UI 与窗口适配：完成
→ U31 导入器事务与数据安全：完成
→ U32 Windows 发布候选验收
→ U33 版本与 Beta 发布
```

## 后续仍需完成

1. **U32**：strict smoke、实际打包 mpv、portable、NSIS、安装/升级/卸载、中文与空格路径、用户数据保留、残留进程、产物大小和 SHA-256。
2. **U33**：关闭或记录 Blocker/Major、版本号、Release Notes、tag、产物 SHA-256 和新 Beta 发布。

## 自动验证与冻结项

每个 PR 必须执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
TypeScript 与 Electron 构建
U28/U29/U30 Electron E2E
U31 importer transaction matrix
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

冻结项：

- 禁止为了整洁进行全项目重构。
- SQLite 全面迁移、系统媒体控制、完整 AI Agent、OpenList/WebDAV、Player Core v2 和全局 CSS 重写仅在 U33 之后按明确需求启动。
- MVP130 下载器继续冻结，禁止自动合入主线。
