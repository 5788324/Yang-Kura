# Yang-Kura 当前项目交接

更新日期：2026-09-23

> **这是新对话的首要交接文档。不要依赖旧聊天记忆。**

## 1. 一句话状态

Yang-Kura 已经有可用 Windows 本地媒体库基础，但用户对当前 Desktop 的成熟度和顺滑度不满意；真实音声资源已 8TB+，因此项目进入 **Kura Desktop 2.0：大库 Core + 高质量 UI/UX** 阶段。

## 2. 已验证远端基线

```text
repository: 5788324/Yang-Kura
main: READ LIVE FROM GIT (do not hard-code current HEAD)
K2-R0 reference base: 18a62a958572efede50bbdd3446063785899ca9a
PR #94 / U42: merged
public version: 1.0.0-rc.1
public tag: v1.0.0-rc.1
```

旧文档中“main=72066aa / PR #94 Draft / U42 未合并”的描述已经过时。

## 3. K2-R0 已完成

用户于 2026-09-23 明确确认 `codex/k2-r0-validation-hygiene` 是上周最新可识别源码分支。审查确认它不包含额外业务源码，只包含验证卫生、TypeScript 检查范围与交接修复。

因此：

- K2-R0 已关闭；
- GitHub `main` 是唯一代码真源；
- K2-R2 SQLite Catalog foundation 已完成；
- K2-R3 Incremental Scanner + Artwork backend 已完成，真实库验收后置 K2-R9；
- K2-R4 Query / Pagination / Virtualization / Catalog IPC 已完成并通过 Windows CI；
- 当前主任务是 **K2-R5 Desktop 2.0 Design System + UI/UX**；
- Android 正式开发仍冻结，但允许同步设计 Android UI/Compose mapping。


## 4. 产品硬要求

### 个人项目

- 个人使用；
- 不商业化、不公开发行导向；
- 不需要复杂企业安全体系；
- 但必须可用、稳定、避免数据损坏。

### 真实规模

- 音声资源已经 **8TB+**；
- 后续继续增长。

### UI

用户强烈要求：

> **UI 必须好看、惊艳。**

不能再以“功能存在”为完成标准。必须重点优化：

- 视觉层级；
- 字体与留白；
- 封面表现；
- 动效；
- 页面切换；
- 播放器展开；
- 歌词/字幕；
- 大库滚动稳定性；
- 高频流程。

### 音乐

音乐与 RJ/ASMR 同为一级核心。

音乐体验参考：网易云、YesPlayMusic、Music You、Music Claw、AlgerMusicPlayer、Feishin、SPlayer。

RJ/长音频体验参考：KikoFlu、Kikoeru、Voice、Audiobookshelf。

## 5. 当前主技术决策

- Desktop 继续 React + Vite + TypeScript + Electron；
- mpv + HTMLAudio 既有播放成果保留，除非审计发现硬问题；
- SQLite/FTS5 升级为 Desktop 2.0 大库运行时主查询方向；
- `library-index.json` 保留兼容/导出/manifest，不再作为未来唯一主查询数据库；
- 扫描改为后台增量；
- 封面做缩略图缓存；
- UI 使用分页/虚拟化，不把全库塞进 React 状态；
- 不推倒重写已验证的 Importer / Player / Metadata 能力；
- Core 和新 UI 设计并行推进。

## 6. 当前优先顺序

```text
K2-R0  已完成：最新源码 ↔ GitHub 对账
K2-R1  审计证据持续补充
K2-R2  COMPLETE：SQLite / FTS5 Core
K2-R3  BACKEND COMPLETE：增量 Scanner + Thumbnail Cache
K2-R4  FUNCTIONAL COMPLETE：大库查询 / 分页 / 虚拟化
K2-R5  ACTIVE：新 Design System + App Shell
K2-R6  音乐库重做
K2-R7  音声库重做
K2-R8  Player / Lyrics / Motion 收口
K2-R9  8TB 实库验收
```

只有 K2-R9 以后才解冻 OpenList / Android **正式开发**。K2-R5 期间允许 Android 视觉方案、Design Token 和 Compose component mapping。

## 7. 后续 Android / OpenList 方向（当前冻结）

Android：不从零起步。当前优先候选是 APlayer Compose Fork，参考 KikoFlu、Voice、Rhythm、ListenUp。

OpenList：作为远程 SourceProvider；不把 WebDAV/OpenList 当媒体领域模型，不在 Android 每次启动递归扫描整个云盘。

## 8. Git / Drive 分工

### GitHub

唯一长期代码主仓库：

- branch；
- commit；
- PR；
- CI；
- merge；
- release。

ChatGPT 当前通过连接器拥有该仓库 push/maintain/admin 权限，可以直接管理 Git 流程。

### Google Drive

用于：

- 尚未推 Git 的本机源码 ZIP；
- 安装包；
- 截图/录屏；
- 大日志；
- Windows 实机结果；
- 阶段快照。

K2-R0 完成后，代码仍必须回归 GitHub。

## 9. 新对话读取顺序

1. `START_HERE.md`
2. 本文
3. `AI_HANDOFF/K2_R5_UI_MULTI_MODEL_HANDOFF.md`（K2-R5期间）
4. `PROJECT_STATE.md`
5. `TASKS.md`
6. `PROJECT_ROADMAP.md`
7. 需要历史原因时再读 `AI_HANDOFF/WORKLOG.md`

## 10. 接手后禁止立即做的事

- 不要继续旧 U42；
- 不要按旧 MVP 编号自动排下一个功能；
- 不要先做 Downloader；
- 不要先做 Android；
- 不要先做 OpenList；
- 不要因为 UI 不满意就推倒业务代码；
- 不要重新打开已完成的 K2-R0；后续以 GitHub `main` 实时 HEAD 为唯一代码基线。

