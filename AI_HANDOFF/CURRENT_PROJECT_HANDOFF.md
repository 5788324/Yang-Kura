# Yang-Kura 当前项目交接

> **用途：新对话、Codex、DeepSeek 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 本文件记录接手方法和当前已知状态；长期开发顺序仍以根目录 `PROJECT_ROADMAP.md` 为唯一路线真源，当前事实以 `PROJECT_STATE.md` 与最新 `origin/main` 为准。

## 1. 项目与代码来源

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
核心版本：0.167.0-mvp129
应用：React + Vite + TypeScript + Electron 的 Windows 本地音频媒体库
资源类型：ASMR/RJ 音声与普通音乐
当前索引：Local JSON Index
```

必须从最新 `origin/main` 接手。不要使用旧 ZIP、旧工作区副本、历史 MVP 包或文档中的旧固定 SHA 作为代码事实来源。

本交接编写时观察到的 `main` HEAD：

```text
68d13684649d9dfd98c65a1d57530447d81856cb
docs: correct U27 to NO-GO and redefine U28 repair scope
```

该 SHA 只用于说明交接时的观察点。新对话必须重新执行 `git fetch` 和 `git rev-parse HEAD`。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`（本文件）
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md`
5. `docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md`
6. `docs/UI_DAILY_SURFACE_RULES.md`
7. `RUN_ME_FIRST.md`
8. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

不要从 `archive/legacy-mvp-history/` 或旧 Round 报告推导当前任务。

## 3. 已完成范围

### 产品与基础能力

- Electron Windows 桌面壳、目录选择和安全路径 token。
- Local JSON Index 写入、读取、备份、恢复和维护基础能力。
- ASMR/RJ 与普通音乐资源库、详情、收藏、歌单、队列和播放历史。
- HTMLAudio、mpv、fallback、Seek 和进程回收。
- LRC、SRT、VTT、ASS 字幕。
- copy-only 完整导入与受控 move-only 小样本链。
- 本地元数据覆盖、恢复和单 RJ DLsite Provider。
- 50,000 曲目合成数据性能基准。
- portable、NSIS 和 Windows 自动门禁基础链。

### 已完成增量

```text
U02～U08：产品化与真实性修复
U09～U23：渐进式结构与质量优化
U24～U26：日常 UI 去工程化与 AI 维护收口
```

PlayerBar 结构优化已收口。除非真实缺陷直接要求，不再为了拆分而拆分组件。

## 4. 永久 UI 原则

> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。

补充规则：

- 诊断页不得用 Demo、静态回归或历史状态冒充真实用户资源库状态。
- 设置、目录选择、读取、扫描、播放和导入的用户状态必须来自同一真实数据链。
- 历史 verifier 需要锚点时优先验证稳定行为，不得要求工程卡重新显示。

## 5. U27 最终结论

U27 的空库阶段曾得到 `CONDITIONAL GO`，但真实 `E:\arsm` 补测后，最终结论被覆盖为：

```text
NO-GO
```

### MAJ-001：资源库授权与 Index 状态断裂

真实表现：

- Windows 原生目录选择器确认选择 `E:\arsm`；
- 页面显示已选择目录，顶栏仍残留“已加载 51 条音轨”；
- 设置页仍提示需要选择目录；
- “读取已有记录”和“一键扫描并应用”仍 disabled；
- 音声库、首页和队列为空，资源计数不一致。

### MAJ-002：诊断页仍使用 Demo 资源状态

- AI 维护中的资源状态刷新明确运行 Demo 扫描；
- 提示不会读取真实磁盘；
- 资源计数无法代表当前授权目录或真实 Index。

在真实目录授权 → Index → 浏览 → 播放闭环通过前，不得将 U27 或 U28 标记为 GO。

## 6. 接手时必须先解决的状态不一致

用户在本次交接前反馈：

> 上述问题“好像已经修了，并推送到 Git”。

但交接时对 GitHub 的审计结果是：

- `main` 最新可见提交仍是 U27 NO-GO / U28 范围文档提交；
- 没有开放的修复 PR；
- 没有可见的 U28 修复分支；
- 最近已合并 PR #33 仅更新文档与 verifier，没有产品代码修复。

因此新对话的**第一任务不是直接继续开发，也不是直接重复修复**，而是核对修复实际位于哪里。

## 7. 第一任务：Git 与修复状态核对

在现有仓库中：

```powershell
Set-Location "G:\Codex\Yang Kura"
git status --short
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
git log -15 --oneline --decorate
```

规则：

- 工作区存在未提交改动时立即停止；不要 stash、reset 或覆盖用户工作。
- 检查最新提交、远端分支和 PR，寻找与目录授权、root snapshot、Index 读取、扫描按钮、真实诊断状态相关的修复。
- 不以提交名称判断修复完成；必须检查实际 diff 和运行结果。

重点检查范围：

```text
SettingsPage / 目录选择状态
Electron preload / IPC / root token 或 snapshot
读取已有 Index 的启用条件
一键扫描并应用的启用条件
App 资源库水合与计数来源
音声库、首页、顶栏和 PlayerBar 的共享数据快照
Diagnostics 的真实资源状态来源
```

### 三种处理路径

#### A. 修复已经合入最新 main

- 不重复写代码。
- 先运行自动门禁。
- 再执行 U28 真实 GUI 闭环复验。
- 全部通过后更新 `PROJECT_STATE.md`、`PROJECT_ROADMAP.md` 和 U28 结果文档，关闭 MAJ-001/MAJ-002。

#### B. 修复在远端分支或未合并 PR

- 审查 diff、数据安全和实现边界。
- 在该分支运行完整门禁。
- 使用临时样本完成写入测试，真实 `E:\arsm` 只读验证。
- 通过后走正式 PR 合并，不直接改 main。

#### C. 没有找到修复

- 从最新 main 创建独立 U28 修复分支。
- 只修 MAJ-001/MAJ-002，不启动其他功能或大重构。

## 8. U28 正式修复范围

### 必须统一的数据链

```text
Windows 原生目录授权
→ Electron 安全 token / root snapshot
→ Settings 授权摘要
→ 读取已有 Index / 安全扫描能力
→ App 资源库状态
→ 首页、音声库、音乐库、PlayerBar
→ AI 维护真实诊断快照
```

### 修复要求

1. 原生目录选择完成后，设置页立即识别已授权 root。
2. “读取已有记录”和“一键扫描并应用”按真实能力启用。
3. 有 Index 时可以读取；无 Index 时可以安全扫描并生成。
4. 顶栏、设置页、浏览页和播放器不能使用互相独立的陈旧计数。
5. 诊断页读取真实授权/Index 状态；能力暂不可用时应明确禁用，不得显示 Demo 为当前结果。
6. 不向 Renderer 日常界面暴露绝对路径或 `file://`。
7. 不修改真实媒体文件。
8. 不借修复之名重写 Index、Importer、播放器或 Electron 架构。

