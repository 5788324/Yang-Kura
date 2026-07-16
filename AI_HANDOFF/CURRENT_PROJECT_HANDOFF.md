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
当前任务：Beta 2 代码结构/质量整备 + UI 全面重写
目标版本：0.169.0-beta.2
```

必须从最新 `origin/main` 接手。禁止使用旧 ZIP、历史 MVP 包、旧工作区或文档中的旧固定 SHA 作为代码来源。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `docs/DESIGN.md`
5. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
6. `docs/RELEASE_NOTES_0.168.0-beta.1.md`
7. `docs/U32_RELEASE_CANDIDATE_PACKAGING.md`
8. `docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md`
9. `docs/U30_UI_FAST_TRACK_ACCEPTANCE.md`
10. `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`
11. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

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

## 5. 当前任务：Beta 2 联合整备

不是单纯重构，也不是单纯换皮。

```text
冻结业务行为
→ 联合审计
→ 架构边界 + Design System
→ App Shell 和契约
→ 资源库/详情迁移
→ 三播放器/歌词迁移
→ 导入/设置/维护迁移
→ 质量门禁和旧 UI 清理
→ 0.169.0-beta.2 发布
```

### U34：联合审计

- 依赖图、超大文件、复杂函数、循环依赖、重复代码和跨层调用。
- 页面、组件、主题、动画、信息架构和缺失操作入口。
- 不可破坏行为、性能、构建、测试和截图基线。
- 本阶段不改变产品行为。

### U35～U36：基础设施

- 建立 `app / features / domain / application / infrastructure / shared` 边界。
- `docs/DESIGN.md` 为 UI 最高规则。
- 建立暮夜琥珀与雾光象牙主题、语义 Token、统一组件和 Motion 规则。
- 重写 App Shell，统一 Renderer/Preload/Main IPC 契约和错误模型。

### U37～U39：纵向页面迁移

- 首页、音声库、RJ 详情、音乐库、专辑/艺术家详情。
- 经典、黑胶、歌词三种播放器。
- 导入器、设置和 AI 维护。
- 每迁移一个页面，同步整理该页面触碰的业务模块；禁止脱离业务的全局搬家。

### U40～U41：质量和发布

- strict、跨层引用、循环依赖、浮动 Promise、裸 IPC 和新增 `any` 门禁。
- 删除旧 UI、废弃组件和无价值字符串 verifier。
- 完整 Electron/Windows 回归并发布 `0.169.0-beta.2`。

## 6. UI 硬规则

- 中文用户界面；工程术语只允许出现在 AI 维护或开发文档。
- 内容优先，不把所有信息塞进等宽卡片。
- 主题必须改变完整材质系统，不得只换强调色。
- 动画必须克制、统一并支持 reduced-motion。
- 经典、黑胶、歌词三播放器角色清晰，不能只是同一页面换皮。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- 新 UI 与 `docs/DESIGN.md` 冲突时，以 `docs/DESIGN.md` 为准。

## 7. 功能冻结

Beta 2 完成前禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与 Beta 2 无关的大型 Provider。

## 8. 标准执行流程

```text
最新 main
→ 建立独立分支和任务范围
→ 专项实现与自动测试
→ Windows/Electron/UI 截图验收
→ PR 完整回归
→ squash merge
→ Beta 2 发布候选打包
→ Release 与资产回读
→ 更新状态和交接
```

## 9. 风险边界

- Renderer 不接收绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 重构期间每个 PR 必须保持现有业务可运行，禁止跨多轮留下不可用中间态。
- Beta 2 仍可能没有商业代码签名，SmartScreen 可显示未知发布者。