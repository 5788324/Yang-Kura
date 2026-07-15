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

## 2. 当前冻结点

```text
核心版本：0.167.0-mvp129
已完成：U02～U31 + U32 发布候选 UI 整理
当前主线：U32 Windows portable / NSIS 打包与系统集成验收
后续：U33 Beta 发布
MVP130 下载器：继续冻结，禁止合入
```

## 3. 自主管理与快速通道

用户只接收最终成果，不承担测试与项目管理。

```text
最新 main
→ ChatGPT 合并相关低风险任务
→ 产品实现与专项验证
→ Windows CI / Electron / 文件系统自动测试
→ PR 收口时完整回归
→ 只有 CI 无法替代的真实安装器或系统集成交给 Codex
→ squash merge
→ 向用户交付结果
```

个人自用项目不采用企业级冗余流程。文案、局部 UI、状态显示、测试和文档可合并处理；删除、移动、覆盖、迁移、安装发布等高影响操作仍验证回滚或数据保留。

## 4. 已完成阶段

### 阶段 A：核心媒体能力

- Electron Windows 桌面壳、目录选择和安全路径 token。
- Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ、普通音乐、首页、详情、收藏、歌单、队列和历史。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only 导入、受控 move-only、本地元数据覆盖和 DLsite Provider。
- 50,000 曲目性能基准、portable 和 NSIS 构建基础链。

### U02～U08：产品化与真实性

- 干净配置不注入演示媒体。
- 中文、键盘焦点、弹窗、主题和全屏播放页收口。
- 移除伪造播放进度与字幕状态。

### U09～U23：渐进式结构与质量

- 播放器生命周期、歌词时间线、依赖门禁、侧栏导航和主题合同。
- PlayerBar 渐进拆分完成，除非明确缺陷不再为了拆分而拆分。

### U24～U26：日常 UI 去工程化

- 下载规划、诊断、历史工程卡、命令行说明和检修工具退出日常视觉层。
- AI 维护默认折叠，资源库检修使用独立可见性开关。

### U27：Windows GUI 验收

最终 `NO-GO`，发现 MAJ-001 资源库状态断裂和 MAJ-002 Demo 诊断。该轮保留为历史证据。

### U28：资源库授权与真实 Index 闭环

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断统一。
- 合法空 Index、损坏 JSON、多编码、媒体协议和重启边界通过 Electron E2E。
- MAJ-001、MAJ-002 关闭。

### U29：播放器与字幕全流程

- HTMLAudio/mpv 真实续播起点一致。
- Seek、队列、完成策略、重启恢复和 token 对账完成。
- LRC、SRT、VTT、ASS、双语和无字幕自动验收。

### U30：日常 UI、三主题、窗口、DPI 与键盘

- 三档窗口/DPI 与三主题矩阵通过。
- PlayerBar、侧栏、Escape、焦点返回、reduced-motion 和 focus-visible 完成。
- U28～U30 Electron E2E 成为永久门禁。

详细证据见 `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`。

### U31：导入器事务与数据安全

- copy-only 与 move-only 接入统一事务服务。
- 默认不覆盖目标；冲突保留源文件和既有目标。
- copy 批次部分失败时删除本轮新复制文件。
- move 批次部分失败时逆向恢复本轮已移动文件。
- 只删除本轮创建且为空的目录。
- OperationLog 保存事务和回滚结果，仍不保存绝对路径。
- Index 备份、恢复和维护历史沿用既有 MVP128/MVP129 实现。
- Windows 临时目录事务矩阵、原有 importer/index 测试和稳定回归通过。

详细证据见 `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`。

### U32-A：发布候选 UI 整理

- Windows Electron 使用生成的本地媒体样本实际运行和截图。
- 日常侧栏只保留首页、音声库、音乐库、歌单、导入和设置。
- 下载规划与诊断路由留在隐藏兼容层，不再显示工程入口。
- 首页、资源库、歌单、导入器和设置页完成卡片、按钮、页签与间距对齐。
- U28～U32 Electron E2E、全部 verifier、稳定回归和二次生产构建通过。

合并提交：`d37932c140ec59d858645c083fe2bffcf9c87823`。

## 5. 当前主线：U32-B Windows 发布候选打包验收

**预计：1～2 个合并轮次。**

### U32-B1：自动化发布候选

- strict smoke 与生产构建。
- portable 与 NSIS 产物生成。
- portable 从中文/空格路径实际启动。
- NSIS 静默安装到中文/空格路径并实际启动。
- 重复安装模拟升级，验证用户数据保留。
- 静默卸载，验证应用主体移除、用户数据保留和无残留进程。
- 打包态 mpv 不可用时明确报告，并保留 HTMLAudio fallback。
- 包内禁止混入 Index、日志、缓存、备份和用户数据。
- 产物大小、文件清单、截图、报告与 SHA-256。

永久工作流：`.github/workflows/u32-release-candidate.yml`。

详细范围：`docs/U32_RELEASE_CANDIDATE_PACKAGING.md`。

### U32-B2：真实 Windows 系统集成

GitHub runner 能覆盖的内容继续由 ChatGPT 自动完成。以下只有在自动化确实无法替代时才交给 Codex：

- 真实安装向导和系统确认对话框；
- 开始菜单与系统卸载项显示；
- 打包 mpv 在用户本机驱动与音频设备上的实际播放；
- 用户机器上的残留进程、文件锁、杀毒软件和特殊权限行为。

用户不测试、不运行命令、不判断 PASS/FAIL。

### U32 完成门槛

- portable 与 NSIS 均能构建并实际启动。
- 中文/空格路径通过。
- 重复安装和卸载不破坏用户数据。
- 应用退出与卸载不残留进程。
- 实际 mpv 或明确 fallback 行为有证据。
- 产物 SHA-256、大小、截图、文件清单和已知限制完整。
- U28～U31 永久门禁、全部 verifier、稳定回归和最终构建通过。

## 6. U33：版本和 Beta 发布

- 关闭或记录所有 Blocker/Major。
- 版本号、Release Notes、已知限制和升级说明。
- tag、发布产物和 SHA-256。
- 新 Beta 发布与回滚说明。

U33 才允许正式调整版本号、创建 tag 和发布 GitHub Release；U32 不提前做这些动作。

## 7. 轮次预算

```text
U32-B：1～2 轮
U33：1 轮
正常剩余：2～3 轮
风险储备：4～6 轮
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
U31 importer transaction matrix
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

U32 发布任务还必须执行：

```text
portable + NSIS build
packaged app launch
Chinese / space path
repeat install / uninstall
user data preservation
process cleanup
package file audit
SHA-256 manifest
```

## 9. 冻结项

U33 完成前禁止启动或自动合入：

- MVP130 正式下载器；
- 完整 AI Agent；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 全局 CSS 或全项目架构重写；
- 与 U32～U33 无关的大功能。
