# MVP-92 当前路线：copy only 最小真实样本准备

版本：`0.130.0-mvp92`

## 目标

MVP-92 只准备真实 copy only 导入前的安全地基：一次性样本目录要求、Codex 本机验收任务书、copy-only IPC 合同、main-side copy contract。

## 本轮不做

- 不执行真实 copy。
- 不移动 / 删除 / 重命名文件。
- 不读取真实文件系统。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。

## 下一步

MVP-93 可进入 copy-only main-side stub，但执行仍应默认 disabled；真实 copy 前必须让 Codex 在本机验收一次性样本目录。
