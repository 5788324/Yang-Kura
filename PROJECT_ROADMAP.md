# PROJECT_ROADMAP

> **文档定位：Yang-Kura 唯一长期开发路线真源。**
>
> 所有新功能、结构调整、验收和发布任务必须与本文件对齐。当前事实以最新 GitHub `main` 和 `PROJECT_STATE.md` 为准。

## 1. 文档优先级

1. GitHub `main`：唯一代码事实来源。
2. `PROJECT_STATE.md`：当前版本、完成事实、阻断项和当前任务。
3. `PROJECT_ROADMAP.md`：长期顺序、轮次预算、冻结项和启动条件。
4. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`：AI、Codex 与用户的固定分工。
5. `docs/U*.md`：单轮实现、验收、问题和证据。
6. `docs/UI_DAILY_SURFACE_RULES.md`：长期 UI 规则。

## 2. 当前冻结点

```text
核心版本：0.167.0-mvp129
已完成：U02～U30
当前主线：U31 导入器与数据安全
后续：U32 Windows 发布候选 → U33 Beta 发布
MVP130 下载器：继续冻结，禁止合入
```

## 3. 自主管理与快速通道

用户只接收最终成果，不承担测试与项目管理。

```text
最新 main
→ ChatGPT 合并相关低风险任务
→ 产品实现与专项验证
→ Windows Electron/CDP 与截图审查
→ PR 收口时完整回归
→ 只有不可自动化的真实本机步骤交给 Codex
→ squash merge
→ 向用户交付结果
```

个人自用项目不采用企业级冗余流程。文案、局部 UI、状态显示、测试和文档可合并处理；删除、移动、覆盖、迁移、安装发布等高影响操作仍独立验收。

## 4. 已完成阶段

### 阶段 A：核心媒体能力

- Electron Windows 桌面壳、目录选择和安全路径 token。
- Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ、普通音乐、首页、详情、收藏、歌单、队列和历史。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only 导入、受控 move-only 样本、本地元数据覆盖和 DLsite Provider。
- 50,000 曲目性能基准、portable 和 NSIS 构建基础链。

### U02～U08：产品化与真实性

- 干净配置不注入演示媒体。
- 中文、键盘焦点、弹窗、主题和全屏播放页收口。
- 移除伪造播放进度与字幕状态。

### U09～U23：渐进式结构与质量

- 播放器生命周期、歌词时间线、依赖门禁、侧栏导航和主题合同。
- PlayerBar 纯逻辑、展示组件、Seek、辅助控制和展示模型拆分。
- PlayerBar 结构优化已经结束，除非明确缺陷，不再为了拆分而拆分。

### U24～U26：日常 UI 去工程化

- 下载规划、诊断、历史工程卡、命令行说明和检修工具退出日常视觉层。
- AI 维护默认折叠，资源库检修使用独立可见性开关。

### U27：Windows GUI 验收

最终 `NO-GO`，发现 MAJ-001 资源库状态断裂和 MAJ-002 Demo 诊断。该轮保留为历史证据。

### U28：资源库授权与真实 Index 闭环

- 原生目录授权、当前窗口 token、设置页、Index、首页、资源库、PlayerBar 和诊断统一。
- 合法空 Index、失败、损坏 JSON 和多编码明确分类。
- Windows Electron E2E 覆盖授权、读取、浏览、媒体协议、播放和重启。
- MAJ-001、MAJ-002 关闭。

### U29：播放器与字幕全流程

- HTMLAudio/mpv 真实续播起点一致。
- Seek、上一首/下一首、队列、完成策略和重启恢复。
- 队列、历史、歌单安全持久化；新授权 token 自动对账。
- 正在播放、暂停、等待授权和完成状态语义一致。
- LRC、SRT、VTT、ASS、双语和无字幕自动验收。

### U30：日常 UI、三主题、窗口、DPI 与键盘

- 1040×680、1280×800、1600×900 窗口/DPI 矩阵通过。
- dark、acrylic-mist、ocean-drops 三主题通过截图和布局断言。
- 首页、音声库、音乐库、歌单和设置页无横向溢出。
- PlayerBar 与侧栏完成紧凑适配。
- 队列 Escape、焦点返回、全屏歌词 Escape、focus-visible 和 reduced-motion 完成。
- 重复旧续播提示关闭；窄窗口仍保留真实资源状态。
- U28～U30 Electron E2E 成为永久门禁。

详细证据见 `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`。

## 5. 当前主线：U31 导入器与数据安全

**预计：1 个合并轮次，必要时拆出高风险修复。**

### U31 合并范围

- copy-only 完整导入流程。
- move-only 只在仓库外临时副本验证。
- 同名冲突、目标已存在和默认不覆盖。
- 中途失败、取消和部分完成状态。
- OperationLog 可追踪输入、输出、跳过、失败和回滚结果。
- Index 写入前备份、失败恢复和损坏恢复。
- 中文、日文、空格和特殊字符路径。
- 导入完成后的资源库刷新与页面状态一致。

### U31 数据边界

- 不对用户真实媒体库执行测试性删除、移动、覆盖或重命名。
- 产品正常 copy-only 行为可在临时样本中完整执行。
- move-only、回滚、冲突和恢复使用自动生成的临时目录与副本。
- 不为普通读取、浏览和本地元数据修改增加企业级审批流程。

### U31 完成门槛

- 纯逻辑、文件系统集成和 Electron 导入链通过。
- 失败路径不会静默丢失文件或覆盖目标。
- OperationLog、Index 备份和恢复结果可验证。
- U28～U30 Electron E2E、全部 verifier、稳定回归和最终构建通过。

## 6. U32～U33 Beta 主线

### U32：Windows 发布候选验收

- strict smoke 和真实打包 mpv Windows acceptance。
- portable、NSIS、安装、升级、卸载。
- 中文路径、空格路径、无管理员权限方案。
- 用户数据保留、残留进程、产物大小和 SHA-256。
- CI 无法覆盖的真实安装器/驱动集成交给 Codex；用户不测试。

### U33：版本和 Beta 发布

- 关闭或记录所有 Blocker/Major。
- 版本号、Release Notes、已知限制和升级说明。
- tag、发布产物和 SHA-256。
- 新 Beta 发布与回滚说明。

## 7. 轮次预算

```text
U31：1～2 轮
U32：1～2 轮
U33：1 轮
正常剩余：3～5 轮
风险储备：6～8 轮
```

## 8. 自动验证合同

每个 PR 至少执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
TypeScript validation
Electron build
U28 resource-library Electron E2E
U29 player Electron E2E
U30 UI and accessibility matrix
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

高影响文件操作任务还必须使用临时副本验证失败回滚。

## 9. 冻结项

U33 完成前禁止启动或自动合入：

- MVP130 正式下载器；
- 完整 AI Agent；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 全局 CSS 或全项目架构重写；
- 与 U31～U33 无关的大功能。
