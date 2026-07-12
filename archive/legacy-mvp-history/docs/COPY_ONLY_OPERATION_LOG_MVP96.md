# MVP-96 — Copy-only OperationLog

版本：`0.134.0-mvp96`

## 目标

在真实 copy-only executor 之后，写入最小 OperationLog，形成可追踪记录，但不进入正式入库链。

## 日志文件

```text
import-operation-log.jsonl
```

存储位置：Electron app logs 范围内。该真实路径只在 main side 使用，不返回 Renderer。

写入方式：append-only，每次执行追加一行 JSON，不覆盖旧日志。

## Schema v1

```text
operationLogVersion: mvp96-copy-only-operation-log-v1
operationId
operationPlanId
eventType: copy-only-execute
mode: copy-only
wroteAt
rootPathToken
targetRootPathToken
requestedFileCount
copiedCount / skippedCount / failedCount
createdDirectoryRelativePaths
copiedFiles[].sourceRelativePath / targetRelativePath / sizeBytes
skippedList[].sourceRelativePath / targetRelativePath / reasonCode
failureList[].sourceRelativePath / targetRelativePath / reasonCode / message
absolutePathReturned: false
fileUrlReturned: false
libraryIndexWritten: false
```

## 安全边界

- 不记录 `absolutePath`。
- 不记录 `file://`。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不 move / delete / rename。
- 不 overwrite。
- fs error message 必须脱敏，避免把绝对路径写进日志或返回 Renderer。

## 状态

新增成功状态：

```text
mvp96-copy-only-execute-complete-with-operation-log
```

新增日志失败状态：

```text
mvp96-copy-only-execute-log-write-failed
```

日志写入失败不返回日志文件真实路径，只返回 `operationLogFailureCode`。
