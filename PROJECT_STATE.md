# PROJECT_STATE

更新日期：2026-09-23

## 1. 已验证的远端事实

```text
repository: 5788324/Yang-Kura
remote main: READ LIVE FROM GIT (do not hard-code current HEAD)
K2-R0 reference base before validation-hygiene branch: 18a62a958572efede50bbdd3446063785899ca9a
PR #94 / U42: MERGED
public release: 1.0.0-rc.1
public tag: v1.0.0-rc.1
package version on main: 1.0.0-rc.1
```

注意：`1.0.0-rc.1` Release 早于 U42 合并，因此“公开 Release”与“main 最新代码”不是完全同一快照。

## 2. K2-R0 基线对账结论

用户在 2026-09-23 明确确认：`codex/k2-r0-validation-hygiene` 是上周最新可识别源码分支。

审查结果：

- 分支基于 `18a62a958572efede50bbdd3446063785899ca9a`，ahead 1 / behind 0；
- 原提交 `a58070365fde613d6ccb07faf9b0627bfdaf8fcf` 只包含验证卫生、TypeScript 检查范围和交接记录；
- 没有 Scanner / Library Tree / Player / Importer / Media Index 等业务源码改动；
- 当前可识别的“上周最新源码”因此等价于既有业务源码 + 本轮验证/交接卫生修复；
- 未跟踪验收资料、报告与 `RJ_AI_ANALYSIS/` 不进入 Git。

**K2-R0 在该分支审查并合并后关闭；GitHub `main` 重新成为唯一代码真源。**


## 3. 当前产品能力（远端主线）

当前 main 已具备：

- React + Vite + TypeScript + Electron Windows 桌面壳；
- ASMR/RJ 与普通音乐双资源库；
- 本地目录授权和扫描；
- Local JSON Index 写入、读取、备份和维护；
- HTMLAudio + 可选 mpv、Seek、Queue、History、续播；
- LRC / SRT / VTT / ASS 字幕；
- 歌单、收藏、播放历史；
- copy/move Importer、冲突检查、操作记录、失败回滚；
- 本地元数据覆盖与单 RJ DLsite Provider；
- 外部打开；
- portable / NSIS 构建链；
- U42 日常界面精简。

## 4. 当前真实问题

### P0：Desktop 2.0 真实瓶颈尚未完成审计

K2-R1 为当前主任务：以现有代码和真实 8TB+ 资源库确认启动、扫描、搜索、滚动、播放和 UI 流程的主要瓶颈，再决定 K2-R2～R8 的实际实现顺序。


### P1：依赖安全基线需要刷新

2026-09-23 PR #97 的 Windows workflows 在 `npm audit` 阶段被新的安全公告阻断：当前 lockfile 报告 1 moderate + 7 high。已确认本分支没有修改 `package.json` / `package-lock.json`，因此这是既有依赖基线随时间产生的新债务，不是 K2-R0 diff 引入的回归。

其中包含 Electron 39 间接依赖 `extract-zip` 的 high advisory。K2-R1 lockfile 反向依赖检查确认当前 1 moderate + 7 high 全部位于 dev/tooling 链，生产 dependencies 不在这批 high 命中内。CI 已改为 production audit 硬阻断、完整 tooling audit 继续报告。Electron 39 本身已超出当前官方维护窗口，仍必须单独升级，不能用 dev-only 分类掩盖运行时版本债务。

### P1：现有 Scanner 有明确规模上限

当前生产 dry-run 默认 10,000 entries、硬上限 50,000 entries，并采用串行目录递归 + 单文件 stat + 内存累积结果。对 8TB+ 库必须由 K2-R3 的增量数据库 Scanner 替代，而不是继续放大 JSON/内存上限。

### P1：8TB+ 大库架构不够长期

现有 Local JSON Index 已经完成过约 50,000 track 合成基准，但用户真实资源规模已经达到 8TB+，后续还会增长。

Desktop 2.0 需要：

- SQLite 作为本地运行时主索引/查询库；
- FTS5 全文搜索；
- 增量扫描；
- 后台扫描，不阻塞应用启动；
- 缩略图缓存；
- 分页 / 虚拟列表；
- 避免前端一次性载入和 filter/sort 整个大库；
- `library-index.json` 降级为兼容 / 导出 / manifest，而不是长期唯一查询数据库。

