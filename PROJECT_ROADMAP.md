# PROJECT_ROADMAP — Kura Desktop 2.0

更新日期：2026-09-23

## 总目标

将现有 Windows 本地媒体库升级为一个面向 **8TB+ 且持续增长** 的私人 RJ/ASMR + 音乐双核心媒体库：

- 大库仍然快；
- UI 好看、惊艳、成熟；
- 音乐与 RJ 都是一级产品；
- 尽量复用成熟开源播放器/媒体库实现；
- 个人项目安全边界保持实用，不做企业级过度工程。

## 项目控制规则

同一时间最多：
- **一个主开发阶段**；
- **一个轻量设计/研究支线**。

Android、OpenList、Downloader、转录、云同步在 Desktop 2.0 稳定前不并行展开。

---

## K2-R0 — 基线统一【完成】

- 找回并审查上周最新可识别源码；
- 合并验证卫生和交接修复；
- 修复旧 U42/静态 SHA 交接漂移；
- GitHub `main` 恢复为唯一代码真源；
- 清理历史 archive、重复交接、过期 RC/MVP 文档与工作流。

退出条件：新对话只需 START_HERE → HANDOFF → STATE → TASKS → ROADMAP 即可恢复项目。

---

## K2-R1 — Desktop 2.0 真实审计【当前】

### R1-A 依赖与运行时基线
- 分析当前 npm audit 1 moderate + 7 high；
- 区分 dev-only / runtime 风险；
- 评估 Electron 39 升级边界；
- 只做必要升级，不用 `npm audit fix --force` 盲升。

### R1-B 8TB 大库与 Core 审计
- 统计 Work / Track / File / Subtitle / Cover / 目录深度；
- 冷启动、热启动、读取已有 Index；
- 全量/增量扫描耗时与内存；
- 搜索、筛选、排序、滚动；
- 封面读取与缓存；
- React 状态和 JSON Index 的瓶颈。

### R1-C UI/UX 与产品审计
- 找出“不顺、不成熟”的 Top 10；
- 音乐：网易云、YesPlayMusic、Music You、Music Claw、Feishin、Alger；
- RJ：KikoFlu、Kikoeru、Voice、Audiobookshelf；
- 产出 2～3 个视觉方向，不无限生成 AI 方案。

交付：`docs/DESKTOP2_AUDIT.md`，并确定 K2-R2～R8 的最终顺序。

---

## K2-R2 — Local Library DB v2【Foundation Complete / Sidecar】

目标：把 `library-index.json` 从运行时主查询源降级为兼容/导出格式。

任务：
- SQLite schema；
- FTS5；
- Work / Album / Track / Artist / Circle / CV / Tag / Attachment / Source；
- JSON Index 导入兼容；
- schemaVersion + migration；
- 备份/恢复；
- 不直接触碰用户媒体本体。

退出条件：现有资源库可原子导入 DB，旧 JSON 仍可回退；已满足。Primary-read cutover 明确延后到 K2-R3/R4。

---

## K2-R3 — 增量 Scanner + Artwork Cache

任务：
- 文件指纹和目录变更检测；
- 新增/修改/删除增量扫描；
- 后台 Worker，不阻塞启动；
- 可取消、失败可恢复；
- 256/512 缩略图缓存；
- 原图按需加载；
- 为 Local / OpenList 统一 SourceProvider 边界预留。

退出条件：启动先打开旧数据库，扫描在后台继续，媒体本体零误删。

---

## K2-R4 — 大库 Query + 前端性能

任务：
- DB 搜索/排序/筛选；
- cursor/page 查询；
- 虚拟列表/网格；
- 首页只查询 LIMIT 数据；
- 不把整库常驻 React state；
- 搜索与滚动性能基准；
- 内存和封面加载控制。

退出条件：真实大库浏览、搜索、切页保持稳定，不因库规模线性拖垮 UI。

---

## K2-R5 — 全新 Design System + App Shell

任务：
- 重新定义视觉语言、Typography、Spacing、Motion、Material；
- Sidebar / TopBar / Search / PlayerBar；
- Light/Dark；
- 封面取色与动态背景；
- 页面转场和返回状态；
- 减少工程面板感；
- 诊断/维护全部退到高级入口。

退出条件：形成可复用组件系统，不再逐页面手工拼 UI。

---

## K2-R6 — 音乐体验

音乐是一级核心。

任务：
- Songs / Albums / Artists / Folders / Playlists；
- 专辑页、艺术家页；
- 收藏、最近播放、最近加入、播放次数；
- Queue；
- Lyrics / 逐词歌词能力；
- 沉浸播放页；
- 本地元数据体验；
- 音乐搜索/筛选。

退出条件：即使完全不使用 RJ，Kura 也能作为成熟音乐播放器长期使用。

---

## K2-R7 — RJ / ASMR 体验

任务：
- Works / Circle / CV / Tags / Series；
- 原始 Folder Tree；
- Track / Chapter；
- Subtitle；
- Image/Text/PDF 等 Attachment；
- Progress / Bookmark / Rating；
- 长音频 Resume / Sleep / Speed；
- RJ 专用搜索与筛选。

退出条件：作品级体验不再只是“文件夹播放器”。

---

## K2-R8 — Player / System Integration / Polish

任务：
- Playback State 与页面彻底解耦；
- mpv + HTMLAudio fallback 重新审计；
- Seek / Queue / Resume / Error recovery；
- Windows Media Session / 快捷键按收益增强；
- 歌词、字幕、封面、转场动效收口；
- 弱网/未来 Remote source 状态模型预留。

退出条件：切页面、切库、重启应用都不破坏播放状态。

---

## K2-R9 — 8TB+ 真实库验收

必须在真实资源库验证：
- 冷/热启动；
- 增量扫描；
- 搜索/筛选/排序；
- 快速滚动；
- 音乐和 RJ 详情；
- 长音频播放/Seek/Resume；
- 页面返回；
- 数据库备份/恢复；
- 媒体文件数量保护；
- 无误删、无异常移动、无 silent corruption。

只有 R9 通过，Desktop 2.0 才算稳定基础。

---

## K3 — OpenList / Remote Library【后续】

- Media Identity + SourceRef；
- OpenList / WebDAV Adapter；
- Catalog 与 User State 分离；
- Remote URL resolve-at-play-time；
- Cache / Offline；
- 进度/收藏/歌单同步。

---

## K4 — Android【后续】

不从零造播放器。

优先：
- APlayer Compose：底座候选；
- KikoFlu：RJ 产品逻辑；
- Voice：长音频；
- Rhythm：Compose/Media3/Room；
- ListenUp：offline-first/sync。

首版 Android 以消费/播放为主，不移植 Desktop 的维护与批处理工具。
