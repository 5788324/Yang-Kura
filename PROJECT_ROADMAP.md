# PROJECT_ROADMAP — Kura Desktop 2.0

更新日期：2026-09-23

## 0. 总目标

将当前“已经能用的 Windows 本地媒体库 Beta”升级为：

> **面向 8TB+ 且持续增长的 RJ/ASMR + 音乐双核心私人媒体库。**

评价指标：

- 大库仍然快；
- UI 足够惊艳；
- 日常操作足够顺；
- 音乐和 RJ 都达到成熟产品水平；
- 基础业务尽量复用成熟开源项目和已验证思路；
- 保持个人项目可维护性，不做企业级过度工程。

## 1. 范围控制

项目只允许同时存在 **一个主开发阶段 + 一个设计/研究支线**。

当前：

```text
主开发阶段：K2-R1 Desktop 2.0 真实审计
设计/研究支线：Desktop 2.0 UI Benchmark + 大库架构参考
```

Android、OpenList、Downloader、转录等均进入 Parking Lot，不并行开工。

---

## Horizon A — 统一基线与真实问题审计

### K2-R0：最新源码对账【已完成】

完成结论：

- 用户确认 `codex/k2-r0-validation-hygiene` 为上周最新可识别源码分支；
- 与 K2-R0 参考基线相比，没有额外业务源码，只有验证卫生与交接修复；
- 合并后 GitHub `main` 为唯一代码真源；
- 当前转入 K2-R1。


### K2-R1：真实使用 + 8TB 大库审计

不是做企业级报告，而是回答实际问题：

- 实际 Work / Track / File / Subtitle / Cover 数量；
- 目录深度与典型作品结构；
- 启动、扫描、搜索、切页、滚动、播放哪里最卡/最不顺；
- 哪些功能高频、哪些应隐藏；
- 当前 JSON 查询与 React 状态的主要瓶颈；
- 用户最不满意的 10 个真实使用点。

交付：一份短的 `DESKTOP2_AUDIT.md` + 可执行任务排序。

---

## Horizon B — Desktop 2.0 大库 Core

### K2-R2：Local Library DB v2

目标：

```text
File System
→ Incremental Scanner
→ SQLite / FTS5
→ Query API
→ React UI
```

原则：

- SQLite 成为运行时查询主库；
- `library-index.json` 保留兼容、导出、manifest 能力；
- 不一次性把所有用户状态迁进数据库；
- 先迁最影响大库性能的媒体索引与搜索。

优先表/实体：

- works / albums
- tracks
- artists / circles / CV
- tags
- attachments
- sources / relative paths
- scan fingerprints
- artwork cache references

### K2-R3：增量扫描 + Thumbnail Cache

必须做到：

- 启动直接读取已有数据库；
- 扫描后台进行；
- 新增/修改/删除增量处理；
- 不因全库扫描阻塞日常播放；
- 封面生成 256/512 等级缩略图；
- UI 不加载大量原图；
- 支持取消/暂停/失败恢复的最小实现。

### K2-R4：大库查询与前端渲染

- DB 负责搜索、筛选、排序；
- FTS5 搜索；
- 分页 / cursor；
- 虚拟列表 / 虚拟网格；
- 首页只查询最近播放/未听完/最近加入等 LIMIT 数据；
- 禁止把整库对象常驻 React 状态后反复 filter/sort。

---

## Horizon C — Desktop 2.0 UI / UX

该 Horizon 与 B 可并行做设计原型，但正式迁移必须以稳定数据接口为基础。

### K2-R5：Design Benchmark + App Shell

UI 硬要求：**好看、惊艳、成熟、长时间使用不腻。**

音乐参考：

- 网易云音乐；
- YesPlayMusic；
- Music You；
- Music Claw；
- AlgerMusicPlayer；
- Feishin；
- SPlayer / SPlayer-Next。

RJ/长音频参考：

- KikoFlu；
- Kikoeru；
- Voice；
- Audiobookshelf。

原则：

- 参考成熟产品，不做简单 clone；
- 少边框、少工程信息；
- 封面、字体、层级、留白、动态色和动效形成完整设计系统；
- 主界面禁止 Dashboard/诊断面板感；
- 诊断与修复继续隐藏在高级入口。

### K2-R6：音乐库全面升级

音乐是一级核心：

- 首页音乐区域；
- Songs / Albums / Artists / Folders / Playlists；
- 专辑详情；
- 艺术家详情；
- 高质量队列；
- 收藏、最近播放、最近加入；
- 歌词体验；
- 播放器展开页。

### K2-R7：音声库全面升级

- Works / Circle / CV / Tags / Folder；
- Work Detail；
- Track / Chapter；
- 原始文件树；
- 字幕；
- 附件；
- 作品进度；
- 书签；
- 大库筛选。

### K2-R8：播放器与动效收口

- 经典 / 沉浸 / 歌词类体验重新评审，不要求沿用旧三模式形式；
- 播放状态与页面彻底解耦；
- 队列稳定；
- 返回页面保留浏览位置；
- 封面取色和动态背景可控；
- 减少动态效果模式；
- Windows 系统媒体体验按收益决定是否增强。

---

## Horizon D — 8TB 实库验收

### K2-R9：真实大库验收

至少验证：

- 冷启动 / 热启动；
- 初始数据库读取；
- 后台增量扫描；
- 搜索；
- 多条件筛选；
- 网格快速滚动；
- 作品详情；
- 音乐专辑/艺术家详情；
- 长音频播放和 Seek；
- 页面切换与返回；
- 数据库备份/恢复；
- 媒体文件不误删、不异常移动。

只有 R9 通过，Desktop 2.0 才进入“稳定基础”。

---

## Horizon E — Remote / Android【冻结，Desktop 2.0 稳定后启动】

### 后续顺序

```text
SourceProvider 抽象
→ OpenList POC
→ Media Identity / Catalog / User State
→ Windows Remote Library
→ Android
```

Android 不从零写基础播放器。当前候选：

- APlayer Compose：主底座候选；
- KikoFlu：RJ 产品模型参考；
- Voice：长音频进度/书签/睡眠等参考；
- Rhythm：Compose/Media3/Room 工程参考；
- ListenUp：offline-first / sync 参考。

OpenList 负责聚合存储，但不成为 Kura 媒体数据库本身。

---

## 2. 明确不做

除非用户以后明确改变目标：

- 企业级 RBAC；
- 多租户；
- 公网商业服务；
- 复杂服务器集群；
- 为架构“纯洁”而重写整个项目；
- 自研音频解码器；
- 自研 WebDAV 协议栈（有成熟实现可复用时）；
- 同时开发 Desktop、Android、OpenList、Downloader、转录五条主线。

