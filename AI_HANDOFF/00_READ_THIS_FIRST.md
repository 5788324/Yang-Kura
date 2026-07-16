# AI_HANDOFF / 00_READ_THIS_FIRST

这是 Yang-Kura 当前 GitHub 主线的 AI 接手入口。

## 必读顺序

1. `README.md`；
2. `PROJECT_STATE.md`；
3. `docs/PROJECT_PROGRESS.md`；
4. `docs/BETA2_MASTER_PLAN.md`；
5. `docs/ARCHITECTURE_QUALITY_PLAN.md`；
6. `docs/DESIGN.md`；
7. `AI_HANDOFF/BETA2_PROJECT_HANDOFF.md`；
8. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`；
9. 从最新 GitHub `main` 核对 HEAD、开放 PR、Actions、tags 和 Releases。

## 当前状态

```text
稳定版本：0.168.0-beta.1
Beta 1：U02～U33 已完成
发布 tag：v0.168.0-beta.1
当前阶段：U34～U40 Beta 2 架构、质量与 UI 整备
Beta 2 目标：0.169.0-beta.2
大功能：继续冻结到 Beta 2 发布和观察后
```

Beta 1 的 tag、target、资产名、大小和 SHA-256 已冻结在 `release/u33-publication-state.json`。不得把历史 U33 发布步骤当作当前任务。

## 当前硬边界

- GitHub `main` 是唯一代码事实来源；
- 不依赖旧 ZIP、历史 MVP 包、旧固定 SHA 或旧交接文案；
- 用户不承担测试、排错、构建、Git 或发布操作；
- ChatGPT 负责开发、自动测试、CI、Git、PR、合并、发布和交付；
- Codex 默认只做无法自动化的 Windows 实机测试，不修改源码；
- Renderer 不接收或持久化 absolutePath、file:// 和临时媒体 URL；
- 真实媒体文件的移动、覆盖、删除和清理必须使用受控事务、预览和回滚；
- 日常 UI 不显示 MVP、verifier、Git、IPC、原始日志或工程状态；
- Beta 2 不进行全项目推倒重写，也不长期保留两套完整 UI；
- 正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、转录接入、插件系统和其他大功能继续冻结。

## 下一任务

文档规划合入后进入 U34：代码库与 UI 联合审计。

U34 只做量化审计、依赖图、风险排序、性能基线和不可破坏行为，不修改产品行为。
