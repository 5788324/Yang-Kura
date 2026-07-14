# AI_HANDOFF / 00_READ_THIS_FIRST

这是 Yang-Kura 当前 GitHub 主线的 AI 接手入口。

## 先做什么

1. 读取 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`。
2. 读取根目录 `PROJECT_STATE.md`。
3. 读取根目录 `PROJECT_ROADMAP.md`。
4. 从最新 `origin/main` 核对实际 HEAD、最近提交、开放 PR 和远端修复分支。
5. 在工作区 clean 前提下，先确认 U28 修复是否已经存在，再决定验收、审查或实现。

## 当前已知状态

```text
核心版本：0.167.0-mvp129
U02～U26：已完成
U27 最终结论：NO-GO
当前路线：U28 资源库授权、真实 Index、浏览与播放闭环
阻断项：MAJ-001、MAJ-002
MVP130：继续冻结，禁止合入
```

用户反馈 MAJ 问题“可能已经修复并推送到 Git”，但本入口更新时 GitHub `main` 仍只显示 U27 NO-GO / U28 范围文档提交，没有可见的产品修复 PR。因此接手者必须先核对最新 Git 事实，不得直接重复开发，也不得直接宣布问题已解决。

## 当前硬边界

- GitHub `main` 是唯一代码事实来源；不要依赖旧 ZIP 或旧固定 SHA。
- 工作区有未提交改动时立即停止，不要 stash、reset 或覆盖。
- 真实 `E:\arsm` 只允许授权、读取、浏览和播放验证，不执行破坏性写入。
- 可写测试只使用仓库外临时样本和副本。
- 不暴露绝对路径或 `file://` 到 Renderer 日常界面。
- 不为了代码整齐进行全项目重构。
- 日常 UI 不显示工程、回归、Demo 或诊断内部状态。
- U33 完成前不启动下载器、完整 AI Agent、SQLite、远程资源库或 Player Core v2。

详细执行、验收和分支策略见 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`。