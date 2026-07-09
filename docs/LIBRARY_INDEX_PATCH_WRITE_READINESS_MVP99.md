# MVP99：library-index patch write readiness

## 目标

MVP99 是 MVP100 真实写入前的 readiness gate。

输入：MVP98 `indexPatchPreview`。

输出：`mvp99-library-index-patch-write-readiness-v1`。

它只回答一个问题：当前 patch 是否已经具备进入 MVP100 写入流程的条件。

## IPC

```text
yang-kura:import:library-index-patch:write-readiness
```

请求必须包含：

```text
operationPlanId
targetRootPathToken
mode = library-index-patch-write-readiness
indexPatchPreview.patchPreviewVersion = mvp98-library-index-patch-preview-v1
userConfirmedPatchPreview = true
createBackup = true
confirmationText = CONFIRM_WRITE_LIBRARY_INDEX_PATCH
```

## 返回状态

```text
mvp99-library-index-patch-write-readiness-ready
mvp99-library-index-patch-write-readiness-invalid-request
mvp99-library-index-patch-write-readiness-invalid-root-token
mvp99-library-index-patch-write-readiness-missing-patch-preview
mvp99-library-index-patch-write-readiness-confirmation-required
mvp99-library-index-patch-write-readiness-backup-required
```

## 关键字段

```text
readyForMvp100Write
writeExecutionAllowedInMvp99 = false
libraryIndexWritten = false
scannerRunTriggered = false
sqliteWritten = false
absolutePathReturned = false
fileUrlReturned = false
backupRequired = true
```

## 边界

MVP99 不写 `library-index.json`。  
MVP99 不执行 `fs.writeFile` / `fs.rename` / `fs.rm`。  
MVP99 不接 SQLite。  
MVP99 不触发全量扫描。  
MVP99 不执行 copy/move/delete/rename。  
MVP99 不返回 absolutePath 或 file://。

## MVP100 写入要求

MVP100 可以进入真实写入，但必须满足：

1. 写入范围只来自 MVP98 patch preview。
2. 写入前备份 `library-index.json`。
3. backup 文件名带时间戳，不覆盖旧 backup。
4. 解析现有 index 失败则停止。
5. 合并失败则保留原 index。
6. 写入 summary 只返回 token、relativePath、计数和状态。
