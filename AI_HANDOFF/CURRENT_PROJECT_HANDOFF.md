# Yang-Kura 当前项目交接

> **用途：新对话、ChatGPT、Codex 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`，长期顺序见 `PROJECT_ROADMAP.md`，UI 规则见 `docs/DESIGN.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
当前版本：0.168.0-beta.1
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
用途：ASMR/RJ 与普通音乐的个人本地音频媒体库
当前索引：Local JSON Index
Beta 1：已发布并完成远端资产校验
Beta 2：U34 联合审计已完成
当前任务：U35 共享契约、架构边界与 Design System 基础
目标版本：0.169.0-beta.2
```

必须从最新 `origin/main` 接手。禁止使用旧 ZIP、历史 MVP 包、旧工作区或文档中的旧固定 SHA 作为代码来源。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `docs/architecture/ARCHITECTURE_AUDIT.md`
5. `docs/architecture/DEPENDENCY_MAP.md`
6. `docs/architecture/REFACTOR_BACKLOG.md`
7. `docs/DESIGN.md`
8. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
9. `docs/RELEASE_NOTES_0.168.0-beta.1.md`
10. `docs/U32_RELEASE_CANDIDATE_PACKAGING.md`
11. `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`
12. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、架构、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和发布。简单、低风险且相关的任务允许合并处理。

Codex 只处理 GitHub runner 无法替代的真实本机、显示器/DPI、硬件、声卡、驱动、安装器或系统集成测试。Codex 默认只测试，不修改源码；后续诊断、修复和 Git 管理仍由 ChatGPT 负责。

## 4. 当前完成事实

### 核心媒体库

- Windows Electron 桌面壳与安全路径 token。
- ASMR/RJ 和普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- 首页、详情、收藏、歌单、队列、历史和续播。
- 50,000 曲目生成数据性能基准。

### 播放与字幕

- HTMLAudio、mpv 与自动 fallback。
- Seek、循环、播放完成策略、进程回收和重启恢复。
- LRC、SRT、VTT、ASS、双语与无字幕状态。
- 图片、视频、文本和文件夹外部打开。

### 导入与元数据

- copy-only 与受控 move-only。
- 默认不覆盖目标。
- 批次部分失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。

### Windows 发布

- portable 与 NSIS。
- 中文/空格路径、安装、重复安装、卸载、用户数据保留和残留进程检查。
- packaged mpv 不可用时 HTMLAudio fallback。
- `v0.168.0-beta.1` prerelease 与三个资产完成远端大小和 SHA-256 校验。

## 5. U34 已完成结论

U34 没有修改产品行为，已输出：

- `docs/architecture/ARCHITECTURE_AUDIT.md`
- `docs/architecture/DEPENDENCY_MAP.md`
- `docs/architecture/REFACTOR_BACKLOG.md`

关键问题：

- `electron/main.ts` 约 4,800 行级；
- `SettingsPage.tsx` 超过 3,500 行；
- `DiagnosticsPage.tsx` 超过 3,400 行；
- `App.tsx` 和 `useAudioPlayer.ts` 职责过多；
- Renderer、preload、main 有三套 IPC 类型和裸 channel；
- 历史 MVP service、隐藏 verifier 锚点和 package 元数据进入活跃运行时；
- TypeScript strict 尚未启用；
- 低风险文档曾错误触发完整 Windows、portable/NSIS 和历史 Beta 发布验证。

结论：保留现有业务和安全边界，渐进拆分高耦合文件，先统一契约，再按页面纵向迁移。

## 6. 当前任务：U35

U35 第一批范围：

```text
共享 IPC channel/contract
+ Result/Error 基础
+ 暮夜琥珀/雾光象牙语义 Token
+ 基础 UI primitives
+ App Shell/Router 边界
+ Settings 与 AI Maintenance 边界
```

明确不做：

- 不同时重写资源库、播放器和导入器；
- 不搬迁所有文件后再补行为；
- 不新增下载器、SQLite、OpenList/WebDAV、转录或大型 Provider；
- 不新增历史字符串 verifier 锚点。

## 7. 后续顺序

```text
U35 共享契约 + Design System + Settings/Maintenance 边界
→ U36 App Shell + IPC/状态统一
→ U37 首页/资源库/详情
→ U38 经典/黑胶/歌词播放器
→ U39 导入器/设置/维护
→ U40 历史清理和质量门禁
→ U41 0.169.0-beta.2 发布
```

按 7 个批次推进，预计约 9～13 个有效开发轮次。

## 8. 执行效率硬规则

2026-07-16 的低效执行问题已写入 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`，后续 AI 必须执行：

```text
低风险任务：
一次全局搜索
→ 批量修改
→ targeted 验证
→ 一个 PR
→ 一次最终完整门禁
→ squash merge
```

- 第一次提交前搜索全部旧版本、旧阶段、固定 SHA、verifier 和 workflow path 依赖。
- 禁止逐个失败反复推送和重复完整 CI。
- 禁止新增隐藏 DOM、HTML 注释、sr-only 或 package metadata 锚点。
- 文档 PR 只走轻量门禁，不打 portable/NSIS，不重建历史 Beta Release。
- CI 状态仅在启动、完成、合并三个节点检查。
- 进度消息仅在完成修改、真实阻断、最终结果三个节点发送。
- 高风险文件事务、数据迁移、安装和发布仍保持严格验证。

## 9. UI 硬规则

- 中文用户界面；工程术语只允许出现在 AI 维护或开发文档。
- 内容优先，不把所有信息塞进等宽卡片。
- 主题必须改变完整材质系统，不得只换强调色。
- 动画必须克制、统一并支持 reduced-motion。
- 经典、黑胶、歌词三播放器角色清晰，不能只是同一页面换皮。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- 新 UI 与 `docs/DESIGN.md` 冲突时，以 `docs/DESIGN.md` 为准。

## 10. 功能冻结

Beta 2 完成前禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与 Beta 2 无关的大型 Provider。

## 11. 风险边界

- Renderer 不接收绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 重构期间每个 PR 必须保持现有业务可运行，禁止跨多轮留下不可用中间态。
- Beta 2 仍可能没有商业代码签名，SmartScreen 可显示未知发布者。
