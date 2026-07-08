# CURRENT ROADMAP — MVP-96

版本：`0.134.0-mvp96`

## 主题

MVP-96：copy-only OperationLog 最小落盘。

## 范围

- 在 MVP95 copy-only executor 完成后写入 `import-operation-log.jsonl`。
- 日志为 append-only JSONL。
- 每条记录只包含 token、相对路径、计数、状态、reasonCode、时间戳。
- Renderer 不接收日志绝对路径。
- 不写 `library-index.json`。
- 不接 SQLite。
- 不触发重新扫描。

## 后续

MVP97 才讨论 copy 后扫描 / 入库刷新；SQLite 继续后置。
