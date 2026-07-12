# MVP94 Copy-only Preflight Real Check

版本：`0.132.0-mvp94`

## 结论

MVP-94 只把 copy-only 的 preflight 做成 Electron main 侧真实只读检查。

它不是 copy 执行器。

## IPC 语义

通道继续使用：

```text
 yang-kura:import:copy-only:preflight
```

请求仍由 Renderer 传：

```text
rootPathToken
targetRootPathToken
relativePaths
targetRelativePaths
```

Renderer 不传，也不会收到：

```text
absolutePath
file://
```

## 返回结果

成功预检返回：

```text
status = mvp94-copy-only-preflight-real-check-complete
executeAllowed = false
copyAllowed = false
copiedCount = 0
createdDirectoryCount = 0
absolutePathReturned = false
fileUrlReturned = false
```

每个文件只返回 token-safe 的预检摘要：

```text
sourceRelativePath
targetRelativePath
sourceExists
sourceIsFile
targetExists
targetParentExists
blockedReasonCodes
```

## 安全边界

MVP-94 不允许：

- 真实 copy。
- `fs.copyFile`。
- `mkdir`。
- `rename`。
- `rm` / `unlink`。
- 写 OperationLog。
- 写 index。
- 自动覆盖。

## Codex gate

当前不需要 Codex 继续消耗额度。

下一步如果要实现真实 copy executor，必须先暂停开发，并让 Codex 在本机验证：

- main/preload/type 是否仍不泄漏 `absolutePath` / `file://`。
- copy 样本目录是否一次性、可丢弃。
- `fs.copyFile` 是否只作用在样本目录。
- 不覆盖、不删除、不移动源文件。
- 操作日志和失败列表是否可追踪。
