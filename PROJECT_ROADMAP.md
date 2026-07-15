# PROJECT_ROADMAP

> **文档定位：Yang-Kura 唯一长期开发路线真源。**
>
> 代码事实以最新 GitHub `main` 为准；当前执行状态见 `PROJECT_STATE.md`，固定协作分工见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 1. 文档优先级

1. GitHub `main`：唯一代码事实来源。
2. `PROJECT_STATE.md`：当前版本、完成事实、阻断项和当前任务。
3. `PROJECT_ROADMAP.md`：长期顺序、发布门槛、冻结项和启动条件。
4. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`：AI、Codex 与用户的固定分工。
5. `docs/U*.md` 与 Release Notes：单轮证据和用户发布说明。

## 2. 当前冻结点

```text
核心版本：0.168.0-beta.1
已完成：U02～U32
当前主线：U33 Beta 版本、tag、Windows 资产与 GitHub prerelease
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
发布后：进入个人 Beta 观察与定向修复
MVP130 下载器：发布完成前继续冻结，禁止合入
```

## 3. 自主管理与快速通道

用户只接收最终成果，不承担测试、排错、构建、Git 或发布操作。

```text
最新 main
→ ChatGPT 合并相关低风险任务
→ 产品实现与专项验证
→ Windows CI / Electron / 文件系统自动测试
→ PR 收口完整回归
→ 只有 CI 无法替代的真实硬件或系统差异交给 Codex
→ squash merge
→ main-only 发布工作流创建 tag 与 prerelease
→ 回读 Release 和资产
→ 向用户交付结果
```

个人自用项目不采用企业级冗余流程。删除、移动、覆盖、安装和发布等高影响操作仍必须验证回滚、数据保留或可重复执行。

## 4. 已完成阶段

### 阶段 A：核心媒体能力

- Electron Windows 桌面壳、目录选择和安全路径 token。
- Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ、普通音乐、首页、详情、收藏、歌单、队列和历史。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only 导入、受控 move-only、本地元数据覆盖和 DLsite Provider。
- 50,000 曲目生成数据性能基准。

### U02～U08：产品化与真实性

- 干净配置不注入演示媒体。
- 中文、键盘焦点、弹窗、主题和全屏播放页收口。
- 移除伪造播放进度与字幕状态。

### U09～U23：渐进式结构与质量

- 播放器生命周期、歌词时间线、依赖门禁、侧栏导航和主题合同。
- PlayerBar 渐进拆分完成，除非明确缺陷不再为了拆分而拆分。

### U24～U26：日常 UI 去工程化

- 下载规划、诊断、历史工程卡、命令行说明和检修工具退出日常视觉层。
- AI 维护与隐藏兼容层保留，日常界面只展示真实使用入口。

历史 UI 硬规则继续有效：

> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。

### U27：Windows GUI 验收

最终 `NO-GO`，发现 MAJ-001 资源库状态断裂和 MAJ-002 Demo 诊断。两项均已在 U28 关闭。

### U28：资源库授权与真实 Index 闭环

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断统一。
- 合法空 Index、损坏 JSON、多编码、媒体协议和重启边界通过 Electron E2E。

### U29：播放器与字幕全流程

- HTMLAudio/mpv 真实续播起点一致。
- Seek、队列、完成策略、重启恢复和 token 对账完成。
- LRC、SRT、VTT、ASS、双语和无字幕自动验收通过。

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
- OperationLog 保存事务和回滚结果，仍不保存绝对路径。

详细证据见 `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`。

### U32：发布候选 UI 与 Windows 发布物

U32-A：

- Windows Electron 使用生成的本地媒体样本实际运行和截图。
- 日常侧栏只保留首页、音声库、音乐库、歌单、导入和设置。
- 下载规划与诊断路由留在隐藏兼容层，不再显示工程入口。
- 首页、资源库、歌单、导入器和设置页完成卡片、按钮、页签与间距对齐。

U32-B：

- portable 与 NSIS 产物生成并实际启动。
- portable 与安装版都必须退出加载占位并完整显示正式首页。
- 中文/空格路径、首次安装、重复安装和静默卸载通过。
- 用户数据保留，残留进程为零。
- packaged mpv 不可用时 HTMLAudio fallback 可用。
- 包内 Index、日志、缓存、备份和用户数据泄漏为零。
- 产物大小、截图、报告与 SHA-256 完整。

正式证据见 `docs/U32_RELEASE_CANDIDATE_PACKAGING.md`。U32 合并提交：`c06e5b31b8472d6903dba1827a2994b0a8f199ec`。

## 5. 当前主线：U33 Beta 发布

### 5.1 发布计划

唯一计划文件：`release/u33-release-plan.json`。

```text
previousVersion：0.167.0-mvp129
version：0.168.0-beta.1
tag：v0.168.0-beta.1
title：Yang-Kura 0.168.0 Beta 1
channel：beta
prerelease：true
assets：portable / setup / SHA256SUMS.txt
```

发布说明：`docs/RELEASE_NOTES_0.168.0-beta.1.md`。

### 5.2 已完成预检

GitHub tags/releases 查询结果：

```text
existing tags：0
existing releases：0
target collision：false
U33 Release Preflight：29389036701 — PASS
```

目标版本、tag 和标题无冲突，不覆盖历史发布。

### 5.3 PR 发布候选门槛

PR #41 必须全部通过：

- `package.json` 与 `package-lock.json` 精确为 `0.168.0-beta.1`。
- README、状态、路线图、交接和 Release Notes 一致。
- Branch Validation 全链回归。
- U33 Release Preflight。
- U33 Beta Release 的 Windows build job。
- portable 与 NSIS 构建。
- packaged 安装、重复安装、卸载、数据保留、fallback 和进程退出。
- portable 与安装版完整首页 readiness。
- 最终 `SHA256SUMS.txt` 校验。
- 发布包名称与计划文件完全一致。

### 5.4 main-only 发布门槛

只有 U33 PR squash 合入 `main` 后，`.github/workflows/u33-beta-release.yml` 的 publish job 才拥有 `contents: write` 并允许：

1. 下载同一 main SHA 的已验证 Windows bundle。
2. 本地执行 `sha256sum -c SHA256SUMS.txt`。
3. 创建 `v0.168.0-beta.1` prerelease，目标提交固定为触发工作流的 `GITHUB_SHA`。
4. 上传 portable、NSIS 和 `SHA256SUMS.txt`，不覆盖已有 Release。
5. 回读 GitHub Release JSON。
6. 验证 tag、标题、prerelease/draft 状态、目标提交、精确资产名、远端/本地体积和下载 URL。
7. 上传 publication evidence。

发布工作流必须可重复执行：若目标 Release 已存在，只验证，不覆盖资产或 Release 内容。

### 5.5 U33 完成门槛

- tag `v0.168.0-beta.1` 指向 U33 合并提交。
- GitHub Release 标记为 prerelease，非 draft。
- Release 标题为 `Yang-Kura 0.168.0 Beta 1`。
- 仅包含两个 Windows EXE 与 `SHA256SUMS.txt`。
- 资产体积、文件名、哈希和下载 URL 全部回读验证。
- 最终状态和交接记录 Release URL、tag、提交、资产和已知限制。

## 6. Beta 发布后的路线

U33 完成后进入个人 Beta 观察期：

1. 优先处理真实使用中可复现的 Blocker/Major。
2. 不因历史待办自动启动大功能。
3. 是否解冻 MVP130 下载器必须重新做优先级判断；不得自动合入实验包。
4. SQLite、OpenList/WebDAV、Player Core v2、完整 AI Agent 和全局架构重写继续按明确需求单独立项。

## 7. 自动验证合同

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
U32 visual audit
全部 scripts/verify-u*.mjs
npm run verify:stable
最终生产构建
```

U33 额外执行：

```text
release tag/release collision preflight
portable + NSIS build
packaged install/fallback acceptance
complete packaged home readiness
SHA256SUMS verification
main-only GitHub prerelease publication
published release target and asset verification
```

## 8. 冻结项

Beta 发布完成前禁止启动或自动合入：

- MVP130 正式下载器；
- 完整 AI Agent；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 全局 CSS 或全项目架构重写；
- 与 U33 发布无关的大功能。
