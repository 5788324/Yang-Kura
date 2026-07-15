# Yang-Kura 当前项目交接

> **用途：新对话、ChatGPT、Codex 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`，长期顺序见 `PROJECT_ROADMAP.md`，固定分工见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
核心版本：0.168.0-beta.1
应用：React + Vite + TypeScript + Electron
平台：Windows x64
用途：ASMR/RJ 与普通音乐的个人本地音频媒体库
当前索引：Local JSON Index
当前任务：U33 Beta 发布
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
```

必须从最新 `origin/main` 接手。不要使用旧 ZIP、历史 MVP 包、旧工作区副本或文档中的旧固定 SHA 作为代码来源。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
5. `release/u33-release-plan.json`
6. `docs/RELEASE_NOTES_0.168.0-beta.1.md`
7. `docs/U32_RELEASE_CANDIDATE_PACKAGING.md`
8. `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`
9. `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`
10. `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`
11. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并、tag、Release、回读验收和最终交付。简单、低风险且相关的任务允许合并处理。

Codex 只处理 GitHub runner 无法替代的真实本机、硬件、驱动、商业软件、安装器或系统集成测试。Codex 默认只测试，后续诊断、修复和 Git 管理仍由 ChatGPT 负责。

## 4. 已完成主线

```text
U02～U08：产品化与真实性
U09～U23：渐进式结构与质量
U24～U26：日常 UI 去工程化
U27：Windows GUI 验收，历史结论 NO-GO
U28：资源库授权、真实 Index、浏览与播放闭环
U29：播放器、Seek、队列、续播与字幕全流程
U30：日常 UI、三主题、窗口、DPI、键盘与可访问性
U31：导入器事务、失败回滚、OperationLog 与数据安全
U32-A：发布候选 UI 整理
U32-B：portable、NSIS、安装升级卸载、数据保留与 SHA-256
```

### U28 事实

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断共享同一会话。
- 合法空 Index、读取失败、损坏 JSON、多编码和媒体协议完成。
- MAJ-001、MAJ-002 已关闭。

### U29 事实

- HTMLAudio/mpv 使用真实续播位置。
- 队列、历史、歌单安全持久化并在重新授权后对账新 token。
- LRC、SRT、VTT、ASS、双语和无字幕通过 Windows Electron E2E。

### U30 事实

- 三档窗口/DPI 和三主题矩阵通过。
- PlayerBar、侧栏、Escape、焦点返回、reduced-motion 与 focus-visible 完成。
- U28～U30 Electron E2E、全部 verifier、稳定回归和生产构建通过。

### U31 事实

- copy-only 与 move-only 共用 `u31-import-transaction-v1` 文件事务服务。
- copy-only 保留源文件；目标存在时跳过且不覆盖。
- move-only 继续限制为最多 20 项、明确确认、默认不覆盖。
- 批次部分失败时，copy-only 删除本轮新复制文件，move-only 将本轮已移动文件恢复到源位置。
- 只清理本轮创建且为空的目标目录。
- OperationLog 记录事务与回滚结果，仍只记录相对路径。
- 用户真实媒体库未参与破坏性测试。

### U32-A：发布候选 UI 整理

- Windows Electron 使用生成的本地媒体样本运行并逐页截图复核。
- 日常侧栏只保留首页、音声库、音乐库、歌单、导入和设置。
- 下载规划与诊断保留在隐藏兼容层，不再出现在日常导航。
- 首页媒体内容进入首屏，资源库、歌单、导入器和设置页完成按钮、卡片与间距收口。

### U32-B：Windows 发布物验收

- portable 与 NSIS 构建和完整首页加载通过。
- 中文/空格路径通过。
- NSIS 首次安装、同目录重复安装和静默卸载通过。
- 用户数据保留，残留进程为零。
- packaged mpv 不可用时 HTMLAudio fallback 可用。
- 包内 Index、日志、缓存、备份和用户数据泄漏为零。
- 产物大小、截图、报告和 SHA-256 完整。
- U32 合并提交：`c06e5b31b8472d6903dba1827a2994b0a8f199ec`。

