# TASKS — 当前唯一执行队列

更新日期：2026-09-23

## COMPLETED — K2-R0

- [x] 最新可识别源码完成对账和合并
- [x] GitHub main 恢复为唯一代码真源
- [x] 交接入口统一
- [x] 静态 main SHA 漂移修复
- [x] 历史 archive / 重复 handoff / 旧 MVP/RC 文档清理
- [x] 旧 U32/U40/U41 RC workflows 退出当前 CI
- [ ] 删除远端 92 个历史分支 ref（当前 GitHub 连接器不提供 delete-ref；需原生 Git/Codex 一次性执行）

---

## ACTIVE — K2-R1 Desktop 2.0 真实审计

### R1-A — 依赖与运行时
- [x] 分析 npm audit 1 moderate + 7 high 的直接/间接影响：当前均位于 dev/tooling 依赖链
- [x] 决定 Electron 39 的升级路线：正式候选 Electron 44.x
- [x] 验证 Electron runtime 内建 node:sqlite + FTS5/WAL：Windows CI PASS
- [ ] 在真实 npm/Windows 环境生成 Electron 44 lockfile、调整 install 流程并跑完整回归
- [x] 安全门禁拆分为 production blocking + tooling reporting
- [ ] 更新 Electron / toolchain 并清除可修复 advisory

### R1-B — 8TB 大库
- [x] 真实 Work / Track / File / Subtitle / Cover 统计：采用同一 E:\\arsm 完整只读盘点（268,863 files / 69,285 audio / 111,304 subtitle / 29,930 images / 10,527.65 GiB）
- [ ] 启动/Index 读取基准
- [ ] 扫描耗时/内存基准（现有 Scanner 已确认 10k 默认 / 50k 硬上限，不作为 8TB 长期方案）
- [ ] 搜索/排序/筛选基准
- [ ] 封面加载/缓存审计
- [x] React state / JSON Index 静态瓶颈定位

### R1-C — 产品与 UI
- [ ] 用户“不顺、不成熟” Top 10
- [ ] 音乐信息架构审计
- [ ] RJ 信息架构审计
- [ ] 2～3 个高质量视觉方向
- [ ] 成熟开源项目可复用项清单

### R1 交付
- [ ] `docs/DESKTOP2_AUDIT.md`
- [ ] P0/P1/P2 问题清单
- [ ] K2-R2～R8 最终排序
- [ ] K2-R2 + K2-R5 并行启动 GO / NO-GO

---

## K2-R2 — FOUNDATION COMPLETE / SIDECAR

- [x] Catalog Schema v1
- [x] node:sqlite migration/user_version
- [x] Legacy JSON → SQLite atomic compatibility import
- [x] absolutePath/file:// drop boundary
- [x] Folder Tree derived nodes
- [x] Collection/Track FTS5 query
- [x] Cursor-style collection track query
- [x] Query contracts for RJ/Music filters, facets, Folder Tree and keyset pagination
- [x] Sidecar import wired to real index read path via Worker + SHA guard（仍非 authoritative）
- [x] Real-count synthetic Catalog benchmark：213,182 modeled rows；import 11.031s；query batch 6.619ms；RSS peak 206.4MiB；DB≈200.8MiB
- [x] Primary-read cutover gate fixed：Catalog remains rebuildable sidecar until K2-R3/R4; no unique User State stored in Catalog

## ACTIVE — K2-R3 Incremental Scanner + Artwork Cache

- [x] Schema v2 scan checkpoint / resume / artwork cache migration
- [x] Scanner state model / scan_runs / scan_entries contract
- [x] streaming directory traversal（fs.opendir, directory-bounded memory）
- [x] bounded-concurrency stat
- [x] batch SQLite upsert transaction
- [x] unchanged fast path (kind + mtime + size + state)
- [x] cancellation / resume / failure state
- [x] deletion represented as catalog state first; no media delete
- [x] Legacy JSON sidecar refresh preserves scan inventory
- [x] artwork thumbnail cache service + bounded worker queue
- [x] Electron nativeImage thumbnail generator（no new native dependency）
- [x] first-scan / second-scan synthetic benchmark
- [x] real-library acceptance script（media read-only / temp DB）
- [ ] real E:\\arsm first + second scan evidence

## PARALLEL DESIGN — K2-R5

- [ ] UI benchmark / 2–3 visual directions
- [ ] new Design System / App Shell prototype
- [ ] no production UI cutover until selected direction is fixed

## NEXT

- K2-R4：Query / Pagination / Virtualization
- K2-R4：Query / Pagination / Virtualization
- K2-R5：Design System + App Shell
- K2-R6：Music
- K2-R7：RJ / ASMR
- K2-R8：Player / Polish
- K2-R9：8TB+ Real Library Acceptance

---

## FROZEN

Desktop 2.0 稳定前不启动：
- OpenList 正式接入
- Android 正式开发
- Downloader
- 转录
- 云同步
- 插件市场
- AI Agent 大功能

## K2-R4 — CORE IMPLEMENTED / CI PENDING

- [x] Schema v3 trigram FTS
- [x] CJK 3+ substring search
- [x] CJK 1–2 char DB fallback
- [x] ASCII / RJ unicode61 FTS
- [x] Collection stable keyset pagination
- [x] Track stable keyset pagination
- [x] ASMR list virtual window
- [x] Music track/detail virtual window
- [x] K2-R4 query + virtualization regression
- [ ] Windows CI
- [ ] Catalog Query IPC + Renderer page adapter
- [ ] E:\\arsm query/scroll evidence
