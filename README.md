# Yang-Kura

> 当前版本：`0.169.0-beta.2`  
> 代码事实来源：GitHub `main`  
> 当前阶段：U39-G 最终综合验收完成；进入按需日常维护

Yang-Kura 是 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；当前索引为 Local JSON Index。

## 当前能力

- 本地目录选择、扫描、Index 写入、读取、备份、恢复和维护。
- 首页、音声库、RJ 详情、音乐库、专辑/艺术家/文件夹详情。
- 搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和完成策略。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、DLsite 单 RJ Provider、portable 与 NSIS。

## 发布状态

- Beta 2：`v0.169.0-beta.2`，2026-07-17 发布。
- Release ID：`355486824`。
- 证据：`release/beta2-publication-state.json`。
- portable、NSIS setup 和 SHA256SUMS 的远端文件名、大小、SHA-256 与 digest 已校验。

## 当前主线

Issue #66：渐进式结构治理与质量提升。

```text
真实使用 Bug
→ 字幕与播放实际体验
→ 日常 UI / 性能
→ 修改相关链路时顺带处理技术债
```

## 已完成治理

### U38 播放器边界

- U38-A：Queue、History 与 Persistence 分离。
- U38-B：HTMLAudio、mpv、媒体解析、fallback 与 Seek 进入 `usePlayerBackend.ts`。
- U38-C：字幕请求代次、过期结果丢弃和状态同步进入 `usePlayerSubtitles.ts`。
- 连续播放器拆分已经收口。

### U39 日常体验与质量

- U39-A：PlayerBar、控制、进度条和临时弹层使用语义主题 Token。
- U39-B：设置页提供独立 AI 维护入口，完整诊断按需加载。
- U39-C：root token 授权持久化；旧 Index token 可接管，重启后直接读取和播放。
- U39-D：雾光象牙文字至少 `4.5:1`、交互边界至少 `3:1`，并通过真实 Electron 验收。
- U39-E：空音乐库不显示工具空壳；导入器未选来源时不展示误导性示例结果。
- U39-F：新增增量架构门禁，禁止新显式 `any`、Renderer 裸 IPC、实现层跨层导入和新相对导入循环。
- U39-G：同一候选提交重跑 U28～U32、U39-A～F、stable regression、portable、NSIS、安装卸载和用户数据保留验收。

U39-F 使用 PR base/head 比较。当前仓库已有 1 个历史相对导入环，作为基线保留；后续只在触碰对应链路时清理。解析器自测和临时 Git 仓库负向测试已覆盖四类违规。

U39-G 收口不代表技术债清零。后续不再预排 U39 轮次，只由真实 Bug、明确体验问题、用户需求或触链技术债启动。

## 验证与交付

- UI/播放器使用 focused validation；架构增量使用 `Architecture Guardrails`。
- U39 阶段最终证据由 `U39 Final Acceptance` 在同一 Windows 候选提交生成。
- 纯门禁变更不重复运行 U28～U32 或安装包链。
- Electron Main、安装器、依赖、用户数据目录和正式发布变化仍执行高风险完整验收。
- 一个任务一个 PR，功能和必要文档同一 PR 收口。

## 开发原则

- 不推倒重写，不长期保留新旧双轨。
- 用户可感知成果优先；修改哪个链路，再整理哪个链路。
- Renderer 不接收不必要的绝对路径或 `file://`。
- 文件写入、迁移、回滚、安装和发布保留专项验收。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号和插件市场，除非用户明确重新解冻。

## 文档入口

- `PROJECT_STATE.md`
- `PROJECT_ROADMAP.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- `AI_HANDOFF/WORKLOG.md`
- `docs/U39_FINAL_ACCEPTANCE.md`
- `docs/architecture/U39_ARCHITECTURE_GUARDRAILS.md`
- `docs/DESIGN.md`
