# Yang-Kura 当前路线 - MVP94

版本：`0.132.0-mvp94`

## 本轮目标

MVP-94：copy-only preflight 真实化 / 仍不 copy。

本轮允许 Electron main 侧在 token map 内做只读预检：

- 校验 `rootPathToken`。
- 校验 `targetRootPathToken`。
- 校验 source / target relativePath。
- 只读检查源文件是否存在、是否为文件。
- 只读检查目标文件是否已存在。
- 只读检查目标父目录是否存在。

## 本轮禁止

- 不执行真实 copy。
- 不调用 `fs.copyFile`。
- 不创建目录。
- 不移动、删除、重命名、覆盖文件。
- 不写 OperationLog。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不向 Renderer 暴露 `absolutePath`。
- 不向 Renderer 暴露 `file://`。

## 下一步

MVP-95 前如果准备进入真实 `fs.copyFile`，必须暂停开发，让 Codex 做本机关键 gate。
