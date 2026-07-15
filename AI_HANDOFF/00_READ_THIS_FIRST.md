# AI_HANDOFF / 00_READ_THIS_FIRST

这是 Yang-Kura 当前 GitHub 主线的 AI 接手入口。

## 先做什么

1. 读取 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`。
2. 读取根目录 `PROJECT_STATE.md`。
3. 读取根目录 `PROJECT_ROADMAP.md`。
4. 读取 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。
5. 从最新 `origin/main` 核对实际 HEAD、最近提交、开放 PR、Actions、tags 和 Releases。
6. 当前处于发布阶段时，同时读取 `release/u33-release-plan.json` 与对应 Release Notes。

## 当前已知状态

```text
核心版本：0.168.0-beta.1
U02～U32：已完成
当前阶段：U33 Beta 发布
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
发布后：个人 Beta 观察与定向缺陷修复
MVP130：继续冻结，禁止自动合入
```

U27 的历史 `NO-GO` 以及 MAJ-001、MAJ-002 已在 U28 关闭，不得再把它们当作当前阻断项。当前事实以最新 GitHub `main`、`PROJECT_STATE.md` 和开放 PR 为准。

## 当前硬边界

- GitHub `main` 是唯一代码事实来源；不要依赖旧 ZIP、历史包或旧固定 SHA。
- 工作区有未提交改动时立即停止，不要 stash、reset 或覆盖。
- 用户不承担测试、排错、构建、Git 或发布操作。
- ChatGPT 负责开发、自动测试、CI、Git、PR、合并、发布和交付。
- Codex 默认只负责自动化无法替代的真实本机测试，不修改产品源码。
- 真实媒体库可读取、浏览和播放；测试性移动、覆盖、清理和批量写入只使用临时样本或副本。
- Renderer 不暴露绝对路径或 `file://`。
- 不为了代码整齐进行全项目重构。
- 日常 UI 不显示工程、回归、Demo 或诊断内部状态。
- Beta 发布完成前不启动下载器、完整 AI Agent、SQLite、OpenList/WebDAV、Player Core v2 或全局架构重写。

详细执行、验收和分支策略见 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`。
