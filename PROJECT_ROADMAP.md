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

每个任务必须从最新 `origin/main` 创建独立分支，并在验收记录中保存实际 HEAD、Actions run 和产物。

## 2. 当前冻结点

```text
核心版本：0.167.0-mvp129
已完成：U02～U29
当前主线：U30 日常 UI、三主题、窗口、DPI 与键盘
后续：U31 导入器安全 → U32 Windows 发布候选 → U33 Beta 发布
MVP130 下载器：继续冻结，禁止合入
```

## 3. 自主管理原则

用户只接收最终成果，不承担测试与项目管理。

```text
最新 main
→ ChatGPT 定义范围和门槛
→ 独立分支 / Draft PR
→ ChatGPT 开发与自动测试
→ Windows Electron/CDP 与截图审查
→ 专项 verifier / 稳定回归 / 生产构建
→ 清理临时资产和核对最终 diff
→ 只有不可自动化的真实本机步骤交给 Codex
→ 最终 HEAD 通过
→ squash merge
→ 向用户交付结果
```

Codex 只处理 GitHub runner 无法替代的本机、设备、商业软件、驱动、安装器或物理体验测试；用户不运行命令、不判断 PASS/FAIL。

## 4. 一轮任务的定义

```text
一个明确且有限的范围
→ 产品代码或验收实现
→ 纯逻辑测试与专项 verifier
→ Windows 构建
→ 真实 Electron UI 自动化
→ 截图视觉审查
→ 完整稳定回归
→ 二次生产构建
→ 最终 diff 审查
→ 合入 main
```

播放后端、高风险文件操作、数据迁移、安装发布和大范围 UI 变更不得捆绑在同一轮。

## 5. 已完成阶段

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

已完成并合入：

- 原生目录授权、当前窗口 token、设置页、Index、首页、资源库、PlayerBar 和诊断统一。
- 合法空 Index、失败、损坏 JSON 和多编码明确分类。
- Windows Electron E2E 覆盖授权、读取、浏览、媒体协议、播放和重启。
- MAJ-001、MAJ-002 关闭。

### U29：播放器与字幕全流程

已完成：

- HTMLAudio/mpv 真实续播起点一致。
- Seek、上一首/下一首、队列、完成策略和重启恢复。
- 队列、历史、歌单安全持久化；新授权 token 自动对账。
- 正在播放、暂停、等待授权和完成状态语义一致。
- LRC、SRT、VTT、ASS、双语和无字幕自动验收。
- U28/U29 Windows Electron E2E 成为永久门禁。

## 6. 当前主线：U30 日常 UI、三主题和窗口适配

**预计：1～2 轮。**

### U30-A：视觉与窗口矩阵

覆盖：

- 首页、音声库、音乐库、详情、歌单、设置、PlayerBar、全屏播放器和 AI 维护；
- 1040×680 最小支持窗口、常规窗口和最大化；
- 100%、125%、150% DPI；
- acrylic-mist、深色和浅色三主题；
- 无横向溢出、遮挡、黑屏、不可点击区域或文本对比问题。

### U30-B：键盘与可访问性

覆盖：

- Tab 顺序、焦点可见、Enter/Space；
- Escape 退出弹窗、抽屉和全屏播放器；
- 焦点返回；
- reduced-motion；
- 常用播放器快捷键与输入框冲突。

### U30 完成门槛

- 自动截图矩阵和 DOM 布局断言通过；
- 关键页面由 AI 逐张审查；
- Windows 构建、U28/U29 E2E、全部 verifier、稳定回归和生产构建通过；
- 只有 GitHub runner 无法覆盖的真实显示器/DPI/驱动问题才交给 Codex。

## 7. U31～U33 Beta 主线

### U31：导入器与数据安全

**预计：1～2 轮。**

- copy-only 全流程。
- move-only 仅在仓库外临时副本验证。
- 冲突、不覆盖、失败回滚、OperationLog。
- Index 备份与恢复。
- 禁止对真实库执行破坏性测试。

### U32：Windows 发布候选验收

**预计：1～2 轮。**

- strict smoke 和真实打包 mpv Windows acceptance。
- portable、NSIS、安装、升级、卸载。
- 中文路径、空格路径、无管理员权限方案。
- 用户数据保留、残留进程、产物大小和 SHA-256。
- 安装器和真实本机集成无法由 CI 完成的部分交给 Codex；用户不测试。

### U33：版本和 Beta 发布

**预计：1 轮。**

- 关闭或记录所有 Blocker/Major。
- 版本号、Release Notes、已知限制和升级说明。
- tag、发布产物和 SHA-256。
- 新 Beta 发布与回滚说明。

## 8. 轮次预算

```text
U30：1～2 轮
U31：1～2 轮
U32：1～2 轮
U33：1 轮
正常剩余：4～7 轮
风险储备：8～10 轮
```

单轮必须保持范围有限；发现新问题时先修复和复测当前门槛，不同时启动下一阶段。

## 9. 自动验证合同

每个 PR 至少执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
TypeScript validation
Electron build
U28 resource-library Electron E2E
U29 player Electron E2E
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

UI 任务还必须上传截图矩阵并由 AI 审查。

## 10. 冻结项

U33 完成前禁止启动或自动合入：

- MVP130 正式下载器；
- 完整 AI Agent；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 全局 CSS 或全项目架构重写；
- 与 U30～U33 无关的大功能。
