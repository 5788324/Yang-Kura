# TASKS — 当前唯一执行队列

更新日期：2026-09-23

> 本文件只保存“现在做什么”和“紧接着做什么”。历史完成项放 WORKLOG，中长期想法放 ROADMAP。

## COMPLETED — K2-R0 最新源码对账

- [x] 用户确认 `codex/k2-r0-validation-hygiene` 为上周最新可识别源码分支
- [x] 基线核对：`18a62a958572efede50bbdd3446063785899ca9a`
- [x] 原提交 `a58070365fde613d6ccb07faf9b0627bfdaf8fcf` 完整 diff 已审查
- [x] 未发现 Scanner / Library Tree / Player / Importer 等额外业务源码
- [x] TypeScript 正式检查范围确认不会漏掉当前生产 Renderer 代码
- [x] 未跟踪验收资料、报告与 `RJ_AI_ANALYSIS/` 不进入 Git
- [x] 交接入口与验证器的旧 U42 状态在合并前同步清理

结论：该分支合并后，GitHub `main` 恢复为唯一代码真源。

---

## ACTIVE — K2-R1 Desktop 2.0 真实审计

目标：不要先写 SQLite 或重做 UI；先确定真实瓶颈。

### 输入

- 当前 GitHub `main`
- 用户真实 8TB+ 音声/音乐库
- 当前 Desktop 日常使用反馈
- 现有启动、扫描、搜索、资源库、播放器、封面与状态管理实现

### 必须回答

1. 实际 Work / Track / File / Subtitle / Cover 数量与目录深度；
2. 冷/热启动与读取已有 Index 的耗时；
3. 增量/全量扫描的实际耗时和内存；
4. 搜索、筛选、排序和大列表滚动瓶颈；
5. 封面加载/缓存问题；
6. Player 状态与页面切换是否存在耦合；
7. 音乐/RJ 两套信息架构哪些保留、哪些重做；
8. 用户“不顺、不成熟”的 Top 10 问题；
9. K2-R2～R8 的真实优先级；
10. 哪些成熟项目代码/架构值得复用。

### 交付

- `docs/DESKTOP2_AUDIT.md`
- 可执行问题清单（P0/P1/P2）
- K2-R2 / K2-R5 是否可并行启动的 GO / NO-GO

---

## NEXT — K2-R2 / K2-R5

K2-R1 后才启动：

### Core
- SQLite / FTS5 POC
- JSON Index 兼容层
- 增量扫描
- Thumbnail Cache
- 分页 / 虚拟化

### Design
- YesPlayMusic / Music You / Music Claw / Feishin / Alger / 网易云
- KikoFlu / Voice / Audiobookshelf
- 只保留 2～3 个高质量视觉方向

---

## FROZEN / PARKING LOT

未经 PROJECT_STATE 解冻，不得自行启动：

- Android
- OpenList 正式接入
- Downloader
- 转录
- 云同步
- 新 Provider 大扩展
- 插件市场
- AI Agent
- 无实际收益的大规模架构重写

## 任务编号规则

新战略任务使用 `K2-R0, K2-R1, K2-R2...`；旧 MVP / Uxx 只用于历史追溯。
