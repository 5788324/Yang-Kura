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
Beta 2：个人日用版发布候选
U34～U36：完成
U37-A：完成
U37-B：完成
U37-C：完成
U37-D：完成
当前任务：发布 0.169.0 Beta 2 个人日用版
大型功能：长期冻结，除非用户明确重新解冻
```

必须从最新 `origin/main` 接手。禁止使用旧 ZIP、历史 MVP 包、旧工作区或文档中的旧固定 SHA 作为代码来源。

开放跟踪：

- [Issue #65：完成媒体库并发布个人日用版](https://github.com/5788324/Yang-Kura/issues/65)
- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `AI_HANDOFF/WORKLOG.md`
4. `PROJECT_ROADMAP.md`
5. `docs/RELEASE_NOTES_0.169.0-beta.2.md`
6. `release/u33-release-plan.json`
7. `docs/architecture/ARCHITECTURE_AUDIT.md`
8. `docs/architecture/DEPENDENCY_MAP.md`
9. `docs/architecture/REFACTOR_BACKLOG.md`
10. `docs/architecture/U37_EXECUTION_PLAN.md`
11. `docs/DESIGN.md`
12. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
13. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、架构、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和发布。简单、低风险且相关的任务默认合并处理。

Codex 只处理自动化无法替代的真实本机、显示器/DPI、硬件、声卡、驱动、安装器或系统集成测试。Codex 默认只测试，不修改源码。

## 4. 已完成事实

### 核心产品

- ASMR/RJ 与普通音乐双资源库。
- Local JSON Index 写入、读取、备份、恢复和维护。
- HTMLAudio、mpv、自动 fallback、Seek、队列、历史和续播。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、失败回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载、数据保留和进程回收。
- `v0.168.0-beta.1` prerelease 与三个资产完成远端校验。

### U34～U36

- 完成架构审计、依赖图、重构待办和行为冻结。
- 建立唯一 `IPC_CHANNELS`、`IpcResult<T>`、`IpcError`。
- 建立两套语义主题与共享 UI primitives。
- 正式 AppShell、Router、Overlay 与 Main IPC 分域投入运行。

### U37

- 正式 `HomeLibraryPage`、`AsmrLibraryPage`、`RjDetailPage`、`RjMetadataDialog`、`MusicLibraryPage` 已替换旧生产路由。
- 音声库支持搜索、排序、多维筛选、网格/列表、多选和批量加入歌单。
- RJ 详情保留本地覆盖、DLsite 差异预览、播放、队列、收藏、字幕、外部打开和文件定位。
- 音乐库提供歌曲、专辑、艺术家、文件夹四视图及钻取详情。
- 音乐库支持搜索、排序、仅看收藏、多选、全选当前结果和批量加入队列。
- 删除旧 `src/components/MusicLibrary.tsx`，不保留双轨。
- U28～U32、stable regression、portable、NSIS、安装卸载和数据保留已在 U37-D 收口时通过。

## 5. 当前任务：发布 0.169.0 Beta 2 个人日用版

```text
版本与锁文件一致
+ 发布计划和 Release Notes
+ tag / Release 冲突检查
+ TypeScript / U28～U32 / stable regression
+ portable / NSIS / 安装卸载
+ main-only GitHub prerelease
+ 资产名、大小、SHA-256 回读
+ 关闭 Issue #65
```

执行顺序：

1. 完成发布 PR 的静态和真实门禁。
2. 合并到 `main`。
3. `Personal Beta Release` 工作流构建并发布 `v0.169.0-beta.2`。
4. 读取 publication artifact，记录 release id、目标提交、发布时间和资产摘要。
5. 更新状态文档，关闭 Issue #65。
6. 进入真实使用维护和 Issue #66 技术债治理。

明确不做：

- 不追加新的媒体功能；
- 不同时重写播放器核心、Settings、Diagnostics 或导入器；
- 不进行 SQLite、OpenList/WebDAV、下载器、转录或 AI Agent 开发；
- 不引入商业发行、多人权限或企业级合规流程。

## 6. 发布后的工作模式

```text
真实 Bug
→ 日常 UI / 性能 / 播放体验
→ 技术债和代码质量
→ 小型且明确有收益的功能
```

## 7. 技术债治理

优先处理：

- `electron/main.ts` 继续按领域下沉实现；
- Settings 日常设置与 AI 维护分离；
- Diagnostics 历史运行时内容归档；
- `useAudioPlayer.ts` 拆分 Controller、Backend、Queue/History、Subtitle 与持久化；
- `src/types.ts` 按领域拆分；
- 历史 MVP verifier 和 package 元数据退出日常运行时；
- 新目录和迁移目录逐步收紧 TypeScript strict。

固定方式：修改哪个用户链路，就同步整理该链路；不推倒重写、不为目录整齐搬代码、不长期保留新旧双轨。

## 8. 长期冻结

除非用户明确重新解冻，否则禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 9. 执行效率硬规则

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

## 10. UI 与风险边界

- 中文用户界面；工程术语只进入 AI 维护或开发文档。
- 内容优先；主题必须改变完整材质系统并支持 reduced-motion。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- Renderer 不接收不必要的绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 当前项目不要求商业代码签名或公开分发标准。