## 9. U28 完成门槛

先用仓库外临时样本完成可写测试：

```text
原生选择临时资源库
→ 读取已有 Index 或安全扫描
→ 音声库显示作品
→ 播放至少一个音轨
→ 关闭并重启
→ 状态和字幕关联一致
```

再用真实 `E:\arsm` 只读验证：

- 授权状态一致；
- 读取已有 Index，或明确允许用户执行安全扫描；
- 音声库能够浏览真实作品；
- 顶栏、设置页和浏览页计数一致；
- 播放至少一个音轨；
- 不执行清理、移动、覆盖、批量写入或元数据改写。

完成条件：

- MAJ-001 关闭；
- MAJ-002 关闭，或降级为明确禁用且不会误导的非阻塞状态；
- U02～U28 专项 verifier 全部通过；
- `npm run verify:stable` 通过；
- `npm run build` 通过；
- 用户配置恢复；
- Git clean；
- 无 Yang Kura、Electron 或 mpv 残留进程。

## 10. 后续唯一主线

U28 完成后按 `PROJECT_ROADMAP.md` 顺序执行：

```text
U29：播放器、Seek、队列、续播与 LRC/SRT/VTT/ASS 全流程
U30：三主题、窗口尺寸、DPI、键盘和日常 UI
U31：copy-only、受控 move-only、OperationLog 和数据安全
U32：strict smoke、mpv acceptance、portable、NSIS、安装升级卸载
U33：版本号、Release Notes、tag、SHA-256 和新 Beta 发布
```

U33 完成前禁止启动：

- MVP130 正式下载器；
- 完整 AI Agent；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 全局 CSS 或全项目架构重写。

## 11. 标准协作流程

```text
最新 main
→ 状态核对
→ 独立分支
→ 有限范围实现或验收
→ 专项 verifier
→ 完整稳定回归
→ Windows 生产构建
→ Draft PR
→ 审查最终 diff
→ Ready
→ squash merge
→ 更新状态与路线文档
```

每轮必须保留：

- 实际 HEAD；
- 改动文件和边界；
- 自动门禁结果；
- 实机验证范围；
- 未测试项；
- 数据安全结论；
- 下一轮入口。

## 12. 与用户协作方式

- 用户希望 AI 自主推进，不要反复询问已经明确的事项。
- 长任务需要短进度更新，但不要输出低层工具操作噪声。
- 发现风险时先保护 main 和用户数据，再处理问题。
- 不得声称“已修复”或“可发布”，除非有自动门禁和真实 Windows GUI 证据。
- 当前用户明确要求暂停继续开发；新对话先完成接手、核对和报告，再按路线恢复任务。
