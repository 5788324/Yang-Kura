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

## ACTIVE — K2-R5 Desktop 2.0 Design System

- [x] Visual direction fixed：Midnight Glass
- [x] ASMR / Music fixed as first-class media navigation
- [x] Desktop 2.0 shell token and ambient background
- [x] Sidebar information hierarchy redesign
- [x] TopBar visual/status redesign
- [x] Main stage visual layer
- [x] Player dock visual upgrade
- [x] Grid content-visibility baseline
- [x] K2-R5.1 Windows CI
- [ ] Shared UI primitives visual unification
- [ ] Home redesign
- [ ] ASMR library visual redesign
- [ ] Music library visual redesign
- [ ] detail / immersive player polish
- [ ] Windows screenshot visual QA

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
- [x] Windows CI
- [x] Catalog Query IPC + Renderer query adapter
- [ ] E:\\arsm query/scroll evidence

- [x] rootPathToken -> legacy Catalog root resolution
- [x] Catalog summary query
- [x] Primary Read Gate: schema + root collection/track parity
- [x] JSON automatic fallback when gate is not ready

## K2-R5 MULTI-MODEL UI COLLAB — ACTIVE

- [x] 固定 4 模型职责与额度策略
- [x] 固定 3 Design Modes：Midnight Glass / Studio Graphite / Aurora Dream
- [x] Desktop/Android 共享 Design Language、不同布局原则
- [x] Claude Sonnet 5 prompt
- [x] Kimi K3 prompt
- [x] Gemini 3.8 Flash QA prompt
- [x] GPT-6 Integrator prompt
- [x] UI 多模型交接文件
- [x] Claude 方案回收并规范化入库
- [x] Kimi 方案回收并规范化入库
- [x] GPT-6 代替 Gemini 完成 Claude/Kimi 交叉审查
- [x] GPT-6 输出唯一 Design Decision
- [x] Theme Delta Matrix
- [x] Android Compose Mapping
- [ ] K2-R5.2 Shared UI + Home / Music / ASMR 实现

## K2-R5 REFERENCE UI AUDIT — COMPLETE

- [x] YesPlayMusic source audit
- [x] SPlayer-Next source audit
- [x] Feishin source architecture audit
- [x] fooyin management UX audit
- [x] Resonate Android source audit
- [x] Aurora Android source audit
- [x] license reuse gate
- [x] Kura Reference UI Map
- [x] R5.2 implementation ordering from mature projects
- [ ] build first reference-derived Kura Desktop sample
- [ ] screenshot QA before broad page migration

## K2-R5 REFERENCE-DERIVED DESKTOP SAMPLE — CI PASS / SCREENSHOT QA PENDING

- [x] Music Library reference marker
- [x] content-first Music header
- [x] flat Header / Search / Filter treatment
- [x] album grid removes card-box visual
- [x] track actions retreat until hover/focus
- [x] album detail adopts cover + metadata + action hierarchy
- [x] Player artwork changed from spinning vinyl to stable square cover
- [x] engineering status chips removed from daily Player visual
- [x] Player transport visual noise reduced
- [x] dedicated regression verifier
- [x] Windows CI
- [ ] Windows screenshot QA

## K2-R5 AUTOMATED SCREENSHOT GATE — IMPLEMENTED / CI PENDING

- [x] reuse stable U30 Electron/CDP driver
- [x] deterministic 6-album / 24-track Music fixture
- [x] populated PlayerBar fixture
- [x] 1440×900 Album Grid
- [x] 1440×900 Album Detail
- [x] 1024×720 Track List
- [x] 1024×720 Album Grid
- [x] PNG size / horizontal overflow / player visibility assertions
- [x] GitHub Actions artifact upload
- [ ] screenshot CI PASS
- [ ] GPT-6 visual review of generated PNGs

## K2-R5 REFERENCE SAMPLE V2 — IMPLEMENTED / CI PENDING

- [x] actual screenshot review marked v1 visual NO-GO
- [x] clean-profile theme shifts to Mist Ivory light-first
- [x] canonical theme label replaces legacy label in quick toggle
- [x] legacy Tailwind background/player aliases aligned to light theme
- [x] Sidebar narrowed and media navigation flattened
- [x] idle library status visually retreats
- [x] theme quick toggle reduced to icon
- [x] album grid made larger / fewer columns
- [x] metadata management collapsed under Advanced
- [x] 1024 toolbar density reduced
- [ ] v2 Windows CI
- [ ] v2 screenshot visual review
