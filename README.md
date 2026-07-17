# Yang-Kura

> 当前版本：`0.169.0-beta.2`  
> 代码事实来源：GitHub `main`  
> 当前阶段：U39-D 雾光象牙浅色主题对比度修复完成；真实 Bug 和日常体验优先

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
→ 字幕与播放实际体验
→ 日常 UI / 性能
→ 修改相关链路时顺带处理技术债
```

## U38 播放器治理

- U38-A：Queue、History 与 Persistence 分离。
- U38-B：Controller 与 Backend 分离，`usePlayerBackend.ts` 集中 HTMLAudio、mpv、媒体解析、fallback、Seek 和后端同步。
- U38-C：`usePlayerSubtitles.ts` 集中字幕请求代次、过期结果丢弃、字幕来源变更重载、结果映射和当前曲目/Queue 状态同步。
- `useAudioPlayer.ts` 现在只保留 Controller、完成策略和用户操作协调。
- U38 连续结构治理已经收口，不再继续为了目录整齐拆播放器。

## U39 日常体验

### U39-A 播放器底栏主题一致性

- 底栏、曲目信息、播放控制、辅助控制和进度条统一使用语义主题 Token。
- 歌单菜单、音量弹层、Seek 预览、歌词浮窗和 Toast 跟随当前主题材质。
- 去除播放器结构层中的固定 zinc 深色，不改变品牌强调、错误、警告或收藏状态色。
- 增加全局播放器 region 语义和一致的键盘焦点反馈。
- 播放后端、Queue、字幕、Seek、续播和完成策略未改动。

### U39-B 设置与 AI 维护入口

- 设置页顶部提供独立 AI 维护入口，不把完整诊断作为一级导航展示。
- 维护概览只读取真实 Index 状态，性能诊断和完整历史诊断按需加载。
- 维护页支持返回设置；完整诊断支持返回维护概览。
- 现有资源库检修、索引清理和备份恢复能力暂不删除，后续按功能逐步迁移。

## U39-C 资源库授权持久化

- Electron Main 将 root token 与用户选择目录的映射保存在本机用户数据目录，重启后自动恢复。
- 重新选择既有资源库时会复用授权记录，或从现有 Index 接管旧 token，避免“读取成功但播放仍使用旧 token”。
- Renderer 只保存 token、显示名、资源库类型和选择时间，不保存绝对路径。
- 旧版本升级后需要重新选择原目录一次；之后无需每次重启重新授权。
- U28 已覆盖重启后直接读取和真实 WAV 播放。

## U39-D 雾光象牙浅色主题对比度

- 新增浅色主题兼容桥接层，同时同步 Beta 2 `--yk-*` Token 与旧 Tailwind 变量。
- 三级文字、状态文字和强调色在所有浅色表面达到至少 `4.5:1`。
- 可交互边界在所有浅色表面达到至少 `3:1`；白字强调按钮达到至少 `4.5:1`。
- 原生下拉选项和键盘焦点使用同一浅色语义色。
- 静态 WCAG 计算、真实 Electron 运行时对比度、U30 窗口/DPI/键盘矩阵全部通过。

## 快速开发模式

- 普通 UI、Hook 和状态管理改动只运行 TypeScript、生产构建、相关 E2E 和定向 verifier。
- 播放器 Renderer 使用 `Player Fast Validation`：运行时变更执行 U29，视觉和无障碍变更执行 U30。
- 设置、导航和维护表层使用 `UI Fast Validation`，执行 TypeScript、构建、定向 verifier 和 U30。
- portable、NSIS、安装与卸载只在 Electron Main、安装器、依赖、打包配置或正式发布变化时执行。
- 一个任务一个 PR，功能和必要文档同一 PR 收口。

## 开发原则

- 不推倒重写，不保留长期新旧双轨。
- 用户可感知成果优先于纯内部整理。
- 修改哪个用户链路，再同步整理该链路。
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
- `docs/architecture/U38_PLAYER_SUBTITLE_BOUNDARY.md`
- `docs/architecture/U39_PLAYERBAR_THEME.md`
- `docs/architecture/U39_MAINTENANCE_ENTRY.md`
- `docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md`
- `docs/architecture/U39_LIGHT_THEME_CONTRAST.md`
- `docs/DESIGN.md`
