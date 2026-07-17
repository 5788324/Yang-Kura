# Yang-Kura

> 当前版本：`0.169.0-beta.2`  
> 代码事实来源：GitHub `main`  
> 当前阶段：U38-B Controller/Backend 分离完成；当前 U38-C Subtitle loader

Yang-Kura 是 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；当前索引为 Local JSON Index。

## 当前能力

- 本地目录选择、扫描、索引写入、读取、备份、恢复和维护。
- 首页、音声库、RJ 详情、音乐库、专辑/艺术家/文件夹详情。
- 搜索、排序、筛选、收藏、歌单、播放队列、历史和续播。
- HTMLAudio、mpv、自动 fallback、Seek、音量、静音和完成策略。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、恢复和 DLsite 单 RJ Provider。
- portable、NSIS、安装、重复安装、卸载和用户数据保留。

## 发布状态

- Beta 2 个人日用版：`v0.169.0-beta.2`，已于 2026-07-17 发布。
- Release ID：`355486824`。
- 发布证据：`release/beta2-publication-state.json`。
- portable、NSIS setup 和 SHA256SUMS 的远端文件名、大小、SHA-256 与 digest 均已校验。

## 当前主线

Issue #66：渐进式结构治理与质量提升。

```text
真实使用 Bug
→ 日常 UI / 性能 / 播放体验
→ 技术债和代码质量
→ 小型且明确有收益的补充
```

## U38 播放器治理

- U38-A 已完成 Queue、History 与 Persistence 分离。
- U38-B 已完成 Controller 与 Backend 分离，新增 `usePlayerBackend.ts` 集中 HTMLAudio、mpv、媒体解析、fallback、Seek 和后端同步。
- `useAudioPlayer.ts` 保留 Controller、完成策略、用户操作和字幕协调。
- 当前任务为 U38-C Subtitle loader 与字幕状态。
- mpv/HTMLAudio fallback、Queue、History、续播、完成策略和字幕显示行为继续冻结。

## 开发原则

- 不推倒重写，不保留长期新旧双轨。
- 修改哪个用户链路，就同步整理该链路。
- 简单、低风险且相关的任务合并处理。
- 文件写入、迁移、导入回滚、安装和发布保留专项验收。
- Renderer 不接收不必要的绝对路径或 `file://`。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号和插件市场，除非用户明确重新解冻。

## 文档入口

- `PROJECT_STATE.md`
- `PROJECT_ROADMAP.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- `AI_HANDOFF/WORKLOG.md`
- `docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md`
- `docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md`
- `docs/DESIGN.md`
