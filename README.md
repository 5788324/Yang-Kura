# Yang-Kura

> 当前版本：`0.169.0-beta.2`  
> 代码事实来源：GitHub `main`  
> 当前阶段：Beta 2 个人日用版已发布；进入长期日用维护

Yang-Kura 是个人使用、不商业化、不对外分享的 Windows 本地音频媒体库，面向 ASMR/RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript 和 Electron；当前数据路线为 Local JSON Index，SQLite 长期冻结。

## 当前能力

- 本地目录选择、扫描、`library-index.json` 写入、备份、恢复和读取。
- 正式首页、音声库、RJ 详情、音乐库及专辑/艺术家/文件夹钻取页面。
- 搜索、排序、筛选、收藏、多选、批量加入歌单或播放队列。
- HTMLAudio、mpv 子进程后端与自动 fallback。
- LRC、SRT、VTT、ASS 与双语字幕。
- 图片、视频、文本、文件外部打开和文件管理器定位。
- copy-only 与受控 move-only 导入事务、失败回滚和 OperationLog。
- ASMR/音乐本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider。
- 缺失文件检查、受控索引清理、备份保留和维护历史。
- 50,000 曲目生成数据性能基准。
- Windows portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## 发布状态

- Beta 1：`v0.168.0-beta.1`，历史 prerelease，资产已完成远端校验。
- Beta 2 个人日用版：[`v0.169.0-beta.2`](https://github.com/5788324/Yang-Kura/releases/tag/v0.169.0-beta.2)，已于 2026-07-17 发布。
- Release ID：`355486824`。
- 发布目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`。
- portable、NSIS setup 与 `SHA256SUMS.txt` 的远端文件名、大小、下载文件 SHA-256 和 GitHub digest 全部一致。
- 冻结证据：[`release/beta2-publication-state.json`](release/beta2-publication-state.json)。

## 当前主线

- [Issue #66：渐进式结构治理与质量提升](https://github.com/5788324/Yang-Kura/issues/66)

```text
真实使用 Bug
→ 日常 UI / 性能 / 播放体验优化
→ 技术债和代码质量治理
→ 小型且明确有收益的功能补全
```

Issue #65 的媒体库与个人日用版发布目标已完成。大型功能不会从历史待办自动恢复。

## U37 完成内容

- `HomeLibraryPage`：资源库状态、继续播放、最近播放、常用入口和歌单入口。
- `AsmrLibraryPage`：搜索、排序、多维筛选、网格/列表、多选和批量加入歌单。
- `RjDetailPage` / `RjMetadataDialog`：RJ 详情、音轨、字幕状态、个人记录、本地覆盖和 DLsite 选择性应用。
- `MusicLibraryPage`：歌曲、专辑、艺术家、文件夹四种视图及钻取详情。
- 音乐库保留播放、队列、收藏、外部打开、文件定位、元数据覆盖和大库渲染窗口。
- 旧 `MusicLibrary.tsx` 生产实现已移除，不保留长期双轨。

## U38 渐进式播放器治理

- U38-A 已完成 Queue、History 与 Persistence 分离。
- `useAudioPlayer.ts` 不再直接写队列快照、播放历史或旧兼容续播键。
- 下一步为 U38-B Controller 与 mpv / HTMLAudio Backend 边界，现有播放行为继续冻结。

## 开发原则

- 保留现有业务和必要的数据保护能力，不推倒重写。
- 项目仅供个人本地使用，不引入多租户、权限审批、遥测平台、商业合规或公共服务治理等负担。
- 简单、低风险且相关的任务默认合并完成，避免过度拆轮、重复 CI 和文档膨胀。
- 只有真实文件删除/移动/覆盖、数据迁移、安装发布等高影响操作保留专项隔离、备份、回滚和验收。
- 每修改一个用户链路，同步整理被触碰的高耦合业务模块。
- UI 必须遵守 [`docs/DESIGN.md`](docs/DESIGN.md)，日常层与 AI 维护层分离。

## 长期冻结的大功能

除非用户明确重新解冻，否则不启动：

- 正式下载器 / MVP130；
- SQLite 全面迁移；
- OpenList / WebDAV；
- Player Core v2 或新播放器内核；
- 完整 AI Agent；
- Arsm_Transcribe 正式集成；
- 云同步、在线账号和插件市场；
- 与本地媒体库日常使用无关的大型 Provider。

## 必要数据边界

- Renderer 不接收不必要的绝对路径或 `file://`。
- 不自动覆盖或删除真实媒体文件。
- 索引写入保留备份和读回校验。
- Provider 不自动覆盖用户本地元数据。
- 文件事务、安装和恢复实验使用临时目录或副本。

## 项目文档

- 当前状态：[`PROJECT_STATE.md`](PROJECT_STATE.md)
- 长期路线：[`PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md)
- UI 规则：[`docs/DESIGN.md`](docs/DESIGN.md)
- 当前交接：[`AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`](AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md)
- Beta 2 发布说明：[`docs/RELEASE_NOTES_0.169.0-beta.2.md`](docs/RELEASE_NOTES_0.169.0-beta.2.md)
