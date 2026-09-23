# K2-R3 Incremental Scanner + Artwork Cache

更新日期：2026-09-23

## 状态

**BACKEND FOUNDATION IMPLEMENTED — REAL 8TB LIBRARY GATE PENDING**

K2-R3 不删除旧的 MVP20 dry-run。旧 dry-run 继续作为手动预览/诊断路径，新链路直接维护 SQLite inventory。

## Scanner

正式 Scanner 使用：

```text
fs.opendir
  ↓
current-directory bounded sort
  ↓
bounded stat window
  ↓
small batch (default 512)
  ↓
scan_entries transaction
  ↓
release batch memory
```

不会构造整个 26.8 万文件 JS 对象图。

### 增量判定

每个条目保存：

- root_id
- relative_path
- entry_kind
- size_bytes
- mtime_ms
- fingerprint（预留）
- last_seen_scan_id
- state = present / missing

size / mtime / kind / state 均未变化时记为 unchanged。后续 metadata、缩略图、媒体解析只需要处理 changed entry。

### 删除语义

扫描结束后，本轮未见到的旧条目只会：

```text
state = missing
```

Scanner **不会删除、移动、重命名任何媒体文件**。

取消/失败扫描绝不执行 missing finalization，因此不会因为半次扫描把未访问区域误判为删除。

### Cancel / Resume

scan_run 保存 checkpoint_relative_path。

取消后恢复：

- 复用同一个 run id；
- 复用已经写入的 last_seen_scan_id；
- 从 checkpoint 后继续；
- 完整结束后才统一 missing finalization。

这属于短期恢复机制。如果库在取消后发生大量结构变化，下一次完整扫描仍是最终一致性来源。

## Legacy sidecar coexistence

K2-R2 Legacy JSON → SQLite root refresh 已修改为：

- 重建 collections/tracks/folder/FTS；
- **保留 roots / scan_runs / scan_entries / artwork_cache**。

因此读旧 `library-index.json` 不会抹掉 K2-R3 的增量扫描历史。

## Artwork Cache

Artwork Cache 是可删除缓存，不是媒体真源。

```text
source cover
  ↓ size + mtime + maxDimension
SHA-256 cache key
  ↓
userData/artwork-cache/v1/xx/hash.png
```

SQLite 只保存 source relative path、cache key、cache relative path、尺寸、byte size 和状态。

生产缩略图生成器使用 Electron `nativeImage.createThumbnailFromPath()`，避免新增 sharp/native ABI 依赖。

规则：

- 原图只读；
- 缓存文件可随时删除并重建；
- source size/mtime 改变自动生成新 cache key；
- worker pool 默认并发 2；
- 先写临时文件，再 rename；
- 失败只把 cache state 标记 failed，不修改媒体。

## Tests

K2-R3 CI 覆盖：

- Schema v1 → v2 migration；
- first scan；
- unchanged second scan；
- modified / added / missing；
- bounded batch；
- cancel + resume；
- cancel 不产生 false missing；
- Artwork cache miss / hit / invalidation；
- Artwork worker concurrency；
- original source unchanged。

## Real-library acceptance

脚本：

```bash
YANG_KURA_REAL_LIBRARY_ROOT=E:\\arsm npm run accept:k2-r3:real-library
```

该脚本：

- 媒体全程只读；
- SQLite 写到系统临时目录；
- 连续跑 first scan + second scan；
- 输出 wall-clock、files/directories、changed/missing/error、DB bytes；
- 结束删除临时 DB。

K2-R3 在真实 `E:\\arsm` 跑完前保持 **REAL LIBRARY GATE PENDING**。
