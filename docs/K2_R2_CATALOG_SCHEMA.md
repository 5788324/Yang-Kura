# K2-R2 Catalog Schema v1

更新日期：2026-09-23  
状态：**IMPLEMENTED AS SIDECAR / NOT YET PRIMARY READ PATH**

## 原则

K2-R2 第一版不直接替换现有 `library-index.json` 读链。

```text
library-index.json
       │
       ├── existing production read path  ← 保持
       │
       └── compatibility import
                 ↓
          catalog.sqlite
                 ↓
          K2-R2 verification/query POC
```

这样 SQLite schema、迁移、事务和查询可以先成熟，不把 10TB 真实库和现有播放器一起置于迁移风险中。

## Schema v1

Catalog 只存媒体目录事实，不把播放进度/收藏/个人评分混入 Catalog。

核心表：

- `roots`
- `collections`
- `collection_cvs`
- `collection_tags`
- `tracks`
- `track_tags`
- `media_sources`
- `subtitles`
- `artwork`
- `folder_nodes`
- `attachments`
- `scan_runs`
- `scan_entries`
- `collections_fts`
- `tracks_fts`
- `catalog_meta`

User State / Favorites / Progress / Notes / Playlists 后续继续独立设计，不与媒体 Catalog 强绑定。

## 真实库约束

Schema 直接针对当前真实 `E:\\arsm`：

- 268,863 files；
- 69,285 audio；
- 111,304 subtitles；
- 29,930 images；
- 2,257 video；
- 2,663 album dirs；
- 最大目录深度 18。

因此：

- Folder Tree 是一等数据；共享祖先目录不强行归属某一个 Work；
- Track 与 Source 分离；一个逻辑 Track 可挂多个 `media_sources`，Query 始终按 Track 返回一行并选择可用 Source 作为当前路径投影；
- Subtitle 独立表；
- Artwork 独立表；
- Attachment 预留独立表；
- Scanner 状态独立于媒体实体；
- FTS 不依赖 Renderer 构建巨大字符串 Map。

## 安全边界

Legacy JSON → Catalog 导入时：

- 保留 root/collection/track/source/subtitle/artwork ID；
- 保留相对路径；
- **丢弃 absolutePath 和 file://**；
- 只有 `rootPathToken:...` 形式的 root reference 允许进入 Catalog；
- 整次 replace import 使用单一事务；
- 生产 sidecar 使用 Root-scoped atomic replace：更新一个 Root 不清空其他音声/音乐 Root；
- 任一 FK/唯一约束错误会完整 rollback；
- 不删除、移动、重命名、覆盖任何媒体文件；
- 不修改旧 `library-index.json`。

## Migration

使用：

```text
PRAGMA user_version
```

当前 `schemaVersion = 1`。

打开比当前实现更高版本的数据库会直接拒绝，防止旧客户端静默损坏新数据库。

## Sidecar Integration v1

真实 `readLibraryIndex()` 成功后：

1. JSON 结果立即按原路径返回 Renderer；
2. Electron Main 把同一 Index SHA 加入 Catalog sidecar 串行队列；
3. Worker 线程重新读取 `library-index.json`；
4. SHA 与前台读取一致才允许导入；
5. 使用 Root-scoped atomic replace 更新 `userData/catalog/catalog.sqlite`；
6. SQLite 失败、worker 失败、源文件期间变化都不影响 JSON 主链；
7. sidecar 状态仅作为诊断信息返回，不成为 UI 数据真源。

这样 K2-R2 可以在真实使用中积累 Catalog 数据，同时随时删除/rebuild sidecar 回退到旧 JSON。

## Query v1

Query v1 已支持：

- FTS5 Collection 搜索；
- FTS5 Track 搜索；
- Collection / Track keyset-style `afterId` pagination；
- Music Album/Artist 精确筛选；
- RJ Circle/CV/Tag 精确筛选；
- Track Artist/Tag 筛选；
- Circle/Artist/CV/Tag facets；
- Folder Tree child query；
- 基础 Catalog count。

后续 K2-R4 再增加：

- 用户可见排序（Added/Title/Play 状态等）对应的稳定 keyset cursor；
- 首页 Recent/Added 数据接口（User State 独立）；
- 分页排序和 filter contract；
- Scanner upsert contract。