### P1：Desktop 使用体验仍不成熟

用户明确反馈：现有成果“使用不太顺畅和成熟”。

Desktop 2.0 的评价标准不再是“功能存在”，而是：

- 启动快；
- 搜索即时；
- 滚动稳定；
- 页面切换不闪、不丢状态；
- 播放不受页面切换影响；
- 封面加载稳定；
- 操作层级清晰；
- 高频动作少步骤；
- 界面达到成熟音乐播放器级别。

### P1：UI 必须重做为高质量产品体验

硬要求：

- 好看、惊艳；
- 不接受“卡片 + 渐变 + 玻璃”堆砌式 AI UI；
- 音乐体验参考网易云、YesPlayMusic、Music You、Music Claw、AlgerMusicPlayer；
- Desktop 播放器工程参考 Feishin / SPlayer-Next；
- RJ 产品体验参考 KikoFlu / Kikoeru / Voice / Audiobookshelf；
- 最终必须形成 Kura 自己的视觉语言。

### P1：音乐必须成为一级核心

Kura 不是“RJ 播放器顺便听音乐”。

正式产品结构：

```text
Kura
├─ 首页
├─ 音声
├─ 音乐
├─ 歌单 / 收藏
├─ 导入
└─ 设置
```

音乐侧至少长期覆盖：

- Track / Album / Artist / Folder / Playlist；
- 收藏、最近播放、最近加入；
- 歌词 / 逐词歌词能力预留；
- 专辑和艺术家详情；
- 高质量播放页和队列。

RJ 侧保持 Work / Circle / CV / Tags / Folder Tree / Subtitle / Attachment / Progress / Bookmark 等独立语义。

## 5. 当前战略决策

1. **不推倒重写现有 Kura。** 保留已验证业务链，重做 Core 查询层和 UX。
2. **Desktop 2.0 优先。** Android / OpenList 延后。
3. **优先复用成熟项目。** 不从零重造播放器、WebDAV、后台播放、音乐库基础结构。
4. **个人项目快速模式。** 安全重点是数据不丢、文件不误删/覆盖、操作可恢复；不做企业级复杂权限。
5. **Core 与 UI 并行。** 大库架构和新 UI Design Prototype 同时推进。
6. **Kura Desktop 技术栈暂不更换。** 继续 React/Electron/mpv，除非 K2-R0 审计发现硬阻塞。
7. **Android 后续优先基于成熟开源工程二开。** 当前首选候选：APlayer Compose；参考 KikoFlu、Voice、Rhythm、ListenUp。
8. **OpenList 后续作为 SourceProvider。** 不让 OpenList/WebDAV 绑死媒体领域模型。

## 6. 当前冻结范围

在 Desktop 2.0 核心体验通过前冻结：

- Downloader 扩展；
- 转录工作流集成；
- Android 正式开发；
- OpenList 正式接入；
- 云同步；
- 插件市场；
- AI Agent 大功能；
- 与当前目标无关的架构洁癖式重构。

## 7. 仓库清理与主线策略

2026-09-23 起：

- `main` 是唯一长期开发主线；
- 历史 `archive/`、重复 handoff、旧 MVP/Uxx/RC 文档不再保留在当前工作树，历史通过 Git commit/PR 查询；
- 旧 U32/U40/U41 release/acceptance workflows 退出当前 CI；
- 当前 CI 只保留 branch/docs/architecture/player/ui 这类仍有开发价值的门禁；
- 历史测试脚本暂不一次性删除，K2-R1 根据实际依赖再做第二轮脚本精简，避免误删有效回归。
- 当前 `main` 工作树已从 1038 个 tracked 文件降到 296 个；workflow 9→5，docs 130→26，AI_HANDOFF 11→3。
- 远端仍有 92 个非 main 历史 branch refs。当前 GitHub 连接器没有 delete-ref 能力，因此这些 refs 尚未实际删除；它们不再作为开发真源，待 Codex/原生 Git 一次性清理。

## 8. Git / Drive 事实源

- **GitHub：唯一代码主仓库和提交历史。**
- **Google Drive：本机未推源码、安装包、测试证据、大日志、截图/视频和阶段快照。**
- Drive 不作为长期代码真源。
- K2-R0 完成后，新的统一源码必须重新回到 GitHub。

