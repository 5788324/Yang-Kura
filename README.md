# Yang-Kura

> 当前公开版本：`0.169.0-beta.2`  
> 下一版本：`0.170.0-beta.3`  
> 代码事实来源：GitHub `main`  
> 当前阶段：Beta 3 正式日用发布收口

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；索引采用 Local JSON Index。

## 当前能力

- 本地目录选择、扫描、Index 写入、读取、备份、恢复和维护。
- 首页、音声库、RJ 详情、音乐库、专辑/艺术家/文件夹详情。
- 搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和完成策略。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、DLsite 单 RJ Provider、portable 与 NSIS。

## Beta 3 目标

Beta 3 将 U40-D、U40-D2 和 U40-D3 带入新的正式安装包：真实库读取状态与分组、独立 Profile、单实例、授权恢复、歌单与主题修复、导入页生产语言，以及 HTMLAudio 10 秒超时和 mpv 选择提示。

PR 候选执行一次 L3 验证：TypeScript、Renderer/Electron build、U28/U29/U31、portable、NSIS、安装升级卸载、用户数据保留、页面 readiness 和 SHA-256。合入 `main` 后才创建 `v0.170.0-beta.3` prerelease。

## 实机边界

- `E:\arsm`：75 个集合、3540 条轨道、mpv 播放、Seek、字幕、单实例和三次重启已有证据。
- `D:\CloudMusic\VipSongsDownload`：Beta 3 候选执行只读专项验收。
- 写入、导入和回滚只在 `%TEMP%\YangKura-Beta3-Acceptance` 临时副本执行。

## Git Fast Lane v2

项目采用一个任务一个分支和 PR、1～2 个逻辑提交、一次最终 CI、禁止临时补丁工作流、按 L0～L3 风险分级验证。详见 `docs/GIT_FAST_LANE_V2.md`。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号和插件市场，除非用户明确重新解冻。

## 文档入口

- `PROJECT_STATE.md`
- `PROJECT_ROADMAP.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- `AI_HANDOFF/WORKLOG.md`
- `docs/GIT_FAST_LANE_V2.md`
- `docs/CODEX_BETA3_RELEASE_ACCEPTANCE.md`
- `docs/RELEASE_NOTES_0.170.0-beta.3.md`
- `docs/U40D_FINAL_EVIDENCE.md`
- `docs/U40B_FULL_PRODUCT_ACCEPTANCE.md`
