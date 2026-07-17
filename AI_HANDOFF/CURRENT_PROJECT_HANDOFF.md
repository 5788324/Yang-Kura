# Yang-Kura 当前项目交接

> **用途：新对话、ChatGPT、Codex 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 代码事实以最新 GitHub `main` 为准；状态见 `PROJECT_STATE.md`，工作记录见 `AI_HANDOFF/WORKLOG.md`，长期顺序见 `PROJECT_ROADMAP.md`，UI 规则见 `docs/DESIGN.md`。

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
U34～U36：完成
U37-A：完成
U37-B：完成
U37-C：完成
当前任务：U37-D 音乐库与详情 UI
发布条件：媒体库正式页面完成并通过 Windows 发布候选
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
5. `docs/architecture/ARCHITECTURE_AUDIT.md`
6. `docs/architecture/DEPENDENCY_MAP.md`
7. `docs/architecture/REFACTOR_BACKLOG.md`
8. `docs/architecture/U37_EXECUTION_PLAN.md`
9. `docs/DESIGN.md`
10. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
11. `docs/RELEASE_NOTES_0.168.0-beta.1.md`
12. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、架构、代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、文档、合并和发布。简单、低风险且相关的任务默认合并处理。

Codex 只处理自动化无法替代的真实本机、显示器/DPI、硬件、声卡、驱动、安装器或系统集成测试。Codex 默认只测试，不修改源码。

## 4. 个人项目执行政策

Yang-Kura 仅供个人本地使用，不商业化、不对外分享。因此：

- 不引入多人权限、审批流、遥测平台、商业合规或公共服务治理等额外负担；
- 风险控制与实际影响成比例；
- 文案、局部 UI、选择器、轻量逻辑、测试和文档默认走快速通道；
- 同一用户链路上的多个小任务允许合并到一个 PR；
- 不为每个小修改重复执行完整 Windows、portable、NSIS 和历史发布链；
- 真实文件删除/移动/覆盖、数据迁移、安装发布等高影响操作仍使用临时目录或副本、备份、回滚和专项验收。

必须保留的边界只针对真实个人媒体库损坏风险：路径 token、Index 备份与读回、文件事务不覆盖、导入回滚、安装数据保留和进程回收。

## 5. 已完成事实

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
- 建立暮夜琥珀、雾光象牙语义 Token 与共享 UI primitives。
- 两套正式主题与生产 AppShell 投入运行。
- 建立统一导航注册表和 Preload 请求合同。
- 拆出 `TopBar.tsx`、`AppRouter.tsx`、`QueueDrawer.tsx`、`PlayerOverlayHost.tsx`。
- Main 注册层按 Library、Media、Player、Metadata、Importer 分域。

### U37-A / U37-B / U37-C

- 首页、音声库、RJ 详情和音乐库具备页面级错误隔离和原地重试。
- 正式 `HomeLibraryPage`、`AsmrLibraryPage` 已替换旧生产路由。
- 音声库支持搜索、排序、社团、声优、标签、来源、字幕、播放和个人状态筛选。
- 网格与列表使用共享 `MediaCard`、`TrackRow`，支持多选和批量加入歌单。
- 正式 `RjDetailPage` 与 `RjMetadataDialog` 已替换旧 RJ 详情生产路由。
- RJ 详情保留本地覆盖、清除覆盖、DLsite 查询、差异预览、选择性应用、播放、队列、收藏、外部打开和文件管理器定位。
- 评分、听音状态和个人笔记写入本地覆盖层，不修改媒体文件。

## 6. 当前任务：U37-D 音乐库与详情 UI

```text
歌曲 / 专辑 / 艺术家 / 文件夹视图统一
+ 搜索、排序、收藏筛选和多选
+ 批量加入队列
+ 专辑 / 艺术家 / 文件夹钻取页面
+ MediaCard / TrackRow 共享组件
+ 外部打开和文件管理器反馈
+ 深浅主题、小窗口、键盘和空状态全矩阵验收
```

执行顺序：

1. 审计现有 `MusicLibrary.tsx` 的视图、筛选、钻取和元数据编辑行为。
2. 新建正式音乐库 feature 页面和详情组件，不继续扩大历史巨型组件。
3. 先迁移歌曲列表和专辑封面墙，再迁移艺术家、文件夹和钻取详情。
4. 保持播放、队列、收藏、音乐元数据覆盖、外部打开和大库渲染窗口语义不变。
5. 同步拆分被触碰的音乐库状态和详情职责，不保留长期双轨实现。
6. 完成 U37 全主题、窗口、键盘、空状态和 Electron 回归后进入 Windows 发布候选。

明确不做：

- 不同时重写播放器核心；
- 不同时重写 Settings、Diagnostics 或导入器；
- 不进行 SQLite、OpenList/WebDAV、下载器、转录或 AI Agent 开发；
- 不新增历史字符串 verifier 锚点。

## 7. 个人日用版发布

U37-D 完成后立即进入 Windows 发布候选。首次日用发布不再等待 U38～U40 全部完成。

必须确认：

- 媒体库主要日常页面完成正式 UI 迁移；
- 扫描、Index、播放、字幕、歌单、队列、导入、元数据和维护无回归；
- 无数据丢失、索引损坏、导入回滚失败或双重播放 Blocker；
- portable、NSIS、安装、卸载、数据保留和进程回收通过；
- 发布说明记录已知限制。

发布后进入长期日用维护：真实 Bug、UI/性能/播放体验、技术债和小型功能补全。

## 8. 技术债治理

技术债是持续主线，见 Issue #66。优先处理：

- `electron/main.ts` 继续按领域下沉实现；
- Settings 日常设置与 AI 维护分离；
- Diagnostics 历史运行时内容归档；
- `useAudioPlayer.ts` 拆分 Controller、Backend、Queue/History、Subtitle 与持久化；
- `src/types.ts` 按领域拆分；
- 历史 MVP verifier 和 package 元数据退出日常运行时；
- 新目录和迁移目录逐步收紧 TypeScript strict。

固定方式：修改哪个用户链路，就同步整理该链路；不推倒重写、不为目录整齐搬代码、不长期保留新旧双轨。

## 9. 长期冻结

除非用户明确重新解冻，否则禁止启动或合入：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号、插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 10. 执行效率硬规则

```text
一次全局搜索
→ 批量修改
→ targeted 验证
→ 一个 PR
→ PR 收口时一次完整稳定回归
→ squash merge
```

- 第一次提交前搜索旧阶段、固定 SHA、verifier 和 workflow path 依赖。
- 禁止逐个失败反复推送和重复完整 CI。
- 禁止新增隐藏 DOM、HTML 注释、`sr-only` 或 package metadata 锚点。
- 文档 PR 不打 portable/NSIS，不重建历史 Beta Release。
- CI 状态只在启动、完成和合并等关键节点检查。

## 11. UI 硬规则

- 中文用户界面；工程术语只进入 AI 维护或开发文档。
- 内容优先，不把所有信息塞进等宽卡片。
- 主题必须改变完整材质系统，不得只换强调色。
- 动画克制、统一并支持 reduced-motion。
- 日常界面不得展示 MVP、verifier、命令行、绝对路径或测试状态。
- 与 `docs/DESIGN.md` 冲突时，以 `docs/DESIGN.md` 为准。

## 12. 风险边界

- Renderer 不接收不必要的绝对路径或 `file://`。
- 真实媒体文件不参与破坏性自动测试。
- 导入、清理、恢复和安装实验使用临时目录或副本。
- 每个 PR 必须保持现有业务可运行，不留下跨轮不可用中间态。
- 当前项目不要求商业代码签名或公开分发标准。
