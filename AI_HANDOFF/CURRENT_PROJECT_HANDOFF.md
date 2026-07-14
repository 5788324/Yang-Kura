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
5. `docs/U28_LIBRARY_RECONCILIATION_IMPLEMENTATION.md`
6. `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`
7. `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`
8. `docs/UI_DAILY_SURFACE_RULES.md`
9. `RUN_ME_FIRST.md`
10. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git。

ChatGPT 负责计划、代码、自动测试、Windows Electron/CDP、截图审查、Git、PR、文档、合并和最终交付。简单、低风险且相关的任务允许合并处理。

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
```

### U28 事实

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断共享同一会话。
- 合法空 Index、读取失败和损坏 JSON 明确区分。
- 多编码 Index 读取与真实媒体协议完成。
- MAJ-001、MAJ-002 已关闭。

### U29 事实

- HTMLAudio/mpv 使用真实续播位置。
- 队列、历史、歌单安全持久化并在重新授权后对账新 token。
- 首页区分播放、暂停、等待授权和历史状态。
- LRC、SRT、VTT、ASS、双语和无字幕已通过 Windows Electron E2E。

### U30 事实

- 1040×680、1280×800、1600×900 三档窗口/DPI 矩阵通过。
- dark、acrylic-mist、ocean-drops 三主题无横向溢出或 PlayerBar 遮挡。
- 现代队列恢复时不再显示重复旧续播提示。
- 队列 Escape 关闭并返回焦点；全屏歌词 Escape 正常。
- reduced-motion 与 focus-visible 完成。
- 窄窗口保留并截断真实资源状态，不隐藏状态。
- U28～U30 Electron E2E、全部 verifier、稳定回归和生产构建通过。

## 5. 当前任务：U31

```text
导入器与数据安全
```

按个人自用快速通道合并完成：

- copy-only 完整导入；
- move-only 仅使用仓库外临时副本；
- 冲突、不覆盖、跳过、取消和失败回滚；
- OperationLog；
- Index 写入前备份、失败恢复和损坏恢复；
- 中文、日文、空格和特殊字符路径；
- 导入后的资源库刷新和页面状态一致。

## 6. U31 完成门槛

1. 普通 copy-only 路径通过逻辑、文件系统集成和 Electron UI 自动测试。
2. move-only、冲突、取消和失败只使用临时副本。
3. 不静默覆盖目标，不因失败丢失唯一文件副本。
4. OperationLog、Index 备份和恢复结果可验证。
5. U28～U30 Electron E2E、全部 verifier、稳定回归和最终构建通过。
6. 用户不执行测试；只有 CI 无法模拟的真实系统集成才交给 Codex。

## 7. 后续唯一顺序

```text
U31：导入器与数据安全
U32：Windows 发布候选、实际 mpv、portable、NSIS、安装升级卸载
U33：版本、Release Notes、tag、SHA-256、新 Beta
```

U33 前继续冻结：MVP130 正式下载器、完整 AI Agent、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和全局架构重写。

## 8. 标准流程

```text
最新 main
→ 合并相关低风险任务
→ 专项测试
→ Windows Electron/CDP
→ PR 收口时完整回归
→ 清理临时脚本
→ squash merge
→ 更新状态与交接
```

## 9. 风险边界

- 真实媒体库可正常读取、浏览和播放。
- 测试性删除、移动、覆盖和批量写入使用临时目录或副本。
- 产品正常本地元数据写入不需要企业级审批流程。
- 导入迁移、安装发布等高影响操作必须验证回滚与数据保留。
