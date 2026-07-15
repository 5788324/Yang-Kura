# Yang-Kura 当前项目交接

> **用途：新对话、ChatGPT、Codex 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`，长期顺序见 `PROJECT_ROADMAP.md`，固定分工见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
核心版本：0.167.0-mvp129
应用：React + Vite + TypeScript + Electron
平台：Windows
用途：ASMR/RJ 与普通音乐的个人本地音频媒体库
当前索引：Local JSON Index
```

必须从最新 `origin/main` 接手。不要使用旧 ZIP、历史 MVP 包、旧工作区副本或文档中的旧固定 SHA 作为代码来源。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
5. `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`
6. `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`
7. `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`
8. `RUN_ME_FIRST.md`
9. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git。

ChatGPT 负责计划、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和最终交付。简单、低风险且相关的任务允许合并处理。

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
- OperationLog 增加 rollbackAttempted、rollbackSucceeded、rolledBackCount 和 rollbackFailureCount，仍只记录相对路径。
- Index 备份、恢复和维护历史沿用 MVP128/MVP129 已有实现。
- 实际编译后的事务服务在 Windows 临时目录通过成功、冲突、越界、部分失败和逆向回滚测试。
- 用户真实媒体库未参与破坏性测试。

## 5. 当前任务：U32

```text
Windows 发布候选、实际打包 mpv、portable、NSIS、安装/升级/卸载
```

ChatGPT 优先自动完成：

- strict smoke 和生产构建；
- portable/NSIS 产物生成；
- 打包文件清单、大小和 SHA-256；
- 中文路径、空格路径、普通用户目录和用户数据保留模拟；
- 打包 mpv 文件存在性、启动参数和 fallback；
- 安装前后配置与数据目录合同；
- 残留进程和文件锁自动检查。

只有 GitHub runner 无法替代的真实安装向导、系统卸载项、用户本机音频设备/驱动播放或系统确认框才交给 Codex。用户不测试。

## 6. U32 完成门槛

1. portable 与 NSIS 产物可生成并通过启动检查。
2. 中文和空格路径可启动或有明确限制。
3. 安装、升级和卸载不删除用户数据。
4. 打包 mpv 或 fallback 有实际证据。
5. 进程退出、文件锁、产物清单、大小和 SHA-256 完整。
6. U28～U31 门禁、全部 verifier、稳定回归和最终构建通过。
7. CI 无法替代的系统集成由 Codex 测试；用户不参与。

## 7. 后续唯一顺序

```text
U32：Windows 发布候选验收
U33：版本、Release Notes、tag、SHA-256、新 Beta
```

U33 前继续冻结：MVP130 正式下载器、完整 AI Agent、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和全局架构重写。

## 8. 标准流程

```text
最新 main
→ 合并相关低风险任务
→ 专项自动测试
→ Windows 构建/文件系统/Electron 测试
→ PR 收口时完整回归
→ 只把不可自动化的实机步骤交给 Codex
→ squash merge
→ 更新状态与交接
```

## 9. 风险边界

- 真实媒体库可正常读取、浏览和播放。
- 测试性删除、移动、覆盖和批量写入使用临时目录或副本。
- 产品正常本地元数据写入不需要企业级审批流程。
- 安装发布必须验证用户数据保留和回滚，但不叠加与个人项目无关的企业流程。
