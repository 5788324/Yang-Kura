# Yang-Kura 当前项目交接

## 当前事实

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
版本：0.169.0-beta.2
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
索引：Local JSON Index
Beta 2：已发布，Release ID 355486824
U34～U38：完成
U39-A～U39-E：完成
U39-F：增量架构防回退门禁完成
U39-G：最终综合验收完成
当前任务：按需日常维护
```

必须从最新 `origin/main` 接手。状态见 `PROJECT_STATE.md`，路线见 `PROJECT_ROADMAP.md`，日志见 `AI_HANDOFF/WORKLOG.md`。

## 当前边界

- 播放器 Queue/Persistence、Backend、Subtitle 边界已收口，不再连续拆分。
- root token 授权可跨重启恢复，Renderer 不保存绝对路径。
- 日常设置与 AI 维护已有独立入口；真实检修工具只在触碰对应功能时迁移。
- 浅色主题与日常空状态已完成自动验收。
- `Architecture Guardrails` 禁止新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。
- 当前存在 1 个历史相对导入环，作为基线保留，触链时再清理。

## 验证

- 播放器：`Player Fast Validation`。
- 设置、主题和页面：`UI Fast Validation`。
- TypeScript / Electron 架构增量：`Architecture Guardrails`。
- U39 阶段综合复核：`U39 Final Acceptance`。
- Electron Main、安装器、依赖、用户数据目录和正式发布：完整 Windows 与打包验收。
- 纯文档、普通 UI、Renderer Hook 和低风险状态调整不得默认触发 portable、NSIS、安装/卸载链；只执行与改动风险匹配的定向验证。

## 个人项目快速模式

- 用户可见 Bug、体验和明确小功能优先于纯内部整理。
- 一个任务一个 PR；功能、必要文档、工作日志和交接在同一 PR 收口。
- 不创建额外“文档收口 PR”，不为一句历史文案反复运行完整发布门禁。
- 小型、相关、低风险改动可以合并处理；CI 原则上只保留一次最终验证。
- 核心文档集中维护，避免为了镜像一致性同步大量重复历史文件。

## 后续启动条件

不再存在预排的下一轮 U39。只有真实 Bug、明确体验问题、用户提出的小型功能、依赖/Windows 兼容变化或触链技术债才启动新任务。Issue #66 保持开放。

## 协作

用户只接收最终成果。ChatGPT 负责开发、测试、Git、PR、文档、合并和发布；Codex 仅处理自动化无法替代的 Windows 实机差异。

## 冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、账号和插件市场保持冻结。
