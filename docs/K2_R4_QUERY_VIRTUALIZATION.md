# K2-R4 Query / Pagination / Virtualization

更新日期：2026-09-23

## 本批状态

**CORE IMPLEMENTED / WINDOWS CI PENDING**

本批先完成最容易独立验证、且直接决定 10TB+ 顺滑度的三件事：

1. CJK / 子串搜索；
2. Stable keyset pagination；
3. Renderer 行列表 virtual window。

Catalog IPC 与 SQLite Primary Read 切换留在 K2-R4 收尾，不与本批一起扩大变更面。

## CJK Search

Schema v3 增加 collections / tracks trigram FTS。

策略：

- ASCII / RJ 编号：unicode61 FTS；
- CJK 3+ 字符：FTS5 trigram；
- CJK 1–2 字符：数据库 LIKE fallback；
- 搜索不再要求 Renderer 构建全库大字符串才能获得中文子串体验。

目标示例：

- 夜色 -> 夜色钢琴；
- 耳语睡前 -> 深夜耳语睡前故事；
- 低语放松 -> 月夜低语放松音轨。

## Keyset Pagination

Collection sort：

- id-asc
- title-asc
- added-desc
- duration-desc

Track sort：

- id-asc
- title-asc
- album-asc
- added-desc
- duration-desc

Cursor 使用：

```text
sortValue + id
```

不使用大 OFFSET；同名、同日期、同时长也由 id 做稳定 tie-break。

## Virtualization

已接：

- ASMR list mode；
- Music tracks；
- Music detail tracks。

使用 viewport + overscan + top/bottom spacer。10 万行逻辑列表不会同时创建 10 万个 TrackRow DOM。

封面 Grid 本批继续使用既有 bounded render window，等 K2-R5 新视觉网格一起做专门的 grid virtualization，避免性能实现锁死后续 UI。

## Remaining R4

- Catalog Query IPC / Preload；
- Renderer page query adapter；
- SQLite sidecar -> Primary Read 的渐进切换门禁；
- E:\\arsm 实库 query/scroll 验收。

## Primary Read Gate

K2-R4 收尾增加运行时门禁，而不是直接把旧 UI 强制切 SQLite。

JSON 成功读取后，Renderer 自动请求：

```text
Catalog summary(rootPathToken)
```

Main 通过 `roots.root_path_ref = rootPathToken:<token>` 解析真实 Catalog root id。禁止假设 Scanner hash root id 与 Legacy Index root id 相同。

Gate 要求同时满足：

- Catalog Query bridge 存在；
- Schema >= 3；
- rootPathToken 能解析到 Catalog root；
- Catalog collection count == JSON collection count；
- Catalog track count == JSON track count。

满足才：

```text
safeForPrimaryRead = true
```

否则：

```text
JSON compatibility read stays authoritative
```

这使 K2-R5 新 App Shell 可以直接消费分页 SQLite Query，并在 sidecar 未同步/迁移异常时自动回退，不需要让当前旧页面承担一次短命的 Primary Read 重写。
