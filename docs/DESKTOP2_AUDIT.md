# Kura Desktop 2.0 — K2-R1 Static Audit

更新日期：2026-09-23
状态：**STATIC AUDIT IN PROGRESS / REAL 8TB INVENTORY PENDING**

## 当前结论

Kura 现有 Windows 业务链值得保留，不需要推倒重写；但当前 Local JSON Index → Renderer 全量对象图的运行方式不适合作为 8TB+ 长期架构。

本轮已确认的主要性能事实：

1. `App.tsx` 同时持有完整 `RJWork[]` 与 `MusicAlbum[]`，并把完整对象图下发到路由页面。
2. `libraryIndexAdapter.fromLocalJsonIndexToAppData()` 会把 Index 再映射为 RJ/音乐 UI 对象，Track 会继续嵌套在 Work/Album 中；大库下存在明显的内存放大。
3. `libraryReadCoordinatorService` 只会把不超过 2MB 的读取结果持久化到 localStorage；大库结果主要停留在运行时内存，重启后需要重新读取完整 JSON。
4. 音声/音乐页面的“分批加载”目前主要限制 DOM 数量，并没有限制搜索、筛选、排序对全库数组的 CPU 遍历。
5. 搜索索引会把作品/专辑及其 Track 文本拼成长字符串。K2-R1 第一批修复已改为：没有实际搜索词时不再构建这份大型文本索引。
6. `App.tsx` 原先会在多个 effect 中重复 `flatMap` 全库轨道。K2-R1 第一批修复已缓存单一派生 Track 数组供历史和队列对账复用。
7. `collectLibraryIndexHealthReferences()` 原先为每个 collection track reference 执行 `tracks.some(...)`，大库最坏可退化为 O(collection refs × tracks)。K2-R1 第一批修复改为 Set membership。
8. `libraryIndexAdapter` 原先在映射每条 Track 时都遍历整份 subtitles 数组两次，字幕量上升后可退化为 O(Track × Subtitle)。K2-R1 已改为一次构建 `byTrackId/byMediaBase` lookup，再按 Track O(1) 级查询候选字幕。
9. `libraryIndexNormalizationService` 原先每个 collection 都对全局 covers 执行 `filter`；已改为 `coversByCollectionId` 预索引。
10. Playback History 原先一次 refresh/summary 会重复构建全库 Track Map；已收敛为一次 Map + history reconcile。

## 第一批已落地优化

- App 全库 Track 派生数组使用 `useMemo`，减少重复大数组创建。
- ASMR 综合搜索索引改为只有实际搜索时构建。
- Music 搜索索引改为只有实际搜索时构建。
- Index health stale-reference 检查使用 `Set<string>`，去除重复线性查找。
- Index → UI 映射预构建 Subtitle lookup，移除每 Track 全表字幕扫描。
- Normalization 预构建 collection→covers 索引，移除每 collection 全局 covers.filter。
- Playback History 单次刷新只构建一次全库 Track Map。
- 新增只读真实库审计工具：`npm run audit:k2-r1-library`。

## 真实 8TB 审计工具

示例：

```powershell
npm run audit:k2-r1-library -- --root "E:\arsm" --out "E:\KuraAudit\k2-r1-library-audit.json"
```

工具只遍历目录和文件元数据，不读取媒体正文，不跟随符号链接，不修改媒体资源。报告包含：

- 文件/目录总数；
- 总字节数；
- 最大目录深度；
- 音频/字幕/图片/视频/文本/文档/压缩包数量；
- 扩展名分布；
- 最大文件；
- 无法读取的路径错误；
- 总扫描耗时。

## 现有 Scanner 边界

当前正式 `runReadOnlyDryRun()`：

- 默认 `maxEntries = 10,000`；
- 硬上限 `50,000`；
- 默认最大深度 12，硬上限 24；
- 目录递归按目录串行；
- 每个普通文件单独执行 `fs.stat()`；
- 全部 discovered entries 累积在内存后再构建 Index Preview。

因此它适合作为历史小/中型库安全 dry-run，不适合作为 8TB+ 长期 Scanner。K2-R3 不采用“简单放大 maxEntries”的方案，而改为数据库目录状态 + 流式批处理 + 增量更新。