正式证据：`docs/U32_RELEASE_CANDIDATE_PACKAGING.md`。

## 5. 当前任务：U33

```text
版本、Release Notes、tag、Windows 资产、SHA-256、GitHub prerelease 与发布回读
```

当前工作分支：`agent/u33-beta-release`，Draft PR #41。

发布计划：

```text
version：0.168.0-beta.1
tag：v0.168.0-beta.1
title：Yang-Kura 0.168.0 Beta 1
prerelease：true
assets：portable / setup / SHA256SUMS.txt
```

发布历史预检：

```text
existing tags：0
existing releases：0
target collision：false
U33 Release Preflight：29389036701 — PASS
```

### PR 阶段

ChatGPT 必须完成：

- package 与 lock 版本同步；
- README、状态、路线图、交接和 Release Notes 一致；
- tag/release 冲突预检；
- Windows portable 与 NSIS 构建；
- packaged 安装、重复安装、卸载、数据保留、fallback 和进程退出；
- portable 与安装版完整首页 readiness；
- `SHA256SUMS.txt` 校验；
- Branch Validation、全部 verifier、稳定回归和最终生产构建。

PR 阶段所有工作流只有 `contents: read`，不得提前创建 tag 或 Release。

### main 发布阶段

只有 PR squash 合入 `main` 后，`.github/workflows/u33-beta-release.yml` 的 publish job 才拥有 `contents: write`，并执行：

1. 下载同一 `main` SHA 的已验证 Windows bundle。
2. 本地校验 `SHA256SUMS.txt`。
3. 创建 `v0.168.0-beta.1` prerelease，target 固定为触发提交。
4. 上传两个 EXE 与 `SHA256SUMS.txt`。
5. 回读 Release JSON。
6. 验证 tag、标题、prerelease/draft 状态、target commit、资产名、体积和下载 URL。
7. 上传 publication evidence。

如果 Release 已存在，工作流只验证，不覆盖。

## 6. U33 完成门槛

1. `package.json` 与 `package-lock.json` 均为 `0.168.0-beta.1`。
2. PR 三套门禁全部通过：Branch Validation、U33 Release Preflight、U33 Beta Release build。
3. PR squash 合并后 main-only publish 成功。
4. tag `v0.168.0-beta.1` 指向 U33 合并 SHA。
5. Release 标题为 `Yang-Kura 0.168.0 Beta 1`，prerelease=true，draft=false。
6. Release 精确包含 portable、setup 和 `SHA256SUMS.txt`。
7. 远端资产体积、下载 URL和本地 SHA-256 回读验证通过。
8. 最终状态与交接记录 Release URL、提交、资产和已知限制。

## 7. 发布后的唯一顺序

```text
U33 完成
→ 个人 Beta 观察期
→ 只处理真实使用中可复现的 Blocker/Major
→ 重新评估下一条主线
```

MVP130 正式下载器、完整 AI Agent、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和全局架构重写在发布成功前继续冻结；发布后也不得自动启动，必须重新做优先级判断。

## 8. 标准流程

```text
最新 main
→ 合并相关低风险任务
→ 专项自动测试
→ Windows 构建/文件系统/Electron 测试
→ PR 收口完整回归
→ squash merge
→ main-only 受控发布
→ 回读 Release 与资产
→ 更新状态与交接
```

## 9. 风险边界

- 真实媒体库可正常读取、浏览和播放。
- 测试性删除、移动、覆盖和批量写入使用临时目录或副本。
- 安装与用户数据实验全部使用 GitHub runner 临时目录，不触碰真实 `E:\arsm`。
- Renderer 不接收真实绝对路径或 `file://`。
- 本 Beta 未进行商业代码签名，SmartScreen 可能显示未知发布者。
- 用户本机真实 mpv、声卡和厂商驱动组合未被宣称全部验证；packaged fallback 已验证。
