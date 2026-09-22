# START_HERE — Yang-Kura 新对话接手入口

更新日期：2026-09-22

## 目的

ChatGPT 网页端经常因上下文上限被迫新开对话。**不要依赖旧聊天记忆接手项目。** 每个新对话必须从仓库事实源恢复上下文。

## 固定读取顺序

请严格按顺序读取：

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `TASKS.md`
4. `PROJECT_ROADMAP.md`
5. `README.md`
6. 只有需要历史原因时才读取 `AI_HANDOFF/WORKLOG.md`

## 文档职责 / 冲突优先级

从高到低：

1. **真实源码 / Git commit / 合并状态**
2. **PROJECT_STATE.md**：当前事实、基线、阻塞
3. **TASKS.md**：当前唯一执行队列
4. **CURRENT_PROJECT_HANDOFF.md**：新对话自包含交接摘要
5. **PROJECT_ROADMAP.md**：中长期方向
6. **WORKLOG.md**：历史记录，不得用旧记录覆盖当前事实
7. README：产品入口，不作为详细执行事实源

如果文档冲突，必须按以上优先级处理并在本轮同步修正文档。

## 当前最重要的事实

- GitHub：`5788324/Yang-Kura`
- GitHub main：`1ec64e29af794531712d53f62af20d44544d7481`
- U42 / PR #94：已合并
- 公开版本：`1.0.0-rc.1`
- 用户本机在 2026-09 中旬继续更新过 Kura，但**尚未推送 Git**，且更新不算特别大。
- 因此当前第一任务不是直接开发，而是 **K2-R0：拿到本机最新源码并与 main 对账**。
- 用户真实音声库已 **8TB+** 且还会继续增长。
- 用户对现有 Desktop 成熟度与顺滑度不满意，要求 Desktop 2.0。
- UI 是硬要求：**好看、惊艳、成熟**。
- 音乐与 RJ/ASMR 均为一级核心，不允许把音乐降级为附属功能。

## 当前禁止误入的旧路线

以下内容是历史状态，不得作为“当前任务”继续执行：

- “PR #94 仍 Draft”
- “U42 尚未合并”
- “当前 main = 72066aa...”
- 继续按旧 MVP/Uxx 清单机械追加功能
- 立即启动 Downloader / Android / OpenList 大开发
- 继续让 `library-index.json` 承担未来 8TB+ 主查询数据库职责

## 新对话第一句话应确认

> 已读取 START_HERE / HANDOFF / STATE / TASKS / ROADMAP；当前先做 K2-R0 基线对账，不从旧 U42 或旧聊天记忆继续。

