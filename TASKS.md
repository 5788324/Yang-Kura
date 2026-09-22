# TASKS — 当前唯一执行队列

更新日期：2026-09-23

> 本文件只保存“现在做什么”和“紧接着做什么”。历史完成项放 WORKLOG，中长期想法放 ROADMAP。

## ACTIVE — K2-R0 最新源码对账

状态：**BLOCKED BY INPUT / WAITING FOR LATEST LOCAL SOURCE**

### 背景

远端已验证：

```text
main = 1ec64e29af794531712d53f62af20d44544d7481
U42 / PR #94 = merged
public release = 1.0.0-rc.1
```

用户确认 2026-09 中旬本机仍有未推 Git 的较新 Kura 源码。

### 输入

- 用户本机最新 Kura 源码 ZIP / 工作区快照；
- 若放 Google Drive，需能明确识别“最新 Kura 源码”；
- GitHub main `1ec64e29af794531712d53f62af20d44544d7481`。

### 执行

1. 校验本机源码版本与文件树；
2. 与 main 做差异审计；
3. 区分：
   - 应保留的新功能/修复；
   - 过时改动；
   - 与 Desktop 2.0 方向冲突的改动；
4. 不先重构；
5. 确立新的唯一 Git 基线；
6. 将确认后的源码推回 GitHub；
7. 更新 PROJECT_STATE / HANDOFF / WORKLOG。

### Done

- [x] 当前 checkout、所有可见 refs、reflog 与可恢复提交已检查；均未提供 2026-09 中旬最新源码候选
- [ ] 本机最新源码已取得
- [ ] 与 `1ec64e29af794531712d53f62af20d44544d7481` diff 完成
- [ ] 新基线 SHA 已固定
- [ ] GitHub 恢复为唯一代码真源
- [ ] 核心文档同步
- [ ] 没有遗失本机未推更新

---

## NEXT — K2-R1 Desktop 2.0 真实审计

只有 K2-R0 完成后启动。

输出必须很短、很实用：

- 8TB+ 真实库规模统计；
- 当前启动 / 扫描 / 搜索 / 滚动 / 播放瓶颈；
- 用户“不顺、不成熟”的真实问题清单；
- 现有 Core 能保留什么；
- 哪些 UI 直接重做；
- K2-R2～R8 的实际优先级。

---

## NEXT — K2-R2 / K2-R5 并行准备

K2-R1 后允许两条轻量支线：

### Core

- SQLite / FTS5 POC；
- JSON Index 兼容层；
- 增量扫描方案。

### Design

- YesPlayMusic / Music You / Music Claw / Feishin / Alger / 网易云对比；
- KikoFlu / Voice / Audiobookshelf RJ 对比；
- 只做 2～3 个高质量方向，不无限生成 AI UI。

---

## FROZEN / PARKING LOT

未经 PROJECT_STATE 解冻，不得自行启动：

- Android；
- OpenList 正式接入；
- Downloader；
- 转录；
- 云同步；
- 新 Provider 大扩展；
- 插件市场；
- AI Agent；
- 无实际收益的大规模架构重写。

## 任务编号规则

从 2026-09-22 起，新战略任务使用：

```text
K2-R0, K2-R1, K2-R2...
```

旧 MVP / Uxx 只用于历史追溯，不继续机械累加。

