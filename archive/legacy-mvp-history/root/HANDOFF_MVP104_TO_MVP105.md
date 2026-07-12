# HANDOFF MVP104 TO MVP105

版本：`0.143.0-mvp105`

本轮：`MVP105 small-sample move-only executor` / `mvp105-small-sample-move-only-executor-v1`。

## 完成内容

- 新增小样本真实 move-only executor。
- 新增 IPC：`yang-kura:import:move-only:execute`。
- 必须 `confirmedMoveOnly=true` 且 `confirmationText=CONFIRM_MOVE_IMPORT`。
- `overwriteAllowed=false`，目标存在跳过，不覆盖。
- 最大 `maxMoveItems=20`，超出阻断。
- 失败停止，剩余项标记 `remaining-after-failure-stop`。
- 写入 `mvp105-move-only-operation-log-v1` 到 `import-operation-log.jsonl`。

## 仍未做

- 不写 `library-index.json`。
- 不接 SQLite。
- 不接下载器。
- 不接元数据 Provider。
- 不接 mpv。
- 不自动清理空源目录。
- 不返回 `absolutePath`。
- 不返回 `file://`。
- Codex 非必要不安排。

## 下一步

`MVP106 move-only closeout`，然后 `MVP107 importer daily UI cleanup`。
