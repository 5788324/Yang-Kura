# Yang-Kura 当前项目交接

> 新对话或其他 AI 接手时的当前权威交接。代码事实以最新 GitHub `main` 为准；状态见 `PROJECT_STATE.md`，工作记录见 `AI_HANDOFF/WORKLOG.md`，长期顺序见 `PROJECT_ROADMAP.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
当前版本：0.169.0-beta.2
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
用途：ASMR/RJ 与普通音乐的个人本地音频媒体库
当前索引：Local JSON Index
Beta 1：已发布并完成远端资产校验
Beta 2：个人日用版已发布并完成远端资产校验
U34～U36：完成
U37-A：完成
U37-B：完成
U37-C：完成
U37-D：完成
当前任务：长期日用维护与 Issue #66 技术债治理
大型功能：长期冻结，除非用户明确重新解冻
```

必须从最新 `origin/main` 接手。禁止使用旧 ZIP、历史 MVP 包、旧工作区或文档中的旧固定 SHA 作为代码来源。

当前开放跟踪：

- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

Issue #65 已完成并关闭。

## 2. 发布事实

```text
tag：v0.169.0-beta.2
Release ID：355486824
目标提交：14bc78a81c827882efc232c6c6c12f0d8ed04542
发布时间：2026-07-17T05:21:02Z
资产：portable、NSIS setup、SHA256SUMS
证据：release/beta2-publication-state.json
```

三个远端资产的文件名、大小、下载文件 SHA-256 和 GitHub digest 已全部校验通过。

## 3. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `AI_HANDOFF/WORKLOG.md`
4. `PROJECT_ROADMAP.md`
5. `release/beta2-publication-state.json`
6. `docs/RELEASE_NOTES_0.169.0-beta.2.md`
7. `docs/architecture/ARCHITECTURE_AUDIT.md`
8. `docs/architecture/DEPENDENCY_MAP.md`
9. `docs/architecture/REFACTOR_BACKLOG.md`
10. `docs/DESIGN.md`
11. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
12. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 4. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、架构、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和发布。简单、低风险且相关的任务默认合并处理。

Codex 只处理自动化无法替代的真实本机、显示器/DPI、硬件、声卡、驱动、安装器或系统集成测试。Codex 默认只测试，不修改源码。

## 5. 已完成事实

### 核心产品

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载、数据保留和进程回收。

### U34～U37

- 完成架构审计、依赖图、重构待办和行为冻结。
- 建立统一 IPC 契约、两套语义主题和共享 UI；正式 AppShell、Router、Overlay 与 Main IPC 分域投入运行。
- 正式 `HomeLibraryPage`、`AsmrLibraryPage`、`RjDetailPage`、`RjMetadataDialog`、`MusicLibraryPage` 已替换旧生产路由。
- 音声库支持搜索、排序、多维筛选、网格/列表、多选和批量加入歌单。
- RJ 详情保留本地覆盖、DLsite 差异预览、播放、队列、收藏、字幕、外部打开和文件定位。
- 音乐库提供歌曲、专辑、艺术家、文件夹四视图及钻取详情。
- 删除旧 `src/components/MusicLibrary.tsx`，不保留双轨。
- U28～U32、stable regression、portable、NSIS、安装卸载和数据保留通过。

## 6. 当前任务：长期日用维护与技术债治理

```text
真实 Bug
→ 日常 UI / 性能 / 播放体验
→ 技术债和代码质量
→ 小型且明确有收益的功能
```

优先处理：

1. 数据丢失、索引损坏、导入回滚、双重播放、安装升级等阻断问题；
2. 播放、字幕、队列、搜索和大库性能；
3. 窗口/DPI、键盘、主题、动效和无障碍；
4. `electron/main.ts`、Settings、Diagnostics、播放器 Hook、`src/types.ts` 等高耦合模块；
5. 历史 verifier、package metadata 和测试结构清理。

明确不做：

- 不以新增大型功能数量为路线；
- 不同时推倒重写多个核心模块；
- 不从历史待办自动恢复冻结功能；
- 不引入商业发行、多人权限或企业级合规流程。

## 7. 长期冻结

除非用户明确重新解冻，否则禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 8. 执行效率硬规则

```text
一次全局搜索
→ 批量修改
→ targeted 验证
→ 一个 PR
→ PR 收口时一次完整稳定回归
→ squash merge
```

- 禁止逐个失败反复推送和重复完整 CI。
- 禁止新增隐藏 DOM、HTML 注释或 package metadata 锚点。
- CI 状态只在启动、完成和合并等关键节点检查。

## 9. UI 与风险边界

- 中文用户界面；工程术语只进入 AI 维护或开发文档。
- 内容优先；主题必须改变完整材质系统并支持 reduced-motion。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- Renderer 不接收不必要的绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 当前项目不要求商业代码签名或公开分发标准。
