# CURRENT_ROADMAP_MVP95

版本：`0.133.0-mvp95`
基线：`0.132.0-mvp94`

## 主题

MVP-95：真实 copy-only executor。

## 本轮允许

- Electron main 侧执行受控 copy-only。
- 使用 `rootPathToken + relativePath` 和 `targetRootPathToken + targetRelativePath` 解析真实路径。
- 要求 `confirmedCopyOnly=true` 与 `confirmationText="COPY ONLY"`。
- 目标存在时 skip。
- 使用 `COPYFILE_EXCL` 防覆盖竞态。
- 只在目标 root token 内创建目标父目录。
- 返回 copied / skipped / failure 相对路径列表。

## 本轮禁止

- 不 move。
- 不 delete。
- 不 rename。
- 不 overwrite。
- 不写 `library-index.json`。
- 不写 OperationLog 文件。
- 不接 SQLite。
- 不接下载 Provider。
- 不接 mpv。
- Renderer 不接收 absolutePath。
- Renderer 不接收 `file://`。

## 下一步

MVP95 完成后必须交给 Codex 做真实最小样本验收。通过后再考虑 MVP96：OperationLog 落盘设计。
