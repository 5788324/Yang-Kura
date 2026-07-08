# CODEX_COPY_ONLY_EXECUTOR_VALIDATION_MVP95

把本文件作为 MVP95 本机验收任务书发给 Codex。

## 当前版本

`0.133.0-mvp95`

## 任务

验收 MVP95 真实 copy-only executor。重点不是继续开发，而是确认真实 copy 在最小样本中安全执行。

## 严禁

```text
不实现 move
不实现 delete
不实现 rename
不实现 overwrite
不写 library-index.json
不写 OperationLog 文件
不接 SQLite
不接下载 Provider
不接 mpv
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
```

## 静态检查

重点检查：

```text
electron/main.ts
electron/preload.ts
src/types/electron-api.d.ts
src/services/copyOnlyExecutorService.ts
scripts/verify-mvp95-copy-only-executor.mjs
```

确认：

- `fs.copyFile` 只在 `buildMvp95CopyOnlyExecuteResult` 中使用。
- 使用 `COPYFILE_EXCL`。
- `fs.mkdir` 只用于目标父目录，且目标路径来自 `resolveSafeCopyPath(targetRoot, targetRelativePath)`。
- 没有 `fs.rename` / `fs.rm` / `fs.unlink`。
- 没有写 `library-index.json`。
- 没有 OperationLog 落盘。
- 返回值没有 absolutePath 或 file://。

## 命令

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run build:electron
npm run verify:mvp95-copy-only-executor
npm run verify:mvp94-copy-only-preflight-real-check
npm run verify:all
npm run build
npm audit --audit-level=high
```

## 最小样本验收

准备两个临时目录：

```text
source-root/RJ00000001/01.mp3
source-root/RJ00000001/cover.jpg
target-root/ASMR/RJ00000001 - sample/cover.jpg
```

预期：

- `01.mp3` 被复制。
- `cover.jpg` 因目标已存在进入 skippedList。
- 源目录文件保留。
- 没有移动、删除、重命名。
- 没有 library-index.json 被写入。
- 没有 OperationLog 文件落盘。

## 输出格式

```text
结论：PASS / BLOCKED
HEAD：<commit>
pushed：yes/no
静态安全检查：...
验证命令：...
最小样本 copy-only：...
是否允许进入 MVP96：yes/no
```
