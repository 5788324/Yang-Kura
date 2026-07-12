# MVP100 — Library Index Patch Write

## 版本

`0.138.0-mvp100`

## IPC

```text
yang-kura:import:library-index-patch:write-confirmed
```

## 请求要求

```text
operationPlanId
targetRootPathToken
mode = library-index-patch-write-confirmed
sourceReadinessVersion = mvp99-library-index-patch-write-readiness-v1
indexPatchPreview.patchPreviewVersion = mvp98-library-index-patch-preview-v1
userConfirmedPatchWrite = true
createBackup = true
confirmationText = CONFIRM_WRITE_LIBRARY_INDEX_PATCH
```

## 写入规则

1. 目标 root 必须来自 Electron main 侧 token map。
2. Renderer 不传、不收 `absolutePath` 或 `file://`。
3. 先读取现有 `library-index.json`。
4. 现有 index 不存在、解析失败或结构非法时停止。
5. 写入前用 `wx` 创建同目录 backup，不覆盖已有 backup。
6. 只对 `collections / tracks / covers / subtitles` 做 upsert。
7. 不删除旧数据，不做全量重建。
8. 不接 SQLite。
9. 不触发 scanner。
10. 写入后读回校验。

## 返回

成功状态：

```text
mvp100-library-index-patch-write-complete
```

失败状态：

```text
mvp100-library-index-patch-write-invalid-request
mvp100-library-index-patch-write-invalid-root-token
mvp100-library-index-patch-write-missing-patch-preview
mvp100-library-index-patch-write-confirmation-required
mvp100-library-index-patch-write-backup-required
mvp100-library-index-patch-write-missing-index
mvp100-library-index-patch-write-read-index-failed
mvp100-library-index-patch-write-invalid-current-index
mvp100-library-index-patch-write-unsafe-content
mvp100-library-index-patch-write-error
mvp100-library-index-patch-write-verify-failed
```

## 不做

```text
不 copy / move / delete / rename
不写 SQLite
不触发全量扫描
不返回 absolutePath
不返回 file://
不删除 existing collections/tracks/covers/subtitles
```