## CI 验证

2026-09-23，`main@1cc60db...` 的 Windows current-product regression 全绿：

- production dependency audit PASS；
- development toolchain advisory 正常报告；
- Electron runtime preparation PASS；
- TypeScript + Renderer/Electron build PASS；
- current Electron journeys PASS；
- stable regression + final build PASS。

## 当前 P0/P1

### P0 — 缺少真实 8TB 库指标

在拿到真实 inventory 前，不直接设计 SQLite schema 的最终粒度，也不宣称现有 50k synthetic benchmark 能代表真实资源。

### P1 — JSON Index / UI 对象图内存放大

K2-R2 应以 SQLite/FTS 查询层替代 Renderer 对完整 JSON + 完整映射对象的长期持有。

### P1 — 全量前端查询

当前 render window 只降低 DOM 数，搜索/筛选/排序仍是 O(N) Renderer 计算。K2-R4 必须迁入 DB query + pagination/cursor。

### P1 — 搜索索引成本

本轮先做 lazy build 止损；K2-R2/R4 最终使用 FTS5，不继续扩大前端拼接字符串索引。

### P1 — 依赖安全基线

当前 CI 已发现 1 moderate + 7 high npm advisories。lockfile 反向依赖检查确认这些 advisory 当前全部落在 dev/tooling 链：Electron npm 下载包装、electron-builder、Babel/Vite/PostCSS 等；生产 dependencies（React / React DOM / lucide-react）不在这批 high 命中内。

门禁调整为：
- `npm audit --omit=dev --audit-level=high`：生产依赖硬阻断；
- 完整 `npm audit --audit-level=high`：开发工具链继续报告，但不阻断产品回归。

这不代表 Electron 39 可长期保留。Electron 39 已 EOL。正式迁移目标调整为 **Electron 44.x**：比 42 有更长维护窗口，并包含 Node 24.21 系列；代码静态搜索未发现 renderer clipboard、clearStorageData quotas、offscreen、showHiddenFiles、select-client-certificate、32-bit 等已知 40～44 breaking API 命中。升级时必须同步改造 Electron 42+ 的 binary on-demand install 流程并完整跑 Windows 回归。

## 保留 / 重做边界

建议保留：
- Electron tokenized local-media 安全边界；
- Importer transaction / rollback；
- Index backup / maintenance；
- mpv + HTMLAudio fallback 的业务能力；
- Metadata override/provider；
- 字幕解析和播放器行为。

建议重做或逐步替换：
- Local JSON Index 作为运行时主查询源；
- Renderer 完整库对象常驻；
- 前端全量搜索/排序/筛选；
- 当前 App 过度集中式状态；
- Library 页面仅靠 renderLimit 的“大库优化”。

## K2-R2 SQLite 技术 POC

本轮新增不接生产数据的 `node:sqlite` POC，同时在普通 Node 和 `ELECTRON_RUN_AS_NODE=1` 的 Electron runtime 中验证：

- 文件数据库打开/关闭；
- WAL；
- transaction；
- 25,000 行批量写入；
- FTS5 `MATCH`；
- cursor-style page query；
- `PRAGMA user_version` migration 基础。

Windows CI 已通过。实测：

| Runtime | Node | SQLite | 25k 插入 | FTS 查询 | WAL |
|---|---|---|---:|---:|---|
| GitHub Node | 22.23.2 | 3.51.3 | 939 ms | 0.518 ms | PASS |
| Electron 39.8.10 Node-mode | 22.22.1 | 3.51.2 | 557 ms | 0.54 ms | PASS |

结论：K2-R2 **GO：优先使用内建 `node:sqlite`**，避免额外引入 `better-sqlite3` native addon 和对应 ABI/rebuild/打包复杂度。这组 25k POC 仅证明技术能力与基础性能，不替代真实 8TB 验收。

## 下一步

1. 在真实 8TB 库运行 readonly inventory；
2. 根据 inventory 做 K2-R2 SQLite schema；
3. 同时继续 K2-R1-C UI/UX benchmark；
4. 完成依赖/Electron 升级路线后，再进入 K2-R2 + K2-R5 并行开发。
