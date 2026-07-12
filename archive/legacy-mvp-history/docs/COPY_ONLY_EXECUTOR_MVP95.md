# COPY_ONLY_EXECUTOR_MVP95

版本：`0.133.0-mvp95`

## 目标

MVP-95 在 Electron main 侧加入第一版真实 copy-only executor。它不是完整入库器，只负责把用户已确认的文件从源 root token 复制到目标 root token 下。

## 执行入口

IPC channel：

```text
yang-kura:import:copy-only:execute
```

请求字段：

```text
operationPlanId
rootPathToken
targetRootPathToken
mode = copy-only-stub
relativePaths[]
targetRelativePaths[]
confirmedCopyOnly = true
confirmationText = COPY ONLY
```

## 安全策略

- `resolveSafeCopyPath()` 继续阻止绝对路径、`file://`、盘符路径、`..` 越界。
- 所有真实路径只在 Electron main 内部使用。
- Renderer 返回值只包含相对路径。
- copy 使用 `fs.copyFile(..., COPYFILE_EXCL)`，禁止覆盖。
- 目标文件已存在时进入 `skippedList`。
- 源文件不存在或不是文件时进入 `failureList`。
- 只创建目标父目录，并记录 `createdDirectoryRelativePaths`。

## 返回值

状态：

```text
mvp95-copy-only-execute-complete
mvp95-copy-only-execute-invalid-request
mvp95-copy-only-execute-confirmation-required
mvp95-copy-only-execute-invalid-root-token
mvp95-copy-only-execute-empty-file-list
```

关键字段：

```text
absolutePathReturned: false
fileUrlReturned: false
overwriteAllowed: false
moveAllowed: false
deleteAllowed: false
renameAllowed: false
operationLogPersisted: false
libraryIndexWritten: false
```

## 边界

MVP95 不做：

```text
不移动文件
不删除文件
不重命名文件
不覆盖文件
不写 OperationLog 文件
不写 library-index.json
不接 SQLite
不接 Provider
不接 mpv
```

## Codex gate

本轮引入真实 `fs.copyFile` 和 `fs.mkdir`，因此源码包生成后必须交给 Codex 用最小真实样本验收。
