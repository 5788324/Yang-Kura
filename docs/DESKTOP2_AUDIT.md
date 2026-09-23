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

## 第一批已落地优化

- App 全库 Track 派生数组使用 `useMemo`，减少重复大数组创建。
- ASMR 综合搜索索引改为只有实际搜索时构建。
- Music 搜索索引改为只有实际搜索时构建。
- Index health stale-reference 检查使用 `Set<string>`，去除重复线性查找。
- Index → UI 映射预构建 Subtitle lookup，移除每 Track 全表字幕扫描。
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

当前 CI 已发现 1 moderate + 7 high npm advisories。本轮不混入 Electron breaking upgrade；K2-R1-A 单独确认 runtime 影响和安全升级路线。

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

## 下一步

1. 在真实 8TB 库运行 readonly inventory；
2. 根据 inventory 做 K2-R2 SQLite schema；
3. 同时继续 K2-R1-C UI/UX benchmark；
4. 完成依赖/Electron 升级路线后，再进入 K2-R2 + K2-R5 并行开发。
